import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reasons: string[]) => void;
}

const feedbackTags = [
  { label: 'Price', icon: '💰' },
  { label: 'Location', icon: '📍' },
  { label: 'Layout', icon: '🏠' },
  { label: 'Too small', icon: '📐' },
  { label: 'No outdoor space', icon: '🌳' },
  { label: 'Other', icon: '💬' },
];

export function FeedbackPopup({ isOpen, onClose, onSubmit }: FeedbackPopupProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (selectedTags.length > 0) {
      setSubmitted(true);
      setTimeout(() => {
        onSubmit(selectedTags);
        setSubmitted(false);
        setSelectedTags([]);
      }, 1500);
    }
  };

  const handleClose = () => {
    setSelectedTags([]);
    setSubmitted(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl z-50"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    Help us refine your search
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Why was this flat not a fit?
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {feedbackTags.map((tag) => (
                      <button
                        key={tag.label}
                        onClick={() => toggleTag(tag.label)}
                        className={cn(
                          'px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2',
                          selectedTags.includes(tag.label)
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        <span>{tag.icon}</span>
                        {tag.label}
                      </button>
                    ))}
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={selectedTags.length === 0}
                    className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 300, delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <span className="text-3xl">✓</span>
                  </motion.div>
                  <p className="text-lg font-medium text-foreground">
                    Got it. We're adjusting our search.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
