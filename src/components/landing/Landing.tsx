import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Check, ArrowRight, Plus, Search, Video, FileCheck, Key } from "lucide-react";
import logoAsset from "@/assets/UNIKEY_logo-simple_01.png.asset.json";

const applyHref = "/apply";

const formatCHF = (n: number) => {
  const rounded = Math.round(n);
  const withSep = rounded.toLocaleString("en-US").replace(/,/g, ",");
  return `CHF ${withSep}`;
};

/* ---------------- Nav ---------------- */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    { href: "#how", label: "How it works" },
    { href: "#pricing", label: "Pricing" },
    { href: "#proof", label: "Students" },
    { href: "#faq", label: "FAQ" },
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
        <a href="#top" className="flex items-center">
          <img
            src={logoAsset.url}
            alt="UniKey"
            className="h-9 w-auto"
          />
        </a>
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

/* ---------------- Hero ---------------- */
function Hero() {
  return (
    <section id="top" className="pt-28 md:pt-32 pb-16 md:pb-24 bg-white">
      <div className="mx-auto max-w-6xl px-5 md:px-8 grid md:grid-cols-2 gap-10 md:gap-14 items-center">
        <div>
          <h1 className="font-display font-normal text-uk-ink leading-[1.02] tracking-[-0.02em] text-[46px] sm:text-[58px] md:text-[68px] lg:text-[80px]">
            Your keys to Lausanne,{" "}
            <span className="italic text-uk-navy-light">found for you.</span>
          </h1>
          <p className="mt-6 text-[17px] md:text-[18px] leading-relaxed text-uk-muted max-w-[520px]">
            Skip the 40-viewing scramble. We source, visit, and vet apartments for you,
            then hand you the keys.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to={applyHref}
              className="inline-flex items-center gap-2 rounded-full bg-uk-navy px-6 py-3.5 text-[15px] font-medium text-white hover:bg-uk-navy-dark transition-colors"
            >
              Start your search <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full border border-uk-hairline bg-white px-6 py-3.5 text-[15px] font-medium text-uk-ink hover:border-uk-navy transition-colors"
            >
              See how it works
            </a>
          </div>
        </div>

        {/* Live search card */}
        <div className="relative">
          <div
            className="rounded-[22px] bg-uk-navy-dark text-white p-6 md:p-8"
            style={{
              boxShadow:
                "0 1px 2px rgba(26,33,54,.04), 0 24px 60px rgba(12,36,97,.25)",
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="font-mono text-[11px] tracking-widest uppercase text-uk-gold-light">
                Live search
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-uk-gold animate-pulse" />
                <span className="font-mono text-[11px] text-white/70">active</span>
              </div>
            </div>
            <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-5 mb-5">
              <div className="font-display text-[22px] leading-tight">Studio · Ouchy</div>
              <div className="mt-1 text-[13px] text-white/70">
                CHF 1,480/mo · furnished · 2 min to metro
              </div>
            </div>
            <ul className="space-y-3">
              {[
                { label: "Sourced & shortlisted", state: "done" },
                { label: "Visited on your behalf", state: "done" },
                { label: "Dossier submitted", state: "current" },
                { label: "Keys handed over", state: "upcoming" },
              ].map((row) => (
                <li
                  key={row.label}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className="flex items-center gap-3 text-[14px]">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        row.state === "done"
                          ? "bg-uk-gold"
                          : row.state === "current"
                          ? "bg-white"
                          : "bg-white/25"
                      }`}
                    />
                    <span
                      className={
                        row.state === "upcoming" ? "text-white/50" : "text-white"
                      }
                    >
                      {row.label}
                    </span>
                  </span>
                  <span className="font-mono text-[10px] tracking-widest uppercase text-white/40">
                    {row.state}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Market stats ---------------- */
function Market() {
  // Provisional Statistique Vaud / État de Vaud figures at 1 June 2026.
  // Refresh once a year when Statistique Vaud publishes the new survey.
  const stats = [
    {
      value: "0.63%",
      caption:
        "of homes sit vacant in the Lausanne district, one of the tightest markets in Switzerland. A balanced market is considered 1.5%.",
    },
    {
      value: "1999",
      caption:
        "the last year Vaud's housing market was in balance. This shortage is structural, not seasonal.",
    },
    {
      value: "9 of 10",
      caption:
        "Vaud districts are officially classed as being in a housing shortage in 2026.",
    },
  ];
  return (
    <section className="border-t border-uk-hairline bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h2 className="font-display text-[34px] md:text-[46px] leading-[1.05] tracking-[-0.01em] text-uk-ink max-w-3xl">
          The Lausanne rental market wasn't built for students.
        </h2>
        <div className="mt-10 md:mt-14 rounded-[22px] bg-uk-navy-tint p-6 md:p-10">
          <div className="grid md:grid-cols-3 gap-6 md:gap-10">
            {stats.map((s) => (
              <div key={s.value} className="md:px-2">
                <div className="font-display text-[54px] md:text-[68px] leading-none text-uk-navy tracking-[-0.02em]">
                  {s.value}
                </div>
                <p className="mt-4 text-[14px] leading-relaxed text-uk-muted">
                  {s.caption}
                </p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-5 text-[12px] text-uk-muted">
          Sources:{" "}
          <a
            href="https://www.vd.ch/territoire-et-construction/observatoire-du-logement/statistiques-en-matiere-de-logement"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-uk-hairline hover:text-uk-navy-dark"
          >
            Statistique Vaud
          </a>{" "}
          and{" "}
          <a
            href="https://www.vd.ch/territoire-et-construction/logement/politique-du-logement/penurie-de-logements"
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-uk-hairline hover:text-uk-navy-dark"
          >
            État de Vaud
          </a>
          , provisional figures at 1 June 2026.
        </p>
      </div>
    </section>
  );
}

/* ---------------- How it works ---------------- */
function How() {
  const steps = [
    {
      n: "01",
      icon: Search,
      title: "You tell us what you need",
      body:
        "Your budget, your dates, and the areas you like. We start looking right away, including flats that never make it online.",
    },
    {
      n: "02",
      icon: Video,
      title: "We go and see them",
      body:
        "We visit each place in person and film a walkthrough for you, so you get a real feel for it, even from abroad.",
    },
    {
      n: "03",
      icon: FileCheck,
      title: "We prepare your file",
      body:
        "A Swiss rental application is a lot of work. We put together the full dossier landlords expect, so yours is the one they say yes to.",
    },
    {
      n: "04",
      icon: Key,
      title: "You get the keys",
      body:
        "Once you've picked a flat, we sort the lease and the deposit, then meet you to hand over the keys. You just move in.",
    },
  ];
  return (
    <section id="how" className="border-t border-uk-hairline bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h2 className="font-display text-[34px] md:text-[46px] leading-[1.05] tracking-[-0.01em] text-uk-ink max-w-3xl">
          Four steps. You do almost none of them.
        </h2>
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.n}>
                <div className="font-mono text-[12px] tracking-widest text-uk-muted">
                  {s.n}
                </div>
                <div className="mt-4 h-11 w-11 rounded-xl bg-uk-navy-tint text-uk-navy-light flex items-center justify-center">
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 font-display text-[22px] leading-snug text-uk-ink">
                  {s.title}
                </h3>
                <p className="mt-3 text-[14.5px] leading-relaxed text-uk-muted">
                  {s.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Pricing calculator ---------------- */
function Pricing() {
  const [rent, setRent] = useState(2000);
  const [people, setPeople] = useState(1);

  const { share, rawFee, fee, capped, floored, total } = useMemo(() => {
    const share = rent / people;
    const rawFee = share;
    let fee = rawFee;
    let capped = false;
    let floored = false;
    if (fee < 600) {
      fee = 600;
      floored = true;
    }
    if (fee > 2000) {
      fee = 2000;
      capped = true;
    }
    const total = Math.max(0, fee - 50);
    return { share, rawFee, fee, capped, floored, total };
  }, [rent, people]);

  const note = capped
    ? "Never more than CHF 2,000, whatever the rent. Your exact fee is confirmed on the flat you choose."
    : floored
    ? "Our fee starts at CHF 600. Your exact fee is confirmed on the flat you choose."
    : "Estimate in CHF, based on the rent you enter. Your exact fee is confirmed on the flat you choose.";

  return (
    <section id="pricing" className="border-t border-uk-hairline bg-white py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8 grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        <div>
          <h2 className="font-display text-[46px] md:text-[64px] leading-[1] tracking-[-0.02em] text-uk-ink">
            From CHF 600.
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-uk-muted max-w-md">
            Our fee is one month of your share of the rent, and it's capped so it's
            never a surprise.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              "You pay one month of your own share, not the whole flat's rent.",
              "Sharing with friends? Your fee drops with your share.",
              "Capped, so your fee is never a nasty surprise, and your CHF 50 deposit comes straight off the total.",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-uk-gold-tint text-uk-gold">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                </span>
                <span className="text-[15px] leading-relaxed text-uk-ink">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Calculator */}
        <div
          className="rounded-[22px] bg-uk-navy-dark text-white p-6 md:p-8"
          style={{ boxShadow: "0 24px 60px rgba(12,36,97,.25)" }}
        >
          <div className="font-mono text-[11px] tracking-widest uppercase text-uk-gold-light mb-6">
            Fee calculator
          </div>

          <div>
            <div className="flex items-baseline justify-between">
              <label className="text-[13px] text-white/75">
                Monthly rent of the flat
              </label>
              <div className="font-display text-[22px]">{formatCHF(rent)}</div>
            </div>
            <input
              type="range"
              min={600}
              max={6000}
              step={50}
              value={rent}
              onChange={(e) => setRent(parseInt(e.target.value, 10))}
              className="mt-3 w-full accent-uk-gold"
            />
            <div className="mt-1 flex justify-between font-mono text-[10px] text-white/40">
              <span>CHF 600</span>
              <span>CHF 6,000</span>
            </div>
          </div>

          <div className="mt-8">
            <div className="text-[13px] text-white/75">
              How many of you will live there?
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                { v: 1, label: "Just me" },
                { v: 2, label: "2" },
                { v: 3, label: "3" },
                { v: 4, label: "4" },
              ].map((p) => {
                const active = people === p.v;
                return (
                  <button
                    key={p.v}
                    type="button"
                    onClick={() => setPeople(p.v)}
                    className={`rounded-full py-2.5 text-[13px] font-medium border transition-colors ${
                      active
                        ? "bg-uk-gold-soft text-uk-navy-dark border-uk-gold-soft"
                        : "border-white/15 text-white/85 hover:border-white/40"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-8 space-y-3 border-t border-white/10 pt-6">
            <Row label="Your share of the rent" value={formatCHF(share)} />
            <Row
              label="UniKey fee (from CHF 600)"
              value={
                <>
                  {formatCHF(fee)}
                  {capped && (
                    <span className="ml-1 text-uk-gold-light font-mono text-[11px]">
                      (max)
                    </span>
                  )}
                  {floored && (
                    <span className="ml-1 text-uk-gold-light font-mono text-[11px]">
                      (min)
                    </span>
                  )}
                </>
              }
            />
            <Row label="Less your deposit" value={`- ${formatCHF(50)}`} muted />
          </div>

          <div className="mt-6 flex items-baseline justify-between border-t border-white/10 pt-6">
            <div className="text-[13px] text-white/75">Due when you sign</div>
            <div className="font-display text-[36px] leading-none">
              {formatCHF(total)}
            </div>
          </div>

          <p className="mt-5 text-[12px] leading-relaxed text-white/55">{note}</p>
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  value,
  muted,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-[13.5px] ${muted ? "text-white/55" : "text-white/80"}`}>
        {label}
      </span>
      <span
        className={`font-mono text-[14px] ${muted ? "text-white/55" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ---------------- Referral band ---------------- */
function Referral() {
  return (
    <section className="border-t border-uk-hairline bg-white py-16 md:py-24">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div
          className="rounded-[22px] bg-uk-navy-dark text-center px-6 py-14 md:py-20 md:px-10"
          style={{ boxShadow: "0 24px 60px rgba(12,36,97,.2)" }}
        >
          <h2 className="font-display text-white text-[32px] md:text-[46px] leading-[1.1] tracking-[-0.01em] max-w-3xl mx-auto">
            Most of our students come from a friend who's been through it.
          </h2>
          <p className="mt-5 text-[15.5px] md:text-[17px] leading-relaxed text-white/70 max-w-2xl mx-auto">
            UniKey grew by word of mouth on campus, because finding a flat here is
            stressful, and a good handover is worth talking about.
          </p>
          <Link
            to={applyHref}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-uk-gold-soft px-6 py-3.5 text-[15px] font-medium text-uk-navy-dark hover:bg-uk-gold-light transition-colors"
          >
            Start your search <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Proof (iOS notification cards) ---------------- */
function Proof() {
  const items = [
    {
      name: "Mei L.",
      time: "2d ago",
      msg:
        "Signed my lease from Hong Kong before I'd even landed. The video tours were so clear I felt like I'd already visited.",
      uni: "MSc student · EHL",
    },
    {
      name: "Adrien R.",
      time: "5d ago",
      msg:
        "The Swiss paperwork alone would've broken me. They handled the entire dossier and I just showed up to sign.",
      uni: "Exchange student · EPFL",
    },
    {
      name: "Sofia B.",
      time: "1w ago",
      msg:
        "Felt like checking into a hotel, not fighting for an apartment. The keys were ready the day I arrived in Lausanne.",
      uni: "Bachelor student · UNIL",
    },
    {
      name: "Luca M.",
      time: "2w ago",
      msg:
        "They found a studio near EPFL in my budget that never even hit the listing sites. I don't know how they do it.",
      uni: "MSc student · EPFL",
    },
  ];
  return (
    <section id="proof" className="border-t border-uk-hairline bg-uk-navy-tint py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <h2 className="font-display text-[34px] md:text-[46px] leading-[1.05] tracking-[-0.01em] text-uk-ink max-w-3xl">
          What they say about UniKey.
        </h2>
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {items.map((it) => (
            <div
              key={it.name}
              className="rounded-[20px] bg-white p-5 flex gap-4"
              style={{
                boxShadow:
                  "0 1px 2px rgba(26,33,54,.04), 0 12px 32px rgba(26,33,54,.06)",
              }}
            >
              <div className="h-[42px] w-[42px] shrink-0 rounded-[12px] bg-uk-navy-dark flex items-center justify-center">
                <Key className="h-5 w-5 text-uk-gold-soft" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="font-semibold text-[14.5px] text-uk-ink truncate">
                    {it.name}
                  </div>
                  <div className="text-[12px] text-uk-muted shrink-0">{it.time}</div>
                </div>
                <p className="mt-1 text-[14.5px] leading-relaxed text-uk-ink">
                  {it.msg}
                </p>
                <div className="mt-2 text-[12px] text-uk-muted">{it.uni}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
function FAQ() {
  const items = [
    {
      q: "Do I need to be in Switzerland to start?",
      a: "No. Most of our students start their search from abroad. We handle the visits, the video tours, and the paperwork so you can arrive to a signed lease.",
    },
    {
      q: "Which documents do I need to prepare?",
      a: "To build your dossier, we'll usually need a copy of your ID card, your B permit, your liability insurance (RC), your guarantor's three most recent payslips, and your previous address. If you're missing anything, we'll tell you exactly how to get it.",
    },
    {
      q: "What's the deposit when I start?",
      a: "A CHF 50 commitment deposit activates your search. It's fully deducted from your fee, so it simply confirms you're ready to begin.",
    },
    {
      q: "How fast will I see options?",
      a: "Once your search is active, we begin sourcing immediately and typically share your first vetted proposals within days.",
    },
    {
      q: "Which neighbourhoods do you cover?",
      a: "All of Lausanne and the surrounding student areas: Ouchy, Flon, Épalinges, Prilly, Renens, and the campus corridors near EHL, EPFL and UNIL.",
    },
  ];
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-uk-hairline bg-white py-20 md:py-28">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <h2 className="font-display text-[40px] md:text-[52px] leading-none tracking-[-0.01em] text-uk-ink">
          FAQ
        </h2>
        <div className="mt-10 divide-y divide-uk-hairline border-t border-uk-hairline">
          {items.map((it, i) => {
            const open = openIdx === i;
            return (
              <div key={it.q}>
                <button
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="w-full py-5 flex items-center justify-between gap-6 text-left"
                >
                  <span className="font-display text-[19px] md:text-[22px] text-uk-ink leading-snug">
                    {it.q}
                  </span>
                  <span
                    className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full border border-uk-hairline text-uk-gold transition-transform ${
                      open ? "rotate-45" : ""
                    }`}
                  >
                    <Plus className="h-4 w-4" strokeWidth={2} />
                  </span>
                </button>
                {open && (
                  <p className="pb-6 pr-12 text-[15px] leading-relaxed text-uk-muted">
                    {it.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Footer ---------------- */
function LandingFooter() {
  return (
    <footer className="bg-uk-navy-dark text-white">
      <div className="mx-auto max-w-6xl px-5 md:px-8 py-14 md:py-20">
        <div className="font-display text-[28px] md:text-[32px] tracking-tight">
          Uni<span className="text-uk-gold-soft">Key</span>
        </div>
        <p className="mt-6 font-display text-[22px] md:text-[26px] text-white/90">
          Student housing, handled.
        </p>
        <p className="mt-2 text-[14px] text-white/60">
          Lausanne, Switzerland ·{" "}
          <a
            href="mailto:contact@uni-key.ch"
            className="hover:text-white transition-colors"
          >
            contact@uni-key.ch
          </a>
        </p>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[12px] text-white/50">
          <span>© {new Date().getFullYear()} UniKey. All rights reserved.</span>
          <Link to="/privacy-policy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-uk-ink antialiased">
      <Nav />
      <main>
        <Hero />
        <Market />
        <How />
        <Pricing />
        <Referral />
        <Proof />
        <FAQ />
      </main>
      <LandingFooter />
    </div>
  );
}