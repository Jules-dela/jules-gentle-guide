"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GlassShapeProps {
  className?: string;
  width: number;
  height: number;
  rotate?: number;
  blur?: number;
  opacity?: number;
  scrollMultiplier?: number;
}

const GlassShape = ({ 
  className, 
  width, 
  height, 
  rotate = 0, 
  blur = 40,
  opacity = 0.08,
  scrollMultiplier = 1
}: GlassShapeProps) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200 * scrollMultiplier]);
  const scale = useTransform(scrollY, [0, 500], [1, 1.1]);

  return (
    <motion.div
      style={{ 
        width, 
        height, 
        rotate,
        y,
        scale,
        backdropFilter: `blur(${blur}px)`,
        WebkitBackdropFilter: `blur(${blur}px)`,
        opacity,
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
      className={cn(
        "absolute rounded-3xl",
        "bg-gradient-to-br from-white/[0.12] via-white/[0.05] to-transparent",
        "border border-white/[0.08]",
        "shadow-[0_8px_32px_rgba(0,122,255,0.15)]",
        className
      )}
    />
  );
};

interface GlassHeroBackgroundProps {
  children: React.ReactNode;
}

export const GlassHeroBackground = ({ children }: GlassHeroBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 500], [0, 100]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        mouseX.set(x);
        mouseY.set(y);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      ref={containerRef}
      className="relative min-h-screen w-full flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #001A33 0%, #002244 50%, #001122 100%)",
      }}
    >
      {/* Ambient gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#003366]/20 to-transparent" />
      
      {/* Mouse-following light beam */}
      <motion.div
        className="pointer-events-none absolute w-[600px] h-[600px] rounded-full"
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,212,255,0.04) 30%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Secondary light glow */}
      <motion.div
        className="pointer-events-none absolute w-[400px] h-[400px] rounded-full"
        style={{
          x: smoothMouseX,
          y: smoothMouseY,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(0,122,255,0.15) 0%, transparent 60%)",
          filter: "blur(60px)",
        }}
      />

      {/* Glass shapes layer - far back (slow parallax) */}
      <motion.div 
        className="absolute inset-0"
        style={{ y: backgroundY }}
      >
        <GlassShape
          width={500}
          height={300}
          rotate={-12}
          blur={60}
          opacity={0.06}
          scrollMultiplier={0.3}
          className="left-[-10%] top-[10%]"
        />
        <GlassShape
          width={400}
          height={250}
          rotate={8}
          blur={50}
          opacity={0.05}
          scrollMultiplier={0.4}
          className="right-[-5%] top-[20%]"
        />
      </motion.div>

      {/* Glass shapes layer - mid (medium parallax) */}
      <div className="absolute inset-0">
        <GlassShape
          width={350}
          height={200}
          rotate={-5}
          blur={40}
          opacity={0.08}
          scrollMultiplier={0.6}
          className="left-[5%] top-[45%]"
        />
        <GlassShape
          width={280}
          height={180}
          rotate={15}
          blur={35}
          opacity={0.07}
          scrollMultiplier={0.5}
          className="right-[10%] bottom-[30%]"
        />
        <GlassShape
          width={200}
          height={120}
          rotate={-20}
          blur={30}
          opacity={0.06}
          scrollMultiplier={0.7}
          className="left-[20%] bottom-[15%]"
        />
      </div>

      {/* Glass shapes layer - front (fast parallax) */}
      <div className="absolute inset-0">
        <GlassShape
          width={180}
          height={100}
          rotate={25}
          blur={25}
          opacity={0.1}
          scrollMultiplier={0.9}
          className="right-[25%] top-[15%]"
        />
        <GlassShape
          width={150}
          height={90}
          rotate={-8}
          blur={20}
          opacity={0.09}
          scrollMultiplier={1.0}
          className="left-[30%] top-[25%]"
        />
      </div>

      {/* Subtle caustic light effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          background: [
            "radial-gradient(ellipse 80% 50% at 30% 40%, rgba(0,212,255,0.03) 0%, transparent 50%)",
            "radial-gradient(ellipse 80% 50% at 70% 60%, rgba(0,212,255,0.03) 0%, transparent 50%)",
            "radial-gradient(ellipse 80% 50% at 30% 40%, rgba(0,212,255,0.03) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#001122] via-[#001122]/80 to-transparent pointer-events-none" />
    </motion.div>
  );
};
