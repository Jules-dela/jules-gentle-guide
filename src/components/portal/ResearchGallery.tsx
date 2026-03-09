import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApartmentCard } from './ApartmentCard';
import { FeedbackPopup } from './FeedbackPopup';
import { LandlordQuestionsModal } from './LandlordQuestionsModal';
import { Check, Search, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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

export function ResearchGallery({ proposals, onLike, onReject, readOnly = false, likedCount = 0 }: ResearchGalleryProps) {
  const apartments = useMemo(() => 
    proposals && proposals.length > 0 ? proposals : dummyApartments,
    [proposals]
  );
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());

  const availableApartments = useMemo(() => 
    apartments.filter(apt => !rejectedIds.has(apt.id)),
    [apartments, rejectedIds]
  );

  const currentApartment = availableApartments[currentIndex];

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
    
    setTimeout(() => {
      setShowSuccess(false);
      // Move to next available apartment instead of advancing stage
      if (availableApartments.length > 1) {
        // Remove the liked one from view and adjust index
        setRejectedIds(prev => new Set([...prev, currentApartment.id]));
        if (currentIndex >= availableApartments.length - 2) {
          setCurrentIndex(0);
        }
      }
    }, 2000);
  }, [onLike, currentApartment, availableApartments.length, currentIndex]);

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
    
    setRejectedIds(prev => new Set([...prev, currentApartment.id]));
    setShowFeedback(false);
    
    toast({
      title: "Searching for new matches...",
      description: "We're refining your search based on your feedback.",
    });
    
    if (currentIndex >= availableApartments.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentApartment, currentIndex, availableApartments.length, onReject]);

  const handleFeedbackClose = useCallback(() => {
    setShowFeedback(false);
  }, []);

  // No apartments available
  if (availableApartments.length === 0) {
    return (
      <div className="relative min-h-[600px] py-8 flex flex-col items-center justify-center">
        {likedCount > 0 && (
          <div className="mb-4 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
            <Heart className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">{likedCount} liked</span>
          </div>
        )}
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <Search className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
          {likedCount > 0 ? 'All Caught Up!' : 'No More Proposals'}
        </h2>
        <p className="text-muted-foreground text-center max-w-sm">
          {likedCount > 0 
            ? "You've reviewed all available apartments. We'll schedule viewings for your liked properties!"
            : "You've reviewed all available apartments. We're searching for more matches based on your feedback!"
          }
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
          Swipe through properties we've hand-picked based on your criteria
        </p>
        {/* Liked counter */}
        {likedCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-primary/10"
          >
            <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">{likedCount} liked</span>
          </motion.div>
        )}
      </motion.div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {availableApartments.map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === currentIndex
                ? 'w-10 bg-primary'
                : index < currentIndex
                ? 'w-2 bg-primary/50'
                : 'w-2 bg-muted-foreground/30'
            }`}
          />
        ))}
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
              Excellent Choice!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-center max-w-sm"
            >
              We've noted your interest. Keep browsing for more options!
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
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
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
