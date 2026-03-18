import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Instagram } from "lucide-react";

export const WaitlistSection = () => {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strip spaces, dashes, dots, and parens — keep leading +
    const normalized = "+" + phone.replace(/[^\d]/g, "");
    
    if (!/^\+\d{7,15}$/.test(normalized)) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid international number, e.g. +41 79 123 45 67.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist").insert({ phone: normalized });
      if (error) throw error;

      setIsSuccess(true);
      toast({
        title: "You're on the list! 🎉",
        description: "We'll reach out as soon as a spot opens up.",
      });
    } catch (err) {
      console.error("Waitlist error:", err);
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="apply" ref={sectionRef} className="py-24 md:py-32">
      <div className="container max-w-6xl">
        <motion.div
          className="bg-muted/50 rounded-[32px] md:rounded-[40px] p-8 md:p-12 lg:p-16 relative overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex flex-col items-center text-center max-w-xl mx-auto">
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={isInView ? { scale: 1 } : { scale: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-8"
            >
              <Clock className="w-7 h-7 text-primary" />
            </motion.div>

            {/* Heading */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Join the Waitlist
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Due to high demand, we're temporarily pausing new clients to maintain our quality standards. Leave your number and we'll reach out as soon as a spot opens up.
            </p>

            {/* Form or Success */}
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <p className="text-xl font-semibold text-foreground">You're on the list ✓</p>
                <p className="text-muted-foreground">We'll be in touch soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
                <Input
                  type="tel"
                  placeholder="+41 79 123 45 67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 bg-background/60 backdrop-blur-sm border-border/50 focus:border-primary/50 text-center text-base"
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 text-base font-medium rounded-xl"
                >
                  {isSubmitting ? "Joining..." : "Join the waitlist"}
                </Button>
              </form>
            )}
          </div>

          {/* Instagram CTA */}
          <div className="mt-14 pt-8 border-t border-border/30">
            <a
              href="https://instagram.com/unikey.ch"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 text-muted-foreground hover:text-foreground transition-colors duration-300 group"
            >
              <Instagram className="w-4.5 h-4.5 group-hover:scale-110 transition-transform duration-300" />
              <span className="text-sm tracking-wide">
                Follow us on Instagram for updates&nbsp;·&nbsp;
                <span className="font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                  @unikey.ch
                </span>
              </span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
