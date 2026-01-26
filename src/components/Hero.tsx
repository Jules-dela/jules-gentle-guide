import { Button } from "@/components/ui/button";
import { MeshGradientBackground } from "@/components/ui/mesh-gradient-background";
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
      className="text-[16px] md:text-[20px] font-normal text-white max-w-[600px] mb-8 md:mb-10"
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
    <MeshGradientBackground className="flex items-center justify-center">
      {/* Main content */}
      <div className="relative z-10 px-5 md:px-20 w-full flex flex-col items-center text-center">
        {/* Headline */}
        <h1 className="text-[32px] sm:text-[42px] md:text-[60px] font-semibold text-white leading-[1.15] tracking-[-0.02em] max-w-[900px] mb-4 md:mb-6">
          Your perfect student apartment in Lausanne.
        </h1>

        {/* Animated Subheadline */}
        <AnimatedSlogan />

        {/* CTA Button with subtle backdrop blur */}
        <div className="flex justify-center mb-5">
          <Button 
            onClick={() => scrollToSection('apply')} 
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy font-medium text-[14px] md:text-[16px] px-8 md:px-10 py-3 md:py-4 h-auto rounded-lg transition-all duration-300 backdrop-blur-sm"
          >
            Find my home
          </Button>
        </div>
      </div>
    </MeshGradientBackground>
  );
};