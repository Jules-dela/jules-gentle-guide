import { Button } from "@/components/ui/button";
import { ShapeLandingHero } from "@/components/ui/shape-landing-hero";
import { motion } from "framer-motion";

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
      className="text-[16px] md:text-[20px] font-normal text-white/80 max-w-[600px] mb-8 md:mb-10"
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

export const Hero = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({
      behavior: 'smooth'
    });
  };

  return (
    <ShapeLandingHero
      badge="UniKey"
      title1="Your perfect student"
      title2="apartment in Lausanne."
    >
      <AnimatedSlogan />
      <Button 
        onClick={() => scrollToSection('apply')} 
        className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy font-medium text-[14px] md:text-[16px] px-8 md:px-10 py-3 md:py-4 h-auto rounded-lg transition-all duration-300 backdrop-blur-sm"
      >
        Find my home
      </Button>
    </ShapeLandingHero>
  );
};
