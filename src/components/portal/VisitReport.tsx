import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Banknote, X, ChevronLeft, ChevronRight, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewingFeedbackPopup } from './ViewingFeedbackPopup';
import { cn } from '@/lib/utils';
import type { SelectedApartment } from './ResearchGallery';

interface VisitReportProps {
  apartment: SelectedApartment;
  onComplete: () => void;
  onReject: () => void;
}

// Dummy visit photos
const visitPhotos = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80',
    label: 'Kitchen',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&auto=format&fit=crop&q=80',
    label: 'Living Room',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&auto=format&fit=crop&q=80',
    label: 'Bedroom',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&auto=format&fit=crop&q=80',
    label: 'Bathroom',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
    label: 'View from Window',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
    label: 'Entrance',
  },
];

// Agent notes
const agentNotes = {
  pros: [
    'Very quiet street, minimal traffic',
    'High ceilings with great natural light',
    'Recently renovated kitchen appliances',
    'Friendly building manager on-site',
  ],
  cons: [
    'Small fridge, may need an upgrade',
    'No in-unit laundry (shared in basement)',
  ],
};

export function VisitReport({ apartment, onComplete, onReject }: VisitReportProps) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const handleLike = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onComplete();
    }, 2500);
  };

  const handleDislike = () => {
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = (reasons: string[]) => {
    console.log('Visit feedback:', reasons);
    setShowFeedback(false);
    setShowRedirect(true);
    
    setTimeout(() => {
      setShowRedirect(false);
      onReject();
    }, 2000);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % visitPhotos.length);
  };

  const prevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + visitPhotos.length) % visitPhotos.length);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative min-h-[600px] py-8"
    >
      {/* Header */}
      <motion.div 
        className="text-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Your Professional Visit Report
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          We visited this property on your behalf. Here are the real-time details.
        </p>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!showSuccess && !showRedirect && (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            {/* Apartment Recap Card */}
            <motion.div
              className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <img
                src={apartment.images[0]}
                alt="Apartment"
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1">Property Visited</h4>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-primary" />
                    <span className="font-medium">{apartment.rent} CHF</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      {apartment.neighborhood}, {apartment.location}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Photo Gallery */}
            <motion.div
              className="bg-white rounded-[40px] p-6 shadow-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Visit Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {visitPhotos.map((photo, index) => (
                  <motion.button
                    key={photo.id}
                    onClick={() => openLightbox(index)}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <img
                      src={photo.url}
                      alt={photo.label}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute bottom-2 left-3 text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {photo.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Agent Notes Card */}
            <motion.div
              className="bg-white rounded-[40px] p-6 shadow-lg mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Notes from Jules</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Pros */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    What We Loved
                  </h4>
                  <ul className="space-y-2">
                    {agentNotes.pros.map((pro, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-primary mt-0.5">✓</span>
                        {pro}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Cons */}
                <div>
                  <h4 className="flex items-center gap-2 text-sm font-medium text-destructive mb-3">
                    <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </div>
                    Things to Consider
                  </h4>
                  <ul className="space-y-2">
                    {agentNotes.cons.map((con, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <span className="text-destructive mt-0.5">✗</span>
                        {con}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Button
                variant="outline"
                onClick={handleDislike}
                className="flex-1 h-14 rounded-full border-2 border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all text-base"
              >
                I Don't Like
              </Button>
              <Button
                onClick={handleLike}
                className="flex-1 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all text-base"
              >
                I Like – Let's Apply!
              </Button>
            </motion.div>
          </motion.div>
        )}

        {/* Success Animation */}
        {showSuccess && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 12, stiffness: 200 }}
              className="w-24 h-24 rounded-full bg-primary flex items-center justify-center mb-6 shadow-2xl shadow-primary/40"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl"
              >
                🎉
              </motion.span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center"
            >
              Great!
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-center max-w-sm"
            >
              Let's get your dossier ready.
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

        {/* Redirect Message */}
        {showRedirect && (
          <motion.div
            key="redirect"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl"
              >
                🔍
              </motion.span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg font-medium text-foreground text-center"
            >
              Redirecting back to search...
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-center"
            >
              Finding new listings for you
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); prevImage(); }}
              className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); nextImage(); }}
              className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            {/* Image */}
            <motion.img
              key={lightboxIndex}
              src={visitPhotos[lightboxIndex].url}
              alt={visitPhotos[lightboxIndex].label}
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image label */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-white text-sm font-medium">
                {visitPhotos[lightboxIndex].label} • {lightboxIndex + 1}/{visitPhotos.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Popup */}
      <ViewingFeedbackPopup
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </motion.div>
  );
}
