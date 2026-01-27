import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function PortalDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { profile } = useClientPortal();
  const navigate = useNavigate();
  const [currentStage, setCurrentStage] = useState(1);
  const [selectedApartment, setSelectedApartment] = useState<SelectedApartment | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleNextStep = (apartment?: SelectedApartment) => {
    if (apartment) {
      setSelectedApartment(apartment);
    }
    setCurrentStage((prev) => Math.min(prev + 1, 5));
  };

  const handleResearchComplete = (apartment: SelectedApartment) => {
    setSelectedApartment(apartment);
    setCurrentStage((prev) => Math.min(prev + 1, 5));
  };

  const handleBackToResearch = () => {
    setCurrentStage(2);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

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
            <CriteriaSummary key="stage-1" onNextStep={handleNextStep} />
          )}
          
          {currentStage === 2 && (
            <ResearchGallery key="stage-2" onComplete={handleResearchComplete} />
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
              onComplete={handleNextStep} 
            />
          )}
          
          {currentStage > 4 && selectedApartment && (
            <KeyHandoverStage 
              key="stage-5" 
              apartment={selectedApartment}
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
