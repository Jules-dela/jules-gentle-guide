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
          {partners.map((partner, index) => {
            const shapes = [
              'rounded-3xl',
              'rounded-tl-3xl rounded-br-3xl',
              'rounded-tr-3xl rounded-bl-3xl',
              'rounded-2xl'
            ];
            return (
              <Card 
                key={partner.name}
                className={`flex items-center justify-center p-8 h-32 bg-gradient-to-br from-background to-muted/50 border-2 border-primary/20 ${shapes[index]} hover:border-primary/40 transition-all duration-300 hover:shadow-lg`}
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
