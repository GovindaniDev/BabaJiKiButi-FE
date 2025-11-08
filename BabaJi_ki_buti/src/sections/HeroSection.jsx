import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import { ScrollSmoother, ScrollTrigger } from "gsap/all";
import { SplitText } from "gsap/all";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMediaQuery } from "react-responsive";


gsap.registerPlugin(ScrollTrigger, ScrollSmoother);


/* ---------------- auth + fetch helpers ---------------- */
function getAuthHeaders() {
  const headers = {};
  const token =
    (typeof localStorage !== "undefined" && localStorage.getItem("accessToken")) ||
    (typeof sessionStorage !== "undefined" && sessionStorage.getItem("accessToken")) ||
    (typeof window !== "undefined" && window.AUTH_TOKEN);
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function fetchAnnouncements(signal) {
  try {
    const res = await fetch("/api/announcements", {
      credentials: "include",
      headers: { ...getAuthHeaders() },
      signal,
    });
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn("[HeroSection] /api/announcements failed:", res.status, res.statusText, txt);
      return null;
    }
    const json = await res.json().catch(() => null);
    if (json && typeof json === "object") {
      if ("data" in json) return json.data;
      if ("result" in json) return json.result;
    }
    return json;
  } catch (e) {
    console.warn("[HeroSection] fetchAnnouncements error:", e);
    return null;
  }
}

/* ---------------- ticker view helpers ---------------- */
function toTickerView(api) {
  const now = new Date();
  const items = Array.isArray(api?.items) ? api.items : [];
  const isTicker = (c) => (c || "").toString().toLowerCase() === "ticker";

  const announcements = items
    .filter((a) => isTicker(a.channel))
    .filter((a) => !!a.active)
    .filter((a) => {
      const okStart = a.startAt ? new Date(a.startAt) <= now : true;
      const okEnd = a.endAt ? new Date(a.endAt) >= now : true;
      return okStart && okEnd;
    })
    .sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5))
    .map((a) => `${a.emoji ? `${a.emoji} ` : ""}${a.message}`);

  return {
    enabled: api?.ticker?.enabled ?? true,
    speedSec: api?.ticker?.speedSec ?? 35,
    announcements,
  };
}
/* ---------------- Infinite top news ticker ---------------- */
export const InfiniteNewsTicker = ({ announcements = [], speedSec = 35, className = "" }) => {
  if (!announcements?.length) return null;

  return (
    <div
      className={
        "fixed top-0 left-0 right-0 z-50 w-full bg-gradient-to-r from-[#d4a574] via-[#c69463] to-[#d4a574] overflow-hidden " +
        className
      }
      style={{ ["--ticker-speed"]: `${speedSec}s` }}
    >
      <div className="relative h-8 md:h-10">
        <div className="absolute inset-0">
          <div className="ticker-track h-full flex items-center whitespace-nowrap will-change-transform">
            {/* copy A */}
            <div className="ticker-seg flex items-center">
              {announcements.map((a, i) => (
                <div key={`t1-${i}`} className="inline-flex items-center mx-4 md:mx-6">
                  <span className="text-white font-bold text-[10px] md:text-sm drop-shadow-md">
                    {a}
                  </span>
                </div>
              ))}
            </div>
            {/* copy B (duplicate) */}
            <div className="ticker-seg flex items-center" aria-hidden="true">
              {announcements.map((a, i) => (
                <div key={`t2-${i}`} className="inline-flex items-center mx-4 md:mx-6">
                  <span className="text-white font-bold text-[10px] md:text-sm drop-shadow-md">
                    {a}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .ticker-track { animation: ticker-scroll var(--ticker-speed, ${speedSec}s) linear infinite; }
        @keyframes ticker-scroll {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .ticker-track { animation: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
};

/* ---------------- Bottom category ribbon (infinite) ---------------- */
function CategoryRibbon({ categories, onPick }) {
  const maskRef = useRef(null);
  const [segPx, setSegPx] = useState(800);
  const [dur, setDur] = useState(18);
  const PX_PER_SEC = 80;
  const [restartKey, setRestartKey] = useState(0);

  const Item = ({ c }) => {
    const name = (c?.name ?? "").replace(/\s*\n+\s*/g, " ");
    return (
      <a
        href={c.path}
        onClick={(e) => {
          e.preventDefault();
          onPick?.(name);
          window.scrollTo({ top: 0, behavior: "smooth" });
          setTimeout(() => (window.location.href = c.path), 80);
        }}
        className="relative min-w-[220px] max-w-[320px]
                   inline-flex items-center gap-4 rounded-2xl px-4 py-3
                   transition-transform duration-300 hover:-translate-y-1 hover:scale-[1.03]"
      >
        <span className="shrink-0 grid place-items-center rounded-full h-16 w-16">
          <img src={c.icon} alt="" className="object-contain h-12 w-12" draggable={false} />
        </span>
        <div className="min-w-0 w-full self-center">
          <div
            className="text-base font-extrabold text-[#4b3626] leading-snug whitespace-normal break-words hyphens-auto"
            style={{ wordBreak: "break-word" }}
          >
            {name}
          </div>
        </div>
      </a>
    );
  };

  const Spacer = () => <div className="w-[12vw] sm:w-[10vw] md:w-[8vw] lg:w-[6vw] xl:w-[5vw]" aria-hidden />;

  const SetRow = ({ measure = false }) => (
    <div className="inline-flex items-center gap-10 md:gap-12 xl:gap-16" {...(measure ? { "data-measure": true } : {})}>
      <Spacer />
      {categories.map((c, i) => (
        <Item key={(measure ? "m-" : "r-") + i} c={c} />
      ))}
      <Spacer />
    </div>
  );

  useEffect(() => {
    const el = maskRef.current;
    if (!el) return;
    const temp = el.querySelector("[data-measure]");
    if (!temp) return;

    const update = () => {
      const width = Math.round(temp.scrollWidth || 0);
      if (width > 0) {
        setSegPx(width);
        setDur(Math.max(8, width / PX_PER_SEC));
        setRestartKey((k) => k + 1);
      }
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(temp);
    return () => ro.disconnect();
  }, [categories]);

  return (
    <div className="fixed bottom-4 left-0 w-full z-[60] py-4 md:py-5">
      <div className="mx-auto w-full px-4">
        <div
          ref={maskRef}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r
                     from-[#fff3e2]/60 via-[#fde7cd]/60 to-[#fff3e2]/60 backdrop-blur-md"
          style={{
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
            maskImage:
              "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
            ["--segpx"]: `${segPx}px`,
            ["--dur"]: `${dur}s`,
          }}
        >
          {/* hidden measure row */}
          <div className="absolute -z-10 opacity-0 pointer-events-none">
            <SetRow measure />
          </div>

          {/* animated: three sets back-to-back */}
          <div key={restartKey} className="marquee-track inline-flex will-change-transform">
            <SetRow />
            <SetRow />
            <SetRow />
          </div>
        </div>
      </div>

      <style>{`
        .marquee-track { animation: slide-left var(--dur, 18s) linear infinite; }
        @keyframes slide-left {
          0%   { transform: translate3d(0,0,0); }
          100% { transform: translate3d(calc(-1 * var(--segpx, 800px)), 0, 0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track { animation: none !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

const HeroSection = () => {

 

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const isTablet = useMediaQuery({
    query: "(max-width: 1024px)",
  });
   const rootRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const textScrollRef = useRef(null);

  // NEW: single source of truth for media
  const videoRef = useRef(null);
  const [useImage, setUseImage] = useState(false); // false = show video, true = show image
  const [showRibbon, setShowRibbon] = useState(false);

 useEffect(() => {
    const t = setTimeout(() => setShowRibbon(true), 8000);
    return () => clearTimeout(t);
  }, []);
  const hero = useMemo(
    () => ({
      title: "babaji ki buti",
      subtitle: "Health + Wellness",
      tagline:
        "बाबा जी की बूटी: हिमालयन शिलाजीत—ज़ोरदार ऊर्जा, दमदार स्टैमिना, दिमाग़ की तेज़ी।",
      ctaText: "Shop Now",
      ctaHref: "/shop",
      media: {
        desktopVideo: "/videos/hero-bg.mp4",
        desktopPoster: "/images/hero-desktop-poster.jpg", // optional; not shown unless <video> needs it
        desktopFallback: "/images/static-img.png",
        mobileImage: "/images/bg-mobile.png",
      },
    }),
    []
  );

  const categories = [
    { name: "Energy & Stamina", icon: "/images/c1.png", path: "/oil" },
    { name: "Pain Relief", icon: "/images/c2.png", path: "/rice" },
    { name: "Hair & Skin Care", icon: "/images/c3.png", path: "/jaggery" },
    { name: "Digestive Health", icon: "/images/c4.png", path: "/spices" },
    { name: "Men's Health", icon: "/images/c5.png", path: "/immunity" },
    { name: "Women's Health", icon: "/images/c6.png", path: "/breakfast-snacks" },
    { name: "Weight Management", icon: "/images/c7.png", path: "/grains-pulses" },
    { name: "Specialized Health", icon: "/images/c7.png", path: "/grains-pulses" },
    { name: "Nutritional Supplements", icon: "/images/c7.png", path: "/grains-pulses" },
    { name: "Immunity & General Wellness", icon: "/images/c7.png", path: "/grains-pulses" },
  ];



  useGSAP(() => {
    const titleSplit = SplitText.create(".hero-title", {
      type: "chars",
    });

    const tl = gsap.timeline({
      delay: 1,
    });

    tl.to(".hero-content", {
      opacity: 1,
      y: 0,
      ease: "power1.inOut",
    })
      .to(
        ".hero-text-scroll",
        {
          duration: 1,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "circ.out",
        },
        "-=0.5"
      )
      .from(
        titleSplit.chars,
        {
          yPercent: 200,
          stagger: 0.02,
          ease: "power2.out",
        },
        "-=0.5"
      );

    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-container",
        start: "1% top",
        end: "bottom top",
        scrub: true,
      },
    });
    heroTl.to(".hero-container", {
      rotate: 7,
      scale: 0.9,
      yPercent: 30,
      ease: "power1.inOut",
    });
  });


    function goToMessages() {
    const el = document.getElementById("category-messages");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  // news ticker
  const [ticker, setTicker] = useState({ enabled: true, speedSec: 35, announcements: [] });
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const api = await fetchAnnouncements(ac.signal);
      if (api) setTicker(toTickerView(api));
    })();
    return () => ac.abort();
  }, []);

  // If tablet or below, skip video entirely (your original behavior)
  useEffect(() => {
    if (isTablet) {
      setUseImage(true); // image only
      setShowRibbon(true);
    }
  }, [isTablet]);

  // Core: try autoplay immediately; only fallback to image if it fails or ends
  useEffect(() => {
    if (isTablet) return; // already using image
    const v = videoRef.current;
    if (!v) return;

    // Start with video visible; attempt to play
    let cancelled = false;
    (async () => {
      try {
        // Some browsers need a direct play() call even with autoPlay+muted
        const p = v.play();
        if (p && typeof p.then === "function") {
          await p;
        }
        if (!cancelled) {
          setUseImage(false); // confirm video mode
        }
      } catch (err) {
        // Autoplay blocked or error -> fallback
        if (!cancelled) setUseImage(true);
      }
    })();

    // If tab becomes visible later, try again (helps after refresh + background tab)
    const onVis = () => {
      if (document.visibilityState === "visible" && !isTablet) {
        v.play().catch(() => setUseImage(true));
      }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [isTablet]);
const didAnimRef = useRef(false);
  useGSAP(
  () => {
    // Guard for React 18 StrictMode double-invoke in dev
    if (didAnimRef.current) return;
    didAnimRef.current = true;

    try {
      // Initial states controlled by GSAP (not Tailwind)
      gsap.set(contentRef.current, { opacity: 0, y: 16, force3D: true });
      gsap.set(textScrollRef.current, {
        clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
        willChange: "clip-path",
        force3D: true,
      });

      // Entrance timeline
      const tl = gsap.timeline({ delay: 0.3, defaults: { ease: "power1.out" } });
      tl.to(contentRef.current, { opacity: 1, y: 0, duration: 0.6, overwrite: "auto" })
        .to(
          textScrollRef.current,
          {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
            duration: 0.9,
            ease: "circ.out",
            overwrite: "auto",
          },
          "-=0.3"
        );

      // Parallax / rotate on scroll (stable; no re-init)
      gsap.timeline({
        scrollTrigger: {
          id: "heroParallax",
          trigger: containerRef.current,
          start: "1% top",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: false,
        },
        defaults: { overwrite: "auto" },
      })
      .to(containerRef.current, {
        rotate: 7,
        scale: 0.9,
        yPercent: 30,
        ease: "none",
      });

      // After fonts/media load, refresh once (not many times)
      const onLoadOnce = () => ScrollTrigger.refresh();
      window.addEventListener("load", onLoadOnce, { once: true });
    } catch (e) {
      console.warn("[HeroSection] GSAP animation error:", e);
    }
  },
  { scope: rootRef, dependencies: [] } // explicit: run once
);
  return (
    <section className="bg-main-bg" ref={rootRef}> 
      <div ref={containerRef} className="hero-container"
       style={{ ["--ticker-speed"]: `${ticker.speedSec || 35}s` }}
      >
              {ticker.enabled && (
        <InfiniteNewsTicker announcements={ticker.announcements} speedSec={ticker.speedSec} />
      )}
        {isTablet ? (
          <>
           {isMobile && (
          <img
            src={hero.media.mobileImage}
            alt=""
            className="absolute bottom-40 w-full h-full object-cover pointer-events-none"
            style={{ opacity: 0.999 }} // ensure its own layer
          />
        )}
          
          </>
        ) : (
          <video
            ref={videoRef}
            src={hero.media.desktopVideo}
            
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => {
             
              setShowRibbon(true);
            }}
           
            onPlay={() => {
              // confirm video is active; keep ribbon timing independent
            }}
            className="absolute inset-0 w-full h-full object-cover gpu-smooth"
            tabIndex={-1}
            style={{
              opacity: useImage ? 0 : 1,
              transition: "opacity 200ms ease-out",
            }}
          />
        )}
        <div  className="hero-content opacity-0">
          <div className="overflow-hidden">
            <h1  className="hero-title">babaji ki buti</h1>
          </div>
          <div 
            style={{
              clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
            }}
            className="hero-text-scroll"
          >
            <div className="hero-subtitle">
              <h1>Health + Wellness </h1>
            </div>
          </div>

          <h2>
           बाबा जी की बूटी: हिमालयन शिलाजीत—ज़ोरदार ऊर्जा, दमदार स्टैमिना, दिमाग़ की तेज़ी।
          </h2>

          
            <button
    onClick={() => window.location.href = '/shop'}
   className="@apply md:mt-16 mt-10 text-dark-brown bg-light-brown uppercase font-bold text-lg rounded-full md:p-5 p-3 md:px-16 px-10;"
  >
    Shop Now
  </button>
        
        </div>
      </div>

      {/* Render ribbon outside transforms so it's truly fixed */}
      <div
        aria-hidden={!showRibbon}
        className={[
          "transition-all duration-700 ease-out",
          showRibbon ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none",
        ].join(" ")}
      >
        {showRibbon && <CategoryRibbon categories={categories} onPick={() => goToMessages()} />}
      </div>

      {/* GPU flicker guard */}
      <style>{`
        .gpu-smooth {
          will-change: opacity, transform;
          backface-visibility: hidden;
          transform: translateZ(0);
        }
      `}</style>
    </section>
  );
};

export default HeroSection;