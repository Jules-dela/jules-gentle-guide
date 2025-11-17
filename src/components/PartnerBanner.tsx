import homegate from "@/assets/partners/homegate.png";
import immoscout24 from "@/assets/partners/immoscout24.png";
import comparis from "@/assets/partners/comparis.png";
import flatfox from "@/assets/partners/flatfox.png";
import neho from "@/assets/partners/neho.png";
import wincasa from "@/assets/partners/wincasa.png";
import fmel from "@/assets/partners/fmel.png";
import rentola from "@/assets/partners/rentola.png";

export const PartnerBanner = () => {
  const partners = [
    { name: "Homegate", logo: homegate },
    { name: "Immoscout24", logo: immoscout24 },
    { name: "Comparis", logo: comparis },
    { name: "Flatfox", logo: flatfox },
    { name: "Neho", logo: neho },
    { name: "Wincasa", logo: wincasa },
    { name: "FMEL", logo: fmel },
    { name: "Rentola", logo: rentola }
  ];

  // Duplicate partners array to create seamless loop
  const duplicatedPartners = [...partners, ...partners, ...partners];

  return (
    <section className="relative w-full overflow-hidden bg-background py-12 md:py-16">
      {/* Section Header */}
      <div className="container mb-8 md:mb-10">
        <h2 className="text-center text-base md:text-lg font-medium text-[hsl(var(--navy))]">
          Trusted by Switzerland's Leading Property Platforms
        </h2>
      </div>

      {/* Gradient Fade Overlays */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      {/* Scrolling Banner Container */}
      <div 
        className="relative h-20 md:h-[120px] flex items-center"
        aria-label="Trusted partners"
      >
        {/* Animated Content - respects prefers-reduced-motion */}
        <div className="flex items-center gap-12 md:gap-20 animate-scroll-rtl motion-reduce:animate-none motion-reduce:justify-center motion-reduce:flex-wrap">
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex items-center gap-12 md:gap-20 flex-shrink-0"
            >
              <div className="flex items-center justify-center group transition-all duration-300 px-4">
                <img
                  src={partner.logo}
                  alt={`${partner.name} logo`}
                  className="h-14 md:h-20 w-auto object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                />
              </div>
              {index < duplicatedPartners.length - 1 && (
                <div className="w-[1px] h-6 md:h-8 bg-border/30 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Decorative Dividers */}
      <div className="container mt-8 md:mt-10">
        <div className="w-[90%] mx-auto h-[1px] bg-border/30" />
      </div>
    </section>
  );
};
