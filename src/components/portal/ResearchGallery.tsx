import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApartmentCard } from './ApartmentCard';
import { FeedbackPopup } from './FeedbackPopup';
import { LandlordQuestionsModal } from './LandlordQuestionsModal';
import { Check, Search, Heart, Sparkles } from 'lucide-react';
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
}

interface ResearchGalleryProps {
  proposals?: SelectedApartment[];
  onLike: (apartment: SelectedApartment, questions?: string) => void;
  onReject?: (proposalId: string, reasons: string[], notes?: string) => Promise<void>;
  onAllReviewed?: (likedCount: number) => void;
  readOnly?: boolean;
  likedCount?: number;
}

// Fallback dummy apartments for demo/development
const dummyApartments: SelectedApartment[] = [
  {
    id: 'demo-1',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80',
    ],
    rent: 1850,
    rooms: 2.5,
    location: 'Lausanne',
    neighborhood: 'Sous-Gare',
    description: 'Charming apartment in the heart of Lausanne with stunning lake views.',
    amenities: ['Lake view', 'Modern kitchen', 'Hardwood floors', 'In-unit laundry', 'Balcony', 'Storage room'],
  },
  {
    id: 'demo-2',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
    ],
    rent: 1650,
    rooms: 2,
    location: 'Lausanne',
    neighborhood: 'Flon',
    description: 'Contemporary studio in the vibrant Flon district.',
    amenities: ['Open floor plan', 'Built-in wardrobes', 'Metro nearby', 'Gym access', 'Bike storage', 'Concierge'],
  },
  {
    id: 'demo-3',
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
    ],
    rent: 2100,
    rooms: 3.5,
    location: 'Lausanne',
    neighborhood: 'Ouchy',
    description: 'Spacious family apartment steps from Lake Geneva.',
    amenities: ['Panoramic views', 'Guest bedroom', 'Parking included', 'Large terrace', 'Modern appliances', 'Pet friendly'],
  },
];

export function ResearchGallery({ proposals, onLike, onReject, onAllReviewed, readOnly = false, likedCount = 0 }: ResearchGalleryProps) {
  const apartments = useMemo(() => 
    proposals && proposals.length > 0 ? proposals : dummyApartments,
    [proposals]
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [localLikedIds, setLocalLikedIds] = useState<Set<string>>(new Set());
  const [showRefinementDialog, setShowRefinementDialog] = useState(false);

  // Apartments that haven't been reviewed yet
  const unreviewedApartments = useMemo(() => 
    apartments.filter(apt => !reviewedIds.has(apt.id)),
    [apartments, reviewedIds]
  );

  const currentApartment = unreviewedApartments[currentIndex];
  const totalCount = apartments.length;
  const reviewedCount = reviewedIds.size;
  const totalLiked = likedCount + localLikedIds.size;
  const allReviewed = reviewedCount >= totalCount && totalCount > 0;

  // Check if all reviewed and trigger appropriate action
  const handleAllReviewedCheck = useCallback((newLikedCount: number) => {
    if (newLikedCount > 0) {
      // At least one liked → advance to visits
      if (onAllReviewed) {
        setTimeout(() => onAllReviewed(newLikedCount), 1500);
      }
    } else {
      // None liked → show refinement popup
      setShowRefinementDialog(true);
    }
  }, [onAllReviewed]);

  const handleLike = useCallback(() => {
    if (!currentApartment) return;
    setShowQuestionsModal(true);
  }, [currentApartment]);

  const handleQuestionsSubmit = useCallback(async (questions: string) => {
    if (!currentApartment) return;
    setShowQuestionsModal(false);
    setShowSuccess(true);
    
    // Record the like via parent (DB update)
    onLike(currentApartment, questions);

    const newLocalLiked = new Set([...localLikedIds, currentApartment.id]);
    setLocalLikedIds(newLocalLiked);
    const newReviewed = new Set([...reviewedIds, currentApartment.id]);
    setReviewedIds(newReviewed);
    
    setTimeout(() => {
      setShowSuccess(false);
      // Adjust index if needed
      const remaining = apartments.filter(apt => !newReviewed.has(apt.id));
      if (remaining.length === 0) {
        // All reviewed
        handleAllReviewedCheck(likedCount + newLocalLiked.size);
      } else if (currentIndex >= remaining.length) {
        setCurrentIndex(0);
      }
    }, 2000);
  }, [onLike, currentApartment, apartments, reviewedIds, localLikedIds, currentIndex, likedCount, handleAllReviewedCheck]);

  const handleQuestionsClose = useCallback(() => {
    setShowQuestionsModal(false);
  }, []);

  const handleDislike = useCallback(() => {
    setShowFeedback(true);
  }, []);

  const handleFeedbackSubmit = useCallback(async (reasons: string[], notes?: string) => {
    if (!currentApartment) return;
    
    if (onReject) {
      await onReject(currentApartment.id, reasons, notes);
    }
    
    const newReviewed = new Set([...reviewedIds, currentApartment.id]);
    setReviewedIds(newReviewed);
    setShowFeedback(false);
    
    const remaining = apartments.filter(apt => !newReviewed.has(apt.id));
    if (remaining.length === 0) {
      // All reviewed
      handleAllReviewedCheck(likedCount + localLikedIds.size);
    } else if (currentIndex >= remaining.length) {
      setCurrentIndex(0);
    }
  }, [currentApartment, currentIndex, apartments, reviewedIds, localLikedIds, likedCount, onReject, handleAllReviewedCheck]);

  const handleFeedbackClose = useCallback(() => {
    setShowFeedback(false);
  }, []);

  const handleRefinementClose = useCallback(() => {
    setShowRefinementDialog(false);
  }, []);

  // All reviewed end state
  if (allReviewed && !showSuccess) {
    return (
      <>
        <div className="relative min-h-[600px] py-8 flex flex-col items-center justify-center">
          {totalLiked > 0 ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-6 shadow-2xl shadow-primary/40"
              >
                <Check className="w-12 h-12 text-primary-foreground" strokeWidth={3} />
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mb-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10"
              >
                <Heart className="w-4 h-4 text-primary fill-primary" />
                <span className="text-sm font-medium text-primary">{totalLiked} liked</span>
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-foreground mb-2 text-center"
              >
                All Properties Reviewed!
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-center max-w-sm"
              >
                We'll now arrange viewings for your favourite properties. Stay tuned!
              </motion.p>
              <motion.div 
                className="flex gap-1.5 mt-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
              >
                <Search className="w-10 h-10 text-primary" />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-bold text-foreground mb-2 text-center"
              >
                All Properties Reviewed
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground text-center max-w-sm"
              >
                We're refining our search to better match your preferences. New proposals will appear here soon.
              </motion.p>
            </>
          )}
        </div>

        {/* Refinement Dialog — shown when 0 liked */}
        <Dialog open={showRefinementDialog} onOpenChange={setShowRefinementDialog}>
          <DialogContent className="sm:max-w-sm data-[state=open]:animate-[fade-in_0.4s_ease-out,scale-in_0.3s_ease-out] data-[state=closed]:animate-[fade-out_0.3s_ease-out,scale-out_0.2s_ease-out]">
            <DialogHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-lg">We're On It!</DialogTitle>
              <DialogDescription className="text-sm mt-1.5">
                Thank you for reviewing all the properties. Based on your feedback, we'll fine-tune our search to find options that better match what you're looking for. New proposals will be available soon.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-3">
              <Button onClick={handleRefinementClose} className="w-full rounded-full h-10 text-sm">
                Sounds Good
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

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
          Review each property we've hand-picked based on your criteria
        </p>
        {/* Review progress */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 mt-3 px-4 py-2 rounded-full bg-muted"
        >
          <span className="text-sm font-medium text-muted-foreground">
            {reviewedCount} / {totalCount} reviewed
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

      {/* Progress indicator dots */}
      <div className="flex justify-center gap-2 mb-8">
        {apartments.map((apt, index) => {
          const isReviewed = reviewedIds.has(apt.id);
          const isLiked = localLikedIds.has(apt.id);
          const isCurrent = unreviewedApartments[currentIndex]?.id === apt.id;
          return (
            <motion.div
              key={apt.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              className={`h-2 rounded-full transition-all duration-500 ${
                isCurrent
                  ? 'w-10 bg-primary'
                  : isLiked
                  ? 'w-2 bg-primary'
                  : isReviewed
                  ? 'w-2 bg-muted-foreground/40'
                  : 'w-2 bg-muted-foreground/20'
              }`}
            />
          );
        })}
      </div>

      {/* Apartment Cards */}
      <AnimatePresence mode="wait">
        {currentApartment && !showSuccess && (
          <ApartmentCard
            key={currentApartment.id}
            apartment={currentApartment}
            onLike={handleLike}
            onDislike={handleDislike}
            readOnly={readOnly}
          />
        )}
      </AnimatePresence>

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-6 shadow-2xl shadow-primary/40"
            >
              <Check className="w-12 h-12 text-primary-foreground" strokeWidth={3} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-2"
            >
              Noted!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-center max-w-sm"
            >
              {unreviewedApartments.length > 1 
                ? 'Keep reviewing the remaining properties.'
                : "That's the last one! Let's see your results."}
            </motion.p>
            
            <motion.div 
              className="flex gap-1.5 mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
