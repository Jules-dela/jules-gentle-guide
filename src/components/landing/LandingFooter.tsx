import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import logoAsset from "@/assets/unikey-wordmark.png.asset.json";

export function LandingFooter() {
  const quickLinks = [
    { href: "/#how", label: "How it works" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#proof", label: "Students" },
    { href: "/#faq", label: "FAQ" },
  ];
  return (
    <footer className="bg-uk-navy-dark text-white">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-14 md:py-20">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div>
            <h3 className="text-[12px] font-mono tracking-widest uppercase text-white/50 mb-5">
              Quick links
            </h3>
            <nav className="grid grid-cols-2 gap-x-6 gap-y-3">
              {quickLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="text-[14px] text-white/70 hover:text-white transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
          <div className="md:text-right">
            <img
              src={logoAsset.url}
              alt="UniKey"
              className="h-[40px] w-auto md:h-[48px] md:ml-auto"
            />
            <p className="mt-5 font-display text-[18px] md:text-[20px] text-white/90 leading-snug">
              Your trusted student housing partner in Lausanne, Switzerland.
            </p>
            <div className="mt-4 flex flex-col gap-2 md:items-end">
              <a
                href="mailto:contact@uni-key.ch"
                className="text-[14px] text-white/70 hover:text-white transition-colors"
              >
                contact@uni-key.ch
              </a>
              <a
                href="https://www.instagram.com/unikey.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[14px] text-white/70 hover:text-white transition-colors"
              >
                <Instagram className="h-4 w-4" />
                <span>@unikey.ch</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[12px] text-white/50">
          <span>© {new Date().getFullYear()} UniKey. All rights reserved.</span>
          <Link to="/privacy-policy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}
