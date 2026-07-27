import { useMemo, useState } from 'react';
import { AlertCircle, FileCheck2, Clock, CalendarClock, ChevronRight, Trash2, RotateCcw, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClientWithCase } from '@/types/admin';
import { Button } from '@/components/ui/button';

interface AttentionItem {
  id: string;
  clientId: string;
  reasonType: string;
  client: ClientWithCase;
  reason: string;
  days: number;
  suffix?: string;
  icon: typeof AlertCircle;
  timestamp: number;
}

interface NeedsAttentionProps {
  clients: ClientWithCase[];
  onClientClick: (client: ClientWithCase) => void;
  dismissedAttention: Set<string>;
  onDismiss: (clientId: string, reasonType: string) => void;
  onRestore: (clientId: string, reasonType: string) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;

const REASON_TYPES = {
  noProposals: 'no-proposals',
  docsPending: 'docs-pending',
  stale: 'stale',
  visitSoon: 'visit-soon',
} as const;

export function NeedsAttention({
  clients,
  onClientClick,
  dismissedAttention,
  onDismiss,
  onRestore,
}: NeedsAttentionProps) {
  const [showDismissed, setShowDismissed] = useState(false);

  const allItems = useMemo<AttentionItem[]>(() => {
    const now = Date.now();
    const list: AttentionItem[] = [];

    for (const c of clients) {
      if (c.case_status === 'closed') continue;

      // 1) Contract signed >3 days, no proposal
      if (c.is_contract_signed && c.contract_data?.signed_at && c.listing_statuses.length === 0) {
        const hasAnyProposalActivity = c.last_activity === 'Liked a flat' || c.last_activity === 'Rejected a flat';
        if (!hasAnyProposalActivity) {
          const signedAt = new Date(c.contract_data.signed_at).getTime();
          const days = Math.floor((now - signedAt) / DAY_MS);
          if (days > 3) {
            list.push({
              id: `no-proposals-${c.id}`,
              clientId: c.id,
              reasonType: REASON_TYPES.noProposals,
              client: c,
              reason: 'Contract signed, no proposal sent yet',
              days,
              suffix: 'days ago',
              icon: AlertCircle,
              timestamp: signedAt,
            });
          }
        }
      }

      // 2) Documents uploaded, pending admin review
      if (c.docs_pending_review) {
        const ts = c.last_activity_at ? new Date(c.last_activity_at).getTime() : now;
        const days = Math.max(0, Math.floor((now - ts) / DAY_MS));
        list.push({
          id: `docs-pending-${c.id}`,
          clientId: c.id,
          reasonType: REASON_TYPES.docsPending,
          client: c,
          reason: 'Documents uploaded, awaiting review',
          days,
          suffix: days === 0 ? 'today' : 'days ago',
          icon: FileCheck2,
          timestamp: ts,
        });
      }

      // 3) No activity for >7 days
      const anchor = c.last_activity_at
        ? new Date(c.last_activity_at).getTime()
        : new Date(c.created_at).getTime();
      const daysSince = Math.floor((now - anchor) / DAY_MS);
      if (daysSince > 7) {
        list.push({
          id: `stale-${c.id}`,
          clientId: c.id,
          reasonType: REASON_TYPES.stale,
          client: c,
          reason: 'No activity on the case',
          days: daysSince,
          suffix: 'days ago',
          icon: Clock,
          timestamp: anchor,
        });
      }

      // 4) Next visit within 48h
      if (c.next_visit_at) {
        const visitTs = new Date(c.next_visit_at).getTime();
        const diffHrs = (visitTs - now) / (60 * 60 * 1000);
        if (diffHrs >= 0 && diffHrs <= 48) {
          list.push({
            id: `visit-soon-${c.id}`,
            clientId: c.id,
            reasonType: REASON_TYPES.visitSoon,
            client: c,
            reason: 'Upcoming visit',
            days: Math.round(diffHrs),
            suffix: 'hours away',
            icon: CalendarClock,
            timestamp: visitTs,
          });
        }
      }
    }

    list.sort((a, b) => a.timestamp - b.timestamp);
    return list;
  }, [clients]);

  const activeItems = useMemo(
    () => allItems.filter((item) => !dismissedAttention.has(`${item.clientId}:${item.reasonType}`)),
    [allItems, dismissedAttention]
  );
  const dismissedItems = useMemo(
    () => allItems.filter((item) => dismissedAttention.has(`${item.clientId}:${item.reasonType}`)),
    [allItems, dismissedAttention]
  );

  const displayedItems = showDismissed ? dismissedItems : activeItems;
  const hasDismissed = dismissedItems.length > 0;

  return (
    <div className="bg-background rounded-xl border">
      <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm sm:text-base font-semibold text-foreground">Needs attention</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {activeItems.length} active{hasDismissed ? ` · ${dismissedItems.length} dismissed` : ''}
          </span>
          {hasDismissed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDismissed((v) => !v)}
              className="h-7 px-2 text-xs gap-1"
            >
              {showDismissed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {showDismissed ? 'Show active' : 'Show dismissed'}
            </Button>
          )}
        </div>
      </div>

      {displayedItems.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          {showDismissed ? 'No dismissed items.' : 'Nothing pressing right now.'}
        </div>
      ) : (
        <ul className="divide-y">
          {displayedItems.map((item) => {
            const Icon = item.icon;
            const isDismissed = showDismissed;
            return (
              <li key={item.id} className={cn('group', isDismissed && 'opacity-60')}>
                <button

                  type="button"
                  onClick={() => onClientClick(item.client)}
                  className="w-full flex items-center gap-3 px-4 sm:px-5 py-3 text-left hover:bg-muted/40 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.client.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.reason}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap',
                      'bg-amber-100 text-amber-700',
                    )}
                  >
                    {item.days} {item.suffix}
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div
                    className="shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDismissed) {
                        onRestore(item.clientId, item.reasonType);
                      } else {
                        onDismiss(item.clientId, item.reasonType);
                      }
                    }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      title={isDismissed ? 'Restore to active list' : 'Dismiss this item'}
                    >
                      {isDismissed ? <RotateCcw className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
