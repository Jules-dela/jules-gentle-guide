import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const cards = [
  {
    title: "Response Within 24 Hours",
    description: "We know apartment hunting is time-sensitive. You'll hear from us within one business day—guaranteed.",
    bgColor: "bg-[hsl(220,20%,97%)]",
  },
  {
    title: "Only Verified Listings",
    description: "Every apartment we show you has been vetted through our partner platforms. No scams, no surprises.",
    bgColor: "bg-[hsl(210,30%,96%)]",
  },
  {
    title: "Personalized Matching",
    description: "Tell us your budget, preferred neighbourhoods, and must-haves. We'll find options that actually fit your needs.",
    bgColor: "bg-[hsl(215,25%,95%)]",
  },
  {
    title: "Full Support Until Move-In",
    description: "From first viewing to signing the lease, we're with you every step of the way.",
    bgColor: "bg-[hsl(225,20%,94%)]",
  },
];

interface CardProps {
  card: typeof cards[0];
  index: number;
  totalCards: number;
}

const Card = ({ card, index, totalCards }: CardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.9, 1]);

  // Calculate top offset for stacking effect
  const topOffset = 100 + index * 20;

  return (
    <motion.div
      ref={cardRef}
      style={{
        scale,
        opacity,
        top: `${topOffset}px`,
        zIndex: index + 1,
      }}
      className={`sticky mb-8 last:mb-0 ${card.bgColor} rounded-3xl shadow-lg border border-border/50 overflow-hidden`}
    >
      <div className="p-8 md:p-12 lg:p-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Side - Content */}
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {card.title}
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {card.description}
            </p>
          </div>

          {/* Right Side - Placeholder */}
          <div className="order-first lg:order-last">
            <div 
              className="aspect-[4/3] rounded-2xl bg-primary flex items-center justify-center"
            >
              <div className="text-center p-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-lg bg-primary-foreground/30" />
                </div>
                <p className="text-sm text-primary-foreground/70">
                  Mockup placeholder
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const StickyStackingCards = () => {
  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Your Apartment Search, Simplified.
          </h2>
        </div>

        <div className="relative">
          {cards.map((card, index) => (
            <Card
              key={card.title}
              card={card}
              index={index}
              totalCards={cards.length}
            />
          ))}
          {/* Extra spacer for last card to unstick */}
          <div className="h-[30vh]" />
        </div>
      </div>
    </section>
  );
};
