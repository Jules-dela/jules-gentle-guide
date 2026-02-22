import { motion } from 'framer-motion';
import { User, Wallet, MapPin, Sparkles, Clock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceAgreement } from './ServiceAgreement';
import type { Profile, InitialCriteria, CaseStatus, ContractData, ContractSigningInput } from '@/types/portal';

interface CriteriaSummaryProps {
  profile?: Profile | null;
  criteria?: InitialCriteria | null;
  caseStatus?: CaseStatus;
  contractData?: ContractData | null;
  onNextStep: () => void;
  onSign?: (contractData: ContractSigningInput) => Promise<{ error: Error | null }>;
  readOnly?: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function CriteriaSummary({ profile, criteria, caseStatus, contractData, onNextStep, onSign, readOnly = false }: CriteriaSummaryProps) {
  // Use real data or fallback to defaults
  const name = profile?.name?.split(' ')[0] || 'Guest';
  const budget = criteria?.budget || 'Not specified';
  const location = criteria?.neighbourhood || 'Lausanne';
  
  // Build must-haves from criteria
  const mustHaves: string[] = [];
  if (criteria?.rooms) mustHaves.push(`${criteria.rooms} rooms`);
  if (criteria?.property_type) mustHaves.push(criteria.property_type);
  if (criteria?.furnished) mustHaves.push('Furnished');
  if (criteria?.near_transport) mustHaves.push('Near Metro');
  if (criteria?.pets_allowed) mustHaves.push('Pets OK');
  if (mustHaves.length === 0) mustHaves.push('Flexible');

  // Determine if we're waiting for proposals
  const isSearching = caseStatus === 'request_received' || caseStatus === 'search_in_progress';
  
  // Check if contract is signed
  const isSigned = !!contractData?.signed;

  return (
    <motion.div
      className="max-w-2xl mx-auto space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome, {name}! 👋
        </h1>
        <p className="text-muted-foreground text-lg">
          Here's a summary of your housing search criteria
        </p>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-[40px] shadow-xl border border-border overflow-hidden"
      >
        <div className="bg-primary/5 px-8 py-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Your Search Criteria</h2>
        </div>
        
        <div className="p-8 space-y-6">
          {/* Name */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-lg font-semibold text-foreground">{profile?.name || 'Guest'}</p>
            </div>
          </motion.div>

          {/* Budget */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget</p>
              <p className="text-lg font-semibold text-foreground">{budget}</p>
            </div>
          </motion.div>

          {/* Location */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Preferred Location</p>
              <p className="text-lg font-semibold text-foreground">{location}</p>
            </div>
          </motion.div>

          {/* Must-Haves */}
          <motion.div
            variants={itemVariants}
            className="flex items-start gap-4 p-4 rounded-2xl bg-muted/50"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Must-Haves</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {mustHaves.map((item) => (
                  <span
                    key={item}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-full"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Duration if available */}
          {criteria?.duration && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-lg font-semibold text-foreground">{criteria.duration}</p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Service Agreement - Only show if not signed and not read-only */}
      {!readOnly && onSign && (
        <motion.div variants={itemVariants}>
          <ServiceAgreement
            clientName={profile?.name || 'Guest'}
            onSign={onSign}
            isSigned={isSigned}
            signedTimestamp={contractData?.timestamp}
          />
        </motion.div>
      )}

      {/* Next Step Button - Hidden in read-only mode */}
      {!readOnly && (
        <motion.div variants={itemVariants} className="text-center">
          {!isSigned ? (
            <p className="text-sm text-muted-foreground">
              Please sign the service agreement above to authorize your housing search
            </p>
          ) : isSearching ? (
            <>
              <div className="inline-flex items-center gap-3 px-8 py-4 bg-primary/10 rounded-full mb-4">
                <Search className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-primary font-medium">We're searching for your perfect home...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You'll be notified when we find matching apartments
              </p>
            </>
          ) : (
            <>
              <Button
                onClick={onNextStep}
                size="lg"
                className="px-12 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              >
                Next Step: View Proposals
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                We've found apartments matching your criteria
              </p>
            </>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
