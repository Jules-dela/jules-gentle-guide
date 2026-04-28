import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronLeft, CheckCircle2, User, Home, Settings, Send, CalendarIcon, FileText, ChevronDown, CreditCard } from "lucide-react";
import { ServiceAgreement } from "@/components/portal/ServiceAgreement";

const COUNTRY_CODES = [
  { code: "+213", flag: "🇩🇿", label: "DZ", min: 9, max: 9 },
  { code: "+54", flag: "🇦🇷", label: "AR", min: 10, max: 11 },
  { code: "+61", flag: "🇦🇺", label: "AU", min: 9, max: 9 },
  { code: "+43", flag: "🇦🇹", label: "AT", min: 10, max: 11 },
  { code: "+32", flag: "🇧🇪", label: "BE", min: 8, max: 9 },
  { code: "+55", flag: "🇧🇷", label: "BR", min: 10, max: 11 },
  { code: "+359", flag: "🇧🇬", label: "BG", min: 8, max: 9 },
  { code: "+1", flag: "🇨🇦", label: "CA", min: 10, max: 10 },
  { code: "+56", flag: "🇨🇱", label: "CL", min: 8, max: 9 },
  { code: "+86", flag: "🇨🇳", label: "CN", min: 11, max: 11 },
  { code: "+57", flag: "🇨🇴", label: "CO", min: 10, max: 10 },
  { code: "+385", flag: "🇭🇷", label: "HR", min: 8, max: 9 },
  { code: "+420", flag: "🇨🇿", label: "CZ", min: 9, max: 9 },
  { code: "+45", flag: "🇩🇰", label: "DK", min: 8, max: 8 },
  { code: "+20", flag: "🇪🇬", label: "EG", min: 10, max: 10 },
  { code: "+372", flag: "🇪🇪", label: "EE", min: 7, max: 8 },
  { code: "+358", flag: "🇫🇮", label: "FI", min: 8, max: 11 },
  { code: "+33", flag: "🇫🇷", label: "FR", min: 9, max: 9 },
  { code: "+49", flag: "🇩🇪", label: "DE", min: 10, max: 11 },
  { code: "+30", flag: "🇬🇷", label: "GR", min: 10, max: 10 },
  { code: "+852", flag: "🇭🇰", label: "HK", min: 8, max: 8 },
  { code: "+36", flag: "🇭🇺", label: "HU", min: 8, max: 9 },
  { code: "+91", flag: "🇮🇳", label: "IN", min: 10, max: 10 },
  { code: "+62", flag: "🇮🇩", label: "ID", min: 9, max: 11 },
  { code: "+98", flag: "🇮🇷", label: "IR", min: 10, max: 10 },
  { code: "+353", flag: "🇮🇪", label: "IE", min: 9, max: 9 },
  { code: "+972", flag: "🇮🇱", label: "IL", min: 8, max: 9 },
  { code: "+39", flag: "🇮🇹", label: "IT", min: 9, max: 10 },
  { code: "+81", flag: "🇯🇵", label: "JP", min: 10, max: 11 },
  { code: "+962", flag: "🇯🇴", label: "JO", min: 8, max: 9 },
  { code: "+254", flag: "🇰🇪", label: "KE", min: 9, max: 9 },
  { code: "+961", flag: "🇱🇧", label: "LB", min: 7, max: 8 },
  { code: "+371", flag: "🇱🇻", label: "LV", min: 8, max: 8 },
  { code: "+370", flag: "🇱🇹", label: "LT", min: 8, max: 8 },
  { code: "+352", flag: "🇱🇺", label: "LU", min: 8, max: 9 },
  { code: "+60", flag: "🇲🇾", label: "MY", min: 9, max: 10 },
  { code: "+356", flag: "🇲🇹", label: "MT", min: 8, max: 8 },
  { code: "+52", flag: "🇲🇽", label: "MX", min: 10, max: 10 },
  { code: "+212", flag: "🇲🇦", label: "MA", min: 9, max: 9 },
  { code: "+31", flag: "🇳🇱", label: "NL", min: 9, max: 9 },
  { code: "+64", flag: "🇳🇿", label: "NZ", min: 8, max: 10 },
  { code: "+234", flag: "🇳🇬", label: "NG", min: 10, max: 10 },
  { code: "+47", flag: "🇳🇴", label: "NO", min: 8, max: 8 },
  { code: "+92", flag: "🇵🇰", label: "PK", min: 10, max: 10 },
  { code: "+51", flag: "🇵🇪", label: "PE", min: 9, max: 9 },
  { code: "+63", flag: "🇵🇭", label: "PH", min: 10, max: 10 },
  { code: "+48", flag: "🇵🇱", label: "PL", min: 9, max: 9 },
  { code: "+351", flag: "🇵🇹", label: "PT", min: 9, max: 9 },
  { code: "+974", flag: "🇶🇦", label: "QA", min: 8, max: 8 },
  { code: "+40", flag: "🇷🇴", label: "RO", min: 9, max: 9 },
  { code: "+7", flag: "🇷🇺", label: "RU", min: 10, max: 10 },
  { code: "+966", flag: "🇸🇦", label: "SA", min: 9, max: 9 },
  { code: "+381", flag: "🇷🇸", label: "RS", min: 8, max: 9 },
  { code: "+65", flag: "🇸🇬", label: "SG", min: 8, max: 8 },
  { code: "+421", flag: "🇸🇰", label: "SK", min: 9, max: 9 },
  { code: "+386", flag: "🇸🇮", label: "SI", min: 8, max: 8 },
  { code: "+27", flag: "🇿🇦", label: "ZA", min: 9, max: 9 },
  { code: "+82", flag: "🇰🇷", label: "KR", min: 10, max: 11 },
  { code: "+34", flag: "🇪🇸", label: "ES", min: 9, max: 9 },
  { code: "+46", flag: "🇸🇪", label: "SE", min: 7, max: 10 },
  { code: "+41", flag: "🇨🇭", label: "CH", min: 9, max: 9 },
  { code: "+886", flag: "🇹🇼", label: "TW", min: 9, max: 9 },
  { code: "+66", flag: "🇹🇭", label: "TH", min: 8, max: 9 },
  { code: "+216", flag: "🇹🇳", label: "TN", min: 8, max: 8 },
  { code: "+90", flag: "🇹🇷", label: "TR", min: 10, max: 10 },
  { code: "+380", flag: "🇺🇦", label: "UA", min: 9, max: 9 },
  { code: "+971", flag: "🇦🇪", label: "AE", min: 8, max: 9 },
  { code: "+44", flag: "🇬🇧", label: "UK", min: 10, max: 10 },
  { code: "+1", flag: "🇺🇸", label: "US", min: 10, max: 10 },
  { code: "+58", flag: "🇻🇪", label: "VE", min: 10, max: 10 },
  { code: "+84", flag: "🇻🇳", label: "VN", min: 9, max: 10 },
].sort((a, b) => a.label.localeCompare(b.label));

// Validation schema
const criteriaSchema = z.object({
  name: z.string().trim().min(1, { message: "Full name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  phone: z.string().trim().min(1, { message: "Phone number is required" }).max(20).regex(/^\+\d{7,15}$/, { message: "Invalid phone number format" }),
  university: z.string().trim().max(100).optional().or(z.literal("")),
  movingDate: z.date({ required_error: "Please select your preferred moving date" }),
  neighbourhood: z.string().min(1, { message: "Please select a neighbourhood" }),
  budget: z.string().min(1, { message: "Please select a budget range" }),
  rooms: z.string().min(1, { message: "Please select number of rooms" }),
  duration: z.string().min(1, { message: "Please select duration" }),
  type: z.string().min(1, { message: "Please select property type" }),
  roommates: z.string().min(1, { message: "Please select roommate preference" }),
  roommateDetail: z.string().optional().or(z.literal("")),
  roommateCount: z.string().optional().or(z.literal("")),
  furnished: z.boolean().default(true),
  nearTransport: z.boolean().default(true),
  pets: z.boolean().default(false),
  noSmoking: z.boolean().default(false),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  privacyAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the Privacy Policy to submit the form",
  }),
  website: z.string().max(0).optional().or(z.literal("")),
});

type CriteriaFormData = z.infer<typeof criteriaSchema>;

const steps = [
  { id: 1, title: "About You", icon: User },
  { id: 2, title: "Property", icon: Home },
  { id: 3, title: "Preferences", icon: Settings },
  { id: 4, title: "Sign & Pay", icon: CreditCard },
];

interface CriteriaFormProps {
  onSubmitSuccess?: () => void | Promise<void>;
}

export const CriteriaForm = ({ onSubmitSuccess }: CriteriaFormProps = {}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState<string>('');
  const [contractSigned, setContractSigned] = useState(false);
  const [preSubmitContractSigned, setPreSubmitContractSigned] = useState(false);
  const [preSubmitContractData, setPreSubmitContractData] = useState<any>(null);
  const [showContractWarning, setShowContractWarning] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const [documentsAcknowledged, setDocumentsAcknowledged] = useState(false);
  const [showDocWarning, setShowDocWarning] = useState(false);
  const [phoneCountryCode, setPhoneCountryCode] = useState("+41");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [paymentSessionId, setPaymentSessionId] = useState<string | null>(null);
  const [paymentVerified, setPaymentVerified] = useState(false);
  const [paymentBannerVisible, setPaymentBannerVisible] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [verifyEmailOpen, setVerifyEmailOpen] = useState(false);
  const [verifyEmailInput, setVerifyEmailInput] = useState("");
  const [verifyEmailError, setVerifyEmailError] = useState<string | null>(null);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const selectedCountry = COUNTRY_CODES.find(c => c.code === phoneCountryCode) || COUNTRY_CODES[0];

  const form = useForm<CriteriaFormData>({
    resolver: zodResolver(criteriaSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      university: "",
      movingDate: undefined,
      neighbourhood: "",
      budget: "",
      rooms: "",
      duration: "",
      type: "studio",
      roommates: "",
      roommateDetail: "",
      roommateCount: "",
      furnished: true,
      nearTransport: true,
      pets: false,
      noSmoking: false,
      notes: "",
      privacyAccepted: false,
      website: "",
    },
  });

  const getFullPhone = () => {
    const digits = phoneLocal.replace(/[^\d]/g, "");
    const trimmed = digits.startsWith("0") ? digits.slice(1) : digits;
    return phoneCountryCode + trimmed;
  };

  const applyRestoredRow = (data: any) => {
    const prefs: any = data.preferences || {};
    form.reset({
      name: data.name || "",
      email: data.email || "",
      phone: data.phone || "",
      university: prefs.university || "",
      movingDate: prefs.moving_date ? new Date(prefs.moving_date) : undefined,
      neighbourhood: prefs.neighbourhood || "",
      budget: data.budget || "",
      rooms: prefs.rooms || "",
      duration: data.duration || "",
      type: (data.property_type as any) || "studio",
      roommates: prefs.roommates || "",
      roommateDetail: prefs.roommate_detail || "",
      roommateCount: prefs.roommate_count || "",
      furnished: prefs.furnished ?? true,
      nearTransport: prefs.near_transport ?? true,
      pets: prefs.pets ?? false,
      noSmoking: prefs.no_smoking ?? false,
      notes: prefs.notes || "",
      privacyAccepted: prefs.privacy_accepted ?? true,
      website: "",
    });
    if (data.phone) {
      const match = COUNTRY_CODES
        .slice()
        .sort((a, b) => b.code.length - a.code.length)
        .find((c) => data.phone!.startsWith(c.code));
      if (match) {
        setPhoneCountryCode(match.code);
        setPhoneLocal(data.phone.slice(match.code.length));
      } else {
        setPhoneLocal(data.phone);
      }
    }
    if (data.contract_signed) {
      setPreSubmitContractSigned(true);
      setPreSubmitContractData({
        signature_image: data.signature_image,
        client_date_of_birth: data.date_of_birth,
        client_nationality: data.nationality,
        client_full_name: data.name,
        timestamp: data.updated_at || data.created_at,
      });
    }
    setDocumentsAcknowledged(true);
  };

  const verifyByEmail = async () => {
    const email = verifyEmailInput.trim().toLowerCase();
    setVerifyEmailError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      setVerifyEmailError("Please enter a valid email address.");
      return;
    }
    setIsVerifyingEmail(true);
    try {
      const { data, error } = await supabase
        .from("intake_submissions")
        .select("*")
        .ilike("email", email)
        .eq("deposit_paid", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        setVerifyEmailError("No payment found for this email. Please contact us at contact@uni-key.ch.");
        return;
      }
      applyRestoredRow(data);
      setPaymentVerified(true);
      setPaymentBannerVisible(false);
      setCurrentStep(4);
      setVerifyEmailOpen(false);
      setVerifyEmailInput("");
      toast({ title: "Payment confirmed", description: "Your application has been restored." });
    } catch (e: any) {
      setVerifyEmailError(e?.message || "Could not verify. Please try again.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // Restore form from intake_submissions when returning from Stripe (?session_id=...)
  const restoreFromSession = async (sessionId: string) => {
    try {
      // Try to match by stripe_session_id first; fall back to most recent submission.
      let { data, error } = await supabase
        .from("intake_submissions")
        .select("*")
        .eq("stripe_session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if ((!data || error) && !error) {
        const fallback = await supabase
          .from("intake_submissions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        data = fallback.data;
      }

      if (!data) {
        setPaymentBannerVisible(true);
        setCurrentStep(4);
        return;
      }

      // Restore form fields
      const prefs: any = data.preferences || {};
      form.reset({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        university: prefs.university || "",
        movingDate: prefs.moving_date ? new Date(prefs.moving_date) : undefined,
        neighbourhood: prefs.neighbourhood || "",
        budget: data.budget || "",
        rooms: prefs.rooms || "",
        duration: data.duration || "",
        type: (data.property_type as any) || "studio",
        roommates: prefs.roommates || "",
        roommateDetail: prefs.roommate_detail || "",
        roommateCount: prefs.roommate_count || "",
        furnished: prefs.furnished ?? true,
        nearTransport: prefs.near_transport ?? true,
        pets: prefs.pets ?? false,
        noSmoking: prefs.no_smoking ?? false,
        notes: prefs.notes || "",
        privacyAccepted: prefs.privacy_accepted ?? true,
        website: "",
      });

      // Restore phone parts (best-effort)
      if (data.phone) {
        const match = COUNTRY_CODES
          .slice()
          .sort((a, b) => b.code.length - a.code.length)
          .find((c) => data.phone!.startsWith(c.code));
        if (match) {
          setPhoneCountryCode(match.code);
          setPhoneLocal(data.phone.slice(match.code.length));
        } else {
          setPhoneLocal(data.phone);
        }
      }

      // Restore contract state
      if (data.contract_signed) {
        setPreSubmitContractSigned(true);
        setPreSubmitContractData({
          signature_image: data.signature_image,
          client_date_of_birth: data.date_of_birth,
          client_nationality: data.nationality,
          client_full_name: data.name,
          timestamp: data.updated_at || data.created_at,
        });
      }

      setDocumentsAcknowledged(true);

      if (data.deposit_paid) {
        setPaymentVerified(true);
        setPaymentBannerVisible(false);
      } else {
        setPaymentVerified(false);
        setPaymentBannerVisible(true);
      }

      setCurrentStep(4);
    } catch (e) {
      console.error("Failed to restore intake submission", e);
      setPaymentBannerVisible(true);
      setCurrentStep(4);
    }
  };

  const verifyPayment = async () => {
    if (!paymentSessionId || isVerifyingPayment) return;
    setIsVerifyingPayment(true);
    try {
      let { data } = await supabase
        .from("intake_submissions")
        .select("deposit_paid")
        .eq("stripe_session_id", paymentSessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (!data) {
        const fallback = await supabase
          .from("intake_submissions")
          .select("deposit_paid")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        data = fallback.data;
      }
      if (data?.deposit_paid) {
        setPaymentVerified(true);
        setPaymentBannerVisible(false);
        toast({ title: "Payment confirmed", description: "You can now submit your application." });
      } else {
        toast({
          title: "Payment not yet confirmed",
          description: "Please wait a few moments and try again.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({ title: "Verification failed", description: e?.message || "Try again shortly.", variant: "destructive" });
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (sessionId) {
      setPaymentSessionId(sessionId);
      restoreFromSession(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validatePhoneNumber = (): string | null => {
    const digits = phoneLocal.replace(/[^\d]/g, "");
    if (!digits || digits.length === 0) return "Phone number is required";
    const trimmed = digits.startsWith("0") ? digits.slice(1) : digits;
    if (trimmed.length < 6 || trimmed.length > 13) return "Please enter a valid phone number";
    const country = COUNTRY_CODES.find(c => c.code === phoneCountryCode);
    if (country) {
      if (trimmed.length < country.min || trimmed.length > country.max) {
        return `A ${country.label} number should have ${country.min === country.max ? country.min : `${country.min}-${country.max}`} digits after the country code`;
      }
    }
    const full = phoneCountryCode + trimmed;
    if (!/^\+\d{7,15}$/.test(full)) return "Invalid phone number format";
    return null;
  };

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof CriteriaFormData)[] = [];
    
    switch (step) {
      case 1: {
        fieldsToValidate = ["name", "email", "university", "movingDate"];
        // Validate phone separately
        const phoneError = validatePhoneNumber();
        if (phoneError) {
          toast({ title: "Invalid phone number", description: phoneError, variant: "destructive" });
          return false;
        }
        // Set the full phone in the form so it passes zod
        form.setValue("phone", getFullPhone());
        break;
      }
        break;
      case 2:
        fieldsToValidate = ["neighbourhood", "budget", "rooms", "duration", "type", "roommates"];
        break;
      case 3:
        fieldsToValidate = ["furnished", "nearTransport", "pets", "noSmoking", "notes"];
        break;
      case 4:
        // Sign & Pay: documents acknowledgment + privacy acceptance.
        // Contract signing is enforced separately at submit time.
        if (!documentsAcknowledged) {
          setShowDocWarning(true);
          return false;
        }
        fieldsToValidate = ["privacyAccepted"];
        break;
    }

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid && currentStep < 4) {
      setCurrentStep(currentStep + 1);
      setShowDocWarning(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: CriteriaFormData) => {
    if (data.website && data.website.length > 0) {
      setIsSuccess(true);
      return;
    }

    setIsSubmitting(true);
    
    try {

      // Pull invitation token from the URL (gates the /apply flow)
      const urlToken = new URLSearchParams(window.location.search).get("token") || "";

      const { data: result, error: emailError } = await supabase.functions.invoke("send-application-emails", {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          university: data.university,
          movingDate: data.movingDate ? format(data.movingDate, "yyyy-MM-dd") : null,
          neighbourhood: data.neighbourhood,
          budget: data.budget,
          rooms: data.rooms,
          duration: data.duration,
          propertyType: data.type,
          roommatePreference: data.roommates === "yes" ? `Yes - ${data.roommateDetail || "not specified"} (${data.roommateCount || "?"} roommates)` : "No",
          furnished: data.furnished,
          nearTransport: data.nearTransport,
          petsAllowed: data.pets,
          smokingAllowed: data.noSmoking,
          notes: data.notes,
          privacyAccepted: data.privacyAccepted,
          token: urlToken,
          // Pass contract data for server-side signing (no auth race condition)
          contractData: preSubmitContractData || null,
        },
      });

      if (emailError) {
        console.error("Portal creation error:", emailError);
        // If edge function failed, still show success but warn about portal
        toast({
          title: "✅ Application submitted!",
          description: "Your application was saved. You'll receive portal access details by email shortly.",
        });
        setIsSuccess(true);
        onSubmitSuccess?.();
        return;
      }

      // Store submission data for contract signing
      setSubmittedName(data.name);
      setSubmittedCaseId(result?.caseId || null);

      // For new users we receive a one-time magic link instead of a password.
      // Redirect immediately so the user lands authenticated in the portal.
      if (result?.isNewUser && result?.actionLink) {
        setIsAutoLoggingIn(true);
        onSubmitSuccess?.();
        window.location.href = result.actionLink;
        return;
      }

      // Contract is now signed server-side — send receipt email client-side
      if (result?.caseId && preSubmitContractData) {
        try {
          await supabase.functions.invoke('send-contract-receipt', {
            body: {
              clientName: data.name,
              clientEmail: data.email,
              signedAt: preSubmitContractData.timestamp,
            },
          });
        } catch (emailErr) {
          console.error('Error sending contract receipt email:', emailErr);
        }
      }

      setIsSuccess(true);
      setContractSigned(true);
      onSubmitSuccess?.();
      
      toast({
        title: "🎉 You're all set!",
        description: "Your application and service agreement have been submitted. We'll start your search right away.",
      });
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContractSign = async (contractData: {
    signature_image: string;
    ip_address: string;
    timestamp: string;
    user_agent: string;
    device_info: {
      platform: string;
      language: string;
      screen_width: number;
      screen_height: number;
    };
    client_full_name?: string;
    client_date_of_birth?: string;
    client_nationality?: string;
    client_initials?: string;
  }) => {
    if (!submittedCaseId) {
      console.error('Sign contract failed: No case ID available');
      return { error: new Error('No case found. Please try submitting again.') };
    }

    // Check if user is authenticated
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData?.session) {
      console.error('Sign contract failed: User not authenticated');
      return { error: new Error('not_authenticated') };
    }

    try {
      const { error } = await supabase.rpc('sign_contract', {
        p_case_id: submittedCaseId,
        p_contract_data: JSON.parse(JSON.stringify(contractData)),
      });

      if (error) {
        console.error('sign_contract RPC error:', error);
        throw error;
      }

      // Send contract receipt email
      try {
        await supabase.functions.invoke('send-contract-receipt', {
          body: {
            clientName: submittedName,
            clientEmail: form.getValues('email'),
            signedAt: contractData.timestamp,
          },
        });
      } catch (emailErr) {
        console.error('Error sending contract receipt email:', emailErr);
      }

      setContractSigned(true);
      toast({
        title: "🎉 Contract signed!",
        description: "Your housing search is now active. Check your email for portal access details.",
      });
      return { error: null };
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Failed to sign contract') };
    }
  };

  const resetForm = () => {
    form.reset();
    setCurrentStep(1);
    setIsSuccess(false);
    setSubmittedCaseId(null);
    setSubmittedName('');
    setContractSigned(false);
    setPreSubmitContractSigned(false);
    setPreSubmitContractData(null);
    setShowContractWarning(false);
    setDocumentsAcknowledged(false);
    setShowDocWarning(false);
  };

  return (
    <section 
      id="apply" 
      ref={sectionRef}
      className="py-24 md:py-32"
    >
      <div className="container max-w-6xl">
        <motion.div 
          className="bg-slate-50/80 rounded-[32px] md:rounded-[40px] p-6 md:p-10 lg:p-12 relative overflow-hidden border border-slate-200 shadow-[0_8px_30px_rgba(15,23,42,0.06)]"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col items-center justify-center py-8 md:py-12"
              >
                {isAutoLoggingIn ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto animate-pulse">
                      <CheckCircle2 className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground text-lg">Setting up your account...</p>
                  </div>
                ) : contractSigned ? (
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      You're all set! 🎉
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      Your application is submitted and the service agreement is signed. We'll start searching for your perfect apartment right away.
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Check your email for your portal login credentials to track your search progress.
                    </p>
                    <Button variant="outline" onClick={resetForm}>
                      Submit another request
                    </Button>
                  </div>
                ) : submittedCaseId ? (
                  <div className="w-full max-w-2xl mx-auto space-y-6">
                    <div className="text-center space-y-2">
                      <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                        Almost there! ✍️
                      </h2>
                      <p className="text-muted-foreground text-lg">
                        Please read and sign the service agreement below to activate your housing search.
                      </p>
                    </div>
                    <ServiceAgreement
                      clientName={submittedName}
                      onSign={handleContractSign}
                      isSigned={false}
                    />
                  </div>
                ) : (
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                      className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto"
                    >
                      <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12 text-primary" />
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                      Application Submitted! ✅
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-md mx-auto">
                      Check your email for your portal login credentials. You can sign the service agreement from your portal to activate your search.
                    </p>
                    <Button variant="outline" onClick={resetForm}>
                      Submit another request
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                    Tell us about your stay
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Answer a few quick questions and we'll match you with the right flats.
                  </p>
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center mb-10">
                  <div className="flex items-center gap-2 md:gap-4">
                    {steps.map((step, index) => {
                      const Icon = step.icon;
                      const isActive = currentStep === step.id;
                      const isCompleted = currentStep > step.id;
                      
                      return (
                        <div key={step.id} className="flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (isCompleted) setCurrentStep(step.id);
                            }}
                            className={`
                              flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full transition-all duration-300
                              ${isCompleted ? "cursor-pointer hover:shadow-md" : ""}
                              ${isActive 
                                ? "bg-primary text-primary-foreground shadow-lg" 
                                : isCompleted 
                                  ? "bg-primary/20 text-primary" 
                                  : "bg-background text-muted-foreground border border-border/50"
                              }
                            `}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="hidden md:inline text-sm font-medium">{step.title}</span>
                          </button>
                          {index < steps.length - 1 && (
                            <div className={`w-6 md:w-10 h-0.5 mx-1 md:mx-2 transition-colors duration-300 ${
                              isCompleted ? "bg-primary" : "bg-border"
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Card */}
                <div className="max-w-3xl mx-auto">
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 md:p-8 lg:p-10">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)}>
                        <AnimatePresence mode="wait">
                          {/* Step 1: About You */}
                          {currentStep === 1 && (
                            <motion.div
                              key="step1"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-6"
                            >
                              <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name="name"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Full name</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Jane Doe" 
                                          className="bg-white border border-slate-200 focus:border-primary/50 focus:bg-white transition-all"
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="email"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Email</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="email" 
                                          placeholder="jane@university.edu" 
                                          className="bg-white border border-slate-200 focus:border-primary/50 focus:bg-white transition-all"
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid gap-6 md:grid-cols-2">
                                <FormItem>
                                  <FormLabel>Phone</FormLabel>
                                  <div className="flex gap-2">
                                    <div className="relative" ref={countryDropdownRef}>
                                      <button
                                        type="button"
                                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                        className="h-10 px-3 bg-white border border-slate-200 rounded-md flex items-center gap-1.5 hover:border-primary/50 transition-colors min-w-[88px] text-sm"
                                      >
                                        <span>{selectedCountry.flag}</span>
                                        <span className="font-medium">{phoneCountryCode}</span>
                                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                      </button>
                                      {showCountryDropdown && (
                                        <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-48">
                                          {COUNTRY_CODES.map((c) => (
                                            <button
                                              key={c.code}
                                              type="button"
                                              onClick={() => {
                                                setPhoneCountryCode(c.code);
                                                setShowCountryDropdown(false);
                                              }}
                                              className={cn(
                                                "w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted/80 transition-colors text-sm",
                                                phoneCountryCode === c.code && "bg-muted"
                                              )}
                                            >
                                              <span>{c.flag}</span>
                                              <span className="font-medium">{c.code}</span>
                                              <span className="text-muted-foreground ml-auto">{c.label}</span>
                                            </button>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    <Input
                                      type="tel"
                                      placeholder={phoneCountryCode === "+41" ? "079 123 45 67" : "Local number"}
                                      value={phoneLocal}
                                      onChange={(e) => setPhoneLocal(e.target.value.replace(/[^\d\s\-]/g, ""))}
                                      className="bg-white border border-slate-200 focus:border-primary/50 focus:bg-white transition-all flex-1"
                                    />
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">Enter your local number — the country code is added automatically.</p>
                                </FormItem>
                                <FormField
                                  control={form.control}
                                  name="university"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>University (optional)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="EHL, EPFL, UNIL..." 
                                          className="bg-white border border-slate-200 focus:border-primary/50 focus:bg-white transition-all"
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="movingDate"
                                render={({ field }) => (
                                  <FormItem className="flex flex-col">
                                    <FormLabel>When do you want to move in?</FormLabel>
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <FormControl>
                                          <Button
                                            variant="outline"
                                            className={cn(
                                              "w-full md:w-[280px] pl-3 text-left font-normal bg-white border border-slate-200 hover:bg-slate-50 transition-all",
                                              !field.value && "text-muted-foreground"
                                            )}
                                          >
                                            {field.value ? (
                                              format(field.value, "PPP")
                                            ) : (
                                              <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                          </Button>
                                        </FormControl>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                          mode="single"
                                          selected={field.value}
                                          onSelect={field.onChange}
                                          disabled={(date) => date < new Date()}
                                          initialFocus
                                          className={cn("p-3 pointer-events-auto")}
                                        />
                                      </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          )}

                          {/* Step 2: Property Details */}
                          {currentStep === 2 && (
                            <motion.div
                              key="step2"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-6"
                            >
                              <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name="neighbourhood"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Neighbourhood</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-white border border-slate-200">
                                            <SelectValue placeholder="Select neighbourhood" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="no-preference">No preference</SelectItem>
                                          <SelectItem value="belmont-sur-lausanne">Belmont-Sur-Lausanne</SelectItem>
                                          <SelectItem value="chailly">Chailly</SelectItem>
                                          <SelectItem value="cite-flon">Cité/Flon</SelectItem>
                                          <SelectItem value="epalinges">Epalinges</SelectItem>
                                          <SelectItem value="lutry">Lutry</SelectItem>
                                          <SelectItem value="mont-sur-lausanne">Mont-Sur-Lausanne</SelectItem>
                                          <SelectItem value="renens">Renens</SelectItem>
                                          <SelectItem value="sallaz">Sallaz</SelectItem>
                                          <SelectItem value="savigny">Savigny</SelectItem>
                                          <SelectItem value="vers-chez-les-blancs">Vers Chez les Blancs</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="budget"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Budget per month (per person)</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-white border border-slate-200">
                                            <SelectValue placeholder="Select range" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="700-900">700-900 CHF</SelectItem>
                                          <SelectItem value="900-1100">900-1100 CHF</SelectItem>
                                          <SelectItem value="1100-1300">1100-1300 CHF</SelectItem>
                                          <SelectItem value="1300-1500">1300-1500 CHF</SelectItem>
                                          <SelectItem value="1500-1700">1500-1700 CHF</SelectItem>
                                          <SelectItem value="1700-1900">1700-1900 CHF</SelectItem>
                                          <SelectItem value="1900-2100">1900-2100 CHF</SelectItem>
                                          <SelectItem value="2100-2300">2100-2300 CHF</SelectItem>
                                          <SelectItem value="2300-2500">2300-2500 CHF</SelectItem>
                                          <SelectItem value="2500+">2500+ CHF</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid gap-6 md:grid-cols-3">
                                <FormField
                                  control={form.control}
                                  name="rooms"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Rooms</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-white border border-slate-200">
                                            <SelectValue placeholder="Select" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="1">1 room</SelectItem>
                                          <SelectItem value="2">2 rooms</SelectItem>
                                          <SelectItem value="3">3 rooms</SelectItem>
                                          <SelectItem value="4">4 rooms</SelectItem>
                                          <SelectItem value="5">5 rooms</SelectItem>
                                          <SelectItem value="6+">6+ rooms</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="duration"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Duration</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-white border border-slate-200">
                                            <SelectValue placeholder="Select" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="3">3 months</SelectItem>
                                          <SelectItem value="6">6 months</SelectItem>
                                          <SelectItem value="12">12 months</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="type"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Type</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value} defaultValue="studio">
                                        <FormControl>
                                          <SelectTrigger className="bg-white border border-slate-200">
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="studio">Studio</SelectItem>
                                          <SelectItem value="apartment">Apartment</SelectItem>
                                          <SelectItem value="house">House</SelectItem>
                                          <SelectItem value="shared">Shared</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="roommates"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Open to roommates?</FormLabel>
                                    <Select onValueChange={(value) => {
                                      field.onChange(value);
                                      if (value === "no") {
                                        form.setValue("roommateDetail", "");
                                        form.setValue("roommateCount", "");
                                      }
                                    }} value={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="bg-white border border-slate-200">
                                          <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="yes">Yes</SelectItem>
                                        <SelectItem value="no">No</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {form.watch("roommates") === "yes" && (
                                <>
                                  <FormField
                                    control={form.control}
                                    name="roommateDetail"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Roommate arrangement</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                            <SelectTrigger className="bg-white border border-slate-200">
                                              <SelectValue placeholder="Select arrangement" />
                                            </SelectTrigger>
                                          </FormControl>
                                            <SelectContent>
                                            <SelectItem value="sharing-with-friend">Sharing with a friend</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name="roommateCount"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>How many roommates?</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                          <FormControl>
                                            <SelectTrigger className="bg-white border border-slate-200">
                                              <SelectValue placeholder="Select number" />
                                            </SelectTrigger>
                                          </FormControl>
                                          <SelectContent>
                                            <SelectItem value="1">1</SelectItem>
                                            <SelectItem value="2">2</SelectItem>
                                            <SelectItem value="3">3</SelectItem>
                                            <SelectItem value="4+">4+</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </>
                              )}
                            </motion.div>
                          )}

                          {/* Step 3: Preferences */}
                          {currentStep === 3 && (
                            <motion.div
                              key="step3"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-6"
                            >
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name="furnished"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-4">
                                      <FormLabel className="cursor-pointer font-medium">Furnished</FormLabel>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="nearTransport"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-4">
                                      <FormLabel className="cursor-pointer font-medium">Near transport</FormLabel>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="pets"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-4">
                                      <FormLabel className="cursor-pointer font-medium">Pets allowed</FormLabel>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="noSmoking"
                                  render={({ field }) => (
                                    <FormItem className="flex items-center justify-between rounded-2xl bg-white border border-slate-200 p-4">
                                      <FormLabel className="cursor-pointer font-medium">No smoking policy</FormLabel>
                                      <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Anything else?</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Tell us about location preferences, accessibility needs, or anything important to you." 
                                        className="min-h-28 bg-white border border-slate-200 text-foreground placeholder:text-muted-foreground backdrop-blur-sm focus:border-primary/50 transition-all resize-none"
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          )}

                          {/* Step 4: Sign & Pay */}
                          {currentStep === 4 && (
                            <motion.div
                              key="step4"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-8"
                            >
                              <div className="text-center space-y-2">
                                <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Sign & Pay</h3>
                                <p className="text-muted-foreground text-sm max-w-md mx-auto">
                                  Three quick steps to activate your housing search.
                                </p>
                              </div>

                              {paymentBannerVisible && !paymentVerified && (
                                <div className="rounded-2xl border border-yellow-300 bg-yellow-50 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                                  <p className="text-sm text-yellow-900 flex-1">
                                    Payment not confirmed yet. If you completed payment, please wait a few seconds or click "Verify payment".
                                  </p>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={verifyPayment}
                                    disabled={isVerifyingPayment}
                                    className="border-yellow-400 text-yellow-900 hover:bg-yellow-100 shrink-0"
                                  >
                                    {isVerifyingPayment ? "Verifying…" : "Verify payment"}
                                  </Button>
                                </div>
                              )}

                              {paymentVerified && (
                                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 sm:p-5 flex items-center gap-3">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                                  <p className="text-sm text-emerald-900">
                                    Payment confirmed. You can now submit your application.
                                  </p>
                                </div>
                              )}

                              {/* ─── Section 1: Documents to prepare ─── */}
                              <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
                                <header className="flex items-start gap-3 mb-4">
                                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                    1
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-base sm:text-lg text-foreground">Documents to prepare</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                      Have these ready before your viewing to move fast on the best listings.
                                    </p>
                                  </div>
                                </header>

                                <div className="space-y-3">
                                  {[
                                    { emoji: "📄", title: "ID / Passport", desc: "A valid government-issued photo ID" },
                                    { emoji: "💼", title: "Work contract or proof of enrollment", desc: "Employment contract or student enrollment certificate" },
                                    { emoji: "💰", title: "Last 3 payslips or proof of income", desc: "Or last tax return if self-employed" },
                                    { emoji: "🏦", title: "Bank statements (last 3 months)", desc: "To confirm financial stability" },
                                    { emoji: "📋", title: "Debt collection register extract", desc: "Extrait du registre des poursuites — obtainable at your local office, valid within 3 months" },
                                    { emoji: "🏠", title: "Last rental reference or landlord contact", desc: "Previous landlord's name and contact info if applicable" },
                                  ].map((doc, i) => (
                                    <div
                                      key={i}
                                      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all"
                                    >
                                      <span className="text-xl sm:text-2xl mt-0.5 shrink-0">{doc.emoji}</span>
                                      <div className="min-w-0">
                                        <p className="font-medium text-sm text-foreground">{doc.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">{doc.desc}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>

                                <div className="pt-4">
                                  <label className="flex items-start gap-3 cursor-pointer rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                    <Checkbox
                                      checked={documentsAcknowledged}
                                      onCheckedChange={(checked) => {
                                        setDocumentsAcknowledged(checked === true);
                                        if (checked) setShowDocWarning(false);
                                      }}
                                      className="mt-0.5"
                                    />
                                    <span className="text-sm text-foreground leading-relaxed">
                                      I have read and understood the required documents. I commit to having them ready before my viewing appointment.
                                    </span>
                                  </label>
                                  {showDocWarning && (
                                    <p className="text-xs text-destructive mt-2 ml-1">
                                      Please confirm you've read the document requirements to continue.
                                    </p>
                                  )}
                                </div>
                              </section>

                              {/* ─── Section 2: Service Agreement ─── */}
                              <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
                                <header className="flex items-start gap-3 mb-4">
                                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                    2
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-base sm:text-lg text-foreground">Service Agreement</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                      Read the agreement, fill in your details and sign to activate your housing search.
                                    </p>
                                  </div>
                                </header>

                                <FormField
                                  control={form.control}
                                  name="privacyAccepted"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl bg-slate-50 border border-slate-200 p-4 mb-4">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value}
                                          onCheckedChange={field.onChange}
                                        />
                                      </FormControl>
                                      <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal">
                                          I have read and accept the{" "}
                                          <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                                            Privacy Policy
                                          </a>
                                          . I consent to the processing of my personal data in accordance with Swiss Federal Act on Data Protection (FADP) and GDPR.
                                        </FormLabel>
                                        <FormMessage />
                                      </div>
                                    </FormItem>
                                  )}
                                />

                                <ServiceAgreement
                                  clientName={form.watch("name") || ""}
                                  onSign={async (contractData) => {
                                    setPreSubmitContractSigned(true);
                                    setPreSubmitContractData(contractData);
                                    setShowContractWarning(false);
                                    toast({
                                      title: "✅ Contract signed!",
                                      description: "You can now submit your application.",
                                    });
                                    return { error: null };
                                  }}
                                  isSigned={preSubmitContractSigned}
                                />
                              </section>

                              {/* ─── Section 3: Activate your search (Stripe) ─── */}
                              <section className="rounded-3xl bg-white border border-slate-200 p-5 sm:p-6 shadow-sm">
                                <header className="flex items-start gap-3 mb-4">
                                  <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-semibold text-sm shrink-0">
                                    3
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-base sm:text-lg text-foreground">Activate your search</h4>
                                    <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                      Secure payment via Stripe. Your €50 deposit will be fully deducted from your final invoice — refunded if we don't find your home.
                                    </p>
                                  </div>
                                </header>

                                <Button
                                  type="button"
                                  disabled={!preSubmitContractSigned || isActivating}
                                  onClick={async () => {
                                    if (!preSubmitContractSigned || isActivating) return;
                                    setIsActivating(true);
                                    try {
                                      const values = form.getValues();
                                      const { error } = await supabase
                                        .from("intake_submissions")
                                        .insert({
                                          name: values.name || null,
                                          email: values.email || null,
                                          phone: getFullPhone() || null,
                                          budget: values.budget || null,
                                          property_type: values.type || null,
                                          duration: values.duration || null,
                                          preferences: {
                                            university: values.university || null,
                                            moving_date: values.movingDate
                                              ? new Date(values.movingDate).toISOString().slice(0, 10)
                                              : null,
                                            neighbourhood: values.neighbourhood || null,
                                            rooms: values.rooms || null,
                                            roommates: values.roommates || null,
                                            roommate_detail: values.roommateDetail || null,
                                            roommate_count: values.roommateCount || null,
                                            furnished: values.furnished ?? null,
                                            near_transport: values.nearTransport ?? null,
                                            pets: values.pets ?? null,
                                            no_smoking: values.noSmoking ?? null,
                                            notes: values.notes || null,
                                            privacy_accepted: values.privacyAccepted ?? null,
                                          },
                                          date_of_birth: preSubmitContractData?.client_date_of_birth || null,
                                          nationality: preSubmitContractData?.client_nationality || null,
                                          signature_image: preSubmitContractData?.signature_image || null,
                                          contract_signed: true,
                                          status: "awaiting_payment",
                                        });
                                      if (error) throw error;
                                      window.location.href =
                                        "https://buy.stripe.com/4gM28rcBY1Kl8E713fcEw00";
                                    } catch (err: any) {
                                      console.error("Failed to save intake submission", err);
                                      toast({
                                        title: "Could not start payment",
                                        description:
                                          err?.message ||
                                          "Something went wrong saving your application. Please try again.",
                                        variant: "destructive",
                                      });
                                      setIsActivating(false);
                                    }
                                  }}
                                  className={cn(
                                    "w-full h-12 sm:h-14 rounded-2xl font-medium text-sm sm:text-base gap-2 transition-colors",
                                    preSubmitContractSigned && !isActivating
                                      ? "bg-slate-900 hover:bg-slate-800 text-white"
                                      : "bg-slate-200 text-slate-400 cursor-not-allowed hover:bg-slate-200"
                                  )}
                                >
                                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                                  {isActivating ? "Redirecting…" : "Activate your search"}
                                </Button>
                                {!preSubmitContractSigned && (
                                  <p className="text-xs text-muted-foreground text-center mt-2">
                                    Please complete and sign the Service Agreement above to enable payment.
                                  </p>
                                )}
                              </section>

                              {/* Honeypot */}
                              <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                                <FormField
                                  control={form.control}
                                  name="website"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Website</FormLabel>
                                      <FormControl>
                                        <Input {...field} tabIndex={-1} autoComplete="off" />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex flex-col mt-8 pt-6 border-t border-border/30">
                          {currentStep === 4 && showContractWarning && !preSubmitContractSigned && (
                            <p className="text-sm text-destructive mb-3 text-right">
                              A signed contract is required to begin your search. Please sign the document above before submitting.
                            </p>
                          )}
                          <div className="flex justify-between">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={prevStep}
                              disabled={currentStep === 1}
                              className="gap-2"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              Back
                            </Button>
                            
                            {currentStep < 4 ? (
                              <Button
                                type="button"
                                onClick={nextStep}
                                className="gap-2"
                              >
                                Continue
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            ) : (
                              <Button
                                type={preSubmitContractSigned && paymentVerified ? "submit" : "button"}
                                disabled={isSubmitting || !preSubmitContractSigned || !paymentVerified}
                                onClick={() => {
                                  if (!preSubmitContractSigned) {
                                    setShowContractWarning(true);
                                  }
                                }}
                                className={cn("gap-2", (!preSubmitContractSigned || !paymentVerified) && "opacity-50 cursor-not-allowed")}
                              >
                                {isSubmitting ? "Submitting..." : "Find my home"}
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
