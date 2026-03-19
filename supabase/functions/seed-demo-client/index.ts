import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const DEMO_EMAIL = "demo.showcase@unikey.ch";
    const DEMO_PASSWORD = "Showcase2026!";
    const DEMO_NAME = "Emma Laurent";
    const DEMO_PHONE = "+41 78 456 12 89";

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
          }
          await supabase.from("cases").delete().eq("client_id", oldProfile.id);
        }
        await supabase.from("profiles").delete().eq("id", oldProfile.id);
      }

      // Reset password to known value
      await supabase.auth.admin.updateUserById(userId, { password: DEMO_PASSWORD });
    } else {
      // Create new user
      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        email_confirm: true,
        user_metadata: { name: DEMO_NAME, phone: DEMO_PHONE },
      });
      if (error) throw error;
      userId = newUser.user.id;
    }

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

    // 3. Create case — UNSIGNED contract (Stage 1) so investor sees the full journey
    const { data: demoCase, error: caseErr } = await supabase
      .from("cases")
      .insert({
        client_id: profile.id,
        status: "request_received",
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
        contract_data: null, // Not signed yet — investor will see the signing flow
      })
      .select("id")
      .single();

    if (caseErr) throw caseErr;

    // 4. Add property proposals with Unsplash photos (will appear after contract signing)
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
        client_status: "pending",
        tags: ["City Center", "Metro Nearby", "Compact"],
        description: "Small studio near the city center. Limited natural light, no balcony. Shared laundry in basement. Suitable for a single student on a tight budget.",
        agency_info: "ImmoVaud SA – Contact: Julie Martin, +41 21 678 90 12",
        visit_published: false,
        visit_pros: [],
        visit_cons: [],
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
        client_status: "pending",
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

    // 5. Documents and handover are NOT pre-populated so the demo
    //    advances step-by-step: sign contract → Stage 2 (proposals).
    //    Admin can add documents / handover later to advance further.

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        },
        message: `Demo client "${DEMO_NAME}" seeded at Stage 1 (unsigned contract). 2 proposals with photos ready. After signing, case will advance to Stage 2 only. Admin can advance further stages manually.`,
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
