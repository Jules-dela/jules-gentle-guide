import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, MapPin, Bed, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Apartment {
  id: string;
  images: string[];
  rent: number;
  rooms: number;
  location: string;
  neighborhood: string;
  description: string;
  amenities: string[];
}

interface ApartmentCardProps {
  apartment: Apartment;
  onLike: () => void;
  onDislike: () => void;
}

export function ApartmentCard({ apartment, onLike, onDislike }: ApartmentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === apartment.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? apartment.images.length - 1 : prev - 1
    );
  };

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto bg-white rounded-[40px] shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.9 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Image Carousel */}
      <div className="relative h-64 md:h-80 overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentImageIndex}
            src={apartment.images[currentImageIndex]}
            alt={`Apartment photo ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </AnimatePresence>
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Navigation Arrows */}
        {apartment.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white shadow-lg"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </>
        )}
        
        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
          <span className="text-white text-sm font-medium">
            {currentImageIndex + 1}/{apartment.images.length}
          </span>
        </div>
        
        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {apartment.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentImageIndex 
                  ? 'bg-white w-6' 
                  : 'bg-white/50 hover:bg-white/75'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8">
        {/* Header Info */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-4">
          <div className="flex items-center gap-2">
            <Banknote className="w-5 h-5 text-primary" />
            <span className="text-2xl md:text-3xl font-bold text-foreground">
              {apartment.rent} <span className="text-lg font-normal text-muted-foreground">CHF</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Bed className="w-5 h-5 text-primary" />
            <span className="text-lg font-medium text-foreground">
              {apartment.rooms} rooms
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="text-lg font-medium text-foreground">
              {apartment.neighborhood}, {apartment.location}
            </span>
          </div>
        </div>

        {/* Show More Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors mb-4"
        >
          <span className="text-sm font-medium">
            {expanded ? 'Show Less' : 'Show More'}
          </span>
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {/* Expandable Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {apartment.description}
              </p>
              
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">Amenities</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {apartment.amenities.map((amenity, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {amenity}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sticky Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onDislike}
            className="flex-1 h-12 rounded-full border-2 border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
          >
            I Don't Like
          </Button>
          <Button
            onClick={onLike}
            className="flex-1 h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all"
          >
            I Like
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
