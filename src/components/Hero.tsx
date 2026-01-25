import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <AuroraBackground className="flex items-center justify-center">
      {/* Main content */}
      <div className="relative z-10 px-5 md:px-20 w-full flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="text-[32px] sm:text-[42px] md:text-[60px] font-semibold text-white leading-[1.15] tracking-[-0.02em] max-w-[900px] mb-4 md:mb-6">
          Your perfect student apartment in Lausanne.
        </h1>

        {/* Subheadline */}
        <p className="text-[16px] md:text-[20px] font-normal text-white/85 max-w-[600px] mb-8 md:mb-10">
          We do the searching, you focus on your studies. We find it. You live it.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 md:gap-5 mb-5">
          <Button onClick={() => scrollToSection('apply')} className="bg-white text-navy hover:bg-white/95 font-medium text-[14px] md:text-[16px] px-8 md:px-10 py-3 md:py-4 h-auto rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-all duration-300 w-full sm:w-auto">
            Get matched
          </Button>
          <Button onClick={() => scrollToSection('testimonials')} className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy font-medium text-[14px] md:text-[16px] px-8 md:px-10 py-3 md:py-4 h-auto rounded-lg transition-all duration-300 w-full sm:w-auto">
            Our services
          </Button>
        </div>
      </div>

    </AuroraBackground>
  );
};