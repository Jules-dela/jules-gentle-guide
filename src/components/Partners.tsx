import { Card } from "@/components/ui/card";

const partners = [
  { name: "ImmoScout24" },
  { name: "Immobilier.ch" },
  { name: "Rentola" },
  { name: "Comparis.ch" },
];

export const Partners = () => {
  return (
    <section id="partners" className="py-20">
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
          {partners.map((partner) => {
            return (
              <Card 
                key={partner.name}
                className="flex items-center justify-center p-8 h-32 bg-gradient-to-br from-background via-background to-muted/20 border border-border/50 hover:border-primary/30 hover:shadow-md transition-all duration-300"
              >
                <p className="text-lg font-medium text-foreground">
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
