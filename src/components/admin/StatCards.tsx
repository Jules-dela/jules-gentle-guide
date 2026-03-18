import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
  bgColorClass: string;
  highlight?: boolean;
  active?: boolean;
  onClick?: () => void;
}

function StatCard({ title, count, icon: Icon, colorClass, bgColorClass, highlight }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'bg-background rounded-xl border p-4 sm:p-6 flex items-center gap-3 sm:gap-4 relative overflow-hidden',
        highlight && 'ring-2 ring-primary/50'
      )}
    >
      {highlight && (
        <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-bl-lg font-medium">
          NEW
        </span>
      )}
      <div className={cn('w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0', bgColorClass)}>
        <Icon className={cn('w-5 h-5 sm:w-6 sm:h-6', colorClass)} />
      </div>
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-muted-foreground font-medium truncate">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-foreground">{count}</p>
      </div>
    </motion.div>
  );
}

interface StatCardsProps {
  completed: number;
  inProgress: number;
  issues: number;
  dossiersReady?: number;
}

export function StatCards({ completed, inProgress, issues, dossiersReady = 0 }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        title="Completed"
        count={completed}
        icon={CheckCircle2}
        colorClass="text-emerald-600"
        bgColorClass="bg-emerald-100"
      />
      <StatCard
        title="In Progress"
        count={inProgress}
        icon={Clock}
        colorClass="text-amber-600"
        bgColorClass="bg-amber-100"
      />
      <StatCard
        title="Action Required"
        count={issues}
        icon={AlertTriangle}
        colorClass="text-red-600"
        bgColorClass="bg-red-100"
        highlight={issues > 0}
      />
      <StatCard
        title="Dossiers Ready"
        count={dossiersReady}
        icon={FileCheck}
        colorClass="text-primary"
        bgColorClass="bg-primary/10"
        highlight={dossiersReady > 0}
      />
    </div>
  );
}
