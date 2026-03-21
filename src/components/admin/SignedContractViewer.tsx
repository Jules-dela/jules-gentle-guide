import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, CheckCircle2, Clock, Globe, Monitor } from 'lucide-react';
import type { ContractSignatureData } from '@/types/admin';

interface SignedContractViewerProps {
  contractData: ContractSignatureData;
  clientName: string;
}

/* ── Reusable contract text components ── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold text-foreground/90 mt-4 mb-1.5" style={{ lineHeight: '1.6' }}>
      {children}
    </p>
  );
}

function SectionText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs text-foreground/80 mb-1.5" style={{ lineHeight: '1.6' }}>
      {children}
    </p>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc pl-5 mb-1.5 space-y-0.5">
      {items.map((item, i) => (
        <li key={i} className="text-xs text-foreground/80" style={{ lineHeight: '1.6' }}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function FilledField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-baseline gap-2 py-0.5">
      <span className="text-xs text-foreground/70 whitespace-nowrap shrink-0">{label}</span>
      <span className="text-xs font-semibold text-foreground border-b border-foreground/30 flex-1 min-w-0 pb-0.5">
        {value || '—'}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border/40 my-3" />;
}

export function SignedContractViewer({ contractData, clientName }: SignedContractViewerProps) {
  const [open, setOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const contractRef = useRef<HTMLDivElement>(null);
  const signedDate = new Date(contractData.signed_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  };

  const handleDownloadSignature = () => {
    if (!contractData.signature_image) return;
    const link = document.createElement('a');
    link.href = contractData.signature_image;
    link.download = `signature-${clientName.replace(/\s+/g, '-').toLowerCase()}-${new Date(contractData.signed_at).toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadPDF = async () => {
    if (!contractRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(contractRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;

      let position = 0;
      let remaining = scaledHeight;

      while (remaining > 0) {
        if (position > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -position, pdfWidth, scaledHeight);
        position += pdfHeight;
        remaining -= pdfHeight;
      }

      pdf.save(`contract-${clientName.replace(/\s+/g, '-').toLowerCase()}-${new Date(contractData.signed_at).toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4 text-primary" />
          View Signed Document
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b bg-primary/5">
          <DialogTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Signed Service Agreement — {clientName}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Signed on {signedDate} at {new Date(contractData.signed_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </DialogHeader>

        <ScrollArea className="h-[70vh]">
          <div className="px-6 py-5 space-y-0" ref={contractRef}>
            {/* ══════════ CONTRACT DOCUMENT ══════════ */}
            <div className="bg-white dark:bg-muted/10 border rounded-xl p-5 shadow-sm">
              {/* Title */}
              <h2 className="text-sm font-bold text-foreground text-center mb-0.5">
                SERVICE AGREEMENT, LIABILITY WAIVER & DATA CONSENT
              </h2>
              <p className="text-xs text-foreground/70 text-center mb-4">
                Between Unikey SNC ("Service Provider") and Client ("Tenant")
              </p>

              <Divider />

              {/* 1. Parties — with filled fields */}
              <SectionTitle>1. Parties</SectionTitle>
              <SectionText>CLIENT ("TENANT")</SectionText>
              <div className="bg-primary/5 rounded-lg p-3 mb-3 border border-primary/10">
                <FilledField label="Full Name:" value={contractData.client_full_name} />
                <FilledField label="Date of Birth:" value={contractData.client_date_of_birth} />
                <FilledField label="Nationality:" value={contractData.client_nationality} />
              </div>
              <SectionText>SERVICE PROVIDER ("UNIKEY")</SectionText>
              <SectionText>Company Name: Unikey SNC</SectionText>
              <SectionText>Email: contact@uni-key.ch</SectionText>
              <SectionText>Website: www.unikey.ch</SectionText>

              <Divider />

              {/* 2. Purpose */}
              <SectionTitle>2. Purpose and Scope of the Agreement</SectionTitle>
              <SectionText>2.1 Unikey provides apartment search assistance, matchmaking, and advisory services for students seeking accommodation in or around Lausanne, Switzerland.</SectionText>
              <SectionText>2.2 Unikey does not act as and must not be considered as:</SectionText>
              <BulletList items={[
                'A real estate agency or licensed real estate broker',
                'A landlord, sub-lessor, property manager or guarantor',
                'A legal, tax, or immigration advisor',
              ]} />
              <SectionText>2.3 This Agreement governs only the services provided by Unikey to the Client.</SectionText>

              <Divider />

              {/* 3. Nature */}
              <SectionTitle>3. Nature and Limitations of the Service</SectionTitle>
              <SectionText>3.1 Unikey provides, on a best-effort basis:</SectionText>
              <BulletList items={[
                'Curated accommodation suggestions based on the Client\'s profile and preferences',
                'Facilitation of contact with property owners, agencies or platforms',
                'Administrative guidance and document checklists',
                'Optional relocation and onboarding information',
              ]} />

              <Divider />

              {/* 4. Intermediary */}
              <SectionTitle>4. Intermediary Brokerage Disclosure</SectionTitle>
              <SectionText>4.1 Unikey operates exclusively as an information, matching, and administrative assistance provider.</SectionText>

              <Divider />

              {/* 5. Fees */}
              <SectionTitle>5. Fees, Invoicing, and Payment Conditions</SectionTitle>
              <SectionText>5.1 Service Fee — The Client agrees to pay Unikey a service fee equal to one month rent of the selected property.</SectionText>
              <SectionText>5.2 The service fee becomes due once BOTH: (a) The Client has signed a rental agreement; and (b) The keys are handed over.</SectionText>

              <Divider />

              {/* 6-8 abbreviated */}
              <SectionTitle>6. Refund and Guarantee Policy</SectionTitle>
              <SectionText>Under all circumstances, fees paid to Unikey are non-refundable, except where required by mandatory Swiss consumer protection law.</SectionText>

              <Divider />

              <SectionTitle>7. Disclaimer of Warranty and Limitation of Liability</SectionTitle>
              <SectionText>Unikey provides its services on a best-effort basis only. Unikey does not own, manage, inspect, or operate any of the properties proposed.</SectionText>

              <Divider />

              <SectionTitle>8. Client Responsibilities and Obligations</SectionTitle>
              <SectionText>The Client agrees to provide truthful information, respond within reasonable time, treat all parties with respect, and comply with Swiss tenancy law.</SectionText>

              <Divider />

              {/* 9. Data Protection with initials */}
              <SectionTitle>9. Data Protection, Privacy, and Consent</SectionTitle>
              <SectionText>9.1–9.5 The Client consents to Unikey processing personal data for service delivery, including sharing with landlords and agencies as needed.</SectionText>
              <div className="bg-primary/5 rounded-lg p-3 my-2 border border-primary/10">
                <SectionText>9.6 Data Protection Consent:</SectionText>
                <FilledField label="Client Initials:" value={contractData.client_initials} />
              </div>

              <Divider />

              <SectionTitle>10. Termination</SectionTitle>
              <SectionText>Either party may terminate this Agreement in writing. The Client remains liable for any fees that have already become due.</SectionText>

              <Divider />

              <SectionTitle>11. Jurisdiction and Governing Law</SectionTitle>
              <SectionText>This Agreement is governed by Swiss law. The place of jurisdiction is Lausanne, Canton of Vaud.</SectionText>

              <Divider />

              {/* ══════════ SIGNATURE SECTION ══════════ */}
              <div className="mt-4 pt-4 border-t-2 border-foreground/20">
                <div className="flex items-center justify-between mb-3">
                  <SectionText>Date: {signedDate}</SectionText>
                  <SectionText>Place: Lausanne, Switzerland</SectionText>
                </div>

                <div className="bg-muted/20 rounded-xl p-4 border">
                  <p className="text-xs text-muted-foreground mb-2">Client Signature</p>
                  <div className="bg-white dark:bg-background rounded-lg p-3 border min-h-[80px] flex items-center justify-center">
                    <img
                      src={contractData.signature_image}
                      alt={`${clientName}'s signature`}
                      className="max-h-20 object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 text-center font-medium">
                    {contractData.client_full_name || clientName}
                  </p>
                </div>
              </div>
            </div>

            {/* ══════════ METADATA FOOTER ══════════ */}
            <div className="mt-4 p-4 bg-muted/30 rounded-xl border space-y-3">
              <p className="text-xs font-semibold text-foreground">Digital Verification Metadata</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Timestamp</p>
                    <p className="text-xs font-medium">{new Date(contractData.signed_at).toISOString()}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Globe className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">IP Address</p>
                    <p className="text-xs font-medium font-mono">{contractData.ip_address || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 col-span-2">
                  <Monitor className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-[10px] text-muted-foreground">Device</p>
                    <p className="text-xs font-medium">
                      {contractData.user_agent ? getBrowserInfo(contractData.user_agent) : 'N/A'}
                      {contractData.device_info ? ` on ${contractData.device_info.platform} (${contractData.device_info.screen_width}×${contractData.device_info.screen_height})` : ''}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleDownloadPDF} variant="default" size="sm" className="flex-1 gap-2 mt-2" disabled={downloading}>
                  <Download className="w-3.5 h-3.5" />
                  {downloading ? 'Generating PDF…' : 'Download Contract PDF'}
                </Button>
                <Button onClick={handleDownloadSignature} variant="outline" size="sm" className="flex-1 gap-2 mt-2">
                  <Download className="w-3.5 h-3.5" />
                  Signature Only
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
