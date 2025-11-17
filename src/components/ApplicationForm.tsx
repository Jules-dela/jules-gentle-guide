import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

// Validation schema with security best practices
const applicationSchema = z.object({
  name: z.string()
    .trim()
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string()
    .trim()
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  phone: z.string()
    .trim()
    .max(20, { message: "Phone number must be less than 20 characters" })
    .optional()
    .or(z.literal("")),
  university: z.string()
    .trim()
    .max(100, { message: "University name must be less than 100 characters" })
    .optional()
    .or(z.literal("")),
  neighbourhood: z.string()
    .min(1, { message: "Please select a neighbourhood" }),
  budget: z.string()
    .min(1, { message: "Please select a budget range" }),
  rooms: z.string()
    .min(1, { message: "Please select number of rooms" }),
  duration: z.string()
    .min(1, { message: "Please select duration" }),
  type: z.string()
    .min(1, { message: "Please select property type" }),
  roommates: z.string()
    .min(1, { message: "Please select roommate preference" }),
  furnished: z.boolean().default(true),
  nearTransport: z.boolean().default(true),
  pets: z.boolean().default(false),
  noSmoking: z.boolean().default(false),
  notes: z.string()
    .trim()
    .max(1000, { message: "Notes must be less than 1000 characters" })
    .optional()
    .or(z.literal("")),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

export const ApplicationForm = () => {
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      university: "",
      neighbourhood: "",
      budget: "",
      rooms: "",
      duration: "",
      type: "studio",
      roommates: "",
      furnished: true,
      nearTransport: true,
      pets: false,
      noSmoking: false,
      notes: "",
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    // Data is already validated by zod schema
    toast({
      title: "Application submitted!",
      description: "We'll match you with the perfect apartment soon.",
    });
    
    // Reset form after successful submission
    form.reset();
  };

  return (
    <section 
      id="apply" 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-12 md:py-20 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container px-5 md:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 md:mb-8 text-center space-y-2">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
              Tell us about your stay
            </h2>
            <p className="text-sm md:text-base text-muted-foreground px-4">
              Answer a few quick questions and we'll match you with the right flats.
            </p>
          </div>
          <Card className="p-5 md:p-6 lg:p-8 bg-white/80 backdrop-blur-sm border border-border/50 shadow-xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full name</FormLabel>
                        <FormControl>
                          <Input placeholder="Jane Doe" {...field} />
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
                          <Input type="email" placeholder="jane@university.edu" {...field} />
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
                        <FormLabel>Phone (optional)</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder="+41 79 123 45 67" {...field} />
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
                          <Input placeholder="University" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="neighbourhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Neighbourhood</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select neighbourhood" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="no-preference">No preference</SelectItem>
                            <SelectItem value="chailly">Chailly</SelectItem>
                            <SelectItem value="cite-flon">Cité/Flon</SelectItem>
                            <SelectItem value="renens">Renens</SelectItem>
                            <SelectItem value="epalinges">Epalinges</SelectItem>
                            <SelectItem value="sallaz">Sallaz</SelectItem>
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
                            <SelectTrigger>
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
                            <SelectItem value="2500-2700">2500-2700 CHF</SelectItem>
                            <SelectItem value="2700-2900">2700-2900 CHF</SelectItem>
                            <SelectItem value="2900-3100">2900-3100 CHF</SelectItem>
                            <SelectItem value="3100-3300">3100-3300 CHF</SelectItem>
                            <SelectItem value="3300-3500">3300-3500 CHF</SelectItem>
                            <SelectItem value="3500+">3500+ CHF</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number of rooms</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select rooms" />
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
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
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
                            <SelectTrigger>
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
                  <FormField
                    control={form.control}
                    name="roommates"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Roommates</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="0">No roommates</SelectItem>
                            <SelectItem value="1">1 roommate</SelectItem>
                            <SelectItem value="2+">2+ roommates</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
                  <FormField
                    control={form.control}
                    name="furnished"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-3 md:p-4">
                        <FormLabel className="cursor-pointer text-sm md:text-base">Furnished</FormLabel>
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
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-3 md:p-4">
                        <FormLabel className="cursor-pointer text-sm md:text-base">Near transport</FormLabel>
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
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-3 md:p-4">
                        <FormLabel className="cursor-pointer text-sm md:text-base">Pets</FormLabel>
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
                      <FormItem className="flex items-center justify-between rounded-lg border border-border p-3 md:p-4 col-span-2 lg:col-span-1">
                        <FormLabel className="cursor-pointer text-xs md:text-sm">No smoking policy enforced</FormLabel>
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
                          placeholder="Tell us about location preferences, accessibility needs, or roommates." 
                          className="min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" size="lg" className="w-full">
                  Find my home
                </Button>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </section>
  );
};
