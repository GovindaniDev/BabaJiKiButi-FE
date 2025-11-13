// BenefitSection.jsx
import { useGSAP } from "@gsap/react";
import ClipPathTitle from "../components/ClipPathTitle";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import VideoPinSection from "../components/VideoPinSection";
import { useMediaQuery } from "react-responsive";
import { useState, useEffect, useRef } from "react";
import { nutrientLists } from "../constants";
import { Link } from "react-router-dom";

gsap.registerPlugin(ScrollTrigger);

/* ------------------------------------------
   Lightweight text splitter (no SplitText)
   type: "words" | "chars" | "words,chars"
-------------------------------------------*/
function splitText(el, type = "words") {
  if (!el || el.dataset.splitApplied === "1") return { nodes: [] };

  const original = el.textContent || "";
  el.dataset.originalText = original;

  const wrapWord = (w) => {
    const span = document.createElement("span");
    span.className = "split-word";
    span.textContent = w;
    return span;
  };

  const wrapChar = (c) => {
    const span = document.createElement("span");
    span.className = "split-char";
    span.textContent = c;
    return span;
  };

  const frag = document.createDocumentFragment();
  const wantsWords = type.includes("words");
  const wantsChars = type.includes("chars");

  if (wantsWords && !wantsChars) {
    const parts = original.split(/(\s+)/);
    parts.forEach((p) => {
      if (/\s+/.test(p)) frag.appendChild(document.createTextNode(p));
      else frag.appendChild(wrapWord(p));
    });
    el.replaceChildren(frag);
    el.dataset.splitApplied = "1";
    return { nodes: Array.from(el.querySelectorAll(".split-word")) };
  }

  if (!wantsWords && wantsChars) {
    const chars = Array.from(original);
    chars.forEach((c) => {
      if (c === " ") frag.appendChild(document.createTextNode(" "));
      else frag.appendChild(wrapChar(c));
    });
    el.replaceChildren(frag);
    el.dataset.splitApplied = "1";
    return { nodes: Array.from(el.querySelectorAll(".split-char")) };
  }

  const parts = original.split(/(\s+)/);
  parts.forEach((p) => {
    if (/\s+/.test(p)) frag.appendChild(document.createTextNode(p));
    else {
      const word = wrapWord("");
      Array.from(p).forEach((c) => word.appendChild(wrapChar(c)));
      frag.appendChild(word);
    }
  });
  el.replaceChildren(frag);
  el.dataset.splitApplied = "1";
  return {
    words: Array.from(el.querySelectorAll(".split-word")),
    chars: Array.from(el.querySelectorAll(".split-char")),
  };
}

const BenefitSection = () => {
  const sectionRef = useRef(null);
  const videoPinRef = useRef(null);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const [lists, setLists] = useState(nutrientLists);
  const [startIndex, setStartIndex] = useState(0);
  useEffect(() => {
    // after first paint
    requestAnimationFrame(() => ScrollTrigger.refresh());

    // when fonts are ready (layout can change)
    if (document?.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    // on full page load
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);
  // keep 3 visible on mobile (rotating window), full list on desktop
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

  // mobile auto-advance
  useEffect(() => {
    if (!isMobile || nutrientLists.length <= 3) return;
    const id = setInterval(() => {
      setStartIndex((prev) => (prev + 1) % nutrientLists.length);
    }, 3000);
    return () => clearInterval(id);
  }, [isMobile]);

  useGSAP(
    (context) => {
      const $ = context.selector;

      /* -------------------------------------------------------
         Generic "appear/disappear" text reveal (batching)
         Opt-in via .reveal-fade
      ------------------------------------------------------- */
      ScrollTrigger.batch(".reveal-fade", {
        start: "top 85%",
        end: "bottom 15%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: { each: 0.06, from: "start" },
          }),
        onLeave: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 8,
            duration: 0.35,
            ease: "power1.out",
          }),
        onEnterBack: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: "power2.out",
            stagger: { each: 0.04, from: "end" },
          }),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: -8,
            duration: 0.35,
            ease: "power1.out",
          }),
      });

      gsap.set($(".reveal-fade"), { opacity: 0, y: 12 });

      /* -------------------------------------------------------
         Entrance motion for big ClipPath titles
         (works alongside the clip-path reveal)
      ------------------------------------------------------- */
      const bigs = [
        $(".first-title")?.[0],
        $(".second-title")?.[0],
        $(".third-title")?.[0],
        $(".fourth-title")?.[0],
      ].filter(Boolean);

      if (bigs.length) {
        gsap.set(bigs, { y: 18, scale: 0.985, filter: "blur(8px)", rotate: 0.8 });

        ScrollTrigger.batch(bigs, {
          start: "top 78%",
          end: "bottom 22%",
          onEnter: (els) =>
            gsap.to(els, {
              y: 0,
              scale: 1,
              rotate: 0,
              filter: "blur(0px)",
              duration: 0.9,
              ease: "power3.out",
              stagger: { each: 0.12, from: "start" },
            }),
          onLeave: (els) =>
            gsap.to(els, {
              y: -10,
              scale: 0.992,
              rotate: -0.4,
              filter: "blur(4px)",
              duration: 0.45,
              ease: "power1.out",
            }),
          onEnterBack: (els) =>
            gsap.to(els, {
              y: 0,
              scale: 1,
              rotate: 0,
              filter: "blur(0px)",
              duration: 0.6,
              ease: "power3.out",
              stagger: { each: 0.08, from: "end" },
            }),
          onLeaveBack: (els) =>
            gsap.to(els, {
              y: 18,
              scale: 0.985,
              rotate: 0.8,
              filter: "blur(8px)",
              duration: 0.4,
              ease: "power1.out",
            }),
        });
      }

      /* -------------------------------------------------------
         Title clip-path/opacity reveal timeline (original)
      ------------------------------------------------------- */
      const revealTl = gsap.timeline({
        delay: 0.2,
        scrollTrigger: {
          trigger: $(".benefit-section"),
          start: "top 65%",
          end: "top top",
          scrub: 1,
        },
      });

      revealTl
        .to($(".first-title"), {
          duration: 0.7,
          opacity: 1,
          clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
          ease: "circ.out",
        })
        .to($(".second-title"), {
          duration: 0.7,
          opacity: 1,
          clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
          ease: "circ.out",
        })
        .to($(".third-title"), {
          duration: 0.7,
          opacity: 1,
          clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
          ease: "circ.out",
        })
        .to($(".fourth-title"), {
          duration: 0.7,
          opacity: 1,
          clipPath: "polygon(0% 0%, 100% 0, 100% 100%, 0% 100%)",
          ease: "circ.out",
        });

      /* -------------------------------------------------------
         Word/char animations
      ------------------------------------------------------- */
      // Intro paragraph — words cascade
      const introEl = $(".benefit-intro")?.[0];
      if (introEl) {
        const { nodes: words = [] } = splitText(introEl, "words");
        gsap.from(words, {
          scrollTrigger: {
            trigger: introEl,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          stagger: 0.03,
        });
      }

      // Buttons — chars pop
      const btnEls = Array.from(document.querySelectorAll(".btn-text"));
      btnEls.forEach((el) => {
        const { nodes: chars = [] } = splitText(el, "chars");
        gsap.from(chars, {
          scrollTrigger: {
            trigger: el.closest(".nutrition-box") || el,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
          yPercent: 110,
          opacity: 0,
          duration: 0.55,
          ease: "back.out(2)",
          stagger: 0.012,
        });
      });

      // “And much more …” — words float
      const moreEl = $(".benefit-more")?.[0];
      if (moreEl) {
        const { nodes: words = [] } = splitText(moreEl, "words");
        gsap.from(words, {
          scrollTrigger: {
            trigger: moreEl,
            start: "top 92%",
            toggleActions: "play none none reverse",
          },
          y: 14,
          opacity: 0,
          duration: 0.55,
          ease: "power2.out",
          stagger: 0.06,
        });
      }

      // Subtle desktop float for the four titles
      ScrollTrigger.matchMedia({
        "(min-width: 769px)": () => {
          const targets = [
            $(".first-title")?.[0],
            $(".second-title")?.[0],
            $(".third-title")?.[0],
            $(".fourth-title")?.[0],
          ].filter(Boolean);

          if (targets.length) {
            gsap.fromTo(
              targets,
              { y: (i) => (i % 2 === 0 ? -14 : 14), rotation: (i) => (i % 2 === 0 ? 1 : -1) },
              {
                y: 0,
                rotation: 0,
                ease: "none",
                scrollTrigger: {
                  trigger: $(".benefit-section"),
                  start: "top 70%",
                  end: "bottom 25%",
                  scrub: 0.6,
                },
              }
            );
          }
        },
      });
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <section ref={sectionRef} className="benefit-section">
      {/* helper styles */}
      <style>{`
        .split-word, .split-char { display:inline-block; will-change: transform, opacity; }
        .reveal-fade { opacity: 0; transform: translateY(12px); will-change: transform, opacity; }
        .big-title { will-change: transform, filter; }
      `}</style>

      <div className="mx-auto w-full max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-16 md:pt-20">
        {/* Buttons row */}
        <div className="nutrition-box">
          <div className="flex items-center justify-between flex-wrap gap-3 px-1 sm:px-2">
            <Link
              to="/bmi"
              className="pointer-events-auto rounded-full font-bold uppercase whitespace-nowrap
                         bg-light-brown text-dark-brown
                         px-6 py-2.5 text-lg
                         shadow-sm hover:shadow-md transition
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300
                         disabled:opacity-50 disabled:cursor-not-allowed reveal-fade"
              aria-label="Open BMI Calculator"
            >
              <span className="btn-text">BMI Calculator</span>
            </Link>

            <Link
              to="/dosha"
              onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              className="pointer-events-auto rounded-full font-bold uppercase whitespace-nowrap
                         bg-light-brown text-dark-brown
                         px-6 py-2.5 text-lg
                         shadow-sm hover:shadow-md transition
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-300
                         disabled:opacity-50 disabled:cursor-not-allowed reveal-fade"
              aria-label="Open Dosha Test"
              type="button"
            >
              <span className="btn-text">Dosha Test</span>
            </Link>
          </div>
        </div>

        {/* Copy */}
        <div className="col-center mt-8 text-center">
          <p className="benefit-intro mx-auto max-w-2xl leading-relaxed text-base sm:text-lg reveal-fade">
            The Power of Remedies <br />
            Explore the Key Benefits of Baba Ji Ki Buti
          </p>

          {/* Titles */}
          <div className="mt-12 sm:mt-16 grid gap-3 sm:gap-4 place-items-center">
            <ClipPathTitle
              title="जड़ी-बूटियां"
              color="#faeade"
              bg="#c88e64"
              className="first-title big-title"
              borderColor="#222123"
            />
            <ClipPathTitle
              title="Modern + Wellness"
              color="#222123"
              bg="#faeade"
              className="second-title big-title"
              borderColor="#222123"
            />
            <ClipPathTitle
              title="प्राचीन-ज्ञान"
              color="#faeade"
              bg="#7F3B2D"
              className="third-title big-title"
              borderColor="#222123"
            />
            <ClipPathTitle
              title="Power of Ayurveda"
              color="#2E2D2F"
              bg="#FED775"
              className="fourth-title big-title"
              borderColor="#222123"
            />
          </div>

          <div className="mt-8 sm:mt-10">
            <p className="benefit-more text-base sm:text-lg reveal-fade">And much more ...</p>
          </div>
        </div>
      </div>

     {/* Pinned video section */}
<div
  ref={videoPinRef}
  className={`relative vd-pin-section mt-18 md:mt-24 ${isMobile ? "px-4 py-12" : ""}`}
  style={
    isMobile
      ? {
          minHeight: "120vh",
          width: "100%",          // no full-bleed on mobile so padding is visible
          marginLeft: 0,
        }
      : {
          minHeight: "120vh",
          width: "100vw",         // keep full-bleed for md+
          marginLeft: "calc(-50vw + 50%)",
        }
  }
>
  <VideoPinSection />
</div>  


    </section>
  );
};

export default BenefitSection;
