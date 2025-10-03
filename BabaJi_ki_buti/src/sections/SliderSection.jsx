const SlidingSection = () => {
  const announcements = [
    "⭐ Members 20% OFF auto-applied",
    "🎉 Big Savings Alert! Get 10% OFF on orders above ₹3000 | Use code TBOF10",
    "🎁 FREE Truemato on orders above ₹4000",
    "🚨 BREAKING NEWS!!! 💸 GST PRICE CUT UP TO 12% ON MRP",
  ];

  return (
    <div className="fixed top-[66px] sm:top-[76px] md:top-[90px] lg:top-[102px] left-0 right-0 z-40 w-full bg-gradient-to-r from-[#c99456] via-[#b8844a] to-[#c99456] overflow-hidden shadow-sm">
      {/* Gradient edges for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-6 sm:w-8 md:w-12 lg:w-16 bg-gradient-to-r from-[#c99456] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-6 sm:w-8 md:w-12 lg:w-16 bg-gradient-to-l from-[#c99456] to-transparent z-10 pointer-events-none"></div>
      
      <div className="relative flex h-7 sm:h-8 md:h-9 lg:h-10 items-center">
        {/* First set of announcements */}
        <div className="flex animate-scroll whitespace-nowrap">
          {announcements.map((announcement, index) => (
            <div key={`set1-${index}`} className="inline-flex items-center mx-3 sm:mx-4 md:mx-6 lg:mx-8">
              <span className="text-[#2d1810] font-bold text-[10px] sm:text-[11px] md:text-xs lg:text-sm leading-tight">
                {announcement}
              </span>
             </div>
          ))}
        </div>
        
        {/* Duplicate set for seamless loop */}
        <div className="flex animate-scroll whitespace-nowrap" aria-hidden="true">
          {announcements.map((announcement, index) => (
            <div key={`set2-${index}`} className="inline-flex items-center mx-3 sm:mx-4 md:mx-6 lg:mx-8">
              <span className="text-[#2d1810] font-bold text-[10px] sm:text-[11px] md:text-xs lg:text-sm leading-tight">
                {announcement}
              </span>
              </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }

        /* Pause animation on hover/touch */
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default SlidingSection;