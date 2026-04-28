import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { FileText, FileSignature, CreditCard, AlertTriangle, CheckCircle2, RefreshCw, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Consider an abandoned-at-payment lead if they reached payment but haven't paid
// for at least this many minutes (avoids flagging in-progress sessions)
const ABANDON_THRESHOLD_MINUTES = 30;

interface IntakeRow {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  status: string;
  contract_signed: boolean;
  deposit_paid: boolean;
  created_at: string;
  updated_at: string;
}

interface FunnelData {
  started: number;
  signed: number;
  reachedPayment: number;
  abandonedAtPayment: number;
  paid: number;
  abandonedLeads: IntakeRow[];
}

function pct(n: number, base: number): string {
  if (!base) return '0%';
  return `${Math.round((n / base) * 100)}%`;
}

export function ConversionFunnel() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAbandoned, setShowAbandoned] = useState(false);

  const fetchFunnel = useCallback(async () => {
    setLoading(true);
    try {
      const { data: rows, error } = await supabase
        .from('intake_submissions')
        .select('id, name, email, phone, status, contract_signed, deposit_paid, created_at, updated_at')
        .order('updated_at', { ascending: false });
      if (error) throw error;

      const all = (rows || []) as IntakeRow[];
      const cutoff = Date.now() - ABANDON_THRESHOLD_MINUTES * 60 * 1000;

      const started = all.length;
      const signed = all.filter((r) => r.contract_signed).length;
      const reachedPayment = all.filter((r) => r.status === 'awaiting_payment' || r.deposit_paid).length;
      const paid = all.filter((r) => r.deposit_paid).length;

      const abandonedLeads = all
        .filter(
          (r) =>
            r.contract_signed &&
            !r.deposit_paid &&
            r.status === 'awaiting_payment' &&
            new Date(r.updated_at).getTime() < cutoff
        )
        .slice(0, 50);

      setData({
        started,
        signed,
        reachedPayment,
        abandonedAtPayment: abandonedLeads.length,
        paid,
        abandonedLeads,
      });
    } catch (err) {
      console.error('Funnel fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFunnel();
  }, [fetchFunnel]);

  if (loading || !data) {
    return (
      <div className="bg-background border rounded-xl p-4 sm:p-6">
        <div className="h-5 w-40 bg-muted rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const steps = [
    {
      key: 'started',
      label: 'Started form',
      value: data.started,
      pct: '100%',
      icon: FileText,
      color: 'text-slate-700 bg-slate-100',
    },
    {
      key: 'signed',
      label: 'Signed contract',
      value: data.signed,
      pct: pct(data.signed, data.started),
      icon: FileSignature,
      color: 'text-blue-700 bg-blue-100',
    },
    {
      key: 'reached',
      label: 'Reached payment',
      value: data.reachedPayment,
      pct: pct(data.reachedPayment, data.started),
      icon: CreditCard,
      color: 'text-purple-700 bg-purple-100',
    },
    {
      key: 'abandoned',
      label: 'Abandoned at payment',
      value: data.abandonedAtPayment,
      pct: pct(data.abandonedAtPayment, Math.max(data.reachedPayment, 1)),
      icon: AlertTriangle,
      color: 'text-amber-700 bg-amber-100',
      highlight: true,
    },
    {
      key: 'paid',
      label: 'Paid deposit',
      value: data.paid,
      pct: pct(data.paid, data.started),
      icon: CheckCircle2,
      color: 'text-green-700 bg-green-100',
    },
  ];

  return (
    <div className="bg-background border rounded-xl p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-foreground">Conversion Funnel</h2>
          <p className="text-xs text-muted-foreground">
            Tracks where applicants drop off in the intake form
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchFunnel} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.key}
              className={cn(
                'rounded-lg border p-3 flex flex-col gap-1',
                s.highlight && data.abandonedAtPayment > 0 && 'border-amber-300 bg-amber-50/50'
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn('inline-flex items-center justify-center h-6 w-6 rounded-full', s.color)}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs text-muted-foreground truncate">{s.label}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-foreground">{s.value}</span>
                <span className="text-xs text-muted-foreground">{s.pct}</span>
              </div>
            </div>
          );
        })}
      </div>

      {data.abandonedLeads.length > 0 && (
        <div className="mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAbandoned(!showAbandoned)}
            className="gap-2 text-xs"
          >
            {showAbandoned ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showAbandoned ? 'Hide' : 'Show'} {data.abandonedLeads.length} lead
            {data.abandonedLeads.length !== 1 ? 's' : ''} to recover
          </Button>

          {showAbandoned && (
            <div className="mt-3 border rounded-lg overflow-hidden">
              <div className="divide-y">
                {data.abandonedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate">
                        {lead.name || 'Unnamed'}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-0.5 text-xs text-muted-foreground">
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="flex items-center gap-1 hover:text-primary truncate"
                          >
                            <Mail className="h-3 w-3 shrink-0" />
                            <span className="truncate">{lead.email}</span>
                          </a>
                        )}
                        {lead.phone && (
                          <a
                            href={`tel:${lead.phone}`}
                            className="flex items-center gap-1 hover:text-primary"
                          >
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </a>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                      {formatDistanceToNow(new Date(lead.updated_at), { addSuffix: true })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}