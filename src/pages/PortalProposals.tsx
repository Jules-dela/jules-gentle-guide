import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientPortal } from '@/hooks/useClientPortal';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { ProposalCard } from '@/components/portal/ProposalCard';
import { Loader2, Building } from 'lucide-react';

export default function PortalProposals() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { proposals, loading, updateProposalFeedback } = useClientPortal();

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Property Proposals</h1>
          <p className="text-muted-foreground">Review properties and let us know your preferences.</p>
        </div>

        {proposals.length === 0 ? (
          <div className="text-center py-12">
            <Building className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No proposals yet. We're searching for the perfect match!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {proposals.map((proposal) => (
              <ProposalCard key={proposal.id} proposal={proposal} onFeedback={updateProposalFeedback} />
            ))}
          </div>
        )}
      </div>
    </PortalLayout>
  );
}
