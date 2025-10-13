// src/pages/ProductPageAlt.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, Shield, Sparkles, Clock, Award, Heart,
  ChevronDown, Tag, FileText, BadgeCheck, Pill as PillIcon,
  Utensils, Moon, Gauge, Scale, Apple, Beaker, AlertTriangle, Info,
  Truck, Repeat2, ShieldCheck, Leaf, ExternalLink, ShoppingCart, ShoppingBag,
  Zap, Brain
} from "lucide-react";
import { getProductBySlug } from "../../../auth/product/products";

// ⚡ Framer Motion
import { motion } from "framer-motion";

// ⚡ GSAP + ScrollTrigger
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

/* ------------------------------ utilities ------------------------------ */
const cn = (...a) => a.filter(Boolean).join(" ");

// ✅ SAFE cleaners (don’t drop 0 / "0" / false; only drop null, undefined, and empty strings)
const cleanArray = (arr) =>
  Array.isArray(arr)
    ? arr.filter(
        (v) =>
          !(
            v === null ||
            v === undefined ||
            (typeof v === "string" && v.trim() === "")
          )
      )
    : [];

const hasItems = (arr) => Array.isArray(arr) && arr.length > 0;

// presence check that keeps 0/"0"
const isPresent = (v) =>
  !(v === null || v === undefined || (typeof v === "string" && v.trim() === ""));

// pair checker for bilingual objects
const nonEmptyPair = (o) => !!(o && (isPresent(o.en) || isPresent(o.hi)));

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(num || 0));

/* ----------------------------- small UI bits ---------------------------- */
function RatingStars({ value = 0, className }) {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "w-4 h-4",
            i < n ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          )}
        />
      ))}
    </div>
  );
}
function ChipRow({ items = [], icon: Icon, className }) {
  const safe = cleanArray(items);
  if (!safe.length) return null;
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {safe.map((t, i) => (
        <span
          key={`${t}-${i}`}
          className="inline-flex items-center gap-1 rounded-full bg-[#faeade]/60  px-3 py-1 text-xs font-semibold ring-1 ring-[#f3cdbf]"
          data-animate="chip"
        >
          {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
          {t}
        </span>
      ))}
    </div>
  );
}
function IconStat({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-3" data-animate="iconstat">
      <div className="w-9 h-9 rounded-full bg-emerald-50 grid place-items-center ring-1 ring-emerald-200">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[12px] ">{label}</div>
        <div className="text-sm font-semibold ">{value ?? "No data added"}</div>
      </div>
    </div>
  );
}

/* --------------------------------- page --------------------------------- */
export default function ProductPageAlt() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Refs for GSAP scoping and section hooks
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const descRef = useRef(null);
  const whyRef = useRef(null);
  const kbRef = useRef(null);
  const howRef = useRef(null);
  const ingRef = useRef(null);
  const useRefSect = useRef(null);
  const idealRef = useRef(null);
  const safetyRef = useRef(null);
  const herbsRef = useRef(null);
  const trustRef = useRef(null);
  const reviewsRef = useRef(null);
  const faqsRef = useRef(null);

  // Prefer reduced-motion users (GSAP + FM will respect this)
  const prefersReduced = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    []
  );

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getProductBySlug(slug);
        if (!mounted) return;
        setProduct(data || null);
        setNotFound(!data);
      } catch {
        setNotFound(true);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [slug]);

  /* ---------- GSAP page animations (play nicely with Framer Motion) ---------- */
  useEffect(() => {
    if (prefersReduced) return; // opt-out
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      // Parallax on hero image
      if (heroRef.current) {
        const img = heroRef.current.querySelector("[data-hero-img]");
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }

        // Stagger in icon stats & chips
        gsap.from("[data-animate='iconstat']", {
          y: 16,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.08,
          scrollTrigger: { trigger: heroRef.current, start: "top 70%" },
        });
        gsap.from("[data-animate='chip']", {
          y: 10,
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.03,
          scrollTrigger: { trigger: heroRef.current, start: "top 60%" },
        });
      }

      // Generic section reveal — only touches [data-gsap] nodes (never motion.*)
      const reveal = (el) => {
        if (!el) return;
        const targets = el.querySelectorAll("[data-gsap]");
        if (!targets.length) return;
        gsap.from(targets, {
          y: 24,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 75%" },
        });
      };

      reveal(descRef.current);
      reveal(whyRef.current);
      reveal(kbRef.current);
      reveal(howRef.current);
      reveal(ingRef.current);
      reveal(useRefSect.current);
      reveal(idealRef.current);
      reveal(safetyRef.current);
      reveal(herbsRef.current);
      reveal(trustRef.current);
      reveal(reviewsRef.current);
      reveal(faqsRef.current);

      // One soft refresh to align triggers after layout settles
      ScrollTrigger.refresh({ soft: true });
    }, rootRef);

    return () => ctx.revert();
  }, [prefersReduced, product]);

  /* -------------------------- derive product fields -------------------------- */
  const title = product?.title || product?.name || "No data added";
  const titleHi = product?.titleHi;
  const subtitle = product?.subtitle;
  const subtitleHi = product?.subtitleHi;

  const price = product?.sellingPrice ?? product?.price;
  const mrp = product?.mrp;
  const stock = Number(product?.stock ?? 0);
  const weightText = [product?.qtySize, product?.qtyUnit]
    .filter((v) => v !== null && v !== undefined && String(v) !== "")
    .join(" ");
  const img =
    product?.productImg ||
    product?.image ||
    "https://placehold.co/800x600?text=No+Image";

  const indication = product?.indication;
  const indicationHi = product?.indicationHi;

  const labReport = product?.labReport || null;
  const courseTime = product?.courseTime;

  const priceText = price != null ? formatINR(price) : null;
  const mrpText = mrp != null ? formatINR(mrp) : null;
  const discountPct =
    price != null && mrp != null && mrp > price
      ? Math.round(((mrp - price) / mrp) * 100)
      : null;

  // Descriptions (EN / HI)
  const descriptionEn = cleanArray([product?.shortDesc, product?.longDesc]);
  const descriptionHi = cleanArray([product?.shortDescHi, product?.longDescHi]);

  // Raw arrays
  const ingredientsRaw = cleanArray(product?.ingredients);
  const usageEnRaw = cleanArray(product?.usage);
  const usageHiRaw = cleanArray(product?.usageHi);
  const safetyEnRaw = cleanArray(product?.safetyFirst);
  const safetyHiRaw = cleanArray(product?.safetyFirstHi);
  const precautionsEnRaw = cleanArray(product?.precautionsWarnings);
  const precautionsHiRaw = cleanArray(product?.precautionsWarningsHi);
  const idealForEnRaw = cleanArray(product?.idealFor);
  const idealForHiRaw = cleanArray(product?.idealForHi);
  const categories = cleanArray(product?.categories?.map((c) => c?.categoryName));
  const variants = cleanArray(product?.variants?.map((v) => v?.form));
  const tagsEn = cleanArray(product?.tagsEn || product?.tags);
  const tagsHi = cleanArray(product?.tagsHi);
  const whyChooseEnRaw = cleanArray(product?.whyChoose);
  const whyChooseHiRaw = cleanArray(product?.whyChooseHi);
  const kbEnRaw = cleanArray(product?.keyBenefits);
  const kbHiRaw = cleanArray(product?.keyBenefitsHi);
  const howEnRaw = cleanArray(product?.howItWorks);
  const howHiRaw = cleanArray(product?.howItWorksHi);
  const khEnRaw = cleanArray(product?.keyherbs || product?.keyHerbs);
const khHiRaw = cleanArray(product?.keyherbsHi || product?.keyHerbsHi);
  const keyHerbDetailsRaw = cleanArray(
  product?.keyHerbDetails ||      // <-- matches your payload
  product?.keyHerbsDetails ||     // <-- legacy/alternate
  product?.keyherbdetails ||      // <-- ultra-defensive
  product?.keyherbsdetails
);
  const whyherbsEnRaw = cleanArray(product?.whyherbs || product?.whyHerbs);
  const whyherbsHiRaw = cleanArray(product?.whyherbsHi || product?.whyHerbsHi);
  const trustBadgesRaw = cleanArray(product?.trustBadges);
  const trustBadgestagEnRaw = cleanArray(product?.trustBadgestag);
  const trustBadgestagHiRaw = cleanArray(product?.trustBadgestagHi);
  const faqsRaw = cleanArray(product?.faqs);
  const reviewsRaw = cleanArray(product?.reviews);

  /* -------- sanitize arrays to avoid empty shells (keep 0/"0") -------- */
  const ingredientsSafe = ingredientsRaw.filter(
    (ing) =>
      isPresent(ing?.herbName) ||
      isPresent(ing?.latinName) ||
      isPresent(ing?.qtyGrams)
  );

  const usageEnSafe = usageEnRaw.filter(isPresent);
  const usageHiSafe = usageHiRaw.filter(isPresent);

  const idealForEnSafe = idealForEnRaw.filter(isPresent);
  const idealForHiSafe = idealForHiRaw.filter(isPresent);

  // Why Choose / Key Benefits / How it works
  let whyChoose = mergeByIndex(whyChooseEnRaw, whyChooseHiRaw).filter(
    nonEmptyPair
  );

  const keyBenefits = mergeByIndex(kbEnRaw, kbHiRaw, true).filter(
    (b) =>
      isPresent(b.en) || isPresent(b.hi) || isPresent(b.enDesc) || isPresent(b.hiDesc)
  );

  const howItWorks = mergeByIndex(howEnRaw, howHiRaw).filter(nonEmptyPair);

  // Key herbs with details fallback
  let keyherbs = mergeByIndex(khEnRaw, khHiRaw);
 if (
  (!hasItems(keyherbs) || keyherbs.every(k => !isPresent(k?.en) && !isPresent(k?.hi))) &&
  hasItems(keyHerbDetailsRaw)
) {
  keyherbs = keyHerbDetailsRaw.map(h => ({
    en: [h?.herbTitleEn, h?.herbDescEn].filter(isPresent).join(": "),
    hi: [h?.herbTitleHi, h?.herbDescHi].filter(isPresent).join(": "),
  }));
}
  const keyherbsSafe =keyherbs.filter(nonEmptyPair);

  // Why herbs
  const whyherbs = [
    ...whyherbsEnRaw.filter(isPresent).map((t) => ({ en: t })),
    ...whyherbsHiRaw.filter(isPresent).map((t) => ({ hi: t })),
  ];
  const whyherbsSafe = whyherbs.filter(nonEmptyPair);

  // Trust
  const trustBadgesSafe = trustBadgesRaw.filter(isPresent);
  const trustBadgestagEnSafe = trustBadgestagEnRaw.filter(isPresent);
  const trustBadgestagHiSafe = trustBadgestagHiRaw.filter(isPresent);

  // Safety split
  const safetyList = mergeByIndex(safetyEnRaw, safetyHiRaw).filter(nonEmptyPair);
  const precautionsList = mergeByIndex(precautionsEnRaw, precautionsHiRaw).filter(
    nonEmptyPair
  );

  // FAQs bilingual (que/ans + queHi/ansHi)
  const faqs = faqsRaw
    .map((f) => ({
      q: f?.que,
      a: f?.ans,
      qHi: f?.queHi,
      aHi: f?.ansHi,
    }))
    .filter(
      (f) => isPresent(f.q) || isPresent(f.qHi) || isPresent(f.a) || isPresent(f.aHi)
    );

  // Reviews
  const reviews = reviewsRaw.filter(
    (r) =>
      isPresent(r?.name) ||
      isPresent(r?.rating) ||
      isPresent(r?.review) ||
      isPresent(r?.age)
  );

  const averageRating = reviews.length
    ? Math.round(
        reviews.reduce((s, r) => s + (Number(r?.rating) || 0), 0) / reviews.length
      )
    : 0;

  /* --------------------------------- actions -------------------------------- */
  const inc = () => setQty((q) => Math.min(99, q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const addToCart = () => {
    if (!product) return;
    alert(`Added ${qty} x ${title || "Item"} to cart`);
  };
  const buyNow = () => {
    addToCart();
    navigate("/checkout");
  };

  /* --------------------------------- states -------------------------------- */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f2]">
        <section className="max-w-7xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-10 items-start">
          <div className="h-[520px] bg-white rounded-2xl ring-1 ring-emerald-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-2/3 bg-emerald-50 rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-emerald-50 rounded animate-pulse" />
            <div className="h-10 w-72 bg-emerald-50 rounded animate-pulse" />
          </div>
        </section>
      </div>
    );
  }
  if (notFound || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff7f2]">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center ring-1 ring-emerald-100">
          <h1 className="text-2xl font-bold  mb-2">Product not found</h1>
          <p className=" mb-6">We couldn’t find a product for “{slug}”.</p>
          <Link
            to="/products"
            className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------ FM Variants ------------------------------ */
  const fadeUp = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
  };
  const fade = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.5 } },
  };

  /* ----------------------------------- UI ----------------------------------- */
  return (
    <div
      ref={rootRef}
      className="min-h-screen bg-gradient-to-b from-[#fff7f2] via-[#fffaf5] to-[#faeade]/25 relative text-black"
    >
      {/* HERO */}
      <section
        ref={heroRef}
        className="max-w-7xl mx-auto px-4 py-38 grid grid-cols-1 lg:grid-cols-2 gap-25"
      >
        {/* LEFT */}
        <aside className="self-start">
          <motion.img
            data-hero-img
            src={img}
            alt={title || "Product image"}
            className="w-full h-[520px] object-contain"
            onLoad={() => ScrollTrigger.refresh()}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fade}
          />

          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-3">
            <IconStat Icon={Truck} label="Shipping" value="Free & Fast" />
            <IconStat Icon={Repeat2} label="Returns" value="Easy Returns" />
            <IconStat Icon={ShieldCheck} label="Secure" value="100% Payment" />
          </div>

          {/* Variants / Categories / Tags */}
          <div className="mt-6 space-y-2">
            <ChipRow items={variants} icon={BadgeCheck} />
            <ChipRow items={categories} icon={Tag} />
            <ChipRow items={tagsEn} icon={Sparkles} />
            <ChipRow items={tagsHi} icon={Sparkles} />
          </div>
        </aside>

        {/* RIGHT */}
        <section className="self-start" data-gsap>
          <motion.h1
            className="text-3xl font-extrabold leading-tight"
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            {title || "No data added"}
          </motion.h1>
          {titleHi ? (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="text-xl font-semibold mt-2"
            >
              {titleHi}
            </motion.div>
          ) : null}

          {subtitle ? (
            <motion.p
              className="mt-5 text-emerald-900/85 font-semibold"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {subtitle}
            </motion.p>
          ) : (
            <motion.p
              className="mt-2 italic text-emerald-900/70"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              No data added
            </motion.p>
          )}
          {subtitleHi ? (
            <motion.p
              className="text-emerald-800/85 font-semibold"
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              {subtitleHi}
            </motion.p>
          ) : null}

          <div className="mt-4" data-gsap>
            {indication ? (
              <p className="text-sm">
                <b>Indication:</b> {indication}
              </p>
            ) : (
              <p className="text-sm italic text-emerald-900/70">
                Indication: No data added
              </p>
            )}
            {indicationHi ? (
              <p className="text-sm">
                <b>संकेत:</b> {indicationHi}
              </p>
            ) : null}
          </div>

          {/* Quick badges row: Course time & Lab report */}
          <div className="mt-6 flex flex-wrap items-center gap-2" data-gsap>
            <Badge variant="default" className="gap-2">
              <Clock className="w-4 h-4" /> Course Time:{" "}
              {courseTime != null ? `${courseTime} days` : "No data added"}
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <FileText className="w-4 h-4" />
              {labReport ? (
                <a
                  href={labReport}
                  target="_blank"
                  rel="noreferrer"
                  className="underline"
                >
                  View Lab Report
                </a>
              ) : (
                "No data added"
              )}
            </Badge>
          </div>

          <div className="mt-6 space-y-2" data-gsap>
            <div className="text-emerald-800/70 text-sm">Our Price:</div>
            <div className="flex items-end gap-3">
              {mrpText && priceText && mrp > (price ?? 0) && (
                <span className="text-gray-400 line-through text-lg">
                  {mrpText}
                </span>
              )}
              {priceText ? (
                <span className="text-3xl font-extrabold text-emerald-900">
                  {priceText}
                </span>
              ) : (
                <span className="italic text-emerald-900/70">No data added</span>
              )}
              {discountPct != null && (
                <span className="rounded-full bg-[#faeade] px-3 py-1 text-xs font-bold text-emerald-900 ring-1 ring-[#f3cdbf]">
                  - {discountPct}%
                </span>
              )}
            </div>
            {weightText ? (
              <div className="text-emerald-900/80 text-sm">
                Weight: {weightText}
              </div>
            ) : (
              <div className="text-emerald-900/60 text-sm">
                Weight: No data added
              </div>
            )}
            <div className="mt-3">
              {stock > 0 ? (
                <span className="text-xs px-3 py-1 rounded bg-emerald-600 text-white">
                  {stock} in stock
                </span>
              ) : (
                <span className="text-xs px-3 py-1 rounded bg-rose-100 ">
                  {stock === 0 ? "Out of stock" : "No data added"}
                </span>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3" data-gsap>
            <div className="flex items-center rounded ring-1 ring-emerald-200 overflow-hidden bg-white">
              <button
                className="px-3 py-2 hover:bg-emerald-50"
                onClick={dec}
                disabled={qty <= 1}
              >
                -
              </button>
              <input
                className="w-16 text-center bg-transparent py-2 border-x border-emerald-100"
                value={qty}
                readOnly
              />
              <button className="px-3 py-2 hover:bg-emerald-50" onClick={inc}>
                +
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
              onClick={addToCart}
              disabled={stock <= 0}
              className="bg-[#faeade] hover:bg-[#f6d7c9] text-emerald-900 font-semibold px-6 py-3 rounded inline-flex items-center gap-2 disabled:opacity-50 ring-1 ring-[#f3cdbf]"
            >
              <ShoppingCart className="w-4 h-4" /> ADD TO CART
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.97 }}
              whileHover={{ y: -1 }}
              onClick={buyNow}
              disabled={stock <= 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded inline-flex items-center gap-2 disabled:opacity-50"
            >
              BUY NOW — ONE CLICK
            </motion.button>
          </div>
        </section>
      </section>

      {/* Product Description with animated image */}
      <section ref={descRef} className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8" data-gsap>
          <h3 className="text-2xl md:text-3xl font-extrabold">
            Product Description {title || "No data added"}
          </h3>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start text-s">
          {/* LEFT */}
          <div
            id="desc"
            className="order-2 lg:order-1 mt-2 space-y-3  leading-relaxed"
            data-gsap
          >
            {hasItems(descriptionEn)
              ? descriptionEn.map((p, i) => <p key={`en-${i}`}>{p}</p>)
              : null}
            {hasItems(descriptionHi)
              ? descriptionHi.map((p, i) => (
                  <p key={`hi-${i}`} className="text-emerald-800/90">
                    {p}
                  </p>
                ))
              : !hasItems(descriptionEn) && (
                  <p className="italic ">No description added</p>
                )}
          </div>

          {/* RIGHT (animated on view) */}
          <motion.div
            className="order-1 lg:order-2"
            initial={{ y: -24, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <div className="rounded-[100px] overflow-hidden  lg:sticky lg:top-24">
              <img
                src={img}
                alt={title || "Product image"}
                className="w-full h-[340px] md:h-[420px] object-contain "
                onLoad={() => ScrollTrigger.refresh()}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose */}
      <section ref={whyRef} className="max-w-7xl mx-auto px-4 py-36">
        <div className="text-center mb-23" data-gsap>
          <h3 className="text-2xl md:text-3xl font-extrabold">
            Why Choose {title || "No data added"}?
          </h3>
        </div>
        {hasItems(whyChoose) ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" data-gsap>
            {whyChoose.map((row, i) => {
              const ICONS = [
                ShieldCheck,
                FileText,
                Beaker,
                BadgeCheck,
                Shield,
                Sparkles,
                Leaf,
                Award,
                Star,
              ];
              const Icon = ICONS[i % ICONS.length];
              const en = normalizeText(row.en);
              const hi = normalizeText(row.hi);
              return (
                <motion.div
                  key={i}
                  className="rounded-2xl bg-white ring-1 ring-amber-100 p-6 shadow-sm hover:shadow-md transition"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl grid place-items-center bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-base font-semibold  leading-snug">
                        {en || "No data added"}
                      </div>
                      {hi ? (
                        <div className="text-sm text-amber-900 mt-1">{hi}</div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center italic text-slate-500" data-gsap>No data added</p>
        )}
      </section>

      {/* Key Benefits */}
      <section ref={kbRef} className="max-w-7xl mx-auto px-4 py-18">
        <div className="text-center mb-10" data-gsap>
          <p className="text-amber-700/80 tracking-[0.2em] uppercase text-xs">
            मुख्य लाभ
          </p>
          <h3 className="text-2xl md:text-3xl font-extrabold">Key Benefits</h3>
        </div>
        {hasItems(keyBenefits) ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8" data-gsap>
            {keyBenefits.map((b, i) => {
              const ICONS = [
                Shield,
                Zap,
                Brain,
                Moon,
                Apple,
                Sparkles,
                Award,
                Heart,
              ];
              const UseIcon = ICONS[i % ICONS.length];
              return (
                <motion.div
                  key={i}
                  className="rounded-2xl bg-white p-8 ring-1 ring-amber-100 shadow-sm hover:shadow transition text-center"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full grid place-items-center bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                    <UseIcon className="w-8 h-8" />
                  </div>
                  <div className="text-lg font-extrabold ">
                    {normalizeText(b.en) || "—"}
                  </div>
                  {b.hi ? (
                    <div className="text-[15px] font-semibold  mt-1">
                      {normalizeText(b.hi)}
                    </div>
                  ) : null}
                  {b.enDesc ? (
                    <p className="mt-3 text-slate-700">{b.enDesc}</p>
                  ) : null}
                  {b.hiDesc ? (
                    <p className="mt-1 text-[13px] text-slate-600">{b.hiDesc}</p>
                  ) : null}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center italic text-slate-500" data-gsap>No data added</p>
        )}
      </section>

      {/* How it works (bullets) */}
      {hasItems(howItWorks) && (
        <section ref={howRef} className="max-w-7xl mx-auto px-4 py-37">
          <h3
            className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center"
            data-gsap
          >
            How It Works
          </h3>
          <div className="mt-10 grid md:grid-cols-2 gap-4" data-gsap>
            {howItWorks.map((row, i) => (
              <div
                key={i}
                className="flex items-start gap-3 bg-white ring-1 ring-amber-100 rounded-xl p-4"
              >
                <Sparkles className="w-5 h-5 text-emerald-700 mt-1" />
                <div>
                  {row.en ? (
                    <div className="font-semibold text-slate-800">{row.en}</div>
                  ) : null}
                  {row.hi ? (
                    <div className="text-sm text-amber-900 mt-1">{row.hi}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ingredients */}
      <section ref={ingRef} className="max-w-7xl mx-auto px-4 py-14">
        <h2
          className="text-3xl md:text-[32px] font-extrabold text-[#3b2a18] text-center"
          data-gsap
        >
          Ingredients
        </h2>
        <div className="mt-8 rounded-2xl bg-[#fffaf5] ring-1 ring-amber-100 p-6 shadow-sm overflow-x-auto" data-gsap>
          {hasItems(ingredientsSafe) ? (
            <table className="min-w-full border border-amber-100 rounded-lg">
              <thead className="bg-[#faeade]/50 text-amber-900 text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">Herb</th>
                  <th className="px-4 py-2 text-left">Latin Name</th>
                  <th className="px-4 py-2 text-left">Qty (g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-slate-700">
                {ingredientsSafe.map((ing, i) => (
                  <tr
                    key={i}
                    className="bg-white hover:bg-amber-50/50 transition align-top"
                  >
                    <td className="px-4 py-2">
                      <div>{ing?.herbName ?? "No data added"}</div>
                      {ing?.herbNameHi && ing.herbNameHi !== "---" ? (
                        <div className="text-[12px] text-amber-900/90">
                          {ing.herbNameHi}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 italic text-slate-600">
                      {ing?.latinName ?? "No data added"}
                    </td>
                    <td className="px-4 py-2">
                      {isPresent(ing?.qtyGrams) ? ing.qtyGrams : "No data added"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="italic text-slate-500">No data added</p>
          )}
        </div>
      </section>

      {/* Usage */}
      <section ref={useRefSect} className="max-w-7xl mx-auto px-4 py-36">
        <div className="text-center mb-10" data-gsap>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            How to Use
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6" data-gsap>
          <Card className="p-6">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <Utensils className="w-5 h-5" /> Usage (EN)
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-900/90">
              {hasItems(usageEnSafe) ? (
                usageEnSafe.map((t, i) => <li key={i}>• {t}</li>)
              ) : (
                <li className="italic opacity-70">No data added</li>
              )}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <Utensils className="w-5 h-5" /> उपयोग (HI)
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-900/90">
              {hasItems(usageHiSafe) ? (
                usageHiSafe.map((t, i) => <li key={i}>• {t}</li>)
              ) : (
                <li className="italic opacity-70">No data added</li>
              )}
            </ul>
          </Card>
        </div>
      </section>

      {/* Ideal For */}
      <section ref={idealRef} className="max-w-7xl mx-auto px-4 py-36">
        <div className="text-center mb-10" data-gsap>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            Ideal For
          </h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6" data-gsap>
          <Card className="p-6">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <BadgeCheck className="w-5 h-5" /> English
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-900/90">
              {hasItems(idealForEnSafe) ? (
                idealForEnSafe.map((t, i) => <li key={i}>• {t}</li>)
              ) : (
                <li className="italic opacity-70">No data added</li>
              )}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <BadgeCheck className="w-5 h-5" /> हिन्दी
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-900/90">
              {hasItems(idealForHiSafe) ? (
                idealForHiSafe.map((t, i) => <li key={i}>• {t}</li>)
              ) : (
                <li className="italic opacity-70">No data added</li>
              )}
            </ul>
          </Card>
        </div>
      </section>

      {/* Safety & Precautions */}
      <section ref={safetyRef} className="max-w-7xl mx-auto px-4 py-36">
        <div className="grid md:grid-cols-2 gap-6">
          {/* SAFETY */}
          <div
            className="rounded-2xl p-6 ring-1 ring-emerald-200 bg-emerald-50"
            data-gsap
          >
            <div className="text-center mb-6" data-gsap>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                Safety
              </h3>
              <p className="text-sm text-emerald-900/70">सुरक्षा</p>
            </div>
            {hasItems(safetyList) ? (
              <ul className="space-y-2 text-sm text-emerald-900/90">
                {safetyList.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 text-emerald-700 shrink-0" />
                    <div>
                      {o.en ? <div>{o.en}</div> : null}
                      {o.hi ? (
                        <div className="text-amber-900 text-[13px]">
                          {o.hi}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-emerald-900/70">No data added</p>
            )}
          </div>

          {/* PRECAUTIONS & WARNINGS */}
          <div
            className="rounded-2xl p-6 ring-1 ring-amber-200 bg-[#fffaf5]"
            data-gsap
          >
            <div className="text-center mb-6" data-gsap>
              <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">
                Precautions & Warnings
              </h3>
              <p className="text-sm text-amber-900/80">सावधानियाँ और चेतावनी</p>
            </div>
            {hasItems(precautionsList) ? (
              <ul className="space-y-2 text-sm text-slate-800">
                {precautionsList.map((o, i) => (
                  <li key={i} className="flex gap-2">
                    <Info className="w-4 h-4 mt-0.5 text-amber-700 shrink-0" />
                    <div>
                      {o.en ? <div>{o.en}</div> : null}
                      {o.hi ? (
                        <div className="text-amber-900 text-[13px]">
                          {o.hi}
                        </div>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-slate-500">No data added</p>
            )}
          </div>
        </div>
      </section>

      {/* Key Herbs + Why These Herbs */}
      <section ref={herbsRef} className="max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-10" data-gsap>
          <p className="text-amber-700/80 tracking-[0.2em] uppercase text-xs">
            प्रमुख जड़ी-बूटियाँ
          </p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            Key Herbs
          </h3>
        </div>
        {hasItems(keyherbsSafe) ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8" data-gsap>
            {keyherbsSafe.map((row, i) => {
              const [nameEn, descEn] = row.en
                ? String(row.en)
                    .split(":")
                    .map((s) => s.trim())
                : [];
              const [nameHi, descHi] = row.hi
                ? String(row.hi)
                    .split(":")
                    .map((s) => s.trim())
                : [];
              return (
                <motion.div
                  key={i}
                  className="p-6 hover:shadow-md transition-all duration-300 border border-amber-200 bg-white/95 backdrop-blur-sm rounded-2xl"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-emerald-700">
                        {nameEn || nameHi || "Herb"}
                      </h4>
                      {nameHi ? (
                        <Badge variant="secondary" className="text-xs">
                          {nameHi}
                        </Badge>
                      ) : null}
                    </div>
                    {descEn ? (
                      <p className="text-sm text-slate-800">{descEn}</p>
                    ) : null}
                    {descHi ? (
                      <p className="text-xs text-slate-600">{descHi}</p>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 italic" data-gsap>No data added</p>
        )}

        {hasItems(whyherbsSafe) && (
          <div
            className="mt-70 rounded-2xl bg-[#fffaf5] ring-1 ring-amber-100 p-6 text-center text-slate-700 leading-relaxed"
            data-gsap
          >
            <h4 className="font-bold text-slate-800 mb-2">Why These Herbs?</h4>
            {whyherbsSafe.map((r, i) => (
              <p key={i} className="text-sm mb-1">
                {r.en || r.hi}
              </p>
            ))}
          </div>
        )}
      </section>

      {/* Trust & Compliance */}
      <section ref={trustRef} className="max-w-7xl mx-auto px-4 py-40">
        <div className="text-center mb-10" data-gsap>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">
            Trust & Compliance
          </h3>
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-emerald-100 p-6" data-gsap>
          <div className="flex flex-wrap gap-2">
            {hasItems(trustBadgesSafe) ? (
              trustBadgesSafe.map((t, i) => (
                <span key={i}>
                  <Badge className="gap-2">
                    <ShieldCheck className="w-4 h-4" /> {t}
                  </Badge>
                </span>
              ))
            ) : (
              <span className="italic text-emerald-900/70">No data added</span>
            )}
          </div>
          <div className="mt-4 space-y-2 text-sm text-emerald-900/90">
            {hasItems(trustBadgestagEnSafe)
              ? trustBadgestagEnSafe.map((t, i) => (
                  <p key={`tbe-${i}`} data-gsap>
                    {t}
                  </p>
                ))
              : null}
            {hasItems(trustBadgestagHiSafe)
              ? trustBadgestagHiSafe.map((t, i) => (
                  <p key={`tbh-${i}`} className="text-amber-900" data-gsap>
                    {t}
                  </p>
                ))
              : null}
            {!hasItems(trustBadgestagEnSafe) &&
            !hasItems(trustBadgestagHiSafe) ? (
              <p className="italic text-emerald-900/70" data-gsap>
                No data added
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section ref={reviewsRef} id="reviews" className="max-w-7xl mx-auto px-4 py-30">
        <div className="rounded-2xl ring-1 ring-emerald-100 bg-white p-6">
          <div className="flex items-center justify-center gap-5" data-gsap>
            <h3 className="text-lg font-bold ">What Our Customers Say</h3>
            <RatingStars value={averageRating} />
          </div>
          {hasItems(reviews) ? (
            <div className="mt-4 grid md:grid-cols-2 gap-6" data-gsap>
              {reviews.map((r, i) => (
                <motion.div
                  key={i}
                  className="bg-[#fffaf5] p-5 rounded-xl ring-1 ring-emerald-100"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">
                      {r?.name || "Verified Buyer"}
                    </div>
                    <RatingStars value={r?.rating} />
                  </div>
                  {r?.age != null ? (
                    <div className="text-xs text-emerald-900/70 mb-2">
                      Age: {r.age}
                    </div>
                  ) : null}
                  <p className="text-emerald-900/90 whitespace-pre-line">
                    {r?.review || ""}
                  </p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-emerald-900/70 italic" data-gsap>
              There are no reviews yet.
            </p>
          )}
        </div>
      </section>

      {/* FAQs */}
      <section ref={faqsRef} id="faqs" className="max-w-7xl mx-auto px-4 py-30">
        <div className="rounded-2xl ring-1 ring-emerald-100 bg-white p-5">
          <div className="flex items-center justify-between" data-gsap>
            <h3 className="text-lg font-bold">Frequently Asked Questions</h3>
            <span className="text-emerald-800/70">→</span>
          </div>
          {hasItems(faqs) ? (
            <div className="mt-4 divide-y divide-emerald-100" data-gsap>
              {faqs.map((f, idx) => (
                <details key={idx} className="group">
                  <summary className="list-none flex items-center justify-between cursor-pointer py-3">
                    <span className="font-semibold">
                      {f.q || f.qHi || "Question"}
                      {f.qHi ? (
                        <span className="block text-sm text-amber-900">
                          {f.qHi}
                        </span>
                      ) : null}
                    </span>
                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-3 text-emerald-900/90 whitespace-pre-line" data-gsap>
                    {f.a || "No data added"}
                    {f.aHi ? (
                      <div className="mt-1 text-amber-900">{f.aHi}</div>
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-emerald-900/70 italic" data-gsap>No data added</p>
          )}
        </div>
      </section>
    </div>
  );
}

/* --------------------------- helpers --------------------------- */
function normalizeText(x) {
  if (!x) return "";
  if (typeof x === "string") return x;
  return x?.title || x?.en || x?.hi || "";
}
function mergeByIndex(enArr = [], hiArr = [], withDesc = false) {
  const len = Math.max(enArr.length, hiArr.length);
  return Array.from({ length: len }).map((_, i) => {
    const en = enArr[i];
    const hi = hiArr[i];
    return withDesc
      ? {
          en: typeof en === "string" ? en : en?.titleEn || en?.en || en?.title,
          hi: typeof hi === "string" ? hi : hi?.titleHi || hi?.hi || hi?.title,
          enDesc:
            typeof en === "string" ? "" : en?.descEn || en?.subEn || en?.desc,
          hiDesc:
            typeof hi === "string" ? "" : hi?.descHi || hi?.subHi || hi?.desc,
        }
      : {
          en: typeof en === "string" ? en : en?.title || en?.en,
          hi: typeof hi === "string" ? hi : hi?.title || hi?.hi,
        };
  });
}

/* ------------------------- shadcn-lite UI (inline) ------------------------- */
const _cn = (...a) => a.filter(Boolean).join(" ");

function Button({
  children,
  className,
  variant = "default",
  size = "default",
  type = "button",
  disabled = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
    "disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    default: "bg-emerald-700 text-white hover:bg-emerald-800",
    outline:
      "border border-gray-300 bg-transparent text-emerald-900 hover:bg-gray-50",
    secondary: "bg-amber-600 text-white hover:bg-amber-700",
    hero: "bg-emerald-700 text-white hover:bg-emerald-800 shadow",
  };

  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-6 text-base",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={_cn(
        base,
        variants[variant] || variants.default,
        sizes[size] || sizes.default,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ className, children, ...props }) {
  return (
    <div
      className={_cn(
        "rounded-2xl border border-gray-200 bg-white shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function Badge({ children, className, variant = "default", ...props }) {
  const variants = {
    default:
      "inline-flex items-center rounded-full bg-emerald-100 text-emerald-900 px-2.5 py-1 text-xs font-semibold",
    secondary:
      "inline-flex items-center rounded-full bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-semibold",
  };
  return (
    <span
      className={_cn(variants[variant] || variants.default, className)}
      {...props}
    >
      {children}
    </span>
  );
}
