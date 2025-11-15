import { Card, CardContent } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";
import { Clock, Shield, Target, HandHeart } from "lucide-react";

const benefits = [
  {
    title: "Response Within 24 Hours",
    description: "We know apartment hunting is time-sensitive. You'll hear from us within one business day—guaranteed.",
    icon: Clock
  },
  {
    title: "Only Verified Listings",
    description: "Every apartment we show you has been vetted through our partner platforms. No scams, no surprises.",
    icon: Shield
  },
  {
    title: "Personalized Matching",
    description: "Tell us your budget, preferred neighbourhoods, and must-haves. We'll find options that actually fit your needs.",
    icon: Target
  },
  {
    title: "Full Support Until Move-In",
    description: "From first viewing to signing the lease, we're with you every step of the way.",
    icon: HandHeart
  }
];

export const Testimonials = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section 
      id="testimonials" 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 bg-muted/50 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container">
        <h2 className="text-3xl lg:text-4xl font-bold mb-12">
          What You Can Expect When You Work With Unikey
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((benefit, index) => (
            <Card 
              key={benefit.title} 
              className={`bg-white/80 backdrop-blur-sm border border-border/50 transition-all duration-700 hover:scale-105 hover:border-primary/30 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <CardContent className="p-6 flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
