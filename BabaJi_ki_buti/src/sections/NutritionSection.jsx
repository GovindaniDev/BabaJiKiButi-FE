// src/pages/NutritionPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import gsap from "gsap";
import { getAllProducts } from "../auth/product/products";
import { subscriptionApi } from "../auth/subscription/subscriptionApi";
import { cartApi } from "../auth/cart/cartApi";
import { useMe } from "../auth/user/useMe";

/* =========================================================
   UTILS
========================================================= */
const SLIDE_DUR = 0.8; // seconds per slide transition

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

function getUserIdFromStorage() {
  try {
    return (
      (typeof window !== "undefined" && window.USER_ID) ||
      (typeof localStorage !== "undefined" && localStorage.getItem("userId")) ||
      (typeof sessionStorage !== "undefined" && sessionStorage.getItem("userId")) ||
      null
    );
  } catch {
    return null;
  }
}

async function fetchPageCopy(signal) {
  try {
    const res = await fetch("/api/pages/nutrition", { credentials: "include", signal });
    if (!res.ok) throw new Error("copy fetch fail");
    const json = await res.json().catch(() => ({}));
    const data = json?.data ?? json ?? {};
    return {
      title: data.title || "Nutrition & Wellness",
      subtitle:
        data.subtitle ||
        "Discover our most-loved Ayurvedic formulations for daily immunity, energy, and holistic vitality.",
      ribbonTag: data.ribbonTag || "Dynamic: admin controls titles/tags",
    };
  } catch {
    return {
      title: "Nutrition & Wellness",
      subtitle:
        "Discover our most-loved Ayurvedic formulations for daily immunity, energy, and holistic vitality.",
      ribbonTag: "Dynamic: admin controls titles/tags",
    };
  }
}

const computePricing = (p) => {
  const price = parseINR(p.price);
  const mrp = parseINR(p.mrp);
  const members = parseINR(p.membersPrice);

  let discountPct = typeof p.discount === "number" ? p.discount : null;
  if ((!discountPct || discountPct === 0) && price && mrp && mrp > price) {
    discountPct = Math.round(((mrp - price) / mrp) * 100);
  }

  const savings = price && mrp && mrp > price ? mrp - price : 0;

  return {
    priceNum: price,
    mrpNum: mrp,
    membersNum: members,
    discountPct,
    savings,
    priceText: price != null ? formatINR(price) : p.price || "",
    mrpText: mrp != null ? formatINR(mrp) : p.mrp || "",
    membersText: members != null ? formatINR(members) : p.membersPrice || "",
  };
};

/* ===== THEME-MATCHED TAG STYLES + CHIP ===== */
const TAG_STYLES = {
  bestseller: "bg-[#e85c34]/90 text-white border-transparent",
  premium: "bg-[#3a3025] text-[#fbdc9a] border-transparent",
  hot: "bg-[#ff7849]/90 text-white border-transparent",
  "hot-item": "bg-[#ff7849]/90 text-white border-transparent",
  "hot_item": "bg-[#ff7849]/90 text-white border-transparent",
  new: "bg-[#227c9d]/90 text-white border-transparent",
  organic: "bg-[#6fbf73]/90 text-white border-transparent",
  trending: "bg-[#b76eb8]/90 text-white border-transparent",
  immunity: "bg-[#fff5d6] text-[#166534] border border-amber-300",
  detox: "bg-[#f7e6ff] text-[#6b21a8] border border-purple-200",
  digestive: "bg-[#fff4cc] text-[#92400e] border border-amber-200",
  pain: "bg-[#ffe4e1] text-[#b91c1c] border border-rose-200",
  women: "bg-[#ffe4f3] text-[#9d174d] border border-pink-200",
  kids: "bg-[#e0f2fe] text-[#075985] border border-sky-200",
  membersonly: "bg-[#2f2f2f] text-[#fbdc9a] border-transparent",
  default: "bg-[#fff8e1] text-[#44403c] border border-amber-100",
};

function normalizeTagKey(raw) {
  if (!raw) return "default";
  return String(raw).trim().toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
}
function prettyTagLabel(raw) {
  return String(raw).replace(/[_-]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}
function TagPill({ tag }) {
  const key = normalizeTagKey(tag);
  const cls = TAG_STYLES[key] || TAG_STYLES.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${cls}`}>
      {prettyTagLabel(tag)}
    </span>
  );
}

/* =========================================================
   RATINGS (extra-robust)
========================================================= */
function pickRating(p = {}) {
  const directCandidates = [
    p.ratingAvg, p.averageRating, p.avgRating, p.rating, p.stars, p.score,
    p.overallRating, p.overall, p.average, p.avg, p.ratingValue,
  ];
  const nestedCandidates = [
    p.rating?.avg, p.rating?.average, p.rating?.value, p.rating?.score,
    p.reviewsMeta?.avg, p.reviewsMeta?.average, p.reviewsMeta?.value, p.reviewsMeta?.score,
    p.productRating?.avg, p.productRating?.average, p.productRating?.value,
  ];

  let value =
    Number(directCandidates.find((x) => x != null)) ||
    Number(nestedCandidates.find((x) => x != null));

  let count =
    Number(
      p.ratingCount ??
      p.reviewsCount ??
      p.reviewCount ??
      p.totalReviews ??
      p.reviewsMeta?.count ??
      p.rating?.count
    ) || (Array.isArray(p.reviews) ? p.reviews.length : 0);

  const sum = Number(
    p.ratingSum ??
    p.starsSum ??
    p.reviewsSum ??
    p.totalStars ??
    p.rating?.sum ??
    p.reviewsMeta?.sum
  );

  if ((!Number.isFinite(value) || value === 0) && Number.isFinite(sum) && count > 0) {
    value = sum / count;
  }

  if ((!Number.isFinite(value) || value === 0) && Array.isArray(p.reviews) && p.reviews.length) {
    const nums = p.reviews
      .map((r) => Number(r.rating ?? r.stars ?? r.score))
      .filter((n) => Number.isFinite(n));
    if (nums.length) {
      const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
      value = avg;
      count = nums.length;
    }
  }

  if (!Number.isFinite(value)) value = 0;
  value = Math.max(0, Math.min(5, value));

  return { value, count };
}

function StarRating({ value = 0, count = 0, size = 14, showNumber = true }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className="flex items-center gap-2" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <div className="relative inline-block align-middle" style={{ lineHeight: 1, fontSize: size }}>
        <div className="text-gray-300/80 select-none">★★★★★</div>
        <div className="absolute inset-0 overflow-hidden select-none" style={{ width: `${pct}%` }}>
          <div className="text-amber-500">★★★★★</div>
        </div>
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-gray-700 tabular-nums">
          {value.toFixed(1)} <span className="text-gray-500">({count})</span>
        </span>
      )}
    </div>
  );
}

/* =========================================================
   LITTLE GSAP HELPERS
========================================================= */
/* =========================================================
   ADD-TO-CART • BUTTON-ONLY MICRO FX
   - bounce + ripple (reuses playAddToCartFx + ripplePulse)
   - tiny sparkles INSIDE the button
   - label morph: "Added ✓" then back to original
========================================================= */
function makeSparklesIn(el, howMany = 10) {
  if (!el) return () => {};
  const box = el.getBoundingClientRect();
  const host = document.createElement("span");
  host.style.cssText = `
    position:absolute; inset:0; overflow:visible; pointer-events:none; z-index:1;
  `;
  el.style.position = el.style.position || "relative";
  el.appendChild(host);

  const bits = [];
  for (let i = 0; i < howMany; i++) {
    const s = document.createElement("span");
    s.className = "pc-btn-spark";
    s.style.cssText = `
      position:absolute; left:50%; top:50%; width:6px; height:6px; border-radius:2px;
      background:hsl(${Math.random()*360},85%,60%); opacity:.95; transform:translate(-50%,-50%) scale(0.6);
      filter: drop-shadow(0 1px 2px rgba(0,0,0,.25));
    `;
    host.appendChild(s);
    bits.push(s);
  }

  const tl = gsap.timeline({
    onComplete() {
      host.remove();
    },
  });

  bits.forEach((b) => {
    const dx = gsap.utils.random(-box.width * 0.35, box.width * 0.35, 1, true);
    const dy = gsap.utils.random(-14, -6, 1, true); // mostly upward
    const rot = gsap.utils.random(-90, 90, 1, true);
    tl.to(
      b,
      {
        x: dx,
        y: dy,
        rotation: rot,
        opacity: 0,
        scale: 0.2,
        duration: gsap.utils.random(0.5, 0.8),
        ease: "power2.out",
      },
      0
    );
  });

  return () => tl.kill();
}

function labelMorph(btnEl, temp = "Added ✓", holdMs = 700) {
  if (!btnEl) return;
  const orig = btnEl.getAttribute("data-orig-label") ?? btnEl.textContent.trim();
  btnEl.setAttribute("data-orig-label", orig);

  const inner = btnEl.querySelector(".pc-btn-label") || (() => {
    // Wrap existing text once for smoother anim
    const span = document.createElement("span");
    span.className = "pc-btn-label inline-flex items-center justify-center w-full";
    span.textContent = orig;
    btnEl.textContent = "";
    btnEl.appendChild(span);
    return span;
  })();

  // morph out → change text → morph in
  return gsap
    .timeline()
    .to(inner, { y: -6, opacity: 0, duration: 0.12, ease: "power2.in" })
    .add(() => { inner.textContent = temp; })
    .to(inner, { y: 0, opacity: 1, duration: 0.2, ease: "back.out(2)" })
    .to(inner, { scale: 1.02, duration: 0.12, ease: "power2.out" })
    .to({}, { duration: holdMs / 1000 })
    .to(inner, { y: 6, opacity: 0, duration: 0.12, ease: "power2.in" })
    .add(() => { inner.textContent = orig; })
    .to(inner, { y: 0, opacity: 1, duration: 0.18, ease: "power2.out" });
}


/* =========================================================
   LITTLE GSAP HELPERS
========================================================= */
function playAddToCartFx({ btnEl }) {
  if (!btnEl) return;
  gsap.timeline({ defaults: { ease: "power2.out" } })
    .to(btnEl, { y: -3, scale: 1.02, duration: 0.12 })
    .to(btnEl, { y: 0, scale: 1, duration: 0.18 });
}

function buttonOnlyAddFx(btnEl) {
  if (!btnEl) return;
  // bounce + soft ripple
  playAddToCartFx({ btnEl });
  ripplePulse(btnEl);

  // sparkle burst *inside* the button
  makeSparklesIn(btnEl, 12);

  // subtle glow flash across the button
  const glow = document.createElement("span");
  glow.style.cssText = `
    position:absolute; inset:0; border-radius:inherit; pointer-events:none; overflow:hidden;
  `;
  const stripe = document.createElement("span");
  stripe.style.cssText = `
    position:absolute; left:-40%; top:0; width:40%; height:100%;
    background: linear-gradient(115deg, rgba(255,255,255,0) 0%, rgba(255,255,255,.35) 50%, rgba(255,255,255,0) 100%);
    transform:skewX(-18deg);
  `;
  glow.appendChild(stripe);
  btnEl.style.position = btnEl.style.position || "relative";
  btnEl.appendChild(glow);

  gsap
    .timeline({ onComplete: () => glow.remove() })
    .to(stripe, { x: "180%", duration: 0.55, ease: "power2.out" });

  // label morph to “Added ✓”, then back
  labelMorph(btnEl, "Added ✓", 650);
}





/* =========================================================
   ADD-TO-CART FX: fly image to cart + confetti + button ripple
========================================================= */
function elPageBox(el) {
  const r = el?.getBoundingClientRect?.();
  if (!r) return null;
  return {
    x: r.left + window.scrollX,
    y: r.top + window.scrollY,
    w: r.width,
    h: r.height,
  };
}

function confettiBurst({ x, y, n = 14, life = 0.9 }) {
  const frag = document.createDocumentFragment();
  const bits = [];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "pc-confetti";
    // simple square; feel free to theme via Tailwind in global CSS
    s.style.cssText = `
      position: fixed; left:${x}px; top:${y}px; width:8px; height:8px;
      background: hsl(${Math.random()*360},85%,60%); border-radius:1px;
      pointer-events:none; z-index:9999; transform: translate(-50%,-50%);
    `;
    bits.push(s);
    frag.appendChild(s);
  }
  document.body.appendChild(frag);

  const tl = gsap.timeline({
    onComplete() {
      bits.forEach((b) => b.remove());
    },
  });

  bits.forEach((b) => {
    const dx = gsap.utils.random(-80, 80, 1, true);
    const dy = gsap.utils.random(-100, -40, 1, true);
    const rot = gsap.utils.random(-180, 180, 1, true);
    tl.to(
      b,
      {
        x: dx,
        y: dy,
        rotation: rot,
        opacity: 0,
        duration: life,
        ease: "power2.out",
      },
      0
    );
  });
}

function ripplePulse(el) {
  if (!el) return;
  const r = document.createElement("span");
  r.style.cssText = `
    position:absolute; inset:0; border-radius:inherit; pointer-events:none;
    overflow:hidden;
  `;
  const wave = document.createElement("span");
  wave.style.cssText = `
    position:absolute; left:50%; top:50%; width:10px; height:10px; border-radius:9999px;
    background:rgba(255,255,255,.35); transform:translate(-50%,-50%) scale(0);
  `;
  r.appendChild(wave);
  el.style.position = el.style.position || "relative";
  el.appendChild(r);

  gsap
    .timeline({
      onComplete() {
        r.remove();
      },
    })
    .to(wave, { scale: 18, opacity: 0, duration: 0.6, ease: "power2.out" });
}

async function flyToCartFx({ imgEl, btnEl, cartEl }) {
  // small bounce + ripple on the button (existing helper kept)
  playAddToCartFx({ btnEl });
  ripplePulse(btnEl);

  // find a cart target
  cartEl =
    cartEl ||
    document.querySelector("#site-cart-icon") ||
    document.querySelector("[data-cart-icon]") ||
    document.querySelector(".cart-icon");

  if (!imgEl || !cartEl) return; // gracefully degrade if no targets

  const imgBox = elPageBox(imgEl);
  const cartBox = elPageBox(cartEl);
  if (!imgBox || !cartBox) return;

  // create a lightweight flying clone
  const fly = document.createElement("img");
  fly.src = imgEl.currentSrc || imgEl.src;
  fly.alt = "";
  fly.style.cssText = `
    position: fixed; left:${imgBox.x}px; top:${imgBox.y}px; width:${imgBox.w}px; height:${imgBox.h}px;
    object-fit: contain; pointer-events:none; z-index:9999; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,.15);
  `;
  document.body.appendChild(fly);

  const midX = (imgBox.x + cartBox.x) / 2 + gsap.utils.random(-40, 40);
  const midY = Math.min(imgBox.y, cartBox.y) - gsap.utils.random(80, 140);

  const tl = gsap.timeline({
    defaults: { ease: "power2.inOut" },
    onComplete() {
      // pop the cart a bit
      gsap.fromTo(
        cartEl,
        { scale: 0.9 },
        { scale: 1, duration: 0.25, ease: "back.out(3)" }
      );
      confettiBurst({ x: cartBox.x + cartBox.w / 2, y: cartBox.y + cartBox.h / 2 });
      fly.remove();
    },
  });

  tl.to(fly, {
    duration: 0.75,
    motionPath: {
      path: [
        { x: 0, y: 0 },
        { x: midX - imgBox.x, y: midY - imgBox.y },
        { x: cartBox.x - imgBox.x, y: cartBox.y - imgBox.y },
      ],
      autoRotate: false,
      curviness: 1.2,
    },
    scale: 0.25,
    opacity: 0.85,
  }).to(fly, { opacity: 0, duration: 0.15 }, "-=0.1");
}

/* =========================================================
   MEMBERSHIP ROW
========================================================= */
function MembershipRow({ isMember, membersText, onJoin }) {
  if (isMember) {
    return (
      <div className="mt-2 rounded-xl border bg-emerald-50/80 border-emerald-200 text-emerald-800 px-3 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-[14px] w-[14px]" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3-3a1 1 0 011.414-1.414l2.293 2.293 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold">Member price applied<
        </span>
        {membersText ? <span className="font-extrabold">{membersText}</span> : null}
      </div>
    );
  }
  return (
    <div className="mt-2 rounded-xl border bg-amber-50/80 border-amber-200 text-amber-900 px-3 py-2 text-[12px]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-1.5">
          <span className="font-semibold">Members get</span>
          {membersText ? <span className="font-extrabold">{membersText}</span> : <span className="font-semibold">extra savings</span>}
        </div>
        <button
          onClick={onJoin}
          className="w-full sm:w-auto rounded-md bg-amber-500/90 hover:bg-amber-500 px-2.5 py-1.5 text-[12px] font-extrabold text-black shadow-sm"
          title="Join membership"
        >
          Join
        </button>
      </div>
      <div className="mt-1 text-[11px] text-amber-800/90">
        Extra discounts • Early access • Limited drops
      </div>
    </div>
  );
}

/* =========================================================
   CARD (shorter & smoother on mobile)
========================================================= */
function Card({ p, isMember, userId, onRequireMembership, widthPct, gutterPx }) {
  const navigate = useNavigate();
  const [src, setSrc] = useState(p.image);
  const [qty, setQty] = useState(1);
  const [buying, setBuying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const addBtnRef = useRef(null);
  const imgRef = useRef(null);


  const productHref = p.url ?? (p.slug ? `/products/${p.slug}` : `/products/${p.id}`);

  useEffect(() => {
    if (p.image) new Image().src = p.image;
    if (p.image2) new Image().src = p.image2;
  }, [p.image, p.image2]);

  useEffect(() => {
    const update = () => setIsMobile((window.innerWidth || 1280) < 640);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const onEnter = () => setSrc(p.image2 || p.image);
  const onLeave = () => setSrc(p.image);

  const {
    priceNum, mrpNum, membersNum, discountPct, savings,
    priceText, mrpText, membersText,
  } = computePricing(p);

  const tagsLower = Array.isArray(p.tags) ? p.tags.map((t) => String(t).toLowerCase()) : [];
  const isMembersOnly =
    tagsLower.includes("membersonly") ||
    tagsLower.includes("members-only") ||
    (typeof p.badge === "string" && String(p.badge).toLowerCase() === "membersonly");

  const canShowMembersPrice = !!membersText && membersNum && (!priceNum || membersNum < priceNum);

  const goBog = () => navigate("/bog");
  const requireMembership = () => (onRequireMembership?.() ?? goBog());

  const handleAddToCart = async () => {
    if (!userId) return navigate("/login?next=/cart");
    if (isMembersOnly && !isMember) return requireMembership();
    try {
      await cartApi.addItem(userId, p.id ?? p.productId ?? p.slug, qty);
       buttonOnlyAddFx(addBtnRef.current);
    } catch (e) {
      console.error("addToCart failed", e);
    }
  };

  const handleBuyNow = async () => {
    if (isMembersOnly && !isMember) return requireMembership();
    const productId = p.id ?? p.productId ?? p.slug;
    const q = Number(qty) || 1;

    if (!userId) {
      try {
        sessionStorage.setItem("PENDING_BUY", JSON.stringify({ productId, qty: q }));
      } catch {}
      return navigate("/login?next=/address");
    }

    try {
      setBuying(true);
      await cartApi.addItem(userId, productId, q);
      navigate("/address");
    } catch (e) {
      console.error("buyNow/addToCart failed", e);
    } finally {
      setBuying(false);
    }
  };

  // Smoothly animating image height (shorter on phones)
  const imgH = isMobile ? 120 : 190;

  const cardStyle = widthPct
    ? {
        width: `calc(${widthPct}% - ${gutterPx ? gutterPx : 0}px)`,
        paddingLeft: (gutterPx || 0) / 2,
        paddingRight: (gutterPx || 0) / 2,
      }
    : undefined;

  return (
    <div className="shrink-0" style={cardStyle}>
      <div
        className="
          pc-cardBox group flex h-full flex-col overflow-hidden rounded-2xl bg-white
          shadow-md ring-1 ring-black/5 transition-all duration-300 ease-[cubic-bezier(.22,.61,.36,1)]
          hover:-translate-y-0.5 hover:shadow-xl relative
        "
      >
        {/* Members-only overlay */}
        {isMembersOnly && !isMember && (
          <div className="absolute inset-0 z-20 bg-white/70 backdrop-blur-[2px] flex items-center justify-center">
            <button
              onClick={goBog}
              className="cursor-pointer rounded-lg bg-[#1a1a1a] text-[#fbdc9a] px-3 py-1.5 text-xs font-extrabold shadow"
              title="Join membership"
            >
              Members-only • Join to unlock
            </button>
          </div>
        )}

        {/* Image + tags */}
        <div className="relative">
          <Link
            to={productHref}
            className="relative block w-full overflow-hidden bg-white cursor-pointer"
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            onTouchStart={onEnter}
            aria-label={`${p.title} product page`}
            onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
          >
            <div
              className="w-full flex items-center justify-center"
              style={{ height: `${imgH}px`, transition: "height 300ms cubic-bezier(.22,.61,.36,1)" }}
            >
              <img
              ref={imgRef}
                src={src}
                alt={p.title}
                className="h-full w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>

            <div className="absolute right-2 top-2 z-10 flex flex-col items-end gap-2">
              {Array.isArray(p.tags) && p.tags.slice(0, 2).map((t) => (
                <TagPill key={t} tag={t} />
              ))}
              {!!discountPct && (
                <span className="rounded-full bg-emerald-600/90 px-2 py-1 text-[12px] font-extrabold text-white shadow-sm">
                  -{discountPct}%
                </span>
              )}
            </div>
          </Link>
        </div>

        {/* Details */}
        <div
          className={`
            pc-details flex flex-1 flex-col
            ${isMobile ? "p-2.5 pb-3" : "p-3 sm:p-3.5 pb-4"}
            transition-[padding] duration-300 ease-[cubic-bezier(.22,.61,.36,1)]
          `}
        >
          <h3
            className={`
              ${isMobile ? "text-[14px]" : "text-[15px] sm:text-[16px]"}
              min-h-[32px] line-clamp-2 font-semibold leading-snug text-gray-900
            `}
          >
            {p.title}
          </h3>

          {(p.ratingValue > 0 || p.ratingCount > 0) && (
            <div className={`${isMobile ? "mt-0.5" : "mt-1"}`}>
              <StarRating value={p.ratingValue} count={p.ratingCount} size={14} />
            </div>
          )}

          {/* Price row */}
          <div className={`${isMobile ? "mt-1.5" : "mt-2"} flex flex-wrap items-center gap-2`}>
            {priceText && (
              <div className={`${isMobile ? "text-[16px]" : "text-[18px] sm:text-[20px]"} font-extrabold text-gray-900`}>
                {priceText}
              </div>
            )}
            {mrpText && mrpNum && mrpNum > (priceNum || 0) && (
              <>
                <div className={`${isMobile ? "text-[11px]" : "text-xs sm:text-sm"} text-gray-400 line-through`}>{mrpText}</div>
                {savings > 0 && (
                  <div className={`${isMobile ? "text-[10px]" : "text-[11px] sm:text-xs"} font-bold text-emerald-600`}>
                    Save {formatINR(savings)}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Membership row */}
          <div className={`${isMobile ? "mt-1.5" : "mt-2"}`}>
            <MembershipRow
              isMember={isMember}
              membersText={canShowMembersPrice ? membersText : ""}
              onJoin={goBog}
            />
          </div>

          {/* Qty + actions */}
          <div className={`${isMobile ? "mt-1.5" : "mt-2"} flex items-center gap-2`}>
            <select
              className={`${isMobile ? "px-2 py-1.5 text-[12px]" : "px-3 py-2 text-sm"} rounded-lg border border-gray-200 w-full`}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value) || 1)}
              disabled={isMembersOnly && !isMember}
            >
              <option value="1">1 unit</option>
              <option value="2">2 units</option>
              <option value="3">3 units</option>
            </select>
          </div>

          <div className={`grid grid-cols-2 gap-2 ${isMobile ? "pt-1.5" : "pt-2"}`}>
            <button
              ref={addBtnRef}
              className={`
                w-full rounded-lg bg-[#0d6e3a] ${isMobile ? "px-2.5 py-2 text-[12px]" : "px-3 py-2.5 text-[13px]"}
                font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#0b5c31] disabled:opacity-60
              `}
              onClick={handleAddToCart}
              disabled={buying || (isMembersOnly && !isMember)}
            >
              {isMembersOnly && !isMember ? "JOIN TO ADD" : "ADD TO CART"}
            </button>

            <button
              className={`
                w-full rounded-lg bg-amber-500 ${isMobile ? "px-2.5 py-2 text-[12px]" : "px-3 py-2.5 text-[13px]"}
                font-extrabold text-black transition hover:-translate-y-0.5 hover:bg-amber-400
                disabled:opacity-60 disabled:cursor-not-allowed
              `}
              onClick={() => { handleBuyNow(); window.scrollTo({ top: 0, behavior: "instant" }); }}
              disabled={buying || (isMembersOnly && !isMember)}
              aria-busy={buying}
            >
              {isMembersOnly && !isMember ? "JOIN TO BUY" : (buying ? "PROCESSING…" : "BUY NOW")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT CAROUSEL — separate mobile & desktop implementations
========================================================= */
function MobileCarousel({ title, subtitle, products, isMember, userId }) {
  const hostRef = useRef(null);
  const trackRef = useRef(null);

  // Mobile: show strictly 1 item per view
  const realLen = products.length;
  const canLoop = realLen >= 2;

  // Build extended list for seamless wrap (prev-last + list + first)
  const extended = useMemo(() => {
    if (!realLen) return [];
    if (!canLoop) return [...products];
    return [products[realLen - 1], ...products, products[0]];
  }, [products, realLen, canLoop]);

  const startIndex = canLoop ? 1 : 0;
  const endIndex = canLoop ? realLen : extended.length - 1;

  const [i, setI] = useState(startIndex);
  const [running, setRunning] = useState(true);
  const [touchStartX, setTouchStartX] = useState(null);

  // Autoplay (2.6s per slide)
  useEffect(() => {
    if (!realLen || !canLoop || !running) return;
    const id = setInterval(() => setI((x) => x + 1), 2600);
    return () => clearInterval(id);
  }, [realLen, canLoop, running]);

  // Infinite wrap correction (jump without animation when at cloned ends)
  useEffect(() => {
    const el = trackRef.current;
    if (!el || !canLoop) return;

    const onEnd = () => {
      if (i > endIndex) {
        el.style.transition = "none";
        setI(startIndex);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = `transform ${SLIDE_DUR}s cubic-bezier(.22,.61,.36,1)`;
          });
        });
      }
      if (i < startIndex) {
        el.style.transition = "none";
        setI(endIndex);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = `transform ${SLIDE_DUR}s cubic-bezier(.22,.61,.36,1)`;
          });
        });
      }
    };

    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [i, canLoop, startIndex, endIndex]);

  // Pause on hover/touch; resume on leave
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const pause = () => setRunning(true);  // keep autoplay ON by default on mobile; set to false if you want pause-on-touch
    const play  = () => setRunning(true);
    host.addEventListener("mouseenter", pause);
    host.addEventListener("mouseleave", play);
    host.addEventListener("touchstart", pause, { passive: true });
    host.addEventListener("touchend", play, { passive: true });
    return () => {
      host.removeEventListener("mouseenter", pause);
      host.removeEventListener("mouseleave", play);
      host.removeEventListener("touchstart", pause);
      host.removeEventListener("touchend", play);
    };
  }, []);

  // Swipe (±1 slide only)
  const onTouchStart = (e) => setTouchStartX(e.touches?.[0]?.clientX ?? null);
  const onTouchEnd = (e) => {
    const endX = e.changedTouches?.[0]?.clientX ?? null;
    if (touchStartX != null && endX != null) {
      const dx = endX - touchStartX;
      const THRESH = 30;
      if (dx <= -THRESH) setI((x) => x + 1);
      if (dx >= THRESH) setI((x) => x - 1);
    }
    setTouchStartX(null);
  };

  if (!realLen) return null;

  // IMPORTANT: each slide is exactly 100% width of the viewport area.
  // We DO NOT add gutter on the slide itself. If you want visual spacing,
  // put padding INSIDE the slide wrapper (doesn't affect slide width).
  const trackStyle = {
    display: "flex",
    transform: `translate3d(${-(i - startIndex) * 100}%, 0, 0)`,
    transition: `transform ${SLIDE_DUR}s cubic-bezier(.22,.61,.36,1)`,
    willChange: "transform",
  };

  const goNext = () => setI((x) => x + 1);
  const goPrev = () => setI((x) => x - 1);

  // Initialize position cleanly on mount
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = "none";
    setI(startIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform ${SLIDE_DUR}s cubic-bezier(.22,.61,.36,1)`;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realLen, canLoop]);

  return (
    <section className="sm:hidden pc-section mx-auto w-full rounded-2xl bg-[#faedae] px-0 py-6 select-none">
      <header className="pc-header mb-3 px-3 flex items-center justify-between gap-3">
        <h2 className="text-[20px] font-extrabold text-[#1a1a1a]">{title}</h2>
        <div className={`flex items-center gap-2 ${!canLoop && "opacity-50 pointer-events-none"}`}>
          <button onClick={goPrev} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold hover:bg-gray-50">‹</button>
          <button onClick={goNext} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold hover:bg-gray-50">›</button>
        </div>
      </header>

      {subtitle && <p className="px-3 -mt-2 mb-3 text-sm text-gray-600">{subtitle}</p>}

      <div
        ref={hostRef}
        className="relative overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div ref={trackRef} style={trackStyle}>
          {extended.map((p, idx) => (
            // Slide wrapper: exactly 100% width; internal padding provides visual spacing
            <div
              key={`${p.id ?? p.slug}-${idx}`}
              className="shrink-0 grow-0 basis-full w-full"
            >
              <div className="px-2"> {/* visual gutter that DOESN'T affect slide width */}
                <Card
                  p={p}
                  isMember={isMember}
                  userId={userId}
                  onRequireMembership={() => (window.location.href = "/bog")}
                  // IMPORTANT: don't pass widthPct/gutterPx so Card doesn't calc widths
                />
              </div>
            </div>
          ))}
        </div>

        {/* dots */}
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {Array.from({ length: realLen }).map((_, k) => {
            const active = ((i - startIndex + realLen) % realLen) === k;
            return <span key={k} className={`h-1.5 w-6 rounded-full transition ${active ? "bg-[#0d6e3a]" : "bg-black/20"}`} />;
          })}
        </div>
      </div>
    </section>
  );
}


function DesktopCarousel({ title, subtitle, products, isMember, userId }) {
  const hostRef = useRef(null);
  const trackRef = useRef(null);

  // Desktop/tablet: 3 per view, manual nav, no autoplay (keeps layout stable)
  const visible = 3;
  const gutterPx = 18;
  const realLen = products.length;
  const K = Math.min(visible, realLen || 0);
  const canLoop = realLen >= Math.max(2, K);

  const extended = useMemo(() => {
    if (!realLen || !K) return [];
    if (!canLoop) return [...products];
    const head = products.slice(0, K);
    const tail = products.slice(-K);
    return [...tail, ...products, ...head];
  }, [products, K, realLen, canLoop]);

  const startIndex = canLoop ? K : 0;
  const endIndex = canLoop ? (K + realLen - 1) : (extended.length - 1);
  const [i, setI] = useState(startIndex);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || !canLoop) return;

    const onEnd = () => {
      if (i > endIndex) {
        el.style.transition = "none";
        setI((x) => x - realLen);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = `transform ${SLIDE_DUR}s cubic-bezier(.22,.61,.36,1)`;
          });
        });
      }
      if (i < startIndex) {
        el.style.transition = "none";
        setI((x) => x + realLen);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.transition = `transform ${SLIDE_DUR}s cubic-bezier(.22,.61,.36,1)`;
          });
        });
      }
    };

    el.addEventListener("transitionend", onEnd);
    return () => el.removeEventListener("transitionend", onEnd);
  }, [i, realLen, startIndex, endIndex, canLoop]);

  const widthPct = 100 / (visible || 1);
  const trackStyle = {
    transform: `translateX(${-(i - startIndex) * (widthPct)}%) translateZ(0)`,
    transition: `transform ${SLIDE_DUR}s cubic-bezier(.22,.61,.36,1)`,
    paddingLeft: gutterPx / 2,
    paddingRight: gutterPx / 2,
    willChange: "transform",
  };

  const goNext = () => setI((x) => (canLoop ? x + 1 : Math.min(x + 1, endIndex)));
  const goPrev = () => setI((x) => (canLoop ? x - 1 : Math.max(x - 1, startIndex)));

  // Initialize position
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.style.transition = "none";
    setI(startIndex);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = `transform ${SLIDE_DUR}s cubic-bezier(.22,.61,.36,1)`;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, realLen, canLoop]);

  if (!realLen) return null;

  return (
    <section className="hidden sm:block pc-section mx-auto w-full rounded-2xl bg-[#faedae] px-3 md:px-4 py-8 select-none">
      <header className="pc-header mb-3 px-2 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-[24px] sm:text-[28px] font-extrabold text-[#1a1a1a]">{title}</h2>
        </div>
        <div className={`flex items-center gap-2 ${(!canLoop && realLen <= 1) && "opacity-50 pointer-events-none"}`}>
          <button onClick={goPrev} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold hover:bg-gray-50">‹</button>
          <button onClick={goNext} className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-bold hover:bg-gray-50">›</button>
        </div>
      </header>

      {subtitle && <p className="px-2 -mt-2 mb-3 text-sm text-gray-600">{subtitle}</p>}

      <div ref={hostRef} className="relative overflow-hidden">
        <div ref={trackRef} className="flex" style={trackStyle}>
          {extended.map((p, idx) => (
            <Card
              key={`${p.id ?? p.slug}-${idx}`}
              p={p}
              isMember={isMember}
              userId={userId}
              onRequireMembership={() => (window.location.href = "/bog")}
              widthPct={widthPct}
              gutterPx={gutterPx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCarousel(props) {
  // Render both; CSS hides one or the other by breakpoint.
  return (
    <>
      <MobileCarousel {...props} />
      <DesktopCarousel {...props} />
    </>
  );
}

/* =========================================================
   PAGE
========================================================= */
export default function NutritionPage({ userId: propUserId, memberActive: propMemberActive }) {
  const { me, isAuthenticated, loading: meLoading } = useMe();
  const authUserId = me?.id ?? null;

  const userId = propUserId ?? authUserId ?? getUserIdFromStorage();
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState([]);
  const [copy, setCopy] = useState({ title: "Nutrition & Wellness", subtitle: "", ribbonTag: "" });
  const [isMember, setIsMember] = useState(Boolean(propMemberActive));

  // Fetch page copy + products
  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        setLoading(true);

        const pageCopy = await fetchPageCopy(abort.signal);
        setCopy(pageCopy);

        const list = await getAllProducts();
        const mapped = Array.isArray(list)
          ? list.map((p) => {
              const { value: ratingValue, count: ratingCount } = pickRating(p);
              const price =
                typeof p.sellingPrice === "number" ? p.sellingPrice : Number(p.sellingPrice);
              const mrp = typeof p.mrp === "number" ? p.mrp : Number(p.mrp);
              const discount =
                price && mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

              const rawTags = p.tags;
              let tags = [];
              if (Array.isArray(rawTags)) tags = rawTags;
              else if (typeof rawTags === "string")
                tags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);

              return {
                id: p.productId ?? p.id ?? p.slug,
                title: p.title || p.slug || p.productName || "",
                slug: p.slug,
                image: p.productImg || p.image || "/images/placeholder.webp",
                image2: p.image2 || null,
                price: price ? `₹${price}` : "",
                mrp: mrp ? `₹${mrp}` : "",
                membersPrice: p.membersPrice ? `₹${p.membersPrice}` : "",
                badge: tags?.[0] || p.badge || null,
                tags,
                discount,
                subtitle: p.indication || p.subtitle || "",
                url: `/products/${p.slug}`,
                ratingValue,
                ratingCount,
              };
            })
          : [];
        setCards(mapped);
      } catch (e) {
        console.error(e);
        setCards([]);
      } finally {
        setLoading(false);
      }
    })();
    return () => abort.abort();
  }, [userId, propMemberActive]);

  // Fetch definitive membership status whenever userId changes
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!userId) return;
      try {
        const res = await subscriptionApi.isActive(userId);
        const active =
          !!(res?.ok && (res.data === true || res.data?.active === true || res.data?.isActive === true));
        if (alive) setIsMember(active);
      } catch {
        /* silent */
      }
    })();
    return () => { alive = false; };
  }, [userId]);

  if (meLoading && isAuthenticated) {
    return (
      <main className="min-h-screen bg-[#fffaf0] overflow-x-hidden">
        <section className="max-w-7xl mx-auto px-4 pb-16 pt-10">
          <div className="rounded-2xl bg-[#faedae] p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-64 bg-amber-200/70 rounded" />
              <div className="h-[280px] w-full bg-amber-100 rounded-xl" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-[#fffaf0] overflow-x-hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      {/* Header copy */}
      <section className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="rounded-2xl bg-white p-5 sm:p-8 shadow-sm ring-1 ring-black/5">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#0d6e3a]">{copy.title}</h1>
          <p className="mt-2 max-w-2xl text-[13.5px] sm:text-base text-gray-600">
            {copy.subtitle || "Click any product to view full details, herbs, lab report, FAQs, and more."}
          </p>
        </div>
      </section>

      {/* Products: desktop 3-up (manual), mobile 1-up (autoplay one-by-one) */}
      <section className="max-w-7xl mx-auto px-0 sm:px-4 pb-20 sm:pb-16">
        {loading ? (
          <div className="mx-2 sm:mx-0 rounded-2xl bg-[#faedae] p-4 sm:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-5 sm:h-6 w-56 sm:w-64 bg-amber-200/70 rounded" />
              <div className="h-[220px] sm:h-[280px] w-full bg-amber-100 rounded-xl" />
            </div>
          </div>
        ) : (
          <ProductCarousel
            title="Daily Wellness Essentials — Backed by Ayurveda"
            subtitle="Clean, practitioner-curated formulations for immunity, energy, sleep, and digestion—honest MRP, dynamic deals, and member pricing where available."
            products={cards}
            isMember={isMember}
            userId={userId}
          />
        )}
      </section>
    </main>
  );
}
