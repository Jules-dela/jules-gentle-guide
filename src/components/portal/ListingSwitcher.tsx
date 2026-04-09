import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Home } from 'lucide-react';
import type { PropertyProposal, ListingStatus } from '@/types/portal';

interface ListingSwitcherProps {
  listings: PropertyProposal[];
  activeListingId: string | null;
  onSelect: (listing: PropertyProposal) => void;
}

const statusConfig: Record<ListingStatus, { label: string; className: string }> = {
  research: { label: 'Research', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  viewings: { label: 'Viewings', className: 'bg-amber-100 text-amber-700 border-amber-200' },
  documents: { label: 'Documents', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 border-green-200' },
};

export function ListingSwitcher({ listings, activeListingId, onSelect }: ListingSwitcherProps) {
  if (listings.length <= 1) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 mt-4"
    >
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {listings.map((listing) => {
          const isActive = listing.id === activeListingId;
          const config = statusConfig[listing.listing_status];
          const thumbnail = listing.photos?.[0];
          const label = listing.address
            ? listing.address.split(',')[0]
            : listing.neighbourhood || 'Property';

          return (
            <button
              key={listing.id}
              onClick={() => onSelect(listing)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200
                min-w-[200px] max-w-[280px] shrink-0 text-left
                ${isActive
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:border-primary/40 hover:shadow-sm'
                }
              `}
            >
              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Home className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{label}</p>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 mt-1 ${config.className}`}
                >
                  {config.label}
                </Badge>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
