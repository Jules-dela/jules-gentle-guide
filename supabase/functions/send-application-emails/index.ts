import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ApplicationData {
  name: string;
  email: string;
  phone?: string;
  university: string;
  neighbourhood?: string;
  budget?: string;
  rooms?: string;
  duration?: string;
  propertyType?: string;
  roommatePreference?: string;
  furnished?: boolean;
  nearTransport?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ApplicationData = await req.json();
    console.log("Received application data:", data);

    // Format boolean preferences for email
    const formatBoolean = (value?: boolean) => value ? "Yes" : "No";

    // Build admin notification email HTML
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 10px;">
          🏠 New Housing Application
        </h1>
        
        <h2 style="color: #374151; margin-top: 24px;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6B7280;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${data.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Phone:</td><td style="padding: 8px 0;">${data.phone || "Not provided"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">University:</td><td style="padding: 8px 0;">${data.university || "Not specified"}</td></tr>
        </table>

        <h2 style="color: #374151; margin-top: 24px;">Housing Preferences</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6B7280;">Neighbourhood:</td><td style="padding: 8px 0;">${data.neighbourhood || "No preference"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Budget:</td><td style="padding: 8px 0;">${data.budget || "Not specified"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Rooms:</td><td style="padding: 8px 0;">${data.rooms || "Not specified"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Duration:</td><td style="padding: 8px 0;">${data.duration || "Not specified"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Property Type:</td><td style="padding: 8px 0;">${data.propertyType || "Not specified"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Roommate Preference:</td><td style="padding: 8px 0;">${data.roommatePreference || "Not specified"}</td></tr>
        </table>

        <h2 style="color: #374151; margin-top: 24px;">Additional Preferences</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6B7280;">Furnished:</td><td style="padding: 8px 0;">${formatBoolean(data.furnished)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Near Public Transport:</td><td style="padding: 8px 0;">${formatBoolean(data.nearTransport)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Pets Allowed:</td><td style="padding: 8px 0;">${formatBoolean(data.petsAllowed)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Smoking Allowed:</td><td style="padding: 8px 0;">${formatBoolean(data.smokingAllowed)}</td></tr>
        </table>

        ${data.notes ? `
          <h2 style="color: #374151; margin-top: 24px;">Additional Notes</h2>
          <p style="background: #F3F4F6; padding: 16px; border-radius: 8px;">${data.notes}</p>
        ` : ""}

        <p style="color: #9CA3AF; font-size: 12px; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px;">
          This application was submitted via the Unikey website.
        </p>
      </div>
    `;

    // Build confirmation email for applicant
    const applicantEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1E3A8A; padding: 32px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome to Unikey</h1>
        </div>
        
        <div style="padding: 32px;">
          <p style="font-size: 18px; color: #374151;">Dear ${data.name},</p>
          
          <p style="color: #4B5563; line-height: 1.6;">
            Thank you for choosing <strong>Unikey</strong> to help you find your perfect student apartment in Lausanne!
          </p>
          
          <p style="color: #4B5563; line-height: 1.6;">
            We have received your application and our team will review your preferences shortly. 
            We'll be in touch within the next few business days with personalized housing options that match your criteria.
          </p>

          <div style="background: #F3F4F6; padding: 24px; border-radius: 8px; margin: 24px 0;">
            <h3 style="color: #1E3A8A; margin-top: 0;">What happens next?</h3>
            <ol style="color: #4B5563; line-height: 1.8;">
              <li>Our team reviews your preferences</li>
              <li>We search for matching properties across our partner network</li>
              <li>We contact you with curated housing options</li>
            </ol>
          </div>

          <p style="color: #4B5563; line-height: 1.6;">
            If you have any questions in the meantime, feel free to reach out to us at 
            <a href="mailto:hello@uni-key.ch" style="color: #1E3A8A;">hello@uni-key.ch</a>
          </p>

          <p style="color: #4B5563; margin-top: 32px;">
            Best regards,<br>
            <strong>The Unikey Team</strong>
          </p>
        </div>

        <div style="background: #F9FAFB; padding: 24px; text-align: center; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
            Unikey - We do the searching, you focus on your studies.
          </p>
        </div>
      </div>
    `;

    // Send notification email to admin using Resend API directly
    console.log("Sending admin notification email...");
    const adminEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Unikey <noreply@uni-key.ch>",
        to: ["contact@uni-key.ch"],
        subject: `🏠 New Housing Application from ${data.name}`,
        html: adminEmailHtml,
      }),
    });
    
    const adminResult = await adminEmailResponse.json();
    console.log("Admin email response:", adminResult);

    // Send confirmation email to applicant
    console.log("Sending confirmation email to applicant...");
    const applicantEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Unikey <noreply@uni-key.ch>",
        to: [data.email],
        subject: "Welcome to Unikey - We received your application!",
        html: applicantEmailHtml,
      }),
    });
    
    const applicantResult = await applicantEmailResponse.json();
    console.log("Applicant email response:", applicantResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        adminEmail: adminResult, 
        applicantEmail: applicantResult 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-application-emails function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
