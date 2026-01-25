import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown, Phone, Mail } from "lucide-react";

const faqItems = [
  {
    question: "How does the apartment search process work?",
    answer: "Once you submit your preferences through our form, our team reviews your criteria and begins searching for matching properties across our partner platforms. We'll send you curated proposals within 24-48 hours, and you can review them directly in your client portal."
  },
  {
    question: "What areas do you cover in Switzerland?",
    answer: "We primarily focus on the Lausanne region, including areas popular with students from EHL, EPFL, and UNIL. This includes neighborhoods like Lausanne city center, Renens, Prilly, Pully, and surrounding communes with good transport links to universities."
  },
  {
    question: "How much does your service cost?",
    answer: "Our service is strictly success-based. We believe in results, which is why we require zero upfront payments or prepayments. Our fee is equivalent to one month's rent and is only due once you have successfully signed the lease for your new home. If we don't find your perfect match, you don't pay a cent."
  },
  {
    question: "What documents will I need to apply for an apartment?",
    answer: "Typically, you'll need proof of identity (passport/ID), proof of income or scholarship, a debt collection certificate (available from your commune), and references from previous landlords if applicable. We'll guide you through the entire documentation process."
  },
  {
    question: "How long does it usually take to find an apartment?",
    answer: "The timeline varies depending on your criteria and market availability. On average, students find suitable housing within 2-4 weeks. However, we recommend starting your search at least 2 months before your desired move-in date, especially during peak seasons (August-September)."
  },
];

interface FAQItemProps {
  index: number;
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItem = ({ index, question, answer, isOpen, onToggle }: FAQItemProps) => {
  return (
    <motion.div
      layout
      className="bg-background rounded-2xl border border-border/50 overflow-hidden"
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-5 md:p-6 text-left hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-medium text-muted-foreground min-w-[2rem]">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="flex-1 text-base md:text-lg font-medium text-foreground">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-muted-foreground"
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </button>
      
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 md:pb-6 pl-[4.5rem] md:pl-[5rem]">
              <p className="text-muted-foreground leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const FAQ = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);
  const headingRef = useRef<HTMLDivElement>(null);
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" });

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="faq" className="py-24 md:py-32">
      <div className="container max-w-6xl">
        <motion.div 
          layout
          className="bg-muted/50 rounded-[32px] md:rounded-[40px] p-6 md:p-10 lg:p-12 relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.5fr] gap-10 lg:gap-16">
            {/* Left Side - Sticky Header */}
            <div className="lg:sticky lg:top-32 lg:self-start space-y-8 relative">
              {/* Large FAQ Watermark */}
              <div className="absolute -left-4 top-0 text-[120px] md:text-[160px] font-bold text-foreground/[0.03] leading-none select-none pointer-events-none">
                FAQ
              </div>
              
              <motion.div 
                ref={headingRef}
                className="relative z-10"
                initial={{ opacity: 0, y: 30 }}
                animate={isHeadingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Questions & Answers
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Everything you need to know about our apartment search service. Can't find what you're looking for? Reach out to us directly.
                </p>
              </motion.div>

              {/* Contact Info */}
              <div className="relative z-10 space-y-4">
              <a 
                  href="tel:+41783304112"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                    <Phone className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                    +41 78 330 41 12
                  </span>
                </a>
                
                <a 
                  href="mailto:contact@uni-key.ch"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                    <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                    contact@uni-key.ch
                  </span>
                </a>
              </div>
            </div>

            {/* Right Side - FAQ Items */}
            <motion.div layout className="space-y-3">
              {faqItems.map((item, index) => (
                <FAQItem
                  key={index}
                  index={index}
                  question={item.question}
                  answer={item.answer}
                  isOpen={openItems.includes(index)}
                  onToggle={() => toggleItem(index)}
                />
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
