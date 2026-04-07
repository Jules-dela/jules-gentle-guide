import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  MapPin, 
  Wallet, 
  Maximize2, 
  Bed, 
  ThumbsUp, 
  ThumbsDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyProposal } from '@/types/portal';
import { REJECTION_REASONS } from '@/types/portal';

interface ProposalCardProps {
  proposal: PropertyProposal;
  onFeedback: (
    proposalId: string,
    status: 'liked' | 'rejected',
    rejectionReasons?: string[],
    rejectionNotes?: string
  ) => Promise<{ error: Error | null }>;
}

export function ProposalCard({ proposal, onFeedback }: ProposalCardProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherNotes, setOtherNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const photos = proposal.photos?.length > 0 
    ? proposal.photos 
    : ['/placeholder.svg'];

  const handleLike = async () => {
    setIsSubmitting(true);
    await onFeedback(proposal.id, 'liked');
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    setIsSubmitting(true);
    await onFeedback(
      proposal.id, 
      'rejected', 
      selectedReasons,
      otherNotes || undefined
    );
    setIsSubmitting(false);
    setShowRejectDialog(false);
    setSelectedReasons([]);
    setOtherNotes('');
  };

  const toggleReason = (reason: string) => {
    setSelectedReasons(prev => 
      prev.includes(reason) 
        ? prev.filter(r => r !== reason)
        : [...prev, reason]
    );
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev < photos.length - 1 ? prev + 1 : 0
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev > 0 ? prev - 1 : photos.length - 1
    );
  };

  return (
    <>
      <Card className={cn(
        'overflow-hidden transition-all',
        proposal.client_status === 'liked' && 'ring-2 ring-green-500',
        proposal.client_status === 'rejected' && 'opacity-60'
      )}>
        {/* Photo carousel */}
        <div className="relative aspect-video bg-muted">
          <img 
            src={photos[currentPhotoIndex]}
            alt={`Property photo ${currentPhotoIndex + 1}`}
            className="w-full h-full object-cover"
            style={{ objectPosition: `center ${(proposal.photo_positions as any)?.[currentPhotoIndex] ?? 50}%` }}
          />
          
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-background/80 hover:bg-background"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                {photos.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      'w-1.5 h-1.5 rounded-full transition-all',
                      i === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    )}
                  />
                ))}
              </div>
            </>
          )}

          {/* Status badge */}
          {proposal.client_status !== 'pending' && (
            <div className={cn(
              'absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded text-xs font-medium',
              proposal.client_status === 'liked' && 'bg-green-500 text-white',
              proposal.client_status === 'rejected' && 'bg-destructive text-destructive-foreground'
            )}>
              {proposal.client_status === 'liked' ? (
                <>
                  <Check className="w-3 h-3" />
                  Interested
                </>
              ) : (
                <>
                  <X className="w-3 h-3" />
                  Declined
                </>
              )}
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          {proposal.neighbourhood && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              {proposal.neighbourhood}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Property details */}
          <div className="flex flex-wrap gap-4 text-sm">
            {proposal.rent && (
              <div className="flex items-center gap-1">
                <Wallet className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">CHF {proposal.rent}</span>
                {proposal.charges && (
                  <span className="text-muted-foreground">+ {proposal.charges}</span>
                )}
              </div>
            )}
            {proposal.size_sqm && (
              <div className="flex items-center gap-1">
                <Maximize2 className="w-4 h-4 text-muted-foreground" />
                <span>{proposal.size_sqm} m²</span>
              </div>
            )}
            {proposal.rooms && (
              <div className="flex items-center gap-1">
                <Bed className="w-4 h-4 text-muted-foreground" />
                <span>{proposal.rooms} room(s)</span>
              </div>
            )}
          </div>

          {/* Tags */}
          {proposal.tags && proposal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {proposal.tags.map((tag, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {proposal.description && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {proposal.description}
            </p>
          )}
        </CardContent>

        {proposal.client_status === 'pending' && (
          <CardFooter className="gap-2 pt-0">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={() => setShowRejectDialog(true)}
              disabled={isSubmitting}
            >
              <ThumbsDown className="w-4 h-4" />
              Not for me
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={handleLike}
              disabled={isSubmitting}
            >
              <ThumbsUp className="w-4 h-4" />
              I like it
            </Button>
          </CardFooter>
        )}

        {proposal.client_status === 'rejected' && proposal.rejection_reasons?.length > 0 && (
          <CardFooter className="pt-0">
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Reasons: </span>
              {proposal.rejection_reasons.map(r => 
                REJECTION_REASONS.find(rr => rr.value === r)?.label || r
              ).join(', ')}
            </div>
          </CardFooter>
        )}
      </Card>

      {/* Rejection dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why isn't this property right for you?</DialogTitle>
            <DialogDescription>
              Your feedback helps us find better matches.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {REJECTION_REASONS.map((reason) => (
              <div key={reason.value} className="flex items-center space-x-3">
                <Checkbox
                  id={reason.value}
                  checked={selectedReasons.includes(reason.value)}
                  onCheckedChange={() => toggleReason(reason.value)}
                />
                <label
                  htmlFor={reason.value}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {reason.label}
                </label>
              </div>
            ))}

            {selectedReasons.includes('other') && (
              <Textarea
                placeholder="Please tell us more..."
                value={otherNotes}
                onChange={(e) => setOtherNotes(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleReject}
              disabled={isSubmitting || selectedReasons.length === 0}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
