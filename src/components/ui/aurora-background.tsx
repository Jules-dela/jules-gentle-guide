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
            "[--navy-deep:210_100%_10%]",
            "[--navy-royal:210_100%_20%]",
            "[--navy-mid:210_80%_30%]",
            "[--blue-electric:211_100%_50%]",
            "[--cyan-glow:195_100%_45%]",
            "bg-[hsl(var(--navy-deep))]",
            "after:content-[''] after:absolute after:inset-0",
            "after:[background-image:repeating-linear-gradient(100deg,hsl(var(--navy-deep))_0%,hsl(var(--navy-deep))_7%,transparent_10%,transparent_12%,hsl(var(--navy-deep))_16%),repeating-linear-gradient(100deg,hsl(var(--blue-electric)/0.25)_10%,hsl(var(--navy-royal)/0.3)_15%,hsl(var(--cyan-glow)/0.15)_20%,hsl(var(--blue-electric)/0.2)_25%,hsl(var(--navy-mid)/0.35)_30%)]",
            "after:[background-size:250%_200%]",
            "after:[background-position:50%_50%]",
            "after:animate-aurora",
            "after:opacity-70",
            "after:[filter:blur(10px)]",
            "after:will-change-transform"
          )}
        />
        
        {/* Secondary aurora layer - faster, different direction */}
        <div
          className={cn(
            "absolute inset-0",
            "opacity-50",
            "[background-image:repeating-linear-gradient(45deg,transparent_0%,hsl(211_100%_50%/0.12)_5%,transparent_10%,hsl(210_100%_20%/0.15)_15%,transparent_20%),repeating-linear-gradient(-45deg,transparent_0%,hsl(195_100%_45%/0.08)_8%,transparent_16%)]",
            "[background-size:200%_200%]",
            "animate-aurora-fast",
            "[filter:blur(25px)]"
          )}
        />
        
        {/* Accent glow spots */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,hsl(211_100%_50%/0.2)_0%,transparent_60%)] animate-pulse-slow" />
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,hsl(210_100%_20%/0.25)_0%,transparent_60%)] animate-pulse-slow [animation-delay:2s]" />
        
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
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,hsl(210_100%_10%/0.5)_50%,hsl(210_100%_10%/0.85)_100%)]" />
      )}

      {/* Content layer */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full">
        {children}
      </div>
    </div>
  );
};
