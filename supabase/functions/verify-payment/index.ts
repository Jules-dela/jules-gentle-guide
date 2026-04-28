import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";

const ALLOWED_ORIGINS = new Set([
  "https://uni-key.ch",
  "https://www.uni-key.ch",
  "https://unikey.lovable.app",
  "https://id-preview--8630e333-bd64-418b-b58e-5a1f7997dc70.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
]);

function corsFor(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://uni-key.ch";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function sendActivationEmail(toEmail: string, name: string | null) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set; skipping activation email");
    return;
  }
  const firstName = (name || "").trim().split(/\s+/)[0] || "there";
  const subject = "Your UniKey search is now active 🏠";
  const text = `Hi ${firstName}, your €50 deposit has been received and your housing search is now active. Our team will be in touch shortly with matching listings. This deposit will be fully deducted from your final invoice.\n\nQuestions? Reply to this email or contact us at contact@uni-key.ch.\n\n— The UniKey Team`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#0f172a;max-width:560px">
    <p>Hi ${firstName},</p>
    <p>Your <strong>€50 deposit has been received</strong> and your housing search is now active. Our team will be in touch shortly with matching listings.</p>
    <p>This deposit will be <strong>fully deducted from your final invoice</strong>.</p>
    <p>Questions? Reply to this email or contact us at <a href="mailto:contact@uni-key.ch">contact@uni-key.ch</a>.</p>
    <p>— The UniKey Team</p>
  </div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "UniKey <contact@uni-key.ch>",
        to: [toEmail],
        subject,
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error("Resend error:", res.status, (await res.text()).slice(0, 300));
    }
  } catch (e) {
    console.error("Activation email send failed:", (e as Error).message);
  }
}

const BodySchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("session"),
    session_id: z.string().min(8).max(200).regex(/^[A-Za-z0-9_]+$/),
  }),
  z.object({
    mode: z.literal("email"),
    email: z.string().trim().toLowerCase().email().max(255),
  }),
  z.object({
    mode: z.literal("check_existing"),
    email: z.string().trim().toLowerCase().email().max(255),
  }),
]);

async function fetchStripeSession(sessionId: string) {
  if (!STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY not configured");
  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Stripe error ${res.status}: ${text.slice(0, 200)}`);
  }
  return await res.json();
}

function safeRow(row: any) {
  if (!row) return null;
  // Only return what the form needs to restore — never expose admin/internal fields.
  return {
    name: row.name,
    email: row.email,
    phone: row.phone,
    budget: row.budget,
    property_type: row.property_type,
    duration: row.duration,
    preferences: row.preferences,
    date_of_birth: row.date_of_birth,
    nationality: row.nationality,
    signature_image: row.signature_image,
    contract_signed: row.contract_signed,
    deposit_paid: row.deposit_paid,
    payment_confirmed_at: row.payment_confirmed_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  const cors = corsFor(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Invalid input", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }

  try {
    if (parsed.data.mode === "session") {
      const sessionId = parsed.data.session_id;
      const session = await fetchStripeSession(sessionId);
      const isPaid = session.payment_status === "paid";
      const customerEmail =
        (session.customer_details?.email || session.customer_email || "").toLowerCase() || null;

      // Locate the matching intake_submissions row: by stripe_session_id, else newest by email.
      let { data: row } = await supabase
        .from("intake_submissions")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!row && customerEmail) {
        const fallback = await supabase
          .from("intake_submissions")
          .select("*")
          .ilike("email", customerEmail)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        row = fallback.data;
      }

      // If paid and we have a row, flip the deposit flag (idempotent).
      if (isPaid && row && !row.deposit_paid) {
        await supabase
          .from("intake_submissions")
          .update({
            deposit_paid: true,
            stripe_session_id: sessionId,
            payment_confirmed_at: new Date().toISOString(),
            status: "payment_confirmed",
          })
          .eq("id", row.id);
        row = { ...row, deposit_paid: true, payment_confirmed_at: new Date().toISOString() };
        if (row.email) {
          await sendActivationEmail(row.email, row.name ?? null);
        }
      }

      return new Response(
        JSON.stringify({ paid: isPaid, row: isPaid ? safeRow(row) : null }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    if (parsed.data.mode === "email") {
      const email = parsed.data.email;
      const { data: row } = await supabase
        .from("intake_submissions")
        .select("*")
        .ilike("email", email)
        .eq("deposit_paid", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!row) {
        return new Response(JSON.stringify({ found: false }), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({ found: true, row: safeRow(row) }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    // mode: check_existing
    const email = parsed.data.email;
    const { data: row } = await supabase
      .from("intake_submissions")
      .select("status, deposit_paid, created_at")
      .ilike("email", email)
      .in("status", ["awaiting_payment", "payment_confirmed"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return new Response(
      JSON.stringify({
        exists: !!row,
        status: row?.status ?? null,
        deposit_paid: row?.deposit_paid ?? false,
      }),
      { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
    );
  } catch (err: any) {
    console.error("verify-payment error:", err?.message || err);
    return new Response(
      JSON.stringify({ error: "Verification failed" }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } },
    );
  }
});