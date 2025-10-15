import { useGSAP } from "@gsap/react";
import { flavorlists } from "../constants";
import gsap from "gsap";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom"; // ⬅️ added

const FlavorSlider = () => {
  const sliderRef = useRef();

  const isTablet = useMediaQuery({
    query: "(max-width: 1024px)",
  });

  useGSAP(() => {
    const scrollAmount = sliderRef.current.scrollWidth - window.innerWidth;

    if (!isTablet) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flavor-section",
          start: "2% top",
          end: `+=${scrollAmount + 1500}px`,
          scrub: true,
          pin: true,
        },
      });

      tl.to(".flavor-section", {
        x: `-${scrollAmount + 1500}px`,
        ease: "power1.inOut",
      });
    }

    const titleTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".flavor-section",
        start: "top top",
        end: "bottom 80%",
        scrub: true,
      },
    });

    titleTl
      .to(".first-text-split", {
        xPercent: -30,
        ease: "power1.inOut",
      })
      .to(
        ".flavor-text-scroll",
        {
          xPercent: -22,
          ease: "power1.inOut",
        },
        "<"
      )
      .to(
        ".second-text-split",
        {
          xPercent: -10,
          ease: "power1.inOut",
        },
        "<"
      );
  });

  return (
    <div ref={sliderRef} className="slider-wrapper">
      <div className="flavors">
        {flavorlists.map((flavor) => {
          const to = `/product/${flavor.slug || flavor.product}`; // fallback if slug not present
          return (
            <div
              key={flavor.name}
              className={`relative z-30 lg:w-[50vw] w-96 lg:h-[70vh] md:w-[90vw] md:h-[50vh] h-80 flex-none ${flavor.rotation}`}
            >
              {/* background decorative */}
              <img
                src={`/images/${flavor.product}-bg.svg`}
                alt=""
                className="absolute bottom-0"
              />

              {/* product image */}
              <img
                src={`/images/${flavor.product}-prodbg.webp`}
                alt=""
                className="drinks"
              />

              {/* floating elements */}
              <img
                src={`/images/${flavor.color}-elements.webp`}
                alt=""
                className="elements"
              />

              {/* product name */}
              <h1>{flavor.name}</h1>

              {/* BUY NOW button */}
           <div className="absolute bottom-10 right-10 z-40">
  <Link
    to={to}
    className="btn-golden-glow inline-flex items-center justify-center px-6 py-3 rounded-full font-bold text-lg tracking-wider
               bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500
               text-black shadow-[0_0_20px_rgba(255,215,0,0.5)]
               hover:shadow-[0_0_35px_rgba(255,215,0,0.8)]
               transition-all duration-300 hover:scale-110 border border-yellow-400"
  >
    Buy Now
  </Link>
</div>


            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlavorSlider;
