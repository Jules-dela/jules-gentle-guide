import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, Image, Loader2, Check, ThumbsUp, ThumbsDown, 
  RefreshCw, Plus, Trash2, Eye, Clock, Mail, MessageSquare,
  ArrowLeft, ArrowRight, Pencil, Save, AlertCircle, ChevronLeft, ChevronRight,
  Video
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAdminNotifications } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface Proposal {
  id: string;
  neighbourhood: string | null;
  rent: number | null;
  rooms: number | null;
  client_status: string | null;
  rejection_reasons: string[] | null;
  rejection_notes: string | null;
  photos: string[] | null;
  description: string | null;
  visit_photos: string[] | null;
  visit_pros: string[] | null;
  visit_cons: string[] | null;
  visit_published: boolean | null;
  client_visit_questions: string | null;
}

interface VisitReportUploaderProps {
  caseId: string;
  onResetToResearch: () => void;
  clientEmail?: string;
  clientName?: string;
}

export function VisitReportUploader({ caseId, onResetToResearch, clientEmail, clientName }: VisitReportUploaderProps) {
  const [likedProposals, setLikedProposals] = useState<Proposal[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [notifyClient, setNotifyClient] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewLightboxIndex, setPreviewLightboxIndex] = useState<number | null>(null);
  const { createNotification } = useAdminNotifications();
  
  // Visit report form state
  const [visitImages, setVisitImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [pros, setPros] = useState<string[]>(['']);
  const [cons, setCons] = useState<string[]>(['']);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);
  
  // Video state
  const [visitVideoFile, setVisitVideoFile] = useState<File | null>(null);
  const [visitVideoUrl, setVisitVideoUrl] = useState<string | null>(null);
  const [existingVideoId, setExistingVideoId] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);

  const selectedProposal = likedProposals.find(p => p.id === selectedProposalId) || null;

  useEffect(() => {
    fetchLikedProposals();

    const channel = supabase
      .channel(`visit-${caseId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'property_proposals', filter: `case_id=eq.${caseId}` },
        () => { fetchLikedProposals(); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [caseId]);

  const fetchLikedProposals = async () => {
    try {
      const { data, error } = await supabase
        .from('property_proposals')
        .select('*')
        .eq('case_id', caseId)
        .eq('client_status', 'liked')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const proposals = data || [];
      setLikedProposals(proposals);
      
      // Auto-select first if none selected
      if (proposals.length > 0 && !selectedProposalId) {
        selectProposal(proposals[0]);
      }
    } catch (err) {
      console.error('Error fetching liked proposals:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProposal = (proposal: Proposal) => {
    setSelectedProposalId(proposal.id);
    // Load existing visit data
    setPros(proposal.visit_pros && proposal.visit_pros.length > 0 ? proposal.visit_pros : ['']);
    setCons(proposal.visit_cons && proposal.visit_cons.length > 0 ? proposal.visit_cons : ['']);
    setImagePreviewUrls(proposal.visit_photos && proposal.visit_photos.length > 0 ? proposal.visit_photos : []);
    setVisitImages([]);
    setVisitVideoFile(null);
    fetchVideoForProposal(proposal.id);
  };

  const fetchVideoForProposal = async (proposalId: string) => {
    try {
      const { data, error } = await supabase
        .from('visit_videos')
        .select('*')
        .eq('proposal_id', proposalId)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) {
        setVisitVideoUrl(data.video_url);
        setExistingVideoId(data.id);
      } else {
        setVisitVideoUrl(null);
        setExistingVideoId(null);
      }
    } catch (err) {
      console.error('Error fetching visit video:', err);
      setVisitVideoUrl(null);
      setExistingVideoId(null);
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
    if (imagePreviewUrls[index].startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrls[index]);
    }
    setVisitImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  }, [imagePreviewUrls]);

  const moveVisitImage = useCallback((fromIndex: number, direction: 'left' | 'right') => {
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= imagePreviewUrls.length) return;
    setImagePreviewUrls(prev => {
      const arr = [...prev];
      [arr[fromIndex], arr[toIndex]] = [arr[toIndex], arr[fromIndex]];
      return arr;
    });
    setVisitImages(prev => {
      const arr = [...prev];
      if (fromIndex < arr.length && toIndex < arr.length) {
        [arr[fromIndex], arr[toIndex]] = [arr[toIndex], arr[fromIndex]];
      }
      return arr;
    });
  }, [imagePreviewUrls]);

  const saveProposalDescription = async () => {
    if (!selectedProposal) return;
    setSavingDescription(true);
    try {
      const { error } = await supabase.from('property_proposals').update({ description: editDescription }).eq('id', selectedProposal.id);
      if (error) throw error;
      toast({ title: 'Description updated' });
      setEditingDescription(false);
      fetchLikedProposals();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to update.', variant: 'destructive' });
    } finally {
      setSavingDescription(false);
    }
  };

  const addProItem = useCallback(() => setPros(prev => [...prev, '']), []);
  const removeProItem = useCallback((index: number) => setPros(prev => prev.filter((_, i) => i !== index)), []);
  const updateProItem = useCallback((index: number, value: string) => setPros(prev => prev.map((item, i) => i === index ? value : item)), []);

  const handleVideoFileChange = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Video must be under 100MB.', variant: 'destructive' });
      return;
    }
    setVisitVideoFile(file);
    setVisitVideoUrl(URL.createObjectURL(file));
  }, []);

  const removeVideo = useCallback(async () => {
    if (existingVideoId) {
      try {
        await supabase.from('visit_videos').delete().eq('id', existingVideoId);
      } catch (err) {
        console.error('Error deleting video:', err);
      }
    }
    setVisitVideoFile(null);
    setVisitVideoUrl(null);
    setExistingVideoId(null);
  }, [existingVideoId]);
  const addConItem = useCallback(() => setCons(prev => [...prev, '']), []);
  const removeConItem = useCallback((index: number) => setCons(prev => prev.filter((_, i) => i !== index)), []);
  const updateConItem = useCallback((index: number, value: string) => setCons(prev => prev.map((item, i) => i === index ? value : item)), []);

  const handlePublishReport = async () => {
    if (!selectedProposal) return;

    const validPros = pros.filter(p => p.trim());
    const validCons = cons.filter(c => c.trim());

    if (validPros.length === 0) {
      toast({ title: "Missing pros", description: "Please add at least one positive observation.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const uploadedUrls: string[] = [];
      
      for (const url of imagePreviewUrls) {
        if (!url.startsWith('blob:')) uploadedUrls.push(url);
      }

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

      const { error: updateError } = await supabase
        .from('property_proposals')
        .update({
          visit_photos: uploadedUrls,
          visit_pros: validPros,
          visit_cons: validCons,
          visit_published: true,
        })
        .eq('id', selectedProposal.id);

      if (updateError) throw updateError;

      // Upload video if a new file was selected
      if (visitVideoFile && selectedProposal) {
        setVideoUploading(true);
        const videoFileName = `visits/${caseId}/${Date.now()}-${visitVideoFile.name}`;
        const { error: videoUploadError } = await supabase.storage
          .from('visit-videos')
          .upload(videoFileName, visitVideoFile);
        if (videoUploadError) throw videoUploadError;

        const { data: { publicUrl: videoPublicUrl } } = supabase.storage
          .from('visit-videos')
          .getPublicUrl(videoFileName);

        // Upsert: delete old then insert new
        if (existingVideoId) {
          await supabase.from('visit_videos').delete().eq('id', existingVideoId);
        }
        const { error: videoInsertError } = await supabase
          .from('visit_videos')
          .insert({ proposal_id: selectedProposal.id, video_url: videoPublicUrl });
        if (videoInsertError) throw videoInsertError;

        setExistingVideoId(null);
        setVisitVideoFile(null);
        setVideoUploading(false);
      }

      // Auto-advance case status to visit_in_progress if still at proposals_available
      const { data: currentCase } = await supabase
        .from('cases')
        .select('status')
        .eq('id', caseId)
        .single();
      
      if (currentCase && currentCase.status === 'proposals_available') {
        await supabase
          .from('cases')
          .update({ status: 'visit_in_progress', updated_at: new Date().toISOString() })
          .eq('id', caseId);
      }

      await createNotification(caseId, 3, 'visit_published', { address: selectedProposal.neighbourhood }, notifyClient, clientEmail, clientName);

      toast({
        title: "Visit report published!",
        description: `The client can now see the visit details.${notifyClient ? ' Email notification sent.' : ''}`,
      });

      setNotifyClient(false);
      fetchLikedProposals();
    } catch (error) {
      console.error('Error publishing report:', error);
      toast({ title: "Error publishing report", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToResearch = async () => {
    setIsResetting(true);
    try {
      const { error } = await supabase
        .from('property_proposals')
        .delete()
        .eq('case_id', caseId);
      if (error) throw error;

      const { error: statusError } = await supabase
        .from('cases')
        .update({ status: 'search_in_progress' })
        .eq('id', caseId);
      if (statusError) throw statusError;

      toast({ title: "Reset to Research", description: "The client has been moved back to Stage 2." });
      setLikedProposals([]);
      setSelectedProposalId(null);
      setPros(['']);
      setCons(['']);
      setVisitImages([]);
      setImagePreviewUrls([]);
      onResetToResearch();
    } catch (error) {
      console.error('Error resetting:', error);
      toast({ title: "Error", description: "Failed to reset. Please try again.", variant: "destructive" });
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

  if (likedProposals.length === 0) {
    return (
      <div className="py-6 text-center border border-dashed rounded-lg">
        <Eye className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
        <p className="text-sm text-muted-foreground">No visit scheduled yet</p>
        <p className="text-xs text-muted-foreground mt-1">A client must like a property first before you can add a visit report</p>
      </div>
    );
  }

  const visitRejected = selectedProposal?.visit_published && selectedProposal?.client_status === 'rejected';

  return (
    <div className="space-y-4">
      {/* Proposal Selector — only show if multiple liked */}
      {likedProposals.length > 1 && (
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Select a liked property ({likedProposals.length} total)</Label>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {likedProposals.map((p) => (
              <button
                key={p.id}
                onClick={() => selectProposal(p)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border text-left shrink-0 transition-all text-sm',
                  p.id === selectedProposalId
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                    : 'border-muted hover:border-primary/30'
                )}
              >
                {p.photos?.[0] && (
                  <img src={p.photos[0]} alt="" className="w-8 h-8 rounded object-cover" />
                )}
                <div>
                  <span className="font-medium text-xs">{p.neighbourhood || 'Unknown'}</span>
                  <span className="text-xs text-muted-foreground block">{p.rooms}r · CHF {p.rent?.toLocaleString()}</span>
                </div>
                {p.visit_published && (
                  <Check className="h-3.5 w-3.5 text-green-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedProposal && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Visit Report: {selectedProposal.neighbourhood || 'Selected Property'}
              </CardTitle>
              {selectedProposal.visit_published && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Published
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedProposal.rooms} rooms · CHF {selectedProposal.rent?.toLocaleString()}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Client Briefing */}
            <div className={`rounded-xl p-4 ${
              selectedProposal.client_visit_questions 
                ? 'bg-amber-50 border-2 border-amber-200 shadow-sm' 
                : 'border border-dashed border-muted-foreground/30 bg-muted/20'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedProposal.client_visit_questions ? 'bg-amber-100' : 'bg-muted'
                }`}>
                  <MessageSquare className={`h-5 w-5 ${
                    selectedProposal.client_visit_questions ? 'text-amber-600' : 'text-muted-foreground/50'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold mb-1 ${
                    selectedProposal.client_visit_questions ? 'text-amber-800' : 'text-muted-foreground'
                  }`}>
                    📋 Client Briefing for Visit
                  </h4>
                  {selectedProposal.client_visit_questions ? (
                    <p className="text-sm text-amber-900 whitespace-pre-wrap break-words leading-relaxed">
                      "{selectedProposal.client_visit_questions}"
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No specific questions provided for this visit.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Edit Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Listing Description</h4>
                {!editingDescription ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 text-xs"
                    onClick={() => { setEditDescription(selectedProposal.description || ''); setEditingDescription(true); }}
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setEditingDescription(false)}>Cancel</Button>
                    <Button size="sm" className="h-6 gap-1 text-xs" onClick={saveProposalDescription} disabled={savingDescription}>
                      {savingDescription ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
                    </Button>
                  </div>
                )}
              </div>
              {editingDescription ? (
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} className="text-sm" placeholder="Edit description..." />
              ) : (
                <p className="text-sm text-foreground whitespace-pre-wrap">{selectedProposal.description || <span className="italic text-muted-foreground">No description</span>}</p>
              )}
            </div>

            <Separator />

            {/* Visit Decision Status */}
            {selectedProposal.visit_published && (
              <div className={`p-3 rounded-lg ${
                visitRejected 
                  ? 'bg-red-50 border border-red-200' 
                  : selectedProposal.client_status === 'liked'
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-amber-50 border border-amber-200'
              }`}>
                {visitRejected ? (
                  <>
                    <div className="flex items-center gap-2 text-red-700 mb-1">
                      <ThumbsDown className="h-4 w-4" />
                      <span className="text-sm font-medium">Client rejected visit</span>
                    </div>
                    {selectedProposal.rejection_reasons && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {selectedProposal.rejection_reasons.map((reason, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">{reason}</Badge>
                        ))}
                      </div>
                    )}
                    {selectedProposal.rejection_notes && (
                      <p className="text-xs text-red-600 mt-2 italic">"{selectedProposal.rejection_notes}"</p>
                    )}
                  </>
                ) : selectedProposal.client_status === 'liked' ? (
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

            {visitRejected && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetToResearch}
                disabled={isResetting}
                className="w-full gap-2 text-destructive hover:text-destructive"
              >
                {isResetting ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Reset to Research Stage
              </Button>
            )}

            <Separator />

            {/* Visit Photos */}
            <div>
              <Label className="text-sm flex items-center gap-2 mb-2">
                <Image className="h-4 w-4" />
                Visit Photos (6-8 recommended)
              </Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {imagePreviewUrls.map((url, index) => (
                  <motion.div
                    key={`${url}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative aspect-square rounded-lg overflow-hidden group"
                  >
                    <img src={url} alt={`Visit photo ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    {imagePreviewUrls.length > 1 && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {index > 0 && (
                          <button type="button" onClick={() => moveVisitImage(index, 'left')} className="w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90">
                            <ArrowLeft className="h-3 w-3" />
                          </button>
                        )}
                        {index < imagePreviewUrls.length - 1 && (
                          <button type="button" onClick={() => moveVisitImage(index, 'right')} className="w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90">
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                    {index === 0 && <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary text-primary-foreground">Cover</span>}
                  </motion.div>
                ))}
                {imagePreviewUrls.length < 10 && (
                  <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center cursor-pointer transition-colors bg-muted/30">
                    <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                    <span className="text-xs text-muted-foreground">Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFileChange(e.target.files)} />
                  </label>
                )}
              </div>
            </div>

            {/* Visit Video */}
            <div>
              <Label className="text-sm flex items-center gap-2 mb-2">
                <Video className="h-4 w-4" />
                Visit Video (optional, max 100MB)
              </Label>
              {visitVideoUrl ? (
                <div className="relative rounded-lg overflow-hidden bg-muted">
                  <video
                    src={visitVideoUrl}
                    controls
                    className="w-full max-h-64 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeVideo}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-28 rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 cursor-pointer transition-colors bg-muted/30">
                  <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-xs text-muted-foreground">Upload video</span>
                  <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoFileChange(e.target.files)} />
                </label>
              )}
              {videoUploading && (
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading video...
                </div>
              )}
            </div>

            <Separator />

            {/* Pros */}
            <div>
              <Label className="text-sm flex items-center gap-2 mb-3">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                What you'll love
              </Label>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {pros.map((pro, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-2">
                      <span className="text-green-600 text-sm">•</span>
                      <Input placeholder="e.g., Very quiet neighborhood" value={pro} onChange={(e) => updateProItem(index, e.target.value)} className="flex-1" />
                      {pros.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeProItem(index)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <Button variant="ghost" size="sm" onClick={addProItem} className="gap-1 text-green-600 hover:text-green-700">
                  <Plus className="h-3 w-3" /> Add point
                </Button>
              </div>
            </div>

            {/* Cons */}
            <div>
              <Label className="text-sm flex items-center gap-2 mb-3">
                <ThumbsDown className="h-4 w-4 text-amber-600" />
                Points to consider
              </Label>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {cons.map((con, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="flex items-center gap-2">
                      <span className="text-amber-600 text-sm">•</span>
                      <Input placeholder="e.g., Small elevator" value={con} onChange={(e) => updateConItem(index, e.target.value)} className="flex-1" />
                      {cons.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => removeConItem(index)}>
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <Button variant="ghost" size="sm" onClick={addConItem} className="gap-1 text-amber-600 hover:text-amber-700">
                  <Plus className="h-3 w-3" /> Add point
                </Button>
              </div>
            </div>

            {/* Notify */}
            <div className="flex items-center gap-2 px-1">
              <Checkbox id="notify-visit" checked={notifyClient} onCheckedChange={(checked) => setNotifyClient(checked === true)} disabled={!!visitRejected} />
              <Label htmlFor="notify-visit" className="text-sm font-normal flex items-center gap-2 cursor-pointer">
                <Mail className="h-4 w-4 text-muted-foreground" /> Notify Client via Email
              </Label>
            </div>

            {/* Preview & Publish */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => setShowPreview(true)}
                disabled={imagePreviewUrls.length === 0 && pros.filter(p => p.trim()).length === 0}
              >
                <Eye className="h-4 w-4" /> Preview
              </Button>
              <Button className="flex-1 gap-2" onClick={handlePublishReport} disabled={isSubmitting || !!visitRejected}>
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Publishing...</>
                ) : selectedProposal.visit_published ? (
                  <><Check className="h-4 w-4" /> Update Report</>
                ) : (
                  <><Upload className="h-4 w-4" /> Publish Report</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="text-center text-lg">Client Preview</DialogTitle>
            <p className="text-center text-sm text-muted-foreground">This is how the visit report looks to the client</p>
          </DialogHeader>
          
          <div className="p-6 space-y-6">
            {/* Apartment Recap */}
            {selectedProposal && (
              <div className="bg-muted/30 rounded-2xl p-4 flex items-center gap-4">
                {selectedProposal.photos?.[0] && (
                  <img src={selectedProposal.photos[0]} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                )}
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Property Visited</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">CHF {selectedProposal.rent?.toLocaleString()}</span>
                    <span>{selectedProposal.neighbourhood} · {selectedProposal.rooms} rooms</span>
                  </div>
                </div>
              </div>
            )}

            {/* Photo Gallery */}
            {imagePreviewUrls.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Visit Photos</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {imagePreviewUrls.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setPreviewLightboxIndex(index)}
                      className="relative aspect-[4/3] rounded-2xl overflow-hidden group focus:outline-none"
                    >
                      <img src={url} alt={`Visit photo ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Visit Video Preview */}
            {visitVideoUrl && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Visit Video</h3>
                <video src={visitVideoUrl} controls className="w-full rounded-2xl max-h-72" />
              </div>
            )}

            {/* Pros & Cons */}
            {(pros.some(p => p.trim()) || cons.some(c => c.trim())) && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Notes from Jules</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {pros.filter(p => p.trim()).length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        What We Loved
                      </h4>
                      <ul className="space-y-2">
                        {pros.filter(p => p.trim()).map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-primary mt-0.5">✓</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {cons.filter(c => c.trim()).length > 0 && (
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-medium text-destructive mb-3">
                        <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                          <AlertCircle className="w-3.5 h-3.5" />
                        </div>
                        Things to Consider
                      </h4>
                      <ul className="space-y-2">
                        {cons.filter(c => c.trim()).map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="text-destructive mt-0.5">✗</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mock action buttons (disabled) */}
            <div className="flex gap-4 opacity-50 pointer-events-none">
              <Button variant="outline" className="flex-1 h-14 rounded-full">I Don't Like</Button>
              <Button className="flex-1 h-14 rounded-full">I Like – Let's Apply!</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Lightbox */}
      <AnimatePresence>
        {previewLightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
            onClick={() => setPreviewLightboxIndex(null)}
          >
            <button onClick={() => setPreviewLightboxIndex(null)} className="absolute top-4 right-4 text-white/80 hover:text-white z-10">
              <X className="h-6 w-6" />
            </button>
            {imagePreviewUrls.length > 1 && (
              <>
                <button onClick={(e) => { e.stopPropagation(); setPreviewLightboxIndex((previewLightboxIndex - 1 + imagePreviewUrls.length) % imagePreviewUrls.length); }} className="absolute left-4 text-white/80 hover:text-white z-10">
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); setPreviewLightboxIndex((previewLightboxIndex + 1) % imagePreviewUrls.length); }} className="absolute right-4 text-white/80 hover:text-white z-10">
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}
            <img
              src={imagePreviewUrls[previewLightboxIndex]}
              alt=""
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="absolute bottom-4 text-white/60 text-sm">{previewLightboxIndex + 1} / {imagePreviewUrls.length}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
