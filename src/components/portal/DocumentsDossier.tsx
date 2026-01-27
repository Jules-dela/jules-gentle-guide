import { useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Check, 
  Clock, 
  AlertCircle, 
  Lock, 
  Shield,
  Briefcase,
  CreditCard,
  FileCheck,
  Users,
  Sparkles,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { SelectedApartment } from './ResearchGallery';
import type { CaseDocument, DocumentStatus as DBDocumentStatus } from '@/types/portal';

type DocumentStatus = 'missing' | 'pending' | 'verified' | 'rejected';

interface Document {
  id: string;
  title: string;
  description: string;
  status: DocumentStatus;
  icon: React.ReactNode;
  required: boolean;
  rejectionReason?: string | null;
}

interface DocumentsDossierProps {
  apartment: SelectedApartment;
  documents?: CaseDocument[];
  onUpload?: (documentId: string, file: File) => Promise<{ error: Error | null }>;
  onComplete: () => void;
}

// Default document templates (used when no real documents exist)
const defaultDocumentTemplates: Omit<Document, 'status'>[] = [
  {
    id: 'identity',
    title: 'Identity Document',
    description: 'Passport or ID Card',
    icon: <CreditCard className="w-5 h-5" />,
    required: true,
  },
  {
    id: 'income',
    title: 'Proof of Income',
    description: 'Last 3 salary slips or Student Grant',
    icon: <Briefcase className="w-5 h-5" />,
    required: true,
  },
  {
    id: 'debt-extract',
    title: 'Debt Collection Extract',
    description: 'Extrait de l\'Office des Poursuites (less than 3 months old)',
    icon: <FileText className="w-5 h-5" />,
    required: true,
  },
  {
    id: 'liability',
    title: 'Liability Insurance',
    description: 'RC Ménage - Private liability insurance',
    icon: <Shield className="w-5 h-5" />,
    required: true,
  },
  {
    id: 'guarantor',
    title: 'Guarantor Form',
    description: 'If applicable - Required for students',
    icon: <Users className="w-5 h-5" />,
    required: false,
  },
];

// Map DB status to UI status
function mapDBStatus(status: DBDocumentStatus): DocumentStatus {
  switch (status) {
    case 'missing': return 'missing';
    case 'uploaded': return 'pending';
    case 'validated': return 'verified';
    case 'rejected': return 'rejected';
    default: return 'missing';
  }
}

const statusConfig = {
  missing: {
    label: 'Missing',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    icon: AlertCircle,
  },
  pending: {
    label: 'Pending Review',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    icon: Clock,
  },
  verified: {
    label: 'Verified',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    icon: Check,
  },
  rejected: {
    label: 'Rejected',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    icon: XCircle,
  },
};

export function DocumentsDossier({ apartment, documents: dbDocuments, onUpload, onComplete }: DocumentsDossierProps) {
  // Convert DB documents to UI format, or use defaults for demo
  const initialDocs = useMemo(() => {
    if (dbDocuments && dbDocuments.length > 0) {
      return dbDocuments.map(doc => ({
        id: doc.id,
        title: doc.label,
        description: doc.document_type,
        status: mapDBStatus(doc.status),
        icon: <FileText className="w-5 h-5" />,
        required: true, // Assume all DB documents are required
        rejectionReason: doc.rejection_reason,
      }));
    }
    // Demo mode - use templates with one verified for preview
    return defaultDocumentTemplates.map(doc => ({
      ...doc,
      status: doc.id === 'liability' ? 'verified' as DocumentStatus : 'missing' as DocumentStatus,
    }));
  }, [dbDocuments]);

  const [localDocuments, setLocalDocuments] = useState<Document[]>(initialDocs);
  const [showCelebration, setShowCelebration] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const requiredDocs = localDocuments.filter(d => d.required);
  const allRequiredUploaded = requiredDocs.every(d => d.status !== 'missing' && d.status !== 'rejected');

  const handleFileUpload = useCallback(async (docId: string, file: File) => {
    setUploadingId(docId);
    
    if (onUpload) {
      // Real upload to Supabase
      const { error } = await onUpload(docId, file);
      if (error) {
        toast({
          title: "Upload failed",
          description: error.message,
          variant: "destructive",
        });
        setUploadingId(null);
        return;
      }
    }
    
    // Update local state
    setLocalDocuments(prev =>
      prev.map(doc =>
        doc.id === docId ? { ...doc, status: 'pending' as DocumentStatus } : doc
      )
    );
    setUploadingId(null);
    
    toast({
      title: "Document uploaded",
      description: "Your document is pending review.",
    });
  }, [onUpload]);

  const handleUploadClick = (docId: string) => {
    fileInputRefs.current[docId]?.click();
  };

  const handleFileChange = (docId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(docId, e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    setDragOverId(docId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, docId: string) => {
    e.preventDefault();
    setDragOverId(null);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(docId, e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = () => {
    setShowCelebration(true);
    setTimeout(() => {
      setShowCelebration(false);
      onComplete();
    }, 3000);
  };

  const StatusBadge = ({ status }: { status: DocumentStatus }) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <motion.div
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
          config.bgColor,
          config.textColor,
          config.borderColor,
          status === 'pending' && 'animate-pulse'
        )}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative min-h-[600px] py-8"
    >
      <AnimatePresence mode="wait">
        {!showCelebration ? (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Header */}
            <motion.div 
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Your Application Dossier
              </h2>
              <p className="text-muted-foreground max-w-lg mx-auto mb-4">
                Landlords in Lausanne require a perfect file. Upload your documents here, and we will verify them for you.
              </p>
              
              {/* Security Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/20 rounded-full text-sm text-primary"
              >
                <Lock className="w-4 h-4" />
                <span className="font-medium">End-to-End Encrypted</span>
                <Shield className="w-4 h-4" />
              </motion.div>
            </motion.div>

            {/* Property Recap */}
            <motion.div
              className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-4 mb-6 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <img
                src={apartment.images[0]}
                alt="Apartment"
                className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-foreground text-sm">Applying for</h4>
                <p className="text-muted-foreground text-sm">
                  {apartment.neighborhood}, {apartment.location} · {apartment.rent} CHF/month
                </p>
              </div>
              <FileCheck className="w-8 h-8 text-primary/40" />
            </motion.div>

            {/* Documents List */}
            <motion.div
              className="bg-white rounded-[40px] p-6 md:p-8 shadow-lg max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Required Documents</h3>
                <span className="text-sm text-muted-foreground">
                  {localDocuments.filter(d => d.status !== 'missing' && d.status !== 'rejected').length}/{localDocuments.length} uploaded
                </span>
              </div>

              <div className="space-y-4">
                {localDocuments.map((doc, index) => (
                  <motion.div
                    key={doc.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={cn(
                      'relative border-2 rounded-2xl p-4 transition-all duration-300',
                      dragOverId === doc.id
                        ? 'border-primary bg-primary/5 scale-[1.02]'
                        : doc.status === 'missing' || doc.status === 'rejected'
                        ? 'border-dashed border-muted-foreground/30 hover:border-primary/50'
                        : 'border-solid border-muted-foreground/20'
                    )}
                    onDragOver={(e) => (doc.status === 'missing' || doc.status === 'rejected') && handleDragOver(e, doc.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => (doc.status === 'missing' || doc.status === 'rejected') && handleDrop(e, doc.id)}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                        doc.status === 'verified' ? 'bg-emerald-100 text-emerald-600' :
                        doc.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                        doc.status === 'rejected' ? 'bg-rose-100 text-rose-600' :
                        'bg-muted text-muted-foreground'
                      )}>
                        {doc.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <h4 className="font-medium text-foreground flex items-center gap-2">
                              {doc.title}
                              {!doc.required && (
                                <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
                              )}
                            </h4>
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                          </div>
                          <StatusBadge status={doc.status} />
                        </div>

                        {/* Rejection reason */}
                        {doc.status === 'rejected' && doc.rejectionReason && (
                          <p className="text-sm text-rose-600 mt-2">
                            Reason: {doc.rejectionReason}
                          </p>
                        )}

                        {/* Upload area for missing or rejected documents */}
                        {(doc.status === 'missing' || doc.status === 'rejected') && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-3"
                          >
                            <input
                              type="file"
                              ref={(el) => { fileInputRefs.current[doc.id] = el; }}
                              onChange={handleFileChange(doc.id)}
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUploadClick(doc.id)}
                              disabled={uploadingId === doc.id}
                              className="gap-2 rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
                            >
                              {uploadingId === doc.id ? (
                                <>
                                  <motion.div
                                    className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                  />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  {doc.status === 'rejected' ? 'Re-upload Document' : 'Upload Document'}
                                </>
                              )}
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2">
                              or drag and drop your file here
                            </p>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              className="max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <Button
                onClick={handleSubmit}
                disabled={!allRequiredUploaded}
                className={cn(
                  'w-full h-16 rounded-full text-lg font-medium transition-all duration-500',
                  allRequiredUploaded
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                {allRequiredUploaded ? (
                  <span className="flex items-center gap-2">
                    <FileCheck className="w-5 h-5" />
                    Submit Full Dossier
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Upload all required documents to continue
                  </span>
                )}
              </Button>
              
              {!allRequiredUploaded && (
                <p className="text-center text-sm text-muted-foreground mt-3">
                  {requiredDocs.filter(d => d.status === 'missing' || d.status === 'rejected').length} required document(s) remaining
                </p>
              )}
            </motion.div>
          </motion.div>
        ) : (
          /* Celebration Animation */
          <motion.div
            key="celebration"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            {/* Confetti particles */}
            {[...Array(30)].map((_, i) => (
              <motion.div
                key={i}
                className={cn(
                  'absolute w-3 h-3 rounded-full',
                  i % 5 === 0 ? 'bg-primary' :
                  i % 5 === 1 ? 'bg-emerald-400' :
                  i % 5 === 2 ? 'bg-amber-400' :
                  i % 5 === 3 ? 'bg-rose-400' :
                  'bg-violet-400'
                )}
                initial={{ 
                  opacity: 1,
                  x: 0, 
                  y: 0,
                  scale: 0
                }}
                animate={{ 
                  opacity: [1, 1, 0],
                  x: (Math.random() - 0.5) * 400,
                  y: (Math.random() - 0.5) * 400,
                  scale: [0, 1, 0.5],
                  rotate: Math.random() * 720
                }}
                transition={{ 
                  duration: 2,
                  delay: Math.random() * 0.5,
                  ease: 'easeOut'
                }}
              />
            ))}

            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', damping: 10, stiffness: 150, delay: 0.2 }}
              className="w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/40"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: 'spring' }}
              >
                <Check className="w-14 h-14 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>

            {/* Text */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center flex items-center gap-2"
            >
              <Sparkles className="w-6 h-6 text-amber-400" />
              Dossier Submitted!
              <Sparkles className="w-6 h-6 text-amber-400" />
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-center max-w-sm"
            >
              Your application has been sent to the landlord. We'll notify you as soon as there's news!
            </motion.p>
            
            {/* Loading dots */}
            <motion.div 
              className="flex gap-1.5 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-500"
                  animate={{ 
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
