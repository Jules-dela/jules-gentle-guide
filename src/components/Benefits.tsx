export const Benefits = () => {
  const benefits = [
    "Your ideal flat, found for you",
    "No paperwork stress — we handle it all",
    "Keys waiting when you arrive",
    "A seamless start to student life"
  ];

  return (
    <section className="bg-[#F8F9FA] px-20 py-[60px]">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-[#1E3A8A] mt-2 flex-shrink-0" />
              <p className="text-[20px] font-medium text-[#1E3A8A] leading-[1.6]">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
