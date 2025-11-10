// src/sections/FlavorSection.jsx
import { useRef } from "react";
import FlavorTitle from "../components/FlavorTitle";
import FlavorSlider from "../components/FlavorSlider";

const FlavorSection = () => {
  // This ref becomes the single source of truth for pin/scroll triggers
  const pinRef = useRef(null);

  return (
    <section
      ref={pinRef}
      // isolate => new stacking context so this section can't sit above hero
      className="relative z-0 isolate flavor-section bg-transparent"
    >
      <div className="h-full flex lg:flex-row flex-col items-center relative">
        <div className="lg:w-[57%] flex-none h-80 lg:h-full md:mt-20 xl:mt-0">
          <FlavorTitle />
        </div>

        {/* Pass the pin root down so the slider uses a ref trigger (not '.flavor-section') */}
        <div className="h-full">
          <FlavorSlider pinRootRef={pinRef} />
        </div>
      </div>
    </section>
  );
};

export default FlavorSection;
