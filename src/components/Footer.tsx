import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";

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
              <Link 
                to="/" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm opacity-90 hover:opacity-100 transition-opacity"
              >
                Home
              </Link>
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
              <Link 
                to="/privacy-policy" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-sm opacity-90 hover:opacity-100 transition-opacity"
              >
                Privacy Policy
              </Link>
            </nav>
            <div className="text-sm opacity-90">
              <p className="mb-1">
                <strong>Email:</strong>
              </p>
              <a href="mailto:contact@uni-key.ch" className="hover:opacity-100 transition-opacity">
                contact@uni-key.ch
              </a>
            </div>
            <a 
              href="https://instagram.com/unikey.ch" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 text-sm opacity-90 hover:opacity-100 transition-opacity"
            >
              <Instagram size={20} />
              <span>@unikey.ch</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-primary-foreground/20 flex items-center justify-center">
          <p className="text-sm opacity-80">
            © {new Date().getFullYear()}{" "}
            <Link 
              to="/auth" 
              className="hover:opacity-100 transition-opacity"
            >
              Unikey
            </Link>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
