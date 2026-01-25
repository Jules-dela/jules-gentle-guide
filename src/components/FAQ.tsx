import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown, Phone, Mail } from "lucide-react";

const faqItems = [
  {
    question: "What exactly does Unikey handle for me?",
    answer: "We do it all: from finding the flat, assembling the documents, managing communication with the landlord/agency, securing the lease and even guiding you through the move in!"
  },
  {
    question: "How fast can you find me a flat in Lausanne?",
    answer: "Depending on availability and responsiveness of the landlords, the whole process will take between 3-6 weeks."
  },
  {
    question: "Can you help if I'm not in Switzerland yet?",
    answer: "Of course! We can run the whole process remotely through virtual viewings, digital applications, e-signing, and pre-arrival handover. Only caveat: to sign you need to have your Swiss permit."
  },
  {
    question: "Can you negotiate rent or terms on my behalf?",
    answer: "We negotiate wherever feasible: rent, start dates, furnished items, minor repairs, and special clauses to get you the best, fairest deal."
  },
  {
    question: "When is the best time to start looking for housing?",
    answer: "The earlier the better! It's hard to find apartments for specific dates in Lausanne, the earlier you send your application, the more time we have to evaluate the options and find the best fit for you!"
  },
  {
    question: "How is Unikey different from a traditional agency?",
    answer: "We work for students, not just listings. Personalized matching, fast response (within 24h), bilingual paperwork support, remote-friendly process, and end-to-end care until move-in."
  }
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
                  href="tel:+41211234567"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                    <Phone className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                    +41 21 123 45 67
                  </span>
                </a>
                
                <a 
                  href="mailto:hello@unikey.ch"
                  className="flex items-center gap-4 group"
                >
                  <div className="w-12 h-12 rounded-full bg-background border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-colors">
                    <Mail className="w-5 h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="text-foreground font-medium group-hover:text-primary transition-colors">
                    hello@unikey.ch
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
