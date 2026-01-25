"use client";
import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLProps<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col min-h-screen bg-navy overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Aurora effect layer */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary aurora layer */}
        <div
          className={cn(
            "absolute inset-0",
            "[--navy-dark:220_70%_10%]",
            "[--navy-base:221_83%_27%]",
            "[--navy-light:221_70%_40%]",
            "[--blue-accent:217_91%_65%]",
            "[--indigo-glow:239_84%_67%]",
            "[--cyan-accent:190_95%_50%]",
            "bg-[hsl(var(--navy-base))]",
            "after:content-[''] after:absolute after:inset-0",
            "after:[background-image:repeating-linear-gradient(100deg,hsl(var(--navy-dark))_0%,hsl(var(--navy-dark))_7%,transparent_10%,transparent_12%,hsl(var(--navy-dark))_16%),repeating-linear-gradient(100deg,hsl(var(--blue-accent)/0.3)_10%,hsl(var(--indigo-glow)/0.25)_15%,hsl(var(--cyan-accent)/0.2)_20%,hsl(var(--blue-accent)/0.25)_25%,hsl(var(--navy-light)/0.4)_30%)]",
            "after:[background-size:250%_200%]",
            "after:[background-position:50%_50%]",
            "after:animate-aurora",
            "after:opacity-80",
            "after:[filter:blur(8px)]",
            "after:will-change-transform"
          )}
        />
        
        {/* Secondary aurora layer - faster, different direction */}
        <div
          className={cn(
            "absolute inset-0",
            "opacity-60",
            "[background-image:repeating-linear-gradient(45deg,transparent_0%,hsl(217_91%_65%/0.15)_5%,transparent_10%,hsl(239_84%_67%/0.1)_15%,transparent_20%),repeating-linear-gradient(-45deg,transparent_0%,hsl(190_95%_50%/0.1)_8%,transparent_16%)]",
            "[background-size:200%_200%]",
            "animate-aurora-fast",
            "[filter:blur(20px)]"
          )}
        />
        
        {/* Accent glow spots */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,hsl(217_91%_65%/0.25)_0%,transparent_60%)] animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,hsl(239_84%_67%/0.2)_0%,transparent_60%)] animate-pulse-slow [animation-delay:2s]" />
      </div>

      {/* Radial gradient overlay for vignette effect */}
      {showRadialGradient && (
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(221_83%_27%/0.4)_50%,hsl(221_83%_27%/0.8)_100%)]" />
      )}

      {/* Content layer */}
      <div className="relative z-10 flex-1">
        {children}
      </div>
    </div>
  );
};
