import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setOpen(false);
    
    // If not on home page, navigate there first with the section hash
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    
    // Small delay to let the mobile menu close first
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 80; // Account for fixed header
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
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
          <Link 
            to="/" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={`text-[18px] font-bold transition-colors duration-300 ${
              scrolled ? 'text-[#1E3A8A]' : 'text-white'
            }`}
          >
            UNIKEY
          </Link>
          
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('partners')} 
              className={`text-[16px] font-normal hover:opacity-80 transition-all duration-300 ${
                scrolled ? 'text-[#1E3A8A]' : 'text-white'
              }`}
            >
              Partners
            </button>
            <button 
              onClick={() => scrollToSection('testimonials')} 
              className={`text-[16px] font-normal hover:opacity-80 transition-all duration-300 ${
                scrolled ? 'text-[#1E3A8A]' : 'text-white'
              }`}
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('apply')} 
              className={`text-[16px] font-normal hover:opacity-80 transition-all duration-300 ${
                scrolled ? 'text-[#1E3A8A]' : 'text-white'
              }`}
            >
              Apply
            </button>
          </nav>

          {/* Mobile Hamburger Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <button className={`transition-colors duration-300 ${
                scrolled ? 'text-[#1E3A8A]' : 'text-white'
              }`}>
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