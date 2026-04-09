import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RefreshCw, Loader2, Home, MessageSquare, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, MapPin, Wallet, Maximize2, Bed, Building2, Trash2, Pencil, Save, ArrowLeft, ArrowRight } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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
  photo_positions: any;
  client_visit_questions: string | null;
  listing_status: string;
  created_at: string;
}

const LISTING_STATUSES = [
  { value: 'research', label: 'Research', color: 'bg-blue-100 text-blue-700' },
  { value: 'viewings', label: 'Viewings', color: 'bg-amber-100 text-amber-700' },
  { value: 'documents', label: 'Documents', color: 'bg-purple-100 text-purple-700' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700' },
] as const;

interface FeedbackTrackerProps {
  caseId: string;
  onClearSearch: () => void;
}

export function FeedbackTracker({ caseId, onClearSearch }: FeedbackTrackerProps) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [galleryProposal, setGalleryProposal] = useState<Proposal | null>(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [questionsProposal, setQuestionsProposal] = useState<Proposal | null>(null);
  const [detailProposal, setDetailProposal] = useState<Proposal | null>(null);
  const [detailPhotoIndex, setDetailPhotoIndex] = useState(0);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);
  const [savingPhotos, setSavingPhotos] = useState(false);

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

  const deleteProposal = async (proposal: Proposal) => {
    setDeletingId(proposal.id);
    try {
      // Delete photos from storage
      if (proposal.photos && proposal.photos.length > 0) {
        const filePaths = proposal.photos
          .map(url => {
            try {
              const u = new URL(url);
              const match = u.pathname.match(/\/object\/(?:public|sign)\/property-photos\/(.+)/);
              return match ? decodeURIComponent(match[1]) : null;
            } catch { return null; }
          })
          .filter(Boolean) as string[];
        if (filePaths.length > 0) {
          await supabase.storage.from('property-photos').remove(filePaths);
        }
      }

      const { error } = await supabase
        .from('property_proposals')
        .delete()
        .eq('id', proposal.id);

      if (error) throw error;

      toast({ title: "Listing removed", description: "The property listing has been deleted." });
      setProposals(prev => prev.filter(p => p.id !== proposal.id));
      if (detailProposal?.id === proposal.id) setDetailProposal(null);
    } catch (err) {
      console.error('Error deleting proposal:', err);
      toast({ title: "Error", description: "Failed to delete listing.", variant: "destructive" });
    } finally {
      setDeletingId(null);
    }
  };

  const saveDescription = async () => {
    if (!detailProposal) return;
    setSavingDescription(true);
    try {
      const { error } = await supabase
        .from('property_proposals')
        .update({ description: editDescription })
        .eq('id', detailProposal.id);
      if (error) throw error;
      setDetailProposal({ ...detailProposal, description: editDescription });
      setProposals(prev => prev.map(p => p.id === detailProposal.id ? { ...p, description: editDescription } : p));
      setEditingDescription(false);
      toast({ title: 'Description updated' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to update description.', variant: 'destructive' });
    } finally {
      setSavingDescription(false);
    }
  };

  const movePhoto = async (proposalId: string, fromIndex: number, direction: 'left' | 'right') => {
    const proposal = detailProposal?.id === proposalId ? detailProposal : proposals.find(p => p.id === proposalId);
    if (!proposal?.photos) return;
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= proposal.photos.length) return;
    const newPhotos = [...proposal.photos];
    [newPhotos[fromIndex], newPhotos[toIndex]] = [newPhotos[toIndex], newPhotos[fromIndex]];
    
    setSavingPhotos(true);
    try {
      const { error } = await supabase.from('property_proposals').update({ photos: newPhotos }).eq('id', proposalId);
      if (error) throw error;
      if (detailProposal?.id === proposalId) {
        setDetailProposal({ ...detailProposal, photos: newPhotos });
        // Adjust photo index if needed
        if (detailPhotoIndex === fromIndex) setDetailPhotoIndex(toIndex);
        else if (detailPhotoIndex === toIndex) setDetailPhotoIndex(fromIndex);
      }
      setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, photos: newPhotos } : p));
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to reorder photos.', variant: 'destructive' });
    } finally {
      setSavingPhotos(false);
    }
  };

  const adjustPosition = async (proposalId: string, imageIndex: number, direction: 'up' | 'down') => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) return;
    const positions: Record<string, number> = { ...((proposal.photo_positions as Record<string, number>) || {}) };
    const current = Number(positions[String(imageIndex)] ?? 50);
    const next = direction === 'up' ? Math.max(0, current - 10) : Math.min(100, current + 10);
    positions[String(imageIndex)] = next;

    setProposals(prev => prev.map(p => p.id === proposalId ? { ...p, photo_positions: positions } : p));
    if (detailProposal?.id === proposalId) setDetailProposal(prev => prev ? { ...prev, photo_positions: positions } : prev);
    if (galleryProposal?.id === proposalId) setGalleryProposal(prev => prev ? { ...prev, photo_positions: positions } : prev);

    try {
      const { error } = await supabase
        .from('property_proposals')
        .update({ photo_positions: positions as any })
        .eq('id', proposalId);
      if (error) throw error;
    } catch (err) {
      console.error('Error updating position:', err);
      toast({ title: 'Error', description: 'Failed to save image position.', variant: 'destructive' });
    }
  };

  const feedbackProposals = proposals.filter(p => p.client_status === 'liked' || p.client_status === 'rejected');
  const pendingProposals = proposals.filter(p => p.client_status === 'pending');
  const pendingCount = pendingProposals.length;
  const allRejected = feedbackProposals.length > 0 && feedbackProposals.every(p => p.client_status === 'rejected');
  const hasLiked = feedbackProposals.some(p => p.client_status === 'liked');
  const likedCount = feedbackProposals.filter(p => p.client_status === 'liked').length;

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
          <h4 className="text-sm font-semibold text-foreground">Sent Listings</h4>
          <p className="text-xs text-muted-foreground">
            {proposals.length} total · {feedbackProposals.length} responded · {likedCount} liked{pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
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
              className={`overflow-hidden cursor-pointer hover:shadow-md transition-all relative ${
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
                  {/* Delete button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-destructive/10 hover:text-destructive transition-colors"
                      >
                        {deletingId === proposal.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove this listing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the property listing and its photos. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteProposal(proposal)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  {/* Thumbnail */}
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                    <button
                      className="w-full h-full cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (proposal.photos && proposal.photos.length > 0) {
                          setGalleryProposal(proposal);
                          setGalleryIndex(0);
                        }
                      }}
                    >
                      {proposal.photos && proposal.photos[0] ? (
                        <img
                          src={proposal.photos[0]}
                          alt="Property"
                          className="w-full h-full object-cover"
                          style={{ objectPosition: `center ${Number((proposal.photo_positions as any)?.[String(0)] ?? 50)}%` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Home className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                      )}
                    </button>
                    {proposal.photos && proposal.photos[0] && (
                      <div className="absolute right-0.5 top-1/2 -translate-y-1/2 flex flex-col gap-px">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); adjustPosition(proposal.id, 0, 'up'); }}
                          className="w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                        >
                          <ChevronUp className="h-2.5 w-2.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); adjustPosition(proposal.id, 0, 'down'); }}
                          className="w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                        >
                          <ChevronDown className="h-2.5 w-2.5" />
                        </button>
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
                style={{ objectPosition: `center ${Number((galleryProposal.photo_positions as any)?.[String(galleryIndex)] ?? 50)}%` }}
              />
              {/* Reposition controls */}
              <div className="absolute right-3 bottom-12 flex flex-col gap-1">
                <button
                  onClick={() => adjustPosition(galleryProposal.id, galleryIndex, 'up')}
                  className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow-md"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => adjustPosition(galleryProposal.id, galleryIndex, 'down')}
                  className="w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow-md"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
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

      {/* Proposal Detail Dialog */}
      <Dialog open={!!detailProposal} onOpenChange={(open) => !open && setDetailProposal(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              {detailProposal?.neighbourhood || 'Property Details'}
            </DialogTitle>
          </DialogHeader>

          {detailProposal && (
            <div className="space-y-4">
              {/* Photo carousel */}
              {detailProposal.photos && detailProposal.photos.length > 0 && (
                <div className="relative rounded-lg overflow-hidden">
                  <img
                    src={detailProposal.photos[detailPhotoIndex]}
                    alt={`Photo ${detailPhotoIndex + 1}`}
                    className="w-full aspect-video object-cover"
                    style={{ objectPosition: `center ${Number((detailProposal.photo_positions as any)?.[String(detailPhotoIndex)] ?? 50)}%` }}
                  />
                  {/* Reposition controls */}
                  <div className="absolute right-2 bottom-10 flex flex-col gap-1">
                    <button
                      onClick={() => adjustPosition(detailProposal.id, detailPhotoIndex, 'up')}
                      className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => adjustPosition(detailProposal.id, detailPhotoIndex, 'down')}
                      className="w-7 h-7 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  {detailProposal.photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setDetailPhotoIndex(prev => prev > 0 ? prev - 1 : detailProposal.photos!.length - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDetailPhotoIndex(prev => prev < detailProposal.photos!.length - 1 ? prev + 1 : 0)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center hover:bg-background shadow"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-foreground/60 backdrop-blur-sm">
                        <span className="text-background text-xs font-medium">
                          {detailPhotoIndex + 1}/{detailProposal.photos.length}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Status badge */}
              <div className="flex items-center gap-2">
                {detailProposal.client_status === 'liked' && (
                  <Badge className="bg-green-500 text-white">Liked</Badge>
                )}
                {detailProposal.client_status === 'rejected' && (
                  <Badge variant="destructive">Rejected</Badge>
                )}
                {detailProposal.client_status === 'pending' && (
                  <Badge variant="secondary">Pending</Badge>
                )}
                {detailProposal.property_type && (
                  <Badge variant="outline" className="gap-1">
                    <Building2 className="w-3 h-3" />
                    {detailProposal.property_type}
                  </Badge>
                )}
              </div>

              {/* Key details */}
              <div className="grid grid-cols-2 gap-3">
                {detailProposal.address && (
                  <div className="col-span-2 flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>{detailProposal.address}</span>
                  </div>
                )}
                {detailProposal.rent != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold">CHF {detailProposal.rent.toLocaleString()}</span>
                    {detailProposal.charges != null && (
                      <span className="text-muted-foreground">+ {detailProposal.charges}</span>
                    )}
                  </div>
                )}
                {detailProposal.size_sqm != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Maximize2 className="w-4 h-4 text-muted-foreground" />
                    <span>{detailProposal.size_sqm} m²</span>
                  </div>
                )}
                {detailProposal.rooms != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Bed className="w-4 h-4 text-muted-foreground" />
                    <span>{detailProposal.rooms} room(s)</span>
                  </div>
                )}
              </div>

              {/* Tags */}
              {detailProposal.tags && detailProposal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {detailProposal.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}

              {/* Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Description</h4>
                  {!editingDescription ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 gap-1 text-xs"
                      onClick={() => { setEditDescription(detailProposal.description || ''); setEditingDescription(true); }}
                    >
                      <Pencil className="h-3 w-3" /> Edit
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditingDescription(false)}>Cancel</Button>
                      <Button size="sm" className="h-6 gap-1 text-xs" onClick={saveDescription} disabled={savingDescription}>
                        {savingDescription ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
                      </Button>
                    </div>
                  )}
                </div>
                {editingDescription ? (
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="text-sm"
                    placeholder="Add a description..."
                  />
                ) : (
                  <p className="text-sm text-foreground whitespace-pre-wrap">{detailProposal.description || <span className="italic text-muted-foreground">No description</span>}</p>
                )}
              </div>

              {/* Photo Reorder */}
              {detailProposal.photos && detailProposal.photos.length > 1 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">Reorder Photos</h4>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {detailProposal.photos.map((url, i) => (
                      <div key={i} className="relative shrink-0 w-16 h-16 rounded-lg overflow-hidden group border">
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" style={{ objectPosition: `center ${Number((detailProposal.photo_positions as any)?.[String(i)] ?? 50)}%` }} />
                        {i === 0 && <span className="absolute top-0.5 left-0.5 px-1 py-0.5 rounded text-[8px] font-bold bg-primary text-primary-foreground">Cover</span>}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100">
                          {i > 0 && (
                            <button onClick={() => movePhoto(detailProposal.id, i, 'left')} disabled={savingPhotos} className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                              <ArrowLeft className="h-3 w-3" />
                            </button>
                          )}
                          {i < detailProposal.photos!.length - 1 && (
                            <button onClick={() => movePhoto(detailProposal.id, i, 'right')} disabled={savingPhotos} className="w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agency info */}
              {detailProposal.agency_info && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Agency Info</h4>
                  <p className="text-sm text-foreground">{detailProposal.agency_info}</p>
                </div>
              )}

              {/* Rejection reasons */}
              {detailProposal.client_status === 'rejected' && detailProposal.rejection_reasons && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-1">Rejection Reasons</h4>
                  <div className="flex flex-wrap gap-1">
                    {detailProposal.rejection_reasons.map((r, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-destructive/30 text-destructive">{r}</Badge>
                    ))}
                  </div>
                  {detailProposal.rejection_notes && (
                    <p className="text-sm text-muted-foreground mt-2 italic">"{detailProposal.rejection_notes}"</p>
                  )}
                </div>
              )}

              {/* Visit questions */}
              {detailProposal.client_visit_questions && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <h4 className="text-xs font-semibold text-amber-800 uppercase mb-1 flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Client Questions
                  </h4>
                  <p className="text-sm text-amber-900">{detailProposal.client_visit_questions}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
