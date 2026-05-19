import { useState, useRef, useEffect, useCallback } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CheckCircle2, Eraser, PenLine, Loader2, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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
  client_full_name?: string;
  client_date_of_birth?: string;
  client_nationality?: string;
  client_initials?: string;
}

interface ServiceAgreementProps {
  clientName?: string;
  onSign: (contractData: ContractSigningInput) => Promise<{ error: Error | null }>;
  isSigned?: boolean;
  signedTimestamp?: string | null;
  isLoading?: boolean;
}

/* ── Embedded contract field ── */
function ContractField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  maxLength?: number;
}) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span className="text-sm text-foreground/85 whitespace-nowrap shrink-0" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          "flex-1 bg-transparent border-0 border-b-2 border-muted-foreground/30",
          "focus:border-primary focus:outline-none",
          "text-sm text-foreground placeholder:text-muted-foreground/40",
          "py-1 px-1 transition-colors duration-200",
          "min-w-0"
        )}
        style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: '1.7' }}
      />
    </div>
  );
}

/* ── Contract section renderer ── */
function ContractSection({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mb-1", className)}>
      {children}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold text-foreground/90 mt-6 mb-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: '1.7' }}>
      {children}
    </p>
  );
}

function SectionText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-foreground/85 mb-2" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: '1.7' }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-6 mb-2 space-y-0.5">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-foreground/85" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: '1.7' }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Divider() {
  return <div className="border-t border-border/40 my-4" />;
}

export function ServiceAgreement({
  clientName = 'Guest',
  onSign,
  isSigned = false,
  signedTimestamp = null,
  isLoading = false,
}: ServiceAgreementProps) {
  const { toast } = useToast();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sigWrapperRef = useRef<HTMLDivElement | null>(null);

  // Interactive field states
  const [fullName, setFullName] = useState(clientName !== 'Guest' ? clientName : '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [nationality, setNationality] = useState('');
  const [initials, setInitials] = useState('');
  const [validationError, setValidationError] = useState('');

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const checkSignatureEmpty = () => {
    if (sigCanvas.current) {
      setSignatureEmpty(sigCanvas.current.isEmpty());
    }
  };

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLDivElement;
    if (!target) return;
    const isAtBottom = target.scrollHeight - target.scrollTop - target.clientHeight <= 30;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    const viewport = scrollContainer.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.addEventListener('scroll', handleScroll);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Resize the signature canvas buffer to match its container width so
  // strokes are not clipped on mobile (default canvas width is 300px).
  useEffect(() => {
    const wrapper = sigWrapperRef.current;
    if (!wrapper) return;
    const resize = () => {
      const canvas = (sigCanvas.current as any)?.getCanvas?.() as HTMLCanvasElement | undefined;
      if (!canvas) return;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = wrapper.clientWidth;
      const height = wrapper.clientHeight;
      if (!width || !height) return;
      // Preserve existing drawing
      const data = (sigCanvas.current as any)?.toData?.();
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      const ctx = canvas.getContext('2d');
      ctx?.scale(ratio, ratio);
      if (data && data.length) {
        (sigCanvas.current as any)?.fromData?.(data);
      }
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);
    window.addEventListener('orientationchange', resize);
    return () => {
      ro.disconnect();
      window.removeEventListener('orientationchange', resize);
    };
  }, []);

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setSignatureEmpty(true);
    }
  };

  const getClientIP = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const validate = (): boolean => {
    if (!fullName.trim()) {
      setValidationError('Please enter your full name in the contract.');
      return false;
    }
    if (!dateOfBirth.trim()) {
      setValidationError('Please enter your date of birth.');
      return false;
    }
    if (!nationality.trim()) {
      setValidationError('Please enter your nationality.');
      return false;
    }
    if (!initials.trim()) {
      setValidationError('Please provide your initials for the data consent clause (Section 9.6).');
      return false;
    }
    if (sigCanvas.current?.isEmpty()) {
      setValidationError('Please sign the contract before submitting.');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSign = async () => {
    if (!validate()) {
      toast({
        title: "Missing information",
        description: validationError || "Please complete all required fields and sign the contract.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const signatureImage = sigCanvas.current!.toDataURL('image/png');
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
        client_full_name: fullName.trim(),
        client_date_of_birth: dateOfBirth.trim(),
        client_nationality: nationality.trim(),
        client_initials: initials.trim(),
      };

      const result = await onSign(signingInput);
      if (result.error) {
        console.error('Error signing contract:', result.error);
        const errMsg = result.error.message;
        if (errMsg === 'not_authenticated') {
          toast({
            title: "Login Required",
            description: "You already have an account. Please log in to your portal to sign the service agreement.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: errMsg || "Something went wrong while signing. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (err) {
      console.error('Error signing contract:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already signed state
  if (isSigned) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background rounded-[32px] shadow-xl border border-border overflow-hidden"
      >
        <div className="bg-green-500/10 px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Service Agreement Signed</h3>
              <p className="text-sm text-muted-foreground">
                {signedTimestamp ? `Signed on ${new Date(signedTimestamp).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
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
      className="bg-background rounded-[32px] shadow-xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-primary/5 px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Service Agreement</h3>
            <p className="text-sm text-muted-foreground">
              Please read, fill in your details, and sign to authorize your housing search
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

      {/* Contract Document */}
      <div className="relative" ref={scrollContainerRef}>
        <ScrollArea className="h-[28rem] md:h-[32rem] bg-muted/10">
          <div className="px-4 sm:px-6 md:px-10 py-6 pb-24 max-w-full overflow-x-hidden" style={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
            {/* ══════════ PAGE 1: Title & Parties ══════════ */}
            <ContractSection>
              <h2 className="text-base font-bold text-foreground text-center mb-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: '15px' }}>
                SERVICE AGREEMENT, LIABILITY WAIVER & DATA CONSENT
              </h2>
              <p className="text-sm text-foreground/85 text-center mb-4" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
                Between Unikey SNC ("Service Provider") and Client ("Tenant")
              </p>
            </ContractSection>

            <Divider />

            {/* 1. PARTIES */}
            <ContractSection>
              <SectionTitle>1. Parties</SectionTitle>

              <SectionText>CLIENT ("TENANT")</SectionText>
              
              {/* ─── Interactive Fields ─── */}
              <div className="bg-primary/5 rounded-xl p-4 mb-4 border border-primary/10">
                <ContractField
                  label="Full Name:"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Enter your full legal name"
                  maxLength={100}
                />
                <ContractField
                  label="Date of Birth:"
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                  placeholder="DD/MM/YYYY"
                  maxLength={20}
                />
                <ContractField
                  label="Nationality:"
                  value={nationality}
                  onChange={setNationality}
                  placeholder="Enter your nationality"
                  maxLength={60}
                />
              </div>

              <SectionText>SERVICE PROVIDER ("UNIKEY")</SectionText>
              <SectionText>Company Name: Unikey SNC</SectionText>
              <SectionText>Email: contact@uni-key.ch</SectionText>
              <SectionText>Website: www.unikey.ch</SectionText>
            </ContractSection>

            <Divider />

            {/* 2. PURPOSE AND SCOPE */}
            <ContractSection>
              <SectionTitle>2. Purpose and Scope of the Agreement</SectionTitle>
              <SectionText>2.1 Unikey provides apartment search assistance, matchmaking, and advisory services for students seeking accommodation in or around Lausanne, Switzerland.</SectionText>
              <SectionText>2.2 Unikey does not act as and must not be considered as:</SectionText>
              <BulletList items={[
                'A real estate agency or licensed real estate broker',
                'A landlord, sub-lessor, property manager or guarantor',
                'A legal, tax, or immigration advisor',
              ]} />
              <SectionText>2.3 This Agreement governs only the services provided by Unikey to the Client and does not govern any rental agreement between the Client and any landlord, agency, or third party.</SectionText>
            </ContractSection>

            <Divider />

            {/* 3. NATURE AND LIMITATIONS */}
            <ContractSection>
              <SectionTitle>3. Nature and Limitations of the Service</SectionTitle>
              <SectionText>3.1 Unikey provides, on a best-effort basis:</SectionText>
              <BulletList items={[
                'Curated accommodation suggestions based on the Client\'s profile and preferences',
                'Facilitation of contact with property owners, agencies or platforms',
                'Administrative guidance and document checklists related to the rental process',
                'Optional relocation and onboarding information (e.g. local tips, practical information)',
              ]} />
              <SectionText>3.2 Unikey does not guarantee, and shall not be held responsible for:</SectionText>
              <BulletList items={[
                'The availability, quality, size, condition, equipment, or location of any property',
                'The rental price, additional costs, or any subsequent changes to these',
                'The Client\'s acceptance by a landlord/agency or the successful signing of a lease',
                'The approval of visas, residence permits, guarantors, or any administrative procedures',
                'The duration, stability, or suitability of the rental agreement for the Client',
                'The safety, legal compliance, or technical functionality of the property (including but not limited to: electricity, heating, internet, structural condition, fire safety)',
              ]} />
              <SectionText>3.3 The Client acknowledges that they are solely responsible for:</SectionText>
              <BulletList items={[
                'Visiting (where possible), inspecting, and evaluating any property',
                'Negotiating, reviewing, and signing the rental agreement with Unikey',
                'Ensuring that the housing solution meets their needs and expectations',
              ]} />
            </ContractSection>

            <Divider />

            {/* 4. INTERMEDIARY BROKERAGE */}
            <ContractSection>
              <SectionTitle>4. Intermediary Brokerage Disclosure (Swiss Tenancy Law Transparency Clause)</SectionTitle>
              <SectionText>4.1 Unikey operates exclusively as an information, matching, and administrative assistance provider. Unikey is not a licensed real estate broker, property manager, fiduciary, or legal representative of any landlord, agency, or property owner.</SectionText>
              <SectionText>4.2 Unikey's role is limited to:</SectionText>
              <BulletList items={[
                'Identifying and presenting accommodation opportunities',
                'Facilitating communication between potential tenants and housing providers',
                'Providing general guidance on the rental process',
              ]} />
              <SectionText>Unikey does not:</SectionText>
              <BulletList items={[
                'Draft, approve, or sign lease contracts on behalf of the Client or the landlord',
                'Collect rent, deposits, or any recurring payments for landlords or agencies',
              ]} />
              <SectionText>4.3 In accordance with Swiss tenancy and consumer regulations, Unikey does not receive any financial commission from landlords, agencies, guarantor companies, insurance companies, or property platforms, unless explicitly stated in a separate written disclosure accepted by the Client.</SectionText>
              <SectionText>4.4 The Client confirms understanding that all legal, contractual, and financial obligations relating to the rental agreement exist exclusively between the Client and the landlord/agency. Unikey is not a party to the rental agreement.</SectionText>
              <SectionText>4.5 Should Swiss law require Unikey to hold specific accreditation, fiduciary insurance, or public registration for certain services, Unikey agrees to comply or, if not feasible, to immediately limit, suspend, or modify the relevant service scope.</SectionText>
            </ContractSection>

            <Divider />

            {/* 5. FEES */}
            <ContractSection>
              <SectionTitle>5. Fees, Invoicing, and Payment Conditions</SectionTitle>
              <SectionText>5.1 Engagement Fee (Frais d'engagement) — Upon completion of the online sign-up on Unikey's website and signature of this Agreement, the Client shall pay a one-time engagement fee of CHF 50 (fifty Swiss Francs), inclusive of any applicable Swiss VAT (TVA). This fee confirms the Client's serious intention to engage Unikey's services and enables Unikey to allocate resources to the Client's housing search.</SectionText>
              <SectionText>(a) Credit against the Service Fee. If the Client signs a rental agreement for a property identified, proposed, or facilitated by Unikey under Clause 5.3 below, the engagement fee shall be credited in full against the Service Fee due under Clause 5.2.</SectionText>
              <SectionText>(b) Right of Revocation. The Client may revoke this Agreement at any time prior to the Service Fee becoming due under Clause 5.3, without giving any reason. This contractual right is more generous than, and includes, the statutory fourteen (14) day revocation right under Art. 40a ff. of the Swiss Code of Obligations, which applies because this Agreement is concluded online and the engagement fee equals or exceeds CHF 40. To exercise this right, the Client shall send a written notice to Unikey by email to contact@uni-key.ch or by WhatsApp message to the number published on Unikey's website. No specific form is required (Art. 40e al. 3 CO); it is sufficient that the Client can demonstrate that the revocation was sent in time. Upon valid revocation, Unikey shall refund the engagement fee in full within thirty (30) days, without deduction. The Client confirms having been informed of this right at the time of signature.</SectionText>
              <SectionText>(c) Outcome When No Lease is Signed. This clause applies when (i) the service period defined in clause (d) below ends without a rental agreement being signed through Unikey's services, or (ii) either Party terminates this Agreement earlier without a rental agreement being signed. In such cases, the engagement fee shall be treated as follows: (1) If, at the time the Agreement ends, Unikey has proposed to the Client at least three (3) accommodation options matching the criteria the Client provided in the application process, and the Client has neither validated any of those options nor any other property facilitated by Unikey, the engagement fee shall be retained by Unikey as compensation for the services actually rendered, and the dossier shall be closed. Proposed options shall be deemed delivered when sent to the Client by email or other written means, regardless of whether the Client responds. (2) In all other cases — including where Unikey has proposed fewer than three (3) matching accommodation options, where the Client validly revokes this Agreement under clause (b) above, or where Unikey terminates the Agreement — the engagement fee shall be fully refunded to the Client within fourteen (14) calendar days of the Agreement ending, by bank transfer to the Client's designated account, without deduction.</SectionText>
              <SectionText>(d) Service Period. Unless the Parties agree otherwise in writing, the maximum service period under this Agreement is six (6) months from the date of signature, after which this Agreement shall automatically terminate, subject to clause (c) above. Either Party may terminate this Agreement at any time in accordance with mandatory Swiss law (notably Art. 404 of the Swiss Code of Obligations).</SectionText>
              <SectionText>(e) Payment Method and Receipt. The engagement fee is paid at the time of online sign-up exclusively by bank transfer processed through Stripe. A receipt or invoice in accordance with Swiss law shall be issued to the Client.</SectionText>
              <SectionText>5.2 Service Fee — The Client agrees to pay Unikey a service fee equal to one month rent of the selected property, as stated in the signed rental agreement or confirmed reservation document.</SectionText>
              <SectionText>5.3 When the Fee Becomes Due — The service fee becomes immediately and fully due once BOTH of the following conditions are met:</SectionText>
              <BulletList items={[
                '(a) The Client has signed a rental agreement (lease or sublease) for a property identified, proposed, or facilitated by Unikey; and',
                '(b) The keys to the property are either handed over to the Client or confirmed in writing (including by email) by the landlord or agency as available for the Client on the agreed move-in date.',
              ]} />
              <SectionText>5.4 Invoice and Payment Deadline — Upon confirmation of events (a) and (b) above, Unikey will issue an invoice to the Client. The Client shall pay the invoice in full within seven (7) calendar days of the invoice date by one of the accepted payment methods.</SectionText>
              <SectionText>5.5 Accepted Payment Methods — Payment can be made by:</SectionText>
              <BulletList items={[
                'Bank transfer to the Unikey SNC Stripe account indicated on the invoice',
              ]} />
              <SectionText>5.6 Non-Refundable Nature of the Service Fee — Once conditions (a) and (b) of Clause 5.3 have been fulfilled, the service fee is strictly non-refundable, except where mandatory Swiss law requires otherwise and only under the limited situations set out in Clause 6.</SectionText>
              <SectionText>5.7 No Link to Future Use or Length of Rental — The service fee is due and remains payable regardless of:</SectionText>
              <BulletList items={[
                'Early termination, cancellation, or non-renewal of the rental agreement by the Client or the landlord',
                'Any dispute, rent reduction, or change in rental terms after the lease is signed',
                'The Client\'s satisfaction or dissatisfaction with the property, location, landlord, neighbors, or any other circumstances',
              ]} />
            </ContractSection>

            <Divider />

            {/* 6. REFUND */}
            <ContractSection>
              <SectionTitle>6. Refund and Guarantee Policy</SectionTitle>
              <SectionText>6.1 Refund Policy — The engagement fee under Clause 5.1 is treated in accordance with that clause. All other fees paid to Unikey, including the service fee, are non-refundable, except where mandatory Swiss consumer protection law requires otherwise or in the limited scenario set out below.</SectionText>
              <SectionText>No refund applies in particular where:</SectionText>
              <BulletList items={[
                'The Client is affected by visa refusal, financial difficulties, or a personal change of plans;',
                'The landlord cancels or withdraws after lease signature or confirmed reservation, for reasons not caused by Unikey. In such cases the Client must seek recourse directly with the landlord, the agency, or through appropriate legal channels.',
              ]} />
              <SectionText>A full refund of the service fee applies where:</SectionText>
              <BulletList items={[
                'Fraud or gross misconduct proven and directly caused by Unikey or its employees that prevents the Client from occupying the property: Full refund of the service fee, plus internal case review by Unikey. For the avoidance of doubt, this remedy is without prejudice to any further claims the Client may have under mandatory Swiss law (in particular Art. 100 al. 1 CO).',
              ]} />
              <SectionText>6.2 No Service Guarantee — Unikey does not guarantee that:</SectionText>
              <BulletList items={[
                'The Client will ultimately secure housing through Unikey\'s services',
                'The rental process will proceed without delay, difficulty, or conflict',
                'The Client will be satisfied with the final accommodation or the landlord/agency',
              ]} />
            </ContractSection>

            <Divider />

            {/* 7. DISCLAIMER */}
            <ContractSection>
              <SectionTitle>7. Disclaimer of Warranty and Limitation of Liability</SectionTitle>
              <SectionText>7.1 No Warranty on Housing or Outcome — Unikey provides its services on a best-effort basis only. Unikey does not own, manage, inspect, or operate any of the properties proposed. Unikey makes no warranty, express or implied, regarding:</SectionText>
              <BulletList items={[
                'The condition, cleanliness, safety, legality, or regulatory compliance of any property',
                'The behavior, reliability, solvency, or good faith of any landlord, agency, or co-tenant',
                'The successful signing, performance, renewal, or termination of any rental agreement',
              ]} />
              <SectionText>7.2 No Responsibility for Landlord–Tenant Relationship — The Client understands and agrees that:</SectionText>
              <BulletList items={[
                'Any rental agreement is exclusively concluded between the Client and the landlord/agency',
                'All rights and obligations (including but not limited to payments, deposits, repairs, maintenance, terminations, and disputes) arise solely under that rental agreement',
                'Unikey is not a party to the rental contract and has no duty to enforce, monitor, intervene in, or mediate its execution',
              ]} />
              <SectionText>7.3 Financial and Administrative Risks — Unikey shall not be liable for any loss, cost, or damage related to:</SectionText>
              <BulletList items={[
                'Rent, deposits, utility bills, service charges, or other payments requested by the landlord, agency, or third parties',
                'Hidden costs, additional charges, or unexpected expenses arising from the rental relationship',
                'Administrative delays, refusals, or decisions by universities, guarantor companies, migration authorities, insurance providers, or any public entities',
                'Misunderstandings, translation issues, or incomplete/incorrect information provided by the Client or by third parties',
              ]} />
              <SectionText>7.4 Limitation of Liability — To the fullest extent permitted by Swiss law:</SectionText>
              <BulletList items={[
                'Unikey\'s total aggregate liability for any claim arising out of or in connection with this Agreement or the services shall be strictly limited to the total amount of the service fee actually paid by the Client to Unikey under this Agreement',
                'Unikey shall in no event be liable for any indirect, consequential, moral, punitive, or loss-of-chance damages',
              ]} />
              <SectionText>7.5 Waiver of Claims — The Client hereby waives, to the maximum extent allowed by law, any present or future claim, action, or demand against Unikey based on:</SectionText>
              <BulletList items={[
                'Dissatisfaction with the rental property, neighbors, area, or environment',
                'Acts or omissions of landlords, agencies, guarantor companies, insurers, or any other third parties',
                'Events occurring after the signature of the rental agreement and/or the handover of keys',
              ]} />
            </ContractSection>

            <Divider />

            {/* 8. NO LEGAL ADVICE */}
            <ContractSection>
              <SectionTitle>8. No Legal, Financial, Insurance, or Immigration Advice</SectionTitle>
              <SectionText>8.1 Unikey does not provide legal, tax, financial, insurance, or immigration advice.</SectionText>
              <SectionText>8.2 The Client is strongly encouraged to consult qualified professionals, such as:</SectionText>
              <BulletList items={[
                'A Swiss rental law attorney or legal advice service',
                'Relevant housing authorities in the Canton of Vaud',
                'The Swiss immigration and population office (e.g. OCPM or equivalent)',
                'Private insurance providers or guarantor services',
              ]} />
              <SectionText>Any general information shared by Unikey is for informational purposes only and must not be considered as professional advice.</SectionText>
            </ContractSection>

            <Divider />

            {/* 9. DATA PROTECTION */}
            <ContractSection>
              <SectionTitle>9. Data Protection & GDPR / Swiss FADP Consent</SectionTitle>
              <SectionText>9.1 Compliance — Unikey is committed to compliance with the Swiss Federal Data Protection Act (FADP/LIFDPA) and, where applicable, the EU General Data Protection Regulation (GDPR).</SectionText>
              <SectionText>9.2 Data Collected — Unikey may collect and process the following categories of personal data:</SectionText>
              <BulletList items={[
                'Identity and contact information (e.g. name, address, email, phone, date of birth, nationality)',
                'University enrollment or student status verification',
                'Housing preferences, budget and financial eligibility documents (where voluntarily provided by the Client)',
              ]} />
              <SectionText>9.3 Purpose of Collection and Processing — Personal data is collected and processed solely for:</SectionText>
              <BulletList items={[
                'Assessing the Client\'s housing needs and preferences',
                'Communicating with the Client regarding the services',
                'Presenting the Client to potential landlords/agencies and facilitating the housing search',
                'Fulfilling Unikey\'s legal, accounting, and administrative obligations',
              ]} />
              <SectionText>9.4 Data Sharing — The Client authorizes Unikey to share their personal data, strictly as required for service delivery, with:</SectionText>
              <BulletList items={[
                'Landlords, real estate agencies, property platforms and managers',
                'Guarantor companies or insurance partners, only if requested or expressly authorized by the Client',
                'Payment processors, in particular Stripe Payments Europe Ltd., for the secure handling of the engagement fee and the service fee, and for the issuance of payment receipts',
              ]} />
              <SectionText>Unikey will never sell, rent, or otherwise monetize the Client's personal data.</SectionText>
              <SectionText>Some service providers used by Unikey, including the payment processor Stripe, may process personal data outside Switzerland or the European Economic Area. Such transfers shall only occur where the destination country provides an adequate level of data protection as recognized by the Swiss Federal Council, or where appropriate safeguards are in place (in particular Standard Contractual Clauses approved by the Swiss Federal Data Protection and Information Commissioner (FDPIC) or the European Commission).</SectionText>
              <SectionText>9.5 Retention and Data Subject Rights — Personal data may be retained for up to two (2) years after the end of the service relationship for administrative, legal, or audit purposes, unless a longer period is required by law. The Client has the right to request access, correction, export, or deletion of their personal data, to the extent permitted by law. If the Client requests deletion before the end of any legally required retention period, Unikey will delete or anonymize what is not legally required to be kept.</SectionText>
              
              {/* 9.6 Consent with initials field */}
              <div className="bg-primary/5 rounded-xl p-4 mt-3 border border-primary/10">
                <SectionText>9.6 Consent Declaration — I hereby consent to Unikey collecting, processing, and sharing my personal data solely for the purposes described in Clause 9 above.</SectionText>
                <ContractField
                  label="Client Initials:"
                  value={initials}
                  onChange={setInitials}
                  placeholder="Your initials"
                  maxLength={10}
                />
              </div>
            </ContractSection>

            <Divider />

            {/* 10. GOVERNING LAW */}
            <ContractSection>
              <SectionTitle>10. Governing Law & Jurisdiction</SectionTitle>
              <SectionText>10.1 This Agreement is governed by and shall be construed in accordance with the laws of Switzerland.</SectionText>
              <SectionText>10.2 Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the competent courts of Lausanne, Canton of Vaud, Switzerland, unless mandatory law requires another forum.</SectionText>
            </ContractSection>

            <Divider />

            {/* 11. ENTIRE AGREEMENT */}
            <ContractSection>
              <SectionTitle>11. Entire Agreement and Amendments</SectionTitle>
              <SectionText>11.1 This Agreement constitutes the entire understanding between Unikey and the Client regarding the services described herein and supersedes all prior oral or written statements on the same subject.</SectionText>
              <SectionText>11.2 Any amendment or modification to this Agreement must be made in writing and signed by both parties.</SectionText>
            </ContractSection>

            <Divider />

            {/* ══════════ SIGNATURE SECTION (inside the document) ══════════ */}
            <ContractSection className="mt-6">
              <SectionText>
                By signing below, the Client ({fullName || '________'}) confirms that they have read, understood, and accepted all the terms of this Agreement, including the liability limitations, non-refundability of the service fee, and data protection/consent clauses.
              </SectionText>

              <div className="bg-muted/30 rounded-xl p-5 mt-4 border border-border/50">
                <p className="text-sm font-semibold text-foreground mb-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px' }}>
                  Client (Tenant)
                </p>
                
                <div className="space-y-1 mb-4">
                  <p className="text-sm text-foreground/85" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: '1.7' }}>
                    Name: {fullName || '________________________________________'}
                  </p>
                  <p className="text-sm text-foreground/85" style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', lineHeight: '1.7' }}>
                    Date: {currentDate}
                  </p>
                </div>

                {/* Signature label */}
                <div className="flex items-center gap-2 mb-3">
                  <PenLine className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">
                    Signature:
                  </p>
                </div>

                {/* Signature Canvas */}
                <div
                  ref={sigWrapperRef}
                  className="relative border-2 border-dashed border-muted-foreground/30 rounded-xl bg-background overflow-hidden h-40 md:h-36 w-full"
                >
                  <SignatureCanvas
                    ref={sigCanvas}
                    penColor="#1e3a8a"
                    canvasProps={{
                      className: 'block w-full h-full cursor-crosshair',
                      style: { touchAction: 'none', display: 'block' },
                    }}
                    onEnd={checkSignatureEmpty}
                  />
                  {signatureEmpty && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p className="text-sm text-muted-foreground/50">Sign here</p>
                    </div>
                  )}
                </div>

                {/* Clear button */}
                <div className="mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSignature}
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    disabled={isSubmitting || signatureEmpty}
                  >
                    <Eraser className="w-3.5 h-3.5" />
                    Clear signature
                  </Button>
                </div>
              </div>

              <div className="border-t-2 border-dashed border-muted-foreground/30 mt-4" />
              <p className="text-xs text-muted-foreground text-center mt-2 mb-2 tracking-widest">
                END OF DOCUMENT
              </p>
            </ContractSection>
          </div>
        </ScrollArea>

        {/* Gradient overlay when not scrolled to bottom */}
        <AnimatePresence>
          {!hasScrolledToBottom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none flex items-end justify-center pb-3"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1 bg-background/90 px-3 py-1.5 rounded-full shadow-sm">
                <ChevronDown className="w-4 h-4 animate-bounce" />
                Scroll to the bottom to continue
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Submit Section (outside the scroll, always visible at bottom) ── */}
      <div className="p-6 border-t border-border">
        <AnimatePresence mode="wait">
          {hasScrolledToBottom ? (
            <motion.div
              key="submit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              {/* Validation message */}
              <AnimatePresence>
                {validationError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-start gap-2.5 p-3 rounded-xl bg-destructive/10 border border-destructive/20"
                  >
                    <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{validationError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sign & Submit */}
              <Button
                onClick={handleSign}
                size="lg"
                className="w-full gap-2 text-base font-semibold rounded-xl h-14 shadow-lg hover:shadow-xl transition-all"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Sign Agreement
                  </>
                )}
              </Button>

              {/* Legal footer */}
              <p className="text-xs text-muted-foreground text-center pt-1">
                By clicking "Sign Agreement", you confirm that you have read, understood, and accepted all the terms of the UniKey Service Agreement and authorize the digital processing of your signature. This does not submit your application — you'll still need to complete the payment step below.
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
