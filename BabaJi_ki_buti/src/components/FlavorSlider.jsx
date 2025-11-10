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
function ThemeButton({ theme, to, label = "Buy Now" }) {
  const { key, from, to: toCol, text, border, ring, glow, glowH } = theme;

  const baseStyle = {
    boxShadow: `0 0 0 1px ${ring} inset, 0 10px 24px ${glow}, 0 0 22px ${glow}`,
    filter: `drop-shadow(0 6px 14px ${glow})`,
    backgroundColor: "transparent",
  };
  const onEnter = (e) => {
    e.currentTarget.style.boxShadow = `0 0 0 1px ${ring} inset, 0 14px 32px ${glowH}, 0 0 28px ${glowH}`;
    e.currentTarget.style.filter = `drop-shadow(0 8px 18px ${glowH})`;
  };
  const onLeave = (e) => {
    e.currentTarget.style.boxShadow = baseStyle.boxShadow;
    e.currentTarget.style.filter = baseStyle.filter;
  };

  const Arrow = (
    <svg aria-hidden="true" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13 5l7 7-7 7M5 12h14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const Leaf = (
    <svg aria-hidden="true" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 19c8-1 13-6 14-14 0 0-9 1-13 5S5 19 5 19Z" />
    </svg>
  );
  const Spark = (
    <svg aria-hidden="true" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
    </svg>
  );
  const Heart = (
    <svg aria-hidden="true" className="ml-2 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.1 21.35l-1.1-1.02C5.4 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4 8 4 9.4 4.8 10.1 6c.7-1.2 2.1-2 3.6-2C16 4 18 6 18 8.5c0 3.78-3.4 6.86-8.9 11.83l-1 1.02z" />
    </svg>
  );

  switch (key) {
    case "black":
      return (
        <Link
          to={to}
          aria-label={label}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{
            ...baseStyle,
            color: text,
            backgroundImage: `linear-gradient(90deg, ${from}, ${toCol})`,
            borderColor: border,
          }}
          className="
            relative group inline-flex items-center justify-center
            px-6 py-3 rounded-full border-2 font-semibold text-base tracking-wide
            transition-all duration-300 hover:scale-110 active:scale-95
          "
        >
          <span className="relative z-[1]">Buy Now</span>
          {Arrow}
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(75deg, rgba(255,255,255,.0) 30%, rgba(255,255,255,.25) 50%, rgba(255,255,255,.0) 70%)",
              transform: "translateX(-120%)",
              animation: "sheen 1s ease-in-out forwards",
            }}
          />
          <style>{`@keyframes sheen { to { transform: translateX(120%); } }`}</style>
        </Link>
      );

    case "green":
      return (
        <Link
          to={to}
          aria-label={label}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{
            ...baseStyle,
            color: text,
            backgroundImage: `linear-gradient(180deg, ${from}, ${toCol})`,
            borderColor: border,
            backdropFilter: "saturate(120%) blur(2px)",
          }}
          className="
            inline-flex items-center justify-center px-6 py-3 rounded-full border font-semibold
            transition-all duration-300 hover:translate-y-[-2px] active:scale-95
          "
        >
          <span>Buy Now</span>
          {Leaf}
        </Link>
      );

    case "darkGreen":
      return (
        <Link
          to={to}
          aria-label={label}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{
            ...baseStyle,
            color: text,
            backgroundImage: `linear-gradient(180deg, ${from}, ${toCol})`,
            borderColor: border,
            backdropFilter: "saturate(140%) blur(2px)",
          }}
          className="
            inline-flex items-center justify-center px-6 py-3 rounded-full border font-semibold
            transition-all duration-300 hover:translate-y-[-2px] active:scale-95
          "
        >
          <span>Buy Now</span>
          {Leaf}
        </Link>
      );

    case "maroon":
      return (
        <Link
          to={to}
          aria-label={label}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{
            ...baseStyle,
            color: text,
            backgroundImage: `linear-gradient(90deg, ${from}, ${toCol})`,
            borderColor: border,
          }}
          className="
            relative inline-flex items-center justify-center px-7 py-3 rounded-xl border font-semibold
            transition-all duration-300 hover:translate-y-[-1px] active:scale-95 overflow-hidden
          "
        >
          <span
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient( to bottom, rgba(255,255,255,.35), rgba(255,255,255,.05) 45%, rgba(0,0,0,.08) 46%, rgba(0,0,0,.0) )",
              mixBlendMode: "soft-light",
            }}
          />
          <span className="relative z-[1]">Buy Now</span>
          {Heart}
          <span
            className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rotate-45"
            style={{ background: toCol }}
          />
        </Link>
      );

    case "blue":
      return (
        <Link
          to={to}
          aria-label={label}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{
            ...baseStyle,
            color: text,
            backgroundImage: "none",
            backgroundColor: "rgba(255,255,255,.08)",
            borderColor: border,
            backdropFilter: "blur(6px)",
          }}
          className="
            inline-flex items-center justify-center px-6 py-3 rounded-2xl border font-semibold
            transition-all duration-300 hover:scale-110 active:scale-95
          "
        >
          <span>Buy Now</span>
          {Spark}
        </Link>
      );

    default:
      return (
        <Link
          to={to}
          aria-label={label}
          onMouseEnter={onEnter}
          onMouseLeave={onLeave}
          style={{
            ...baseStyle,
            color: text,
            backgroundImage: `linear-gradient(180deg, ${from}, ${toCol})`,
            borderColor: border,
          }}
          className="
            relative inline-flex items-center justify-center px-6 py-3 rounded-full border-2 font-semibold
            transition-all duration-300 hover:translate-y-[-1px] active:scale-95
          "
        >
          <span className="relative z-[1]">Buy Now</span>
          {Arrow}
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              boxShadow:
                "inset 0 2px 0 rgba(255,255,255,.35), inset 0 -3px 0 rgba(0,0,0,.12)",
            }}
          />
        </Link>
      );
  }
}

const FlavorSlider = () => {
  const sliderRef = useRef();
  const isTablet = useMediaQuery({ query: "(max-width: 1024px)" });

  useGSAP(() => {
    const scrollAmount = sliderRef.current.scrollWidth - window.innerWidth;

    if (!isTablet) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ".flavor-section",
          start: "2% top",
          end: `+=${scrollAmount * 2.5 + 2000}px`,  // Slower: increased multiplier and base
          scrub: 2.5,                                // Very smooth scrub
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

              {/* Title */}
              <h1 className="relative z-30 mb-2 md:mb-0 leading-tight">
                {flavor.name}
              </h1>

              {/* Theme-aware button */}
              <div
                className={`z-40 ${
                  isTablet ? "static mt-3" : "absolute bottom-10 right-10"
                }`}
              >
                <ThemeButton
                  theme={t}
                  to={toHref}
                  label={`Buy ${flavor.name} now`}
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