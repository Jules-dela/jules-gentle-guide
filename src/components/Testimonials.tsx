import { Card, CardContent } from "@/components/ui/card";
import { Clock, Shield, Target, HandHeart } from "lucide-react";
const benefits = [{
  title: "Response Within 24 Hours",
  description: "We know apartment hunting is time-sensitive. You'll hear from us within one business day—guaranteed.",
  icon: Clock
}, {
  title: "Only Verified Listings",
  description: "Every apartment we show you has been vetted through our partner platforms. No scams, no surprises.",
  icon: Shield
}, {
  title: "Personalized Matching",
  description: "Tell us your budget, preferred neighbourhoods, and must-haves. We'll find options that actually fit your needs.",
  icon: Target
}, {
  title: "Full Support Until Move-In",
  description: "From first viewing to signing the lease, we're with you every step of the way.",
  icon: HandHeart
}];
export const Testimonials = () => {
  return <section id="testimonials" className="py-20 bg-muted/50">
      <div className="container">
        <h2 className="text-3xl lg:text-4xl font-bold mb-12">​Your Apartment Search, Simplified.
      </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit) => {
            return <Card key={benefit.title} className="relative overflow-hidden bg-gradient-to-br from-background to-muted/30 border border-border/50 hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
                <CardContent className="p-6 relative">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                        <benefit.icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{benefit.title}</h3>
                      <p className="text-muted-foreground leading-relaxed text-sm">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>;
          })}
        </div>
      </div>
    </section>;
};