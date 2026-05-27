import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApartmentCard } from './ApartmentCard';
import { FeedbackPopup } from './FeedbackPopup';
import { LandlordQuestionsModal } from './LandlordQuestionsModal';
import { Check, Search, Heart, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export interface SelectedApartment {
  id: string;
  images: string[];
  rent: number;
  rooms: number;
  location: string;
  neighborhood: string;
  description: string;
  amenities: string[];
  status?: 'pending' | 'liked' | 'rejected';
}

interface ResearchGalleryProps {
  proposals?: SelectedApartment[];
  allProposals?: SelectedApartment[];
  onLike: (apartment: SelectedApartment, questions?: string) => void;
  onReject?: (proposalId: string, reasons: string[], notes?: string) => Promise<void>;
  onAllReviewed?: (likedCount: number) => void;
  readOnly?: boolean;
  likedCount?: number;
}

export function ResearchGallery({ proposals, allProposals, onLike, onReject, onAllReviewed, readOnly = false, likedCount = 0 }: ResearchGalleryProps) {
  // Use the full list as the source of truth so the client can browse all
  // proposals freely (including ones already liked or rejected) and change
  // their mind.
  const apartments = useMemo<SelectedApartment[]>(() => {
    if (allProposals && allProposals.length > 0) return allProposals;
    return proposals && proposals.length > 0 ? proposals : [];
  }, [allProposals, proposals]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showRefinementDialog, setShowRefinementDialog] = useState(false);

  const safeIndex = apartments.length > 0
    ? Math.min(currentIndex, apartments.length - 1)
    : 0;
  const currentApartment = apartments[safeIndex];
  const totalCount = apartments.length;
  const decidedCount = useMemo(
    () => apartments.filter(a => a.status && a.status !== 'pending').length,
    [apartments]
  );
  const derivedLikedCount = useMemo(
    () => apartments.filter(a => a.status === 'liked').length,
    [apartments]
  );
  const totalLiked = derivedLikedCount > 0 ? derivedLikedCount : likedCount;
  const allDecided = totalCount > 0 && decidedCount >= totalCount;

  const goPrev = useCallback(() => {
    setCurrentIndex(i => (i <= 0 ? Math.max(totalCount - 1, 0) : i - 1));
  }, [totalCount]);

  const goNext = useCallback(() => {
    setCurrentIndex(i => (i >= totalCount - 1 ? 0 : i + 1));
  }, [totalCount]);

  const handleLikeClick = useCallback(() => {
    if (!currentApartment) return;
    setShowQuestionsModal(true);
  }, [currentApartment]);

  const handleQuestionsSubmit = useCallback(async (questions: string) => {
    if (!currentApartment) return;
    setShowQuestionsModal(false);
    onLike(currentApartment, questions);
  }, [onLike, currentApartment]);

  const handleQuestionsClose = useCallback(() => {
    setShowQuestionsModal(false);
  }, []);

  const handleDislikeClick = useCallback(() => {
    if (!currentApartment) return;
    setShowFeedback(true);
  }, [currentApartment]);

  const handleFeedbackSubmit = useCallback(async (reasons: string[], notes?: string) => {
    if (!currentApartment) return;
    if (onReject) {
      await onReject(currentApartment.id, reasons, notes);
    }
    setShowFeedback(false);
  }, [currentApartment, onReject]);

  const handleFeedbackClose = useCallback(() => {
    setShowFeedback(false);
  }, []);

  const handleDoneReviewing = useCallback(() => {
    if (totalLiked > 0) {
      if (onAllReviewed) onAllReviewed(totalLiked);
    } else {
      setShowRefinementDialog(true);
    }
  }, [totalLiked, onAllReviewed]);

  const handleRefinementClose = useCallback(() => {
    setShowRefinementDialog(false);
  }, []);

  // No proposals at all
  if (apartments.length === 0) {
    return (
      <div className="relative min-h-[600px] py-8 flex flex-col items-center justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
          No Proposals Yet
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          We're searching for the perfect match! New proposals will appear here soon.
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[600px] py-8">
      {/* Section Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Curated For You
        </h2>
        <p className="text-muted-foreground">
          Browse all properties freely — like or dislike whenever you're ready
        </p>
        {/* Review progress */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 mt-3 px-4 py-2 rounded-full bg-muted"
        >
          <span className="text-sm font-medium text-muted-foreground">
            {safeIndex + 1} / {totalCount}
          </span>
          {totalLiked > 0 && (
            <>
              <span className="text-muted-foreground/40">·</span>
              <div className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-sm font-medium text-primary">{totalLiked} liked</span>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Progress indicator dots — click to jump */}
      <div className="flex justify-center gap-2 mb-8">
        {apartments.map((apt, index) => {
          const isLiked = apt.status === 'liked';
          const isRejected = apt.status === 'rejected';
          const isCurrent = index === safeIndex;
          return (
            <motion.button
              key={apt.id}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to property ${index + 1}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`h-2 rounded-full transition-all duration-500 ${
                isCurrent
                  ? 'w-10 bg-primary'
                  : isLiked
                  ? 'w-2 bg-primary'
                  : isRejected
                  ? 'w-2 bg-muted-foreground/40'
                  : 'w-2 bg-muted-foreground/20'
              }`}
            />
          );
        })}
      </div>

      {/* Apartment Card + carousel navigation */}
      <div className="relative">
        {totalCount > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous property"
              className="hidden md:flex absolute -left-2 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg items-center justify-center hover:scale-105 transition-transform border border-border"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next property"
              className="hidden md:flex absolute -right-2 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white shadow-lg items-center justify-center hover:scale-105 transition-transform border border-border"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}

        <AnimatePresence mode="wait">
          {currentApartment && (
            <ApartmentCard
              key={currentApartment.id}
              apartment={currentApartment}
              status={currentApartment.status ?? 'pending'}
              onLike={handleLikeClick}
              onDislike={handleDislikeClick}
              readOnly={readOnly}
            />
          )}
        </AnimatePresence>

        {/* Mobile prev/next under the card */}
        {totalCount > 1 && (
          <div className="flex md:hidden justify-between items-center mt-4 px-2">
            <Button variant="outline" size="sm" onClick={goPrev} className="rounded-full">
              <ChevronLeft className="w-4 h-4 mr-1" /> Previous
            </Button>
            <span className="text-xs text-muted-foreground">{safeIndex + 1} of {totalCount}</span>
            <Button variant="outline" size="sm" onClick={goNext} className="rounded-full">
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Done reviewing CTA */}
      {!readOnly && onAllReviewed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 flex flex-col items-center gap-2"
        >
          <Button
            onClick={handleDoneReviewing}
            disabled={decidedCount === 0}
            className="rounded-full h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            <Check className="w-4 h-4 mr-2" />
            {totalLiked > 0
              ? `I'm done — send my ${totalLiked} pick${totalLiked > 1 ? 's' : ''}`
              : allDecided
              ? "I'm done reviewing"
              : 'Like at least one to continue'}
          </Button>
          {!allDecided && decidedCount > 0 && (
            <p className="text-xs text-muted-foreground">
              {totalCount - decidedCount} property{totalCount - decidedCount > 1 ? 'ies' : ''} still undecided — you can decide later.
            </p>
          )}
        </motion.div>
      )}

      {/* Refinement Dialog — shown when client clicks Done with 0 liked */}
      <Dialog open={showRefinementDialog} onOpenChange={setShowRefinementDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <DialogTitle className="text-lg">We're On It!</DialogTitle>
            <DialogDescription className="text-sm mt-1.5">
              Thank you for the feedback. We'll fine-tune our search to find options that better match what you're looking for. New proposals will appear here soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-3">
            <Button onClick={handleRefinementClose} className="w-full rounded-full h-10 text-sm">
              Sounds Good
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <FeedbackPopup
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
      />

      <LandlordQuestionsModal
        isOpen={showQuestionsModal}
        onClose={handleQuestionsClose}
        onSubmit={handleQuestionsSubmit}
        apartmentName={currentApartment ? `${currentApartment.neighborhood} · ${currentApartment.rooms} rooms` : undefined}
      />
    </div>
  );
}
