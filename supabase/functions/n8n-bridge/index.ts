import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { bridgeSchema } from "./schema.ts";
import { secretsMatch } from "./validation.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, "Content-Type": "application/json" },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!(await secretsMatch(req.headers.get("x-bridge-secret"), Deno.env.get("BRIDGE_SECRET")))) {
    return json({ error: "Unauthorized" }, 401);
  }

  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > 20000) return json({ error: "Request too large" }, 400);
    body = JSON.parse(text);
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }
  const parsed = bridgeSchema.safeParse(body);
  if (!parsed.success) return json({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }, 400);

  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return json({ error: "Service unavailable" }, 503);
  const db = createClient(url, key, { auth: { persistSession: false } });
  const data = parsed.data;
  try {
    switch (data.action) {
      case "get_case": {
        const { data: row, error } = await db.from("cases")
          .select("id, followup_status, profiles!cases_client_id_fkey(name)").eq("id", data.case_id).maybeSingle();
        if (error) throw error;
        if (!row) return json({ found: false });
        const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
        return json({ found: true, case_id: row.id, name: profile?.name ?? "", followup_status: row.followup_status });
      }
      case "set_followup": {
        const { data: row, error } = await db.from("cases").update({
          followup_status: data.status, followup_question: data.question,
          followup_case: data.question_case, followup_updated_at: new Date().toISOString(),
        }).eq("id", data.case_id).select("id").maybeSingle();
        if (error) throw error;
        return row ? json({ ok: true }) : json({ error: "Case not found" }, 404);
      }
      case "find_case_by_phone": {
        const { data: rows, error } = await db.rpc("bridge_find_case_by_phone", { p_phone: data.phone });
        if (error) throw error;
        const row = rows?.[0];
        return row ? json({ found: true, case_id: row.case_id, name: row.name,
          followup_status: row.followup_status, followup_question: row.followup_question }) : json({ found: false });
      }
      case "record_reply": {
        const { error } = await db.rpc("bridge_record_reply", {
          p_case_id: data.case_id, p_remark: data.remark, p_status: data.status,
        });
        if (error?.code === "P0002") return json({ error: "Case not found" }, 404);
        if (error) throw error;
        return json({ ok: true });
      }
      case "notify_team": {
        const resendKey = Deno.env.get("RESEND_API_KEY");
        if (!resendKey) return json({ error: "Email unavailable" }, 503);
        // JSON encoding escapes the payload; text (never html) preserves literal user content safely.
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
          body: JSON.stringify({ from: "Unikey <contact@uni-key.ch>", to: ["contact@uni-key.ch"],
            subject: data.subject, text: data.body }), signal: AbortSignal.timeout(15000),
        });
        const result = await response.json().catch(() => null);
        await db.from("email_logs").insert({ recipient: "contact@uni-key.ch", email_type: "whatsapp_followup_team",
          status: response.ok ? "sent" : "failed", provider_id: response.ok ? result?.id ?? null : null,
          error_message: response.ok ? null : `Resend HTTP ${response.status}` });
        if (!response.ok) return json({ error: "Email send failed" }, 502);
        return json({ ok: true });
      }
    }
  } catch {
    console.error("n8n bridge action failed", data.action);
    return json({ error: "Action failed" }, 500);
  }
});