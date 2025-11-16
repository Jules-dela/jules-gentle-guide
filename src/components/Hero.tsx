import { Button } from "@/components/ui/button";
import { ArrowDown, Check } from "lucide-react";

export const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <section className="h-screen relative bg-[#1E3A8A] overflow-hidden flex items-start">
      {/* Circular gradient background element */}
      <div 
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full translate-x-1/2 translate-y-1/2 opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(43, 74, 138, 0.3) 0%, transparent 70%)',
          zIndex: 0
        }}
      />

      {/* Main content */}
      <div className="relative z-10 pl-20 pt-[120px] pb-[60px] pr-20 max-w-[1400px]">
        {/* Headline */}
        <h1 
          className="text-[60px] font-semibold text-white leading-[1.15] tracking-[-0.02em] max-w-[900px] mb-6"
        >
          Your perfect student apartment in Lausanne
        </h1>

        {/* Subheadline */}
        <p 
          className="text-[20px] font-normal text-white/85 max-w-[600px] mb-10"
        >
          Found for you. We do the searching, you focus on your studies.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-5 mb-5">
          <Button 
            onClick={() => scrollToSection('apply')} 
            className="bg-white text-[#1E3A8A] hover:bg-white/95 font-medium text-[16px] px-10 py-4 h-auto rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300"
          >
            Get matched
          </Button>
          <Button 
            onClick={() => scrollToSection('testimonials')} 
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#1E3A8A] font-medium text-[16px] px-10 py-4 h-auto rounded-lg transition-all duration-300"
          >
            Our services
          </Button>
        </div>

        {/* Trust signal */}
        <div className="flex items-center gap-2 text-white/75 text-[16px]">
          <Check className="w-4 h-4" />
          <span>Reponse in 24 hours</span>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/60 text-[12px] uppercase tracking-[0.1em]">Scroll to explore</span>
        <ArrowDown className="w-4 h-4 text-white/60" />
      </div>
    </section>
  );
};