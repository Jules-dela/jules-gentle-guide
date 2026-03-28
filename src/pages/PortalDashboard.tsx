import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useClientPortal } from '@/hooks/useClientPortal';
import { useNotifications } from '@/hooks/useNotifications';
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
import type { CaseStatus, PropertyProposal, KeyHandover, Profile, Case, CaseDocument, ContractData } from '@/types/portal';

// ─── Showcase / Demo data ────────────────────────────────────────────────────

const SHOWCASE_PROPOSALS: SelectedApartment[] = [
  {
    id: 'showcase-1',
    images: [
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
    ],
    rent: 1450,
    rooms: 1.5,
    location: 'Rue de Bourg 15, 1003 Lausanne',
    neighborhood: 'Bourg',
    description: 'Small studio near city center. Limited natural light, no balcony. Shared laundry in basement.',
    amenities: ['City Center', 'Metro Nearby', 'Compact'],
  },
  {
    id: 'showcase-2',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80',
    ],
    rent: 1850,
    rooms: 2.5,
    location: 'Rue de la Louve 12, 1003 Lausanne',
    neighborhood: 'Lausanne Centre',
    description: 'Beautiful 2.5 room apartment in the heart of Lausanne with stunning lake views. Renovated kitchen, hardwood floors, and a south-facing balcony.',
    amenities: ['Lake View', 'Balcony', 'Renovated', 'Dishwasher', 'Elevator'],
  },
];

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
  scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  scheduled_time: '10:00',
  location: 'Rue de la Louve 12, 1003 Lausanne',
  contact_person: 'Jules',
  contact_phone: '+41781234567',
  confirmed_by_client: false,
  notes: 'Please bring your ID and a copy of the signed lease.',
  created_at: new Date().toISOString(),
};

const DEMO_PROFILE: Profile = {
  id: 'demo-profile',
  user_id: 'demo-user',
  name: 'Demo User',
  email: 'demo@example.com',
  phone: '+41781234567',
  client_type: 'student',
  company_school: 'EPFL',
  created_at: new Date().toISOString(),
};

const SHOWCASE_PROFILE: Profile = {
  id: 'showcase-profile',
  user_id: 'showcase-user',
  name: 'Sarah Mitchell',
  email: 'sarah.mitchell@epfl.ch',
  phone: '+41 78 912 34 56',
  client_type: 'student',
  company_school: 'EPFL',
  created_at: new Date().toISOString(),
};

const SHOWCASE_DOCUMENTS: CaseDocument[] = [
  { id: 'doc-1', case_id: 'showcase-case', document_type: 'id', label: 'Passport / ID Card', status: 'validated', file_url: null, rejection_reason: null, created_at: new Date().toISOString(), validated_at: new Date().toISOString() },
  { id: 'doc-2', case_id: 'showcase-case', document_type: 'salary', label: 'Proof of Income / Scholarship', status: 'validated', file_url: null, rejection_reason: null, created_at: new Date().toISOString(), validated_at: new Date().toISOString() },
  { id: 'doc-3', case_id: 'showcase-case', document_type: 'insurance', label: 'Liability Insurance (RC)', status: 'validated', file_url: null, rejection_reason: null, created_at: new Date().toISOString(), validated_at: new Date().toISOString() },
  { id: 'doc-4', case_id: 'showcase-case', document_type: 'debt_certificate', label: 'Debt Collection Certificate', status: 'validated', file_url: null, rejection_reason: null, created_at: new Date().toISOString(), validated_at: new Date().toISOString() },
  { id: 'doc-5', case_id: 'showcase-case', document_type: 'enrollment', label: 'EPFL Enrollment Certificate', status: 'validated', file_url: null, rejection_reason: null, created_at: new Date().toISOString(), validated_at: new Date().toISOString() },
];

function makeDemoCase(status: CaseStatus, contractData: ContractData | null): Case {
  return {
    id: 'demo-case',
    client_id: 'demo-profile',
    status,
    initial_criteria: {
      neighbourhood: 'lausanne-centre',
      budget: '1500-2000',
      rooms: '2.5',
      duration: '12',
      property_type: 'apartment',
      roommate_preference: '0',
      furnished: true,
      near_transport: true,
      pets_allowed: false,
      smoking_allowed: false,
      notes: 'Looking for a quiet apartment near public transport.',
    },
    contract_data: contractData,
    
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    closed_at: null,
    close_reason: null,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStageFromStatus(status: CaseStatus | undefined): number {
  if (!status) return 1;
  switch (status) {
    case 'request_received':
    case 'search_in_progress':
      return 1;
    case 'proposals_available':
      return 2;
    case 'visit_in_progress':
      return 3;
    case 'documents_preparation':
    case 'application_review':
      return 4;
    case 'key_handover_scheduled':
    case 'closed':
      return 5;
    default:
      return 1;
  }
}

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

// ─── Component ───────────────────────────────────────────────────────────────

export default function PortalDashboard() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { 
    profile, activeCase, proposals, documents, keyHandover,
    loading: portalLoading, error,
    updateProposalFeedback, uploadDocument, signContract, refetch
  } = useClientPortal();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const isDemoMode = searchParams.get('demo') === 'true';
  const isShowcaseMode = searchParams.get('showcase') === 'true';
  const isOfflineMode = isDemoMode || isShowcaseMode;
  const demoStage = searchParams.get('stage') ? parseInt(searchParams.get('stage')!, 10) : null;
  
  const { unreadStages, markStageAsRead } = useNotifications(activeCase?.id || null);
  
  const caseStage = useMemo(() => getStageFromStatus(activeCase?.status), [activeCase?.status]);
  
  // Showcase-specific state
  const [showcaseContractData, setShowcaseContractData] = useState<ContractData | null>(null);
  const [showcaseStatus, setShowcaseStatus] = useState<CaseStatus>('request_received');
  
  const [highestStage, setHighestStage] = useState(isDemoMode && demoStage ? demoStage : 1);
  const [currentStage, setCurrentStage] = useState(isDemoMode && demoStage ? demoStage : 1);
  const [selectedApartment, setSelectedApartment] = useState<SelectedApartment | null>(
    isDemoMode ? DEMO_APARTMENT : null
  );
  
  const isReadOnly = currentStage < highestStage;

  useEffect(() => {
    if (activeCase?.id && currentStage && unreadStages[currentStage]?.hasNew) {
      markStageAsRead(activeCase.id, currentStage);
    }
  }, [activeCase?.id, currentStage, unreadStages, markStageAsRead]);

  // If contract is not signed, lock to stage 1 regardless of case status
  const contractSigned = isOfflineMode 
    ? (isShowcaseMode ? !!showcaseContractData?.signed : true) 
    : !!(activeCase?.contract_data as { signed?: boolean })?.signed;

  useEffect(() => {
    if (!isOfflineMode) {
      if (!contractSigned) {
        setCurrentStage(1);
        setHighestStage(1);
      } else {
        setCurrentStage(prev => Math.max(prev, caseStage));
        setHighestStage(prev => Math.max(prev, caseStage));
      }
    }
  }, [caseStage, isOfflineMode, contractSigned]);

  // Find first liked proposal with published visit for stage 3+
  useEffect(() => {
    if (isOfflineMode) return;
    const likedProposals = proposals.filter(p => p.client_status === 'liked');
    const published = likedProposals.find(p => p.visit_published);
    const target = published || likedProposals[0];
    if (target) {
      // Always update to the best available apartment (published visit takes priority)
      setSelectedApartment(proposalToApartment(target));
    }
  }, [proposals, isOfflineMode]);

  useEffect(() => {
    if (isOfflineMode) return;
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, authLoading, navigate, isOfflineMode]);

  const scrollToContent = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // ─── Showcase handlers ──────────────────────────────────────────────────

  const handleShowcaseSign = useCallback(async (_contractData: any) => {
    const now = new Date().toISOString();
    setShowcaseContractData({ signed: true, timestamp: now });
    setShowcaseStatus('proposals_available');
    // Don't auto-advance — let the "Next Step" button handle it
    return { error: null };
  }, []);

  const handleShowcaseLike = useCallback((apartment: SelectedApartment) => {
    // Set the liked apartment for the visit stage and advance
    setSelectedApartment(apartment);
    const nextStage = 3;
    setCurrentStage(nextStage);
    setHighestStage(prev => Math.max(prev, nextStage));
    setShowcaseStatus('visit_in_progress');
    scrollToContent();
  }, []);

  const handleShowcaseReject = useCallback(async (proposalId: string, reasons: string[], notes?: string) => {
    // Just let the ResearchGallery handle the visual rejection
    // No DB call needed
  }, []);

  const handleShowcaseVisitComplete = useCallback(() => {
    const nextStage = 4;
    setCurrentStage(nextStage);
    setHighestStage(prev => Math.max(prev, nextStage));
    setShowcaseStatus('documents_preparation');
    scrollToContent();
  }, []);

  const handleShowcaseDocsComplete = useCallback(() => {
    const nextStage = 5;
    setCurrentStage(nextStage);
    setHighestStage(prev => Math.max(prev, nextStage));
    setShowcaseStatus('key_handover_scheduled');
    scrollToContent();
  }, []);

  // ─── Real-data handlers ────────────────────────────────────────────────

  const handleResearchLike = async (apartment: SelectedApartment, questions?: string) => {
    const proposal = proposals.find(p => p.id === apartment.id);
    if (proposal) {
      await updateProposalFeedback(proposal.id, 'liked', undefined, undefined, questions);
      await refetch();
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
    scrollToContent();
  };

  const handleBackToResearch = () => {
    setSelectedApartment(null);
    setCurrentStage(2);
    scrollToContent();
  };

  // All proposals mapped for the research gallery (pending ones for swiping)
  const pendingProposals = useMemo(() => 
    proposals.filter(p => p.client_status === 'pending').map(proposalToApartment),
    [proposals]
  );

  // Handler when all proposals have been reviewed
  const handleAllReviewed = useCallback((finalLikedCount: number) => {
    if (finalLikedCount > 0) {
      // Advance to stage 3 (Viewings)
      const nextStage = 3;
      setCurrentStage(nextStage);
      setHighestStage(prev => Math.max(prev, nextStage));
      scrollToContent();
    }
    // If 0 liked, the ResearchGallery shows the refinement dialog — no stage change
  }, []);

  // Count of liked proposals
  const likedCount = useMemo(() => 
    proposals.filter(p => p.client_status === 'liked').length,
    [proposals]
  );

  if (!isOfflineMode && (authLoading || portalLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isOfflineMode && !user) return null;

  if (!isOfflineMode && error) {
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

  if (!isOfflineMode && (!profile || !activeCase)) {
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
            <Button onClick={() => navigate('/')}>Start Your Search</Button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // ─── Resolve display data ──────────────────────────────────────────────

  const displayProfile = isShowcaseMode ? SHOWCASE_PROFILE : isDemoMode ? DEMO_PROFILE : profile;
  const displayCase = isShowcaseMode 
    ? makeDemoCase(showcaseStatus, showcaseContractData) 
    : isDemoMode 
      ? makeDemoCase('request_received', { signed: true, timestamp: new Date().toISOString() }) 
      : activeCase;
  const displayKeyHandover = isOfflineMode ? DEMO_KEY_HANDOVER : keyHandover;
  const displayUserName = isShowcaseMode ? 'Sarah Mitchell' : isDemoMode ? 'Demo User' : profile?.name;
  const displayDocuments = isShowcaseMode ? SHOWCASE_DOCUMENTS : documents;

  // Showcase-specific: determine which proposals to show and handlers to use
  const showcaseProposals = isShowcaseMode ? SHOWCASE_PROPOSALS : undefined;
  const resolvedOnLike = isShowcaseMode ? handleShowcaseLike : handleResearchLike;
  const resolvedOnReject = isShowcaseMode ? handleShowcaseReject : handleRejectProposal;
  const resolvedOnSign = isShowcaseMode ? handleShowcaseSign : signContract;
  const resolvedOnVisitComplete = isShowcaseMode ? handleShowcaseVisitComplete : handleNextStep;
  const resolvedOnDocsComplete = isShowcaseMode ? handleShowcaseDocsComplete : handleNextStep;
  const resolvedSelectedApartment = isShowcaseMode ? (selectedApartment || SHOWCASE_PROPOSALS[1]) : (isDemoMode ? DEMO_APARTMENT : selectedApartment);

  // Showcase: advance stage after contract signing
  const handleShowcaseNextStep = () => {
    if (isShowcaseMode) {
      const nextStage = Math.min(currentStage + 1, 5);
      setCurrentStage(nextStage);
      setHighestStage(prev => Math.max(prev, nextStage));
      scrollToContent();
    } else {
      handleNextStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />
      <div className="h-[72px]" />
      
      <TrackerProgressBar 
        currentStage={currentStage} 
        onStageClick={setCurrentStage} 
        unreadStages={unreadStages}
      />
      
      <AnimatePresence>
        {isReadOnly && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="container mx-auto px-4 mt-4"
          >
            <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">You're viewing a previous stage</p>
              <Button size="sm" onClick={() => setCurrentStage(highestStage)} className="shrink-0">
                Return to Current Stage
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="container mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {currentStage === 1 && (
            <CriteriaSummary 
              key="stage-1" 
              profile={displayProfile}
              criteria={displayCase!.initial_criteria}
              caseStatus={displayCase!.status}
              contractData={displayCase!.contract_data}
              onNextStep={handleShowcaseNextStep}
              onSign={resolvedOnSign}
              readOnly={isReadOnly}
            />
          )}
          
          {currentStage === 2 && (
            <ResearchGallery 
              key="stage-2" 
              proposals={showcaseProposals || pendingProposals}
              onLike={resolvedOnLike}
              onReject={resolvedOnReject}
              readOnly={isReadOnly}
              likedCount={isShowcaseMode ? 0 : likedCount}
            />
          )}
          
          {currentStage === 3 && resolvedSelectedApartment && (
            <VisitReport 
              key="stage-3" 
              apartment={resolvedSelectedApartment}
              onComplete={resolvedOnVisitComplete} 
              onReject={handleBackToResearch}
              readOnly={isReadOnly}
            />
          )}

          {currentStage === 3 && !resolvedSelectedApartment && (
            <motion.div
              key="stage-3-empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Property Selected Yet</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Like a property in the Research stage first, then we'll schedule a visit for you.
              </p>
              <Button onClick={() => setCurrentStage(2)}>Go to Research</Button>
            </motion.div>
          )}
          
          {currentStage === 4 && resolvedSelectedApartment && (
            <DocumentsDossier 
              key="stage-4" 
              apartment={resolvedSelectedApartment}
              documents={displayDocuments}
              onUpload={isShowcaseMode ? undefined : uploadDocument}
              onComplete={resolvedOnDocsComplete}
              onPreviewHandover={() => setCurrentStage(5)}
              readOnly={isReadOnly}
            />
          )}

          {currentStage === 4 && !resolvedSelectedApartment && (
            <motion.div
              key="stage-4-empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Documents Stage</h2>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                Please complete earlier stages first to prepare your dossier.
              </p>
              <Button onClick={() => setCurrentStage(2)}>Go to Research</Button>
            </motion.div>
          )}
          
          {currentStage > 4 && resolvedSelectedApartment && (
            <KeyHandoverStage 
              key="stage-5" 
              apartment={resolvedSelectedApartment}
              keyHandover={displayKeyHandover}
              userName={displayUserName}
            />
          )}
        </AnimatePresence>
      </main>
      
      <Footer />
    </div>
  );
}
