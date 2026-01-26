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
      
      // Subtle effect - only move 10% toward cursor
      setMousePosition({
        x: 50 + (x - 50) * 0.1,
        y: 50 + (y - 50) * 0.1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [enableMouseFollow]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col min-h-screen overflow-hidden",
        className
      )}
      style={{
        backgroundColor: '#001A33', // Deep Navy base
      }}
      {...props}
    >
      {/* Mesh gradient layers */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Base gradient layer */}
        <div 
          className="absolute inset-0 animate-mesh-gradient-1"
          style={{
            background: `
              radial-gradient(ellipse 80% 60% at 20% 30%, rgba(0, 51, 102, 0.8) 0%, transparent 50%),
              radial-gradient(ellipse 70% 50% at 80% 70%, rgba(0, 51, 102, 0.6) 0%, transparent 50%),
              radial-gradient(ellipse 60% 80% at 50% 50%, rgba(0, 26, 51, 0.9) 0%, transparent 60%)
            `,
          }}
        />

        {/* Moving mesh blob 1 */}
        <div 
          className="absolute w-[800px] h-[800px] animate-mesh-blob-1"
          style={{
            top: '-10%',
            left: '-10%',
            background: 'radial-gradient(circle, rgba(0, 51, 102, 0.7) 0%, transparent 60%)',
            filter: 'blur(60px)',
          }}
        />

        {/* Moving mesh blob 2 */}
        <div 
          className="absolute w-[700px] h-[700px] animate-mesh-blob-2"
          style={{
            bottom: '-15%',
            right: '-10%',
            background: 'radial-gradient(circle, rgba(0, 51, 102, 0.6) 0%, transparent 55%)',
            filter: 'blur(80px)',
          }}
        />

        {/* Electric blue accent blob */}
        <div 
          className="absolute w-[500px] h-[500px] animate-mesh-blob-3"
          style={{
            top: '40%',
            left: '30%',
            background: 'radial-gradient(circle, rgba(0, 122, 255, 0.15) 0%, transparent 50%)',
            filter: 'blur(40px)',
          }}
        />

        {/* Secondary royal blue blob */}
        <div 
          className="absolute w-[600px] h-[600px] animate-mesh-blob-4"
          style={{
            top: '10%',
            right: '20%',
            background: 'radial-gradient(circle, rgba(0, 51, 102, 0.5) 0%, transparent 55%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Mouse-following glow */}
        {enableMouseFollow && (
          <div 
            className="absolute w-[400px] h-[400px] transition-all duration-1000 ease-out pointer-events-none"
            style={{
              left: `${mousePosition.x}%`,
              top: `${mousePosition.y}%`,
              transform: 'translate(-50%, -50%)',
              background: 'radial-gradient(circle, rgba(0, 122, 255, 0.12) 0%, transparent 50%)',
              filter: 'blur(30px)',
            }}
          />
        )}

        {/* Subtle electric teal accent */}
        <div 
          className="absolute w-[300px] h-[300px] animate-mesh-accent"
          style={{
            bottom: '30%',
            left: '60%',
            background: 'radial-gradient(circle, rgba(0, 122, 255, 0.1) 0%, transparent 50%)',
            filter: 'blur(50px)',
          }}
        />
      </div>

      {/* Subtle noise texture overlay for depth */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0, 26, 51, 0.4) 70%, rgba(0, 26, 51, 0.7) 100%)',
        }}
      />

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full">
        {children}
      </div>
    </div>
  );
};
