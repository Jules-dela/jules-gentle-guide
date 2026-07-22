import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/unikey-wordmark.png.asset.json";

const applyHref = "/apply";

export function LandingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { href: "/#how", label: "How it works" },
    { href: "/#pricing", label: "Pricing" },
    { href: "/#proof", label: "Students" },
    { href: "/#faq", label: "FAQ" },
  ];
  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all ${
        scrolled
          ? "bg-white/85 backdrop-blur-md border-b border-uk-hairline"
          : "bg-white/70 backdrop-blur border-b border-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-5 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <img
            src={logoAsset.url}
            alt="UniKey"
            className="h-[40px] w-auto md:h-[38px]"
          />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] text-uk-ink/80 hover:text-uk-navy-dark transition-colors"
            >
              {l.label}
            </a>
          ))}
          <Link
            to={applyHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-uk-navy px-5 py-2.5 text-[14px] font-medium text-white hover:bg-uk-navy-dark transition-colors"
          >
            Start your search
          </Link>
        </nav>
        <div className="md:hidden flex items-center gap-2">
          <Link
            to={applyHref}
            className="inline-flex items-center rounded-full bg-uk-navy px-4 py-2 text-[13px] font-medium text-white"
          >
            Start your search
          </Link>
          <button
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className="p-2 text-uk-navy-dark"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-uk-hairline bg-white">
          <nav className="mx-auto max-w-6xl px-5 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-2 text-[15px] text-uk-ink"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}