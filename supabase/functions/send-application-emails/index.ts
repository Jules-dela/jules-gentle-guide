import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Initialize Supabase client with service role for full access
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

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizePhone(phone: string | null | undefined): string | null {
  return phone ? phone.trim() : null;
}

function isDuplicateAuthError(message: string | undefined): boolean {
  if (!message) return false;
  const normalized = message.toLowerCase();
  return normalized.includes('already been registered') ||
    normalized.includes('already exists') ||
    normalized.includes('duplicate');
}

// Rate limit configuration
const RATE_LIMIT_MAX_REQUESTS = 5;
const RATE_LIMIT_WINDOW_HOURS = 1;

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
      return { allowed: true };
    }
    
    if (count !== null && count >= RATE_LIMIT_MAX_REQUESTS) {
      console.log(`Rate limit exceeded for IP: ${ip.substring(0, 8)}...`);
      return { 
        allowed: false, 
        error: 'Too many submissions. Please try again later.' 
      };
    }
    
    return { allowed: true };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true };
  }
}

// Record a submission for rate limiting
async function recordSubmission(ip: string): Promise<void> {
  try {
    await supabase.from('rate_limit_submissions').insert({ ip_address: ip });
    
    // Clean up old entries
    const cleanupCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('rate_limit_submissions').delete().lt('created_at', cleanupCutoff);
  } catch (error) {
    console.error('Rate limit recording error:', error);
  }
}

// Generate a secure random password
function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*';
  let password = '';
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  for (let i = 0; i < 16; i++) {
    password += chars[array[i] % chars.length];
  }
  return password;
}

// Contract data schema for server-side signing
const contractDataSchema = z.object({
  signature_image: z.string().min(1),
  ip_address: z.string().optional(),
  timestamp: z.string().optional(),
  user_agent: z.string().optional(),
  device_info: z.object({
    platform: z.string().optional(),
    language: z.string().optional(),
    screen_width: z.number().optional(),
    screen_height: z.number().optional(),
  }).optional(),
  client_full_name: z.string().optional(),
  client_date_of_birth: z.string().optional(),
  client_nationality: z.string().optional(),
  client_initials: z.string().optional(),
}).nullable().optional();

// Server-side validation schema
const applicationSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone too long"),
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
  movingDate: z.string().max(100).optional().nullable(),
  website: z.string().max(0).optional().nullable(),
  skipEmails: z.boolean().optional(),
  contractData: contractDataSchema,
  token: z.string().min(1, "Invitation token is required"),
  privacyAccepted: z.boolean().optional().nullable(),
});

type ApplicationData = z.infer<typeof applicationSchema>;

// Determine client type based on university field
function determineClientType(university: string | null | undefined): 'student' | 'employee' | 'other' {
  if (!university) return 'other';
  const lowerUniversity = university.toLowerCase();
  if (lowerUniversity.includes('ehl') || lowerUniversity.includes('epfl') || lowerUniversity.includes('unil') || 
      lowerUniversity.includes('university') || lowerUniversity.includes('école') ||
      lowerUniversity.includes('school') || lowerUniversity.includes('student') ||
      lowerUniversity.includes('college') || lowerUniversity.includes('campus')) {
    return 'student';
  }
  if (lowerUniversity.includes('company') || lowerUniversity.includes('corp') || 
      lowerUniversity.includes('inc') || lowerUniversity.includes('ltd') ||
      lowerUniversity.includes('gmbh') || lowerUniversity.includes('sa') ||
      lowerUniversity.includes('employee') || lowerUniversity.includes('employer') ||
      lowerUniversity.includes('office') || lowerUniversity.includes('work')) {
    return 'employee';
  }
  return 'other';
}

async function findUserByEmail(email: string) {
  const normalizedEmail = normalizeEmail(email);
  let page = 1;
  const perPage = 200;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });

    if (error) {
      console.error('Failed to list users while recovering existing account:', error.message);
      throw new Error('Failed to look up existing user account');
    }

    const users = data?.users ?? [];
    const existingUser = users.find((user) => normalizeEmail(user.email ?? '') === normalizedEmail);

    if (existingUser) {
      return existingUser;
    }

    if (users.length < perPage) {
      return null;
    }

    page += 1;
  }
}

async function getOrCreateProfile(userId: string, data: ApplicationData) {
  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (profileLookupError) {
    console.error('Failed to look up profile:', profileLookupError.message);
    throw new Error('Failed to look up user profile');
  }

  if (existingProfile) {
    return existingProfile;
  }

  const { data: createdProfile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      name: data.name.trim(),
      email: normalizeEmail(data.email),
      phone: normalizePhone(data.phone),
      client_type: determineClientType(data.university),
      company_school: data.university?.trim() || null,
    })
    .select('id')
    .single();

  if (profileError) {
    console.error('Failed to create profile:', profileError.message);

    const { data: recoveredProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (recoveredProfile) {
      return recoveredProfile;
    }

    throw new Error('Failed to create user profile');
  }

  return createdProfile;
}

function buildInitialCriteria(data: ApplicationData) {
  return {
    neighbourhood: data.neighbourhood,
    budget: data.budget,
    rooms: data.rooms,
    duration: data.duration,
    property_type: data.propertyType,
    propertyType: data.propertyType,
    roommate_preference: data.roommatePreference,
    roommatePreference: data.roommatePreference,
    furnished: data.furnished,
    near_transport: data.nearTransport,
    nearTransport: data.nearTransport,
    pets_allowed: data.petsAllowed,
    petsAllowed: data.petsAllowed,
    smoking_allowed: data.smokingAllowed,
    smokingAllowed: data.smokingAllowed,
    notes: data.notes,
    moving_date: data.movingDate,
    movingDate: data.movingDate,
    university: data.university,
  };
}

async function getOrCreateCase(profileId: string, data: ApplicationData) {
  // Fetch all non-closed cases and prefer the signed one
  const { data: existingCases, error: caseLookupError } = await supabase
    .from('cases')
    .select('id, contract_data')
    .eq('client_id', profileId)
    .neq('status', 'closed')
    .order('created_at', { ascending: false });

  if (caseLookupError) {
    console.error('Failed to look up existing case:', caseLookupError.message);
    throw new Error('Failed to look up case');
  }

  // Prefer signed case, then fall back to most recent
  const existingCase = existingCases?.find(c => c.contract_data != null) ?? existingCases?.[0];

  if (existingCase) {
    return existingCase;
  }

  const { data: createdCase, error: caseError } = await supabase
    .from('cases')
    .insert({
      client_id: profileId,
      status: 'request_received',
      initial_criteria: buildInitialCriteria(data),
    })
    .select('id, contract_data')
    .single();

  if (caseError) {
    console.error('Failed to create case:', caseError.message);

    const { data: recoveredCase } = await supabase
      .from('cases')
      .select('id, contract_data')
      .eq('client_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recoveredCase) {
      return recoveredCase;
    }

    throw new Error('Failed to create case');
  }

  return createdCase;
}

// Sign the contract server-side using service role (bypasses RLS/auth)
async function signContractServerSide(caseId: string, contractData: z.infer<typeof contractDataSchema>) {
  if (!contractData || !contractData.signature_image) {
    console.log('No contract data provided, skipping server-side signing');
    return;
  }

  // Check if already signed
  const { data: existingCase } = await supabase
    .from('cases')
    .select('contract_data')
    .eq('id', caseId)
    .single();

  if (existingCase?.contract_data) {
    console.log('Contract already signed for case:', caseId);
    return;
  }

  // Insert into contract_signatures table
  const { error: sigError } = await supabase
    .from('contract_signatures')
    .insert({
      case_id: caseId,
      signature_image: contractData.signature_image,
      ip_address: contractData.ip_address || null,
      user_agent: contractData.user_agent || null,
      device_info: contractData.device_info || null,
      signed_at: contractData.timestamp || new Date().toISOString(),
      client_full_name: contractData.client_full_name || null,
      client_date_of_birth: contractData.client_date_of_birth || null,
      client_nationality: contractData.client_nationality || null,
      client_initials: contractData.client_initials || null,
    });

  if (sigError) {
    console.error('Failed to insert contract signature:', sigError.message);
    // Don't throw — we'll still try to update the case
  }

  // Update cases.contract_data and advance status
  const { error: updateError } = await supabase
    .from('cases')
    .update({
      contract_data: {
        signed: true,
        timestamp: contractData.timestamp || new Date().toISOString(),
        client_full_name: contractData.client_full_name || null,
        client_date_of_birth: contractData.client_date_of_birth || null,
        client_nationality: contractData.client_nationality || null,
        client_initials: contractData.client_initials || null,
      },
      status: 'search_in_progress',
    })
    .eq('id', caseId);

  if (updateError) {
    console.error('Failed to update case with contract data:', updateError.message);
    throw new Error('Failed to sign contract');
  }

  console.log('Contract signed server-side for case:', caseId);
}

async function sendEmail(payload: {
  from: string;
  to: string[];
  subject: string;
  html: string;
}) {
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY is missing, skipping email send');
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('Email send failed:', response.status, result);
  }

  return result;
}

const handler = async (req: Request): Promise<Response> => {
  const corsHeaders = getCorsHeaders(req.headers.get('origin'));

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
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const rawData = await req.json();
    
    // Validate input
    const validationResult = applicationSchema.safeParse(rawData);
    if (!validationResult.success) {
      console.log("Validation failed:", validationResult.error.issues.length, "issues");
      return new Response(
        JSON.stringify({ error: "Invalid input data. Please check your form and try again." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    const data = validationResult.data;

    // Enforce mandatory contract signature
    if (!data.contractData || !data.contractData.signature_image) {
      console.log("Submission rejected: missing contract signature");
      return new Response(
        JSON.stringify({ error: "A signed service agreement is required to submit your application." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Honeypot check
    if (rawData.website && rawData.website.length > 0) {
      console.log("Honeypot triggered - bot detected");
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    await recordSubmission(clientIP);
    console.log("Processing application submission with portal creation");

    // Try to create the user first — this is the most reliable way to detect new vs existing
    let userId: string;
    let tempPassword: string | null = null;
    let isNewUser = false;

    tempPassword = generateSecurePassword();
    
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: normalizeEmail(data.email),
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        name: data.name.trim(),
        phone: normalizePhone(data.phone),
      }
    });

    if (createUserError) {
      if (isDuplicateAuthError(createUserError.message)) {
        // User already exists — find them
        console.log("User already exists, looking up by email");
        tempPassword = null; // Don't send password for existing users
        
        const existingUser = await findUserByEmail(data.email);
        
        if (existingUser) {
          userId = existingUser.id;
          console.log("Found existing user:", userId);
        } else {
          console.error("User reportedly exists but could not be found by email");
          throw new Error("Failed to find existing user account");
        }
      } else {
        console.error("Failed to create user:", createUserError.message);
        throw new Error("Failed to create user account");
      }
    } else {
      userId = newUser.user.id;
      isNewUser = true;
      console.log("Created new user account, isNewUser:", isNewUser);
    }

    const profile = await getOrCreateProfile(userId, data);
    console.log('Resolved profile:', profile.id);

    const newCase = await getOrCreateCase(profile.id, data);
    console.log("Created case:", newCase.id);

    // Sign contract server-side if contract data was provided
    if (data.contractData && !newCase.contract_data) {
      try {
        await signContractServerSide(newCase.id, data.contractData);
        console.log('Contract signed server-side successfully');
      } catch (contractErr) {
        console.error('Server-side contract signing failed:', contractErr);
        // Don't fail the whole submission — client can re-sign in portal
      }
    }

    // Format boolean preferences for email
    const formatBoolean = (value?: boolean | null) => value ? "Yes" : "No";
    const safeField = (value: string | null | undefined, fallback: string): string => {
      return value ? escapeHtml(value) : fallback;
    };

    // Build admin notification email
    const adminEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1E3A8A; border-bottom: 2px solid #1E3A8A; padding-bottom: 10px;">
          🏠 New Housing Application - Portal Created
        </h1>
        
        <div style="background: #E8F4E8; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <strong style="color: #166534;">✓ Case Created:</strong> ${newCase.id}<br>
          <strong style="color: #166534;">✓ New User:</strong> ${isNewUser ? 'Yes' : 'No (existing user)'}
        </div>
        
        <h2 style="color: #374151; margin-top: 24px;">Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #6B7280;">Name:</td><td style="padding: 8px 0; font-weight: bold;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Phone:</td><td style="padding: 8px 0;">${safeField(data.phone, "Not provided")}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">University:</td><td style="padding: 8px 0;">${safeField(data.university, "Not specified")}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Moving Date:</td><td style="padding: 8px 0;">${safeField(data.movingDate, "Not specified")}</td></tr>
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
          <tr><td style="padding: 8px 0; color: #6B7280;">Near Transport:</td><td style="padding: 8px 0;">${formatBoolean(data.nearTransport)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Pets Allowed:</td><td style="padding: 8px 0;">${formatBoolean(data.petsAllowed)}</td></tr>
          <tr><td style="padding: 8px 0; color: #6B7280;">Smoking Allowed:</td><td style="padding: 8px 0;">${formatBoolean(data.smokingAllowed)}</td></tr>
        </table>

        ${data.notes ? `
          <h2 style="color: #374151; margin-top: 24px;">Additional Notes</h2>
          <p style="background: #F3F4F6; padding: 16px; border-radius: 8px;">${escapeHtml(data.notes)}</p>
        ` : ""}
      </div>
    `;

    // Build welcome email with portal access for applicant
    const portalUrl = `${req.headers.get('origin') || 'https://uni-key.ch'}/auth`;
    
    const applicantEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      </head>
      <body style="margin: 0; padding: 0; background-color: #F8FAFC;">
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
          
          <!-- Header -->
          <div style="background: #1E3A8A; padding: 40px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 3px;">UNIKEY</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Student Housing Made Simple</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 32px;">
            <p style="font-size: 18px; color: #1E3A8A; font-weight: 600; margin: 0 0 24px 0;">Welcome ${escapeHtml(data.name)}!</p>
            
            <p style="color: #374151; line-height: 1.7; font-size: 15px; margin: 0 0 20px 0;">
              Thank you for choosing <strong style="color: #1E3A8A;">Unikey</strong>! Your application has been received and your personal housing portal is now ready.
            </p>
            
            ${isNewUser && tempPassword ? `
            <!-- Credentials Box -->
            <div style="background: linear-gradient(135deg, #1E3A8A 0%, #3B5998 100%); padding: 28px; border-radius: 12px; margin: 24px 0; color: white;">
              <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">🔐 Your Portal Access</h3>
              <p style="margin: 0 0 8px 0; font-size: 14px; opacity: 0.9;">Email: <strong>${escapeHtml(data.email)}</strong></p>
              <p style="margin: 0 0 16px 0; font-size: 14px; opacity: 0.9;">Temporary Password: <strong style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px;">${escapeHtml(tempPassword)}</strong></p>
              <p style="margin: 0; font-size: 12px; opacity: 0.7;">⚠️ Please change your password after first login</p>
            </div>
            ` : `
            <div style="background: #F0F4FF; padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #1E3A8A;">
              <p style="margin: 0; color: #374151; font-size: 14px;">
                You already have a Unikey account. Use your existing credentials to access the portal.
              </p>
            </div>
            `}

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${portalUrl}" style="display: inline-block; background: #1E3A8A; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Access Your Portal →
              </a>
            </div>

            <!-- What's Next -->
            <div style="background: #F8FAFC; padding: 24px; border-radius: 12px; margin: 24px 0;">
              <h3 style="color: #1E3A8A; margin: 0 0 16px 0; font-size: 16px; font-weight: 600;">📍 Track Your Journey</h3>
              <p style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0;">
                In your portal, you can:<br>
                • View your case status and timeline<br>
                • See property proposals when available<br>
                • Upload required documents<br>
                • Schedule visits and key handover
              </p>
            </div>

            <p style="color: #374151; line-height: 1.7; font-size: 15px; margin: 24px 0 0 0;">
              Questions? Reply to this email or contact us at 
              <a href="mailto:contact@uni-key.ch" style="color: #1E3A8A; font-weight: 500; text-decoration: none;">contact@uni-key.ch</a>
            </p>

            <p style="color: #374151; margin: 24px 0 0 0; font-size: 15px;">
              Best regards,<br>
              <strong style="color: #1E3A8A;">The Unikey Team</strong>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #1E3A8A; padding: 24px 32px; text-align: center;">
            <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0; font-weight: 500;">
              We do the searching, you focus on your studies.
            </p>
            
            <!-- Social Links -->
            <div style="margin: 16px 0;">
              <a href="https://instagram.com/unikey.ch" target="_blank" style="display: inline-flex; align-items: center; gap: 8px; text-decoration: none; color: rgba(255,255,255,0.9);">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: white;">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
                </svg>
                <span style="font-size: 13px; font-weight: 500;">@unikey.ch</span>
              </a>
            </div>
            
            <p style="color: rgba(255,255,255,0.6); font-size: 11px; margin: 0;">
              © 2025 Unikey | <a href="https://uni-key.ch" style="color: rgba(255,255,255,0.6);">uni-key.ch</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    if (!data.skipEmails) {
      try {
        console.log("Sending admin notification email...");
        const adminResult = await sendEmail({
          from: "Unikey <contact@uni-key.ch>",
          to: ["contact@uni-key.ch", "antoinepiras007@gmail.com"],
          subject: `🏠 New Application: ${escapeHtml(data.name)} - Case ${newCase.id.substring(0, 8)}`,
          html: adminEmailHtml,
        });
        console.log("Admin email sent:", adminResult && (adminResult as { id?: string }).id ? "success" : "failed");

        console.log("Sending welcome email with portal access...");
        const applicantResult = await sendEmail({
          from: "Unikey <contact@uni-key.ch>",
          to: [normalizeEmail(data.email)],
          subject: "🔑 Your Unikey Portal is Ready!",
          html: applicantEmailHtml,
        });
        console.log("Welcome email sent:", applicantResult && (applicantResult as { id?: string }).id ? "success" : "failed");
      } catch (emailError) {
        console.error('Email send step failed after case creation:', emailError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        caseId: newCase.id,
        isNewUser,
        portalUrl,
        ...(isNewUser && tempPassword ? { tempPassword } : {}),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Function error:", error);
    
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
