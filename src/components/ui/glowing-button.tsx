"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GlowingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const GlowingButton = ({ children, onClick, className }: GlowingButtonProps) => {
  return (
    <motion.div
      className="relative"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Animated glow border */}
      <motion.div
        className="absolute -inset-[2px] rounded-lg opacity-75"
        style={{
          background: "linear-gradient(90deg, #007AFF, #00D4FF, #007AFF)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
          boxShadow: [
            "0 0 20px rgba(0, 122, 255, 0.5), 0 0 40px rgba(0, 122, 255, 0.3)",
            "0 0 30px rgba(0, 212, 255, 0.6), 0 0 60px rgba(0, 212, 255, 0.4)",
            "0 0 20px rgba(0, 122, 255, 0.5), 0 0 40px rgba(0, 122, 255, 0.3)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Button with shimmer effect */}
      <Button
        onClick={onClick}
        className={cn(
          "relative bg-[#020617] border-0 text-white font-medium overflow-hidden",
          "px-8 md:px-10 py-3 md:py-4 h-auto rounded-lg",
          "hover:bg-[#0a1628] transition-colors duration-300",
          "text-[14px] md:text-[16px]",
          className
        )}
      >
        {/* Shimmer overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
          }}
          animate={{
            backgroundPosition: ["-100% 0%", "200% 0%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 5,
            ease: "easeInOut",
          }}
        />
        <span className="relative z-10">{children}</span>
      </Button>
    </motion.div>
  );
};
