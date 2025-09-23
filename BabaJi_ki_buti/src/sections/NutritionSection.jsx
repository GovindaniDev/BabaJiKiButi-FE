import { useMediaQuery } from "react-responsive";
import { nutrientLists } from "../constants";
import { useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";


const NutritionSection = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [lists, setLists] = useState(nutrientLists);

  // ADDED: track which item we start from (for mobile auto-slide)
  const [startIndex, setStartIndex] = useState(0);

  // REPLACED: keep 3 visible on mobile (rotating window), full list on desktop
  useEffect(() => {
    if (isMobile) {
      const windowSize = Math.min(3, nutrientLists.length);
      const next = Array.from({ length: windowSize }, (_, i) =>
        nutrientLists[(startIndex + i) % nutrientLists.length]
      );
      setLists(next);
    } else {
      setLists(nutrientLists);
    }
  }, [isMobile, startIndex]);

  // ADDED: mobile-only timer to auto-advance categories
  useEffect(() => {
    if (!isMobile || nutrientLists.length <= 3) return;

    const intervalMs = 3000; // change speed if you like (e.g., 2500/4000)
    const id = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % nutrientLists.length);
    }, intervalMs);

    return () => clearInterval(id);
  }, [isMobile]);

  useGSAP(() => {
    // (unchanged) GSAP animations
    const titleSplit = SplitText.create(".nutrition-title", { type: "chars" });
    const paragraphSplit = SplitText.create(".nutrition-section p", {
      type: "words, lines",
      linesClass: "paragraph-line",
    });

    const contentTl = gsap.timeline({
      scrollTrigger: { trigger: ".nutrition-section", start: "top center" },
    });
    contentTl
      .from(titleSplit.chars, {
        yPercent: 100,
        stagger: 0.02,
        ease: "power2.out",
      })
      .from(paragraphSplit.words, {
        yPercent: 300,
        rotate: 3,
        ease: "power1.inOut",
        duration: 1,
        stagger: 0.01,
      });

    const titleTl = gsap.timeline({
      scrollTrigger: { trigger: ".nutrition-section", start: "top 80%" },
    });

    titleTl.to(".nutrition-text-scroll", {
      duration: 1,
      opacity: 1,
      clipPath: "polygon(100% 0, 0 0, 0 100%, 100% 100%)",
      ease: "power1.inOut",
    });
  });

  // Optional: simple navigators (replace with your router/navigation)
  const goToBMI = () => (window.location.href = "/bmi-calculator");
  const goToDosha = () => (window.location.href = "/dosha-test");

  return (
    <section className="nutrition-section relative">
      

      <img src="/images/slider-dip.png" alt="" className="w-full object-cover" />
      <img src="/images/big-img.webp" alt="" className="big-img" />

      <div className="flex md:flex-row flex-col justify-between md:px-10 px-5 mt-14 md:mt-0">
        <div className="relative inline-block md:translate-y-20">
          <div className="general-title relative flex flex-col justify-center items-center gap-24">
            <div className="overflow-hidden place-self-start">
              <h1 className="nutrition-title">It still does</h1>
            </div>
            <div
              style={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
              className="nutrition-text-scroll place-self-start"
            >
              <div className="bg-yellow-brown pb-5 md:pt-0 pt-3 md:px-5 px-3">
                <h2 className="text-milk-yellow">Body Good</h2>
              </div>
            </div>
          </div>
        </div>

        <div className="flex md:justify-center items-center translate-y-5">
          <div className="md:max-w-xs max-w-md">
            <p className="text-lg md:text-right px-5 text-balance font-paragraph">
              A powerful Ayurvedic blend prepared with ancient formulations to
              increase stamina, strength, and inner energy.
            </p>
          </div>
        </div>

       




      </div>
    </section>
  );
};

export default NutritionSection;
