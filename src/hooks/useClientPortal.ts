import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { 
  Profile, 
  Case, 
  PropertyProposal, 
  CaseDocument, 
  KeyHandover,
  CaseStatusHistory,
  InitialCriteria
} from '@/types/portal';

interface ContractSigningInput {
  signature_image: string;
  ip_address: string;
  timestamp: string;
  user_agent: string;
  device_info: {
    platform: string;
    language: string;
    screen_width: number;
    screen_height: number;
  };
  client_full_name?: string;
  client_date_of_birth?: string;
  client_nationality?: string;
  client_initials?: string;
}

interface UseClientPortalReturn {
  profile: Profile | null;
  activeCase: Case | null;
  proposals: PropertyProposal[];
  documents: CaseDocument[];
  keyHandover: KeyHandover | null;
  statusHistory: CaseStatusHistory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProposalFeedback: (
    proposalId: string, 
    status: 'liked' | 'rejected',
    rejectionReasons?: string[],
    rejectionNotes?: string,
    visitQuestions?: string
  ) => Promise<{ error: Error | null }>;
  uploadDocument: (documentId: string, file: File) => Promise<{ error: Error | null }>;
  confirmKeyHandover: () => Promise<{ error: Error | null }>;
  signContract: (contractData: ContractSigningInput) => Promise<{ error: Error | null }>;
}

export function useClientPortal(): UseClientPortalReturn {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeCase, setActiveCase] = useState<Case | null>(null);
  const [proposals, setProposals] = useState<PropertyProposal[]>([]);
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [keyHandover, setKeyHandover] = useState<KeyHandover | null>(null);
  const [statusHistory, setStatusHistory] = useState<CaseStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // No profile found - user needs to complete setup
          setProfile(null);
          setLoading(false);
          return;
        }
        throw profileError;
      }

      // Cast the profile data to include proper types
      const typedProfile: Profile = {
        ...profileData,
        client_type: profileData.client_type as Profile['client_type'],
      };
      setProfile(typedProfile);

      // Fetch active case
      const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select('*')
        .eq('client_id', profileData.id)
        .neq('status', 'closed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (caseError) throw caseError;

      if (caseData) {
        const typedCase: Case = {
          ...caseData,
          status: caseData.status as Case['status'],
          initial_criteria: caseData.initial_criteria as unknown as InitialCriteria | null,
          contract_data: caseData.contract_data as unknown as Case['contract_data'],
        };
        setActiveCase(typedCase);

        // Fetch related data in parallel
        const [proposalsRes, documentsRes, keyHandoverRes, historyRes] = await Promise.all([
          supabase
            .from('property_proposals')
            .select('*')
            .eq('case_id', caseData.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('case_documents')
            .select('*')
            .eq('case_id', caseData.id)
            .order('created_at', { ascending: true }),
          supabase
            .from('key_handover')
            .select('*')
            .eq('case_id', caseData.id)
            .maybeSingle(),
          supabase
            .from('case_status_history')
            .select('*')
            .eq('case_id', caseData.id)
            .order('created_at', { ascending: true }),
        ]);

        if (proposalsRes.error) throw proposalsRes.error;
        if (documentsRes.error) throw documentsRes.error;
        if (keyHandoverRes.error) throw keyHandoverRes.error;
        if (historyRes.error) throw historyRes.error;

        // Cast proposals data
        const typedProposals: PropertyProposal[] = (proposalsRes.data || []).map(p => ({
          ...p,
          client_status: p.client_status as PropertyProposal['client_status'],
          tags: p.tags || [],
          photos: p.photos || [],
          photo_positions: (p.photo_positions as Record<string, number>) || null,
          rejection_reasons: p.rejection_reasons || [],
        }));
        setProposals(typedProposals);

        // Cast documents data
        const typedDocuments: CaseDocument[] = (documentsRes.data || []).map(d => ({
          ...d,
          status: d.status as CaseDocument['status'],
        }));
        setDocuments(typedDocuments);

        setKeyHandover(keyHandoverRes.data);

        // Cast history data
        const typedHistory: CaseStatusHistory[] = (historyRes.data || []).map(h => ({
          ...h,
          status: h.status as CaseStatusHistory['status'],
        }));
        setStatusHistory(typedHistory);
      } else {
        setActiveCase(null);
        setProposals([]);
        setDocuments([]);
        setKeyHandover(null);
        setStatusHistory([]);
      }
    } catch (err) {
      console.error('Error fetching portal data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load portal data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up realtime subscriptions
  useEffect(() => {
    if (!activeCase) return;

    const channel = supabase
      .channel('portal-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cases',
          filter: `id=eq.${activeCase.id}`,
        },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_proposals',
          filter: `case_id=eq.${activeCase.id}`,
        },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_documents',
          filter: `case_id=eq.${activeCase.id}`,
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCase, fetchData]);

  const updateProposalFeedback = async (
    proposalId: string,
    status: 'liked' | 'rejected',
    rejectionReasons?: string[],
    rejectionNotes?: string,
    visitQuestions?: string
  ) => {
    try {
      const { error } = await supabase.rpc('client_update_proposal_feedback', {
        p_proposal_id: proposalId,
        p_client_status: status,
        p_rejection_reasons: rejectionReasons || [],
        p_rejection_notes: rejectionNotes || null,
        p_client_visit_questions: (status === 'liked' && visitQuestions !== undefined) ? (visitQuestions || null) : null,
      });

      if (error) throw error;
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to update feedback') };
    }
  };

  const uploadDocument = async (documentId: string, file: File) => {
    if (!activeCase) {
      return { error: new Error('No active case found') };
    }

    try {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${activeCase.id}/${documentId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Generate signed URL for private bucket (valid for 1 year)
      const { data: signedData, error: signedError } = await supabase.storage
        .from('client-documents')
        .createSignedUrl(filePath, 60 * 60 * 24 * 365); // 1 year expiry

      if (signedError) throw signedError;

      // Update document record via secure RPC (only allows file_url + status='uploaded')
      const { error: updateError } = await supabase.rpc('client_update_document_file', {
        p_document_id: documentId,
        p_file_url: signedData.signedUrl,
      });

      if (updateError) throw updateError;
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to upload document') };
    }
  };

  const confirmKeyHandover = async () => {
    if (!keyHandover) {
      return { error: new Error('No key handover found') };
    }

    try {
      const { error } = await supabase
        .from('key_handover')
        .update({ confirmed_by_client: true })
        .eq('id', keyHandover.id);

      if (error) throw error;
      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to confirm handover') };
    }
  };

  const signContract = async (contractData: ContractSigningInput) => {
    if (!activeCase) {
      return { error: new Error('No active case found') };
    }

    try {
      const { error } = await supabase.rpc('sign_contract', {
        p_case_id: activeCase.id,
        p_contract_data: JSON.parse(JSON.stringify(contractData)),
      });

      if (error) throw error;
      
      // Send contract receipt email
      try {
        await supabase.functions.invoke('send-contract-receipt', {
          body: {
            clientName: profile?.name,
            clientEmail: profile?.email,
            signedAt: contractData.timestamp,
          },
        });
      } catch (emailErr) {
        console.error('Error sending contract receipt email:', emailErr);
        // Don't fail the sign operation if email fails
      }

      await fetchData();
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to sign contract') };
    }
  };

  return {
    profile,
    activeCase,
    proposals,
    documents,
    keyHandover,
    statusHistory,
    loading,
    error,
    refetch: fetchData,
    updateProposalFeedback,
    uploadDocument,
    confirmKeyHandover,
    signContract,
  };
}
