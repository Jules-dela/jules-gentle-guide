import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  CheckCircle 
} from 'lucide-react';
import type { KeyHandover } from '@/types/portal';
import { useState } from 'react';

interface KeyHandoverInfoProps {
  keyHandover: KeyHandover;
  onConfirm: () => Promise<{ error: Error | null }>;
}

export function KeyHandoverInfo({ keyHandover, onConfirm }: KeyHandoverInfoProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'To be confirmed';
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return 'To be confirmed';
    return timeString.slice(0, 5);
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Key Handover
          </CardTitle>
          {keyHandover.confirmed_by_client && (
            <Badge className="gap-1 bg-green-500">
              <CheckCircle className="w-3 h-3" />
              Confirmed
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-medium">{formatDate(keyHandover.scheduled_date)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-background">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time</p>
              <p className="font-medium">{formatTime(keyHandover.scheduled_time)}</p>
            </div>
          </div>

          {keyHandover.location && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium">{keyHandover.location}</p>
              </div>
            </div>
          )}

          {keyHandover.contact_person && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contact Person</p>
                <p className="font-medium">{keyHandover.contact_person}</p>
              </div>
            </div>
          )}

          {keyHandover.contact_phone && (
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-background">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <a 
                  href={`tel:${keyHandover.contact_phone}`}
                  className="font-medium text-primary hover:underline"
                >
                  {keyHandover.contact_phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {keyHandover.notes && (
          <div className="p-3 rounded-lg bg-background">
            <p className="text-xs text-muted-foreground mb-1">Additional Notes</p>
            <p className="text-sm">{keyHandover.notes}</p>
          </div>
        )}

        {!keyHandover.confirmed_by_client && (
          <Button 
            onClick={handleConfirm} 
            disabled={isConfirming}
            className="w-full gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            {isConfirming ? 'Confirming...' : 'I have seen this information'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
