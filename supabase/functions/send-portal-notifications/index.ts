import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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

type NotificationType = "key_handover_scheduled" | "document_verified" | "document_rejected" | "new_match" | "visit_published";

interface NotificationRequest {
  type: NotificationType;
  // New simplified format for direct notifications
  email?: string;
  name?: string;
  stage?: number;
  metadata?: Record<string, unknown>;
  // Legacy format for case-based lookups
  case_id?: string;
  // For key handover
  scheduled_date?: string;
  scheduled_time?: string;
  location?: string;
  contact_person?: string;
  // For document verification
  document_type?: string;
  document_label?: string;
  rejection_reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify the user is an admin
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error("Auth error:", claimsError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub as string;

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Role check error:", roleError);
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: NotificationRequest = await req.json();
    const { type, case_id, email, name, metadata } = body;

    if (!type) {
      return new Response(
        JSON.stringify({ error: "Missing required field: type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let clientEmail: string;
    let clientName: string;
    let firstName: string;

    // If email/name provided directly, use them
    if (email && name) {
      clientEmail = email;
      clientName = name;
      firstName = name.split(" ")[0];
    } else if (case_id) {
      // Fallback: Fetch case and client details
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .select(`
          id,
          profiles!inner (
            id,
            name,
            email
          )
        `)
        .eq("id", case_id)
        .single();

      if (caseError || !caseData) {
        console.error("Case fetch error:", caseError);
        return new Response(
          JSON.stringify({ error: "Case not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      clientName = (caseData.profiles as any).name;
      clientEmail = (caseData.profiles as any).email;
      firstName = clientName.split(" ")[0];
    } else {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email/name or case_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject: string;
    let htmlContent: string;

    switch (type) {
      case "key_handover_scheduled":
        subject = "🔑 Your Key Handover is Scheduled! - UniKey";
        htmlContent = generateKeyHandoverEmail({
          firstName,
          scheduledDate: body.scheduled_date || "To be confirmed",
          scheduledTime: body.scheduled_time || "To be confirmed",
          location: body.location || "To be confirmed",
          contactPerson: body.contact_person || "Your UniKey agent",
        });
        break;

      case "document_verified":
        subject = "✅ Document Verified - UniKey";
        htmlContent = generateDocumentVerifiedEmail({
          firstName,
          documentLabel: body.document_label || "Your document",
        });
        break;

      case "document_rejected":
        subject = "⚠️ Document Requires Attention - UniKey";
        htmlContent = generateDocumentRejectedEmail({
          firstName,
          documentLabel: body.document_label || "Your document",
          rejectionReason: body.rejection_reason || "Please contact us for details.",
        });
        break;

      case "new_match":
        const matchCount = (metadata?.count as number) || 1;
        subject = `🏠 ${matchCount} New Apartment${matchCount > 1 ? 's' : ''} Found! - UniKey`;
        htmlContent = generateNewMatchEmail({
          firstName,
          matchCount,
        });
        break;

      case "visit_published":
        subject = "📸 Visit Report Ready! - UniKey";
        htmlContent = generateVisitPublishedEmail({
          firstName,
          address: (metadata?.address as string) || "your selected property",
        });
        break;

      default:
        return new Response(
          JSON.stringify({ error: "Invalid notification type" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    console.log(`Sending ${type} notification to ${clientEmail}`);

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UniKey <contact@uni-key.ch>",
        to: [clientEmail],
        subject,
        html: htmlContent,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      console.error("Resend API error:", emailResult);
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent", emailId: emailResult.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error in send-portal-notifications:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
};

function generateKeyHandoverEmail(data: {
  firstName: string;
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  contactPerson: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🔑 Key Handover Scheduled!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 24px;">
            Hi ${data.firstName},
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            Great news! Your key handover appointment has been scheduled. Here are the details:
          </p>
          
          <!-- Details Card -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; border-left: 4px solid #1e3a5f;">
            <div style="margin-bottom: 16px;">
              <p style="font-size: 12px; color: #888; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Date & Time</p>
              <p style="font-size: 16px; color: #333; margin: 0; font-weight: 600;">${data.scheduledDate} at ${data.scheduledTime}</p>
            </div>
            <div style="margin-bottom: 16px;">
              <p style="font-size: 12px; color: #888; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Location</p>
              <p style="font-size: 16px; color: #333; margin: 0; font-weight: 600;">${data.location}</p>
            </div>
            <div>
              <p style="font-size: 12px; color: #888; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 0.5px;">Meeting Point</p>
              <p style="font-size: 16px; color: #333; margin: 0; font-weight: 600;">${data.contactPerson} will meet you at the entrance</p>
            </div>
          </div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            Please bring a valid ID and arrive 5 minutes early. We will conduct the entry inspection (État des Lieux) together.
          </p>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px;">
            Questions? Reply to this email or contact us via WhatsApp.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            UniKey – Your Home Search, Simplified
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDocumentVerifiedEmail(data: {
  firstName: string;
  documentLabel: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">✅ Document Verified</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 24px;">
            Hi ${data.firstName},
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            Good news! Your document has been verified:
          </p>
          
          <!-- Document Card -->
          <div style="background-color: #f0fdf4; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #bbf7d0; display: flex; align-items: center;">
            <div style="width: 40px; height: 40px; background-color: #22c55e; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 16px;">
              <span style="color: white; font-size: 20px;">✓</span>
            </div>
            <div>
              <p style="font-size: 16px; color: #333; margin: 0; font-weight: 600;">${data.documentLabel}</p>
              <p style="font-size: 14px; color: #22c55e; margin: 4px 0 0 0;">Verified</p>
            </div>
          </div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            Log in to your portal to check your dossier progress. Once all documents are verified, you'll be ready for the final step!
          </p>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px;">
            Questions? Reply to this email.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            UniKey – Your Home Search, Simplified
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateDocumentRejectedEmail(data: {
  firstName: string;
  documentLabel: string;
  rejectionReason: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">⚠️ Document Requires Attention</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 24px;">
            Hi ${data.firstName},
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            We reviewed your document but need you to upload a new version:
          </p>
          
          <!-- Document Card -->
          <div style="background-color: #fffbeb; border-radius: 12px; padding: 20px; margin-bottom: 24px; border: 1px solid #fde68a;">
            <p style="font-size: 16px; color: #333; margin: 0 0 8px 0; font-weight: 600;">${data.documentLabel}</p>
            <p style="font-size: 14px; color: #92400e; margin: 0;">
              <strong>Reason:</strong> ${data.rejectionReason}
            </p>
          </div>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            Please log in to your portal and upload a new version of this document. If you have questions, feel free to reply to this email.
          </p>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px;">
            We're here to help!
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            UniKey – Your Home Search, Simplified
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateNewMatchEmail(data: {
  firstName: string;
  matchCount: number;
}): string {
  const plural = data.matchCount > 1;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏠 ${data.matchCount} New Match${plural ? 'es' : ''}!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 24px;">
            Hi ${data.firstName},
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            Great news! We've found ${data.matchCount} new apartment${plural ? 's' : ''} matching your criteria.
          </p>
          
          <!-- CTA Card -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center; border: 1px solid #e2e8f0;">
            <p style="font-size: 16px; color: #333; margin: 0 0 16px 0;">
              Log in to your UniKey portal to browse ${plural ? 'them' : 'it'} and share your feedback.
            </p>
            <a href="https://unikey.lovable.app/portal" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              View Apartments
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px;">
            Questions? Reply to this email or contact us via WhatsApp.
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            UniKey – Your Home Search, Simplified
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateVisitPublishedEmail(data: {
  firstName: string;
  address: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; margin-top: 20px; margin-bottom: 20px;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); padding: 40px 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">📸 Visit Report Ready!</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          <p style="font-size: 18px; color: #333; margin-bottom: 24px;">
            Hi ${data.firstName},
          </p>
          
          <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
            We just finished visiting <strong>${data.address}</strong> for you. The visit report with photos and our expert notes is now available in your portal.
          </p>
          
          <!-- CTA Card -->
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px; text-align: center; border: 1px solid #e2e8f0;">
            <p style="font-size: 16px; color: #333; margin: 0 0 16px 0;">
              Review the report and let us know if you'd like to proceed or keep searching.
            </p>
            <a href="https://unikey.lovable.app/portal" style="display: inline-block; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              View Report
            </a>
          </div>
          
          <p style="font-size: 14px; color: #888; margin-top: 32px;">
            Questions about the property? Just reply to this email!
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f8fafc; padding: 24px 30px; text-align: center; border-top: 1px solid #eee;">
          <p style="font-size: 14px; color: #888; margin: 0;">
            UniKey – Your Home Search, Simplified
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(handler);
