import { lazy, Suspense } from "react";
import { CriteriaForm } from "@/components/CriteriaForm";
import { Header } from "@/components/Header";

const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

const Apply = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />
      <main>
        <CriteriaForm />
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </div>
  );
};

export default Apply;
