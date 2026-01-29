import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, MapPin, Clock, Save, Loader2, CheckCircle2, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface HandoverManagerProps {
  caseId: string;
  clientName: string;
  onUpdate?: () => void;
}

interface HandoverData {
  id?: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  location: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  notes: string | null;
  confirmed_by_client: boolean | null;
}

export function HandoverManager({ caseId, clientName, onUpdate }: HandoverManagerProps) {
  const [handover, setHandover] = useState<HandoverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [contactPerson, setContactPerson] = useState('Jules');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchHandover();
  }, [caseId]);

  const fetchHandover = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('key_handover')
        .select('*')
        .eq('case_id', caseId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setHandover(data);
        if (data.scheduled_date) {
          setDate(new Date(data.scheduled_date));
        }
        setTime(data.scheduled_time || '');
        setLocation(data.location || '');
        setContactPerson(data.contact_person || 'Jules');
        setContactPhone(data.contact_phone || '');
        setNotes(data.notes || '');
      }
    } catch (err) {
      console.error('Error fetching handover:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndNotify = async () => {
    setSaving(true);
    try {
      const handoverData = {
        case_id: caseId,
        scheduled_date: date ? format(date, 'yyyy-MM-dd') : null,
        scheduled_time: time || null,
        location: location || null,
        contact_person: contactPerson || null,
        contact_phone: contactPhone || null,
        notes: notes || null,
      };

      if (handover?.id) {
        // Update existing
        const { error } = await supabase
          .from('key_handover')
          .update(handoverData)
          .eq('id', handover.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('key_handover')
          .insert(handoverData);

        if (error) throw error;
      }

      // Update case status to key_handover_scheduled
      const { error: statusError } = await supabase
        .from('cases')
        .update({ status: 'key_handover_scheduled' })
        .eq('id', caseId);

      if (statusError) throw statusError;

      toast({
        title: 'Handover Scheduled',
        description: `${clientName}'s portal has been updated with the handover details.`,
      });

      fetchHandover();
      onUpdate?.();
    } catch (err) {
      console.error('Error saving handover:', err);
      toast({
        title: 'Error',
        description: 'Failed to save handover details',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const googleMapsUrl = location
    ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(location)}`
    : null;

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
            5
          </span>
          Key Handover Setup
        </h4>
        {handover?.confirmed_by_client && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Client Confirmed
          </span>
        )}
      </div>

      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-4">
        {/* Date & Time Row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">État des Lieux Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Time</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Handover Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter full address..."
              className="pl-9 bg-background"
            />
          </div>
        </div>

        {/* Map Preview */}
        {location && location.length > 5 && (
          <div className="rounded-lg overflow-hidden border border-emerald-200 dark:border-emerald-700 h-32 bg-muted">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(location)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        )}

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Contact Person</Label>
            <Input
              value={contactPerson}
              onChange={(e) => setContactPerson(e.target.value)}
              placeholder="Jules"
              className="bg-background"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Contact Phone</Label>
            <Input
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+41..."
              className="bg-background"
            />
          </div>
        </div>

        {/* Meeting Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5" />
            Arrival Instructions
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Jules will be waiting by the blue mailbox. Bring ID and signed contract."
            rows={3}
            className="bg-background text-sm"
          />
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSaveAndNotify}
          disabled={saving || !date}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save & Notify Client
        </Button>
      </div>
    </div>
  );
}
