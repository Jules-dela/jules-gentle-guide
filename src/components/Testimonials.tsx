import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Zoë B.",
    role: "Design intern — Paris",
    quote: "Unikey found me a bright studio near the metro within three days. Clear communication and zero stress."
  },
  {
    name: "Charles V.",
    role: "Software intern — Berlin",
    quote: "As an international student I was nervous. They handled the process end-to-end and the landlord was lovely."
  },
  {
    name: "Sofia L.",
    role: "Marketing intern — Lisbon",
    quote: "The apartment was exactly as described and the paperwork was simple. Highly recommend."
  }
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20 bg-muted/50">
      <div className="container">
        <h2 className="text-3xl lg:text-4xl font-bold mb-12">
          What students say
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name} className="bg-card">
              <CardContent className="p-6 space-y-4">
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
                <p className="text-foreground leading-relaxed">
                  "{testimonial.quote}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
