import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Json } from '@/integrations/supabase/types';

interface StageNotification {
  id: string;
  case_id: string;
  stage: number;
  updated_at: string;
  notification_type: string;
  metadata: Json;
}

interface ClientStageView {
  id: string;
  case_id: string;
  user_id: string;
  stage: number;
  last_viewed_at: string;
}

export interface UnreadStages {
  [stage: number]: {
    hasNew: boolean;
    count?: number;
    type?: string;
  };
}

interface UseNotificationsReturn {
  unreadStages: UnreadStages;
  loading: boolean;
  markStageAsRead: (caseId: string, stage: number) => Promise<void>;
  checkForNewUpdates: () => Promise<void>;
  pendingNotifications: StageNotification[];
}

export function useNotifications(caseId: string | null): UseNotificationsReturn {
  const { user } = useAuth();
  const [unreadStages, setUnreadStages] = useState<UnreadStages>({});
  const [loading, setLoading] = useState(true);
  const [pendingNotifications, setPendingNotifications] = useState<StageNotification[]>([]);
  const lastSeenKey = caseId ? `unikey_notif_seen_${caseId}` : null;
  // Track whether we've already toasted this mount via a ref to avoid re-renders
  const hasToastedRef = useState(() => ({ current: false }))[0];

  const checkForNewUpdates = useCallback(async () => {
    if (!caseId || !user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch all notifications for this case
      const { data: notifications, error: notifError } = await supabase
        .from('stage_notifications')
        .select('*')
        .eq('case_id', caseId);

      if (notifError) throw notifError;

      // Fetch user's last view timestamps
      const { data: views, error: viewsError } = await supabase
        .from('client_stage_views')
        .select('*')
        .eq('case_id', caseId)
        .eq('user_id', user.id);

      if (viewsError) throw viewsError;

      // Create a map of stage -> last viewed time
      const viewMap: Record<number, string> = {};
      views?.forEach((view: ClientStageView) => {
        viewMap[view.stage] = view.last_viewed_at;
      });

      // Determine which stages have unread updates
      const unread: UnreadStages = {};
      const pending: StageNotification[] = [];

      notifications?.forEach((notif) => {
        const lastViewed = viewMap[notif.stage];
        const notifTime = new Date(notif.updated_at).getTime();
        const viewTime = lastViewed ? new Date(lastViewed).getTime() : 0;

        if (notifTime > viewTime) {
          const metadata = typeof notif.metadata === 'object' && notif.metadata !== null 
            ? notif.metadata as Record<string, unknown>
            : {};
          unread[notif.stage] = {
            hasNew: true,
            type: notif.notification_type,
            count: (metadata.count as number) || 1,
          };
          pending.push(notif as StageNotification);
        }
      });

      setUnreadStages(unread);
      setPendingNotifications(pending);

      // Show toast only for notifications newer than what user last saw
      const lastSeen = lastSeenKey ? localStorage.getItem(lastSeenKey) : null;
      const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
      const trulyNewPending = pending.filter(
        n => new Date(n.updated_at).getTime() > lastSeenTime
      );

      if (!hasToastedRef.current && trulyNewPending.length > 0) {
        const firstNotif = trulyNewPending[0];
        const firstMetadata = typeof firstNotif.metadata === 'object' && firstNotif.metadata !== null
          ? firstNotif.metadata as Record<string, unknown>
          : {};
        const stageNames: Record<number, string> = {
          1: 'Criteria',
          2: 'Research',
          3: 'Viewings',
          4: 'Documents',
          5: 'Handover',
        };

        let message = '';
        if (firstNotif.notification_type === 'new_match') {
          const count = (firstMetadata.count as number) || 1;
          message = `${count} new apartment${count > 1 ? 's' : ''} added to Research`;
        } else if (firstNotif.notification_type === 'visit_published') {
          message = 'New visit report available';
        } else if (firstNotif.notification_type === 'document_verified') {
          message = 'Document status updated';
        } else if (firstNotif.notification_type === 'handover_scheduled') {
          message = 'Key handover has been scheduled';
        } else {
          message = `New update in ${stageNames[firstNotif.stage] || 'your portal'}`;
        }

        toast.info('Update Available', {
          description: message,
          action: {
            label: 'View',
            onClick: () => {},
          },
          duration: 6000,
        });

        hasToastedRef.current = true;
      }

      // Persist the latest notification timestamp so we don't re-toast next visit
      if (pending.length > 0 && lastSeenKey) {
        const latestTime = pending.reduce((max, n) => {
          const t = new Date(n.updated_at).getTime();
          return t > max ? t : max;
        }, 0);
        localStorage.setItem(lastSeenKey, new Date(latestTime).toISOString());
      }
    } catch (err) {
      console.error('Error checking notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [caseId, user]);

  const markStageAsRead = useCallback(async (targetCaseId: string, stage: number) => {
    if (!user) return;

    try {
      // Upsert the view record
      const { error } = await supabase
        .from('client_stage_views')
        .upsert(
          {
            case_id: targetCaseId,
            user_id: user.id,
            stage,
            last_viewed_at: new Date().toISOString(),
          },
          {
            onConflict: 'case_id,user_id,stage',
          }
        );

      if (error) throw error;

      // Update local state
      setUnreadStages(prev => {
        const updated = { ...prev };
        delete updated[stage];
        return updated;
      });

      setPendingNotifications(prev => 
        prev.filter(n => n.stage !== stage)
      );
    } catch (err) {
      console.error('Error marking stage as read:', err);
    }
  }, [user]);

  useEffect(() => {
    checkForNewUpdates();
  }, [checkForNewUpdates]);

  // Set up realtime subscription for new notifications
  useEffect(() => {
    if (!caseId) return;

    const channel = supabase
      .channel(`notifications-${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'stage_notifications',
          filter: `case_id=eq.${caseId}`,
        },
        () => {
          hasToastedRef.current = false; // Reset so new realtime notifications show toast
          checkForNewUpdates();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId, checkForNewUpdates]);

  return {
    unreadStages,
    loading,
    markStageAsRead,
    checkForNewUpdates,
    pendingNotifications,
  };
}

// Admin hook to create notifications
export function useAdminNotifications() {
  const { user } = useAuth();

  const createNotification = useCallback(async (
    caseId: string,
    stage: number,
    notificationType: string,
    metadata: Record<string, unknown> = {},
    sendEmail: boolean = false,
    clientEmail?: string,
    clientName?: string
  ) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Upsert notification (update if exists for same case/stage/type)
      const { error } = await supabase
        .from('stage_notifications')
        .upsert(
          [
            {
              case_id: caseId,
              stage,
              notification_type: notificationType,
              updated_at: new Date().toISOString(),
              updated_by: user.id,
              metadata: metadata as Json,
            },
          ],
          {
            onConflict: 'case_id,stage,notification_type',
          }
        );

      if (error) throw error;

      // Send email notification if requested
      if (sendEmail && clientEmail) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-portal-notifications', {
            body: {
              type: notificationType,
              email: clientEmail,
              name: clientName || 'Client',
              stage,
              metadata,
            },
          });

          if (emailError) {
            console.error('Email notification error:', emailError);
          }
        } catch (emailErr) {
          console.error('Failed to send email:', emailErr);
        }
      }

      return { error: null };
    } catch (err) {
      console.error('Error creating notification:', err);
      return { error: err instanceof Error ? err : new Error('Failed to create notification') };
    }
  }, [user]);

  return { createNotification };
}
