"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode, useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface RefractiveGlassBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
}

const GlassSlab = ({ 
  className, 
  style, 
  parallaxSpeed = 0,
  mousePosition,
}: { 
  className?: string; 
  style?: React.CSSProperties;
  parallaxSpeed?: number;
  mousePosition: { x: number; y: number };
}) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, parallaxSpeed * 100]);
  
  // Calculate light refraction based on mouse position
  const lightOffsetX = (mousePosition.x - 50) * 0.3;
  const lightOffsetY = (mousePosition.y - 50) * 0.3;
  
  return (
    <motion.div
      className={cn(
        "absolute rounded-[20px] md:rounded-[40px]",
        className
      )}
      style={{
        ...style,
        y,
        background: `linear-gradient(
          ${135 + lightOffsetX * 0.5}deg,
          rgba(255, 255, 255, 0.08) 0%,
          rgba(255, 255, 255, 0.02) 50%,
          rgba(0, 122, 255, 0.05) 100%
        )`,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          ${lightOffsetX * 0.5}px ${lightOffsetY * 0.5}px 60px rgba(0, 122, 255, 0.1)
        `,
      }}
    />
  );
};

const CausticLight = ({ mousePosition }: { mousePosition: { x: number; y: number } }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      animate={{
        left: `${mousePosition.x}%`,
        top: `${mousePosition.y}%`,
      }}
      transition={{
        type: "spring",
        stiffness: 50,
        damping: 30,
      }}
      style={{
        width: '600px',
        height: '600px',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Primary caustic glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, 
              rgba(255, 255, 255, 0.15) 0%, 
              rgba(200, 230, 255, 0.08) 30%,
              transparent 70%
            )
          `,
          filter: 'blur(30px)',
        }}
      />
      {/* Secondary cyan refraction */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at 40% 40%, 
              rgba(0, 200, 255, 0.1) 0%, 
              transparent 50%
            )
          `,
          filter: 'blur(40px)',
          transform: 'translate(10%, 10%)',
        }}
      />
      {/* Silver highlight */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(circle at 60% 30%, 
              rgba(220, 240, 255, 0.12) 0%, 
              transparent 40%
            )
          `,
          filter: 'blur(20px)',
        }}
      />
    </motion.div>
  );
};

export const RefractiveGlassBackground = ({
  className,
  children,
  ...props
}: RefractiveGlassBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const { scrollY } = useScroll();
  
  // Parallax transforms for different layers
  const bgLayer1Y = useTransform(scrollY, [0, 1000], [0, 150]);
  const bgLayer2Y = useTransform(scrollY, [0, 1000], [0, 100]);
  const bgLayer3Y = useTransform(scrollY, [0, 1000], [0, 50]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col min-h-screen overflow-hidden",
        className
      )}
      style={{
        backgroundColor: '#001A33',
      }}
      {...props}
    >
      {/* Deep space gradient base */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 120% 100% at 50% 0%, rgba(0, 40, 80, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse 80% 60% at 80% 80%, rgba(0, 30, 60, 0.6) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 20% 100%, rgba(0, 50, 100, 0.5) 0%, transparent 50%),
            linear-gradient(180deg, #001A33 0%, #000D1A 100%)
          `,
        }}
      />

      {/* Parallax Layer 1 - Far background shapes */}
      <motion.div className="absolute inset-0" style={{ y: bgLayer1Y }}>
        <GlassSlab
          className="w-[300px] h-[400px] md:w-[400px] md:h-[600px]"
          style={{ top: '-5%', left: '-5%', transform: 'rotate(-15deg)' }}
          parallaxSpeed={-2}
          mousePosition={mousePosition}
        />
        <GlassSlab
          className="w-[200px] h-[300px] md:w-[300px] md:h-[450px]"
          style={{ top: '60%', right: '-8%', transform: 'rotate(20deg)' }}
          parallaxSpeed={-1.5}
          mousePosition={mousePosition}
        />
      </motion.div>

      {/* Parallax Layer 2 - Mid-ground shapes */}
      <motion.div className="absolute inset-0" style={{ y: bgLayer2Y }}>
        <GlassSlab
          className="w-[150px] h-[250px] md:w-[250px] md:h-[400px]"
          style={{ top: '20%', right: '15%', transform: 'rotate(8deg)' }}
          parallaxSpeed={-1}
          mousePosition={mousePosition}
        />
        <GlassSlab
          className="w-[180px] h-[280px] md:w-[280px] md:h-[420px]"
          style={{ bottom: '10%', left: '10%', transform: 'rotate(-10deg)' }}
          parallaxSpeed={-0.8}
          mousePosition={mousePosition}
        />
      </motion.div>

      {/* Parallax Layer 3 - Foreground accents */}
      <motion.div className="absolute inset-0" style={{ y: bgLayer3Y }}>
        <GlassSlab
          className="w-[100px] h-[180px] md:w-[180px] md:h-[300px]"
          style={{ top: '40%', left: '25%', transform: 'rotate(5deg)' }}
          parallaxSpeed={-0.5}
          mousePosition={mousePosition}
        />
        <GlassSlab
          className="w-[120px] h-[200px] md:w-[200px] md:h-[320px]"
          style={{ top: '15%', right: '30%', transform: 'rotate(-8deg)' }}
          parallaxSpeed={-0.3}
          mousePosition={mousePosition}
        />
      </motion.div>

      {/* Caustic light effect following cursor */}
      <CausticLight mousePosition={mousePosition} />

      {/* Ambient floating light orbs */}
      <div 
        className="absolute w-[500px] h-[500px] animate-float-slow opacity-30"
        style={{
          top: '10%',
          left: '60%',
          background: 'radial-gradient(circle, rgba(0, 150, 255, 0.15) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      <div 
        className="absolute w-[400px] h-[400px] animate-float-slower opacity-20"
        style={{
          bottom: '20%',
          right: '50%',
          background: 'radial-gradient(circle, rgba(100, 200, 255, 0.12) 0%, transparent 60%)',
          filter: 'blur(50px)',
        }}
      />

      {/* Subtle vignette for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 13, 26, 0.5) 80%, rgba(0, 13, 26, 0.8) 100%)',
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full">
        {children}
      </div>
    </div>
  );
};
