import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-8 md:py-12">
      <div className="container px-5 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">UNIKEY</h3>
            <p className="text-sm opacity-90 mb-2">
              Your trusted student housing partner in Lausanne, Switzerland
            </p>
            <p className="text-sm opacity-80">
              Chemin du vieux tilleul 16<br />
              Prilly, 1008, Switzerland
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm opacity-90 hover:opacity-100 transition-opacity text-left"
              >
                Home
              </button>
              <a href="/#partners" className="text-sm opacity-90 hover:opacity-100 transition-opacity">
                Partners
              </a>
              <a href="/#testimonials" className="text-sm opacity-90 hover:opacity-100 transition-opacity">
                Services
              </a>
              <a href="/#apply" className="text-sm opacity-90 hover:opacity-100 transition-opacity">
                Apply
              </a>
            </nav>
          </div>

          {/* Legal & Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Legal & Contact</h3>
            <nav className="flex flex-col gap-2 mb-4">
              <Link to="/privacy-policy" className="text-sm opacity-90 hover:opacity-100 transition-opacity">
                Privacy Policy
              </Link>
              <Link to="/privacy-policy" className="text-sm opacity-90 hover:opacity-100 transition-opacity">
                Data Protection
              </Link>
            </nav>
            <div className="text-sm opacity-90">
              <p className="mb-1">
                <strong>Email:</strong>
              </p>
              <a href="mailto:contact@unikey.ch" className="hover:opacity-100 transition-opacity">
                contact@unikey.ch
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-primary-foreground/20 text-center">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()} Unikey. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
