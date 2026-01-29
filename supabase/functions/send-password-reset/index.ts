import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PasswordResetRequest {
  email: string;
  redirectTo: string;
}

// Build the branded HTML email template
function buildPasswordResetEmailHtml(resetLink: string, userEmail: string): string {
  const currentYear = new Date().getFullYear();
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your UNIKEY Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px;">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #1e3a8a; padding: 32px 40px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 0; letter-spacing: 2px;">UNIKEY</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              
              <h2 style="color: #1e3a8a; font-size: 24px; font-weight: 600; margin: 0 0 24px 0; text-align: center;">
                Reset Your Password
              </h2>
              
              <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                Hello,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                We received a request to reset the password for the account associated with <strong>${userEmail}</strong>.
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 24px; margin: 0 0 16px 0;">
                Click the button below to set a new password:
              </p>
              
              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin: 32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="background-color: #1e3a8a; border-radius: 8px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 600; padding: 14px 32px; text-decoration: none;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 20px; margin: 16px 0; text-align: center;">
                This link will expire in 1 hour for security reasons.
              </p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
              
              <p style="color: #9ca3af; font-size: 14px; line-height: 20px; margin: 0;">
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; text-align: center;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0 0 4px 0;">
                © ${currentYear} UNIKEY. All rights reserved.
              </p>
              <p style="color: #9ca3af; font-size: 12px; line-height: 18px; margin: 0 0 4px 0;">
                Your trusted partner for finding housing in Lausanne.
              </p>
              <a href="https://uni-key.ch" style="color: #1e3a8a; font-size: 12px; text-decoration: none;">
                uni-key.ch
              </a>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, redirectTo }: PasswordResetRequest = await req.json();

    // Validate required fields
    if (!email || !redirectTo) {
      return new Response(
        JSON.stringify({ error: "Email and redirectTo are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Generate password reset link
    const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: redirectTo,
      },
    });

    if (linkError) {
      console.error("Error generating reset link:", linkError);
      // Don't expose internal errors - always show success to prevent email enumeration
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resetLink = data.properties?.action_link;
    if (!resetLink) {
      console.error("No reset link generated");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build HTML email
    const html = buildPasswordResetEmailHtml(resetLink, email);

    // Send the email via Resend API
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "UNIKEY <contact@uni-key.ch>",
        to: [email],
        subject: "Reset your UNIKEY password",
        html: html,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Error sending email:", errorData);
      return new Response(
        JSON.stringify({ error: "Failed to send email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Password reset email sent successfully to:", email);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Error in send-password-reset function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
