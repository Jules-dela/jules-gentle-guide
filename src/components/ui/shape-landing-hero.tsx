"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]",
}: {
  className?: string;
  delay?: number;
  width?: number;
  height?: number;
  rotate?: number;
  gradient?: string;
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate: rotate,
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 },
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width,
          height,
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border border-white/[0.08]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.15),transparent_60%)]"
          )}
        />
      </motion.div>
    </motion.div>
  );
}

interface ShapeLandingHeroProps {
  badge?: string;
  title1?: string;
  title2?: string;
  subtitle?: string;
  children?: React.ReactNode;
}

function ShapeLandingHero({
  badge = "UniKey",
  title1 = "Your perfect student",
  title2 = "apartment in Lausanne.",
  subtitle = "We find it. You live it.",
  children,
}: ShapeLandingHeroProps) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.5 + i * 0.2,
        ease: [0.25, 0.4, 0.25, 1] as const,
      },
    }),
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-navy">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.08] via-transparent to-primary/[0.05] blur-3xl" />

      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top left - tall shape */}
        <ElegantShape
          delay={0.3}
          width={600}
          height={140}
          rotate={12}
          gradient="from-primary/[0.12]"
          className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
        />

        {/* Bottom right - wide shape */}
        <ElegantShape
          delay={0.5}
          width={500}
          height={120}
          rotate={-15}
          gradient="from-primary/[0.10]"
          className="right-[-5%] md:right-[0%] bottom-[15%] md:bottom-[20%]"
        />

        {/* Middle left - medium shape */}
        <ElegantShape
          delay={0.4}
          width={300}
          height={80}
          rotate={-8}
          gradient="from-sky-500/[0.08]"
          className="left-[5%] md:left-[10%] top-[55%] md:top-[50%]"
        />

        {/* Top right - small shape */}
        <ElegantShape
          delay={0.6}
          width={200}
          height={60}
          rotate={20}
          gradient="from-indigo-400/[0.08]"
          className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
        />

        {/* Center right - medium shape */}
        <ElegantShape
          delay={0.7}
          width={150}
          height={40}
          rotate={-25}
          gradient="from-cyan-400/[0.07]"
          className="right-[20%] md:right-[25%] top-[45%] md:top-[40%]"
        />

        {/* Bottom left - small shape */}
        <ElegantShape
          delay={0.5}
          width={100}
          height={100}
          rotate={10}
          gradient="from-white/[0.05]"
          className="left-[15%] md:left-[20%] bottom-[20%] md:bottom-[25%]"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] mb-8 md:mb-10"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-white/70 tracking-wide">{badge}</span>
          </motion.div>

          {/* Titles */}
          <motion.div
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight mb-6 md:mb-8">
              <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                {title1}
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-sky-300">
                {title2}
              </span>
            </h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg md:text-xl text-white/60 mb-8 max-w-xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* CTA area */}
          {children && (
            <motion.div
              custom={3}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-navy via-navy/80 to-transparent pointer-events-none" />
    </div>
  );
}

export { ShapeLandingHero, ElegantShape };
