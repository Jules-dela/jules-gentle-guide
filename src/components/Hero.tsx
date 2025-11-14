import { Button } from "@/components/ui/button";

export const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="py-20 lg:py-32">
      <div className="container">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-3xl bg-secondary p-8 lg:p-16">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">
                    We find it. You live it
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Your perfect student apartment in Lausanne, found for you. We do the searching, you focus on your studies.
                  </p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" onClick={() => scrollToSection('apply')}>
                    Get matched
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    onClick={() => scrollToSection('testimonials')}
                  >
                    See testimonials
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Average placement time: under 5 days
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-foreground flex-shrink-0" />
                  <p className="text-foreground">Your ideal flat, found for you</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-foreground flex-shrink-0" />
                  <p className="text-foreground">No paperwork stress — we handle it all</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-foreground flex-shrink-0" />
                  <p className="text-foreground">Keys waiting when you arrive</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 h-2 w-2 rounded-full bg-foreground flex-shrink-0" />
                  <p className="text-foreground">A seamless start to student life</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
