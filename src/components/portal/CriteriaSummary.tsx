import { motion } from 'framer-motion';
import { User, Wallet, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CriteriaSummaryProps {
  onNextStep: () => void;
}

// Dummy data for the form summary
const guestData = {
  name: 'Alex',
  budget: '1800 CHF',
  location: 'Lausanne Center',
  mustHaves: ['Studio', 'Near Metro', 'Furnished'],
};

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

export function CriteriaSummary({ onNextStep }: CriteriaSummaryProps) {
  return (
    <motion.div
      className="max-w-2xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome, {guestData.name}! 👋
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
              <p className="text-lg font-semibold text-foreground">{guestData.name}</p>
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
              <p className="text-lg font-semibold text-foreground">{guestData.budget}</p>
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
              <p className="text-lg font-semibold text-foreground">{guestData.location}</p>
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
                {guestData.mustHaves.map((item) => (
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
        </div>
      </motion.div>

      {/* Next Step Button */}
      <motion.div variants={itemVariants} className="mt-8 text-center">
        <Button
          onClick={onNextStep}
          size="lg"
          className="px-12 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          Next Step: Start Research
        </Button>
        <p className="mt-4 text-sm text-muted-foreground">
          We'll begin searching for apartments matching your criteria
        </p>
      </motion.div>
    </motion.div>
  );
}
