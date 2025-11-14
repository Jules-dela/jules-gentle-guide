import { Card } from "@/components/ui/card";
import { useScrollAnimation } from "@/hooks/use-scroll-animation";

const partners = [
  { name: "ImmoScout24" },
  { name: "immobilier.ch" },
  { name: "Rentola" },
  { name: "comparis.ch" },
];

export const Partners = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section 
      id="partners" 
      ref={ref as React.RefObject<HTMLElement>}
      className={`py-20 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}
    >
      <div className="container">
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Trusted Real-Estate Partnerships
          </h2>
          <p className="text-muted-foreground lg:text-right max-w-md">
            We partner only with vetted, student-friendly agencies.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {partners.map((partner, index) => (
            <Card 
              key={partner.name}
              className={`flex items-center justify-center p-8 h-32 bg-card hover:bg-accent transition-all duration-500 ${
                isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <p className="text-lg font-medium text-muted-foreground">
                {partner.name}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
