import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  count: number;
  icon: React.ElementType;
  colorClass: string;
  bgColorClass: string;
}

function StatCard({ title, count, icon: Icon, colorClass, bgColorClass }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background rounded-xl border p-6 flex items-center gap-4"
    >
      <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', bgColorClass)}>
        <Icon className={cn('w-6 h-6', colorClass)} />
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <p className="text-3xl font-bold text-foreground">{count}</p>
      </div>
    </motion.div>
  );
}

interface StatCardsProps {
  completed: number;
  inProgress: number;
  issues: number;
}

export function StatCards({ completed, inProgress, issues }: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      />
    </div>
  );
}
