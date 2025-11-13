// FlavorSlider.jsx
import { useGSAP } from "@gsap/react";
import { flavorlists } from "../constants";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import { useMediaQuery } from "react-responsive";
import { Link } from "react-router-dom";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

/* -------- Theme presets -------- */
const THEME = {
  black: {
    from: "#F8D37C",
    to: "#E6B45C",
    text: "#1A1400",
    border: "#E6B45C",
    ring: "rgba(230,180,92,.45)",
    glow: "rgba(230,180,92,.55)",
    glowH: "rgba(230,180,92,.85)",
  },
  green: {
    from: "#A7F3D0",
    to: "#34D399",
    text: "#052B11",
    border: "#34D399",
    ring: "rgba(52,211,153,.35)",
    glow: "rgba(16,185,129,.45)",
    glowH: "rgba(16,185,129,.80)",
  },
  darkGreen: {
    from: "#34D399",
    to: "#059669",
    text: "#03170C",
    border: "#059669",
    ring: "rgba(5,150,105,.35)",
    glow: "rgba(4,120,87,.45)",
    glowH: "rgba(4,120,87,.80)",
  },
  maroon: {
    from: "#FF9EB2",
    to: "#FF5C7A",
    text: "#FFFFFF",
    border: "#FF6B88",
    ring: "rgba(255,92,122,.35)",
    glow: "rgba(255,92,122,.50)",
    glowH: "rgba(255,92,122,.85)",
  },
  blue: {
    from: "#8EC5FF",
    to: "#3EA1FF",
    text: "#FFFFFF",
    border: "#3EA1FF",
    ring: "rgba(62,161,255,.35)",
    glow: "rgba(62,161,255,.50)",
    glowH: "rgba(62,161,255,.85)",
  },
  gold: {
    from: "#FFD54D",
    to: "#FFC107",
    text: "#1A1400",
    border: "#FFC107",
    ring: "rgba(255,193,7,.35)",
    glow: "rgba(255,193,7,.50)",
    glowH: "rgba(255,193,7,.85)",
  },
};

/* ---------- Aliases ---------- */
const COLOR_ALIASES = [
  [/^(black|dark|charcoal|graphite|onyx)$/i, "black"],
  [/^(green|mint|lime|jade|olive)$/i, "green"],
  [/^(dark\s*green|forest|evergreen|pine|emerald)$/i, "darkGreen"],
  [/^(maroon|crimson|rose|pink|burgundy|wine|magenta|red)$/i, "maroon"],
  [/^(blue|navy|sky|azure|indigo|cyan)$/i, "blue"],
  [/^(gold|amber|yellow|mustard)$/i, "gold"],
];

/* ---------- Color parsers ---------- */
function hexToRgb(hex) {
  const h = hex.replace("#", "").trim();
  if (h.length === 3) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}
function parseRgb(s) {
  const m = s.match(
    /rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+)?\s*\)/i
  );
  return m ? { r: +m[1], g: +m[2], b: +m[3] } : null;
}
function parseHsl(s) {
  const m = s.match(
    /hsla?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%(?:\s*,\s*[\d.]+)?\s*\)/i
  );
  return m ? { h: +m[1], s: +m[2], l: +m[3] } : null;
}
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  let h, s;
  const l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}
function classifyByHsl({ h, s, l }) {
  if (l <= 14) return "black";
  if (h >= 40 && h <= 70) return "gold";
  if (h > 70 && h <= 170) return "green";
  if (h > 170 && h <= 270) return "blue";
  return "maroon";
}

/* ---------- Normalization ---------- */
function normalizeThemeKey(raw) {
  const v = String(raw || "").trim();
  if (!v) return "";

  if (THEME[v]) return v;
  if (/^dark\s*green$/i.test(v)) return "darkGreen";

  for (const [re, key] of COLOR_ALIASES) if (re.test(v)) return key;

  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
    const rgb = hexToRgb(v);
    if (rgb) return classifyByHsl(rgbToHsl(rgb.r, rgb.g, rgb.b));
  }
  if (/rgba?\s*\(/i.test(v)) {
    const rgb = parseRgb(v);
    if (rgb) return classifyByHsl(rgbToHsl(rgb.r, rgb.g, rgb.b));
  }
  if (/hsla?\s*\(/i.test(v)) {
    const hsl = parseHsl(v);
    if (hsl) return classifyByHsl(hsl);
  }
  return "";
}

/* ---------- SEQUENCE ---------- */
const SEQUENCE = ["black", "green", "darkGreen", "maroon", "darkGreen", "blue"];

function themeFor(flavor, idx = 0) {
  const explicit =
    flavor.themeKey ||
    flavor.color ||
    flavor.theme ||
    flavor.accent ||
    flavor.primaryColor ||
    flavor.bg ||
    flavor.bgColor ||
    flavor.cardColor ||
    flavor.tint ||
    "";

  let key = normalizeThemeKey(explicit);
  if (!key) key = SEQUENCE[idx % SEQUENCE.length];
  if (!THEME[key]) key = "gold";

  return { key, ...THEME[key] };
}

/* ---------- Per-theme button ---------- */
// change signature
function ThemeButton({ theme, to, label = "Buy Now", compact = false }) {
  const { key, from, to: toCol, text, border, ring, glow, glowH } = theme;

  // softer shadows for mobile
  const baseStyle = compact
    ? {
        boxShadow: `0 0 0 1px ${ring} inset, 0 4px 10px ${glow}`,
        filter: `drop-shadow(0 2px 6px ${glow})`,
        backgroundColor: "transparent",
      }
    : {
        boxShadow: `0 0 0 1px ${ring} inset, 0 10px 24px ${glow}, 0 0 22px ${glow}`,
        filter: `drop-shadow(0 6px 14px ${glow})`,
        backgroundColor: "transparent",
      };

  const onEnter = (e) => {
    if (compact) return; // no hover glow boost on mobile
    e.currentTarget.style.boxShadow = `0 0 0 1px ${ring} inset, 0 14px 32px ${glowH}, 0 0 28px ${glowH}`;
    e.currentTarget.style.filter = `drop-shadow(0 8px 18px ${glowH})`;
  };
  const onLeave = (e) => {
    e.currentTarget.style.boxShadow = baseStyle.boxShadow;
    e.currentTarget.style.filter = baseStyle.filter;
  };

  // handy size classes for compact mode
  const sizeCls = compact ? "px-4 py-2 text-sm rounded-lg" : "px-6 py-3 rounded-full text-base";

  // ↓ inside each return, replace hardcoded paddings/sizes with sizeCls
  // Example for one branch (do similarly in the other cases):
  switch (key) {
    case "black":
      return (
        <Link
          to={to}
          aria-label={label}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{ ...baseStyle, color: text, backgroundImage: `linear-gradient(90deg, ${from}, ${toCol})`, borderColor: border }}
          className={`relative group inline-flex items-center justify-center border-2 font-semibold tracking-wide transition-all duration-300 ${sizeCls} ${compact ? "" : "hover:scale-110 active:scale-95"}`}
        >
          <span className="relative z-[1]">Buy Now</span>
          {!compact && (
            <>
              <svg aria-hidden="true" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 5l7 7-7 7M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: "linear-gradient(75deg, rgba(255,255,255,.0) 30%, rgba(255,255,255,.25) 50%, rgba(255,255,255,.0) 70%)", transform: "translateX(-120%)", animation: "sheen 1s ease-in-out forwards" }} />
              <style>{`@keyframes sheen { to { transform: translateX(120%); } }`}</style>
            </>
          )}
        </Link>
      );
    case "green":
    case "darkGreen":
    case "maroon":
    case "blue":
    case "gold":
      return (
        <Link
          to={to}
          aria-label={label}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{ ...baseStyle, color: text, backgroundImage: `linear-gradient(90deg, ${from}, ${toCol})`, borderColor: border }}
          className={`relative group inline-flex items-center justify-center border-2 font-semibold tracking-wide transition-all duration-300 ${sizeCls} ${compact ? "" : "hover:scale-110 active:scale-95"}`}
        >
          <span className="relative z-[1]">{label}</span>
          {!compact && (
            <svg aria-hidden="true" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 5l7 7-7 7M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </Link>
      );
  }
}


const FlavorSlider = () => {
  const sliderRef = useRef();
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" }); // NEW
  useGSAP(() => {
    const scrollAmount = sliderRef.current.scrollWidth - window.innerWidth;

    if (!isTablet) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flavor-section",
          start: "2% top",
          end: `+=${scrollAmount * 2.0 + 1800}px`,  // Slower: increased multiplier and base
          scrub: 2.0,                                // Very smooth scrub
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
      .to(".first-text-split", { xPercent: -30, ease: "power1.inOut" })
      .to(".flavor-text-scroll", { xPercent: -22, ease: "power1.inOut" }, "<")
      .to(".second-text-split", { xPercent: -10, ease: "power1.inOut" }, "<");
  }, [isTablet]);

  return (
    <div ref={sliderRef} className="slider-wrapper">
      <div className="flavors">
        {flavorlists.map((flavor, i) => {
          const toHref = `/product/${flavor.slug || flavor.product}`;
          const t = themeFor(flavor, i);

          return (
            <div
              key={flavor.name || i}
              className={`relative z-30 lg:w-[50vw] w-96 lg:h-[70vh] md:w-[90vw] md:h-[50vh] h-80 flex-none ${flavor.rotation || ""} pb-16 md:pb-0`}
              data-theme-source={(
                flavor.themeKey ||
                flavor.color ||
                flavor.theme ||
                flavor.accent ||
                flavor.primaryColor ||
                flavor.bg ||
                flavor.bgColor ||
                flavor.cardColor ||
                flavor.tint ||
                ""
              ).toString()}
              data-theme-key={t.key}
            >
              {/* Decorative bg */}
              <img
                src={`/images/${flavor.product}-bg.svg`}
                alt=""
                className="absolute bottom-0 pointer-events-none select-none"
                draggable={false}
              />

              {/* Product image */}
              <img
                src={`/images/${flavor.product}-prodbg.webp`}
                alt=""
                className="drinks pointer-events-none h-[82%] select-none"
                draggable={false}
              />

              {/* Floating elements */}
              <img
                src={`/images/${(flavor.color || "").toString()}-elements.webp`}
                alt=""
                className="elements pointer-events-none select-none"
                draggable={false}
              />

              {/* Title
              <h1 className="relative z-30 mb-2 md:mb-0 leading-tight">
                {flavor.name}
              </h1> */}

              {/* Theme-aware button */}
             <div
  className={`z-40 ${
    isMobile
      ? "absolute top-17 left-5"       // ✅ inside frame top-left on mobile
      : isTablet
      ? "static mt-3"                  // unchanged for tablets
      : "absolute bottom-10 right-10"  // unchanged for desktop
  }`}
>
  <ThemeButton
    theme={t}
    to={toHref}
    label={`Buy now`}
    compact={isMobile}                 // ✅ softer shadows/smaller on mobile
  />
</div>

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlavorSlider;