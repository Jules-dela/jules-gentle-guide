import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientPortal } from '@/hooks/useClientPortal';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrackerProgressBar } from '@/components/portal/TrackerProgressBar';
import { CriteriaSummary } from '@/components/portal/CriteriaSummary';
import { ResearchGallery, type SelectedApartment } from '@/components/portal/ResearchGallery';
import { VisitReport } from '@/components/portal/VisitReport';
import { DocumentsDossier } from '@/components/portal/DocumentsDossier';
import { KeyHandoverStage } from '@/components/portal/KeyHandoverStage';
import { Loader2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { CaseStatus, PropertyProposal } from '@/types/portal';

// Map case status to portal stage number
function getStageFromStatus(status: CaseStatus | undefined): number {
  if (!status) return 1;
  
  switch (status) {
    case 'request_received':
    case 'search_in_progress':
      return 1; // Criteria stage - waiting for proposals
    case 'proposals_available':
      return 2; // Research stage - browsing proposals
    case 'visit_in_progress':
      return 3; // Viewings stage
    case 'documents_preparation':
    case 'application_review':
      return 4; // Documents stage
    case 'key_handover_scheduled':
    case 'closed':
      return 5; // Handover stage
    default:
      return 1;
  }
}

// Convert PropertyProposal to SelectedApartment format
function proposalToApartment(proposal: PropertyProposal): SelectedApartment {
  return {
    id: proposal.id,
    images: proposal.photos.length > 0 
      ? proposal.photos 
      : ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'],
    rent: proposal.rent || 0,
    rooms: proposal.rooms || 0,
    location: proposal.address || 'Lausanne',
    neighborhood: proposal.neighbourhood || 'Centre',
    description: proposal.description || '',
    amenities: proposal.tags || [],
  };
}

export default function PortalDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { 
    profile, 
    activeCase, 
    proposals, 
    documents, 
    keyHandover,
    loading: portalLoading, 
    error,
    updateProposalFeedback,
    uploadDocument,
    refetch
  } = useClientPortal();
  const navigate = useNavigate();
  
  // Determine stage from case status
  const caseStage = useMemo(() => getStageFromStatus(activeCase?.status), [activeCase?.status]);
  const [currentStage, setCurrentStage] = useState(caseStage);
  const [selectedApartment, setSelectedApartment] = useState<SelectedApartment | null>(null);

  // Sync stage with case status
  useEffect(() => {
    setCurrentStage(caseStage);
  }, [caseStage]);

  // Find liked proposal for stages 3-5
  useEffect(() => {
    const likedProposal = proposals.find(p => p.client_status === 'liked');
    if (likedProposal && !selectedApartment) {
      setSelectedApartment(proposalToApartment(likedProposal));
    }
  }, [proposals, selectedApartment]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleResearchComplete = async (apartment: SelectedApartment) => {
    // Find the proposal and update its status
    const proposal = proposals.find(p => p.id === apartment.id);
    if (proposal) {
      const { error } = await updateProposalFeedback(proposal.id, 'liked');
      if (!error) {
        setSelectedApartment(apartment);
        setCurrentStage(3);
      }
    } else {
      // Fallback for demo mode
      setSelectedApartment(apartment);
      setCurrentStage(3);
    }
  };

  const handleRejectProposal = async (proposalId: string, reasons: string[], notes?: string) => {
    const { error } = await updateProposalFeedback(proposalId, 'rejected', reasons, notes);
    if (!error) {
      await refetch();
    }
  };

  const handleNextStep = () => {
    setCurrentStage((prev) => Math.min(prev + 1, 5));
  };

  const handleBackToResearch = () => {
    setSelectedApartment(null);
    setCurrentStage(2);
  };

  // Get pending proposals for Research stage
  const pendingProposals = useMemo(() => 
    proposals.filter(p => p.client_status === 'pending').map(proposalToApartment),
    [proposals]
  );

  // Loading state
  if (authLoading || portalLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <Header />
        <div className="h-[72px]" />
        <div className="container mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // No profile/case state - show welcome message
  if (!profile || !activeCase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <Header />
        <div className="h-[72px]" />
        <div className="container mx-auto px-4 py-12">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Welcome to UniKey! 👋</h2>
            <p className="text-muted-foreground mb-6">
              It looks like you don't have an active housing search yet. 
              Submit an application on our homepage to get started!
            </p>
            <Button onClick={() => navigate('/')}>
              Start Your Search
            </Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Reuse Landing Page Header */}
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-[72px]" />
      
      {/* Progress Tracker */}
      <TrackerProgressBar currentStage={currentStage} />
      
      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {currentStage === 1 && (
            <CriteriaSummary 
              key="stage-1" 
              profile={profile}
              criteria={activeCase.initial_criteria}
              caseStatus={activeCase.status}
              onNextStep={handleNextStep} 
            />
          )}
          
          {currentStage === 2 && (
            <ResearchGallery 
              key="stage-2" 
              proposals={pendingProposals}
              onComplete={handleResearchComplete}
              onReject={handleRejectProposal}
            />
          )}
          
          {currentStage === 3 && selectedApartment && (
            <VisitReport 
              key="stage-3" 
              apartment={selectedApartment}
              onComplete={handleNextStep} 
              onReject={handleBackToResearch}
            />
          )}
          
          {currentStage === 4 && selectedApartment && (
            <DocumentsDossier 
              key="stage-4" 
              apartment={selectedApartment}
              documents={documents}
              onUpload={uploadDocument}
              onComplete={handleNextStep}
              onPreviewHandover={() => setCurrentStage(5)}
            />
          )}
          
          {currentStage > 4 && selectedApartment && (
            <KeyHandoverStage 
              key="stage-5" 
              apartment={selectedApartment}
              keyHandover={keyHandover}
              userName={profile?.name}
            />
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
