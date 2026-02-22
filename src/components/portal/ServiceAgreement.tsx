import { useState, useRef, useEffect, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Eraser, PenLine, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractSigningInput {
  signature_image: string;
  ip_address: string;
  timestamp: string;
  user_agent: string;
  device_info: {
    platform: string;
    language: string;
    screen_width: number;
    screen_height: number;
  };
}

interface ServiceAgreementProps {
  clientName?: string;
  onSign: (contractData: ContractSigningInput) => Promise<{ error: Error | null }>;
  isSigned?: boolean;
  signedTimestamp?: string | null;
  isLoading?: boolean;
}

// Generate the contract text with dynamic fields
const generateContractText = (clientName: string, currentDate: string) => `SERVICE AGREEMENT, LIABILITY WAIVER & DATA CONSENT

Between Unikey Sàrl ("Service Provider") and Client ("Tenant")

═══════════════════════════════════════════════════════════════════════════════

1. PARTIES

CLIENT ("TENANT")
Full Name: ${clientName}
Agreement Date: ${currentDate}

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
  • Optional relocation and onboarding information (e.g. local tips, practical information)

3.2 Unikey does not guarantee, and shall not be held responsible for:
  • The availability, quality, size, condition, equipment, or location of any property
  • The rental price, additional costs, or any subsequent changes to these
  • The Client's acceptance by a landlord/agency or the successful signing of a lease
  • The approval of visas, residence permits, guarantors, or any administrative procedures
  • The duration, stability, or suitability of the rental agreement for the Client
  • The safety, legal compliance, or technical functionality of the property

3.3 The Client acknowledges that they are solely responsible for:
  • Visiting (where possible), inspecting, and evaluating any property
  • Negotiating, reviewing, and signing the rental agreement
  • Ensuring that the housing solution meets their needs and expectations

═══════════════════════════════════════════════════════════════════════════════

4. INTERMEDIARY BROKERAGE DISCLOSURE

4.1 Unikey operates exclusively as an information, matching, and administrative assistance provider. Unikey is not a licensed real estate broker, property manager, fiduciary, or legal representative of any landlord, agency, or property owner.

4.2 Unikey's role is limited to:
  • Identifying and presenting accommodation opportunities
  • Facilitating communication between potential tenants and housing providers
  • Providing general guidance on the rental process

Unikey does not:
  • Draft, approve, or sign lease contracts on behalf of the Client or the landlord
  • Collect rent, deposits, or any recurring payments for landlords or agencies

4.3 In accordance with Swiss tenancy and consumer regulations, Unikey does not receive any financial commission from landlords, agencies, guarantor companies, insurance companies, or property platforms, unless explicitly stated in a separate written disclosure accepted by the Client.

4.4 The Client confirms understanding that all legal, contractual, and financial obligations relating to the rental agreement exist exclusively between the Client and the landlord/agency. Unikey is not a party to the rental agreement.

4.5 Should Swiss law require Unikey to hold specific accreditation, fiduciary insurance, or public registration for certain services, Unikey agrees to comply or, if not feasible, to immediately limit, suspend, or modify the relevant service scope.

═══════════════════════════════════════════════════════════════════════════════

5. FEES, INVOICING, AND PAYMENT CONDITIONS

5.1 SERVICE FEE
The Client agrees to pay Unikey a service fee equal to five percent (5%) of the gross annual rent (12 months) of the selected property, as stated in the signed rental agreement or confirmed reservation document.

5.2 WHEN THE FEE BECOMES DUE
The service fee becomes immediately and fully due once BOTH of the following conditions are met:
  (a) The Client has signed a rental agreement (lease or sublease) for a property identified, proposed, or facilitated by Unikey; and
  (b) The keys to the property are either handed over to the Client or confirmed in writing (including by email) by the landlord or agency as available for the Client on the agreed move-in date.

5.3 INVOICE AND PAYMENT DEADLINE
Upon confirmation of events (a) and (b) above, Unikey will issue an invoice to the Client. The Client shall pay the invoice in full within seven (7) calendar days of the invoice date by one of the accepted payment methods.

5.4 ACCEPTED PAYMENT METHODS
Payment can be made by:
  • Bank transfer to the account indicated on the invoice
  • Approved digital payment solutions (e.g. Twint, Revolut, or others specified by Unikey)
  • Any other method only if expressly agreed in writing by Unikey

5.5 NON-REFUNDABLE NATURE OF THE FEE
Once conditions (a) and (b) of Clause 5.2 have been fulfilled, the service fee is strictly non-refundable, except where mandatory Swiss law requires otherwise and only under the limited situations set out in Clause 6.

5.6 NO LINK TO FUTURE USE OR LENGTH OF RENTAL
The service fee is due and remains payable regardless of:
  • Early termination, cancellation, or non-renewal of the rental agreement by the Client or the landlord
  • Any dispute, rent reduction, or change in rental terms after the lease is signed
  • The Client's satisfaction or dissatisfaction with the property, location, landlord, neighbors, or any other circumstances

═══════════════════════════════════════════════════════════════════════════════

6. REFUND AND GUARANTEE POLICY

6.1 REFUND POLICY
Under all circumstances, fees paid to Unikey are non-refundable, except where required by mandatory Swiss consumer protection law and only in the following limited scenarios:
  • Visa refusal, financial difficulties, or personal change of plans by the Client: No refund
  • Landlord cancels or withdraws after lease signature or confirmed reservation for reasons not caused by Unikey: No refund. The Client must seek recourse directly with the landlord/agency or through appropriate legal channels
  • Fraud or gross misconduct proven and directly caused by Unikey or its employees that leads to the Client being unable to occupy the property: Full refund of the service fee, plus internal case review by Unikey

6.2 NO SERVICE GUARANTEE
Unikey does not guarantee that:
  • The Client will ultimately secure housing through Unikey's services
  • The rental process will proceed without delay, difficulty, or conflict
  • The Client will be satisfied with the final accommodation or the landlord/agency

═══════════════════════════════════════════════════════════════════════════════

7. DISCLAIMER OF WARRANTY AND LIMITATION OF LIABILITY

7.1 NO WARRANTY ON HOUSING OR OUTCOME
Unikey provides its services on a best-effort basis only. Unikey does not own, manage, inspect, or operate any of the properties proposed. Unikey makes no warranty, express or implied, regarding:
  • The condition, cleanliness, safety, legality, or regulatory compliance of any property
  • The behavior, reliability, solvency, or good faith of any landlord, agency, or co-tenant
  • The successful signing, performance, renewal, or termination of any rental agreement

7.2 NO RESPONSIBILITY FOR LANDLORD–TENANT RELATIONSHIP
The Client understands and agrees that:
  • Any rental agreement is exclusively concluded between the Client and the landlord/agency
  • All rights and obligations arise solely under that rental agreement
  • Unikey is not a party to the rental contract and has no duty to enforce, monitor, intervene in, or mediate its execution

7.3 FINANCIAL AND ADMINISTRATIVE RISKS
Unikey shall not be liable for any loss, cost, or damage related to:
  • Rent, deposits, utility bills, service charges, or other payments requested by the landlord, agency, or third parties
  • Hidden costs, additional charges, or unexpected expenses arising from the rental relationship
  • Administrative delays, refusals, or decisions by universities, guarantor companies, migration authorities, insurance providers, or any public entities
  • Misunderstandings, translation issues, or incomplete/incorrect information provided by the Client or by third parties

7.4 LIMITATION OF LIABILITY
To the fullest extent permitted by Swiss law:
  • Unikey's total aggregate liability for any claim arising out of or in connection with this Agreement or the services shall be strictly limited to the total amount of the service fee actually paid by the Client to Unikey under this Agreement
  • Unikey shall in no event be liable for any indirect, consequential, moral, punitive, or loss-of-chance damages

7.5 WAIVER OF CLAIMS
The Client hereby waives, to the maximum extent allowed by law, any present or future claim, action, or demand against Unikey based on:
  • Dissatisfaction with the rental property, neighbors, area, or environment
  • Acts or omissions of landlords, agencies, guarantor companies, insurers, or any other third parties
  • Events occurring after the signature of the rental agreement and/or the handover of keys

═══════════════════════════════════════════════════════════════════════════════

8. NO LEGAL, FINANCIAL, INSURANCE, OR IMMIGRATION ADVICE

8.1 Unikey does not provide legal, tax, financial, insurance, or immigration advice.

8.2 The Client is strongly encouraged to consult qualified professionals, such as:
  • A Swiss rental law attorney or legal advice service
  • Relevant housing authorities in the Canton of Vaud
  • The Swiss immigration and population office (e.g. OCPM or equivalent)
  • Private insurance providers or guarantor services

Any general information shared by Unikey is for informational purposes only and must not be considered as professional advice.

═══════════════════════════════════════════════════════════════════════════════

9. DATA PROTECTION & GDPR / SWISS FADP CONSENT

9.1 COMPLIANCE
Unikey is committed to compliance with the Swiss Federal Data Protection Act (FADP/LIFDPA) and, where applicable, the EU General Data Protection Regulation (GDPR).

9.2 DATA COLLECTED
Unikey may collect and process the following categories of personal data:
  • Identity and contact information (e.g. name, address, email, phone, date of birth, nationality)
  • University enrollment or student status verification
  • Housing preferences, budget and financial eligibility documents (where voluntarily provided by the Client)

9.3 PURPOSE OF COLLECTION AND PROCESSING
Personal data is collected and processed solely for:
  • Assessing the Client's housing needs and preferences
  • Communicating with the Client regarding the services
  • Presenting the Client to potential landlords/agencies and facilitating the housing search
  • Fulfilling Unikey's legal, accounting, and administrative obligations

9.4 DATA SHARING
The Client authorizes Unikey to share their personal data, strictly as required for service delivery, with:
  • Landlords, real estate agencies, property platforms and managers
  • Guarantor companies or insurance partners, only if requested or expressly authorized by the Client

Unikey will never sell, rent, or otherwise monetize the Client's personal data.

9.5 RETENTION AND DATA SUBJECT RIGHTS
Personal data may be retained for up to two (2) years after the end of the service relationship for administrative, legal, or audit purposes, unless a longer period is required by law.

The Client has the right to request access, correction, export, or deletion of their personal data, to the extent permitted by law. If the Client requests deletion before the end of any legally required retention period, Unikey will delete or anonymize what is not legally required to be kept.

═══════════════════════════════════════════════════════════════════════════════

10. GOVERNING LAW & JURISDICTION

10.1 This Agreement is governed by and shall be construed in accordance with the laws of Switzerland.

10.2 Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the competent courts of Lausanne, Canton of Vaud, Switzerland, unless mandatory law requires another forum.

═══════════════════════════════════════════════════════════════════════════════

11. ENTIRE AGREEMENT AND AMENDMENTS

11.1 This Agreement constitutes the entire understanding between Unikey and the Client regarding the services described herein and supersedes all prior oral or written statements on the same subject.

11.2 Any amendment or modification to this Agreement must be made in writing and signed by both parties.

═══════════════════════════════════════════════════════════════════════════════

SIGNATURE SECTION

By signing below, the Client (${clientName}) confirms that they have read, understood, and accepted all the terms of this Agreement, including the liability limitations, non-refundability of the service fee, and data protection/consent clauses.

Agreement Date: ${currentDate}

═══════════════════════════════════════════════════════════════════════════════

END OF DOCUMENT`;

export function ServiceAgreement({ 
  clientName = 'Guest',
  onSign, 
  isSigned = false, 
  signedTimestamp = null,
  isLoading = false 
}: ServiceAgreementProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Get current date formatted
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Generate contract with dynamic fields
  const contractText = generateContractText(clientName, currentDate);

  // Check if signature canvas is empty
  const checkSignatureEmpty = () => {
    if (sigCanvas.current) {
      setSignatureEmpty(sigCanvas.current.isEmpty());
    }
  };

  // Handle scroll detection - check if scrolled to bottom
  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    if (!target) return;
    
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    // Consider "at bottom" when within 30px of the end
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= 30;
    
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  // Attach scroll listener to the viewport element
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    // Find the actual scrollable viewport (Radix ScrollArea uses a nested div)
    const viewport = scrollContainer.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.addEventListener('scroll', handleScroll);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Clear signature
  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setSignatureEmpty(true);
    }
  };

  // Get client IP address (via public API)
  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  // Handle sign and submit
  const handleSign = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) return;

    setIsSubmitting(true);

    try {
      const signatureImage = sigCanvas.current.toDataURL('image/png');
      const ipAddress = await getClientIP();

      const signingInput: ContractSigningInput = {
        signature_image: signatureImage,
        ip_address: ipAddress,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        device_info: {
          platform: navigator.platform,
          language: navigator.language,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
        },
      };

      const result = await onSign(signingInput);
      if (result.error) {
        console.error('Error signing contract:', result.error);
      }
    } catch (err) {
      console.error('Error signing contract:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already signed, show confirmation
  if (isSigned) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[32px] shadow-xl border border-border overflow-hidden"
      >
        <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Service Agreement Signed</h3>
              <p className="text-sm text-muted-foreground">
                {signedTimestamp ? `Signed on ${new Date(signedTimestamp).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}` : 'Contract signed successfully'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <p className="text-xs text-muted-foreground text-center">
            A copy of this agreement has been sent to your email.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-[32px] shadow-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary/5 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Service Agreement</h3>
            <p className="text-sm text-muted-foreground">
              Please read and sign to authorize your housing search
            </p>
          </div>
          {!hasScrolledToBottom && (
            <Badge variant="secondary" className="gap-1 animate-pulse">
              <ChevronDown className="w-3 h-3" />
              Scroll to read
            </Badge>
          )}
        </div>
      </div>

      {/* Contract Text - Read-only scrollable area */}
      <div className="relative" ref={scrollContainerRef}>
        <ScrollArea className="h-80 bg-muted/20">
          <div className="px-6 py-5">
            <pre 
              className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed"
              style={{ 
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                fontSize: '13px',
                lineHeight: '1.7',
              }}
            >
              {contractText}
            </pre>
          </div>
        </ScrollArea>
        
        {/* Gradient overlay if not scrolled */}
        <AnimatePresence>
          {!hasScrolledToBottom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none flex items-end justify-center pb-3"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1 bg-white/90 px-3 py-1.5 rounded-full shadow-sm">
                <ChevronDown className="w-4 h-4 animate-bounce" />
                Scroll to the bottom to continue
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Signature Section */}
      <div className="p-6 border-t border-border">
        <AnimatePresence mode="wait">
          {hasScrolledToBottom ? (
            <motion.div
              key="signature"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-primary" />
                <p className="text-sm font-medium text-foreground">
                  Please sign here to authorize Jules to begin your search
                </p>
              </div>

              {/* Signature Canvas */}
              <div className="relative border-2 border-dashed border-muted-foreground/30 rounded-xl bg-white overflow-hidden">
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="#1e3a8a"
                  canvasProps={{
                    className: 'w-full h-32 cursor-crosshair',
                    style: { touchAction: 'none' }
                  }}
                  onEnd={checkSignatureEmpty}
                />
                {signatureEmpty && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-sm text-muted-foreground/50">Sign here</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearSignature}
                  className="gap-2"
                  disabled={isSubmitting || signatureEmpty}
                >
                  <Eraser className="w-4 h-4" />
                  Clear
                </Button>
                <Button
                  onClick={handleSign}
                  className="flex-1 gap-2"
                  disabled={isSubmitting || signatureEmpty || isLoading}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Sign & Initialize Search
                    </>
                  )}
                </Button>
              </div>

              {/* Legal Footer */}
              <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
                By signing, you agree to the terms of the UniKey Search Mandate and authorize the digital processing of your signature.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <p className="text-sm text-muted-foreground">
                Please scroll through and read the entire agreement to continue
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
