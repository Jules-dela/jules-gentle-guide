import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

export const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative bg-navy overflow-hidden">
      {/* Subtle geometric background element */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/10" />
      </div>

      <div className="container relative z-10 px-6 md:px-14 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column - Main content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-[56px] md:text-[64px] leading-[1.1] font-bold text-white tracking-[-0.02em]">
                  Your perfect student apartment in Lausanne
                </h1>
                <p className="text-lg md:text-xl text-white/80 max-w-[600px]">
                  Found for you. We do the searching, you focus on your studies.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  onClick={() => scrollToSection('apply')} 
                  className="bg-white text-navy hover:bg-white/90 font-medium text-base px-8 h-12 rounded-lg shadow-lg"
                >
                  Get matched
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  onClick={() => scrollToSection('testimonials')} 
                  className="border-2 border-white text-white hover:bg-white hover:text-navy font-medium text-base px-8 h-12 rounded-lg bg-transparent"
                >
                  See testimonials
                </Button>
              </div>

              {/* Trust signal */}
              <p className="text-sm text-white/70 flex items-center gap-2">
                <span className="inline-block w-1 h-1 rounded-full bg-white/70" />
                Average placement time: under 5 days
              </p>
            </div>

            {/* Right column - Benefits */}
            <div className="space-y-4 lg:space-y-6">
              <div className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-white flex-shrink-0" />
                <p className="text-white text-base md:text-lg">Your ideal flat, found for you</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-white flex-shrink-0" />
                <p className="text-white text-base md:text-lg">No paperwork stress — we handle it all</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-white flex-shrink-0" />
                <p className="text-white text-base md:text-lg">Keys waiting when you arrive</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1.5 h-2 w-2 rounded-full bg-white flex-shrink-0" />
                <p className="text-white text-base md:text-lg">A seamless start to student life</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <span className="text-white/60 text-xs uppercase tracking-wider">Scroll to explore</span>
        <ArrowDown className="w-4 h-4 text-white/60" />
      </div>
    </section>
  );
};