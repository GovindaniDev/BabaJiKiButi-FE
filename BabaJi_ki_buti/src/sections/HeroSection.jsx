// HeroSection.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
// NOTE: SplitText is a GSAP bonus plugin. It may be undefined in OSS builds.
// We will guard its usage so the hero still works without it.
// import { SplitText } from "gsap/all";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

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
      // Useful console to diagnose 401/proxy issues without killing UI
      const txt = await res.text().catch(() => "");
      console.warn("[HeroSection] /api/announcements failed:", res.status, res.statusText, txt);
      return null;
    }
    const json = await res.json().catch(() => null);
    // unwrap {data}/{result} if backend wraps payloads
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
      // a.startAt/a.endAt may be ISO Instant (UTC) like "2025-11-04T09:30:00Z"
      // or may be empty/null (means open window).
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

/* ---------------- presentational ticker ---------------- */
export const InfiniteNewsTicker = ({ announcements = [], speedSec = 35, className = "" }) => {
  if (!announcements?.length) return null;

  return (
    <div
      className={
        "fixed top-0 left-0 right-0 z-40 w-full bg-gradient-to-r from-[#d4a574] via-[#c69463] to-[#d4a574] overflow-hidden " +
        className
      }
      style={{ ["--ticker-speed"]: `${speedSec}s` }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#d4a574] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#d4a574] to-transparent z-10 pointer-events-none" />

      <div className="relative flex h-8 md:h-10 items-center">
        <div className="flex animate-scroll whitespace-nowrap">
          {announcements.map((a, i) => (
            <div key={`s1-${i}`} className="inline-flex items-center mx-4 md:mx-6">
              <span className="text-white font-bold text-[10px] md:text-sm drop-shadow-md">{a}</span>
            </div>
          ))}
        </div>
        <div className="flex animate-scroll whitespace-nowrap" aria-hidden="true">
          {announcements.map((a, i) => (
            <div key={`s2-${i}`} className="inline-flex items-center mx-4 md:mx-6">
              <span className="text-white font-bold text-[10px] md:text-sm drop-shadow-md">{a}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-scroll {
          animation: scroll var(--ticker-speed, ${speedSec}s) linear infinite;
        }
      `}</style>
    </div>
  );
};

/* ---------------- hero (no /api/hero) ---------------- */
const HeroSection = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });

  // GSAP-scoped refs
  const rootRef = useRef(null);
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const titleRef = useRef(null);
  const textScrollRef = useRef(null);

  // Local, static hero content (no API)
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
        mobileImage: "/images/bg-mobile.png",
      },
    }),
    []
  );

  // Ticker from backend
  const [ticker, setTicker] = useState({ enabled: true, speedSec: 35, announcements: [] });

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const api = await fetchAnnouncements(ac.signal);
      if (api) {
        setTicker(toTickerView(api));
      } else {
        // Soft fallback so the page isn’t empty if API is protected/offline
        setTicker((t) => ({
          ...t,
          announcements: t.announcements?.length ? t.announcements : [],
        }));
      }
    })();
    return () => ac.abort();
  }, []);

  // Animations (safe if SplitText is missing)
  useGSAP(
    () => {
      try {
        const maybeSplitText = (gsap?.plugins && gsap.plugins.SplitText) || undefined;
        const canSplit = maybeSplitText && typeof maybeSplitText.create === "function";

        const tl = gsap.timeline({ delay: 0.6 });
        tl.to(contentRef.current, { opacity: 1, y: 0, ease: "power1.inOut", duration: 0.8 })
          .to(
            textScrollRef.current,
            { duration: 1, clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", ease: "circ.out" },
            "-=0.5"
          );

        if (canSplit && titleRef.current) {
          const split = maybeSplitText.create(titleRef.current, { type: "chars" });
          tl.from(split.chars, { yPercent: 200, stagger: 0.02, ease: "power2.out" }, "-=0.5");
        }

        gsap
          .timeline({
            scrollTrigger: { trigger: containerRef.current, start: "1% top", end: "bottom top", scrub: true },
          })
          .to(containerRef.current, { rotate: 7, scale: 0.9, yPercent: 30, ease: "power1.inOut" });
      } catch (e) {
        console.warn("[HeroSection] GSAP animation error:", e);
      }
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="bg-main-bg pt-8 md:pt-10"
      style={{ ["--ticker-speed"]: `${ticker.speedSec || 35}s` }}
    >
      {/* Ticker from backend only */}
      {ticker.enabled && (
        <InfiniteNewsTicker announcements={ticker.announcements} speedSec={ticker.speedSec} />
      )}

      <div ref={containerRef} className="hero-container relative">
        {isTablet ? (
          <>
            {isMobile && (
              <img
                src={hero.media.mobileImage}
                alt=""
                className="absolute bottom-40 w-full h-full object-cover"
              />
            )}
            <img
              src={hero.media.mobileImage}
              alt=""
              className="absolute bottom-0 left-1/2 -translate-x-1/2 object-auto"
            />
          </>
        ) : (
          <video
            src={hero.media.desktopVideo}
            autoPlay
            muted
            playsInline
            loop
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        <div ref={contentRef} className="hero-content relative z-10 opacity-0 translate-y-4">
          <div className="overflow-hidden">
            <h1 ref={titleRef} className="hero-title">
              {hero.title}
            </h1>
          </div>

          <div
            ref={textScrollRef}
            style={{ clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)" }}
            className="hero-text-scroll"
          >
            <div className="hero-subtitle">
              <h1>{hero.subtitle}</h1>
            </div>
          </div>

          <h2>{hero.tagline}</h2>

          <button
            onClick={() => (window.location.href = hero.ctaHref)}
            className="md:mt-16 mt-10 text-dark-brown bg-light-brown uppercase font-bold text-lg rounded-full md:p-5 p-3 md:px-16 px-10"
          >
            {hero.ctaText}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
