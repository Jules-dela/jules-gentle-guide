import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ClientWithCase, ClientInteraction, AdminStats } from '@/types/admin';

const DISMISSED_KEY = 'unikey_admin_dismissed_notifications';

function getDismissedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISSED_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveDismissedIds(ids: Set<string>) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...ids]));
}

export function useAdminDashboard() {
  const [clients, setClients] = useState<ClientWithCase[]>([]);
  const [interactions, setInteractions] = useState<ClientInteraction[]>([]);
  const [stats, setStats] = useState<AdminStats>({ completed: 0, inProgress: 0, issues: 0, dossiersReady: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      // Fetch all data in parallel
      const [profilesRes, casesRes, proposalsRes, docsRes, signaturesRes] = await Promise.all([
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('cases').select('*').order('created_at', { ascending: false }),
        supabase.from('property_proposals').select('*').order('created_at', { ascending: false }),
        supabase.from('case_documents').select('*'),
        supabase.from('contract_signatures').select('*'),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      if (casesRes.error) throw casesRes.error;
      if (proposalsRes.error) throw proposalsRes.error;

      if (docsRes.error) throw docsRes.error;
      const profiles = profilesRes.data;
      const cases = casesRes.data;
      const proposals = proposalsRes.data;
      const allDocuments = docsRes.data;
      const allSignatures = signaturesRes.data || [];

      // Map profiles to clients with case data
      const clientsWithCases: ClientWithCase[] = (profiles || []).map((profile) => {
        const profileCase = cases?.find((c) => c.client_id === profile.id);
        const criteria = profileCase?.initial_criteria as Record<string, unknown> | null;
        const contractData = profileCase?.contract_data as unknown as { signed?: boolean; timestamp?: string } | null;
        const signature = allSignatures.find((s: any) => s.case_id === profileCase?.id);

        // Check for rejected proposals
        const clientProposals = proposals?.filter((p) => p.case_id === profileCase?.id) || [];
        const hasRejections = clientProposals.some((p) => p.client_status === 'rejected');
        const allRejected = clientProposals.length > 0 && clientProposals.every((p) => p.client_status === 'rejected');

        // Get document stats for this case
        const caseDocuments = allDocuments?.filter((d) => d.case_id === profileCase?.id) || [];
        const docsUploaded = caseDocuments.filter((d) => d.file_url).length;
        const docsTotal = Math.max(caseDocuments.length, 5); // At least 5 mandatory docs
        const docsPendingReview = caseDocuments.some((d) => d.status === 'uploaded');
        
        // Check if all mandatory docs are uploaded (dossier submitted)
        const mandatoryTypes = ['id', 'income', 'poursuites', 'insurance', 'guarantor'];
        const uploadedTypes = caseDocuments.filter(d => d.file_url).map(d => d.document_type);
        const dossierSubmitted = mandatoryTypes.every(type => uploadedTypes.includes(type));

        // Determine last activity
        const lastProposal = clientProposals[0];
        let lastActivity = null;
        let lastActivityAt = null;

        if (lastProposal) {
          if (lastProposal.client_status === 'liked') {
            lastActivity = 'Liked a flat';
            lastActivityAt = lastProposal.created_at;
          } else if (lastProposal.client_status === 'rejected') {
            lastActivity = 'Rejected a flat';
            lastActivityAt = lastProposal.created_at;
          }
        }

        // Check for recent document uploads
        const recentDoc = caseDocuments
          .filter(d => d.status === 'uploaded')
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
        
        if (recentDoc && (!lastActivityAt || new Date(recentDoc.created_at) > new Date(lastActivityAt))) {
          lastActivity = 'Uploaded document';
          lastActivityAt = recentDoc.created_at;
        }

        return {
          id: profile.id,
          user_id: profile.user_id,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          client_type: profile.client_type,
          company_school: profile.company_school,
          case_id: profileCase?.id || null,
          case_status: profileCase?.status || 'request_received',
          budget: criteria?.budget as string | null,
          neighbourhood: criteria?.neighbourhood as string | null,
          rooms: criteria?.rooms as string | null,
          duration: criteria?.duration as string | null,
          property_type: criteria?.property_type as string | null,
          roommate_preference: (criteria?.roommatePreference || criteria?.roommate_preference) as string | null,
          last_activity: lastActivity,
          last_activity_at: lastActivityAt,
          needs_attention: allRejected || hasRejections,
          created_at: profile.created_at,
          docs_uploaded: docsUploaded,
          docs_total: docsTotal,
          docs_pending_review: docsPendingReview,
          dossier_submitted: dossierSubmitted,
          contract_data: signature ? {
            signature_image: signature.signature_image,
            ip_address: signature.ip_address,
            user_agent: signature.user_agent,
            signed_at: signature.signed_at,
            device_info: signature.device_info as any,
            client_full_name: (signature as any).client_full_name || null,
            client_date_of_birth: (signature as any).client_date_of_birth || null,
            client_nationality: (signature as any).client_nationality || null,
            client_initials: (signature as any).client_initials || null,
          } : null,
          is_contract_signed: !!contractData?.signed,
        };
      });

      setClients(clientsWithCases);

      // Calculate stats
      const completed = clientsWithCases.filter((c) => c.case_status === 'closed').length;
      const issues = clientsWithCases.filter((c) => c.needs_attention).length;
      const inProgress = clientsWithCases.length - completed;
      const dossiersReady = clientsWithCases.filter((c) => c.dossier_submitted && c.case_status !== 'closed').length;

      setStats({ completed, inProgress, issues, dossiersReady });

      // Build interactions from proposals and documents
      const recentInteractions: ClientInteraction[] = [];
      
      for (const proposal of proposals?.slice(0, 15) || []) {
        const clientCase = cases?.find((c) => c.id === proposal.case_id);
        const client = profiles?.find((p) => p.id === clientCase?.client_id);
        
        if (!client) continue;

        // Add visit instructions interaction if client provided questions
        const visitQuestions = proposal.client_visit_questions as string | null;
        if (visitQuestions && proposal.client_status === 'liked') {
          recentInteractions.push({
            id: `visit-instructions-${proposal.id}`,
            client_id: client.id,
            client_name: client.name,
            type: 'visit_instructions',
            description: `New visit instructions received`,
            reason: visitQuestions.length > 80 ? visitQuestions.slice(0, 80) + '...' : visitQuestions,
            timestamp: proposal.created_at,
          });
        }

        if (proposal.client_status === 'pending') continue;
        
        const isLiked = proposal.client_status === 'liked';
        const rejectionReasons = proposal.rejection_reasons as string[] | null;

        recentInteractions.push({
          id: proposal.id,
          client_id: client.id,
          client_name: client.name,
          type: isLiked ? 'liked' : 'rejected',
          description: isLiked 
            ? `Liked a flat in ${proposal.neighbourhood || 'Lausanne'}` 
            : `Rejected a flat in ${proposal.neighbourhood || 'Lausanne'}`,
          reason: rejectionReasons?.join(', '),
          timestamp: proposal.created_at,
        });
      }

      // Add document upload interactions
      const uploadedDocs = (allDocuments || [])
        .filter(d => d.status === 'uploaded')
        .slice(0, 10);

      for (const doc of uploadedDocs) {
        const docCase = cases?.find((c) => c.id === doc.case_id);
        const client = profiles?.find((p) => p.id === docCase?.client_id);
        
        if (!client) continue;

        recentInteractions.push({
          id: doc.id,
          client_id: client.id,
          client_name: client.name,
          type: 'document_uploaded',
          description: `Uploaded ${doc.label}`,
          timestamp: doc.created_at,
        });
      }

      // Check for dossier submissions (all mandatory docs uploaded)
      for (const clientData of clientsWithCases) {
        if (clientData.dossier_submitted && clientData.case_status !== 'closed') {
          recentInteractions.push({
            id: `dossier-${clientData.id}`,
            client_id: clientData.id,
            client_name: clientData.name,
            type: 'dossier_submitted',
            description: 'Dossier ready for landlord submission',
            timestamp: clientData.created_at,
          });
        }
      }

      // Sort by timestamp and take most recent
      recentInteractions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      const dismissed = getDismissedIds();
      const filtered = recentInteractions
        .filter(i => !dismissed.has(i.id))
        .slice(0, 20);
      setInteractions(filtered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Set up realtime subscription for proposals and documents
  useEffect(() => {
    const channel = supabase
      .channel('admin-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_proposals',
        },
        () => {
          fetchClients();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_documents',
        },
        () => {
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClients]);

  const clearInteractions = useCallback(() => {
    const dismissed = getDismissedIds();
    interactions.forEach(i => dismissed.add(i.id));
    saveDismissedIds(dismissed);
    setInteractions([]);
  }, [interactions]);

  return {
    clients,
    interactions,
    stats,
    loading,
    error,
    refetch: fetchClients,
    clearInteractions,
  };
}
