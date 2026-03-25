import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Clock, Instagram, ChevronDown } from "lucide-react";

const COUNTRY_CODES = [
  { code: "+41", country: "🇨🇭", label: "CH" },
  { code: "+33", country: "🇫🇷", label: "FR" },
  { code: "+49", country: "🇩🇪", label: "DE" },
  { code: "+39", country: "🇮🇹", label: "IT" },
  { code: "+43", country: "🇦🇹", label: "AT" },
  { code: "+44", country: "🇬🇧", label: "UK" },
  { code: "+34", country: "🇪🇸", label: "ES" },
  { code: "+351", country: "🇵🇹", label: "PT" },
  { code: "+31", country: "🇳🇱", label: "NL" },
  { code: "+32", country: "🇧🇪", label: "BE" },
  { code: "+46", country: "🇸🇪", label: "SE" },
  { code: "+45", country: "🇩🇰", label: "DK" },
  { code: "+47", country: "🇳🇴", label: "NO" },
  { code: "+1", country: "🇺🇸", label: "US" },
  { code: "+90", country: "🇹🇷", label: "TR" },
  { code: "+91", country: "🇮🇳", label: "IN" },
  { code: "+86", country: "🇨🇳", label: "CN" },
  { code: "+81", country: "🇯🇵", label: "JP" },
  { code: "+82", country: "🇰🇷", label: "KR" },
  { code: "+55", country: "🇧🇷", label: "BR" },
  { code: "+212", country: "🇲🇦", label: "MA" },
  { code: "+216", country: "🇹🇳", label: "TN" },
  { code: "+961", country: "🇱🇧", label: "LB" },
];

// Min/max local digits per country code
const LOCAL_DIGIT_RULES: Record<string, { min: number; max: number }> = {
  "+41": { min: 9, max: 9 },   // Swiss: 0791234567 → 9 digits
  "+33": { min: 9, max: 9 },   // France
  "+49": { min: 10, max: 11 },  // Germany
  "+39": { min: 9, max: 10 },   // Italy
  "+44": { min: 10, max: 10 },  // UK
  "+1":  { min: 10, max: 10 },  // US/Canada
};

export const WaitlistSection = () => {
  const { toast } = useToast();
  const [localNumber, setLocalNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+41");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const selectedCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];

  const formatLocalNumber = (input: string) => {
    // Strip everything except digits
    return input.replace(/[^\d]/g, "");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits, spaces, dashes for display
    const cleaned = raw.replace(/[^\d\s\-]/g, "");
    setLocalNumber(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const digits = formatLocalNumber(localNumber);

    // Strip leading zero (common in Swiss/European numbers)
    const trimmed = digits.startsWith("0") ? digits.slice(1) : digits;

    if (trimmed.length < 6 || trimmed.length > 13) {
      toast({
        title: "Invalid phone number",
        description: "Please enter a valid local number (without the country code).",
        variant: "destructive",
      });
      return;
    }

    // Validate against known rules
    const rule = LOCAL_DIGIT_RULES[countryCode];
    if (rule) {
      // Check against original digits (with leading zero) for Swiss-style numbers
      const checkLength = digits.startsWith("0") ? digits.length - 1 : digits.length;
      if (checkLength < rule.min || checkLength > rule.max) {
        toast({
          title: "Number looks incorrect",
          description: `A ${selectedCountry.label} number should have ${rule.min === rule.max ? rule.min : `${rule.min}-${rule.max}`} digits after the country code.`,
          variant: "destructive",
        });
        return;
      }
    }

    const fullNumber = countryCode + trimmed;

    // Final E.164 check
    if (!/^\+\d{7,15}$/.test(fullNumber)) {
      toast({
        title: "Invalid phone number",
        description: "Please check the number and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist").insert({ phone: fullNumber });
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
                <div className="flex gap-2">
                  {/* Country code selector */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowDropdown(!showDropdown)}
                      className="h-12 px-3 bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg flex items-center gap-1.5 hover:border-primary/50 transition-colors min-w-[90px]"
                    >
                      <span className="text-base">{selectedCountry.country}</span>
                      <span className="text-sm text-foreground font-medium">{countryCode}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                    {showDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-48">
                        {COUNTRY_CODES.map((c) => (
                          <button
                            key={c.code}
                            type="button"
                            onClick={() => {
                              setCountryCode(c.code);
                              setShowDropdown(false);
                            }}
                            className={`w-full px-3 py-2.5 text-left flex items-center gap-2.5 hover:bg-muted/80 transition-colors text-sm ${
                              countryCode === c.code ? "bg-muted" : ""
                            }`}
                          >
                            <span className="text-base">{c.country}</span>
                            <span className="text-foreground font-medium">{c.code}</span>
                            <span className="text-muted-foreground ml-auto">{c.label}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Local number input */}
                  <Input
                    type="tel"
                    placeholder={countryCode === "+41" ? "079 465 27 97" : "Local number"}
                    value={localNumber}
                    onChange={handleNumberChange}
                    className="h-12 bg-background/60 backdrop-blur-sm border-border/50 focus:border-primary/50 text-base flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your local number — we'll add the country code automatically.
                </p>
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
              href="https://www.instagram.com/unikey.ch"
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