import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

export const ApplicationForm = () => {
  const { toast } = useToast();
  const { ref, isVisible } = useScrollAnimation();
  const [furnished, setFurnished] = useState(true);
  const [nearTransport, setNearTransport] = useState(true);
  const [pets, setPets] = useState(false);
  const [noSmoking, setNoSmoking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application submitted!",
      description: "We'll match you with the perfect apartment soon.",
    });
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Jane Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="jane@university.edu" required />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" placeholder="+41 79 123 45 67" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">University (optional)</Label>
                  <Input id="university" placeholder="University" />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="neighbourhood">Neighbourhood</Label>
                  <Select>
                    <SelectTrigger id="neighbourhood">
                      <SelectValue placeholder="Select neighbourhood" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-preference">No preference</SelectItem>
                      <SelectItem value="chailly">Chailly</SelectItem>
                      <SelectItem value="cite-flon">Cité/Flon</SelectItem>
                      <SelectItem value="renens">Renens</SelectItem>
                      <SelectItem value="epalinges">Epalinges</SelectItem>
                      <SelectItem value="sallaz">Sallaz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget per month</Label>
                  <Select>
                    <SelectTrigger id="budget">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rooms">Number of rooms</Label>
                  <Select>
                    <SelectTrigger id="rooms">
                      <SelectValue placeholder="Select rooms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 room</SelectItem>
                      <SelectItem value="2">2 rooms</SelectItem>
                      <SelectItem value="3">3+ rooms</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Select>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select defaultValue="studio">
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roommates">Roommates</Label>
                  <Select>
                    <SelectTrigger id="roommates">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">No roommates</SelectItem>
                      <SelectItem value="1">1 roommate</SelectItem>
                      <SelectItem value="2+">2+ roommates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-3 md:p-4">
                  <Label htmlFor="furnished" className="cursor-pointer text-sm md:text-base">Furnished</Label>
                  <Switch id="furnished" checked={furnished} onCheckedChange={setFurnished} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3 md:p-4">
                  <Label htmlFor="transport" className="cursor-pointer text-sm md:text-base">Near transport</Label>
                  <Switch id="transport" checked={nearTransport} onCheckedChange={setNearTransport} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3 md:p-4">
                  <Label htmlFor="pets" className="cursor-pointer text-sm md:text-base">Pets</Label>
                  <Switch id="pets" checked={pets} onCheckedChange={setPets} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-3 md:p-4 col-span-2 lg:col-span-1">
                  <Label htmlFor="smoking" className="cursor-pointer text-xs md:text-sm">No smoking policy enforced</Label>
                  <Switch id="smoking" checked={noSmoking} onCheckedChange={setNoSmoking} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Anything else?</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Tell us about location preferences, accessibility needs, or roommates." 
                  className="min-h-24"
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Find my home
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};
