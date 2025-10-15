// src/pages/NutritionPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { getAllProducts } from "../auth/product/products";

/* =========================================================
   UTILS
========================================================= */
const STEP_MS = 5000;
const SLIDE_DUR = 0.8;

const parseINR = (val) => {
  if (val == null || val === "") return null;
  if (typeof val === "number") return val;
  const n = String(val).replace(/[^0-9.]/g, "");
  return n ? Number(n) : null;
};
const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num || 0);

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

const BADGE_CLASS = (badge) => {
  switch (badge) {
    case "Bestseller": return "bg-[#b83428] text-white";
    case "Premium": return "bg-gray-900 text-amber-300";
    case "Hot": return "bg-red-600 text-white";
    case "New": return "bg-blue-600 text-white";
    case "Organic": return "bg-emerald-600 text-white";
    case "Trending": return "bg-purple-700 text-white";
    default: return "bg-gray-900 text-white";
  }
};

/* =========================================================
   CARD
========================================================= */
function Card({ p, isMember }) {
  const [src, setSrc] = useState(p.image);
  const productHref = p.url ?? (p.slug ? `/products/${p.slug}` : `/products/${p.id}`);

  useEffect(() => {
    if (p.image) new Image().src = p.image;
    if (p.image2) new Image().src = p.image2;
  }, [p.image, p.image2]);

  const onEnter = () => setSrc(p.image2 || p.image);
  const onLeave = () => setSrc(p.image);

  const {
    priceNum, mrpNum, membersNum, discountPct, savings, extraMembersSavings,
    priceText, mrpText, membersText,
  } = computePricing(p);

  const canShowMembersPrice = !!membersText && !!membersNum && (!priceNum || membersNum < priceNum);
  const showMembersRow = isMember && p.badge !== "New" && canShowMembersPrice;
  const delta = canShowMembersPrice && priceNum ? Math.max(0, priceNum - membersNum) : 0;

  return (
    <div className="pc-card shrink-0 px-3 w-1/2 md:w-1/3 lg:w-1/4">
      <div className="pc-cardBox group h-120 w-full flex flex-col overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-0.5 hover:shadow-xl">
        <Link
          to={productHref}
          className="relative block w-full h-[240px] overflow-hidden rounded-xl bg-white ring-1 ring-black/5 cursor-pointer"
          onMouseEnter={onEnter}
          onMouseLeave={onEnter}
          onTouchStart={onEnter}
          aria-label={`${p.title} product page`}
          onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
        >
          <img src={src} alt={p.title} className="h-55 w-full object-contain" />
          <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
            
            {!!discountPct && (
              <span className="rounded-full bg-emerald-600/80 px-2 py-1 mb-4 text-[12px] font-extrabold text-white ">
                -{discountPct}%
              </span>
            )}
            {/* <button
              type="button"
              aria-label="Add to wishlist"
              className="grid h-9 w-9 place-items-center rounded-full bg-white shadow transition-transform hover:scale-105"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 24 24">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                  fill="none"
                  stroke="#0d6e3a"
                  strokeWidth="2"
                />
              </svg>
            </button> */}
          </div>
        </Link>

        <div className="pc-details flex flex-1 flex-col p-2">
          <h3 className="min-h-[40px] line-clamp-2 text-[16px] font-bold leading-snug text-gray-900">
            {p.title}
          </h3>
          {p.subtitle && <div className="text-sm text-gray-500">{p.subtitle}</div>}
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

          {showMembersRow ? (
            <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <span className="rounded-full bg-gray-900 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-amber-300">Members</span>
              <span className="text-sm font-extrabold text-gray-900">
                {membersText}
                {extraMembersSavings > 0 && (
                  <span className="ml-2 text-xs font-bold text-emerald-600">(extra {formatINR(extraMembersSavings)} off)</span>
                )}
              </span>
            </div>
          ) : (
            <div className="mt-1 flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <span className="rounded-full bg-gray-200 px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide text-gray-700">Not Member</span>
              <span className="text-xs font-semibold text-gray-600">
                {delta > 0 ? `Join to save ${formatINR(delta)}` : "Join to unlock perks"}
              </span>
            </div>
          )}

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

/* =========================================================
   PRODUCT CARDS (Slider)
========================================================= */
function ProductCards({ title, products, isMember = true }) {
  const rootRef = useRef(null);
  const trackRef = useRef(null);

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

  const items = useMemo(() => {
    const clones = products.slice(0, cardsPerRow);
    return [...products, ...clones];
  }, [products, cardsPerRow]);

  const [idx, setIdx] = useState(0);
  const autoCallRef = useRef(null);
  const isAnimatingRef = useRef(false);
  const stepPercent = 100 / cardsPerRow;

  const [inView, setInView] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.2 });
    if (rootRef.current) io.observe(rootRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) { stopAuto(); return; }
    playAuto();
    return () => stopAuto();
  }, [inView, cardsPerRow]);

  const playAuto = () => { stopAuto(); autoCallRef.current = gsap.delayedCall(STEP_MS / 1000, tick); };
  const stopAuto = () => { if (autoCallRef.current) { autoCallRef.current.kill(); autoCallRef.current = null; } };
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
        if (manual) autoCallRef.current = gsap.delayedCall(2.5, () => playAuto());
        else playAuto();
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".pc-section", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
      gsap.from(".pc-header > *", { opacity: 0, y: 12, duration: 0.5, ease: "power3.out", stagger: 0.08, delay: 0.05 });
      gsap.from(".pc-arrow", { scale: 0.8, opacity: 0, duration: 0.35, stagger: 0.1, delay: 0.1 });
      const cards = gsap.utils.toArray(".pc-card");
      gsap.set(cards, { opacity: 0, y: 18 });
      gsap.to(cards, { opacity: 1, y: 0, duration: 0.45, ease: "back.out(1.3)", stagger: 0.06, delay: 0.15 });
    }, rootRef);
    return () => ctx.revert();
  }, [items]);

  return (
    <section ref={rootRef} className="pc-section mx-auto w-full rounded-2xl bg-[#faedae] px-4 py-8">
      <header className="pc-header mb-3">
        <h2 className="text-[28px] font-extrabold text-[#1a1a1a]">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">All attributes (taglines, badges, MRP & sale price) are dynamic & admin-driven.</p>
      </header>

      <div className="relative w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-2">
          <button className="pc-arrow pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-2xl shadow-xl transition-transform hover:scale-105 active:scale-95" aria-label="Previous" onClick={prev}>‹</button>
          <button className="pc-arrow pointer-events-auto grid h-10 w-10 place-items-center rounded-full border border-black/10 bg-white text-2xl shadow-xl transition-transform hover:scale-105 active:scale-95" aria-label="Next" onClick={next}>›</button>
        </div>

        <div ref={trackRef} className="flex flex-nowrap will-change-transform">
          {items.map((p, i) => (
            <Card key={`${p.id ?? p.slug}-${i}`} p={p} isMember={isMember} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PAGE: NutritionPage
========================================================= */
export default function NutritionPage() {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const list = await getAllProducts();
        if (!mounted) return;
        const mapped = Array.isArray(list) && list.length ? list.map((p) => {
          const price = typeof p.sellingPrice === "number" ? p.sellingPrice : Number(p.sellingPrice);
          const mrp = typeof p.mrp === "number" ? p.mrp : Number(p.mrp);
          const discount = price && mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
          return {
            id: p.productId,
            title: p.title || p.slug,
            slug: p.slug,
            image: p.productImg || "/images/placeholder.webp",
            image2: null,
            price: price ? `₹${price}` : "",
            mrp: mrp ? `₹${mrp}` : "",
            membersPrice: "",
            badge: (p.tags && Array.from(p.tags)[0]) || null,
            discount,
            subtitle: p.indication || "",
            url: `/products/${p.slug}`,
          };
        }) : [];
        setCards(mapped);
      } catch {
        setCards([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <main className="min-h-screen bg-[#fffaf0]">
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
          <h1 className="text-4xl font-extrabold text-[#0d6e3a]">Nutrition & Wellness</h1>
          <p className="mt-2 max-w-2xl text-gray-600">
            Discover our most-loved Ayurvedic formulations for daily immunity, energy, and holistic vitality.
            Click any product to view full details, herbs, lab report, FAQs, and more.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 pb-16">
        {loading ? (
          <div className="rounded-2xl bg-[#faedae] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-64 bg-amber-200/70 rounded" />
              <div className="h-[280px] w-full bg-amber-100 rounded-xl" />
            </div>
          </div>
        ) : (
          <ProductCards
            title="Most-Loved Staples — Dynamic Taglines, MRP & Deals"
            products={cards}
            isMember={true}
          />
        )}
      </section>
    </main>
  );
}