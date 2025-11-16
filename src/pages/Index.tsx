import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { WorldMap } from "@/components/WorldMap";
import { Partners } from "@/components/Partners";
import { Testimonials } from "@/components/Testimonials";
import { ApplicationForm } from "@/components/ApplicationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />
      <main>
        <Hero />
        <WorldMap />
        <Partners />
        <Testimonials />
        <ApplicationForm />
      </main>
    </div>
  );
};

export default Index;
