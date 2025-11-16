import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({
      behavior: 'smooth'
    });
    setOpen(false);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/10 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="px-5 md:px-20 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <h1 className="text-[18px] font-bold text-white">UNIKEY</h1>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('partners')} 
              className="text-[16px] font-normal text-white hover:opacity-80 transition-opacity duration-300"
            >
              Partners
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className="text-[16px] font-normal text-white hover:opacity-80 transition-opacity duration-300"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('apply')} 
              className="text-[16px] font-normal text-white hover:opacity-80 transition-opacity duration-300"
            >
              Apply
            </button>
          </nav>

          {/* Mobile Hamburger Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className="text-white">
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#1E3A8A] border-l border-white/10">
              <nav className="flex flex-col gap-6 mt-8">
                <button 
                  onClick={() => scrollToSection('partners')} 
                  className="text-[18px] font-normal text-white hover:opacity-80 transition-opacity duration-300 text-left"
                >
                  Partners
                </button>
                <button 
                  onClick={() => scrollToSection('testimonials')} 
                  className="text-[18px] font-normal text-white hover:opacity-80 transition-opacity duration-300 text-left"
                >
                  Services
                </button>
                <button 
                  onClick={() => scrollToSection('apply')} 
                  className="text-[18px] font-normal text-white hover:opacity-80 transition-opacity duration-300 text-left"
                >
                  Apply
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};