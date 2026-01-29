import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface LandlordQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (questions: string) => Promise<void>;
  apartmentName?: string;
}

const MAX_CHARS = 500;

export function LandlordQuestionsModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  apartmentName 
}: LandlordQuestionsModalProps) {
  const [questions, setQuestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const charsRemaining = MAX_CHARS - questions.length;
  const isOverLimit = charsRemaining < 0;

  const handleSubmit = async () => {
    if (isOverLimit) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(questions.trim());
      setQuestions('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit('');
      setQuestions('');
    } finally {
      setIsSubmitting(false);
    }
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
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          {/* Modal container for centering */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-background rounded-[32px] shadow-2xl pointer-events-auto overflow-hidden"
            >
              {/* Header */}
              <div className="relative px-6 pt-6 pb-4">
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/80 hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Anything we should check for you?
                    </h2>
                    {apartmentName && (
                      <p className="text-xs text-muted-foreground">
                        For: {apartmentName}
                      </p>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">
                  Jules is heading to the visit. Are there specific questions you want us to ask the landlord 
                  or details you want us to inspect closely?
                </p>
              </div>

              {/* Input Area */}
              <div className="px-6 pb-4">
                <div className="relative">
                  <Textarea
                    value={questions}
                    onChange={(e) => setQuestions(e.target.value)}
                    placeholder="e.g., 'Check if the oven is induction' or 'Is the street noisy at night?'"
                    className={`min-h-[120px] resize-none rounded-xl border-muted bg-muted/30 focus:bg-background transition-colors ${
                      isOverLimit ? 'border-destructive focus-visible:ring-destructive' : ''
                    }`}
                    disabled={isSubmitting}
                  />
                  <div className={`absolute bottom-2 right-3 text-xs ${
                    isOverLimit 
                      ? 'text-destructive font-medium' 
                      : charsRemaining < 50 
                      ? 'text-amber-500' 
                      : 'text-muted-foreground'
                  }`}>
                    {charsRemaining}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl h-11"
                >
                  Skip for now
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || isOverLimit}
                  className="flex-1 rounded-xl h-11 gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Save & Request Visit
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
