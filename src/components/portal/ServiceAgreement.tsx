import { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Eraser, PenLine, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContractData {
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
  onSign: (contractData: ContractData) => Promise<{ error: Error | null }>;
  isSigned?: boolean;
  existingSignature?: ContractData | null;
  isLoading?: boolean;
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
This agreement is governed by Swiss law. Any disputes shall be subject to the exclusive jurisdiction of the courts of Lausanne, Switzerland.

By signing below, you confirm that you have read, understood, and agree to all terms and conditions of this Search Mandate Agreement.`;

export function ServiceAgreement({ 
  onSign, 
  isSigned = false, 
  existingSignature = null,
  isLoading = false 
}: ServiceAgreementProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);
  const sigCanvas = useRef<SignatureCanvas | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Check if signature canvas is empty
  const checkSignatureEmpty = () => {
    if (sigCanvas.current) {
      setSignatureEmpty(sigCanvas.current.isEmpty());
    }
  };

  // Handle scroll detection
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 20;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

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

      const contractData: ContractData = {
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

      const result = await onSign(contractData);
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
  if (isSigned && existingSignature) {
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
                Signed on {new Date(existingSignature.timestamp).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-sm text-muted-foreground mb-3">Your Signature:</p>
            <img 
              src={existingSignature.signature_image} 
              alt="Your signature" 
              className="max-h-20 mx-auto"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
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

      {/* Contract Text */}
      <div className="relative">
        <ScrollArea 
          className="h-64 px-6 py-4 bg-muted/30"
          onScrollCapture={handleScroll}
        >
          <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-sans leading-relaxed">
            {SERVICE_AGREEMENT_TEXT}
          </pre>
        </ScrollArea>
        
        {/* Gradient overlay if not scrolled */}
        <AnimatePresence>
          {!hasScrolledToBottom && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none flex items-end justify-center pb-2"
            >
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ChevronDown className="w-4 h-4 animate-bounce" />
                Scroll to continue
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

              <p className="text-xs text-muted-foreground text-center">
                By signing, you agree to the terms above and authorize UniKey to begin your housing search.
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
