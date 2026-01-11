import { 
  ClipboardCheck, 
  Search, 
  Home, 
  Video, 
  FileText, 
  Clock, 
  Key, 
  CheckCircle 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TIMELINE_STEPS, type CaseStatus } from '@/types/portal';

interface TimelineTrackerProps {
  currentStatus: CaseStatus;
  className?: string;
}

const iconMap = {
  ClipboardCheck,
  Search,
  Home,
  Video,
  FileText,
  Clock,
  Key,
  CheckCircle,
};

export function TimelineTracker({ currentStatus, className }: TimelineTrackerProps) {
  const currentStepIndex = TIMELINE_STEPS.findIndex(step => step.status === currentStatus);
  const progressPercentage = Math.round(((currentStepIndex + 1) / TIMELINE_STEPS.length) * 100);

  return (
    <div className={cn('w-full', className)}>
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">Progress</span>
          <span className="text-sm font-medium text-primary">{progressPercentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Timeline steps */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-muted" />

        <div className="space-y-4">
          {TIMELINE_STEPS.map((step, index) => {
            const Icon = iconMap[step.icon as keyof typeof iconMap];
            const isPast = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const isFuture = index > currentStepIndex;

            return (
              <div
                key={step.status}
                className={cn(
                  'relative flex items-start gap-4 p-4 rounded-lg transition-all duration-300',
                  isCurrent && 'bg-primary/5 border border-primary/20',
                  isPast && 'opacity-60',
                  isFuture && 'opacity-40'
                )}
              >
                {/* Icon circle */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                    isCurrent && 'bg-primary border-primary text-primary-foreground',
                    isPast && 'bg-primary/80 border-primary/80 text-primary-foreground',
                    isFuture && 'bg-background border-muted-foreground/30 text-muted-foreground'
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={cn(
                        'font-semibold text-base',
                        isCurrent && 'text-primary',
                        isPast && 'text-foreground',
                        isFuture && 'text-muted-foreground'
                      )}
                    >
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                        Current
                      </span>
                    )}
                    {isPast && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p
                    className={cn(
                      'text-sm',
                      isCurrent ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
