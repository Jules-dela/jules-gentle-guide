import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientPortal } from '@/hooks/useClientPortal';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { KeyHandoverInfo } from '@/components/portal/KeyHandoverInfo';
import { Loader2, Key } from 'lucide-react';

export default function PortalHandover() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { keyHandover, loading, confirmKeyHandover } = useClientPortal();

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
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold">Key Handover</h1>
          <p className="text-muted-foreground">Details for receiving your keys.</p>
        </div>

        {keyHandover ? (
          <KeyHandoverInfo keyHandover={keyHandover} onConfirm={confirmKeyHandover} />
        ) : (
          <div className="text-center py-12">
            <Key className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">Key handover details will appear here once scheduled.</p>
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
