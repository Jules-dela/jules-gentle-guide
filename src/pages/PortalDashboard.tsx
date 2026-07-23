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
import { ListingSwitcher } from '@/components/portal/ListingSwitcher';
import { Loader2, AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { CaseStatus, PropertyProposal, KeyHandover, Profile, Case, CaseDocument, ContractData, ListingStatus } from '@/types/portal';

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

function getStageFromStatus(status: CaseStatus | undefined, proposals?: PropertyProposal[]): number {
  if (!status) return 1;
  
  // If status is proposals_available but client has liked proposals with published visits,
  // treat as stage 3 (admin forgot to advance status)
  if (status === 'proposals_available' && proposals) {
    const hasPublishedVisit = proposals.some(p => p.client_status === 'liked' && p.visit_published);
    if (hasPublishedVisit) return 3;
    
    // If all proposals reviewed and at least one liked, also show stage 3
    const allReviewed = proposals.length > 0 && proposals.every(p => p.client_status !== 'pending');
    const hasLiked = proposals.some(p => p.client_status === 'liked');
    if (allReviewed && hasLiked) return 3;
  }
  
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

function listingStatusToStage(ls: ListingStatus): number {
  switch (ls) {
    case 'research': return 2;
    case 'viewings': return 3;
    case 'documents': return 4;
    case 'completed': return 5;
  }
}

function proposalToApartment(proposal: PropertyProposal): SelectedApartment {
  return {
    id: proposal.id,
    images: proposal.photos.length > 0 
      ? proposal.photos 
      : [],
    imagePositions: (proposal.photo_positions as unknown as Record<number, number> | null) || undefined,
    imageTitles: Array.isArray((proposal as any).photo_titles) ? (proposal as any).photo_titles as string[] : undefined,
    rent: proposal.rent || 0,
    rooms: proposal.rooms || 0,
    location: proposal.address || 'Lausanne',
    neighborhood: proposal.neighbourhood || 'Centre',
    description: proposal.description || '',
    amenities: proposal.tags || [],
    status: proposal.client_status,
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
  
  const caseStage = useMemo(() => getStageFromStatus(activeCase?.status, proposals), [activeCase?.status, proposals]);
  
  // Showcase-specific state
  // (also used in demo mode — pre-signed so all stages are navigable)
  const [showcaseContractData, setShowcaseContractData] = useState<ContractData | null>(
    isDemoMode ? { signed: true, timestamp: new Date().toISOString() } : null
  );
  const [showcaseStatus, setShowcaseStatus] = useState<CaseStatus>(
    isDemoMode ? 'key_handover_scheduled' : 'request_received'
  );
  
  const [highestStage, setHighestStage] = useState(isDemoMode && demoStage ? demoStage : 1);
  const [currentStage, setCurrentStage] = useState(isDemoMode && demoStage ? demoStage : 1);
  const [selectedApartment, setSelectedApartment] = useState<SelectedApartment | null>(
    isDemoMode ? DEMO_APARTMENT : null
  );
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  
  // Liked proposals that act as independent "listings" for the switcher
  const likedListings = useMemo(() =>
    proposals.filter(p => p.client_status === 'liked'),
    [proposals]
  );

  // The currently selected listing (for multi-listing support)
  const activeListing = useMemo(() => {
    if (likedListings.length === 0) return null;
    return likedListings.find(l => l.id === selectedListingId) || likedListings[0];
  }, [likedListings, selectedListingId]);

  // When the active listing changes, derive the stage from its listing_status
  const listingDerivedStage = activeListing ? listingStatusToStage(activeListing.listing_status) : null;
  
  // When stages 3 & 4 are both unlocked, switching between them isn't "read only"
  const isParallelActive = highestStage >= 3 && (currentStage === 3 || currentStage === 4);
  const isReadOnly = !isParallelActive && currentStage < highestStage;

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
        // If a listing is selected, derive stage from its listing_status
        const effectiveStage = listingDerivedStage ?? caseStage;
        setCurrentStage(prev => Math.max(prev, effectiveStage));
        setHighestStage(prev => Math.max(prev, effectiveStage));
      }
    }
  }, [caseStage, isOfflineMode, contractSigned, listingDerivedStage]);

  // Find first liked proposal with published visit for stage 3+
  useEffect(() => {
    if (isOfflineMode) return;
    if (activeListing) {
      setSelectedApartment(proposalToApartment(activeListing));
    } else {
      const likedProposals = proposals.filter(p => p.client_status === 'liked');
      const published = likedProposals.find(p => p.visit_published);
      const target = published || likedProposals[0];
      if (target) {
        setSelectedApartment(proposalToApartment(target));
      }
    }
  }, [proposals, isOfflineMode, activeListing]);

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

  // Handle listing switcher selection
  const handleListingSelect = useCallback((listing: PropertyProposal) => {
    setSelectedListingId(listing.id);
    setSelectedApartment(proposalToApartment(listing));
    const stage = listingStatusToStage(listing.listing_status);
    setCurrentStage(stage);
    setHighestStage(prev => Math.max(prev, stage));
    scrollToContent();
  }, []);

  // Full list mapped for the research gallery — clients can browse all
  // proposals (including liked/rejected) and change their mind any time.
  const galleryProposals = useMemo(() =>
    proposals.map(proposalToApartment),
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

  const displayProfile = isOfflineMode ? (isDemoMode ? DEMO_PROFILE : SHOWCASE_PROFILE) : profile;
  const displayCase = isOfflineMode
    ? makeDemoCase(showcaseStatus, showcaseContractData)
    : activeCase;
  const displayKeyHandover = isOfflineMode ? DEMO_KEY_HANDOVER : keyHandover;
  const displayUserName = isShowcaseMode ? 'Sarah Mitchell' : isDemoMode ? 'Demo User' : profile?.name;
  const displayDocuments = isOfflineMode ? SHOWCASE_DOCUMENTS : documents;

  // Offline (demo + showcase): use rich mock proposals and dummy handlers
  const showcaseProposals = isOfflineMode ? SHOWCASE_PROPOSALS : undefined;
  const resolvedOnLike = isOfflineMode ? handleShowcaseLike : handleResearchLike;
  const resolvedOnReject = isOfflineMode ? handleShowcaseReject : handleRejectProposal;
  const resolvedOnSign = isOfflineMode ? handleShowcaseSign : signContract;
  const resolvedOnVisitComplete = isOfflineMode ? handleShowcaseVisitComplete : handleNextStep;
  const resolvedOnDocsComplete = isOfflineMode ? handleShowcaseDocsComplete : handleNextStep;
  const resolvedSelectedApartment = isOfflineMode
    ? (selectedApartment || SHOWCASE_PROPOSALS[1])
    : selectedApartment;

  // Showcase: advance stage after contract signing
  const handleShowcaseNextStep = () => {
    if (isOfflineMode) {
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

      {isOfflineMode && (
        <>
          <div className="fixed top-[76px] right-3 z-40 bg-amber-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full shadow-md tracking-wider uppercase">
            {isDemoMode ? 'Demo Mode' : 'Showcase'}
          </div>
          <div className="fixed bottom-4 right-4 z-40 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg p-3 flex flex-col gap-2 max-w-[180px]">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold px-1">Jump to stage</div>
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setCurrentStage(s);
                    setHighestStage((prev) => Math.max(prev, s));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`h-8 rounded-md text-xs font-semibold transition-colors ${
                    currentStage === s
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="text-[10px] text-slate-400 px-1 leading-tight">
              1·Criteria 2·Research 3·Visit 4·Docs 5·Keys
            </div>
          </div>
        </>
      )}
      
      <TrackerProgressBar 
        currentStage={currentStage}
        highestStage={highestStage}
        onStageClick={setCurrentStage} 
        unreadStages={unreadStages}
      />

      {/* Listing Switcher — only for real data with multiple liked listings */}
      {!isOfflineMode && likedListings.length > 1 && (
        <ListingSwitcher
          listings={likedListings}
          activeListingId={activeListing?.id || null}
          onSelect={handleListingSelect}
        />
      )}
      
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
              proposals={showcaseProposals || galleryProposals}
              allProposals={isShowcaseMode ? undefined : galleryProposals}
              onLike={resolvedOnLike}
              onReject={resolvedOnReject}
              onAllReviewed={isShowcaseMode ? undefined : handleAllReviewed}
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
