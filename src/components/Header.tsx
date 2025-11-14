import { Button } from "@/components/ui/button";

export const Header = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold">UNIKEY</h1>
          <nav className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => scrollToSection('partners')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Partners
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Testimonials
            </button>
            <button 
              onClick={() => scrollToSection('apply')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Apply
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => scrollToSection('apply')}
            className="hidden sm:inline-flex"
          >
            Get matched
          </Button>
          <Button onClick={() => scrollToSection('apply')}>
            Start now
          </Button>
        </div>
      </div>
    </header>
  );
};
