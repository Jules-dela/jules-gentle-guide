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
        <div
          className={cn(
            "absolute inset-0",
            "[--navy-dark:220_70%_12%]",
            "[--navy-base:221_83%_27%]",
            "[--navy-light:221_70%_35%]",
            "[--blue-accent:217_91%_60%]",
            "[--indigo-glow:239_84%_67%]",
            "bg-[hsl(var(--navy-base))]",
            "after:content-[''] after:absolute after:inset-0",
            "after:[background-image:repeating-linear-gradient(100deg,hsl(var(--navy-dark))_0%,hsl(var(--navy-dark))_7%,transparent_10%,transparent_12%,hsl(var(--navy-dark))_16%),repeating-linear-gradient(100deg,hsl(var(--blue-accent)/0.15)_10%,hsl(var(--indigo-glow)/0.1)_15%,hsl(var(--navy-light)/0.2)_20%,hsl(var(--blue-accent)/0.1)_25%,hsl(var(--navy-base)/0.3)_30%)]",
            "after:[background-size:300%_200%]",
            "after:[background-position:50%_50%]",
            "after:animate-aurora",
            "after:opacity-60",
            "after:[filter:blur(10px)]",
            "after:will-change-transform",
            "[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]"
          )}
        />
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
