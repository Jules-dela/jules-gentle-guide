import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ApartmentCard } from './ApartmentCard';
import { FeedbackPopup } from './FeedbackPopup';
import { Heart } from 'lucide-react';

interface ResearchGalleryProps {
  onComplete: () => void;
}

// Dummy apartment data
const dummyApartments = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
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
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
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
      {/* Progress indicator */}
      <div className="flex justify-center gap-2 mb-8">
        {dummyApartments.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'w-8 bg-primary'
                : index < currentIndex
                ? 'bg-primary/50'
                : 'bg-muted'
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
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.2 }}
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-6 shadow-xl shadow-primary/30"
            >
              <Heart className="w-12 h-12 text-primary-foreground fill-primary-foreground" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-2"
            >
              Great Choice!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground"
            >
              Scheduling your viewing...
            </motion.p>
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
