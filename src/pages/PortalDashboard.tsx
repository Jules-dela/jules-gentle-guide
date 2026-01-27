import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import type { CaseStatus, PropertyProposal, KeyHandover } from '@/types/portal';

// Demo data for preview mode
const DEMO_APARTMENT: SelectedApartment = {
  id: 'demo-apt',
  images: [
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
  ],
  rent: 1850,
  rooms: 2.5,
  location: 'Rue de la Louve 12, 1003 Lausanne',
  neighborhood: 'Lausanne Centre',
  description: 'Beautiful 2.5 room apartment in the heart of Lausanne with stunning lake views.',
  amenities: ['Balcony', 'Dishwasher', 'Elevator', 'Lake View'],
};

const DEMO_KEY_HANDOVER: KeyHandover = {
  id: 'demo-handover',
  case_id: 'demo-case',
  scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 week from now
  scheduled_time: '10:00',
  location: 'Rue de la Louve 12, 1003 Lausanne',
  contact_person: 'Jules',
  contact_phone: '+41781234567',
  confirmed_by_client: false,
  notes: 'Please bring your ID and a copy of the signed lease.',
  created_at: new Date().toISOString(),
};

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
  const [searchParams] = useSearchParams();
  
  // Check for demo mode via URL parameter
  const isDemoMode = searchParams.get('demo') === 'true';
  const demoStage = searchParams.get('stage') ? parseInt(searchParams.get('stage')!, 10) : null;
  
  // Determine stage from case status
  const caseStage = useMemo(() => getStageFromStatus(activeCase?.status), [activeCase?.status]);
  
  // Track highest stage reached (for read-only mode when viewing past stages)
  const [highestStage, setHighestStage] = useState(isDemoMode && demoStage ? demoStage : 1);
  const [currentStage, setCurrentStage] = useState(isDemoMode && demoStage ? demoStage : 1);
  const [selectedApartment, setSelectedApartment] = useState<SelectedApartment | null>(
    isDemoMode ? DEMO_APARTMENT : null
  );
  
  // Determine if viewing a previous stage (read-only mode)
  const isReadOnly = currentStage < highestStage;

  // Sync stage with case status (only if not in demo mode)
  useEffect(() => {
    if (!isDemoMode) {
      setCurrentStage(caseStage);
      setHighestStage(prev => Math.max(prev, caseStage));
    }
  }, [caseStage, isDemoMode]);

  // Find liked proposal for stages 3-5 (only if not in demo mode)
  useEffect(() => {
    if (isDemoMode) return;
    const likedProposal = proposals.find(p => p.client_status === 'liked');
    if (likedProposal && !selectedApartment) {
      setSelectedApartment(proposalToApartment(likedProposal));
    }
  }, [proposals, selectedApartment, isDemoMode]);

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
    const nextStage = Math.min(currentStage + 1, 5);
    setCurrentStage(nextStage);
    setHighestStage(prev => Math.max(prev, nextStage));
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

  // Loading state (skip for demo mode)
  if (!isDemoMode && (authLoading || portalLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Skip auth check in demo mode
  if (!isDemoMode && !user) return null;

  // Error state (skip for demo mode)
  if (!isDemoMode && error) {
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

  // No profile/case state - show welcome message (skip for demo mode)
  if (!isDemoMode && (!profile || !activeCase)) {
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
  
  // Use demo data or real data
  const displayKeyHandover = isDemoMode ? DEMO_KEY_HANDOVER : keyHandover;
  const displayUserName = isDemoMode ? 'Demo User' : profile?.name;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      {/* Reuse Landing Page Header */}
      <Header />
      
      {/* Spacer for fixed header */}
      <div className="h-[72px]" />
      
      {/* Progress Tracker */}
      <TrackerProgressBar currentStage={currentStage} onStageClick={setCurrentStage} />
      
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
              readOnly={isReadOnly}
            />
          )}
          
          {currentStage === 2 && (
            <ResearchGallery 
              key="stage-2" 
              proposals={pendingProposals}
              onComplete={handleResearchComplete}
              onReject={handleRejectProposal}
              readOnly={isReadOnly}
            />
          )}
          
          {currentStage === 3 && selectedApartment && (
            <VisitReport 
              key="stage-3" 
              apartment={selectedApartment}
              onComplete={handleNextStep} 
              onReject={handleBackToResearch}
              readOnly={isReadOnly}
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
              readOnly={isReadOnly}
            />
          )}
          
          {currentStage > 4 && selectedApartment && (
            <KeyHandoverStage 
              key="stage-5" 
              apartment={selectedApartment}
              keyHandover={displayKeyHandover}
              userName={displayUserName}
            />
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
