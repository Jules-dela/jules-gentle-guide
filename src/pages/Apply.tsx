import { lazy, Suspense } from "react";
import { CriteriaForm } from "@/components/CriteriaForm";
import { LandingNav } from "@/components/landing/LandingNav";

const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const Apply = () => {
  return (
    <div className="min-h-screen bg-white">
      <LandingNav />
      <main className="pt-16">
        <CriteriaForm />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Apply;
