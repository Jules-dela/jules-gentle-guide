import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const ALLOWED_ORIGINS = [
  'https://uni-key.ch',
  'https://www.uni-key.ch',
  'https://unikey.lovable.app',
  'https://id-preview--8630e333-bd64-418b-b58e-5a1f7997dc70.lovable.app',
  'http://localhost:5173',
  'http://localhost:8080',
];

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

const PUBLIC_DEMO_EMAIL = "fake.client@uni-key.ch";
const PUBLIC_DEMO_PASSWORD = "UniKeyDemo2026!";

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const publicDemoAccess = body?.publicDemoAccess === true;

    // ---- Admin auth check ----
    if (!publicDemoAccess) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader?.startsWith("Bearer ")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
      });

      const token = authHeader.replace("Bearer ", "");
      const { data: userData, error: userError } = await userClient.auth.getUser(token);
      if (userError || !userData?.user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: roleData } = await userClient
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!roleData) {
        return new Response(JSON.stringify({ error: "Admin access required" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const DEMO_EMAIL = publicDemoAccess
      ? PUBLIC_DEMO_EMAIL
      : Deno.env.get("DEMO_CLIENT_EMAIL") || "demo.showcase@unikey.ch";
    const demoPassword = publicDemoAccess
      ? PUBLIC_DEMO_PASSWORD
      : Deno.env.get("DEMO_CLIENT_PASSWORD");
    const DEMO_NAME = "Emma Laurent";
    const DEMO_PHONE = "+41 78 456 12 89";

    if (!demoPassword) {
      return new Response(
        JSON.stringify({ error: "Demo client password not configured. Set DEMO_CLIENT_PASSWORD secret." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // 1. Check if demo user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    let userId: string;
    const existing = existingUsers?.users?.find(u => u.email === DEMO_EMAIL);

    if (existing) {
      userId = existing.id;
      // Clean up old demo data
      const { data: oldProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (oldProfile) {
        const { data: oldCases } = await supabase
          .from("cases")
          .select("id")
          .eq("client_id", oldProfile.id);

        if (oldCases) {
          for (const c of oldCases) {
            await supabase.from("property_proposals").delete().eq("case_id", c.id);
            await supabase.from("case_documents").delete().eq("case_id", c.id);
            await supabase.from("contract_signatures").delete().eq("case_id", c.id);
            await supabase.from("key_handover").delete().eq("case_id", c.id);
            await supabase.from("stage_notifications").delete().eq("case_id", c.id);
            await supabase.from("case_status_history").delete().eq("case_id", c.id);
            await supabase.from("client_stage_views").delete().eq("case_id", c.id);
            await supabase.from("case_staff_notes").delete().eq("case_id", c.id);
          }
          await supabase.from("cases").delete().eq("client_id", oldProfile.id);
        }
        await supabase.from("profiles").delete().eq("id", oldProfile.id);
      }

      // Reset password to known value
      await supabase.auth.admin.updateUserById(userId, { password: demoPassword });
    } else {
      // Create new user
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: demoPassword,
        email_confirm: true,
        user_metadata: { name: DEMO_NAME, phone: DEMO_PHONE },
      });
      if (error) throw error;
      userId = newUser.user.id;
    }

    // The demo account must never inherit admin access.
    await supabase.from("user_roles").delete().eq("user_id", userId);

    // 2. Create profile
    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .insert({
        user_id: userId,
        name: DEMO_NAME,
        email: DEMO_EMAIL,
        phone: DEMO_PHONE,
        client_type: "student",
        company_school: "EPFL",
      })
      .select("id")
      .single();

    if (profileErr) throw profileErr;

    const now = new Date().toISOString();

    // 3. Create case — fully signed contract, advanced to key_handover_scheduled
    const { data: demoCase, error: caseErr } = await supabase
      .from("cases")
      .insert({
        client_id: profile.id,
        status: "key_handover_scheduled",
        initial_criteria: {
          neighbourhood: "renens",
          budget: "1100-1300",
          rooms: "2",
          duration: "12",
          property_type: "apartment",
          roommate_preference: "0",
          furnished: true,
          near_transport: true,
          pets_allowed: false,
          smoking_allowed: false,
          moving_date: "2026-06-01",
          university: "EPFL",
          notes: "Close to EPFL campus preferred. Ground floor or with elevator.",
        },
        contract_data: {
          signed: true,
          timestamp: now,
          client_full_name: DEMO_NAME,
          client_date_of_birth: "1999-03-15",
          client_nationality: "Swiss",
          client_initials: "EL",
        },
      })
      .select("id")
      .single();

    if (caseErr) throw caseErr;

    // 4. Contract signature record
    await supabase.from("contract_signatures").insert({
      case_id: demoCase.id,
      signature_image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
      ip_address: "203.0.113.42",
      user_agent: "Demo Seed Script",
      device_info: { platform: "Demo", language: "en", screen_width: 1920, screen_height: 1080 },
      signed_at: now,
      client_full_name: DEMO_NAME,
      client_date_of_birth: "1999-03-15",
      client_nationality: "Swiss",
      client_initials: "EL",
    });

    // 5. Property proposals — one liked (chosen), one rejected
    const proposals = [
      {
        case_id: demoCase.id,
        address: "Rue de la Barre 10, 1005 Lausanne",
        neighbourhood: "Lausanne Centre",
        property_type: "studio",
        rent: 1050,
        charges: 90,
        rooms: 1,
        size_sqm: 30,
        client_status: "rejected",
        rejection_reasons: ["rent_too_high", "too_small"],
        rejection_notes: "Too small for my needs and over budget with charges.",
        tags: ["City Center", "Metro Nearby", "Compact"],
        description: "Small studio near the city center. Limited natural light, no balcony. Shared laundry in basement. Suitable for a single student on a tight budget.",
        agency_info: "ImmoVaud SA – Contact: Julie Martin, +41 21 678 90 12",
        visit_published: false,
        photos: [
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
        ],
      },
      {
        case_id: demoCase.id,
        address: "Chemin des Triaudes 4, 1024 Ecublens",
        neighbourhood: "Ecublens",
        property_type: "apartment",
        rent: 1250,
        charges: 120,
        rooms: 2,
        size_sqm: 48,
        client_status: "liked",
        tags: ["Near EPFL", "Renovated", "Balcony", "Dishwasher", "Elevator"],
        description: "Bright 2-room apartment just 8 minutes walk from the EPFL campus. Recently renovated kitchen and bathroom. South-facing balcony with views of the lake. Shared laundry in basement. Available from June 1st.",
        agency_info: "Régie du Rhône – Contact: Marc Dupont, +41 21 345 67 89",
        visit_published: true,
        visit_pros: ["Natural light throughout the day", "Modern kitchen appliances", "Quiet residential street", "5 min to metro M1"],
        visit_cons: ["No dishwasher", "Street parking only"],
        visit_photos: [
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
        ],
        photos: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=80",
        ],
      },
    ];

    await supabase.from("property_proposals").insert(proposals);

    // 6. Documents — all validated
    const documents = [
      { case_id: demoCase.id, document_type: "id_card", label: "ID Card / Passport", status: "validated", file_url: "https://placeholder.demo/id_card.pdf", validated_at: now },
      { case_id: demoCase.id, document_type: "proof_of_enrollment", label: "Proof of Enrollment (EPFL)", status: "validated", file_url: "https://placeholder.demo/enrollment.pdf", validated_at: now },
      { case_id: demoCase.id, document_type: "proof_of_income", label: "Proof of Income / Guarantor Letter", status: "validated", file_url: "https://placeholder.demo/income.pdf", validated_at: now },
      { case_id: demoCase.id, document_type: "residence_permit", label: "Residence Permit (B Permit)", status: "validated", file_url: "https://placeholder.demo/permit.pdf", validated_at: now },
      { case_id: demoCase.id, document_type: "debt_certificate", label: "Debt Collection Certificate", status: "validated", file_url: "https://placeholder.demo/debt_cert.pdf", validated_at: now },
    ];

    await supabase.from("case_documents").insert(documents);

    // 7. Key handover — scheduled
    await supabase.from("key_handover").insert({
      case_id: demoCase.id,
      scheduled_date: "2026-06-01",
      scheduled_time: "10:00",
      location: "Chemin des Triaudes 4, 1024 Ecublens — Building entrance",
      contact_person: "Marc Dupont (Régie du Rhône)",
      contact_phone: "+41 21 345 67 89",
      confirmed_by_client: true,
      notes: "Please bring 2 copies of your ID and the signed lease. Parking available on-site.",
    });

    // 8. Case status history — full journey
    const statusHistory = [
      { case_id: demoCase.id, status: "request_received", notes: "Application submitted via website" },
      { case_id: demoCase.id, status: "search_in_progress", notes: "Contract signed, search started" },
      { case_id: demoCase.id, status: "proposals_available", notes: "2 proposals published" },
      { case_id: demoCase.id, status: "visit_in_progress", notes: "Visit report published for Ecublens apartment" },
      { case_id: demoCase.id, status: "documents_preparation", notes: "Client uploading required documents" },
      { case_id: demoCase.id, status: "application_review", notes: "All documents validated, application sent to landlord" },
      { case_id: demoCase.id, status: "key_handover_scheduled", notes: "Application accepted! Key handover scheduled for June 1st" },
    ];

    await supabase.from("case_status_history").insert(statusHistory);

    // 9. Staff notes
    await supabase.from("case_staff_notes").insert({
      case_id: demoCase.id,
      notes: "Demo client — EPFL student. Liked the Ecublens apartment near campus. All documents validated. Handover confirmed for June 1st.",
    });

    if (publicDemoAccess) {
      const demoAuthClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      const { data: signInData, error: signInError } = await demoAuthClient.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: demoPassword,
      });

      if (signInError || !signInData.session) throw signInError || new Error("Unable to start demo session");

      return new Response(
        JSON.stringify({
          success: true,
          mode: "public_demo",
          user: { email: DEMO_EMAIL, name: DEMO_NAME },
          session: {
            access_token: signInData.session.access_token,
            refresh_token: signInData.session.refresh_token,
          },
        }),
        { headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          email: DEMO_EMAIL,
        },
        message: `Demo client "${DEMO_NAME}" seeded with FULL journey: signed contract, 2 proposals (1 liked, 1 rejected), visit report, 5 validated documents, key handover scheduled for June 1st 2026.`,
      }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
