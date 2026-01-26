import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  const [otherText, setOtherText] = useState('');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (selectedTags.length > 0) {
      setSubmitted(true);
      const reasons = selectedTags.includes('Other') && otherText.trim()
        ? [...selectedTags.filter(t => t !== 'Other'), `Other: ${otherText.trim()}`]
        : selectedTags;
      
      setTimeout(() => {
        onSubmit(reasons);
        setSubmitted(false);
        setSelectedTags([]);
        setOtherText('');
      }, 1500);
    }
  };

  const handleClose = () => {
    setSelectedTags([]);
    setSubmitted(false);
    setOtherText('');
    onClose();
  };

  const showOtherInput = selectedTags.includes('Other');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Popup Container - centered with flexbox */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ 
                type: 'spring', 
                damping: 30, 
                stiffness: 400,
                mass: 0.8
              }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl pointer-events-auto max-h-[85vh] overflow-y-auto"
            >
            {/* Close Button */}
            <motion.button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </motion.button>

            <AnimatePresence mode="wait">
              {!submitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-2">
                    Help us refine your search
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Why was this flat not a fit?
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {feedbackTags.map((tag, index) => (
                      <motion.button
                        key={tag.label}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05, duration: 0.2 }}
                        onClick={() => toggleTag(tag.label)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={cn(
                          'px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2',
                          selectedTags.includes(tag.label)
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        )}
                      >
                        <span>{tag.icon}</span>
                        {tag.label}
                      </motion.button>
                    ))}
                  </div>

                  {/* Other text input */}
                  <AnimatePresence>
                    {showOtherInput && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <Textarea
                          placeholder="Tell us more about what didn't work..."
                          value={otherText}
                          onChange={(e) => setOtherText(e.target.value)}
                          className="mb-4 resize-none rounded-2xl border-muted focus:border-primary focus:ring-primary/20"
                          rows={3}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedTags.length === 0}
                      className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    >
                      Submit
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="py-8 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                    className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center"
                  >
                    <motion.span 
                      className="text-3xl text-primary"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      ✓
                    </motion.span>
                  </motion.div>
                  <motion.p 
                    className="text-lg font-medium text-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Got it. We're adjusting our search.
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
