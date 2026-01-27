import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { ClientWithCase, ClientInteraction, AdminStats } from '@/types/admin';

export function useAdminDashboard() {
  const [clients, setClients] = useState<ClientWithCase[]>([]);
  const [interactions, setInteractions] = useState<ClientInteraction[]>([]);
  const [stats, setStats] = useState<AdminStats>({ completed: 0, inProgress: 0, issues: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      // Fetch profiles with their cases
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all cases
      const { data: cases, error: casesError } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      if (casesError) throw casesError;

      // Fetch proposals to get rejection info
      const { data: proposals, error: proposalsError } = await supabase
        .from('property_proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;

      // Map profiles to clients with case data
      const clientsWithCases: ClientWithCase[] = (profiles || []).map((profile) => {
        const profileCase = cases?.find((c) => c.client_id === profile.id);
        const criteria = profileCase?.initial_criteria as Record<string, unknown> | null;

        // Check for rejected proposals
        const clientProposals = proposals?.filter((p) => p.case_id === profileCase?.id) || [];
        const hasRejections = clientProposals.some((p) => p.client_status === 'rejected');
        const allRejected = clientProposals.length > 0 && clientProposals.every((p) => p.client_status === 'rejected');

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
          last_activity: lastActivity,
          last_activity_at: lastActivityAt,
          needs_attention: allRejected || hasRejections,
          created_at: profile.created_at,
        };
      });

      setClients(clientsWithCases);

      // Calculate stats
      const completed = clientsWithCases.filter((c) => c.case_status === 'closed').length;
      const issues = clientsWithCases.filter((c) => c.needs_attention).length;
      const inProgress = clientsWithCases.length - completed;

      setStats({ completed, inProgress, issues });

      // Build interactions from proposals
      const recentInteractions: ClientInteraction[] = [];
      
      for (const proposal of proposals?.slice(0, 20) || []) {
        if (proposal.client_status === 'pending') continue;
        
        const clientCase = cases?.find((c) => c.id === proposal.case_id);
        const client = profiles?.find((p) => p.id === clientCase?.client_id);
        
        if (!client) continue;

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

      setInteractions(recentInteractions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Set up realtime subscription for proposals
  useEffect(() => {
    const channel = supabase
      .channel('admin-proposals')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'property_proposals',
        },
        () => {
          // Refetch when proposals are updated
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchClients]);

  return {
    clients,
    interactions,
    stats,
    loading,
    error,
    refetch: fetchClients,
  };
}
