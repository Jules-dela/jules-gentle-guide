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
        // Delete old cases and related data
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

    // 3. Create case with signed contract (so they can proceed)
    const { data: demoCase, error: caseErr } = await supabase
      .from("cases")
      .insert({
        client_id: profile.id,
        status: "proposals_available",
        initial_criteria: {
          neighbourhood: "renens",
          budget: "1100-1300",
          rooms: "2",
          duration: "12",
          propertyType: "apartment",
          roommatePreference: "0",
          furnished: true,
          nearTransport: true,
          petsAllowed: false,
          smokingAllowed: false,
          movingDate: "2026-06-01",
          university: "EPFL",
          notes: "Close to EPFL campus preferred. Ground floor or with elevator.",
        },
        contract_data: {
          signed: true,
          timestamp: new Date().toISOString(),
        },
      })
      .select("id")
      .single();

    if (caseErr) throw caseErr;

    // 4. Add contract signature record
    await supabase.from("contract_signatures").insert({
      case_id: demoCase.id,
      signature_image: "data:image/png;base64,demo",
      ip_address: "demo",
      user_agent: "demo-seed",
      signed_at: new Date().toISOString(),
    });

    // 5. Add property proposals (mix of statuses)
    const proposals = [
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
        tags: ["Near EPFL", "Renovated", "Balcony"],
        description: "Bright 2-room apartment just 8 minutes walk from the EPFL campus. Recently renovated kitchen and bathroom. South-facing balcony with views of the lake. Shared laundry in basement. Available from June 1st.",
        agency_info: "Régie du Rhône – Contact: Marc Dupont, +41 21 345 67 89",
        visit_published: true,
        visit_pros: ["Natural light throughout the day", "Modern kitchen appliances", "Quiet residential street", "5 min to metro M1"],
        visit_cons: ["No dishwasher", "Street parking only"],
        visit_photos: [],
      },
      {
        case_id: demoCase.id,
        address: "Avenue du Tir-Fédéral 28, 1024 Ecublens",
        neighbourhood: "Ecublens",
        property_type: "studio",
        rent: 980,
        charges: 80,
        rooms: 1,
        size_sqm: 32,
        client_status: "pending",
        tags: ["Furnished", "Close to metro", "Compact"],
        description: "Cozy furnished studio ideal for a student. All-inclusive charges. Walking distance to Ecublens metro station (M1). Laundry room and bike storage available.",
        agency_info: "ImmoVaud SA – Contact: Julie Martin, +41 21 678 90 12",
        visit_published: false,
        visit_pros: [],
        visit_cons: [],
        visit_photos: [],
      },
      {
        case_id: demoCase.id,
        address: "Rue de Genève 85, 1004 Lausanne",
        neighbourhood: "Sévelin",
        property_type: "apartment",
        rent: 1380,
        charges: 150,
        rooms: 3,
        size_sqm: 62,
        client_status: "rejected",
        rejection_reasons: ["Too far from campus", "Above budget"],
        rejection_notes: "Nice apartment but commute would be 35+ minutes and total cost exceeds my budget.",
        tags: ["Spacious", "City center", "Terrace"],
        description: "Spacious 3-room apartment in the heart of Lausanne with a private terrace. Open-plan living area. Close to Flon district and all amenities.",
        agency_info: "Bentley Properties – Contact: Sarah Weber, +41 21 234 56 78",
        visit_published: false,
        visit_pros: [],
        visit_cons: [],
        visit_photos: [],
      },
    ];

    await supabase.from("property_proposals").insert(proposals);

    // 6. Add case documents (mix of statuses)
    const documents = [
      { case_id: demoCase.id, document_type: "id", label: "Passport / ID Card", status: "validated", validated_at: new Date().toISOString() },
      { case_id: demoCase.id, document_type: "salary", label: "Proof of Income / Scholarship", status: "uploaded" },
      { case_id: demoCase.id, document_type: "insurance", label: "Liability Insurance (RC)", status: "missing" },
      { case_id: demoCase.id, document_type: "debt_certificate", label: "Debt Collection Certificate", status: "missing" },
      { case_id: demoCase.id, document_type: "enrollment", label: "EPFL Enrollment Certificate", status: "validated", validated_at: new Date().toISOString() },
    ];

    await supabase.from("case_documents").insert(documents);

    // 7. Add stage notifications
    await supabase.from("stage_notifications").insert([
      { case_id: demoCase.id, stage: 1, notification_type: "update", metadata: { message: "Welcome! Please sign your service agreement." } },
      { case_id: demoCase.id, stage: 2, notification_type: "update", metadata: { message: "Your search is underway. We're scanning listings in Ecublens & Renens." } },
      { case_id: demoCase.id, stage: 3, notification_type: "update", metadata: { message: "3 new property proposals are ready for your review!" } },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        credentials: {
          email: DEMO_EMAIL,
          password: DEMO_PASSWORD,
        },
        message: `Demo client "${DEMO_NAME}" created with 3 proposals, 5 documents, and a signed contract. Case is at "proposals_available" stage.`,
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
