import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Lock, Loader2, MessageCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Props {
  caseId: string;
  onChange?: () => void;
}

interface Row {
  notes: string | null;
  managed_by: string | null;
  whatsapp_contacted: boolean;
  whatsapp_contacted_at: string | null;
}

export function InternalCasePanel({ caseId, onChange }: Props) {
  const [row, setRow] = useState<Row>({
    notes: '',
    managed_by: '',
    whatsapp_contacted: false,
    whatsapp_contacted_at: null,
  });
  const [loading, setLoading] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const notesDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [own, all] = await Promise.all([
        supabase
          .from('case_staff_notes')
          .select('notes, managed_by, whatsapp_contacted, whatsapp_contacted_at')
          .eq('case_id', caseId)
          .maybeSingle(),
        supabase
          .from('case_staff_notes')
          .select('managed_by')
          .not('managed_by', 'is', null),
      ]);
      if (cancelled) return;
      if (own.data) {
        setRow({
          notes: (own.data as any).notes ?? '',
          managed_by: (own.data as any).managed_by ?? '',
          whatsapp_contacted: !!(own.data as any).whatsapp_contacted,
          whatsapp_contacted_at: (own.data as any).whatsapp_contacted_at ?? null,
        });
      }
      const names = new Set<string>();
      (all.data || []).forEach((r: any) => {
        if (r.managed_by && typeof r.managed_by === 'string') names.add(r.managed_by.trim());
      });
      setSuggestions([...names].filter(Boolean).sort());
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [caseId]);

  const flashSaved = useCallback(() => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1500);
  }, []);

  const upsert = useCallback(async (patch: Partial<Row>) => {
    const { error } = await supabase
      .from('case_staff_notes')
      .upsert({ case_id: caseId, ...patch } as any, { onConflict: 'case_id' });
    if (error) {
      console.error('InternalCasePanel upsert', error);
      toast({ title: 'Error', description: 'Failed to save internal note.', variant: 'destructive' });
      return false;
    }
    flashSaved();
    onChange?.();
    return true;
  }, [caseId, flashSaved, onChange]);

  const onNotesChange = (value: string) => {
    setRow((r) => ({ ...r, notes: value }));
    if (notesDebounce.current) clearTimeout(notesDebounce.current);
    notesDebounce.current = setTimeout(() => upsert({ notes: value } as any), 800);
  };

  const onNotesBlur = () => {
    if (notesDebounce.current) clearTimeout(notesDebounce.current);
    upsert({ notes: row.notes } as any);
  };

  const onManagedByBlur = () => {
    upsert({ managed_by: (row.managed_by || '').trim() || null } as any);
  };

  const applyManagedByChip = async (name: string) => {
    setRow((r) => ({ ...r, managed_by: name }));
    await upsert({ managed_by: name } as any);
  };

  const toggleWhatsapp = async (checked: boolean) => {
    const patch: any = { whatsapp_contacted: checked };
    if (checked && !row.whatsapp_contacted_at) patch.whatsapp_contacted_at = new Date().toISOString();
    setRow((r) => ({
      ...r,
      whatsapp_contacted: checked,
      whatsapp_contacted_at: patch.whatsapp_contacted_at ?? r.whatsapp_contacted_at,
    }));
    await upsert(patch);
  };

  return (
    <div className="rounded-lg border-2 border-dashed border-amber-300/60 bg-amber-50/40 p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-amber-700" />
          <div>
            <h4 className="text-sm font-semibold text-foreground">Internal Notes — Team Only</h4>
            <p className="text-[11px] text-muted-foreground">Never visible to the client</p>
          </div>
        </div>
        {savedFlash && (
          <span className="inline-flex items-center gap-1 text-xs text-green-700">
            <Check className="h-3 w-3" /> Saved
          </span>
        )}
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Notes / links</label>
        <Textarea
          value={row.notes || ''}
          onChange={(e) => onNotesChange(e.target.value)}
          onBlur={onNotesBlur}
          placeholder="Paste apartment links here (Homegate, Flatfox, ImmoScout, agency pages)…"
          rows={4}
          className="text-sm resize-y min-h-[100px]"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-foreground block mb-1">Managed by</label>
        <Input
          value={row.managed_by || ''}
          onChange={(e) => setRow((r) => ({ ...r, managed_by: e.target.value }))}
          onBlur={onManagedByBlur}
          placeholder="Team member name"
          className="text-sm"
        />
        {suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => applyManagedByChip(name)}
                className="text-[11px] px-2 py-0.5 rounded-full bg-background border border-border hover:bg-muted transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-background/60 border border-border">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-foreground">WhatsApp contacted</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {row.whatsapp_contacted
              ? row.whatsapp_contacted_at
                ? `Contacted on ${new Date(row.whatsapp_contacted_at).toLocaleDateString('en-GB')}`
                : 'Contacted'
              : 'Not yet contacted'}
          </p>
        </div>
        <Switch checked={row.whatsapp_contacted} onCheckedChange={toggleWhatsapp} />
      </div>
    </div>
  );
}