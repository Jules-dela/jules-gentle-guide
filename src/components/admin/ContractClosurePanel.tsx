import { useState } from 'react';
import { AlertTriangle, Trash2, Loader2, Shield, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContractClosurePanelProps {
  caseId: string;
  clientName: string;
  onClose: () => void;
  onClosed?: () => void;
}

const CONFIRMATION_PHRASE = 'UNIPLUS-DELETE';

export function ContractClosurePanel({ caseId, clientName, onClose, onClosed }: ContractClosurePanelProps) {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const { toast } = useToast();

  const isConfirmValid = confirmText === CONFIRMATION_PHRASE;

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    setDeleting(true);
    try {
      // 1. Get all documents for this case to delete from storage
      const { data: documents, error: docsError } = await supabase
        .from('case_documents')
        .select('id, file_url')
        .eq('case_id', caseId);

      if (docsError) throw docsError;

      // 2. Delete files from storage
      if (documents && documents.length > 0) {
        for (const doc of documents) {
          if (doc.file_url) {
            try {
              // Parse the file URL to extract bucket and path
              const url = new URL(doc.file_url);
              const parts = url.pathname.split('/').filter(Boolean);
              const signIdx = parts.findIndex(p => p === 'sign');
              const objectIdx = parts.findIndex(p => p === 'object');
              
              let bucket: string;
              let filePath: string;

              if (signIdx !== -1) {
                // Signed URL format: /storage/v1/object/sign/bucket/path
                bucket = parts[signIdx + 1];
                filePath = decodeURIComponent(parts.slice(signIdx + 2).join('/').split('?')[0]);
              } else if (objectIdx !== -1) {
                // Public URL format: /storage/v1/object/public/bucket/path
                bucket = parts[objectIdx + 2];
                filePath = decodeURIComponent(parts.slice(objectIdx + 3).join('/'));
              } else {
                continue;
              }

              await supabase.storage.from(bucket).remove([filePath]);
            } catch (e) {
              console.warn('Failed to delete file:', doc.file_url, e);
            }
          }
        }
      }

      // 3. Delete case documents records
      const { error: deleteDocsError } = await supabase
        .from('case_documents')
        .delete()
        .eq('case_id', caseId);

      if (deleteDocsError) throw deleteDocsError;

      // 4. Delete property proposals (and their photos)
      const { data: proposals } = await supabase
        .from('property_proposals')
        .select('id, photos, visit_photos')
        .eq('case_id', caseId);

      if (proposals) {
        for (const proposal of proposals) {
          // Delete proposal photos from storage
          const allPhotos = [...(proposal.photos || []), ...(proposal.visit_photos || [])];
          for (const photoUrl of allPhotos) {
            try {
              const url = new URL(photoUrl);
              const parts = url.pathname.split('/').filter(Boolean);
              const objectIdx = parts.findIndex(p => p === 'object');
              if (objectIdx !== -1) {
                const bucket = parts[objectIdx + 2];
                const filePath = decodeURIComponent(parts.slice(objectIdx + 3).join('/'));
                await supabase.storage.from(bucket).remove([filePath]);
              }
            } catch (e) {
              console.warn('Failed to delete photo:', photoUrl);
            }
          }
        }
      }

      // Delete visit videos
      const { error: videosError } = await supabase
        .from('visit_videos')
        .delete()
        .eq('proposal_id', proposals?.map(p => p.id)[0] || '');

      // Delete proposals
      const { error: proposalsError } = await supabase
        .from('property_proposals')
        .delete()
        .eq('case_id', caseId);

      if (proposalsError) throw proposalsError;

      // 5. Delete key handover
      const { error: handoverError } = await supabase
        .from('key_handover')
        .delete()
        .eq('case_id', caseId);

      if (handoverError) throw handoverError;

      // 6. Delete case status history
      const { error: historyError } = await supabase
        .from('case_status_history')
        .delete()
        .eq('case_id', caseId);

      if (historyError) throw historyError;

      // 7. Update case to closed with close reason
      const { error: caseError } = await supabase
        .from('cases')
        .update({
          status: 'closed',
          closed_at: new Date().toISOString(),
          close_reason: 'Contract signed - Data purged for GDPR compliance',
        })
        .eq('id', caseId);

      if (caseError) throw caseError;

      toast({
        title: 'Case Closed & Data Purged',
        description: `${clientName}'s sensitive documents have been permanently deleted.`,
      });

      setShowModal(false);
      onClose();
      onClosed?.();
    } catch (err) {
      console.error('Error during data deletion:', err);
      toast({
        title: 'Deletion Failed',
        description: 'An error occurred while deleting data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-destructive" />
          <h4 className="text-sm font-semibold text-destructive">Contract Closure & Privacy Wipe</h4>
        </div>

        <div className="bg-destructive/5 border-2 border-destructive/30 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <FileWarning className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-destructive font-medium">GDPR Data Deletion</p>
              <p className="text-muted-foreground mt-1">
                Once the contract is signed, permanently delete all sensitive client documents (IDs, salary slips, etc.) for privacy compliance.
              </p>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={() => setShowModal(true)}
            className="w-full gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Client Data & Close Project
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <DialogTitle className="text-destructive">Permanent Data Deletion</DialogTitle>
            </div>
            <DialogDescription className="text-left space-y-3">
              <p>
                <strong>Warning:</strong> This action is <strong>permanent and irreversible</strong>.
              </p>
              <p>
                All sensitive documents (IDs, salary slips, debt extracts, guarantor forms) for <strong>{clientName}</strong> will be permanently deleted for GDPR compliance.
              </p>
              <p className="text-destructive font-medium">
                Please confirm you have the signed contract before proceeding.
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Label htmlFor="confirm" className="text-sm text-muted-foreground">
              Type <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-destructive">{CONFIRMATION_PHRASE}</code> to confirm:
            </Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type confirmation phrase..."
              className={cn(
                "font-mono",
                confirmText && !isConfirmValid && "border-destructive"
              )}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setConfirmText('');
              }}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmValid || deleting}
              className="gap-2"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
