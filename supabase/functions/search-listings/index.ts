import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;
const MODEL = "claude-sonnet-4-20250514";
const MAX_TURNS = 8;

const SYSTEM_PROMPT = `Tu es le moteur de recherche immobilier de Unikey, agence suisse haut de gamme. Tu utilises la recherche web pour trouver de VRAIES annonces immobilières sur Homegate, ImmoScout24, Flatfox, Comparis (Suisse) ou SeLoger, Bien'ici, PAP (France).

RÈGLE ABSOLUE SUR LES URLs :
- Tu dois retourner UNIQUEMENT des URLs pointant directement vers UNE annonce individuelle.
- Une URL directe contient un identifiant numérique ou alphanumérique unique, par exemple :
  ✅ https://www.homegate.ch/louer/4001234567
  ✅ https://www.immoscout24.ch/fr/immobilier/louer/annonce/123456
  ✅ https://www.flatfox.ch/fr/flat/1234/
  ✅ https://www.seloger.com/annonces/locations/appartement/paris/123456789.htm
- Une URL de recherche ou de liste est INTERDITE :
  ❌ https://www.homegate.ch/louer/immobilier?...
  ❌ N'importe quelle URL avec des paramètres de filtre (?rooms=, &price=, etc.)
- Si tu n'as pas d'URL directe, mets url: null. Ne fabrique JAMAIS une URL.

Réponds UNIQUEMENT en JSON valide, sans texte avant ou après, sans backticks :

{
  "analysis": "2-3 phrases d'analyse experte du marché en français.",
  "listings": [
    {
      "name": "Titre exact de l'annonce",
      "address": "Adresse ou quartier",
      "price": "CHF X'XXX / mois",
      "surface": "XX m²",
      "rooms": "X pièces",
      "floor": "Xème étage ou null",
      "highlights": ["tag1", "tag2"],
      "description": "Description en 2 phrases.",
      "url": "https://url-directe-annonce-individuelle.com/id/123456",
      "source": "Homegate",
      "match_score": 88
    }
  ]
}`;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function callAnthropicLoop(userPrompt: string): Promise<string> {
  let messages: any[] = [{ role: "user", content: userPrompt }];

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        system: SYSTEM_PROMPT,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Anthropic HTTP ${res.status}`);
    }

    const data = await res.json();
    const content = data.content || [];
    const hasToolUse = content.some((b: any) => b.type === "tool_use");

    if (!hasToolUse || data.stop_reason === "end_turn") {
      return content
        .filter((b: any) => b.type === "text")
        .map((b: any) => b.text)
        .join("");
    }

    messages.push({ role: "assistant", content });

    const toolResults = content
      .filter((b: any) => b.type === "tool_use")
      .map((b: any) => ({
        type: "tool_result",
        tool_use_id: b.id,
        content: b.content || JSON.stringify(b.output || ""),
      }));

    messages.push({ role: "user", content: toolResults });
  }

  throw new Error("Nombre maximum de tours atteint.");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      budget_min, budget_max, area, rooms,
      duration, moving_date, university,
      property_type, roommates, furnished, near_transport,
    } = body;

    const extras = [furnished && "Meublé", near_transport && "Proche transports"].filter(Boolean);

    const prompt = `Trouve-moi de vraies annonces immobilières actuelles avec leurs URLs pour ces critères :
- Budget : CHF ${budget_min || "?"} – ${budget_max || "?"} / mois
- Zone : ${area || "Pas de préférence"}
- Pièces : ${rooms || "Indifférent"}
- Durée : ${duration || "Non précisée"}
- Date d'emménagement : ${moving_date || "Non précisée"}
- École : ${university || "Non précisée"}
- Type de bien : ${property_type || "Appartement"}
- Colocataires : ${roommates || "Non"}
- Extras : ${extras.length ? extras.join(", ") : "Aucun"}

Cherche sur Homegate, ImmoScout24, Flatfox, Comparis et autres portails. Pour chaque annonce, extrais uniquement l'URL directe de l'annonce individuelle (avec son identifiant unique). N'inclus jamais une URL de page de recherche filtrée.`;

    const raw = await callAnthropicLoop(prompt);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Aucun JSON trouvé dans la réponse.");
    const parsed = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(parsed), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || "Erreur inconnue" }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
