import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContractReceiptRequest {
  clientName: string;
  clientEmail: string;
  signedAt: string;
}

const SERVICE_AGREEMENT_TEXT = `UNIKEY SEARCH MANDATE AGREEMENT

1. SCOPE OF SERVICES
UniKey ("the Service Provider") agrees to provide personalized housing search services for the Client ("you") seeking accommodation in the Lausanne area. This includes property research, visit coordination, document preparation assistance, and landlord communication.

2. AUTHORIZATION
By signing below, you authorize Jules and the UniKey team to:
• Search for properties matching your specified criteria
• Contact landlords, real estate agencies, and property managers on your behalf
• Schedule and conduct property viewings (in-person or virtual)
• Submit your rental application dossier to prospective landlords
• Negotiate terms and conditions on your behalf

3. SERVICE FEE STRUCTURE
Our service operates on a strictly success-based model:

✓ NO upfront payments or deposits required
✓ NO fees if we don't find you a home
✓ Fee is equivalent to ONE MONTH'S RENT
✓ Fee is due ONLY upon successful lease signing

Payment is due within 7 days of signing your rental lease agreement. We accept bank transfer (IBAN details will be provided upon successful placement).

4. CLIENT OBLIGATIONS
You agree to:
• Provide accurate and complete information about your housing requirements
• Respond to communications within 48 hours
• Attend scheduled viewings or provide 24-hour cancellation notice
• Provide all required documentation in a timely manner
• Not engage directly with properties we present to you outside of our service

5. EXCLUSIVITY CLAUSE
For properties presented by UniKey, you agree not to contact the landlord or agency directly to circumvent our service. Any lease signed for a property we introduced shall trigger the service fee.

6. DATA PROTECTION
Your personal information is processed in accordance with Swiss Federal Act on Data Protection (FADP) and GDPR. Your data will only be shared with landlords and agencies as necessary for the housing search. See our full Privacy Policy for details.

7. DURATION & TERMINATION
This mandate remains in effect until:
• A rental agreement is signed (triggering the service fee), OR
• Either party terminates with 7 days written notice, OR
• 6 months from the date of signing (whichever comes first)

8. ELECTRONIC SIGNATURE
You acknowledge that your electronic signature below has the same legal effect as a handwritten signature. This agreement is legally binding upon signature.

9. GOVERNING LAW
This agreement is governed by Swiss law. Any disputes shall be subject to the exclusive jurisdiction of the courts of Lausanne, Switzerland.`;

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contract-receipt function invoked");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { clientName, clientEmail, signedAt }: ContractReceiptRequest = await req.json();

    // Validate required fields
    if (!clientName || !clientEmail || !signedAt) {
      console.error("Missing required fields:", { clientName, clientEmail, signedAt });
      throw new Error("Missing required fields: clientName, clientEmail, signedAt");
    }

    const formattedDate = new Date(signedAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send receipt email to client
    const emailResponse = await resend.emails.send({
      from: "UniKey <contact@uni-key.ch>",
      to: [clientEmail],
      subject: "Receipt of Agreement - UniKey Search Mandate",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Receipt of Agreement</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8fafc;">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px; border-radius: 16px 16px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 600;">UniKey</h1>
            <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0 0; font-size: 14px;">Student Housing Solutions</p>
          </div>
          
          <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e3a8a; margin: 0 0 16px 0; font-size: 20px;">Receipt of Agreement</h2>
            
            <p style="color: #374151; line-height: 1.6; margin: 0 0 16px 0;">
              Dear ${clientName},
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin: 0 0 24px 0;">
              Thank you for signing the UniKey Search Mandate Agreement. This email serves as your official receipt and confirmation of the agreement.
            </p>
            
            <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                <span style="font-size: 24px;">✅</span>
                <span style="color: #166534; font-weight: 600;">Agreement Successfully Signed</span>
              </div>
              <p style="color: #166534; margin: 0; font-size: 14px;">
                Signed on: <strong>${formattedDate}</strong>
              </p>
            </div>
            
            <h3 style="color: #1e3a8a; margin: 24px 0 16px 0; font-size: 16px;">What's Next?</h3>
            
            <ol style="color: #374151; line-height: 1.8; padding-left: 20px;">
              <li>Jules will now begin searching for properties matching your criteria</li>
              <li>You'll receive notifications when new apartment proposals are available</li>
              <li>You can track your search progress in your UniKey Portal</li>
            </ol>
            
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0;">
              <h4 style="color: #1e3a8a; margin: 0 0 12px 0; font-size: 14px;">Key Terms Reminder</h4>
              <ul style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0; padding-left: 16px;">
                <li>No upfront fees – pay only upon successful lease signing</li>
                <li>Service fee: equivalent to one month's rent</li>
                <li>Agreement valid for 6 months or until housing secured</li>
              </ul>
            </div>
            
            <p style="color: #374151; line-height: 1.6; margin: 24px 0 0 0;">
              If you have any questions about the agreement or your housing search, please don't hesitate to contact us.
            </p>
            
            <p style="color: #374151; line-height: 1.6; margin: 24px 0 0 0;">
              Best regards,<br>
              <strong>The UniKey Team</strong>
            </p>
          </div>
          
          <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">UniKey Student Housing Solutions</p>
            <p style="margin: 8px 0 0 0;">Lausanne, Switzerland</p>
            <p style="margin: 8px 0 0 0;">
              <a href="https://uni-key.ch" style="color: #3b82f6; text-decoration: none;">uni-key.ch</a> • 
              <a href="mailto:contact@uni-key.ch" style="color: #3b82f6; text-decoration: none;">contact@uni-key.ch</a>
            </p>
          </div>
          
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-top: 24px;">
            <h4 style="color: #475569; margin: 0 0 12px 0; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Full Agreement Text</h4>
            <pre style="color: #64748b; font-size: 11px; line-height: 1.5; white-space: pre-wrap; font-family: inherit; margin: 0; max-height: 300px; overflow: auto;">${SERVICE_AGREEMENT_TEXT}</pre>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Contract receipt email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error in send-contract-receipt function:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
