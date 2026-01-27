import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload, Image, Home, MapPin, DollarSign, FileText, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ApartmentDraft {
  id: string;
  images: File[];
  imagePreviewUrls: string[];
  rent: string;
  rooms: string;
  neighborhood: string;
  description: string;
  isSaved?: boolean;
}

interface ApartmentUploaderProps {
  caseId: string;
  onSave: () => void;
}

const MAX_APARTMENTS = 3;

export function ApartmentUploader({ caseId, onSave }: ApartmentUploaderProps) {
  const [apartments, setApartments] = useState<ApartmentDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addApartment = useCallback(() => {
    if (apartments.length >= MAX_APARTMENTS) {
      toast({
        title: "Maximum reached",
        description: "You can only add up to 3 apartments at a time.",
        variant: "destructive",
      });
      return;
    }

    const newApartment: ApartmentDraft = {
      id: `draft-${Date.now()}`,
      images: [],
      imagePreviewUrls: [],
      rent: '',
      rooms: '',
      neighborhood: '',
      description: '',
    };
    setApartments([...apartments, newApartment]);
    setExpandedId(newApartment.id);
  }, [apartments]);

  const removeApartment = useCallback((id: string) => {
    setApartments(apartments.filter(a => a.id !== id));
    if (expandedId === id) {
      setExpandedId(null);
    }
  }, [apartments, expandedId]);

  const updateApartment = useCallback((id: string, field: keyof ApartmentDraft, value: string | File[]) => {
    setApartments(apartments.map(apt => {
      if (apt.id !== id) return apt;
      
      if (field === 'images' && Array.isArray(value)) {
        const newImages = [...apt.images, ...(value as File[])];
        const newPreviews = [...apt.imagePreviewUrls, ...(value as File[]).map(f => URL.createObjectURL(f))];
        return { ...apt, images: newImages, imagePreviewUrls: newPreviews };
      }
      
      return { ...apt, [field]: value };
    }));
  }, [apartments]);

  const removeImage = useCallback((apartmentId: string, imageIndex: number) => {
    setApartments(apartments.map(apt => {
      if (apt.id !== apartmentId) return apt;
      
      const newImages = [...apt.images];
      const newPreviews = [...apt.imagePreviewUrls];
      
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(newPreviews[imageIndex]);
      
      newImages.splice(imageIndex, 1);
      newPreviews.splice(imageIndex, 1);
      
      return { ...apt, images: newImages, imagePreviewUrls: newPreviews };
    }));
  }, [apartments]);

  const handleFileChange = useCallback((apartmentId: string, files: FileList | null) => {
    if (!files) return;
    const filesArray = Array.from(files);
    updateApartment(apartmentId, 'images', filesArray);
  }, [updateApartment]);

  const handleSubmitAll = useCallback(async () => {
    // Validate all apartments
    for (const apt of apartments) {
      if (!apt.rent || !apt.rooms || !apt.neighborhood) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields for each apartment.",
          variant: "destructive",
        });
        return;
      }
      if (apt.images.length === 0) {
        toast({
          title: "Missing images",
          description: "Please add at least one image for each apartment.",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      for (const apt of apartments) {
        // Upload images to storage
        const uploadedUrls: string[] = [];
        
        for (const file of apt.images) {
          const fileName = `${caseId}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from('property-photos')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('property-photos')
            .getPublicUrl(fileName);

          uploadedUrls.push(publicUrl);
        }

        // Create property proposal
        const { error: insertError } = await supabase
          .from('property_proposals')
          .insert({
            case_id: caseId,
            rent: parseFloat(apt.rent),
            rooms: parseInt(apt.rooms, 10),
            neighbourhood: apt.neighborhood,
            description: apt.description,
            photos: uploadedUrls,
            client_status: 'pending',
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Apartments published!",
        description: `${apartments.length} apartment(s) are now visible in the client's portal.`,
      });

      // Clear the form
      setApartments([]);
      setExpandedId(null);
      onSave();
    } catch (error) {
      console.error('Error saving apartments:', error);
      toast({
        title: "Error saving apartments",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [apartments, caseId, onSave]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Current Research Matches</h4>
          <p className="text-xs text-muted-foreground">
            Add up to {MAX_APARTMENTS} apartments for the client to review
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addApartment}
          disabled={apartments.length >= MAX_APARTMENTS}
          className="gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Add Apartment
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {apartments.map((apt, index) => (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden">
              <button
                type="button"
                className="w-full px-4 py-3 flex items-center justify-between bg-muted/50 hover:bg-muted/80 transition-colors"
                onClick={() => setExpandedId(expandedId === apt.id ? null : apt.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">
                    {apt.neighborhood || 'New Apartment'}
                    {apt.rent && ` · CHF ${apt.rent}`}
                  </span>
                  {apt.isSaved && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeApartment(apt.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </button>

              <AnimatePresence>
                {expandedId === apt.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <CardContent className="pt-4 space-y-4">
                      {/* Image Uploader */}
                      <div>
                        <Label className="text-sm flex items-center gap-2 mb-2">
                          <Image className="h-4 w-4" />
                          Photos
                        </Label>
                        
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          {apt.imagePreviewUrls.map((url, imgIndex) => (
                            <div key={imgIndex} className="relative aspect-square rounded-lg overflow-hidden group">
                              <img
                                src={url}
                                alt={`Preview ${imgIndex + 1}`}
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(apt.id, imgIndex)}
                                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                          
                          {apt.images.length < 6 && (
                            <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/30">
                              <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                              <span className="text-xs text-muted-foreground">Add</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handleFileChange(apt.id, e.target.files)}
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Price and Rooms */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-sm flex items-center gap-2 mb-2">
                            <DollarSign className="h-4 w-4" />
                            Rent (CHF)
                          </Label>
                          <Input
                            type="number"
                            placeholder="1800"
                            value={apt.rent}
                            onChange={(e) => updateApartment(apt.id, 'rent', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-sm flex items-center gap-2 mb-2">
                            <Home className="h-4 w-4" />
                            Rooms
                          </Label>
                          <Input
                            type="number"
                            placeholder="2.5"
                            value={apt.rooms}
                            onChange={(e) => updateApartment(apt.id, 'rooms', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <Label className="text-sm flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4" />
                          Neighborhood
                        </Label>
                        <Input
                          placeholder="e.g., Sous-Gare, Lausanne"
                          value={apt.neighborhood}
                          onChange={(e) => updateApartment(apt.id, 'neighborhood', e.target.value)}
                        />
                      </div>

                      {/* Description */}
                      <div>
                        <Label className="text-sm flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4" />
                          Description
                        </Label>
                        <Textarea
                          placeholder="Add details that will appear in the 'Show More' section..."
                          rows={3}
                          value={apt.description}
                          onChange={(e) => updateApartment(apt.id, 'description', e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      {apartments.length === 0 && (
        <div className="py-8 text-center border border-dashed rounded-lg">
          <Home className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">
            No apartments added yet
          </p>
          <Button variant="link" size="sm" onClick={addApartment} className="mt-1">
            Add your first apartment
          </Button>
        </div>
      )}

      {apartments.length > 0 && (
        <Button
          className="w-full gap-2"
          onClick={handleSubmitAll}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Push to Client Portal
            </>
          )}
        </Button>
      )}
    </div>
  );
}
