import { useEffect, useState, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Search, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Rejection {
  id: string;
  created_at: string;
  reason: string;
  email: string | null;
  phone: string | null;
  ip_address: string | null;
  user_agent: string | null;
  payload: Record<string, unknown> | null;
  error_detail: string | null;
}

const REASON_COLORS: Record<string, string> = {
  rate_limit: "bg-amber-100 text-amber-900 border-amber-200",
  validation_failed: "bg-rose-100 text-rose-800 border-rose-200",
  missing_contract_signature: "bg-orange-100 text-orange-900 border-orange-200",
  honeypot: "bg-slate-200 text-slate-700 border-slate-300",
  internal_error: "bg-red-100 text-red-900 border-red-200",
};

const REASON_LABELS: Record<string, string> = {
  rate_limit: "Rate limited",
  validation_failed: "Validation failed",
  missing_contract_signature: "No signature",
  honeypot: "Bot (honeypot)",
  internal_error: "Server error",
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

export default function AdminApplicationRejections() {
  const [rows, setRows] = useState<Rejection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [reasonFilter, setReasonFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("application_rejections" as never)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (reasonFilter !== "all") {
      query = query.eq("reason", reasonFilter);
    }
    const term = search.trim().toLowerCase();
    if (term) {
      query = query.or(`email.ilike.%${term}%,phone.ilike.%${term}%`);
    }
    const { data, error } = await query;
    if (error) {
      console.error("Failed to load application_rejections:", error.message);
      setRows([]);
    } else {
      setRows((data as unknown as Rejection[]) || []);
    }
    setLoading(false);
  }, [search, reasonFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const reasons = ["all", "rate_limit", "validation_failed", "missing_contract_signature", "honeypot", "internal_error"];

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-600" />
              Rejected Applications
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Submissions to /apply that were refused before reaching the database. Use this to
              diagnose customers who say "I filled in the form" but never appeared.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative max-w-sm flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by email or phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-1">
            {reasons.map((r) => (
              <Button
                key={r}
                size="sm"
                variant={reasonFilter === r ? "default" : "outline"}
                onClick={() => setReasonFilter(r)}
                className="h-8 text-xs"
              >
                {r === "all" ? "All" : REASON_LABELS[r] || r}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-background border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="w-8"></th>
                  <th className="text-left px-4 py-3 font-medium">When</th>
                  <th className="text-left px-4 py-3 font-medium">Reason</th>
                  <th className="text-left px-4 py-3 font-medium">Email</th>
                  <th className="text-left px-4 py-3 font-medium">Phone</th>
                  <th className="text-left px-4 py-3 font-medium">IP</th>
                  <th className="text-left px-4 py-3 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i} className="border-t">
                      <td colSpan={7} className="px-4 py-3">
                        <Skeleton className="h-5 w-full" />
                      </td>
                    </tr>
                  ))
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      No rejected applications recorded.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => {
                    const isOpen = expanded.has(r.id);
                    return (
                      <>
                        <tr
                          key={r.id}
                          className="border-t hover:bg-muted/20 align-top cursor-pointer"
                          onClick={() => toggle(r.id)}
                        >
                          <td className="px-2 py-3 text-muted-foreground">
                            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                            {fmt(r.created_at)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={REASON_COLORS[r.reason] || "bg-slate-50"}
                            >
                              {REASON_LABELS[r.reason] || r.reason}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 font-mono text-xs">{r.email || "—"}</td>
                          <td className="px-4 py-3 font-mono text-xs">{r.phone || "—"}</td>
                          <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                            {r.ip_address || "—"}
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground max-w-md truncate">
                            {r.error_detail || "—"}
                          </td>
                        </tr>
                        {isOpen && (
                          <tr key={`${r.id}-d`} className="bg-muted/10 border-t">
                            <td></td>
                            <td colSpan={6} className="px-4 py-3">
                              <div className="space-y-2 text-xs">
                                {r.user_agent && (
                                  <div>
                                    <span className="font-medium">User agent: </span>
                                    <span className="font-mono text-muted-foreground break-all">
                                      {r.user_agent}
                                    </span>
                                  </div>
                                )}
                                {r.error_detail && (
                                  <div>
                                    <span className="font-medium">Error detail: </span>
                                    <span className="font-mono text-muted-foreground break-all">
                                      {r.error_detail}
                                    </span>
                                  </div>
                                )}
                                {r.payload && (
                                  <div>
                                    <div className="font-medium mb-1">Submitted payload:</div>
                                    <pre className="bg-background border rounded-lg p-3 overflow-x-auto text-[11px] leading-snug max-h-96">
                                      {JSON.stringify(r.payload, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
