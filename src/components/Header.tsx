import { useState, useEffect } from "react";

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);

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
          
          {/* Navigation Links */}
          <nav className="flex items-center gap-8">
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
        </div>
      </div>
    </header>
  );
};