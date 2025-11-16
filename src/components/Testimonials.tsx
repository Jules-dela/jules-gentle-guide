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
          {benefits.map((benefit) => {
            return <div key={benefit.title} className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {benefit.description}
                  </p>
                </div>
              </div>;
          })}
        </div>
      </div>
    </section>;
};