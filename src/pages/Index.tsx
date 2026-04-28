import { useEffect, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";

const StickyStackingCards = lazy(() => import("@/components/StickyStackingCards").then(m => ({ default: m.StickyStackingCards })));
const FAQ = lazy(() => import("@/components/FAQ").then(m => ({ default: m.FAQ })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const BackToTop = lazy(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })));

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
        <Suspense fallback={null}>
          <StickyStackingCards />
          <FAQ />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <BackToTop />
      </Suspense>
    </div>
  );
};

export default Index;
