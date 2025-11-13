import { useGSAP } from "@gsap/react";
import ClipPathTitle from "../components/ClipPathTitle";
import gsap from "gsap";
;
import { SplitText } from "gsap/all";
import VideoPinSection from "../components/VideoPinSection";
import { useMediaQuery } from "react-responsive";
import { useState,useEffect } from "react";
import { nutrientLists } from "../constants";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const BenefitSection = () => {
  useGSAP(() => {
    const revealTl = gsap.timeline({
      delay: 1,
      scrollTrigger: {
        trigger: ".benefit-section",
        start: "top 60%",
        end: "top top",
        scrub: 1.5,
      },
    });

    revealTl
      .to(".benefit-section .first-title", {
        duration: 1,
        opacity: 1,
        clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
        ease: "circ.out",
      })
      .to(".benefit-section .second-title", {
        duration: 1,
        opacity: 1,
        clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
        ease: "circ.out",
      })
      .to(".benefit-section .third-title", {
        duration: 1,
        opacity: 1,
        clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
        ease: "circ.out",
      })
      .to(".benefit-section .fourth-title", {
        duration: 1,
        opacity: 1,
        clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
        ease: "circ.out",
      });
  });
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
  
    const goToBMI = () => (window.location.href = "/bmi-calculator");
  const goToDosha = () => (window.location.href = "/dosha-test");


  return (
    <section className="benefit-section">
       
      <div className="container mx-auto pt-20">
  <div className="nutrition-box">
    {/* Buttons row */}
    <div className="flex items-center justify-between px-3 md:px-6 pt-2 md:pt-0">
      <Link
              to="/bmi"
              className="
    pointer-events-auto
    rounded-full font-bold uppercase whitespace-nowrap
    bg-light-brown text-dark-brown
    px-3.5 py-1.5 text-sm
    sm:px-4 sm:py-2 sm:text-base
    md:px-5 md:py-2 md:text-base
    lg:px-6 lg:py-2.5 lg:text-lg
    shadow-sm hover:shadow-md transition
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300
    disabled:opacity-50 disabled:cursor-not-allowed
  "
              aria-label="Open BMI Calculator"
            >
              BMI Calculator
            </Link>

      <Link
       to="/dosha"
       onClick={(e)=>window.scrollTo({top:0,behavior:'instant'})}
        className="
           pointer-events-auto
  rounded-full font-bold uppercase whitespace-nowrap
  bg-light-brown text-dark-brown
  px-3.5 py-1.5 text-sm
  sm:px-4 sm:py-2 sm:text-base
  md:px-5 md:py-2 md:text-base
  lg:px-6 lg:py-2.5 lg:text-lg
  shadow-sm hover:shadow-md transition
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300
  disabled:opacity-50 disabled:cursor-not-allowed
        "
        aria-label="Open Dosha Test"
        type="button"
      >
        Dosha Test
      </Link>
    </div>
          {/* <div className="overflow-hidden  mt-4 md:mt-6">
           
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isMobile ? `slide-${startIndex}` : "desktop"}
                initial={isMobile ? { x: 32, opacity: 0 } : false}
                animate={isMobile ? { x: 0, opacity: 1 } : {}}
                exit={isMobile ? { x: -32, opacity: 0 } : {}}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                
                className="
        list-wrapper
  grid grid-cols-3 justify-items-center
  gap-x-10 gap-y-12
  sm:gap-x-12 sm:gap-y-16
  md:grid-cols-none md:grid-rows-none md:flex md:flex-wrap md:justify-center
  md:gap-x-16 md:gap-y-16
  lg:gap-x-20 lg:gap-y-20

        "
              >
                {lists.map((nutrient, index) => (
                  <div
                    key={index}
                    
                    className="relative flex flex-col items-center justify-start w-24 sm:w-28 md:w-auto"
                  >
                    
                    <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-20 md:h-20 rounded-full flex items-center justify-center bg-white shadow-[0_0_15px_3px_rgba(139,69,19,0.5)] [text-shadow:2px_2px_4px_rgba(0,0,0,0.6),4px_4px_6px_rgba(0,0,0,0.4)]">
                   <Link to="/shop"> <img src={nutrient.img} alt="" /></Link>
                    </div>

                  
                    <div className="mt-1 sm:mt-2 h-10 sm:h-12 flex items-center justify-center px-1 text-center">
                      <p className="md:text-lg font-paragraph text-center text-[#faeade] [text-shadow:2px_2px_4px_rgba(0,0,0,0.6),4px_4px_6px_rgba(0,0,0,0.4)]">
                        {nutrient.label}
                      </p>
                    </div>

                   
                    {index !== lists.length - 1 && (
                      <div className="spacer-border hidden md:block" />
                    )}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div> */}
        </div>
        <div className="col-center mt-8">
          <p>
            The Power of Remedies <br />
            Explore the Key Benefits of Baba Ji Ki Buti
          </p>

          <div className="mt-20 col-center">
            <ClipPathTitle
              title={"जड़ी-बूटियां"}
              color={"#faeade"}
              bg={"#c88e64"}
              className={"first-title"}
              borderColor={"#222123"}
            />
            <ClipPathTitle
              title={"Modern + Wellness"}
              color={"#222123"}
              bg={"#faeade"}
              className={"second-title"}
              borderColor={"#222123"}
            />
            <ClipPathTitle
              title={"प्राचीन-ज्ञान"}
              color={"#faeade"}
              bg={"#7F3B2D"}
              className={"third-title"}
              borderColor={"#222123"}
            />
            <ClipPathTitle
              title={"Power of Ayurveda"}
              color={"#2E2D2F"}
              bg={"#FED775"}
              className={"fourth-title"}
              borderColor={"#222123"}
            />
          </div>

          <div className="md:mt-0 mt-10">
            <p>And much more ...</p>
          </div>
        </div>
      </div>

      <div className="relative overlay-box">
        <VideoPinSection />
      </div>
    </section>
  );
};

export default BenefitSection;
