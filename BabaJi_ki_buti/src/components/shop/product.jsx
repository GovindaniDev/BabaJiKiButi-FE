// src/pages/ShopNow.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getAllProducts } from "../../auth/product/products";
import { InfiniteNewsTicker } from "../../sections/HeroSection";
import {
  Star,
  StarHalf,
  SlidersHorizontal,
  Filter,
  ChevronRight,
  X,
  RefreshCcw,
  BadgePercent,
  Search,
} from "lucide-react";

// ⚡ GSAP
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// ⚡ Framer Motion (used for drawer/backdrop + small interactions)
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Button from "../ui/Button";
import Loader from "../ui/Loader";

/* ------------------------------ helpers ------------------------------ */
const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(num || 0));

const PLACEHOLDER =
  "https://placehold.co/1024x1024/f6f6f6/9aa1a9?text=Product+Image";
const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

const getRating = (p) => {
  if (!p) return 0;
  const direct = Number(p.rating ?? p.avgRating ?? p.averageRating ?? 0) || 0;
  if (direct) return direct;
  const arr = Array.isArray(p.reviews) ? p.reviews : [];
  if (!arr.length) return 0;
  const sum = arr.reduce((s, r) => s + Number(r?.rating || 0), 0);
  return Math.max(0, Math.min(5, sum / arr.length)) || 0;
};
const getReviewCount = (p) => {
  if (!p) return 0;
  return (
    Number(p.totalReviews ?? p.reviewCount ?? 0) ||
    (Array.isArray(p.reviews) ? p.reviews.length : 0)
  );
};

/* -------------------------- motion variants -------------------------- */
// Keep FM separate from GSAP props (avoid opacity/y on the same elements GSAP animates)
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const drawerVariants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: { type: "tween", duration: 0.25 },
  },
  exit: {
    x: "-100%",
    transition: { type: "tween", duration: 0.2 },
  },
};

const tapScale = { scale: 0.98 };
const hoverScale = { scale: 1.02 };

/* ----------------------------- main page ----------------------------- */
export default function ShopNow() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [ratingAtLeast, setRatingAtLeast] = useState(0);
  const [sort, setSort] = useState("relevance");

  const [, setSearchParams] = useSearchParams();
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    const MIN_LOADER_MS = 1000; // ⏱ Minimum loader visible time (2 seconds)
    const start = Date.now();

    (async () => {
      try {
        const data = await getAllProducts();
        if (mounted) setProducts(Array.isArray(data) ? data : []);
      } catch {
        if (mounted) setError("Could not load products. Please try again.");
      } finally {
        const elapsed = Date.now() - start;
        const delay = Math.max(0, MIN_LOADER_MS - elapsed);
        const timer = setTimeout(() => {
          if (mounted) setLoading(false);
        }, delay);
        return () => clearTimeout(timer);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);
  // header animation (GSAP)
  useEffect(() => {
    if (!headerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(headerRef.current.querySelectorAll("[data-stagger]"), {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      });
    }, headerRef);
    return () => ctx.revert();
  }, []);

  // card reveal animation (GSAP)
  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".shop-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 25,
          duration: 0.4,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 90%" },
        });
      });
    }, gridRef);
    return () => ctx.revert();
  }, [products]);

  /* ---------------------------- derived data ---------------------------- */
  const priceStats = useMemo(() => {
    if (!products?.length) return { min: 0, max: 0 };
    const prices = products
      .map((p) => Number(p?.sellingPrice || p?.price || 0))
      .filter((n) => !Number.isNaN(n) && n > 0);
    return prices.length
      ? { min: Math.min(...prices), max: Math.max(...prices) }
      : { min: 0, max: 0 };
  }, [products]);

  // derive category & tag options (needed by FiltersPanel)
  const categoryOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const cat = p?.category || p?.categoryName || p?.categoryEn || p?.type;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [products]);

  const tagOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      (p?.tags || []).forEach((t) => set.add(t));
      (p?.tagsEn || []).forEach((t) => set.add(t));
      (p?.tagsHi || []).forEach((t) => set.add(t));
    });
    return Array.from(set).slice(0, 30);
  }, [products]);

  useEffect(() => {
    if (priceStats.max && maxPrice === 0) setMaxPrice(priceStats.max);
    if (priceStats.min && minPrice === 0) setMinPrice(priceStats.min);
  }, [priceStats]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    let list = [...products];
    const q = query.toLowerCase();
    if (q)
      list = list.filter((p) =>
        (p.productName || p.name || "").toLowerCase().includes(q)
      );

    // stock
    if (inStockOnly) list = list.filter((p) => Number(p?.stock ?? 0) > 0);
    // rating
    if (ratingAtLeast > 0) list = list.filter((p) => getRating(p) >= ratingAtLeast);
    // price range
    list = list.filter((p) => {
      const price = Number(p?.sellingPrice || p?.price || 0);
      return price >= minPrice && price <= maxPrice;
    });

    // sort (basic)
    if (sort === "price_low")
      list.sort(
        (a, b) =>
          (a?.sellingPrice || a?.price || 0) -
          (b?.sellingPrice || b?.price || 0)
      );
    else if (sort === "price_high")
      list.sort(
        (a, b) =>
          (b?.sellingPrice || b?.price || 0) -
          (a?.sellingPrice || a?.price || 0)
      );
    else if (sort === "reviews")
      list.sort((a, b) => getRating(b) - getRating(a));
    else if (sort === "newest")
      list.sort(
        (a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
      );

    return list;
  }, [
    products,
    query,
    inStockOnly,
    ratingAtLeast,
    minPrice,
    maxPrice,
    sort,
  ]);

  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = clamp(page, 1, totalPages);
  const visible = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  /* ------------------------------ render ------------------------------ */
  if (loading)
    return (
    <Loader/>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf9] px-4">
        <div className="text-center">
          <p className="font-semibold text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2.5 bg-black text-white rounded-full"
          >
            <RefreshCcw className="inline w-4 h-4 mr-1" /> Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-[#fffdf9] min-h-screen text-neutral-900">
      {/* Top banner */}
      <div className="bg-black text-white py-2 sm:py-3 text-center text-sm sm:text-base">
        <InfiniteNewsTicker />
      </div>

      {/* Header section (GSAP handles reveal) */}
      <section
        ref={headerRef}
        className="relative pt-16 sm:pt-20 pb-10 overflow-hidden text-center sm:text-right"
        style={{
          backgroundImage: `url('/images/shopbg.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f5d5b3]/40 -z-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1
            data-stagger
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-amber-200 tracking-tight drop-shadow"
          >
            Shop Ayurvedic Products
          </h1>
          <p
            data-stagger
            className="mt-3 text-[#4a2e16] font-semibold text-base sm:text-lg md:text-xl"
          >
            Curated range inspired by ancient wisdom, crafted for modern wellness.
          </p>

          {/* Search (Framer Motion subtle scale only) */}
          <motion.div
            data-stagger
            whileHover={!prefersReducedMotion ? hoverScale : undefined}
            whileTap={!prefersReducedMotion ? tapScale : undefined}
            className="mt-6 sm:mt-8 flex flex-wrap justify-center sm:justify-end gap-3"
          >
            <div className="relative w-full sm:w-2/3 md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or benefit..."
                className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-xl border border-amber-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base"
              />
            </div>
          </motion.div>

          <p className="mt-4 text-xs sm:text-sm text-slate-100">
            Showing <span className="font-semibold">{visible.length}</span> of{" "}
            {filtered.length} results
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-8">
          {/* Sidebar */}
          <aside className="hidden md:block md:col-span-1">
            <div className="sticky top-24">
              <FiltersPanel
                categoryOptions={categoryOptions}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                priceStats={priceStats}
                minPrice={minPrice}
                setMinPrice={setMinPrice}
                maxPrice={maxPrice}
                setMaxPrice={setMaxPrice}
                ratingAtLeast={ratingAtLeast}
                setRatingAtLeast={setRatingAtLeast}
                inStockOnly={inStockOnly}
                setInStockOnly={setInStockOnly}
                tagOptions={tagOptions}
                selectedTags={selectedTags}
                setSelectedTags={setSelectedTags}
                resetAll={() => {
                  setQuery("");
                  setSelectedCategories([]);
                  setSelectedTags([]);
                  setInStockOnly(false);
                  setRatingAtLeast(0);
                  setMinPrice(priceStats.min);
                  setMaxPrice(priceStats.max);
                }}
              />
            </div>
          </aside>

          {/* Products grid */}
          <div className="md:col-span-3">
            {/* Mobile filter toggle (Framer Motion on button tap) */}
            <div className="flex justify-between items-center mb-4 md:hidden">
              <motion.button
                whileTap={!prefersReducedMotion ? tapScale : undefined}
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-3 py-2 border border-amber-300 rounded-lg bg-white text-sm"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </motion.button>
              <p className="text-xs text-gray-600">
                {visible.length}/{filtered.length} products
              </p>
            </div>

            {/* Mobile Filters Drawer (AnimatePresence) */}
            <AnimatePresence>
              {showFilters && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    key="backdrop"
                    className="fixed inset-0 z-40 bg-black/40 md:hidden pt-8"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={backdropVariants}
                  />
                  {/* Drawer panel */}
                  <motion.div
                    key="drawer"
                    className="fixed left-0 top-0 z-50 h-full w-[85%] max-w-sm bg-white md:hidden"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={drawerVariants}
                  >
                    <div className="p-5 h-full overflow-y-auto">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                          <SlidersHorizontal className="w-4 h-4" /> Filters
                        </h3>
                        <motion.button
                          whileTap={!prefersReducedMotion ? tapScale : undefined}
                          onClick={() => setShowFilters(false)}
                          className="p-2 rounded hover:bg-gray-100"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </div>

                      <FiltersPanel
                        categoryOptions={categoryOptions}
                        selectedCategories={selectedCategories}
                        setSelectedCategories={setSelectedCategories}
                        priceStats={priceStats}
                        minPrice={minPrice}
                        setMinPrice={setMinPrice}
                        maxPrice={maxPrice}
                        setMaxPrice={setMaxPrice}
                        ratingAtLeast={ratingAtLeast}
                        setRatingAtLeast={setRatingAtLeast}
                        inStockOnly={inStockOnly}
                        setInStockOnly={setInStockOnly}
                        tagOptions={tagOptions}
                        selectedTags={selectedTags}
                        setSelectedTags={setSelectedTags}
                        resetAll={() => {
                          setQuery("");
                          setSelectedCategories([]);
                          setSelectedTags([]);
                          setInStockOnly(false);
                          setRatingAtLeast(0);
                          setMinPrice(priceStats.min);
                          setMaxPrice(priceStats.max);
                        }}
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div
              ref={gridRef}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-x-6 sm:gap-x-8 gap-y-10 sm:gap-y-14 pt-8"
            >
              {visible.map((p) => (
                <ProductCard key={p.id || p.slug || p.productName} product={p} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                <motion.button
                  whileTap={!prefersReducedMotion ? tapScale : undefined}
                  onClick={() => setPage((n) => clamp(n - 1, 1, totalPages))}
                  className="h-9 w-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  disabled={safePage === 1}
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </motion.button>
                {Array.from({ length: totalPages }).map((_, i) => {
                  const num = i + 1;
                  const active = num === safePage;
                  return (
                    <motion.button
                      whileTap={!prefersReducedMotion ? tapScale : undefined}
                      key={num}
                      onClick={() => setPage(num)}
                      className={`h-9 w-9 rounded-full border flex items-center justify-center text-sm ${
                        active
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      {num}
                    </motion.button>
                  );
                })}
                <motion.button
                  whileTap={!prefersReducedMotion ? tapScale : undefined}
                  onClick={() => setPage((n) => clamp(n + 1, 1, totalPages))}
                  className="h-9 w-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  disabled={safePage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------------------------- helper components --------------------------- */
function Stars({ value = 0, size = 16 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5 text-yellow-500">
      {Array.from({ length: 5 }).map((_, i) => {
        if (i < full) return <Star key={i} size={size} className="fill-yellow-500" />;
        if (i === full && half) return <StarHalf key={i} size={size} className="fill-yellow-500" />;
        return <Star key={i} size={size} className="text-gray-300" />;
      })}
    </div>
  );
}

function ProductCard({ product: p }) {
  const imgSrc = p?.productImg || p?.image || p?.image1 || PLACEHOLDER;
  const title = p?.productName || p?.name || p?.title || p?.product_title || "Untitled Product";

  const mrp = Number(p?.mrp || p?.price || 0);
  const selling = Number(p?.sellingPrice || p?.price || 0);
  const hasDiscount = mrp > selling && mrp > 0;
  const savePct = hasDiscount ? Math.round(((mrp - selling) / mrp) * 100) : 0;

  const ratingVal = getRating(p);
  const reviewCount = getReviewCount(p);
  const imgWrapRef = useRef(null);
  const cartPillRef = useRef(null);

  // Keep GSAP hover for cart pill
  useEffect(() => {
    if (!imgWrapRef.current || !cartPillRef.current) return;
    gsap.set(cartPillRef.current, { y: 16, opacity: 0 });
    const enter = () =>
      gsap.to(cartPillRef.current, { y: 0, opacity: 1, duration: 0.25 });
    const leave = () =>
      gsap.to(cartPillRef.current, { y: 16, opacity: 0, duration: 0.25 });
    const node = imgWrapRef.current;
    node.addEventListener("mouseenter", enter);
    node.addEventListener("mouseleave", leave);
    return () => {
      node.removeEventListener("mouseenter", enter);
      node.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    // Framer Motion scale for the whole card on hover/tap (no opacity/y here to avoid GSAP conflict)
    <motion.article
      className="shop-card flex flex-col"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "tween", duration: 0.15 }}
    >
      <div
        ref={imgWrapRef}
        className="relative rounded-xl overflow-hidden p-2"
      >
        <Link to={`/products/${p?.slug || p?.id}`} className="block">
          <motion.img
            src={imgSrc}
            alt={title}
            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
            className="w-full h-48 sm:h-56 md:h-64 object-contain"
            // gentle FM hover scale (image-level) that complements GSAP scroll reveal
            whileHover={{ scale: 1.02 }}
            transition={{ type: "tween", duration: 0.2 }}
          />
        </Link>
        <button ref={cartPillRef} className="absolute bottom-3 right-3 opacity-0 ">
          {/* Your existing animated Button component */}
          <Button />
        </button>
      </div>
      <div className="mt-3 text-center">
        <Link to={`/products/${p?.slug || p?.id}`}>
          <h3 className="text-[15px] md:text-[16px] font-semibold leading-snug">
            {title}
          </h3>
        </Link>
        <div className="mt-1 flex justify-center items-center gap-1">
          <Stars value={ratingVal} size={14} />
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>
        <div className="mt-2 flex justify-center items-center gap-2">
          <span className="font-semibold text-sm sm:text-base">
            {formatINR(selling)}
          </span>
          {hasDiscount && (
            <>
              <span className="line-through text-gray-400 text-xs">
                {formatINR(mrp)}
              </span>
              <span className="text-emerald-600 text-xs font-semibold">
                Save {savePct}%
              </span>
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* --------------------------- Filters Panel --------------------------- */
function FiltersPanel(props) {
  // Safe defaults (no UI change)
  const {
    categoryOptions = [],
    selectedCategories = [],
    setSelectedCategories = () => {},
    priceStats = { min: 0, max: 0 },
    minPrice = 0,
    setMinPrice = () => {},
    maxPrice = 0,
    setMaxPrice = () => {},
    ratingAtLeast = 0,
    setRatingAtLeast = () => {},
    inStockOnly = false,
    setInStockOnly = () => {},
    tagOptions = [],
    selectedTags = [],
    setSelectedTags = () => {},
    resetAll = () => {},
  } = props || {};

  // Collapsed by default
  const [open, setOpen] = React.useState(false);

  // IDs for a11y
  const summaryId = "filters-summary";
  const panelId = "filters-panel";

  // Normalize price bounds
  const psMin = Number(priceStats?.min ?? 0);
  const psMax = Number(priceStats?.max ?? 0);

  // Helpers
  const toggleCategory = (c, checked) =>
    setSelectedCategories((prev = []) =>
      checked ? [...prev, c] : prev.filter((x) => x !== c)
    );

  const toggleTag = (t) =>
    setSelectedTags((prev = []) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  // Clamp price changes
  const handleMinChange = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return;
    setMinPrice(Math.min(Math.max(n, psMin), Math.max(psMin, maxPrice)));
  };
  const handleMaxChange = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return;
    setMaxPrice(Math.max(Math.min(n, psMax), Math.min(psMax, minPrice)));
  };

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex items-center justify-between py-4 sm:py-6">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="font-medium flex items-center gap-2"
          aria-expanded={open}
          aria-controls={panelId}
          id={summaryId}
          title={open ? "Hide filters" : "Show filters"}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {open ? "Hide Filters" : "Show Filters"}
        </button>

        {open && (
          <button
            onClick={resetAll}
            className="text-sm text-neutral-700 hover:underline"
            type="button"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Body */}
      {open && (
        <div id={panelId} aria-labelledby={summaryId} className="space-y-4">
          {/* Selected chips */}
          {(selectedCategories.length > 0 ||
            selectedTags.length > 0 ||
            inStockOnly ||
            ratingAtLeast > 0) && (
            <div className="bg-white border border-neutral-200 rounded-xl p-3 sm:p-4">
              <div className="flex flex-wrap gap-2 text-xs">
                {selectedCategories.map((c) => (
                  <span
                    key={`cat-${c}`}
                    className="px-2 py-1 rounded-full bg-neutral-900 text-white"
                  >
                    {c}
                  </span>
                ))}
                {selectedTags.map((t) => (
                  <span
                    key={`tag-${t}`}
                    className="px-2 py-1 rounded-full bg-neutral-200"
                  >
                    #{t}
                  </span>
                ))}
                {inStockOnly && (
                  <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">
                    In stock
                  </span>
                )}
                {ratingAtLeast > 0 && (
                  <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">
                    {ratingAtLeast}★ &amp; up
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Category */}
          {Array.isArray(categoryOptions) && categoryOptions.length > 0 && (
            <details className="bg白 rounded-xl border border-neutral-200 p-4 sm:p-5" open>
              <summary className="cursor-pointer list-none flex items-center gap-2 font-medium">
                <Filter className="w-4 h-4" /> Category
              </summary>
              <div className="mt-3 sm:mt-4 max-h-48 overflow-auto pr-1 space-y-2">
                {categoryOptions.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(c)}
                      onChange={(e) => toggleCategory(c, e.target.checked)}
                    />
                    <span className="truncate">{c}</span>
                  </label>
                ))}
              </div>
            </details>
          )}

          {/* Price */}
          <details className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5" open>
            <summary className="cursor-pointer list-none flex items-center gap-2 font-medium">
              <BadgePercent className="w-4 h-4" /> Price
            </summary>

            {/* Dual inputs */}
            <div className="mt-3 sm:mt-4 flex items-center gap-3">
              <input
                type="number"
                className="w-1/2 px-3 py-2 rounded-lg border border-neutral-200"
                value={minPrice}
                min={psMin}
                max={maxPrice || psMax}
                onChange={(e) => handleMinChange(e.target.value)}
              />
              <span className="text-neutral-500">to</span>
              <input
                type="number"
                className="w-1/2 px-3 py-2 rounded-lg border border-neutral-200"
                value={maxPrice}
                min={minPrice || psMin}
                max={psMax}
                onChange={(e) => handleMaxChange(e.target.value)}
              />
            </div>

            {/* Sliders */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={psMin}
                  max={psMax}
                  value={Math.min(Math.max(minPrice, psMin), psMax)}
                  onChange={(e) => handleMinChange(e.target.value)}
                  className="w-full"
                />
                <span className="text-xs text-neutral-600">
                  {formatINR(minPrice)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={psMin}
                  max={psMax}
                  value={Math.min(Math.max(maxPrice, psMin), psMax)}
                  onChange={(e) => handleMaxChange(e.target.value)}
                  className="w-full"
                />
                <span className="text-xs text-neutral-600">
                  {formatINR(maxPrice)}
                </span>
              </div>
            </div>

            <p className="mt-2 text-xs text-neutral-500">
              Range: {formatINR(psMin)} – {formatINR(psMax)}
            </p>
          </details>

          {/* Ratings */}
          <details className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5" open>
            <summary className="cursor-pointer list-none font-medium">
              Customer Reviews
            </summary>
            <div className="mt-3">
              {[5, 4, 3, 2, 1].map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2 text-sm mb-1 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={ratingAtLeast === r}
                    onChange={() => setRatingAtLeast(r)}
                  />
                  <span className="flex items-center gap-1">
                    <Stars value={r} />{" "}
                    <span className="text-xs text-neutral-600">
                      &nbsp;and up
                    </span>
                  </span>
                </label>
              ))}
              <button
                onClick={() => setRatingAtLeast(0)}
                className="mt-2 text-xs hover:underline"
                type="button"
              >
                Clear
              </button>
            </div>
          </details>

          {/* Availability */}
          <details className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5" open>
            <summary className="cursor-pointer list-none font-medium">
              Availability
            </summary>
            <div className="mt-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                />
                In Stock only
              </label>
            </div>
          </details>

          {/* Tags */}
          {Array.isArray(tagOptions) && tagOptions.length > 0 && (
            <details className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5">
              <summary className="cursor-pointer list-none font-medium">
                Popular Tags
              </summary>
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2">
                {tagOptions.map((t) => {
                  const active = selectedTags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTag(t)}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        active
                          ? "bg-neutral-900 text-white border-neutral-900"
                          : "bg-white border-neutral-200"
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
