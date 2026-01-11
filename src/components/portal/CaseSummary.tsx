import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { InitialCriteria } from '@/types/portal';
import { 
  MapPin, 
  Wallet, 
  Bed, 
  Calendar, 
  Home, 
  Users, 
  Sofa, 
  Train, 
  PawPrint, 
  Cigarette 
} from 'lucide-react';

interface CaseSummaryProps {
  criteria: InitialCriteria;
  createdAt: string;
}

export function CaseSummary({ criteria, createdAt }: CaseSummaryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Home className="w-5 h-5 text-primary" />
          Your Search Criteria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Request submitted on {formatDate(createdAt)}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Neighbourhood</p>
              <p className="text-sm font-medium capitalize">
                {criteria.neighbourhood.replace('-', ' ') || 'No preference'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Budget</p>
              <p className="text-sm font-medium">{criteria.budget} CHF/month</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Bed className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Rooms</p>
              <p className="text-sm font-medium">{criteria.rooms} room(s)</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{criteria.duration} months</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Home className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium capitalize">{criteria.property_type}</p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground">Roommates</p>
              <p className="text-sm font-medium">
                {criteria.roommate_preference === '0' 
                  ? 'No roommates' 
                  : `${criteria.roommate_preference} roommate(s)`}
              </p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {criteria.furnished && (
            <Badge variant="secondary" className="gap-1">
              <Sofa className="w-3 h-3" />
              Furnished
            </Badge>
          )}
          {criteria.near_transport && (
            <Badge variant="secondary" className="gap-1">
              <Train className="w-3 h-3" />
              Near transport
            </Badge>
          )}
          {criteria.pets_allowed && (
            <Badge variant="secondary" className="gap-1">
              <PawPrint className="w-3 h-3" />
              Pets allowed
            </Badge>
          )}
          {!criteria.smoking_allowed && (
            <Badge variant="secondary" className="gap-1">
              <Cigarette className="w-3 h-3" />
              No smoking
            </Badge>
          )}
        </div>

        {criteria.notes && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Additional notes</p>
            <p className="text-sm">{criteria.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
