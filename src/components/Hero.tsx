import { motion } from "framer-motion";
import { ParticleNetwork } from "@/components/ui/particle-network";
import { GlowingButton } from "@/components/ui/glowing-button";
import { ScrollIndicator } from "@/components/ui/scroll-indicator";

const AnimatedSlogan = () => {
  const words = ["We", "find", "it.", "You", "live", "it."];
  
  const container = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.5,
      },
    },
  };

  const wordAnimation = {
    hidden: { opacity: 0.3 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.p
      className="text-[16px] md:text-[20px] font-normal text-white/70 max-w-[600px] mb-8 md:mb-10"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={wordAnimation}
          className="inline-block mr-[0.35em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
      delay: 0.3 + i * 0.2,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  }),
};

export const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  };

  return (
    <ParticleNetwork particleCount={100} connectionDistance={120} mouseRadius={180}>
      <div className="container mx-auto px-4 md:px-6 text-center">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.1] mb-8 md:mb-10 backdrop-blur-sm"
        >
          <span className="w-2 h-2 rounded-full bg-[#007AFF] animate-pulse shadow-[0_0_10px_rgba(0,122,255,0.8)]" />
          <span className="text-sm text-white/70 tracking-wide">UniKey</span>
        </motion.div>

        {/* Title */}
        <motion.div
          custom={1}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 md:mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
              Your perfect student
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#007AFF] to-[#00D4FF]">
              apartment in Lausanne.
            </span>
          </h1>
        </motion.div>

        {/* Slogan */}
        <motion.div
          custom={2}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatedSlogan />
        </motion.div>

        {/* CTA Button */}
        <motion.div
          custom={3}
          variants={fadeUpVariants}
          initial="hidden"
          animate="visible"
        >
          <GlowingButton onClick={() => scrollToSection('apply')}>
            Find my home
          </GlowingButton>
        </motion.div>
      </div>

      <ScrollIndicator />
    </ParticleNetwork>
  );
};
