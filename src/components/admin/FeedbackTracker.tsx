import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Loader2, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Proposal {
  id: string;
  neighbourhood: string | null;
  rent: number | null;
  rooms: number | null;
  client_status: string | null;
  rejection_reasons: string[] | null;
  rejection_notes: string | null;
  photos: string[] | null;
  created_at: string;
}

interface FeedbackTrackerProps {
  caseId: string;
  onClearSearch: () => void;
}

export function FeedbackTracker({ caseId, onClearSearch }: FeedbackTrackerProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    fetchProposals();

    // Set up realtime subscription
    const channel = supabase
      .channel(`proposals-${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_proposals',
          filter: `case_id=eq.${caseId}`,
        },
        () => {
          fetchProposals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);

  const fetchProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('property_proposals')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProposals(data || []);
    } catch (err) {
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAndRestart = async () => {
    setClearing(true);
    try {
      // Delete all proposals for this case
      const { error } = await supabase
        .from('property_proposals')
        .delete()
        .eq('case_id', caseId);

      if (error) throw error;

      toast({
        title: "Search cleared",
        description: "All proposals have been removed. You can now add new apartments.",
      });

      setProposals([]);
      onClearSearch();
    } catch (err) {
      console.error('Error clearing proposals:', err);
      toast({
        title: "Error",
        description: "Failed to clear proposals. Please try again.",
        variant: "destructive",
      });
    } finally {
      setClearing(false);
    }
  };

  const allRejected = proposals.length > 0 && proposals.every(p => p.client_status === 'rejected');
  const hasLiked = proposals.some(p => p.client_status === 'liked');

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="py-6 text-center">
        <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No proposals sent yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Add apartments above to start getting feedback
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Client Feedback</h4>
          <p className="text-xs text-muted-foreground">
            {proposals.length} apartment{proposals.length !== 1 ? 's' : ''} sent
          </p>
        </div>
        {allRejected && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAndRestart}
            disabled={clearing}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            {clearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Clear & Restart
          </Button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {proposals.map((proposal, index) => (
          <motion.div
            key={proposal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className={`overflow-hidden ${
              proposal.client_status === 'liked' 
                ? 'border-green-500/50 bg-green-50/50' 
                : proposal.client_status === 'rejected'
                ? 'border-red-500/30 bg-red-50/30'
                : 'border-muted'
            }`}>
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    {proposal.photos && proposal.photos[0] ? (
                      <img
                        src={proposal.photos[0]}
                        alt="Property"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium truncate">
                        {proposal.neighbourhood || 'Unknown location'}
                      </span>
                      {proposal.client_status === 'liked' && (
                        <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      {proposal.client_status === 'rejected' && (
                        <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                          <X className="h-3 w-3 text-white" strokeWidth={3} />
                        </div>
                      )}
                      {proposal.client_status === 'pending' && (
                        <Badge variant="secondary" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {proposal.rooms} rooms · CHF {proposal.rent?.toLocaleString()}
                    </p>

                    {/* Rejection reasons */}
                    {proposal.client_status === 'rejected' && proposal.rejection_reasons && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {proposal.rejection_reasons.map((reason, i) => (
                          <Badge 
                            key={i} 
                            variant="outline" 
                            className="text-xs bg-red-50 text-red-700 border-red-200"
                          >
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Rejection notes */}
                    {proposal.client_status === 'rejected' && proposal.rejection_notes && (
                      <p className="text-xs text-muted-foreground mt-2 italic">
                        "{proposal.rejection_notes}"
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {hasLiked && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-green-50 border border-green-200 text-center"
        >
          <Check className="h-5 w-5 text-green-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-green-800">
            Client has selected a property!
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Proceed to schedule a viewing
          </p>
        </motion.div>
      )}
    </div>
  );
}
