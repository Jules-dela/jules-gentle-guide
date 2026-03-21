import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";

interface Listing {
  name: string;
  address: string;
  price: string;
  surface?: string;
  rooms?: string;
  floor?: string | null;
  highlights?: string[];
  description: string;
  url: string | null;
  source?: string;
  match_score?: number;
}

interface PortalUrl {
  name: string;
  url: string;
}

interface SearchResults {
  analysis: string;
  listings: Listing[];
  portalUrls?: PortalUrl[];
}

interface FormState {
  budget_min: string;
  budget_max: string;
  area: string;
  rooms: string;
  duration: string;
  moving_date: string;
  university: string;
  property_type: string;
  roommates: string;
  furnished: boolean;
  near_transport: boolean;
}

const Ic = ({ d, size = 14 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const PORTAL_COLORS: Record<string, string> = {
  "Homegate": "bg-red-50 text-red-600 border-red-100",
  "ImmoScout24": "bg-blue-50 text-blue-600 border-blue-100",
  "Flatfox": "bg-green-50 text-green-700 border-green-100",
  "Anibis": "bg-orange-50 text-orange-600 border-orange-100",
  "Naef Immobilier": "bg-stone-50 text-stone-700 border-stone-200",
  "Comptoir Immobilier": "bg-amber-50 text-amber-700 border-amber-100",
  "Moser Vatter": "bg-indigo-50 text-indigo-600 border-indigo-100",
  "Cardis Sotheby's": "bg-stone-50 text-stone-800 border-stone-200",
};

export default function AdminSearch() {
  const [form, setForm] = useState<FormState>({
    budget_min: "", budget_max: "", area: "", rooms: "",
    duration: "", moving_date: "", university: "",
    property_type: "Appartement", roommates: "Non",
    furnished: false, near_transport: false,
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggle = (k: keyof FormState) => setForm(f => ({ ...f, [k]: !f[k] }));
  const canSearch = !!(form.budget_max || form.budget_min || form.area || form.university);

  async function search() {
    setLoading(true);
    setResults(null);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("search-listings", {
        body: { ...form },
      });
      if (fnError) throw new Error(fnError.message);
      if (data?.error) throw new Error(data.error);
      setResults(data);
    } catch (e: any) {
      setError(e.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (results && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  const inputClass =
    "bg-muted border border-border rounded-sm px-3 py-2.5 text-base text-foreground outline-none focus:border-primary transition-colors w-full placeholder:text-muted-foreground placeholder:italic";
  const selectClass =
    "bg-muted border border-border rounded-sm px-3 py-2.5 text-base text-foreground outline-none focus:border-primary transition-colors w-full appearance-none";
  const labelClass =
    "font-mono text-[9px] tracking-widest uppercase text-muted-foreground flex items-center gap-1.5";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto py-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">UNIKEY</h1>
          <p className="text-sm tracking-widest uppercase text-muted-foreground">We find it. You live it.</p>
        </div>

        <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">— Critères de recherche</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className={labelClass}>
              <Ic d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              Budget (CHF / mois)
            </label>
            <div className="flex items-center gap-2">
              <input className={inputClass} type="number" placeholder="Min" value={form.budget_min} onChange={(e) => set("budget_min", e.target.value)} />
              <span className="text-muted-foreground">–</span>
              <input className={inputClass} type="number" placeholder="Max" value={form.budget_max} onChange={(e) => set("budget_max", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              <Ic d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              Zone / Quartier
            </label>
            <input className={inputClass} placeholder="Ex : Lausanne, Genève Centre…" value={form.area} onChange={(e) => set("area", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              <Ic d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              Nombre de pièces
            </label>
            <select className={selectClass} value={form.rooms} onChange={(e) => set("rooms", e.target.value)}>
              <option value="">Indifférent</option>
              <option>Studio</option>
              <option>2 pièces</option>
              <option>3 pièces</option>
              <option>4 pièces</option>
              <option>5 pièces et plus</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              <Ic d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              Durée
            </label>
            <select className={selectClass} value={form.duration} onChange={(e) => set("duration", e.target.value)}>
              <option value="">Non précisée</option>
              <option>3 mois</option>
              <option>6 mois</option>
              <option>12 mois</option>
              <option>24 mois</option>
              <option>Indéterminée</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              <Ic d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              Date d'emménagement
            </label>
            <input className={inputClass} type="date" value={form.moving_date} onChange={(e) => set("moving_date", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              <Ic d="M22 10v6M2 10l10-5 10 5-10 5z M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
              Université / École
            </label>
            <input className={inputClass} placeholder="Ex : EPFL, UNIL, EHL…" value={form.university} onChange={(e) => set("university", e.target.value)} />
          </div>
        </div>

        <hr className="border-border" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className={labelClass}>
              <Ic d="M3 21h18M3 7v1a3 3 0 006 0V7m0 1a3 3 0 006 0V7m0 1a3 3 0 006 0V7H3l2-4h14l2 4M5 21V10.7" />
              Type de bien
            </label>
            <select className={selectClass} value={form.property_type} onChange={(e) => set("property_type", e.target.value)}>
              <option>Appartement</option>
              <option>Studio</option>
              <option>Maison</option>
              <option>Chambre</option>
              <option>Colocation</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>
              <Ic d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" />
              Colocataires
            </label>
            <select className={selectClass} value={form.roommates} onChange={(e) => set("roommates", e.target.value)}>
              <option>Non</option>
              <option>Oui</option>
              <option>Indifférent</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          {[
            { key: "furnished", label: "Meublé", d: "M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z M8 21v-2 M16 21v-2" },
            { key: "near_transport", label: "Proche transports", d: "M8 6v6 M15 6v6 M2 12h19.6 M5 18a2 2 0 100 4 2 2 0 000-4z M19 18a2 2 0 100 4 2 2 0 000-4z" },
          ].map(({ key, label, d }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key as keyof FormState)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border font-mono text-[10px] tracking-widest uppercase transition-all ${
                form[key as keyof FormState]
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-muted border-border text-muted-foreground"
              }`}
            >
              <Ic d={d} size={12} />
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={search}
          disabled={!canSearch || loading}
          className="w-full py-3.5 bg-primary text-primary-foreground font-mono text-xs tracking-widest uppercase rounded-sm hover:bg-primary/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="w-1.5 h-1.5 bg-primary-foreground rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
              Recherche en cours
            </>
          ) : (
            <>
              <Ic d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              Lancer la recherche
            </>
          )}
        </button>

        {loading && (
          <p className="text-center text-sm text-muted-foreground animate-pulse">
            Exploration des portails immobiliers du canton de Vaud…
          </p>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-sm text-destructive text-sm">
            ⚠ {error}
          </div>
        )}

        {results && (
          <div ref={resultsRef} className="space-y-6 pt-4">
            {/* Portal shortcuts */}
            {results.portalUrls && results.portalUrls.length > 0 && (
              <div className="space-y-3">
                <p className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
                  — Accès direct aux portails (critères pré-filtrés)
                </p>
                <div className="flex flex-wrap gap-2">
                  {results.portalUrls.map((p) => (
                    <a
                      key={p.name}
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-opacity hover:opacity-80 ${
                        PORTAL_COLORS[p.name] || "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      <Ic d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3" size={12} />
                      {p.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">Sélection Unikey</h2>
              <span className="text-sm text-muted-foreground">
                {results.listings?.length} bien{results.listings?.length > 1 ? "s" : ""} trouvé{results.listings?.length > 1 ? "s" : ""}
              </span>
            </div>

            {results.listings?.map((l, i) => (
              <div key={i} className="border border-border rounded-lg overflow-hidden flex flex-col md:flex-row">
                <div className="flex-1 p-5 space-y-3">
                  {l.source && (
                    <span className="inline-block text-[10px] font-mono tracking-widest uppercase bg-muted text-muted-foreground px-2 py-0.5 rounded">
                      {l.source}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-foreground">{l.name}</h3>
                  <p className="text-sm text-muted-foreground">{l.address}</p>

                  <div className="flex flex-wrap gap-1.5">
                    {[l.surface, l.rooms, l.floor, ...(l.highlights || [])].filter(Boolean).map((tag, j) => (
                      <span key={j} className="text-[10px] font-mono tracking-wider uppercase bg-accent text-accent-foreground px-2 py-0.5 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">{l.description}</p>

                  {l.url ? (
                    <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline font-medium">
                      <Ic d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6 M15 3h6v6 M10 14L21 3" />
                      Voir l'annonce
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">
                      Annonce indicative — utilise les portails ci-dessus
                    </span>
                  )}
                </div>

                <div className="w-full md:w-48 bg-muted p-5 flex flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-border">
                  <p className="text-xl font-bold text-foreground">{l.price}</p>
                  <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">loyer mensuel</p>
                  {l.match_score != null && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-16 h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${l.match_score}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground">{l.match_score}% match</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {results.analysis && (
              <div className="p-5 bg-muted rounded-lg text-sm text-muted-foreground leading-relaxed italic">
                <span className="text-2xl text-primary font-serif not-italic leading-none mr-1">"</span>
                {results.analysis}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
