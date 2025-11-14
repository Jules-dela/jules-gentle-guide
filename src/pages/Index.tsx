import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Partners } from "@/components/Partners";
import { Testimonials } from "@/components/Testimonials";
import { ApplicationForm } from "@/components/ApplicationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Partners />
        <Testimonials />
        <ApplicationForm />
      </main>
    </div>
  );
};

export default Index;
