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
        <div className="grid gap-8 md:grid-cols-2">
          {benefits.map((benefit, index) => {
            const colors = [
              'bg-blue-500',
              'bg-green-500', 
              'bg-purple-500',
              'bg-orange-500'
            ];
            const rotations = [
              '-rotate-3',
              'rotate-2',
              '-rotate-2',
              'rotate-3'
            ];
            return <div key={benefit.title} className="relative">
              <Card className={`relative overflow-visible bg-background border-2 border-border ${rotations[index]} hover:rotate-0 transition-transform duration-300`}>
                <div className={`absolute -top-6 -left-6 w-16 h-16 ${colors[index]} rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 z-10`}>
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <CardContent className="p-8 pt-10">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>;
          })}
        </div>
      </div>
    </section>;
};