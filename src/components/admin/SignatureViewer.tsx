import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Award, 
  Download, 
  Clock, 
  Globe, 
  Monitor, 
  CheckCircle2,
  XCircle 
} from 'lucide-react';

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

interface SignatureViewerProps {
  contractData: ContractData | null;
  clientName: string;
}

export function SignatureViewer({ contractData, clientName }: SignatureViewerProps) {
  const [open, setOpen] = useState(false);

  const handleDownload = () => {
    if (!contractData?.signature_image) return;

    // Create a link to download the signature image
    const link = document.createElement('a');
    link.href = contractData.signature_image;
    link.download = `signature-${clientName.replace(/\s+/g, '-').toLowerCase()}-${new Date(contractData.timestamp).toISOString().split('T')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBrowserInfo = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  if (!contractData) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
        <XCircle className="w-4 h-4 text-amber-600" />
        <span className="text-sm text-amber-700">Contract not yet signed</span>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Award className="w-4 h-4 text-amber-500" />
          View Signature
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Contract Signature Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Signature Image */}
          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-3">Digital Signature</p>
            <div className="bg-white rounded-lg p-4 border">
              <img 
                src={contractData.signature_image} 
                alt={`${clientName}'s signature`}
                className="max-h-24 mx-auto"
              />
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Timestamp */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">Signed On</p>
                <p className="text-sm font-medium">
                  {new Date(contractData.timestamp).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(contractData.timestamp).toLocaleTimeString('en-GB', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* IP Address */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
              <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground">IP Address</p>
                <p className="text-sm font-medium font-mono">{contractData.ip_address}</p>
              </div>
            </div>

            {/* Device Info */}
            <div className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg col-span-2">
              <Monitor className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">Device Information</p>
                <p className="text-sm font-medium">
                  {getBrowserInfo(contractData.user_agent)} on {contractData.device_info.platform}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Screen: {contractData.device_info.screen_width}x{contractData.device_info.screen_height} • 
                  Language: {contractData.device_info.language}
                </p>
              </div>
            </div>
          </div>

          {/* Download Button */}
          <Button 
            onClick={handleDownload} 
            variant="outline" 
            className="w-full gap-2"
          >
            <Download className="w-4 h-4" />
            Download Signature Image
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Simple badge for table display
export function SignedBadge({ isSigned }: { isSigned: boolean }) {
  if (isSigned) {
    return (
      <Badge 
        className="gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white border-0 hover:from-amber-500 hover:to-yellow-600"
      >
        <Award className="w-3 h-3" />
        Signed
      </Badge>
    );
  }
  return null;
}
