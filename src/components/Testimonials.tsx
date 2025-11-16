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
  return <section id="testimonials" className="py-24 bg-muted/50">
      <div className="container max-w-6xl">
        <h2 className="text-3xl lg:text-4xl font-bold mb-16 text-center">​Your Apartment Search, Simplified.
      </h2>
        <div className="grid gap-12 md:grid-cols-2 md:gap-x-16 md:gap-y-12">
          {benefits.map((benefit) => {
            return <div key={benefit.title} className="flex gap-5 items-start">
                <div className="flex-shrink-0 mt-1">
                  <benefit.icon className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-3">
                  <h3 className="font-semibold text-xl">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>;
          })}
        </div>
      </div>
    </section>;
};