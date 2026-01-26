"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode, useEffect, useState, useRef } from "react";

interface MeshGradientBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  enableMouseFollow?: boolean;
}

export const MeshGradientBackground = ({
  className,
  children,
  enableMouseFollow = true,
  ...props
}: MeshGradientBackgroundProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (!enableMouseFollow) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Subtle effect - move toward cursor
      setMousePosition({
        x: 50 + (x - 50) * 0.15,
        y: 50 + (y - 50) * 0.15,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableMouseFollow]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col min-h-screen overflow-hidden bg-navy",
        className
      )}
      {...props}
    >
      {/* Animated mesh gradient blobs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large blob 1 - top left, moves diagonally */}
        <div 
          className="absolute w-[120%] h-[120%] -top-[30%] -left-[20%] animate-mesh-blob-1"
          style={{
            background: 'radial-gradient(ellipse 50% 40% at 30% 40%, hsla(221, 83%, 35%, 0.8) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Large blob 2 - bottom right, counter-movement */}
        <div 
          className="absolute w-[100%] h-[100%] -bottom-[20%] -right-[10%] animate-mesh-blob-2"
          style={{
            background: 'radial-gradient(ellipse 45% 50% at 70% 60%, hsla(221, 83%, 32%, 0.9) 0%, transparent 65%)',
            filter: 'blur(50px)',
          }}
        />

        {/* Accent blob - electric blue glow */}
        <div 
          className="absolute w-[80%] h-[80%] top-[10%] left-[20%] animate-mesh-blob-3"
          style={{
            background: 'radial-gradient(ellipse 40% 35% at 50% 50%, hsla(217, 91%, 60%, 0.25) 0%, transparent 60%)',
            filter: 'blur(30px)',
          }}
        />

        {/* Secondary blob - creates depth */}
        <div 
          className="absolute w-[90%] h-[90%] top-[5%] right-[0%] animate-mesh-blob-4"
          style={{
            background: 'radial-gradient(ellipse 35% 45% at 60% 30%, hsla(221, 70%, 40%, 0.6) 0%, transparent 60%)',
            filter: 'blur(45px)',
          }}
        />

        {/* Floating accent - cyan/teal highlight */}
        <div 
          className="absolute w-[60%] h-[60%] bottom-[20%] left-[30%] animate-mesh-accent"
          style={{
            background: 'radial-gradient(ellipse 50% 50% at 50% 50%, hsla(200, 90%, 55%, 0.15) 0%, transparent 55%)',
            filter: 'blur(35px)',
          }}
        />

        {/* Mouse-following glow */}
        {enableMouseFollow && (
          <div 
            className="absolute w-[500px] h-[500px] transition-all duration-700 ease-out pointer-events-none"
            style={{
              left: `${mousePosition.x}%`,
              top: `${mousePosition.y}%`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, hsla(217, 91%, 65%, 0.2) 0%, transparent 50%)',
              filter: 'blur(25px)',
            }}
          />
        )}
      </div>

      {/* Vignette overlay for depth */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, transparent 0%, hsla(221, 83%, 20%, 0.3) 60%, hsla(221, 83%, 15%, 0.6) 100%)',
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full">
        {children}
      </div>
    </div>
  );
};
