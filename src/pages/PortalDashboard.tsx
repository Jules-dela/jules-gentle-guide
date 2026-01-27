import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TrackerProgressBar } from '@/components/portal/TrackerProgressBar';
import { CriteriaSummary } from '@/components/portal/CriteriaSummary';
import { ResearchGallery, type SelectedApartment } from '@/components/portal/ResearchGallery';
import { VisitReport } from '@/components/portal/VisitReport';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function PortalDashboard() {
  const { user, loading: authLoading } = useAuth();
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
          
          {currentStage > 3 && (
            <div key="stage-placeholder" className="max-w-2xl mx-auto text-center py-20">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Stage {currentStage} - Coming Soon
              </h2>
              <p className="text-muted-foreground">
                This stage will be implemented next.
              </p>
            </div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
