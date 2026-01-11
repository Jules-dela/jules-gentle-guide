import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientPortal } from '@/hooks/useClientPortal';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { TimelineTracker } from '@/components/portal/TimelineTracker';
import { CaseSummary } from '@/components/portal/CaseSummary';
import { Loader2 } from 'lucide-react';

export default function PortalDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { activeCase, profile, loading, error } = useClientPortal();

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

  if (!profile || !activeCase) {
    return (
      <PortalLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">No Active Case</h1>
          <p className="text-muted-foreground">
            You don't have an active housing search. Please submit a request to get started.
          </p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {profile.name}!</h1>
          <p className="text-muted-foreground">Track your housing search progress below.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TimelineTracker currentStatus={activeCase.status} />
          {activeCase.initial_criteria && (
            <CaseSummary criteria={activeCase.initial_criteria} createdAt={activeCase.created_at} />
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
