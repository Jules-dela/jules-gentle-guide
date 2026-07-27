import { useMemo } from 'react';
import { AlertCircle, FileCheck2, Clock, CalendarClock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ClientWithCase } from '@/types/admin';

interface AttentionItem {
  id: string;
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
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function NeedsAttention({ clients, onClientClick }: NeedsAttentionProps) {
  const items = useMemo<AttentionItem[]>(() => {
    const now = Date.now();
    const list: AttentionItem[] = [];

    for (const c of clients) {
      if (c.case_status === 'closed') continue;

      // 1) Contract signed >3 days, no proposal
      if (c.is_contract_signed && c.contract_data?.signed_at && c.listing_statuses.length === 0) {
        // listing_statuses only tracks liked; use last_activity as a proxy for "any proposal"
        // We treat lack of any listing + no last_activity of type liked/rejected as zero proposals.
        const hasAnyProposalActivity = c.last_activity === 'Liked a flat' || c.last_activity === 'Rejected a flat';
        if (!hasAnyProposalActivity) {
          const signedAt = new Date(c.contract_data.signed_at).getTime();
          const days = Math.floor((now - signedAt) / DAY_MS);
          if (days > 3) {
            list.push({
              id: `no-proposals-${c.id}`,
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

    // Oldest first (largest days ago / soonest visit sorts naturally as we mix scales, so sort by timestamp asc)
    list.sort((a, b) => a.timestamp - b.timestamp);
    return list;
  }, [clients]);

  return (
    <div className="bg-background rounded-xl border">
      <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <h2 className="text-sm sm:text-base font-semibold text-foreground">Needs attention</h2>
        </div>
        <span className="text-xs text-muted-foreground">
          {items.length} item{items.length === 1 ? '' : 's'}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="p-6 text-center text-sm text-muted-foreground">
          Nothing pressing right now.
        </div>
      ) : (
        <ul className="divide-y">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
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
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}