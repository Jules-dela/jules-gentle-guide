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
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC;">
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
          
          <!-- Header with Logo -->
          <div style="background: #1E3A8A; padding: 40px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 3px;">UNIKEY</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px; font-weight: 400;">Student Housing Made Simple</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 32px;">
            <p style="font-size: 18px; color: #1E3A8A; font-weight: 600; margin: 0 0 24px 0;">Dear ${data.name},</p>
            
            <p style="color: #374151; line-height: 1.7; font-size: 15px; margin: 0 0 20px 0;">
              Thank you for choosing <strong style="color: #1E3A8A;">Unikey</strong> to help you find your perfect student apartment in Lausanne!
            </p>
            
            <p style="color: #374151; line-height: 1.7; font-size: 15px; margin: 0 0 32px 0;">
              We have received your application and our team will review your preferences shortly. 
              We'll be in touch within the next 24 hours with personalized housing options that match your criteria.
            </p>

            <!-- Steps Box -->
            <div style="background: linear-gradient(135deg, #F0F4FF 0%, #E8EEFF 100%); padding: 28px; border-radius: 12px; margin: 0 0 32px 0; border-left: 4px solid #1E3A8A;">
              <h3 style="color: #1E3A8A; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">What happens next?</h3>
              <ol style="color: #374151; line-height: 2; margin: 0; padding-left: 20px; font-size: 14px;">
                <li style="padding-left: 8px;">Our team reviews your preferences</li>
                <li style="padding-left: 8px;">We search for matching properties across our partner network</li>
                <li style="padding-left: 8px;">We contact you with curated housing options</li>
              </ol>
            </div>

            <p style="color: #374151; line-height: 1.7; font-size: 15px; margin: 0 0 32px 0;">
              If you have any questions in the meantime, feel free to reach out to us at 
              <a href="mailto:contact@uni-key.ch" style="color: #1E3A8A; font-weight: 500; text-decoration: none;">contact@uni-key.ch</a>
            </p>

            <p style="color: #374151; margin: 0; font-size: 15px;">
              Best regards,<br>
              <strong style="color: #1E3A8A;">The Unikey Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #1E3A8A; padding: 24px 32px; text-align: center;">
            <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0; font-weight: 500;">
              We do the searching, you focus on your studies.
            </p>
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 12px 0 0 0;">
              © 2024 Unikey | <a href="https://uni-key.ch" style="color: rgba(255,255,255,0.6);">uni-key.ch</a>
            </p>
          </div>
        </div>
      </body>
      </html>
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
