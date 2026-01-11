import { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  File,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CaseDocument, DocumentStatus } from '@/types/portal';
import { useToast } from '@/hooks/use-toast';

interface DocumentChecklistProps {
  documents: CaseDocument[];
  onUpload: (documentId: string, file: File) => Promise<{ error: Error | null }>;
}

const statusConfig: Record<DocumentStatus, {
  label: string;
  icon: React.ElementType;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  color: string;
}> = {
  missing: {
    label: 'Missing',
    icon: AlertCircle,
    variant: 'destructive',
    color: 'text-destructive',
  },
  uploaded: {
    label: 'Uploaded',
    icon: Clock,
    variant: 'secondary',
    color: 'text-yellow-600',
  },
  validated: {
    label: 'Validated',
    icon: CheckCircle,
    variant: 'default',
    color: 'text-green-600',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    variant: 'destructive',
    color: 'text-destructive',
  },
};

export function DocumentChecklist({ documents, onUpload }: DocumentChecklistProps) {
  const { toast } = useToast();
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileSelect = async (documentId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 10MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadingId(documentId);
    const { error } = await onUpload(documentId, file);
    setUploadingId(null);

    if (error) {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Document uploaded',
        description: 'Your document has been uploaded and is pending review.',
      });
    }
  };

  const completedCount = documents.filter(d => d.status === 'validated').length;
  const totalCount = documents.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Required Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No documents are required at this stage.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          Required Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion</span>
            <span className="font-medium">{completedCount} / {totalCount}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Document list */}
        <div className="space-y-3">
          {documents.map((doc) => {
            const config = statusConfig[doc.status];
            const StatusIcon = config.icon;
            const isUploading = uploadingId === doc.id;

            return (
              <div 
                key={doc.id}
                className={cn(
                  'flex items-center justify-between gap-4 p-4 rounded-lg border transition-all',
                  doc.status === 'rejected' && 'border-destructive/50 bg-destructive/5',
                  doc.status === 'validated' && 'border-green-500/50 bg-green-50',
                  doc.status === 'missing' && 'border-border',
                  doc.status === 'uploaded' && 'border-yellow-500/50 bg-yellow-50'
                )}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <File className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm">{doc.label}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.document_type}</p>
                    {doc.status === 'rejected' && doc.rejection_reason && (
                      <p className="text-xs text-destructive mt-1">
                        Reason: {doc.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={config.variant} className="gap-1">
                    <StatusIcon className="w-3 h-3" />
                    {config.label}
                  </Badge>

                  {(doc.status === 'missing' || doc.status === 'rejected') && (
                    <>
                      <input
                        type="file"
                        ref={(el) => {
                          fileInputRefs.current[doc.id] = el;
                        }}
                        onChange={(e) => handleFileSelect(doc.id, e.target.files)}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRefs.current[doc.id]?.click()}
                        disabled={isUploading}
                        className="gap-1"
                      >
                        <Upload className="w-4 h-4" />
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </>
                  )}

                  {doc.file_url && (
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                    >
                      <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
