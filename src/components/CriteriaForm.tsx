import { useState, useRef } from "react";
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
import { ChevronRight, ChevronLeft, CheckCircle2, User, Home, Settings, Send, CalendarIcon } from "lucide-react";
import { ServiceAgreement } from "@/components/portal/ServiceAgreement";

// Validation schema
const criteriaSchema = z.object({
  name: z.string().trim().min(1, { message: "Full name is required" }).max(100),
  email: z.string().trim().email({ message: "Invalid email address" }).max(255),
  phone: z.string().trim().min(1, { message: "Phone number is required" }).max(20),
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
  { id: 4, title: "Submit", icon: Send },
];

interface CriteriaFormProps {
  onSubmitSuccess?: () => void | Promise<void>;
}

export const CriteriaForm = ({ onSubmitSuccess }: CriteriaFormProps = {}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState<string>('');
  const [contractSigned, setContractSigned] = useState(false);
  const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

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

  const validateStep = async (step: number) => {
    let fieldsToValidate: (keyof CriteriaFormData)[] = [];
    
    switch (step) {
      case 1:
        fieldsToValidate = ["name", "email", "phone", "university", "movingDate"];
        break;
      case 2:
        fieldsToValidate = ["neighbourhood", "budget", "rooms", "duration", "type", "roommates"];
        break;
      case 3:
        fieldsToValidate = ["furnished", "nearTransport", "pets", "noSmoking", "notes"];
        break;
      case 4:
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
      // Parse name into first/last
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Parse budget range into min/max
      let budgetMin: number | null = null;
      let budgetMax: number | null = null;
      if (data.budget) {
        const budgetMatch = data.budget.match(/^(\d+)-(\d+)$/);
        if (budgetMatch) {
          budgetMin = parseInt(budgetMatch[1], 10);
          budgetMax = parseInt(budgetMatch[2], 10);
        } else if (data.budget.endsWith("+")) {
          budgetMin = parseInt(data.budget.replace("+", ""), 10);
        }
      }

      // Save to leads table
      const { error: leadsError } = await supabase
        .from("leads" as any)
        .insert({
          first_name: firstName,
          last_name: lastName,
          email: data.email,
          phone: data.phone || null,
          budget_min: budgetMin,
          budget_max: budgetMax,
          city: data.neighbourhood || null,
          rooms: data.rooms || null,
          move_in_date: data.movingDate ? format(data.movingDate, "yyyy-MM-dd") : null,
          additional_notes: data.notes || null,
        });

      if (leadsError) {
        console.error("Leads insert error:", leadsError);
      }

      // Save to housing_applications (existing)
      const { error: dbError } = await supabase
        .from("housing_applications")
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          university: data.university || null,
          moving_date: data.movingDate ? format(data.movingDate, "yyyy-MM-dd") : null,
          neighbourhood: data.neighbourhood,
          budget: data.budget,
          rooms: data.rooms,
          duration: data.duration,
          property_type: data.type,
          roommate_preference: data.roommates === "yes" ? `Yes - ${data.roommateDetail || "not specified"} (${data.roommateCount || "?"} roommates)` : "No",
          furnished: data.furnished,
          near_transport: data.nearTransport,
          pets_allowed: data.pets,
          smoking_allowed: data.noSmoking,
          notes: data.notes || null,
          privacy_accepted: data.privacyAccepted,
        });

      if (dbError) throw new Error("Failed to save application");

      const { data: result, error: emailError } = await supabase.functions.invoke("send-application-emails", {
        body: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          university: data.university,
          movingDate: data.movingDate ? format(data.movingDate, "PPP") : null,
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
        },
      });

      if (emailError) console.error("Portal creation error:", emailError);

      // Store submission data for contract signing
      setSubmittedName(data.name);
      setSubmittedCaseId(result?.caseId || null);

      // Auto-login if new user with temp password returned
      if (result?.isNewUser && result?.tempPassword) {
        setIsAutoLoggingIn(true);
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: result.tempPassword,
          });
          if (signInError) {
            console.error("Auto-login failed:", signInError);
          }
        } catch (loginErr) {
          console.error("Auto-login error:", loginErr);
        } finally {
          setIsAutoLoggingIn(false);
        }
      } else if (!result?.isNewUser) {
        // Existing user - try to check if already logged in
        // They'll need to sign from the portal
      }

      setIsSuccess(true);
      onSubmitSuccess?.();
      toast({
        title: "✅ Application submitted!",
        description: "Please sign the service agreement below to activate your search.",
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
  };

  return (
    <section 
      id="apply" 
      ref={sectionRef}
      className="py-24 md:py-32"
    >
      <div className="container max-w-6xl">
        <motion.div 
          className="bg-muted/50 rounded-[32px] md:rounded-[40px] p-6 md:p-10 lg:p-12 relative overflow-hidden"
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
                ) : (
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
                          <div 
                            className={`
                              flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-full transition-all duration-300
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
                          </div>
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
                  <div className="bg-background/60 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl p-6 md:p-8 lg:p-10">
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
                                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:bg-white/70 transition-all"
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
                                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:bg-white/70 transition-all"
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                              <div className="grid gap-6 md:grid-cols-2">
                                <FormField
                                  control={form.control}
                                  name="phone"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Phone</FormLabel>
                                      <FormControl>
                                        <Input 
                                          type="tel" 
                                          placeholder="+41 79 123 45 67" 
                                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:bg-white/70 transition-all"
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="university"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>University (optional)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="EHL, EPFL, UNIL..." 
                                          className="bg-white/50 backdrop-blur-sm border-white/30 focus:border-primary/50 focus:bg-white/70 transition-all"
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
                                              "w-full md:w-[280px] pl-3 text-left font-normal bg-white/50 backdrop-blur-sm border-white/30 hover:bg-white/70 transition-all",
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
                                          <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
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
                                      <FormLabel>Budget per month</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
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
                                          <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
                                            <SelectValue placeholder="Select" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="1">1 room</SelectItem>
                                          <SelectItem value="2">2 rooms</SelectItem>
                                          <SelectItem value="3">3+ rooms</SelectItem>
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
                                          <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
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
                                          <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
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
                                        <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
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
                                            <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
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
                                            <SelectTrigger className="bg-white/50 backdrop-blur-sm border-white/30">
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
                                    <FormItem className="flex items-center justify-between rounded-2xl bg-white/50 backdrop-blur-sm border border-white/30 p-4">
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
                                    <FormItem className="flex items-center justify-between rounded-2xl bg-white/50 backdrop-blur-sm border border-white/30 p-4">
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
                                    <FormItem className="flex items-center justify-between rounded-2xl bg-white/50 backdrop-blur-sm border border-white/30 p-4">
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
                                    <FormItem className="flex items-center justify-between rounded-2xl bg-white/50 backdrop-blur-sm border border-white/30 p-4">
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
                                        {...field}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </motion.div>
                          )}

                          {/* Step 4: Submit */}
                          {currentStep === 4 && (
                            <motion.div
                              key="step4"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-6"
                            >
                              <div className="bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 p-6">
                                <h3 className="font-semibold text-lg mb-4">Review your criteria</h3>
                                <div className="grid gap-3 text-sm">
                                  <div className="flex justify-between py-2 border-b border-border/30">
                                    <span className="text-muted-foreground">Name</span>
                                    <span className="font-medium">{form.watch("name") || "—"}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-border/30">
                                    <span className="text-muted-foreground">Email</span>
                                    <span className="font-medium">{form.watch("email") || "—"}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-border/30">
                                    <span className="text-muted-foreground">Budget</span>
                                    <span className="font-medium">{form.watch("budget") ? `${form.watch("budget")} CHF` : "—"}</span>
                                  </div>
                                  <div className="flex justify-between py-2 border-b border-border/30">
                                    <span className="text-muted-foreground">Property Type</span>
                                    <span className="font-medium capitalize">{form.watch("type") || "—"}</span>
                                  </div>
                                  <div className="flex justify-between py-2">
                                    <span className="text-muted-foreground">Duration</span>
                                    <span className="font-medium">{form.watch("duration") ? `${form.watch("duration")} months` : "—"}</span>
                                  </div>
                                </div>
                              </div>

                              <FormField
                                control={form.control}
                                name="privacyAccepted"
                                render={({ field }) => (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl bg-white/50 backdrop-blur-sm border border-white/30 p-4">
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
                        <div className="flex justify-between mt-8 pt-6 border-t border-border/30">
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
                            <Button type="button" onClick={nextStep} className="gap-2">
                              Continue
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          ) : (
                            <Button type="submit" disabled={isSubmitting} className="gap-2">
                              {isSubmitting ? "Submitting..." : "Find my home"}
                              <Send className="w-4 h-4" />
                            </Button>
                          )}
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
