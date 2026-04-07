import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload, Image, Home, MapPin, DollarSign, FileText, Loader2, Check, Mail, Eye, Video, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ApartmentCard } from '@/components/portal/ApartmentCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminNotifications } from '@/hooks/useNotifications';

interface ApartmentDraft {
  id: string;
  images: File[];
  imagePreviewUrls: string[];
  imagePositions: Record<number, number>; // index -> vertical position % (0-100, default 50)
  video: File | null;
  videoPreviewUrl: string | null;
  rent: string;
  rooms: string;
  neighborhood: string;
  description: string;
  isSaved?: boolean;
}

interface ApartmentUploaderProps {
  caseId: string;
  onSave: () => void;
  clientEmail?: string;
  clientName?: string;
}

const MAX_APARTMENTS = 3;

export function ApartmentUploader({ caseId, onSave, clientEmail, clientName }: ApartmentUploaderProps) {
  const [apartments, setApartments] = useState<ApartmentDraft[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [notifyClient, setNotifyClient] = useState(false);
  const [previewApartment, setPreviewApartment] = useState<ApartmentDraft | null>(null);
  const { createNotification } = useAdminNotifications();

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
      imagePositions: {},
      video: null,
      videoPreviewUrl: null,
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

  const moveImage = useCallback((apartmentId: string, fromIndex: number, direction: 'left' | 'right') => {
    setApartments(apartments.map(apt => {
      if (apt.id !== apartmentId) return apt;
      const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= apt.images.length) return apt;
      const newImages = [...apt.images];
      const newPreviews = [...apt.imagePreviewUrls];
      [newImages[fromIndex], newImages[toIndex]] = [newImages[toIndex], newImages[fromIndex]];
      [newPreviews[fromIndex], newPreviews[toIndex]] = [newPreviews[toIndex], newPreviews[fromIndex]];
      return { ...apt, images: newImages, imagePreviewUrls: newPreviews };
    }));
  }, [apartments]);

  const adjustImagePosition = useCallback((apartmentId: string, imageIndex: number, direction: 'up' | 'down') => {
    setApartments(prev => prev.map(apt => {
      if (apt.id !== apartmentId) return apt;
      const current = apt.imagePositions[imageIndex] ?? 50;
      const next = direction === 'up' ? Math.max(0, current - 10) : Math.min(100, current + 10);
      return { ...apt, imagePositions: { ...apt.imagePositions, [imageIndex]: next } };
    }));
  }, []);


  const handleFileChange = useCallback((apartmentId: string, files: FileList | null) => {
    if (!files) return;
    const filesArray = Array.from(files);
    updateApartment(apartmentId, 'images', filesArray);
  }, [updateApartment]);

  const handleVideoChange = useCallback((apartmentId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Video must be under 100MB.", variant: "destructive" });
      return;
    }
    setApartments(prev => prev.map(apt => {
      if (apt.id !== apartmentId) return apt;
      if (apt.videoPreviewUrl) URL.revokeObjectURL(apt.videoPreviewUrl);
      return { ...apt, video: file, videoPreviewUrl: URL.createObjectURL(file) };
    }));
  }, []);

  const removeVideo = useCallback((apartmentId: string) => {
    setApartments(prev => prev.map(apt => {
      if (apt.id !== apartmentId) return apt;
      if (apt.videoPreviewUrl) URL.revokeObjectURL(apt.videoPreviewUrl);
      return { ...apt, video: null, videoPreviewUrl: null };
    }));
  }, []);

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
      if (apt.images.length === 0 && !apt.video) {
        toast({
          title: "Missing media",
          description: "Please add at least one image or a video for each apartment.",
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
        const { data: proposalData, error: insertError } = await supabase
          .from('property_proposals')
          .insert({
            case_id: caseId,
            rent: parseFloat(apt.rent),
            rooms: parseInt(apt.rooms, 10),
            neighbourhood: apt.neighborhood,
            description: apt.description,
            photos: uploadedUrls,
            photo_positions: apt.imagePositions,
            client_status: 'pending',
          })
          .select('id')
          .single();

        if (insertError) throw insertError;

        // Upload video if present
        if (apt.video && proposalData) {
          const videoFileName = `${caseId}/${proposalData.id}/${Date.now()}-${apt.video.name}`;
          const { error: videoUploadError } = await supabase.storage
            .from('visit-videos')
            .upload(videoFileName, apt.video);

          if (videoUploadError) {
            console.error('Video upload error:', videoUploadError);
            toast({ title: "Video upload failed", description: "The listing was saved but the video could not be uploaded.", variant: "destructive" });
          } else {
            const { data: { publicUrl } } = supabase.storage
              .from('visit-videos')
              .getPublicUrl(videoFileName);

            await supabase.from('visit_videos').insert({
              proposal_id: proposalData.id,
              video_url: publicUrl,
              notes: null,
            });
          }
        }
      }

      // Create notification for stage 2
      await createNotification(
        caseId,
        2,
        'new_match',
        { count: apartments.length },
        notifyClient,
        clientEmail,
        clientName
      );

      toast({
        title: "Apartments published!",
        description: `${apartments.length} apartment(s) are now visible in the client's portal.${notifyClient ? ' Email notification sent.' : ''}`,
      });

      // Clear the form
      setApartments([]);
      setExpandedId(null);
      setNotifyClient(false);
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
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={apt.imagePreviewUrls.length === 0 || !apt.rent || !apt.rooms || !apt.neighborhood}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewApartment(apt);
                    }}
                    title="Preview as client"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
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
                </div>
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
                        
                        <div className="grid grid-cols-2 gap-3 mb-2">
                          {apt.imagePreviewUrls.map((url, imgIndex) => (
                            <div key={imgIndex} className="space-y-2">
                              <div className="relative aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                                <img
                                  src={url}
                                  alt={`Preview ${imgIndex + 1}`}
                                  className="w-full h-full object-cover"
                                  style={{ objectPosition: `center ${apt.imagePositions[imgIndex] ?? 50}%` }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(apt.id, imgIndex)}
                                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-background/90 text-foreground flex items-center justify-center shadow-md border border-border"
                                  aria-label="Remove photo"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                                {imgIndex === 0 && (
                                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary text-primary-foreground">Cover</span>
                                )}
                              </div>

                              <div className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-2">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-medium text-foreground">Image position</span>
                                  <span className="text-[11px] text-muted-foreground">{Math.round(apt.imagePositions[imgIndex] ?? 50)}%</span>
                                </div>
                                <Slider
                                  value={[apt.imagePositions[imgIndex] ?? 50]}
                                  min={0}
                                  max={100}
                                  step={1}
                                  onValueChange={(value) => {
                                    const next = value[0] ?? 50;
                                    setApartments(prev => prev.map(current =>
                                      current.id === apt.id
                                        ? {
                                            ...current,
                                            imagePositions: {
                                              ...current.imagePositions,
                                              [imgIndex]: next,
                                            },
                                          }
                                        : current
                                    ));
                                  }}
                                  aria-label={`Adjust vertical position for image ${imgIndex + 1}`}
                                />
                                <p className="text-[11px] text-muted-foreground">Drag to move the crop up or down.</p>
                              </div>

                              {apt.imagePreviewUrls.length > 1 && (
                                <div className="flex items-center justify-center gap-2">
                                  {imgIndex > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => moveImage(apt.id, imgIndex, 'left')}
                                      className="w-8 h-8 rounded-full bg-background text-foreground border border-border shadow-sm flex items-center justify-center"
                                      aria-label="Move image left"
                                    >
                                      <ArrowLeft className="h-4 w-4" />
                                    </button>
                                  )}
                                  {imgIndex < apt.imagePreviewUrls.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => moveImage(apt.id, imgIndex, 'right')}
                                      className="w-8 h-8 rounded-full bg-background text-foreground border border-border shadow-sm flex items-center justify-center"
                                      aria-label="Move image right"
                                    >
                                      <ArrowRight className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              )}
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

                      {/* Video Uploader */}
                      <div>
                        <Label className="text-sm flex items-center gap-2 mb-2">
                          <Video className="h-4 w-4" />
                          Video (optional)
                        </Label>
                        {apt.videoPreviewUrl ? (
                          <div className="relative rounded-lg overflow-hidden bg-muted">
                            <video
                              src={apt.videoPreviewUrl}
                              controls
                              className="w-full max-h-48 object-contain"
                            />
                            <button
                              type="button"
                              onClick={() => removeVideo(apt.id)}
                              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center gap-2 h-20 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors bg-muted/30">
                            <Video className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Upload a video</span>
                            <input
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => handleVideoChange(apt.id, e.target.files)}
                            />
                          </label>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">Max 100MB · MP4, MOV, etc.</p>
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
        <div className="space-y-3">
          {/* Notify Client Checkbox */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              id="notify-research"
              checked={notifyClient}
              onCheckedChange={(checked) => setNotifyClient(checked === true)}
            />
            <Label htmlFor="notify-research" className="text-sm font-normal flex items-center gap-2 cursor-pointer">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Notify Client via Email
            </Label>
          </div>

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
        </div>
      )}

      {/* Client Preview Dialog */}
      <Dialog open={!!previewApartment} onOpenChange={(open) => !open && setPreviewApartment(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-[24px]">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>Client Preview</DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2 max-h-[80vh] overflow-y-auto">
            {previewApartment && (
              <ApartmentCard
                apartment={{
                  id: previewApartment.id,
                  images: previewApartment.imagePreviewUrls,
                  rent: parseFloat(previewApartment.rent) || 0,
                  rooms: parseFloat(previewApartment.rooms) || 0,
                  location: '',
                  neighborhood: previewApartment.neighborhood || 'Unknown',
                  description: previewApartment.description || '',
                  amenities: [],
                }}
                onLike={() => {}}
                onDislike={() => {}}
                readOnly
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
