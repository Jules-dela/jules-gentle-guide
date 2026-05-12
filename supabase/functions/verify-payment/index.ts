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

function determineClientType(university: string | null | undefined): 'student' | 'employee' | 'other' {
  if (!university) return 'other';
  const u = university.toLowerCase();
  if (/(ehl|epfl|unil|university|école|school|student|college|campus)/.test(u)) return 'student';
  if (/(company|corp|inc|ltd|gmbh|sa|employee|employer|office|work)/.test(u)) return 'employee';
  return 'other';
}

function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  const arr = new Uint8Array(20);
  crypto.getRandomValues(arr);
  let pw = '';
  for (let i = 0; i < arr.length; i++) pw += chars[arr[i] % chars.length];
  return pw;
}

async function findUserByEmail(email: string) {
  const norm = email.trim().toLowerCase();
  let page = 1;
  const perPage = 200;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) {
      console.error('listUsers failed:', error.message);
      return null;
    }
    const users = data?.users ?? [];
    const found = users.find((u) => (u.email ?? '').toLowerCase() === norm);
    if (found) return found;
    if (users.length < perPage) return null;
    page += 1;
  }
}

async function sendPortalAccessEmail(toEmail: string, name: string | null, magicLink: string | null) {
  if (!RESEND_API_KEY) return;
  const firstName = (name || "").trim().split(/\s+/)[0] || "there";
  const cta = magicLink
    ? `<p style="margin:24px 0"><a href="${magicLink}" style="background:#0f172a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Access your portal</a></p>`
    : `<p>You can access your portal anytime at <a href="https://uni-key.ch/portal">uni-key.ch/portal</a>.</p>`;
  const html = `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;font-size:15px;line-height:1.6;color:#0f172a;max-width:560px">
    <p>Hi ${firstName},</p>
    <p>Your UniKey client portal is ready. You can now track your housing search, review proposals, and upload your documents.</p>
    ${cta}
    <p>Questions? Reply to this email or contact us at <a href="mailto:contact@uni-key.ch">contact@uni-key.ch</a>.</p>
    <p>— The UniKey Team</p>
  </div>`;
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "UniKey <contact@uni-key.ch>",
        to: [toEmail],
        subject: "Your UniKey portal is ready 🔑",
        html,
      }),
    });
  } catch (e) {
    console.error('Portal access email failed:', (e as Error).message);
  }
}

/**
 * Idempotently creates auth user, profile, case, and signs the contract from
 * an intake_submissions row. Safe to call multiple times for the same row.
 */
async function provisionPortal(row: any, opts: { sendEmail?: boolean } = {}) {
  if (!row?.email) {
    console.log('provisionPortal: missing email, skipping');
    return;
  }
  const email = String(row.email).trim().toLowerCase();
  const name = (row.name || email.split('@')[0] || 'Client').trim();

  // 1. Create or find auth user
  let userId: string | null = null;
  let isNew = false;
  const { data: created, error: createErr } = await supabase.auth.admin.createUser({
    email,
    password: generateSecurePassword(),
    email_confirm: true,
    user_metadata: { name, phone: row.phone || null },
  });
  if (createErr) {
    const msg = (createErr.message || '').toLowerCase();
    if (msg.includes('already') || msg.includes('exists') || msg.includes('duplicate')) {
      const existing = await findUserByEmail(email);
      if (!existing) {
        console.error('provisionPortal: user reportedly exists but not found:', email);
        return;
      }
      userId = existing.id;
    } else {
      console.error('provisionPortal: createUser failed:', createErr.message);
      return;
    }
  } else {
    userId = created.user.id;
    isNew = true;
  }
  if (!userId) return;

  // 2. Profile
  const prefs = (row.preferences || {}) as Record<string, any>;
  let profileId: string | null = null;
  {
    const { data: existing } = await supabase
      .from('profiles').select('id').eq('user_id', userId).maybeSingle();
    if (existing) {
      profileId = existing.id;
    } else {
      const { data: inserted, error: pErr } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          name,
          email,
          phone: row.phone || null,
          client_type: determineClientType(prefs.university),
          company_school: prefs.university || null,
        })
        .select('id')
        .single();
      if (pErr) {
        console.error('provisionPortal: profile insert failed:', pErr.message);
        const { data: rec } = await supabase
          .from('profiles').select('id').eq('user_id', userId).maybeSingle();
        if (!rec) return;
        profileId = rec.id;
      } else {
        profileId = inserted.id;
      }
    }
  }
  if (!profileId) return;

  // 3. Case
  const initialCriteria = {
    neighbourhood: prefs.neighbourhood ?? null,
    budget: row.budget ?? null,
    rooms: prefs.rooms ?? null,
    duration: row.duration ?? null,
    property_type: row.property_type ?? null,
    propertyType: row.property_type ?? null,
    roommate_preference: prefs.roommates === 'yes'
      ? `Yes - ${prefs.roommate_detail || 'not specified'} (${prefs.roommate_count || '?'} roommates)`
      : 'No',
    furnished: prefs.furnished ?? null,
    near_transport: prefs.near_transport ?? null,
    pets_allowed: prefs.pets ?? null,
    smoking_allowed: prefs.no_smoking ?? null,
    notes: prefs.notes ?? null,
    moving_date: prefs.moving_date ?? null,
    university: prefs.university ?? null,
  };

  let caseId: string | null = null;
  let caseAlreadySigned = false;
  {
    const { data: existingCases } = await supabase
      .from('cases')
      .select('id, contract_data')
      .eq('client_id', profileId)
      .neq('status', 'closed')
      .order('created_at', { ascending: false });
    const preferred = existingCases?.find((c) => c.contract_data != null) ?? existingCases?.[0];
    if (preferred) {
      caseId = preferred.id;
      caseAlreadySigned = !!preferred.contract_data;
    } else {
      const { data: createdCase, error: cErr } = await supabase
        .from('cases')
        .insert({
          client_id: profileId,
          status: 'request_received',
          initial_criteria: initialCriteria,
        })
        .select('id, contract_data')
        .single();
      if (cErr) {
        console.error('provisionPortal: case insert failed:', cErr.message);
        return;
      }
      caseId = createdCase.id;
    }
  }
  if (!caseId) return;

  // 4. Sign contract from intake data (if not already signed and we have a signature)
  if (!caseAlreadySigned && row.signature_image) {
    const signedAt = row.payment_confirmed_at || row.updated_at || new Date().toISOString();
    const fullName = name;
    const dob = row.date_of_birth || null;
    const nationality = row.nationality || null;
    const initials = fullName
      .split(/\s+/).map((p: string) => p[0]).filter(Boolean).join('').toUpperCase().slice(0, 4);

    const { error: sigErr } = await supabase.from('contract_signatures').insert({
      case_id: caseId,
      signature_image: row.signature_image,
      ip_address: null,
      user_agent: null,
      device_info: null,
      signed_at: signedAt,
      client_full_name: fullName,
      client_date_of_birth: dob,
      client_nationality: nationality,
      client_initials: initials,
      signature_hash: row.signature_hash || null,
    });
    if (sigErr) console.error('provisionPortal: signature insert failed:', sigErr.message);

    const { error: updErr } = await supabase.from('cases').update({
      contract_data: {
        signed: true,
        timestamp: signedAt,
        client_full_name: fullName,
        client_date_of_birth: dob,
        client_nationality: nationality,
        client_initials: initials,
        signature_hash: row.signature_hash || null,
      },
      status: 'search_in_progress',
    }).eq('id', caseId);
    if (updErr) console.error('provisionPortal: case update failed:', updErr.message);
  }

  // 5. Magic link + portal access email (only first time)
  if (isNew && opts.sendEmail) {
    let magicLink: string | null = null;
    try {
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email,
        options: { redirectTo: 'https://uni-key.ch/portal' },
      });
      magicLink = linkData?.properties?.action_link ?? null;
    } catch (e) {
      console.error('provisionPortal: magic link failed:', (e as Error).message);
    }
    await sendPortalAccessEmail(email, name, magicLink);
  }
}

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
  z.object({
    mode: z.literal("provision"),
    email: z.string().trim().toLowerCase().email().max(255),
    admin_secret: z.string().min(8).max(200),
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

      // Auto-provision portal account on confirmed payment (idempotent).
      if (isPaid && row?.deposit_paid) {
        await provisionPortal(row, { sendEmail: true });
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

      // Auto-provision portal account on lookup (idempotent backfill).
      await provisionPortal(row, { sendEmail: false });

      return new Response(
        JSON.stringify({ found: true, row: safeRow(row) }),
        { status: 200, headers: { ...cors, "Content-Type": "application/json" } },
      );
    }

    if (parsed.data.mode === "provision") {
      const adminSecret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
      if (!adminSecret || parsed.data.admin_secret !== adminSecret) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
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
        return new Response(JSON.stringify({ provisioned: false, reason: "no_paid_row" }), {
          status: 200,
          headers: { ...cors, "Content-Type": "application/json" },
        });
      }
      await provisionPortal(row, { sendEmail: true });
      return new Response(JSON.stringify({ provisioned: true }), {
        status: 200,
        headers: { ...cors, "Content-Type": "application/json" },
      });
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