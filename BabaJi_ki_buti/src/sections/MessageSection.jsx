// MembersExclusivePage.jsx
import React, { useState, useEffect, useRef } from "react";

import { Link} from "react-router-dom";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(ScrollTrigger, SplitText);

/* ---------------- Mini 212px Card Slideshow (self-contained) ---------------- */
function MiniCardSlider() {
  const SLIDE_MS = 4000;
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(0);
  const timer = useRef(null);

  const slides = [
    { id: 1, img: "/images/s2img1.webp", alt: "Festive Box Range" },
    { id: 2, img: "/images/s2img2.webp", alt: "Bachon Ki Diwali" },
    { id: 3, img: "/images/s2img3.webp", alt: "Hum Aapka Khana" },
  ];

  useEffect(() => { slides.forEach(s => { const im = new Image(); im.src = s.img; }); }, []);

  const next = (d = 1) => { setDir(d); setIdx(p => (p + d + slides.length) % slides.length); };
  const goTo = (i) => { if (i !== idx) next(i > idx ? 1 : -1); };

  useEffect(() => { clearTimeout(timer.current); timer.current = setTimeout(() => next(1), SLIDE_MS); return () => clearTimeout(timer.current); }, [idx]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d) => ({ x: d < 0 ? 200 : -200, opacity: 0 }),
  };

  return (
    <div className="relative rounded-3xl overflow-hidden">
      <div className="relative w-full aspect-[16/9]">
        <AnimatePresence custom={dir} initial={false}>
          <motion.img
            key={slides[idx].id}
            src={slides[idx].img}
            alt={slides[idx].alt}
            className="absolute inset-0 w-full h-full object-contain"
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    style={{ willChange: "transform, opacity" }}
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </AnimatePresence>
      </div>

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
        {slides.map((sl, i) => {
          const active = i === idx;
          return (
            <button
              key={sl.id}
              onClick={() => goTo(i)}
              aria-label={`Go to mini slide ${i + 1}`}
              className={`relative h-1.5 rounded-full transition-all ${active ? "w-6 bg-white/70" : "w-2.5 bg-white/40 hover:bg-white/60"}`}
            >
              {active && (
                <motion.span
                  key={`progress-${sl.id}-${idx}`}
                  className="absolute left-0 top-0 h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Second mini ---------------- */
function MiniCardSliderBottom() {
  const SLIDE_MS = 4000;
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(0);
  const timer = useRef(null);

  const slidesBottom = [
    { id: 1, img: "/images/s3img1.webp", alt: "Festive Box Range" },
    { id: 2, img: "/images/s3img2.webp", alt: "Bachon Ki Diwali" },
    { id: 3, img: "/images/s3img3.webp", alt: "Hum Aapka Khana" },
  ];

  useEffect(() => { slidesBottom.forEach(s => { const im = new Image(); im.src = s.img; }); }, []);

  const next = (d = 1) => { setDir(d); setIdx(p => (p + d + slidesBottom.length) % slidesBottom.length); };
  const goTo = (i) => { if (i !== idx) next(i > idx ? 1 : -1); };

  useEffect(() => { clearTimeout(timer.current); timer.current = setTimeout(() => next(1), SLIDE_MS); return () => clearTimeout(timer.current); }, [idx]);

  const variants = { enter: (d) => ({ x: d > 0 ? 200 : -200, opacity: 0 }), center: { x: 0, opacity: 1 }, exit: (d) => ({ x: d < 0 ? 200 : -200, opacity: 0 }) };

  return (
    <div className="relative rounded-3xl overflow-hidden">
      <div className="relative w-full aspect-[16/9]">
        <AnimatePresence custom={dir} initial={false}>
          <motion.img
            key={slidesBottom[idx].id}
            src={slidesBottom[idx].img}
            alt={slidesBottom[idx].alt}
            className="absolute inset-0 w-full h-full object-contain"
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                    style={{ willChange: "transform, opacity" }}
            loading="eager"
            decoding="async"
            draggable="false"
          />
        </AnimatePresence>
      </div>

      {/* dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm">
        {slidesBottom.map((sl, i) => {
          const active = i === idx;
          return (
            <button
              key={sl.id}
              onClick={() => goTo(i)}
              aria-label={`Go to mini slide ${i + 1}`}
              className={`relative h-1.5 rounded-full transition-all ${active ? "w-6 bg-white/70" : "w-2.5 bg-white/40 hover:bg-white/60"}`}
            >
              {active && (
                <motion.span
                  key={`progress-${sl.id}-${idx}`}
                  className="absolute left-0 top-0 h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

  

/* ------------------------------ MAIN PAGE --------------------------------- */
export default function MembersExclusivePage() {
  const pageRef = useRef(null);

  // Left big hero slideshow (uses your banner images)
  const offers = [
    { id: 1, img: "/images/s1img1.webp", alt: "Collective – 12% Off" },
    { id: 2, img: "/images/simg1.webp",  alt: "Members Exclusive – Free Atta & Truemato" },
    { id: 3, img: "/images/simg2.webp",  alt: "GST Price Drop – Products" },
    { id: 4, img: "/images/simg3.webp",  alt: "Bigger the Cart – Free Truemato" },
    { id: 5, img: "/images/simg4.webp",  alt: "Diwali Specials – 15% + 20%" },
    { id: 6, img: "/images/simg5.webp",  alt: "GST Price Drop – Ghee" },
  ];
  const DURATION_MS = 5000;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef(null);

  // preload
  useEffect(() => { offers.forEach(o => { const img = new Image(); img.src = o.img; }); }, []);

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir) => ({ x: dir < 0 ? 300 : -300, opacity: 0 }),
  };

  const paginate = (dir) => { setDirection(dir); setCurrentSlide(prev => (prev + dir + offers.length) % offers.length); };
  const goToSlide = (i) => { if (i !== currentSlide) { setDirection(i > currentSlide ? 1 : -1); setCurrentSlide(i); } };

  useEffect(() => { clearTimeout(timeoutRef.current); timeoutRef.current = setTimeout(() => paginate(1), DURATION_MS); return () => clearTimeout(timeoutRef.current); }, [currentSlide]);

  /* ------------------------------ GSAP (scoped) ----------------------------- */
  useGSAP(
    (context) => {
      const q = context.selector;
      const titleEl = q(".me-title")[0];
      const lovedEl = q(".me-loved")[0];
      const paraEl  = q(".me-para p")[0];

      const titleSplit = titleEl ? new SplitText(titleEl, { type: "words" }) : null;
      const lovedSplit = lovedEl ? new SplitText(lovedEl, { type: "words" }) : null;
      const paraSplit  = paraEl  ? new SplitText(paraEl,  { type: "words,lines", linesClass: "me-line" }) : null;

      if (titleSplit) {
        gsap.to(titleSplit.words, {
          color: "#faeade",
          ease: "power1.in",
          stagger: 0.08,
          scrollTrigger: { trigger: q(".me-hero"), start: "top 70%", end: "top 30%", scrub: true },
        });
      }

      gsap.fromTo(
        q(".me-hero-clip"),
        { clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)" },
        {
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "circ.inOut",
          duration: 1,
          immediateRender: false,
          scrollTrigger: { trigger: q(".me-hero"), start: "top 75%" },
        }
      );

      if (paraSplit) {
        gsap.from(paraSplit.words, {
          yPercent: 300,
          rotate: 3,
          ease: "power1.inOut",
          duration: 1,
          stagger: 0.01,
          scrollTrigger: { trigger: q(".me-para"), start: "top 80%" },
        });
      }

      gsap.fromTo(
        q(".me-products"),
        { y: 40, opacity: 0.6 },
        { y: 0, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: q(".me-hero"), start: "top 65%", end: "top 20%", scrub: true } }
      );

      gsap.from(q(".me-dots button"), {
        scale: 0.6,
        opacity: 0,
        ease: "back.out(1.6)",
        stagger: 0.08,
        scrollTrigger: { trigger: q(".me-hero"), start: "top 70%" },
      });

      gsap.from(q(".me-cta"), {
        y: 20,
        opacity: 0,
        ease: "power2.out",
        scrollTrigger: { trigger: q(".me-hero"), start: "top 70%" },
      });

      if (lovedSplit) {
        gsap.to(lovedSplit.words, {
          color: "#b83428",
          ease: "power1.in",
          stagger: 0.07,
          scrollTrigger: { trigger: q(".me-loved-wrap"), start: "top 80%", end: "top 40%", scrub: true },
        });
      }

      requestAnimationFrame(() => ScrollTrigger.refresh());

      return () => {
        titleSplit?.revert();
        lovedSplit?.revert();
        paraSplit?.revert();
        ScrollTrigger.getAll().forEach(t => t.kill());
        gsap.set(context.selector("*"), { clearProps: "all" });
      };
    },
    { scope: pageRef }
  );



  /* ---------------------------------- UI ---------------------------------- */
  return (
    <div ref={pageRef} className="me-page relative z-[1] isolate bg-[#aa7a4f] pt-[72px]">
      <div className="max-w-[1600px] mx-auto px-4 py-8 mt-8 me-loved-wrap">
         <div className="w-full bg-[#aa7a4f] py-6">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 me-hero">
            {/* LEFT: Big hero slider */}
            <div className="lg:col-span-2 relative rounded-3xl overflow-hidden me-hero-clip">
              <div className="relative w-full aspect-video min-h-[320px] lg:min-h-[420px]">
                <AnimatePresence custom={direction} initial={false}>
                  <motion.img
                    key={offers[currentSlide].id}
                    src={offers[currentSlide].img}
                    alt={offers[currentSlide].alt}
                    className="absolute inset-0 w-full h-full object-contain object-center pointer-events-none"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.25 } }}
                    style={{ willChange: "transform, opacity" }}
                    loading="eager"
                    decoding="async"
                    fetchpriority="high"
                    draggable="false"
                  />
                </AnimatePresence>

                {/* Dots for big hero */}
                <div className="me-dots absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-2 rounded-full bg-black/30 backdrop-blur-sm">
                  {offers.map((o, i) => {
                    const isActive = i === currentSlide;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => goToSlide(i)}
                        aria-label={`Go to slide ${i + 1}`}
                        className={`relative h-2 rounded-full overflow-hidden transition-all ${isActive ? "w-8 bg-white/20" : "w-3 bg-white/40 hover:bg-white/60"}`}
                        style={{ WebkitTapHighlightColor: "transparent" }}
                      >
                        {isActive && (
                          <motion.span
                            key={`progress-${o.id}-${currentSlide}`}
                            className="absolute left-0 top-0 h-full bg-white"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ duration: DURATION_MS / 1000, ease: "linear" }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT column: two stacked mini slides */}
            <div className="lg:col-span-1 space-y-6">
              <MiniCardSlider />
              <MiniCardSliderBottom />
            </div>
          </div>
        </div>

       

        {/* CTA */}
        
      </div>
        </div>
      {/* HERO: left big slider + right two minis */}
      
    </div>
  );
}
