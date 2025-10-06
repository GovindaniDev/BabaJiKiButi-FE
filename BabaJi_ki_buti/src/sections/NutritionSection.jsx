// ProductCards.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

const PRODUCTS_DEFAULT = [
  {
    id: 1,
    title: "Swarn Shakti Bhasma",
    image: "/images/prod1.png",
    image2: "/images/prod1.1.webp",
    price: "₹699",
    mrp: "₹1,500",
    membersPrice: "₹649",
    badge: "Bestseller",
    discount: 59,
    subtitle: "Immunity • Daily Wellness",
  },
  {
    id: 2,
    title: "Madhu Vinashi Syrup",
    image: "/images/prod2.1.jpg",
    image2: "/images/prod2.2.webp",
    price: "₹550",
    mrp: "₹750",
    membersPrice: "₹520",
    badge: "Premium",
    discount: 27,
    subtitle: "Stress • Energy",
  },
  {
    id: 3,
    title: "Sthul Ghatak",
    image: "/images/prod3.1.jpg",
    image2: "/images/prod3.2.webp",
    price: "₹549",
    mrp: "₹599",
    membersPrice: "₹520",
    badge: "Hot",
    discount: 8,
    subtitle: "Hair Care • Shine",
  },
  {
    id: 4,
    title: "Thyro-Lite",
    image: "/images/prod4.1.jpg",
    image2: "/images/prod4.2.webp",
    price: "₹250",
    mrp: " ",
    membersPrice: " ",
    badge: "New",
    discount: 0,
    subtitle: "Digestive Wellness",
  },
  {
    id: 5,
    title: "Liva Young Prime Syrup",
    image: "/images/prod5.2.jpg",
    image2: "/images/prod5.1.webp",
    price: "₹549",
    mrp: "₹599",
    membersPrice: "₹520",
    badge: "Hot",
    discount: 8,
    subtitle: "Hair Care • Shine",
  },
   {
    id: 6,
    title: "Stone Skipper",
    image: "/images/prod6.1.jpg",
    image2: "/images/prod6.2.webp",
    price: "₹250",
    mrp: " ",
    membersPrice: " ",
    badge: "New",
    discount: 0,
    subtitle: "Digestive Wellness",
  },
  {
    id: 7,
    title: "Amrit Ayu Chywanprash",
    image: "/images/prod7.1.jpg",
    image2: "/images/prod7.2.webp",
    price: "₹549",
    mrp: "₹599",
    membersPrice: "₹520",
    badge: "Hot",
    discount: 8,
    subtitle: "Hair Care • Shine",
  },
  {
    id: 8,
    title: "PIGMI Care",
    image: "/images/prod8.1.jpg",
    image2: "/images/prod8.2.webp",
    price: "₹549",
    mrp: "₹599",
    membersPrice: "₹520",
    badge: "Hot",
    discount: 8,
    subtitle: "Hair Care • Shine",
  },
];

/* =============== Slider settings =============== */
const STEP_MS = 5000; // move one card every 5s
const SLIDE_DUR = 0.8;

/* ============ UTIL HELPERS ============ */
const parseINR = (val) => {
  if (val == null || val === "") return null;
  if (typeof val === "number") return val;
  const n = String(val).replace(/[^0-9.]/g, "");
  return n ? Number(n) : null;
};
const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(num || 0);

const computePricing = (p) => {
  const price = parseINR(p.price);
  const mrp = parseINR(p.mrp);
  const members = parseINR(p.membersPrice);

  let discountPct = typeof p.discount === "number" ? p.discount : null;
  if ((!discountPct || discountPct === 0) && price && mrp && mrp > price) {
    discountPct = Math.round(((mrp - price) / mrp) * 100);
  }

  const savings = price && mrp && mrp > price ? mrp - price : 0;
  const extraMembersSavings = members && price && members < price ? price - members : 0;

  return {
    priceNum: price,
    mrpNum: mrp,
    membersNum: members,
    discountPct,
    savings,
    extraMembersSavings,
    priceText: price != null ? formatINR(price) : p.price || "",
    mrpText: mrp != null ? formatINR(mrp) : p.mrp || "",
    membersText: members != null ? formatINR(members) : p.membersPrice || "",
  };
};

/* ==================== BADGE COLORS (Tailwind maps) ==================== */
const BADGE_CLASS = (badge) => {
  switch (badge) {
    case "Bestseller":
      return "bg-[#b83428] text-white";
    case "Premium":
      return "bg-gray-900 text-amber-300";
    case "Hot":
      return "bg-red-600 text-white";
    case "New":
      return "bg-blue-600 text-white";
    case "Organic":
      return "bg-emerald-600 text-white";
    case "Trending":
      return "bg-purple-700 text-white";
    default:
      return "bg-gray-900 text-white";
  }
};

/* ===================== MAIN EXPORT ===================== */
export default function ProductCards({
  title = "Most-Loved Staples — Dynamic Taglines, MRP & Member Deals",
  products = PRODUCTS_DEFAULT,
  isMember = true, // pass false to show the "Not Member" row
}) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

  // Show 2/3/4 per row (mobile/tablet/desktop)
  const [cardsPerRow, setCardsPerRow] = useState(4);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      if (w <= 768) setCardsPerRow(2);
      else if (w <= 1024) setCardsPerRow(3);
      else setCardsPerRow(4);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Clone first N to create seamless infinite loop
  const items = useMemo(() => {
    const clones = products.slice(0, cardsPerRow);
    return [...products, ...clones];
  }, [products, cardsPerRow]);

  const [idx, setIdx] = useState(0);
  const autoCallRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const stepPercent = 100 / cardsPerRow;

  // Start autoplay only when in view
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), {
      root: null,
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) {
      stopAuto();
      return;
    }
    playAuto(); // waits STEP_MS before first tick
    return () => stopAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, cardsPerRow]);

  const playAuto = () => {
    stopAuto();
    autoCallRef.current = gsap.delayedCall(STEP_MS / 1000, tick);
  };
  const stopAuto = () => {
    if (autoCallRef.current) {
      autoCallRef.current.kill();
      autoCallRef.current = null;
    }
  };
  const tick = () => slideTo(idx + 1);

  const slideTo = (nextIdx, { manual = false } = {}) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    if (manual) stopAuto();

    const target = -(nextIdx * stepPercent);

    gsap.to(trackRef.current, {
      xPercent: target,
      duration: SLIDE_DUR,
      ease: "power2.inOut",
      onComplete: () => {
        let wrappedIdx = nextIdx;
        if (nextIdx >= products.length) {
          wrappedIdx = 0;
          gsap.set(trackRef.current, { xPercent: 0 });
        }
        setIdx(wrappedIdx);
        isAnimatingRef.current = false;

        if (manual) {
          autoCallRef.current = gsap.delayedCall(2.5, () => playAuto());
        } else {
          playAuto();
        }
      },
    });
  };

  const next = () => slideTo(idx + 1, { manual: true });
  const prev = () => {
    if (isAnimatingRef.current) return;
    stopAuto();
    if (idx === 0) {
      const jumpIdx = products.length;
      gsap.set(trackRef.current, { xPercent: -(jumpIdx * stepPercent) });
      setIdx(jumpIdx);
      requestAnimationFrame(() => slideTo(jumpIdx - 1, { manual: true }));
    } else {
      slideTo(idx - 1, { manual: true });
    }
  };

  /* ================= GSAP: page + card entrance ================= */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".pc-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
      gsap.from(".pc-header > *", {
        opacity: 0,
        y: 12,
        duration: 0.5,
        ease: "power3.out",
        stagger: 0.08,
        delay: 0.05,
      });
      gsap.from(".pc-arrow", { scale: 0.8, opacity: 0, duration: 0.35, stagger: 0.1, delay: 0.1 });

      const cards = gsap.utils.toArray(".pc-card");
      gsap.set(cards, { opacity: 0, y: 18 });
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        duration: 0.45,
        ease: "back.out(1.3)",
        stagger: 0.06,
        delay: 0.15,
      });
    }, rootRef);
    return () => ctx.revert();
  }, [items]);

  const headerRef = useRef(null);

  useEffect(() => {
    const el = headerRef.current;
    gsap.fromTo(
      el,
      { opacity: 0, y: -40 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power3.out",
      }
    );
  }, []);

  return (
    <section ref={rootRef} className="pc-section mx-auto w-full rounded-2xl bg-[#faedae] px-4 py-8">
      <header ref={headerRef} className="pc-header mb-3">
      <h2 className="text-[28px] font-extrabold text-[#1a1a1a]">{title}</h2>
      <p className="mt-1 text-sm text-gray-500">
        All attributes (taglines, badges, MRP, sale price, members price,
        discount) are dynamic & admin-driven.
      </p>
    </header>
      <div className="relative w-full h-150 overflow-hidden">
        {/* arrows overlay */}
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-2">
          <button
            className="pc-arrow pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-2xl shadow-xl transition-transform hover:scale-105 active:scale-95"
            aria-label="Previous"
            onClick={prev}
          >
            ‹
          </button>
          <button
            className="pc-arrow pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-2xl shadow-xl transition-transform hover:scale-105 active:scale-95"
            aria-label="Next"
            onClick={next}
          >
            ›
          </button>
        </div>

        {/* track */}
        <div ref={trackRef} className="flex flex-nowrap will-change-transform">
          {items.map((p, i) => (
            <Card key={`${p.id}-${i}`} p={p} isMember={isMember} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========== CARD ITEM (Tailwind) =========== */
function Card({ p, isMember }) {
  const [src, setSrc] = useState(p.image);

  useEffect(() => {
    if (p.image) {
      const img = new Image();
      img.src = p.image;
    }
  }, [p.image]);

  useEffect(() => {
    if (p.image2) {
      const img = new Image();
      img.src = p.image2;
    }
  }, [p.image2]);

  const onEnter = () => setSrc(p.image2 || p.image);
  const onLeave = () => setSrc(p.image);

  const {
    priceNum, mrpNum, membersNum,
    discountPct, savings, extraMembersSavings,
    priceText, mrpText, membersText,
  } = computePricing(p);

  // Logic:
  // - show Members row only if user is member, product NOT "New", and members price better than price
  // - otherwise show a "Not Member" row
  const canShowMembersPrice = !!membersText && !!membersNum && (!priceNum || membersNum < priceNum);
  const showMembersRow = isMember && p.badge !== "New" && canShowMembersPrice;
  const showNotMemberRow = !showMembersRow; // user asked to show "Not Member" instead of member otherwise

  // compute potential extra saving for CTA (optional)
  const delta = canShowMembersPrice && priceNum ? Math.max(0, priceNum - membersNum) : 0;

  return (
    <div
      className="
        pc-card shrink-0 px-3
        w-1/2 md:w-1/3 lg:w-1/4
      "
    >
      <div
        className="
          pc-cardBox group h-full flex flex-col overflow-hidden
          rounded-xl bg-white shadow-md
          transition hover:-translate-y-0.5 hover:shadow-xl
        "
      >
        {/* visual area: fixed badge strip + uniform image canvas */}
{/* === PRODUCT IMAGE with single top-right overlay === */}
<div
  className="relative w-full h-[280px] overflow-hidden rounded-xl bg-white ring-1 ring-black/5"
  onMouseEnter={onEnter}
  onMouseLeave={onLeave}
  onTouchStart={onEnter}
>
  <img src={src}  className="h-70 w-full" />

  {/* optional top gradient for contrast */}
  
  {/* ONE overlay section (badge + discount + wishlist) at top-right */}
  <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
    {p.badge && (
      <span
        className={`rounded-full px-3 py-1 text-[12px] font-extrabold shadow ${BADGE_CLASS(p.badge)}`}
      >
        {p.badge}
      </span>
    )}
    {!!discountPct && (
      <span className="rounded-full bg-emerald-600 px-3 py-1 text-[12px] font-extrabold text-white shadow">
        -{discountPct}%
      </span>
    )}
    <button
      type="button"
      aria-label="Add to wishlist"
      className="grid h-9 w-9 place-items-center rounded-full bg-white shadow transition-transform hover:scale-105"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 24 24">
        <path
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
          fill="none"
          stroke="#0d6e3a"
          strokeWidth="2"
        />
      </svg>
    </button>
  </div>
</div>


        {/* details */}
        <div className="pc-details flex flex-1 flex-col gap-2 p-4">
          {/* fixed min height for title */}
          <h3 className="min-h-[48px] line-clamp-2 text-[16px] font-bold leading-snug text-gray-900">
            {p.title}
          </h3>

          {p.subtitle && <div className="text-sm text-gray-500">{p.subtitle}</div>}

          {/* rating row */}
          {p.rating && (
            <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
              <span>★ {p.rating}</span>
              {p.reviews && <span>• {p.reviews}</span>}
            </div>
          )}

          {/* price row */}
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            {priceText && <div className="text-[20px] font-extrabold text-gray-900">{priceText}</div>}
            {mrpText && mrpNum && mrpNum > (priceNum || 0) && (
              <>
                <div className="text-sm text-gray-400 line-through">{mrpText}</div>
                {savings > 0 && (
                  <div className="text-xs font-bold text-emerald-600">Save {formatINR(savings)}</div>
                )}
              </>
            )}
          </div>

          {/* members / not-member row */}
          {showMembersRow ? (
            <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <span className="rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-amber-300">
                Members
              </span>
              <span className="text-sm font-extrabold text-gray-900">
                {membersText}
                {extraMembersSavings > 0 && (
                  <span className="ml-2 text-xs font-bold text-emerald-600">
                    (extra {formatINR(extraMembersSavings)} off)
                  </span>
                )}
              </span>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <span className="rounded-full bg-gray-200 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-gray-700">
                Not Member
              </span>
              <span className="text-xs font-semibold text-gray-600">
                {delta > 0 ? `Join to save ${formatINR(delta)}` : "Join to unlock perks"}
              </span>
            </div>
          )}

          {/* qty + add */}
          <select className="mt-1 rounded-lg border border-gray-200 px-3 py-2">
            <option value="1">1 unit</option>
            <option value="2">2 units</option>
            <option value="3">3 units</option>
          </select>

          <button className="mt-2 w-full rounded-lg bg-[#0d6e3a] px-4 py-3 text-[15px] font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0b5c31]">
            ADD TO CART
          </button>
        </div>
      </div>
    </div>
  );
}
