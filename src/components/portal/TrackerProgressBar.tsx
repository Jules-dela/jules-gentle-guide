import { motion } from 'framer-motion';
import { FileText, Search, Eye, Share, Key } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrackerProgressBarProps {
  currentStage: number;
}

const stages = [
  { id: 1, label: 'My Criteria', icon: FileText },
  { id: 2, label: 'Research', icon: Search },
  { id: 3, label: 'Viewings', icon: Eye },
  { id: 4, label: 'Documents', icon: Share },
  { id: 5, label: 'Handover', icon: Key },
];

export function TrackerProgressBar({ currentStage }: TrackerProgressBarProps) {
  return (
    <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="relative max-w-3xl mx-auto">
          {/* Background line - positioned between first and last icon centers */}
          <div className="absolute top-5 md:top-6 left-[10%] right-[10%] h-0.5 bg-muted z-0" />
          
          {/* Animated progress line */}
          <motion.div
            className="absolute top-5 md:top-6 left-[10%] h-0.5 bg-primary z-10 origin-left"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: (currentStage - 1) / (stages.length - 1) }}
            style={{ width: '80%' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
          
          {/* Stage icons - using grid for equal spacing */}
          <div className="relative z-20 grid grid-cols-5">
            {stages.map((stage) => {
              const Icon = stage.icon;
              const isActive = stage.id === currentStage;
              const isCompleted = stage.id < currentStage;
              
              return (
                <motion.div
                  key={stage.id}
                  className="flex flex-col items-center"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: stage.id * 0.1, duration: 0.3 }}
                >
                  <motion.div
                    className={cn(
                      'w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-300',
                      isActive && 'bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20',
                      isCompleted && 'bg-primary text-primary-foreground',
                      !isActive && !isCompleted && 'bg-white border-2 border-muted text-muted-foreground'
                    )}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </motion.div>
                  <motion.span
                    className={cn(
                      'mt-2 text-[10px] md:text-xs font-medium text-center',
                      isActive && 'text-primary',
                      isCompleted && 'text-primary',
                      !isActive && !isCompleted && 'text-muted-foreground'
                    )}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: stage.id * 0.1 + 0.2, duration: 0.3 }}
                  >
                    {stage.label}
                  </motion.span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
