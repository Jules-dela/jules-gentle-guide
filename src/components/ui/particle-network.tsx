"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  connections: number[];
}

interface ParticleNetworkProps {
  className?: string;
  particleCount?: number;
  connectionDistance?: number;
  mouseRadius?: number;
  children?: React.ReactNode;
}

export const ParticleNetwork = ({
  className,
  particleCount = 80,
  connectionDistance = 150,
  mouseRadius = 200,
  children,
}: ParticleNetworkProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationRef = useRef<number>();
  const scrollRef = useRef(0);

  const { scrollY } = useScroll();

  // Track scroll position
  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      scrollRef.current = latest;
    });
    return () => unsubscribe();
  }, [scrollY]);

  const initParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 2 + 1,
        connections: [],
      });
    }
    return particles;
  }, [particleCount]);

  const drawParticle = useCallback((
    ctx: CanvasRenderingContext2D,
    particle: Particle,
    scrollOffset: number
  ) => {
    // Parallax depth effect based on scroll
    const depth = 1 + scrollOffset * 0.001;
    const parallaxX = particle.x + (particle.x - ctx.canvas.width / 2) * scrollOffset * 0.0005;
    const parallaxY = particle.y - scrollOffset * 0.3;
    
    // Glow effect
    const gradient = ctx.createRadialGradient(
      parallaxX, parallaxY, 0,
      parallaxX, parallaxY, particle.size * 4
    );
    gradient.addColorStop(0, "rgba(0, 122, 255, 1)");
    gradient.addColorStop(0.3, "rgba(0, 122, 255, 0.6)");
    gradient.addColorStop(1, "rgba(0, 122, 255, 0)");

    ctx.beginPath();
    ctx.arc(parallaxX, parallaxY, particle.size * 3, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Core particle
    ctx.beginPath();
    ctx.arc(parallaxX, parallaxY, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 180, 255, 1)";
    ctx.fill();
  }, []);

  const drawConnection = useCallback((
    ctx: CanvasRenderingContext2D,
    p1: Particle,
    p2: Particle,
    distance: number,
    scrollOffset: number
  ) => {
    const parallaxX1 = p1.x + (p1.x - ctx.canvas.width / 2) * scrollOffset * 0.0005;
    const parallaxY1 = p1.y - scrollOffset * 0.3;
    const parallaxX2 = p2.x + (p2.x - ctx.canvas.width / 2) * scrollOffset * 0.0005;
    const parallaxY2 = p2.y - scrollOffset * 0.3;

    const opacity = 1 - distance / connectionDistance;
    
    ctx.beginPath();
    ctx.moveTo(parallaxX1, parallaxY1);
    ctx.lineTo(parallaxX2, parallaxY2);
    ctx.strokeStyle = `rgba(0, 122, 255, ${opacity * 0.4})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [connectionDistance]);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const { width, height } = canvas;
    const particles = particlesRef.current;
    const mouse = mouseRef.current;
    const scrollOffset = scrollRef.current;

    // Clear with dark background
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 0, width, height);

    // Add subtle gradient overlay
    const bgGradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width * 0.8
    );
    bgGradient.addColorStop(0, "rgba(0, 30, 60, 0.3)");
    bgGradient.addColorStop(1, "rgba(2, 6, 23, 0)");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Update and draw particles
    particles.forEach((particle, i) => {
      // Mouse interaction - repulsion effect
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < mouseRadius && dist > 0) {
        const force = (mouseRadius - dist) / mouseRadius;
        const angle = Math.atan2(dy, dx);
        particle.vx -= Math.cos(angle) * force * 2;
        particle.vy -= Math.sin(angle) * force * 2;
      }

      // Return to base position with spring effect
      const returnForce = 0.02;
      particle.vx += (particle.baseX - particle.x) * returnForce;
      particle.vy += (particle.baseY - particle.y) * returnForce;

      // Apply velocity with damping
      particle.vx *= 0.95;
      particle.vy *= 0.95;
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Scroll warp effect - accelerate particles
      if (scrollOffset > 0) {
        const warpSpeed = scrollOffset * 0.002;
        particle.y -= warpSpeed * (1 + Math.random() * 0.5);
        
        // Reset particles that go off screen
        if (particle.y < -50) {
          particle.y = height + 50;
          particle.baseY = particle.y;
        }
      }

      // Draw connections
      for (let j = i + 1; j < particles.length; j++) {
        const other = particles[j];
        const cdx = particle.x - other.x;
        const cdy = particle.y - other.y;
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

        if (cdist < connectionDistance) {
          drawConnection(ctx, particle, other, cdist, scrollOffset);
        }
      }

      // Draw particle
      drawParticle(ctx, particle, scrollOffset);
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [connectionDistance, mouseRadius, drawParticle, drawConnection]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      particlesRef.current = initParticles(rect.width, rect.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    resize();
    window.addEventListener("resize", resize);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate, initParticles]);

  return (
    <div ref={containerRef} className={`relative w-full min-h-screen overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: "#020617" }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
        {children}
      </div>
    </div>
  );
};
