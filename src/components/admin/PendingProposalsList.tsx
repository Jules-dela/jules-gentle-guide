import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Loader2, Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PendingProposal {
  id: string;
  neighbourhood: string | null;
  address: string | null;
  rent: number | null;
  rooms: number | null;
  photos: string[] | null;
  photo_positions: Record<string, number> | Record<string, unknown> | null;
  created_at: string;
}

interface PendingProposalsListProps {
  caseId: string;
}

export function PendingProposalsList({ caseId }: PendingProposalsListProps) {
  const [proposals, setProposals] = useState<PendingProposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPending();

    const channel = supabase
      .channel(`pending-proposals-${caseId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_proposals', filter: `case_id=eq.${caseId}` },
        () => { fetchPending(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [caseId]);

  const fetchPending = async () => {
    try {
      const { data, error } = await supabase
        .from('property_proposals')
        .select('id, neighbourhood, address, rent, rooms, photos, photo_positions, created_at')
        .eq('case_id', caseId)
        .eq('client_status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      console.error('Error fetching pending proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const adjustPosition = useCallback(async (proposalId: string, imageIndex: number, direction: 'up' | 'down') => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;

    const positions = { ...(proposal.photo_positions || {}) };
    const current = positions[String(imageIndex)] ?? 50;
    const next = direction === 'up' ? Math.max(0, current - 10) : Math.min(100, current + 10);
    positions[String(imageIndex)] = next;

    // Optimistic update
    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, photo_positions: positions } : p));

    try {
      const { error } = await supabase
        .from('property_proposals')
        .update({ photo_positions: positions })
        .eq('id', proposalId);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating position:', err);
      toast({ title: 'Error', description: 'Failed to save image position.', variant: 'destructive' });
      fetchPending(); // revert
    }
  }, [proposals]);

  if (loading) {
    return (
      <div className="py-4 flex justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (proposals.length === 0) return null;

  return (
    <div className="space-y-3 mt-4">
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold text-foreground">
          Sent Proposals
        </h4>
        <Badge variant="secondary" className="text-xs">{proposals.length}</Badge>
      </div>

      <AnimatePresence mode="popLayout">
        {proposals.map((proposal, index) => {
          const pos = proposal.photo_positions?.[String(0)] ?? 50;
          return (
            <motion.div
              key={proposal.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden border-muted">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                      {proposal.photos && proposal.photos[0] ? (
                        <>
                          <img
                            src={proposal.photos[0]}
                            alt="Property"
                            className="w-full h-full object-cover"
                            style={{ objectPosition: `center ${pos}%` }}
                          />
                          <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex flex-col gap-px">
                            <button
                              type="button"
                              onClick={() => adjustPosition(proposal.id, 0, 'up')}
                              className="w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                            >
                              <ChevronUp className="h-2.5 w-2.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustPosition(proposal.id, 0, 'down')}
                              className="w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                            >
                              <ChevronDown className="h-2.5 w-2.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {proposal.neighbourhood || 'Unknown location'}
                        </span>
                        <Badge variant="outline" className="text-xs text-amber-600 border-amber-300 bg-amber-50">
                          Awaiting
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {proposal.rooms} rooms · CHF {proposal.rent?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
