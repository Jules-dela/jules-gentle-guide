import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Loader2, Home, MessageSquare, ChevronLeft, ChevronRight, MapPin, Wallet, Maximize2, Bed, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Proposal {
  id: string;
  neighbourhood: string | null;
  address: string | null;
  rent: number | null;
  charges: number | null;
  rooms: number | null;
  size_sqm: number | null;
  property_type: string | null;
  description: string | null;
  agency_info: string | null;
  tags: string[] | null;
  client_status: string | null;
  rejection_reasons: string[] | null;
  rejection_notes: string | null;
  photos: string[] | null;
  client_visit_questions: string | null;
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
  const [galleryProposal, setGalleryProposal] = useState<Proposal | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [questionsProposal, setQuestionsProposal] = useState<Proposal | null>(null);
  const [detailProposal, setDetailProposal] = useState<Proposal | null>(null);
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);

  useEffect(() => {
    fetchProposals();

    const channel = supabase
      .channel(`proposals-${caseId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_proposals', filter: `case_id=eq.${caseId}` },
        () => { fetchProposals(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
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
      const { error } = await supabase
        .from('property_proposals')
        .delete()
        .eq('case_id', caseId);

      if (error) throw error;

      toast({ title: "Search cleared", description: "All proposals have been removed." });
      setProposals([]);
      onClearSearch();
    } catch (err) {
      console.error('Error clearing proposals:', err);
      toast({ title: "Error", description: "Failed to clear proposals.", variant: "destructive" });
    } finally {
      setClearing(false);
    }
  };

  const allRejected = proposals.length > 0 && proposals.every(p => p.client_status === 'rejected');
  const hasLiked = proposals.some(p => p.client_status === 'liked');
  const likedCount = proposals.filter(p => p.client_status === 'liked').length;

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
        <p className="text-sm text-muted-foreground">No proposals sent yet</p>
        <p className="text-xs text-muted-foreground mt-1">Add apartments above to start getting feedback</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Client Feedback</h4>
          <p className="text-xs text-muted-foreground">
            {proposals.length} sent · {likedCount} liked
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
            {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
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
            <Card 
              className={`overflow-hidden cursor-pointer hover:shadow-md transition-all ${
                proposal.client_status === 'liked' 
                  ? 'border-green-500/50 bg-green-50/50' 
                  : proposal.client_status === 'rejected'
                  ? 'border-red-500/30 bg-red-50/30'
                  : 'border-muted'
              }`}
              onClick={() => { setDetailProposal(proposal); setDetailPhotoIndex(0); }}
            >
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  {/* Thumbnail */}
                  <button
                    className="w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                    onClick={() => {
                      if (proposal.photos && proposal.photos.length > 0) {
                        setGalleryProposal(proposal);
                        setGalleryIndex(0);
                      }
                    }}
                  >
                    {proposal.photos && proposal.photos[0] ? (
                      <img src={proposal.photos[0]} alt="Property" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </button>

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
                        <Badge variant="secondary" className="text-xs">Pending</Badge>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {proposal.rooms} rooms · CHF {proposal.rent?.toLocaleString()}
                    </p>

                    {/* Visit questions — clickable for liked proposals */}
                    {proposal.client_status === 'liked' && proposal.client_visit_questions && (
                      <button
                        onClick={() => setQuestionsProposal(proposal)}
                        className="mt-2 flex items-start gap-1.5 text-left group w-full"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span className="text-xs text-amber-700 line-clamp-1 group-hover:underline">
                          {proposal.client_visit_questions}
                        </span>
                      </button>
                    )}

                    {/* Rejection reasons */}
                    {proposal.client_status === 'rejected' && proposal.rejection_reasons && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {proposal.rejection_reasons.map((reason, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}

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
            Client has liked {likedCount} {likedCount === 1 ? 'property' : 'properties'}!
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Proceed to schedule viewings
          </p>
        </motion.div>
      )}

      {/* Questions Dialog */}
      <Dialog open={!!questionsProposal} onOpenChange={(open) => !open && setQuestionsProposal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-600" />
              Client Questions for Visit
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              {questionsProposal?.neighbourhood} · {questionsProposal?.rooms} rooms · CHF {questionsProposal?.rent?.toLocaleString()}
            </p>
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-sm text-amber-900 whitespace-pre-wrap leading-relaxed">
                {questionsProposal?.client_visit_questions}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Photo Gallery Dialog */}
      <Dialog open={!!galleryProposal} onOpenChange={(open) => !open && setGalleryProposal(null)}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-sm">
              {galleryProposal?.neighbourhood || 'Property'} · {galleryProposal?.rooms} rooms · CHF {galleryProposal?.rent?.toLocaleString()}
            </DialogTitle>
          </DialogHeader>
          {galleryProposal?.photos && galleryProposal.photos.length > 0 && (
            <div className="relative">
              <img
                src={galleryProposal.photos[galleryIndex]}
                alt={`Property photo ${galleryIndex + 1}`}
                className="w-full aspect-video object-cover"
              />
              {galleryProposal.photos.length > 1 && (
                <>
                  <button
                    onClick={() => setGalleryIndex(prev => prev > 0 ? prev - 1 : galleryProposal.photos!.length - 1)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setGalleryIndex(prev => prev < galleryProposal.photos!.length - 1 ? prev + 1 : 0)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {galleryProposal.photos.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setGalleryIndex(i)}
                        className={cn(
                          'w-2 h-2 rounded-full transition-all',
                          i === galleryIndex ? 'bg-white w-5' : 'bg-white/50'
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-foreground/60 backdrop-blur-sm">
                <span className="text-background text-xs font-medium">
                  {galleryIndex + 1}/{galleryProposal.photos.length}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
