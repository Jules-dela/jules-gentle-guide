import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, CreditCard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentEvent {
  id: string;
  created_at: string;
  email: string | null;
  intake_submission_id: string | null;
  event_type: string;
  previous_status: string | null;
  new_status: string | null;
  deposit_paid: boolean | null;
  stripe_session_id: string | null;
  source: string | null;
  message: string | null;
  metadata: Record<string, unknown> | null;
}

const EVENT_COLORS: Record<string, string> = {
  deposit_confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  session_checked: "bg-slate-100 text-slate-800 border-slate-200",
  check_existing: "bg-blue-50 text-blue-800 border-blue-200",
  email_lookup_restored: "bg-emerald-50 text-emerald-800 border-emerald-200",
  email_lookup_not_found: "bg-amber-50 text-amber-900 border-amber-200",
  admin_provision_completed: "bg-indigo-50 text-indigo-900 border-indigo-200",
  admin_provision_no_paid_row: "bg-rose-50 text-rose-800 border-rose-200",
};

function fmt(ts: string) {
  return new Date(ts).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default function AdminPaymentLogs() {
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("payment_events" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    const term = search.trim().toLowerCase();
    if (term) {
      query = query.ilike("email", `%${term}%`);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Failed to load payment_events:", error.message);
      setEvents([]);
    } else {
      setEvents((data as unknown as PaymentEvent[]) || []);
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-primary" />
              Payment Logs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Audit trail of payment verification events. Use this to trace cases where a client
              reports "submitted" but their deposit was not confirmed.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filter by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="bg-background border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">When</th>
                  <th className="text-left px-4 py-3 font-medium">Event</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Deposit</th>
                  <th className="text-left px-4 py-3 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                      No payment events recorded yet.
                    </td>
                  </tr>
                ) : (
                  events.map((e) => (
                    <tr key={e.id} className="border-t hover:bg-muted/20 align-top">
                      <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                        {fmt(e.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={EVENT_COLORS[e.event_type] || "bg-slate-50"}
                        >
                          {e.event_type}
                        </Badge>
                        {e.source && (
                          <div className="text-[10px] text-muted-foreground mt-1">
                            via {e.source}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{e.email || "—"}</td>
                      <td className="px-4 py-3 text-xs">
                        {e.previous_status === e.new_status ? (
                          <span>{e.new_status || "—"}</span>
                        ) : (
                          <span>
                            <span className="text-muted-foreground">{e.previous_status || "—"}</span>
                            <span className="mx-1">→</span>
                            <span className="font-medium">{e.new_status || "—"}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {e.deposit_paid === true ? (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
                            paid
                          </Badge>
                        ) : e.deposit_paid === false ? (
                          <Badge variant="outline" className="bg-amber-50 text-amber-900">
                            unpaid
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-md">
                        <div>{e.message || ""}</div>
                        {e.stripe_session_id && (
                          <div className="font-mono text-[10px] mt-1 break-all">
                            session: {e.stripe_session_id}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}