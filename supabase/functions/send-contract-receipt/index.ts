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

// Generate plain text version of the contract
const generateContractText = (clientName: string, signedDate: string) => `SERVICE AGREEMENT, LIABILITY WAIVER & DATA CONSENT

Between Unikey Sàrl ("Service Provider") and Client ("Tenant")

═══════════════════════════════════════════════════════════════════════════════

1. PARTIES

CLIENT ("TENANT")
Full Name: ${clientName}
Agreement Date: ${signedDate}

SERVICE PROVIDER ("UNIKEY")
Company Name: Unikey Sàrl
Email: support@unikey.ch
Website: www.unikey.ch

═══════════════════════════════════════════════════════════════════════════════

2. PURPOSE AND SCOPE OF THE AGREEMENT

2.1 Unikey provides apartment search assistance, matchmaking, and advisory services for students seeking accommodation in or around Lausanne, Switzerland.

2.2 Unikey does not act as and must not be considered as:
  • A real estate agency or licensed real estate broker

2.3 This Agreement governs only the services provided by Unikey to the Client and does not govern any rental agreement between the Client and any landlord, agency, or third party.

═══════════════════════════════════════════════════════════════════════════════

3. NATURE AND LIMITATIONS OF THE SERVICE

3.1 Unikey provides, on a best-effort basis:
  • Curated accommodation suggestions based on the Client's profile and preferences
  • Facilitation of contact with property owners, agencies or platforms
  • Administrative guidance and document checklists related to the rental process
  • Optional relocation and onboarding information

3.2 Unikey does not guarantee, and shall not be held responsible for:
  • The availability, quality, size, condition, equipment, or location of any property
  • The rental price, additional costs, or any subsequent changes to these
  • The Client's acceptance by a landlord/agency or the successful signing of a lease
  • The approval of visas, residence permits, guarantors, or any administrative procedures

3.3 The Client acknowledges that they are solely responsible for:
  • Visiting, inspecting, and evaluating any property
  • Negotiating, reviewing, and signing the rental agreement
  • Ensuring that the housing solution meets their needs and expectations

═══════════════════════════════════════════════════════════════════════════════

4. INTERMEDIARY BROKERAGE DISCLOSURE

4.1 Unikey operates exclusively as an information, matching, and administrative assistance provider.

4.2 Unikey's role is limited to:
  • Identifying and presenting accommodation opportunities
  • Facilitating communication between potential tenants and housing providers
  • Providing general guidance on the rental process

4.3 Unikey does not receive any financial commission from landlords, agencies, guarantor companies, insurance companies, or property platforms.

4.4 The Client confirms understanding that all legal, contractual, and financial obligations relating to the rental agreement exist exclusively between the Client and the landlord/agency.

═══════════════════════════════════════════════════════════════════════════════

5. FEES, INVOICING, AND PAYMENT CONDITIONS

5.1 SERVICE FEE
The Client agrees to pay Unikey a service fee equal to five percent (5%) of the gross annual rent (12 months) of the selected property.

5.2 WHEN THE FEE BECOMES DUE
The service fee becomes due once BOTH conditions are met:
  (a) The Client has signed a rental agreement for a property facilitated by Unikey; and
  (b) The keys to the property are handed over to the Client.

5.3 INVOICE AND PAYMENT DEADLINE
The Client shall pay the invoice in full within seven (7) calendar days of the invoice date.

5.5 NON-REFUNDABLE NATURE OF THE FEE
Once conditions (a) and (b) of Clause 5.2 have been fulfilled, the service fee is strictly non-refundable.

═══════════════════════════════════════════════════════════════════════════════

6. REFUND AND GUARANTEE POLICY

6.1 Fees paid to Unikey are non-refundable, except where required by mandatory Swiss consumer protection law.

6.2 Unikey does not guarantee that:
  • The Client will ultimately secure housing through Unikey's services
  • The rental process will proceed without delay or difficulty
  • The Client will be satisfied with the final accommodation

═══════════════════════════════════════════════════════════════════════════════

7. DISCLAIMER OF WARRANTY AND LIMITATION OF LIABILITY

7.1 Unikey provides its services on a best-effort basis only.

7.2 Any rental agreement is exclusively concluded between the Client and the landlord/agency.

7.4 Unikey's total aggregate liability shall be strictly limited to the total amount of the service fee actually paid by the Client.

═══════════════════════════════════════════════════════════════════════════════

8. NO LEGAL, FINANCIAL, INSURANCE, OR IMMIGRATION ADVICE

Unikey does not provide legal, tax, financial, insurance, or immigration advice.

═══════════════════════════════════════════════════════════════════════════════

9. DATA PROTECTION & GDPR / SWISS FADP CONSENT

9.1 Unikey is committed to compliance with the Swiss Federal Data Protection Act (FADP) and EU GDPR.

9.4 The Client authorizes Unikey to share their personal data with landlords, real estate agencies, and property platforms as required for service delivery.

9.5 Personal data may be retained for up to two (2) years after the end of the service relationship.

═══════════════════════════════════════════════════════════════════════════════

10. GOVERNING LAW & JURISDICTION

This Agreement is governed by the laws of Switzerland. Any dispute shall be subject to the exclusive jurisdiction of the courts of Lausanne, Canton of Vaud, Switzerland.

═══════════════════════════════════════════════════════════════════════════════

11. ENTIRE AGREEMENT

This Agreement constitutes the entire understanding between Unikey and the Client regarding the services described herein.

═══════════════════════════════════════════════════════════════════════════════

ELECTRONICALLY SIGNED

Client: ${clientName}
Date: ${signedDate}

═══════════════════════════════════════════════════════════════════════════════`;

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

    const contractText = generateContractText(clientName, formattedDate);

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
                <li>Service fee: 5% of gross annual rent</li>
                <li>Payment due within 7 days of invoice</li>
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
            <pre style="color: #64748b; font-size: 10px; line-height: 1.4; white-space: pre-wrap; font-family: 'Courier New', monospace; margin: 0; max-height: 400px; overflow: auto;">${contractText}</pre>
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
