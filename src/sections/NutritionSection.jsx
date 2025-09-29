import { useMediaQuery } from "react-responsive";
import { nutrientLists } from "../constants";
import { useEffect, useState } from "react";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";
import gsap from "gsap";

const NutritionSection = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [lists, setLists] = useState(nutrientLists);
  const [startIndex, setStartIndex] = useState(0);

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

  useEffect(() => {
    if (!isMobile || nutrientLists.length <= 3) return;
    const id = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % nutrientLists.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isMobile]);

  useGSAP(() => {
    const titleSplit = SplitText.create(".nutrition-title", { type: "chars" });
    const paragraphSplit = SplitText.create(".nutrition-section p", {
      type: "words, lines",
      linesClass: "paragraph-line",
    });

    const contentTl = gsap.timeline({
      scrollTrigger: { trigger: ".nutrition-section", start: "top center" },
    });
    contentTl
      .from(titleSplit.chars, { yPercent: 100, stagger: 0.02, ease: "power2.out" })
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

  return (
    <section className="nutrition-section relative overflow-hidden">
      {/* Top wave */}
      <img
        src="/images/slider-dip.png"
        alt=""
        className="w-full object-cover relative z-10"
      />

      {/* CONTENT FIRST */}
      <div className="flex md:flex-row flex-col justify-between md:px-10 px-5 mt-6 md:mt-0 relative z-20">
        <div className="relative inline-block md:translate-y-20">
          <div className="general-title relative flex flex-col justify-center items-center gap-24">
            <div className="overflow-hidden place-self-start">
              <h1 className="nutrition-title uppercase">It still does</h1>
            </div>
            <div
              style={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)" }}
              className="nutrition-text-scroll place-self-start"
            >
              <div className="bg-yellow-brown pb-5 md:pt-0 pt-3 md:px-5 px-3">
                <h2 className="text-milk-yellow uppercase">Body Good</h2>
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

      {/* IMAGE AT BOTTOM - FIXED VERSION */}
      <div className="relative w-full mt-8 md:mt-0 md:min-h-[28rem] lg:min-h-[34rem]">
        <img
          src="/images/big-img.webp"
          alt="Ayurvedic products"
          className="
            w-full
            h-64 sm:h-56 md:h-64
            object-contain object-center
            relative
            
            md:absolute md:left-20 md:right-20 md:bottom-40
            md:h-[22rem] lg:h-[28rem] xl:h-[36rem]
          "
        />
      </div>
    </section>
  );
};

export default NutritionSection;