import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PartnerBanner } from "@/components/PartnerBanner";
import { StickyStackingCards } from "@/components/StickyStackingCards";
import { WaitlistSection } from "@/components/WaitlistSection";
import { FAQ } from "@/components/FAQ";

import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";

const Index = () => {
  const location = useLocation();

  // Handle hash navigation when coming from another page
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [location.hash]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />
      <main>
        <Hero />
        
        
        <StickyStackingCards />
        <FAQ />
        <WaitlistSection />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
