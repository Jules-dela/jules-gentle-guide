import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const cards = [
  {
    title: "Precision Sourcing",
    description: "We monitor the market 24/7. Access verified listings and 'hidden' gems in Lausanne before the crowds do.",
  },
  {
    title: "Professional Viewings",
    description: "We visit every property for you. Get high-definition video tours and neighborhood reports without leaving your home.",
  },
  {
    title: "The Gold-Standard Dossier",
    description: "Don't get rejected for paperwork. We build a perfect Swiss-standard application dossier that gets you to the top of the pile.",
  },
  {
    title: "Key-in-Hand Arrival",
    description: "From lease signing to the final inspection (État des Lieux), we handle the stress. You just show up and unlock your new life.",
  },
];

interface CardProps {
  card: typeof cards[0];
  index: number;
}

const Card = ({ card, index }: CardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "start start"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 0.9, 1]);

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
      className="sticky mb-8 last:mb-0 rounded-3xl shadow-lg border-l-4 border-primary bg-card overflow-hidden"
    >
      <div className="p-8 md:p-12 lg:p-16 space-y-4">
        <span className="text-sm font-semibold text-primary tracking-wide uppercase">
          Step {index + 1}
        </span>
        <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
          {card.title}
        </h3>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
          {card.description}
        </p>
      </div>
    </motion.div>
  );
};

export const StickyStackingCards = () => {
  const headingRef = useRef<HTMLDivElement>(null);
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container max-w-4xl">
        <motion.div
          ref={headingRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isHeadingInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Your Apartment Search, Simplified.
          </h2>
        </motion.div>

        <div className="relative">
          {cards.map((card, index) => (
            <Card key={card.title} card={card} index={index} />
          ))}
          <div className="h-[30vh]" />
        </div>
      </div>
    </section>
  );
};
