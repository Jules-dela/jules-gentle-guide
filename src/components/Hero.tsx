import { RefractiveGlassBackground } from "@/components/ui/refractive-glass-background";
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

const ShimmerButton = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
  return (
    <button
      onClick={onClick}
      className="relative overflow-hidden bg-transparent border-2 border-white text-white hover:bg-white hover:text-navy font-medium text-[14px] md:text-[16px] px-8 md:px-10 py-3 md:py-4 rounded-lg transition-all duration-300 backdrop-blur-md group"
      style={{
        boxShadow: '0 0 30px rgba(0, 122, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Shimmer effect overlay */}
      <span
        className="absolute inset-0 animate-shimmer opacity-60"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
      />
      {/* Button text */}
      <span className="relative z-10">{children}</span>
    </button>
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
    <RefractiveGlassBackground className="flex items-center justify-center">
      {/* Main content with glassmorphism glow */}
      <div className="relative z-10 px-5 md:px-20 w-full flex flex-col items-center text-center">
        {/* Subtle glassmorphism glow behind text */}
        <div 
          className="absolute inset-0 -z-10"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0, 50, 100, 0.3) 0%, transparent 60%)',
            filter: 'blur(40px)',
          }}
        />
        
        {/* Headline */}
        <h1 className="text-[32px] sm:text-[42px] md:text-[60px] font-semibold text-white leading-[1.15] tracking-[-0.02em] max-w-[900px] mb-4 md:mb-6 drop-shadow-lg">
          Your perfect student apartment in Lausanne.
        </h1>

        {/* Animated Subheadline */}
        <AnimatedSlogan />

        {/* CTA Button with shimmer effect */}
        <div className="flex justify-center mb-5">
          <ShimmerButton onClick={() => scrollToSection('apply')}>
            Find my home
          </ShimmerButton>
        </div>
      </div>
    </RefractiveGlassBackground>
  );
};
