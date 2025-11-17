export const PartnerBanner = () => {
  const partners = [
    "Homegate",
    "Immoscout24",
    "Comparis",
    "Flatfox",
    "Neho",
    "Wincasa",
    "FMEL",
    "Rentola"
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
              key={`${partner}-${index}`}
              className="flex items-center gap-12 md:gap-20 flex-shrink-0"
            >
              <div className="flex items-center justify-center group transition-all duration-300">
                <span 
                  className="text-lg md:text-2xl font-semibold text-[hsl(var(--navy))] opacity-70 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap tracking-wide"
                >
                  {partner}
                </span>
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
