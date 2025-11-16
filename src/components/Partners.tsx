import { Card } from "@/components/ui/card";

const partners = [
  { name: "ImmoScout24" },
  { name: "Immobilier.ch" },
  { name: "Rentola" },
  { name: "Comparis.ch" },
];

export const Partners = () => {
  return (
    <section id="partners" className="py-12 md:py-20">
      <div className="container px-5 md:px-6">
        <div className="mb-8 md:mb-12 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3 md:gap-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold">
            Trusted Real-Estate Partnerships
          </h2>
          <p className="text-sm md:text-base text-muted-foreground lg:text-right max-w-md">
            We partner only with vetted, student-friendly agencies.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {partners.map((partner) => {
            return (
              <Card 
                key={partner.name}
                className="flex items-center justify-center p-4 md:p-8 h-24 md:h-32 bg-gradient-to-br from-background via-background to-muted/20 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <p className="text-sm md:text-lg font-medium text-foreground text-center">
                  {partner.name}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
