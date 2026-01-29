import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Check, 
  X, 
  Eye, 
  Download, 
  Upload, 
  Lock, 
  AlertCircle,
  Loader2,
  Plus,
  Archive,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import type { AdminDocument } from '@/types/admin';
import { MANDATORY_DOCUMENT_TYPES } from '@/types/admin';

interface DocumentManagerProps {
  caseId: string;
  clientName: string;
  onUpdate?: () => void;
}

const statusConfig = {
  missing: { 
    icon: AlertCircle, 
    label: 'Missing', 
    color: 'text-muted-foreground',
    bgColor: 'bg-muted'
  },
  uploaded: { 
    icon: Clock, 
    label: 'Pending Review', 
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  validated: { 
    icon: CheckCircle, 
    label: 'Verified', 
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  rejected: { 
    icon: XCircle, 
    label: 'Rejected', 
    color: 'text-destructive',
    bgColor: 'bg-destructive/5'
  },
};

export function DocumentManager({ caseId, clientName, onUpdate }: DocumentManagerProps) {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Modal states
  const [viewingDoc, setViewingDoc] = useState<AdminDocument | null>(null);
  const [rejectingDoc, setRejectingDoc] = useState<AdminDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [addingDoc, setAddingDoc] = useState(false);
  const [newDocLabel, setNewDocLabel] = useState('');
  const [downloadingZip, setDownloadingZip] = useState(false);

  const fetchDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('case_documents')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Map to AdminDocument type
      const docs: AdminDocument[] = (data || []).map(d => ({
        id: d.id,
        case_id: d.case_id,
        document_type: d.document_type,
        label: d.label,
        file_url: d.file_url,
        status: d.status as AdminDocument['status'],
        rejection_reason: d.rejection_reason,
        created_at: d.created_at,
        validated_at: d.validated_at,
      }));

      // Ensure all mandatory document types exist
      const existingTypes = new Set(docs.map(d => d.document_type));
      const missingDocs: AdminDocument[] = [];

      for (const mandatory of MANDATORY_DOCUMENT_TYPES) {
        if (!existingTypes.has(mandatory.type)) {
          missingDocs.push({
            id: `placeholder-${mandatory.type}`,
            case_id: caseId,
            document_type: mandatory.type,
            label: mandatory.label,
            file_url: null,
            status: 'missing',
            rejection_reason: null,
            created_at: new Date().toISOString(),
            validated_at: null,
          });
        }
      }

      setDocuments([...docs, ...missingDocs]);
    } catch (err) {
      console.error('Error fetching documents:', err);
      toast({
        title: 'Error',
        description: 'Failed to load documents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [caseId, toast]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleApprove = async (doc: AdminDocument) => {
    if (doc.id.startsWith('placeholder-')) return;
    
    setActionLoading(doc.id);
    try {
      const { error } = await supabase
        .from('case_documents')
        .update({ 
          status: 'validated',
          validated_at: new Date().toISOString(),
          rejection_reason: null 
        })
        .eq('id', doc.id);

      if (error) throw error;

      toast({
        title: 'Document Approved',
        description: `${doc.label} has been verified`,
      });

      fetchDocuments();
      onUpdate?.();
    } catch (err) {
      console.error('Error approving document:', err);
      toast({
        title: 'Error',
        description: 'Failed to approve document',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingDoc || rejectingDoc.id.startsWith('placeholder-')) return;
    
    setActionLoading(rejectingDoc.id);
    try {
      const { error } = await supabase
        .from('case_documents')
        .update({ 
          status: 'rejected',
          rejection_reason: rejectionReason || 'Document does not meet requirements',
          validated_at: null 
        })
        .eq('id', rejectingDoc.id);

      if (error) throw error;

      toast({
        title: 'Document Rejected',
        description: `${rejectingDoc.label} has been rejected. The client will be notified.`,
        variant: 'destructive',
      });

      setRejectingDoc(null);
      setRejectionReason('');
      fetchDocuments();
      onUpdate?.();
    } catch (err) {
      console.error('Error rejecting document:', err);
      toast({
        title: 'Error',
        description: 'Failed to reject document',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddCustomDocument = async () => {
    if (!newDocLabel.trim()) return;

    setActionLoading('add-new');
    try {
      const { error } = await supabase
        .from('case_documents')
        .insert({
          case_id: caseId,
          document_type: `custom-${Date.now()}`,
          label: newDocLabel.trim(),
          status: 'missing',
        });

      if (error) throw error;

      toast({
        title: 'Document Added',
        description: `Request for "${newDocLabel}" has been added`,
      });

      setAddingDoc(false);
      setNewDocLabel('');
      fetchDocuments();
      onUpdate?.();
    } catch (err) {
      console.error('Error adding document:', err);
      toast({
        title: 'Error',
        description: 'Failed to add document request',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownloadAll = async () => {
    const uploadedDocs = documents.filter(d => d.file_url);
    if (uploadedDocs.length === 0) {
      toast({
        title: 'No Documents',
        description: 'No documents are available for download',
        variant: 'destructive',
      });
      return;
    }

    setDownloadingZip(true);
    try {
      // Download each file and create a ZIP
      // For now, open all in new tabs (full ZIP would require server-side processing)
      for (const doc of uploadedDocs) {
        if (doc.file_url) {
          window.open(doc.file_url, '_blank');
        }
      }
      toast({
        title: 'Documents Opened',
        description: `${uploadedDocs.length} document(s) opened in new tabs`,
      });
    } catch (err) {
      console.error('Error downloading:', err);
      toast({
        title: 'Error',
        description: 'Failed to download documents',
        variant: 'destructive',
      });
    } finally {
      setDownloadingZip(false);
    }
  };

  // Calculate stats
  const uploadedCount = documents.filter(d => d.file_url).length;
  const verifiedCount = documents.filter(d => d.status === 'validated').length;
  const pendingCount = documents.filter(d => d.status === 'uploaded').length;
  const totalCount = documents.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Dossier Management</h4>
        </div>
        <div className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Dossier Management</h4>
          <Badge variant="outline" className="text-xs">
            {verifiedCount}/{totalCount} verified
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAddingDoc(true)}
            className="gap-1"
          >
            <Plus className="h-3 w-3" />
            Add Doc
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadAll}
            disabled={uploadedCount === 0 || downloadingZip}
            className="gap-1"
          >
            {downloadingZip ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Archive className="h-3 w-3" />
            )}
            Download All
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2 text-sm text-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <span>{pendingCount} document(s) awaiting your review</span>
        </div>
      )}

      {/* Document list */}
      <div className="space-y-2">
        {documents.map((doc) => {
          const status = statusConfig[doc.status];
          const StatusIcon = status.icon;
          const isLoading = actionLoading === doc.id;
          const isPlaceholder = doc.id.startsWith('placeholder-');

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'flex items-center justify-between gap-3 p-3 rounded-lg border transition-all',
                status.bgColor,
                doc.status === 'uploaded' && 'ring-2 ring-yellow-400/50'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <StatusIcon className={cn('h-4 w-4 shrink-0', status.color)} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{doc.label}</p>
                  <p className={cn('text-xs', status.color)}>{status.label}</p>
                  {doc.status === 'rejected' && doc.rejection_reason && (
                    <p className="text-xs text-destructive mt-0.5 truncate">
                      Reason: {doc.rejection_reason}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {doc.file_url && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewingDoc(doc)}
                      title="View document"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      asChild
                      title="Download"
                    >
                      <a href={doc.file_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </>
                )}

                {doc.status === 'uploaded' && !isPlaceholder && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => handleApprove(doc)}
                      disabled={isLoading}
                      title="Approve"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setRejectingDoc(doc)}
                      disabled={isLoading}
                      title="Reject"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                )}

                {doc.status === 'missing' && (
                  <Badge variant="outline" className="text-xs">
                    Awaiting upload
                  </Badge>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* View Document Modal */}
      <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {viewingDoc?.label}
            </DialogTitle>
            <DialogDescription>
              Document preview for {clientName}
            </DialogDescription>
          </DialogHeader>
          {viewingDoc?.file_url && (
            <div className="flex-1 min-h-[400px] bg-muted rounded-lg overflow-hidden">
              {viewingDoc.file_url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img 
                  src={viewingDoc.file_url} 
                  alt={viewingDoc.label}
                  className="w-full h-full object-contain"
                />
              ) : (
                <iframe
                  src={viewingDoc.file_url}
                  title={viewingDoc.label}
                  className="w-full h-[500px]"
                />
              )}
            </div>
          )}
          <DialogFooter className="gap-2">
            {viewingDoc?.status === 'uploaded' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectingDoc(viewingDoc);
                    setViewingDoc(null);
                  }}
                  className="gap-1 text-destructive"
                >
                  <X className="h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleApprove(viewingDoc);
                    setViewingDoc(null);
                  }}
                  className="gap-1"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
            <Button
              variant="outline"
              asChild
            >
              <a href={viewingDoc?.file_url || ''} download target="_blank" rel="noopener noreferrer">
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Document Modal */}
      <Dialog open={!!rejectingDoc} onOpenChange={() => setRejectingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Reject Document
            </DialogTitle>
            <DialogDescription>
              Rejecting "{rejectingDoc?.label}". The client will see this reason and can re-upload.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Reason for rejection</Label>
              <Textarea
                id="rejection-reason"
                placeholder="e.g., Document is expired, Please provide a clearer scan, Wrong document type..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectingDoc(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject}
              disabled={actionLoading === rejectingDoc?.id}
            >
              {actionLoading === rejectingDoc?.id ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <X className="h-4 w-4 mr-2" />
              )}
              Reject Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Custom Document Modal */}
      <Dialog open={addingDoc} onOpenChange={setAddingDoc}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Request Additional Document
            </DialogTitle>
            <DialogDescription>
              Add a custom document request for the client to upload.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="doc-label">Document Name</Label>
              <Input
                id="doc-label"
                placeholder="e.g., Bank Statement, Work Contract..."
                value={newDocLabel}
                onChange={(e) => setNewDocLabel(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddingDoc(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomDocument}
              disabled={!newDocLabel.trim() || actionLoading === 'add-new'}
            >
              {actionLoading === 'add-new' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Security footer */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
        <Lock className="h-3 w-3" />
        <span>Documents are encrypted and securely stored</span>
      </div>
    </div>
  );
}
