import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Initialize Supabase client with service role for rate limit table access
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 5; // Max submissions per time window
const RATE_LIMIT_WINDOW_HOURS = 1; // Time window in hours

// HTML escape function to prevent injection attacks
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Extract client IP from request headers
function getClientIP(req: Request): string {
  return req.headers.get('cf-connecting-ip') ||
         req.headers.get('x-real-ip') ||
         req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         'unknown';
}

// Check and enforce rate limiting
async function checkRateLimit(ip: string): Promise<{ allowed: boolean; error?: string }> {
  try {
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_HOURS * 60 * 60 * 1000).toISOString();
    
    const { count, error: countError } = await supabase
      .from('rate_limit_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('ip_address', ip)
      .gte('created_at', windowStart);
    
    if (countError) {
      console.error('Rate limit check failed:', countError);
      // Fail open but log the issue
      return { allowed: true };
    }
    
    if (count !== null && count >= RATE_LIMIT_MAX_REQUESTS) {
      console.log(`Rate limit exceeded for IP: ${ip.substring(0, 8)}... (${count} requests)`);
      return { 
        allowed: false, 
        error: 'Too many submissions. Please try again later.' 
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Fail open on errors
    return { allowed: true };
  }
}

// Record a submission for rate limiting
async function recordSubmission(ip: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('rate_limit_submissions')
      .insert({ ip_address: ip });
    
    if (error) {
      console.error('Failed to record submission for rate limiting:', error);
    }
    
    // Clean up old entries (older than 24 hours) - best effort
    const cleanupCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('rate_limit_submissions')
      .delete()
      .lt('created_at', cleanupCutoff);
      
  } catch (error) {
    console.error('Rate limit recording error:', error);
  }
}

// Server-side validation schema
const applicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  phone: z.string().trim().max(20, "Phone too long").optional().nullable(),
  university: z.string().trim().max(100, "University name too long").optional().nullable(),
  neighbourhood: z.string().max(100, "Neighbourhood too long").optional().nullable(),
  budget: z.string().max(50, "Budget too long").optional().nullable(),
  rooms: z.string().max(20, "Rooms too long").optional().nullable(),
  duration: z.string().max(50, "Duration too long").optional().nullable(),
  propertyType: z.string().max(50, "Property type too long").optional().nullable(),
  roommatePreference: z.string().max(50, "Roommate preference too long").optional().nullable(),
  furnished: z.boolean().optional().nullable(),
  nearTransport: z.boolean().optional().nullable(),
  petsAllowed: z.boolean().optional().nullable(),
  smokingAllowed: z.boolean().optional().nullable(),
  notes: z.string().trim().max(2000, "Notes too long").optional().nullable(),
  // Honeypot field - must be empty for legitimate submissions
  website: z.string().max(0).optional().nullable(),
});

type ApplicationData = z.infer<typeof applicationSchema>;

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting check
    const clientIP = getClientIP(req);
    const rateLimitResult = await checkRateLimit(clientIP);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: rateLimitResult.error }),
        { 
          status: 429, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        }
      );
    }

    const rawData = await req.json();
    
    // Validate input server-side
    const validationResult = applicationSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error.issues.length, "issues");
      return new Response(
        JSON.stringify({ error: "Invalid input data. Please check your form and try again." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const data = validationResult.data;

    // Honeypot check - if website field has any content, it's a bot
    if (rawData.website && rawData.website.length > 0) {
      console.log("Honeypot triggered - bot detected");
      // Return fake success to not reveal detection
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Record this submission for rate limiting (after validation passes)
    await recordSubmission(clientIP);
    
    // Log minimal, non-PII data for debugging
    console.log("Processing application submission");

    // Format boolean preferences for email
    const formatBoolean = (value?: boolean | null) => value ? "Yes" : "No";
    
    // Helper to safely escape and display optional fields
    const safeField = (value: string | null | undefined, fallback: string): string => {
      return value ? escapeHtml(value) : fallback;
    };

    // Build admin notification email HTML with escaped user input
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 10px;">
          🏠 New Housing Application
        </h1>
        
        <h2 style="color: #374151; margin-top: 24px;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6B7280;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Phone:</td><td style="padding: 8px 0;">${safeField(data.phone, "Not provided")}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">University:</td><td style="padding: 8px 0;">${safeField(data.university, "Not specified")}</td></tr>
        </table>

        <h2 style="color: #374151; margin-top: 24px;">Housing Preferences</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6B7280;">Neighbourhood:</td><td style="padding: 8px 0;">${safeField(data.neighbourhood, "No preference")}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Budget:</td><td style="padding: 8px 0;">${safeField(data.budget, "Not specified")}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Rooms:</td><td style="padding: 8px 0;">${safeField(data.rooms, "Not specified")}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Duration:</td><td style="padding: 8px 0;">${safeField(data.duration, "Not specified")}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Property Type:</td><td style="padding: 8px 0;">${safeField(data.propertyType, "Not specified")}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Roommate Preference:</td><td style="padding: 8px 0;">${safeField(data.roommatePreference, "Not specified")}</td></tr>
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
          <p style="background: #F3F4F6; padding: 16px; border-radius: 8px;">${escapeHtml(data.notes)}</p>
        ` : ""}

        <p style="color: #9CA3AF; font-size: 12px; margin-top: 32px; border-top: 1px solid #E5E7EB; padding-top: 16px;">
          This application was submitted via the Unikey website.
        </p>
      </div>
    `;

    // Build confirmation email for applicant with escaped user input
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
            <p style="font-size: 18px; color: #1E3A8A; font-weight: 600; margin: 0 0 24px 0;">Dear ${escapeHtml(data.name)},</p>
            
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
        from: "Unikey <contact@uni-key.ch>",
        to: ["contact@uni-key.ch"],
        subject: `🏠 New Housing Application from ${escapeHtml(data.name)}`,
        html: adminEmailHtml,
      }),
    });
    
    const adminResult = await adminEmailResponse.json();
    // Log only status, not full response details
    console.log("Admin email sent:", adminResult.id ? "success" : "failed");

    // Send confirmation email to applicant
    console.log("Sending confirmation email to applicant...");
    const applicantEmailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Unikey <contact@uni-key.ch>",
        to: [data.email],
        subject: "Welcome to Unikey - We received your application!",
        html: applicantEmailHtml,
      }),
    });
    
    const applicantResult = await applicantEmailResponse.json();
    // Log only status, not full response details
    console.log("Applicant email sent:", applicantResult.id ? "success" : "failed");

    // Return minimal success response (no internal details)
    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    // Log full error server-side for debugging
    console.error("Function error:", error);
    
    // Return generic error to client (no internal details)
    return new Response(
      JSON.stringify({ 
        error: "Failed to process application. Please try again or contact support." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);