import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Benefits } from "@/components/Benefits";
import { Partners } from "@/components/Partners";
import { Testimonials } from "@/components/Testimonials";
import { ApplicationForm } from "@/components/ApplicationForm";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Partners />
        <Testimonials />
        <ApplicationForm />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
