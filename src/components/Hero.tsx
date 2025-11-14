import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export const Hero = () => {
  const { ref, isVisible } = useScrollAnimation();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 lg:py-32 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="relative rounded-3xl overflow-hidden backdrop-blur-xl bg-gradient-hero shadow-2xl border border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
            <div className="relative p-8 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                    We find it. You live it
                  </h2>
                  <p className="text-lg text-white/90">
                    Your perfect student apartment in Lausanne, found for you. We do the searching, you focus on your studies.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" onClick={() => scrollToSection('apply')} className="bg-white text-primary hover:bg-white/90 shadow-lg">
                    Get matched
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => scrollToSection('testimonials')}
                    className="border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  >
                    See testimonials
                  </Button>
                </div>
                <p className="text-sm text-white/80">
                  Average placement time: under 5 days
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white shadow-lg flex-shrink-0" />
                  <p className="text-white">Your ideal flat, found for you</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white shadow-lg flex-shrink-0" />
                  <p className="text-white">No paperwork stress — we handle it all</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white shadow-lg flex-shrink-0" />
                  <p className="text-white">Keys waiting when you arrive</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-white shadow-lg flex-shrink-0" />
                  <p className="text-white">A seamless start to student life</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};
