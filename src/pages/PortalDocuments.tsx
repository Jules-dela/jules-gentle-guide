import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientPortal } from '@/hooks/useClientPortal';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { DocumentChecklist } from '@/components/portal/DocumentChecklist';
import { Loader2 } from 'lucide-react';

export default function PortalDocuments() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { documents, loading, uploadDocument } = useClientPortal();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <PortalLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground">Upload required documents for your application.</p>
        </div>

        <DocumentChecklist documents={documents} onUpload={uploadDocument} />
      </div>
    </PortalLayout>
  );
}
