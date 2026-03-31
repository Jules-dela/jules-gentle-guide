import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ThumbsUp, ThumbsDown, FileCheck, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import type { ClientInteraction } from '@/types/admin';

interface NotificationBellProps {
  interactions: ClientInteraction[];
  onMarkAllRead?: () => void;
}

export function NotificationBell({ interactions, onMarkAllRead }: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  
  // Calculate unread count
  const unreadCount = interactions.filter(i => !readIds.has(i.id)).length;

  // Mark as read when opened - only depend on isOpen and interactions, not readIds
  useEffect(() => {
    if (isOpen && interactions.length > 0) {
      const timer = setTimeout(() => {
        setReadIds(prev => {
          const next = new Set(prev);
          interactions.forEach(i => next.add(i.id));
          return next;
        });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, interactions]);

  const getIcon = (type: ClientInteraction['type']) => {
    switch (type) {
      case 'liked':
        return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <ThumbsDown className="h-4 w-4 text-red-500" />;
      case 'document_uploaded':
        return <FileCheck className="h-4 w-4 text-blue-500" />;
      case 'feedback':
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1"
              >
                <Badge 
                  variant="destructive" 
                  className="h-5 min-w-[20px] p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const allIds = new Set(interactions.map(i => i.id));
                  setReadIds(allIds);
                  onMarkAllRead?.();
                }}
                className="text-xs text-muted-foreground"
              >
                Mark all read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-5rem)]">
          {interactions.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                You'll see client feedback here
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {interactions.map((interaction, index) => {
                const isUnread = !readIds.has(interaction.id);
                return (
                  <motion.div
                    key={interaction.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`p-4 hover:bg-muted/50 transition-colors ${
                      isUnread ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        interaction.type === 'liked' ? 'bg-green-100' :
                        interaction.type === 'rejected' ? 'bg-red-100' :
                        interaction.type === 'document_uploaded' ? 'bg-blue-100' :
                        'bg-amber-100'
                      }`}>
                        {getIcon(interaction.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-medium">
                            {interaction.client_name}
                          </p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatTime(interaction.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {interaction.description}
                        </p>
                        
                        {interaction.reason && (
                          <p className="text-xs text-muted-foreground mt-1 italic">
                            Reason: {interaction.reason}
                          </p>
                        )}
                        
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-primary absolute right-4 top-1/2 -translate-y-1/2" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
