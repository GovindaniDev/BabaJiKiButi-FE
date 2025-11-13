import { useEffect, useRef } from "react";
import { cards } from "../constants";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

gsap.registerPlugin(ScrollTrigger);

const TestimonialSection = () => {
  const vdRef = useRef([]);
  const sectionRef = useRef(null);

  // Refresh after page assets load (helps Safari/iOS jumpiness)
  useEffect(() => {
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  const computePinType = () => {
    // Prefer transform pinning when the root can be transformed (more reliable on iOS)
    const docEl = document.documentElement;
    const style = getComputedStyle(docEl);
    return style.transform !== "none" || style.webkitTransform
      ? "transform"
      : "fixed";
  };

  useGSAP(
    () => {
      const el = sectionRef.current;
      if (!el) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ScrollTrigger.config({
        ignoreMobileResize: true, // iOS UI chrome show/hide
      });

      ScrollTrigger.matchMedia({
       "(max-width: 768px)": () => {
  const prefersReduced =
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // layout padding
  gsap.set(el, { marginTop: 0, paddingTop: "3rem", paddingBottom: "4rem" });

  // subtle title glide (smaller deltas for smoothness)
  const titleTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: el,
      start: "top 85%",
      end: "110% top",
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  titleTl
    .fromTo(el.querySelector(".first-title"), { xPercent: -6, autoAlpha: 0 }, { xPercent: 6, autoAlpha: 1 })
    .fromTo(el.querySelector(".sec-title"),   { xPercent: -3, autoAlpha: 0 }, { xPercent: 5, autoAlpha: 1 }, "<")
    .fromTo(el.querySelector(".third-title"), { xPercent:  5, autoAlpha: 0 }, { xPercent:-5, autoAlpha: 1 }, "<");

  // FOCUSED CARD SEQUENCE
  const cards = gsap.utils.toArray(el.querySelectorAll(".vd-card"));
  const stepsPerCard = 0.8;        // how much scroll each card “owns” (seconds on the timeline)
  const sceneLen = Math.max(1, cards.length * stepsPerCard + 0.6); // total TL length

  const pinTl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: {
      trigger: el,
      start: "top top",
      end: `+=${Math.round(90 + cards.length * 25)}%`, // room for all cards
      scrub: 1,
      pin: true,
      pinSpacing: true,
      pinType: computePinType(),
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  if (!prefersReduced && cards.length) {
    // baseline state
    gsap.set(cards, {
      y: 70,
      scale: 0.92,
      rotation: 0,
      autoAlpha: 0,
      filter: "blur(10px)",
      transformOrigin: "50% 70%",
      force3D: true,
    });

    // slight global parallax for the stack
    pinTl.to(el.querySelector(".pin-box"), { yPercent: -6 }, 0);

    // each card gets a focus window
    cards.forEach((card, i) => {
      // gentle alternating tilt for depth
      const baseRot = (i % 2 === 0 ? -3 : 3);

      // ensure stacking while in focus
      gsap.set(card, { zIndex: 10 + i });

      const t = i * stepsPerCard; // timeline position for this card

      pinTl
        // enter & focus (sharpen, scale up, center)
        .fromTo(card,
          { y: 70, scale: 0.92, rotation: baseRot, autoAlpha: 0, filter: "blur(10px)" },
          {
            y: 0,
            scale: 1,
            rotation: 0,
            autoAlpha: 1,
            filter: "blur(0px)",
            ease: "power1.out",
            duration: 0.45,
          },
          t
        )
        // hold briefly while in perfect focus
        .to(card, { y: 0, scale: 1, autoAlpha: 1, duration: 0.15, ease: "none" }, t + 0.45)
        // drift up & gently dim as next card takes over
        .to(card,
          {
            y: -80,
            scale: 0.95,
            autoAlpha: 0.25,
            rotation: -baseRot * 0.6,
            ease: "power1.inOut",
            duration: 0.5,
          },
          t + 0.6
        );
    });

    // optional: fade everything at the very end
    pinTl.to(cards, { autoAlpha: 0, duration: 0.2 }, sceneLen);
  } else {
    // reduced-motion fallback
    pinTl.to(cards, { autoAlpha: 1, duration: 0.2 }, 0);
  }

  return () => {
    titleTl.scrollTrigger && titleTl.scrollTrigger.kill(true);
    pinTl.scrollTrigger && pinTl.scrollTrigger.kill(true);
    titleTl.kill();
    pinTl.kill();
  };
},


        /* ================= DESKTOP / LARGE ================= */
        "(min-width: 769px)": () => {
          gsap.set(el, { marginTop: "-140vh" });

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "200% top",
              scrub: true,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });

          tl.to(el.querySelector(".first-title"), { xPercent: 70 })
            .to(el.querySelector(".sec-title"), { xPercent: 25 }, "<")
            .to(el.querySelector(".third-title"), { xPercent: -50 }, "<");

          const pinTl = gsap.timeline({
            scrollTrigger: {
              trigger: el,
              start: "10% top",
              end: "200% top",
              scrub: 1.5,
              pin: true,
              pinSpacing: true,
              pinType: computePinType(),
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });

          if (!prefersReduced) {
            pinTl.from(el.querySelectorAll(".vd-card"), {
              yPercent: 150,
              stagger: 0.2,
              ease: "power1.inOut",
              force3D: true,
            });
          }

          return () => {
            tl.scrollTrigger && tl.scrollTrigger.kill(true);
            pinTl.scrollTrigger && pinTl.scrollTrigger.kill(true);
            tl.kill();
            pinTl.kill();
          };
        },

        /* ================= REDUCED MOTION ================= */
        "(prefers-reduced-motion: reduce)": () => {
          gsap.set(
            [".first-title", ".sec-title", ".third-title"].map((sel) =>
              el.querySelector(sel)
            ),
            { xPercent: 0 }
          );
          gsap.set(el.querySelectorAll(".vd-card"), { clearProps: "all" });
        },
      });
    },
    { scope: sectionRef }
  );

  const handlePlay = (i) => vdRef.current[i]?.play();
  const handlePause = (i) => vdRef.current[i]?.pause();

  return (
    <section ref={sectionRef} className="testimonials-section relative">
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-tight space-y-4 text-center">
        <h1 className="first-title text-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[11rem] font-extrabold">
          WHAT'S
        </h1>
        <h1 className="sec-title text-light-brown text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[11rem] font-extrabold">
          EVERYONE
        </h1>
        <h1 className="third-title text-black text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[11rem] font-extrabold">
          TALKING
        </h1>
      </div>

      <div className="pin-box">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`vd-card ${card.translation} ${card.rotation}`}
            onMouseEnter={() => handlePlay(index)}
            onMouseLeave={() => handlePause(index)}
          >
            <video
              ref={(el) => (vdRef.current[index] = el)}
              src={card.src}
              playsInline
              muted
              loop
              className="size-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialSection;
