import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, Image, Loader2, Check, ThumbsUp, ThumbsDown, 
  RefreshCw, Plus, Trash2, Eye, Clock, Mail 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminNotifications } from '@/hooks/useNotifications';

interface Proposal {
  id: string;
  neighbourhood: string | null;
  rent: number | null;
  rooms: number | null;
  client_status: string | null;
  rejection_reasons: string[] | null;
  rejection_notes: string | null;
  photos: string[] | null;
  visit_photos: string[] | null;
  visit_pros: string[] | null;
  visit_cons: string[] | null;
  visit_published: boolean | null;
}

interface VisitReportUploaderProps {
  caseId: string;
  onResetToResearch: () => void;
  clientEmail?: string;
  clientName?: string;
}

export function VisitReportUploader({ caseId, onResetToResearch, clientEmail, clientName }: VisitReportUploaderProps) {
  const [likedProposal, setLikedProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notifyClient, setNotifyClient] = useState(false);
  const { createNotification } = useAdminNotifications();
  
  // Visit report form state
  const [visitImages, setVisitImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [pros, setPros] = useState<string[]>(['']);
  const [cons, setCons] = useState<string[]>(['']);

  useEffect(() => {
    fetchLikedProposal();

    // Set up realtime subscription
    const channel = supabase
      .channel(`visit-${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'property_proposals',
          filter: `case_id=eq.${caseId}`,
        },
        () => {
          fetchLikedProposal();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);

  const fetchLikedProposal = async () => {
    try {
      const { data, error } = await supabase
        .from('property_proposals')
        .select('*')
        .eq('case_id', caseId)
        .eq('client_status', 'liked')
        .maybeSingle();

      if (error) throw error;
      
      setLikedProposal(data);
      
      // Load existing visit data if available
      if (data?.visit_pros && data.visit_pros.length > 0) {
        setPros(data.visit_pros);
      }
      if (data?.visit_cons && data.visit_cons.length > 0) {
        setCons(data.visit_cons);
      }
      if (data?.visit_photos && data.visit_photos.length > 0) {
        setImagePreviewUrls(data.visit_photos);
      }
    } catch (err) {
      console.error('Error fetching liked proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = useCallback((files: FileList | null) => {
    if (!files) return;
    const filesArray = Array.from(files);
    const newPreviews = filesArray.map(f => URL.createObjectURL(f));
    setVisitImages(prev => [...prev, ...filesArray]);
    setImagePreviewUrls(prev => [...prev, ...newPreviews]);
  }, []);

  const removeImage = useCallback((index: number) => {
    // Only revoke if it's a blob URL (locally added)
    if (imagePreviewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }
    setVisitImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, [imagePreviewUrls]);

  const addProItem = useCallback(() => {
    setPros(prev => [...prev, '']);
  }, []);

  const removeProItem = useCallback((index: number) => {
    setPros(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateProItem = useCallback((index: number, value: string) => {
    setPros(prev => prev.map((item, i) => i === index ? value : item));
  }, []);

  const addConItem = useCallback(() => {
    setCons(prev => [...prev, '']);
  }, []);

  const removeConItem = useCallback((index: number) => {
    setCons(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateConItem = useCallback((index: number, value: string) => {
    setCons(prev => prev.map((item, i) => i === index ? value : item));
  }, []);

  const handlePublishReport = async () => {
    if (!likedProposal) return;

    // Validate
    const validPros = pros.filter(p => p.trim());
    const validCons = cons.filter(c => c.trim());

    if (validPros.length === 0) {
      toast({
        title: "Missing pros",
        description: "Please add at least one positive observation.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload new images
      const uploadedUrls: string[] = [];
      
      // Keep existing URLs that aren't blob URLs
      for (const url of imagePreviewUrls) {
        if (!url.startsWith('blob:')) {
          uploadedUrls.push(url);
        }
      }

      // Upload new files
      for (const file of visitImages) {
        const fileName = `visits/${caseId}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from('property-photos')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('property-photos')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // Update proposal with visit data
      const { error: updateError } = await supabase
        .from('property_proposals')
        .update({
          visit_photos: uploadedUrls,
          visit_pros: validPros,
          visit_cons: validCons,
          visit_published: true,
        })
        .eq('id', likedProposal.id);

      if (updateError) throw updateError;

      // Create notification for stage 3
      await createNotification(
        caseId,
        3,
        'visit_published',
        { address: likedProposal.neighbourhood },
        notifyClient,
        clientEmail,
        clientName
      );

      toast({
        title: "Visit report published!",
        description: `The client can now see the visit details in their portal.${notifyClient ? ' Email notification sent.' : ''}`,
      });

      setNotifyClient(false);
      // Refresh data
      fetchLikedProposal();
    } catch (error) {
      console.error('Error publishing report:', error);
      toast({
        title: "Error publishing report",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToResearch = async () => {
    if (!likedProposal) return;

    setIsResetting(true);

    try {
      // Delete all proposals for this case
      const { error } = await supabase
        .from('property_proposals')
        .delete()
        .eq('case_id', caseId);

      if (error) throw error;

      // Update case status back to search_in_progress
      const { error: statusError } = await supabase
        .from('cases')
        .update({ status: 'search_in_progress' })
        .eq('id', caseId);

      if (statusError) throw statusError;

      toast({
        title: "Reset to Research",
        description: "The client has been moved back to Stage 2. You can now add new apartments.",
      });

      setLikedProposal(null);
      setPros(['']);
      setCons(['']);
      setVisitImages([]);
      setImagePreviewUrls([]);
      onResetToResearch();
    } catch (error) {
      console.error('Error resetting:', error);
      toast({
        title: "Error",
        description: "Failed to reset. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!likedProposal) {
    return (
      <div className="py-6 text-center border border-dashed rounded-lg">
        <Eye className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">
          No visit scheduled yet
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          A client must like a property first before you can add a visit report
        </p>
      </div>
    );
  }

  // Check if the visit was rejected (client_status changed back to rejected after visit)
  const visitRejected = likedProposal.visit_published && likedProposal.client_status === 'rejected';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visit Report: {likedProposal.neighbourhood || 'Selected Property'}
            </CardTitle>
            {likedProposal.visit_published && (
              <Badge variant="secondary" className="text-xs">
                <Check className="h-3 w-3 mr-1" />
                Published
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {likedProposal.rooms} rooms · CHF {likedProposal.rent?.toLocaleString()}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Visit Decision Status */}
          {likedProposal.visit_published && (
            <div className={`p-3 rounded-lg ${
              visitRejected 
                ? 'bg-red-50 border border-red-200' 
                : likedProposal.client_status === 'liked'
                ? 'bg-green-50 border border-green-200'
                : 'bg-amber-50 border border-amber-200'
            }`}>
              {visitRejected ? (
                <>
                  <div className="flex items-center gap-2 text-red-700 mb-1">
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-sm font-medium">Client rejected visit</span>
                  </div>
                  {likedProposal.rejection_reasons && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {likedProposal.rejection_reasons.map((reason, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                          {reason}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {likedProposal.rejection_notes && (
                    <p className="text-xs text-red-600 mt-2 italic">"{likedProposal.rejection_notes}"</p>
                  )}
                </>
              ) : likedProposal.client_status === 'liked' ? (
                <div className="flex items-center gap-2 text-green-700">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Client approved! Moving to Document Stage.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-amber-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Waiting for client decision...</span>
                </div>
              )}
            </div>
          )}

          {/* Reset button if rejected */}
          {visitRejected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetToResearch}
              disabled={isResetting}
              className="w-full gap-2 text-destructive hover:text-destructive"
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Reset to Research Stage
            </Button>
          )}

          <Separator />

          {/* Visit Image Gallery */}
          <div>
            <Label className="text-sm flex items-center gap-2 mb-2">
              <Image className="h-4 w-4" />
              Visit Photos (6-8 recommended)
            </Label>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {imagePreviewUrls.map((url, index) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative aspect-square rounded-lg overflow-hidden group"
                >
                  <img
                    src={url}
                    alt={`Visit photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </motion.div>
              ))}
              
              {imagePreviewUrls.length < 10 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/30">
                  <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files)}
                  />
                </label>
              )}
            </div>
          </div>

          <Separator />

          {/* Jules' Expert Notes - Pros */}
          <div>
            <Label className="text-sm flex items-center gap-2 mb-3">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              What you'll love
            </Label>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {pros.map((pro, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-green-600 text-sm">•</span>
                    <Input
                      placeholder="e.g., Very quiet neighborhood"
                      value={pro}
                      onChange={(e) => updateProItem(index, e.target.value)}
                      className="flex-1"
                    />
                    {pros.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeProItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="sm"
                onClick={addProItem}
                className="gap-1 text-green-600 hover:text-green-700"
              >
                <Plus className="h-3 w-3" />
                Add point
              </Button>
            </div>
          </div>

          {/* Jules' Expert Notes - Cons */}
          <div>
            <Label className="text-sm flex items-center gap-2 mb-3">
              <ThumbsDown className="h-4 w-4 text-amber-600" />
              Points to consider
            </Label>
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {cons.map((con, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-2"
                  >
                    <span className="text-amber-600 text-sm">•</span>
                    <Input
                      placeholder="e.g., Small elevator"
                      value={con}
                      onChange={(e) => updateConItem(index, e.target.value)}
                      className="flex-1"
                    />
                    {cons.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => removeConItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <Button
                variant="ghost"
                size="sm"
                onClick={addConItem}
                className="gap-1 text-amber-600 hover:text-amber-700"
              >
                <Plus className="h-3 w-3" />
                Add point
              </Button>
            </div>
          </div>

          {/* Notify Client Checkbox */}
          <div className="flex items-center gap-2 px-1">
            <Checkbox
              id="notify-visit"
              checked={notifyClient}
              onCheckedChange={(checked) => setNotifyClient(checked === true)}
              disabled={visitRejected}
            />
            <Label htmlFor="notify-visit" className="text-sm font-normal flex items-center gap-2 cursor-pointer">
              <Mail className="h-4 w-4 text-muted-foreground" />
              Notify Client via Email
            </Label>
          </div>

          {/* Publish Button */}
          <Button
            className="w-full gap-2"
            onClick={handlePublishReport}
            disabled={isSubmitting || visitRejected}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Publishing...
              </>
            ) : likedProposal.visit_published ? (
              <>
                <Check className="h-4 w-4" />
                Update Report
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Publish Report
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
