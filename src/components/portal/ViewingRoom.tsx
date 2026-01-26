import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, MapPin, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ViewingFeedbackPopup } from './ViewingFeedbackPopup';
import { cn } from '@/lib/utils';

interface ViewingRoomProps {
  onComplete: () => void;
  onReject: () => void;
}

// Dummy apartment data for the viewing
const viewingApartment = {
  id: '1',
  image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&auto=format&fit=crop&q=80',
  rent: 1850,
  rooms: 2.5,
  location: 'Lausanne',
  neighborhood: 'Sous-Gare',
};

// Sample video URL (placeholder)
const SAMPLE_VIDEO_URL = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

export function ViewingRoom({ onComplete, onReject }: ViewingRoomProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showRedirect, setShowRedirect] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

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
    console.log('Viewing feedback:', reasons);
    setShowFeedback(false);
    setShowRedirect(true);
    
    setTimeout(() => {
      setShowRedirect(false);
      onReject();
    }, 2000);
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
          Your Virtual Tour
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Walk through your future home from the comfort of your couch.
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
            className="max-w-3xl mx-auto"
          >
            {/* Video Player */}
            <motion.div
              className="relative rounded-[40px] overflow-hidden bg-black shadow-2xl mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="aspect-video relative group">
                <video
                  ref={videoRef}
                  src={SAMPLE_VIDEO_URL}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  onClick={togglePlay}
                />

                {/* Play overlay when paused */}
                <AnimatePresence>
                  {!isPlaying && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                      onClick={togglePlay}
                    >
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl"
                      >
                        <Play className="w-8 h-8 md:w-10 md:h-10 text-primary ml-1" fill="currentColor" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Custom Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-5 h-5 text-white" />
                        ) : (
                          <Play className="w-5 h-5 text-white ml-0.5" />
                        )}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5 text-white" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-white" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={toggleFullscreen}
                      className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                    >
                      <Maximize className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Apartment Recap Card */}
            <motion.div
              className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-4 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <img
                src={viewingApartment.image}
                alt="Apartment"
                className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground mb-1">Currently Viewing</h4>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-primary" />
                    <span className="font-medium">{viewingApartment.rent} CHF</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      {viewingApartment.neighborhood}, {viewingApartment.location}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
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
                I Like
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
              Great choice!
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
              Redirecting to Research...
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

      {/* Feedback Popup */}
      <ViewingFeedbackPopup
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </motion.div>
  );
}
