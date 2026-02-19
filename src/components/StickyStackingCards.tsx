import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Search, Video, FileCheck, Key } from "lucide-react";

const cards = [
  {
    title: "Precision Sourcing",
    description: "We monitor the market 24/7. Access verified listings and 'hidden' gems in Lausanne before the crowds do.",
    icon: Search,
    accent: "from-blue-500/10 to-indigo-500/10",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
    stat: "24/7",
    statLabel: "Market monitoring",
  },
  {
    title: "Professional Viewings",
    description: "We visit every property for you. Get high-definition video tours and neighborhood reports without leaving your home.",
    icon: Video,
    accent: "from-emerald-500/10 to-teal-500/10",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600",
    stat: "HD",
    statLabel: "Video walkthroughs",
  },
  {
    title: "The Gold-Standard Dossier",
    description: "Don't get rejected for paperwork. We build a perfect Swiss-standard application dossier that gets you to the top of the pile.",
    icon: FileCheck,
    accent: "from-amber-500/10 to-orange-500/10",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600",
    stat: "100%",
    statLabel: "Swiss-compliant",
  },
  {
    title: "Key-in-Hand Arrival",
    description: "From lease signing to the final inspection (État des Lieux), we handle the stress. You just show up and unlock your new life.",
    icon: Key,
    accent: "from-violet-500/10 to-purple-500/10",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600",
    stat: "0",
    statLabel: "Stress for you",
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

  const topOffset = 100 + index * 20;
  const isReversed = index % 2 === 1;
  const Icon = card.icon;

  return (
    <motion.div
      ref={cardRef}
      style={{
        scale,
        opacity,
        top: `${topOffset}px`,
        zIndex: index + 1,
      }}
      className="sticky mb-8 last:mb-0 rounded-3xl shadow-lg border border-border/50 overflow-hidden bg-card"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 items-stretch">
        {/* Text side */}
        <div className={`p-8 md:p-12 lg:p-16 bg-card flex items-center ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              {card.title}
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              {card.description}
            </p>
          </div>
        </div>

        {/* Visual side — icon + stat */}
        <div className={`bg-gradient-to-br ${card.accent} p-8 md:p-12 lg:p-16 flex items-center justify-center ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
          <div className="flex flex-col items-center text-center gap-6">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-2xl ${card.iconBg} flex items-center justify-center shadow-sm`}>
              <Icon className={`w-10 h-10 md:w-12 md:h-12 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                {card.stat}
              </p>
              <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium">
                {card.statLabel}
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const StickyStackingCards = () => {
  const headingRef = useRef<HTMLDivElement>(null);
  const isHeadingInView = useInView(headingRef, { once: true, margin: "-100px" });

  return (
    <section id="features" className="py-24 md:py-32">
      <div className="container max-w-6xl">
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
            <Card
              key={card.title}
              card={card}
              index={index}
              totalCards={cards.length}
            />
          ))}
          <div className="h-[30vh]" />
        </div>
      </div>
    </section>
  );
};
