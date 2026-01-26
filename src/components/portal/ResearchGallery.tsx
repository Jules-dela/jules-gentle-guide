import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApartmentCard } from './ApartmentCard';
import { FeedbackPopup } from './FeedbackPopup';
import { Heart, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ResearchGalleryProps {
  onComplete: () => void;
}

// Dummy apartment data with multiple images
const dummyApartments = [
  {
    id: '1',
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
    description: 'Charming apartment in the heart of Lausanne with stunning lake views. Recently renovated with modern finishes while maintaining its original character. Perfect for young professionals or students.',
    amenities: [
      'Lake view',
      'Modern kitchen',
      'Hardwood floors',
      'In-unit laundry',
      'Balcony',
      'Storage room',
    ],
  },
  {
    id: '2',
    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
    ],
    rent: 1650,
    rooms: 2,
    location: 'Lausanne',
    neighborhood: 'Flon',
    description: 'Contemporary studio in the vibrant Flon district. Walking distance to shops, restaurants, and nightlife. Ideal for students at EPFL or UNIL with easy metro access.',
    amenities: [
      'Open floor plan',
      'Built-in wardrobes',
      'Metro nearby',
      'Gym access',
      'Bike storage',
      'Concierge',
    ],
  },
  {
    id: '3',
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
    description: 'Spacious family apartment steps from Lake Geneva and the Olympic Museum. Bright living spaces with panoramic views. Quiet, residential neighborhood with excellent schools nearby.',
    amenities: [
      'Panoramic views',
      'Guest bedroom',
      'Parking included',
      'Large terrace',
      'Modern appliances',
      'Pet friendly',
    ],
  },
];

export function ResearchGallery({ onComplete }: ResearchGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const currentApartment = dummyApartments[currentIndex];

  const handleLike = useCallback(() => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onComplete();
    }, 2000);
  }, [onComplete]);

  const handleDislike = useCallback(() => {
    setShowFeedback(true);
  }, []);

  const handleFeedbackSubmit = useCallback((reasons: string[]) => {
    console.log('Feedback submitted:', reasons);
    setShowFeedback(false);
    
    // Show toast notification
    toast({
      title: "Searching for new matches...",
      description: "We're refining your search based on your feedback.",
    });
    
    // Move to next apartment or loop back
    if (currentIndex < dummyApartments.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentIndex]);

  const handleFeedbackClose = useCallback(() => {
    setShowFeedback(false);
  }, []);

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
      </motion.div>

      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {dummyApartments.map((_, index) => (
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
              We're scheduling a professional viewing for you...
            </motion.p>
            
            {/* Loading dots */}
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

      {/* Feedback Popup */}
      <FeedbackPopup
        isOpen={showFeedback}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}
