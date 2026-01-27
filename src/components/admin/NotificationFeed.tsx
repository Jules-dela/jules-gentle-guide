import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Heart, X, FileText, MessageSquare, Bell } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { ClientInteraction } from '@/types/admin';

interface NotificationFeedProps {
  interactions: ClientInteraction[];
  isLoading?: boolean;
  className?: string;
}

const interactionConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  liked: { icon: Heart, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  rejected: { icon: X, color: 'text-red-600', bgColor: 'bg-red-100' },
  document_uploaded: { icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  feedback: { icon: MessageSquare, color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

export function NotificationFeed({ interactions, isLoading, className }: NotificationFeedProps) {
  const getInteractionInfo = (type: string) => {
    return interactionConfig[type] || { icon: Bell, color: 'text-gray-600', bgColor: 'bg-gray-100' };
  };

  if (isLoading) {
    return (
      <div className={cn("bg-background rounded-xl border", className)}>
        <div className="p-4 border-b">
          <h3 className="font-semibold text-foreground">Recent Interactions</h3>
        </div>
        <div className="p-4 text-center text-muted-foreground text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className={cn("bg-background rounded-xl border flex flex-col", className)}
    >
      <div className="p-3 sm:p-4 border-b shrink-0">
        <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
          <Bell className="h-4 w-4" />
          Recent Interactions
        </h3>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {interactions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              No recent interactions
            </div>
          ) : (
            <div className="space-y-1">
              {interactions.map((interaction, index) => {
                const info = getInteractionInfo(interaction.type);
                const Icon = info.icon;
                const timeAgo = formatDistanceToNow(new Date(interaction.timestamp), { addSuffix: true });

                return (
                  <motion.div
                    key={interaction.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-2.5 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3">
                      <div className={cn('w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0', info.bgColor)}>
                        <Icon className={cn('w-3.5 h-3.5 sm:w-4 sm:h-4', info.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {interaction.client_name}
                        </p>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {interaction.description}
                        </p>
                        {interaction.reason && (
                          <p className="text-xs text-red-600 mt-1 italic line-clamp-1">
                            Reason: {interaction.reason}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {timeAgo}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </motion.div>
  );
}
