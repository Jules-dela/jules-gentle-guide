import { Button } from "@/components/ui/button";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import heroBackground from "@/assets/hero-background.jpg";

export const Hero = () => {
  const { ref, isVisible } = useScrollAnimation();
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Full-screen hero with motto */}
      <section 
        className="min-h-screen flex items-center justify-center relative bg-cover bg-center"
        style={{ backgroundImage: `url(${heroBackground})` }}
      >
        <div className="absolute inset-0 bg-primary/40" />
        <div className="container relative z-10 text-center font-montserrat">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-semibold text-white mb-6 drop-shadow-2xl tracking-tight">
            We help students to find their home
          </h1>
          <p className="text-3xl md:text-5xl lg:text-6xl font-medium text-white drop-shadow-2xl">
            We <span className="font-extrabold text-primary">Find</span> it. You <span className="font-extrabold text-primary">Live</span> it.
          </p>
        </div>
      </section>

      {/* Detailed content section */}
      <section 
        ref={ref as React.RefObject<HTMLElement>}
        className={`py-20 lg:py-32 transition-all duration-1000 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-3xl border overflow-hidden bg-[radial-gradient(ellipse_at_left,hsl(221_39%_85%),hsl(221_39%_95%)_100%)]">
              <div className="px-6 md:px-14 py-14 md:py-20 grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-primary drop-shadow-lg">
                      Your perfect student apartment in Lausanne
                    </h2>
                    <p className="text-lg text-primary/80">
                      Found for you. We do the searching, you focus on your studies.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Button size="lg" onClick={() => scrollToSection('apply')} className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl border-2 border-primary/20">
                      Get matched
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      onClick={() => scrollToSection('testimonials')}
                      className="border-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 backdrop-blur-sm shadow-lg bg-white/50"
                    >
                      See testimonials
                    </Button>
                  </div>
                  <p className="text-sm text-primary/70">
                    Average placement time: under 5 days
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shadow-lg flex-shrink-0" />
                    <p className="text-primary">Your ideal flat, found for you</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shadow-lg flex-shrink-0" />
                    <p className="text-primary">No paperwork stress — we handle it all</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shadow-lg flex-shrink-0" />
                    <p className="text-primary">Keys waiting when you arrive</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shadow-lg flex-shrink-0" />
                    <p className="text-primary">A seamless start to student life</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
