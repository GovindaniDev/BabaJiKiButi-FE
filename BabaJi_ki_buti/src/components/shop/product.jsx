// src/page/products/ShopNow.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Heart,
  Sparkles,
  Flame,
  Tag,
} from "lucide-react";

import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import { useMe } from "../../auth/user/useMe";

// ⚡ GSAP
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// ⚡ Framer Motion
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Loader from "../ui/Loader";

// CART (backend only)
import { cartApi } from "../../auth/cart/cartApi";
import { wishlistApi } from "../../auth/wishlist/wishlistApi";

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

const norm = (s) => (s ?? "")?.toString()?.trim()?.toLowerCase();

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

const isNew = (p) => {
  const dt = p?.createdAt ? new Date(p.createdAt) : null;
  if (!dt || Number.isNaN(+dt)) return false;
  const days = (Date.now() - dt.getTime()) / (1000 * 60 * 60 * 24);
  return days <= 30; // new within 30 days
};

const isTrending = (p) => {
  const tags = new Set(
    [
      ...(p?.tags || []),
      ...(p?.tagsEn || []),
      ...(p?.tagsHi || []),
    ].map(norm)
  );
  return Boolean(p?.trending || p?.isTrending || tags.has("trending"));
};

/* -------------------------- motion variants -------------------------- */
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
  const { isAuthenticated } = useAuth();
  const { me } = useMe({ skip: !isAuthenticated });
  const userId = me?.id;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [query, setQuery] = useState("");
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

  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    const MIN_LOADER_MS = 700;
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

  // ✅ Warm wishlist cache for instant heart state
  useEffect(() => {
    if (!isAuthenticated || !userId) return;
    wishlistApi.get(userId).catch(() => {});
  }, [isAuthenticated, userId]);

  // header animation
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

  // card reveal animation
  useEffect(() => {
    if (!gridRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".shop-card").forEach((card) => {
        gsap.from(card, {
          opacity: 0,
          y: 22,
          duration: 0.35,
          ease: "power2.out",
          scrollTrigger: { trigger: card, start: "top 92%" },
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

  const categoryOptions = useMemo(() => {
    const set = new Set();
    products.forEach((p) => {
      const cat = p?.category || p?.categoryName || p?.categoryEn || p?.type;
      if (cat) set.add(cat.toString());
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

  // initialize price slider bounds once we know overall stats
  useEffect(() => {
    if (priceStats.max && maxPrice === 0) setMaxPrice(priceStats.max);
    if (priceStats.min && minPrice === 0) setMinPrice(priceStats.min);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceStats]);

  // ✅ Whenever filters/search change, go back to page 1
  useEffect(() => {
    setPage(1);
  }, [
    query,
    selectedCategories,
    selectedTags,
    inStockOnly,
    ratingAtLeast,
    minPrice,
    maxPrice,
    sort,
  ]);

  const filtered = useMemo(() => {
    let list = [...products];

    const q = norm(query);
    if (q)
      list = list.filter((p) => {
        const hay = [
          p.productName,
          p.name,
          p.title,
          ...(p?.tags || []),
          ...(p?.tagsEn || []),
          ...(p?.tagsHi || []),
          p?.benefits?.join?.(" ") || "",
        ]
          .filter(Boolean)
          .map(norm)
          .join(" ");
        return hay.includes(q);
      });

    // categories (case-insensitive)
    if (selectedCategories.length > 0) {
      const chosen = new Set(selectedCategories.map(norm));
      list = list.filter((p) => {
        const cat = norm(
          p?.category || p?.categoryName || p?.categoryEn || p?.type
        );
        return chosen.has(cat);
      });
    }

    // tags (case-insensitive, any-match)
    if (selectedTags.length > 0) {
      const chosen = new Set(selectedTags.map(norm));
      list = list.filter((p) => {
        const tags = new Set(
          [
            ...(p?.tags || []),
            ...(p?.tagsEn || []),
            ...(p?.tagsHi || []),
          ].map(norm)
        );
        for (const t of chosen) if (tags.has(t)) return true;
        return false;
      });
    }

    if (inStockOnly) list = list.filter((p) => Number(p?.stock ?? 0) > 0);
    if (ratingAtLeast > 0) list = list.filter((p) => getRating(p) >= ratingAtLeast);

    list = list.filter((p) => {
      const price = Number(p?.sellingPrice || p?.price || 0);
      return (
        (minPrice ? price >= minPrice : true) &&
        (maxPrice ? price <= maxPrice : true)
      );
    });

    if (sort === "price_low")
      list.sort(
        (a, b) =>
          (a?.sellingPrice || a?.price || 0) - (b?.sellingPrice || b?.price || 0)
      );
    else if (sort === "price_high")
      list.sort(
        (a, b) =>
          (b?.sellingPrice || b?.price || 0) - (a?.sellingPrice || a?.price || 0)
      );
    else if (sort === "reviews") list.sort((a, b) => getRating(b) - getRating(a));
    else if (sort === "newest")
      list.sort(
        (a, b) =>
          new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)
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
    selectedCategories,
    selectedTags,
  ]);

  const perPage = 12;
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = clamp(page, 1, totalPages);
  const visible = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  /* ------------------------------ render ------------------------------ */
  if (loading) return <Loader />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffdf9] px-4">
        <div className="text-center">
          <p className="font-semibold text-gray-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-5 py-2.5 bg-neutral-900 text-white rounded-full"
          >
            <RefreshCcw className="inline w-4 h-4 mr-1" /> Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="bg-[#fffdfa] min-h-screen text-neutral-900">
      {/* Top banner */}
      <div className="bg-neutral-900 text-white py-2 sm:py-3 text-center text-sm sm:text-base">
        <InfiniteNewsTicker />
      </div>

      {/* Header */}
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
            Curated range inspired by ancient wisdom, crafted for modern
            wellness.
          </p>

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
                placeholder="Search by name, tag, benefit..."
                className="w-full pl-10 pr-3 py-2 sm:py-2.5 rounded-xl border border-amber-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm sm:text-base"
              />
            </div>
          </motion.div>

          <div className="mt-4 flex items-center gap-3 justify-center sm:justify-end">
            <label className="text-xs sm:text-sm text-slate-900/80">Sort:</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-2 py-1.5 rounded-lg border border-amber-200 bg-white text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="newest">Newest</option>
              <option value="reviews">Top rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          <p className="mt-3 text-xs sm:text-sm text-slate-100">
            Showing <span className="font-semibold">{visible.length}</span> of{" "}
            {filtered.length} results
          </p>
        </div>
      </section>

      {/* Main */}
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
                  setSort("relevance");
                }}
              />
            </div>
          </aside>

          {/* Products */}
          <div className="md:col-span-3">
            {/* Mobile Filters */}
            <div className="flex justify-between items-center mb-4 md:hidden">
              <motion.button
                whileTap={!prefersReducedMotion ? tapScale : undefined}
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-3 py-2 border border-amber-300 rounded-lg bg-white text-sm shadow-sm"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </motion.button>
              <p className="text-xs text-gray-600">
                {visible.length}/{filtered.length} products
              </p>
            </div>

            {/* Mobile Filters Drawer */}
            <AnimatePresence>
              {showFilters && (
                <>
                  <motion.div
                    key="backdrop"
                    className="fixed inset-0 z-40 bg-black/40 md:hidden pt-8"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={backdropVariants}
                    onClick={() => setShowFilters(false)}
                  />
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
                          setSort("relevance");
                        }}
                      />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            <div
              ref={gridRef}
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-x-5 sm:gap-x-7 gap-y-10 sm:gap-y-12 pt-8"
            >
              {visible.map((p) => (
                <ProductCard
                  key={p.id || p.slug || p.productName}
                  product={p}
                  userId={userId}
                />
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
                          ? "bg-neutral-900 text-white border-neutral-900 shadow"
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

function Badge({ icon: Icon, children, color = "bg-black/80 text-white" }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium ${color}`}>
      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
      {children}
    </span>
  );
}

/** Product Card with Quantity + fixed flows (Add to Cart / Buy Now) */
function ProductCard({ product: p, userId }) {
  const navigate = useNavigate();
  const imgSrc = p?.productImg || p?.image || p?.image1 || PLACEHOLDER;
  const title =
    p?.productName || p?.name || p?.title || p?.product_title || "Untitled Product";
  const mrp = Number(p?.mrp || p?.price || 0);
  const selling = Number(p?.sellingPrice || p?.price || 0);
  const hasDiscount = mrp > selling && mrp > 0;
  const savePct = hasDiscount ? Math.round(((mrp - selling) / mrp) * 100) : 0;

  const ratingVal = getRating(p);
  const reviewCount = getReviewCount(p);

  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [wish, setWish] = useState(false);

  const productId = p?.id ?? p?.productId;

  // ⬇️ Quantity state (like Product page)
  const stock = Math.max(0, Number(p?.stock ?? 0));
  const MAX_QTY = stock > 0 ? Math.min(stock, 10) : 10;
  const [qty, setQty] = useState(1);
  const clampQty = (n) => clamp(n, 1, MAX_QTY);

  // Initialize wishlist state from backend (async-safe)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!userId || !productId || typeof wishlistApi.has !== "function") {
        if (mounted) setWish(false);
        return;
      }
      try {
        const present = await wishlistApi.has(userId, productId);
        if (mounted) setWish(present);
      } catch {
        if (mounted) setWish(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId, productId]);

  const handleAddToCart = async () => {
    if (!productId) return;
    if (!userId) {
      toast.error("Please log in to add items to your cart.");
      navigate("/login", { state: { from: `/shop` } });
      return;
    }
    if (stock === 0) {
      toast.error("Out of stock.");
      return;
    }
    try {
      setAdding(true);
      await cartApi.addItem(userId, productId, qty);
      setAdded(true);
      window.dispatchEvent(new CustomEvent("cart:changed"));
      toast.success("Added to cart");
      setTimeout(() => setAdded(false), 1500);
    } catch (e) {
      console.error(e);
      toast.error("Couldn't add to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  // ✅ Fixed Buy Now flow (like Product page)
  const handleBuyNow = async () => {
    if (!productId) return;
    const addressUrl = "/address?buynow=1";
    if (!userId) {
      const next = encodeURIComponent(addressUrl);
      navigate(`/login?next=${next}`, {
        replace: true,
        state: { from: `/shop` },
      });
      return;
    }
    if (stock === 0) {
      toast.error("Out of stock.");
      return;
    }
    try {
      await cartApi.addItem(userId, productId, qty); // ensure item in server cart with selected qty
      window.dispatchEvent(new CustomEvent("cart:changed"));
      navigate(addressUrl);
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleWishlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;
    if (!userId) {
      navigate("/login", { state: { from: `/shop` } });
      return;
    }
    try {
      // optimistic
      setWish((v) => !v);
      const res = await wishlistApi.toggle(userId, productId);
      setWish(!!res.added); // finalize
    } catch (err) {
      console.error(err);
      // revert on error
      setWish((v) => !v);
      alert(err?.message || "Couldn't update wishlist.");
    }
  };

  return (
    <motion.article
      className="shop-card flex flex-col rounded-2xl bg-white border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "tween", duration: 0.15 }}
    >
      <div className="relative rounded-t-2xl overflow-hidden p-2">
        {/* Top-left badges */}
        <div className="absolute left-3 top-3 z-10 flex gap-1.5 flex-wrap max-w-[80%]">
          {isTrending(p) && (
            <Badge icon={Flame} color="bg-rose-600 text-white">
              Trending
            </Badge>
          )}
          {isNew(p) && (
            <Badge icon={Sparkles} color="bg-amber-500 text-black">
              New
            </Badge>
          )}
        </div>

        {/* Wishlist button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-pressed={wish}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 border border-neutral-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
          title={wish ? "In your wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-5 h-5 ${
              wish ? "text-red-500 fill-red-500" : "text-neutral-700"
            }`}
          />
        </button>

        <Link to={`/products/${p?.slug || p?.id}`} className="block">
          <motion.img
            src={imgSrc}
            alt={title}
            onError={(e) => (e.currentTarget.src = PLACEHOLDER)}
            className="w-full aspect-[4/3] object-contain pointer-events-auto bg-neutral-50"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "tween", duration: 0.2 }}
            loading="lazy"
          />
        </Link>
      </div>

      {/* Card body – order: rating → name → price → qty → buttons → tags */}
      <div className="px-3 pb-3 pt-1 text-center">
        <div className="mt-1 flex justify-center items-center gap-1">
          <Stars value={ratingVal} size={14} />
          <span className="text-xs text-gray-500">({reviewCount})</span>
        </div>

        <Link to={`/products/${p?.slug || p?.id}`}>
          <h3 className="mt-1 text-[15px] md:text-[16px] font-semibold leading-snug line-clamp-2 min-h-[40px]">
            {title}
          </h3>
        </Link>

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

        {/* Quantity selector (compact, like Product page) */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="inline-flex items-center border border-amber-200 rounded-lg overflow-hidden">
            <button
              type="button"
              className="px-2 py-1 hover:bg-amber-50 disabled:opacity-40"
              onClick={() => setQty((q) => clampQty(q - 1))}
              disabled={qty <= 1}
              aria-label="decrease"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              className="w-14 text-center outline-none py-1"
              value={qty}
              min={1}
              max={MAX_QTY}
              onChange={(e) => {
                const v = parseInt(e.target.value || "1", 10);
                setQty(clampQty(Number.isFinite(v) ? v : 1));
              }}
            />
            <button
              type="button"
              className="px-2 py-1 hover:bg-amber-50 disabled:opacity-40"
              onClick={() => setQty((q) => clampQty(q + 1))}
              disabled={qty >= MAX_QTY}
              aria-label="increase"
            >
              +
            </button>
          </div>

          <span className="text-[11px] text-gray-500">
            {stock > 0 ? `${stock} in stock` : "Out of stock"}
          </span>
        </div>

        {/* CTA buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleBuyNow}
            disabled={stock === 0}
            className="px-3 py-2 rounded-xl bg-neutral-900 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 disabled:opacity-60"
            type="button"
          >
            Buy Now
          </button>
          <button
            onClick={handleAddToCart}
            disabled={adding || stock === 0}
            className="px-3 py-2 rounded-xl bg-amber-400 text-black text-xs sm:text-sm font-semibold hover:bg-amber-300 disabled:opacity-60"
            type="button"
          >
            {adding ? "Adding..." : added ? "Added ✓" : "Add to Cart"}
          </button>
        </div>

        {/* Tag strip */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap min-h-[22px]">
          {p?.tags || p?.tagsEn || p?.tagsHi ? (
            Array.from(
              new Set([...(p?.tags || []), ...(p?.tagsEn || []), ...(p?.tagsHi || [])])
            )
              .slice(0, 3)
              .map((t) => (
                <span
                  key={t}
                  className="text-[10px] px-2 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700"
                >
                  #{t}
                </span>
              ))
          ) : (
            <span className="text-[10px] px-2 py-1 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700">
              <Tag className="inline w-3 h-3 mr-1" />
              wellness
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* --------------------------- Filters Panel --------------------------- */
function FiltersPanel(props) {
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

  const [open, setOpen] = React.useState(true);

  const summaryId = "filters-summary";
  const panelId = "filters-panel";

  const psMin = Number(priceStats?.min ?? 0);
  const psMax = Number(priceStats?.max ?? 0);

  const handleMinChange = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return;
    const bounded = Math.min(Math.max(n, psMin), Math.max(psMin, maxPrice || psMax));
    setMinPrice(bounded);
  };
  const handleMaxChange = (v) => {
    const n = Number(v);
    if (Number.isNaN(n)) return;
    const bounded = Math.max(Math.min(n, psMax), Math.min(psMax, minPrice || psMin));
    setMaxPrice(bounded);
  };

  return (
    <div className="space-y-5">
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

      {open && (
        <div id={panelId} aria-labelledby={summaryId} className="space-y-4">
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
                    {ratingAtLeast}★ & up
                  </span>
                )}
              </div>
            </div>
          )}

          {Array.isArray(categoryOptions) && categoryOptions.length > 0 && (
            <details className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5" open>
              <summary className="cursor-pointer list-none flex items-center gap-2 font-medium">
                <Filter className="w-4 h-4" /> Category
              </summary>
              <div className="mt-3 sm:mt-4 max-h-48 overflow-auto pr-1 space-y-2">
                {categoryOptions.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(c)}
                      onChange={(e) =>
                        setSelectedCategories((prev = []) =>
                          e.target.checked ? [...prev, c] : prev.filter((x) => x !== c)
                        )
                      }
                    />
                    <span className="truncate">{c}</span>
                  </label>
                ))}
              </div>
            </details>
          )}

          <details className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5" open>
            <summary className="cursor-pointer list-none flex items-center gap-2 font-medium">
              <BadgePercent className="w-4 h-4" /> Price
            </summary>

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
                <span className="text-xs text-neutral-600">{formatINR(minPrice)}</span>
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
                <span className="text-xs text-neutral-600">{formatINR(maxPrice)}</span>
              </div>
            </div>

            <p className="mt-2 text-xs text-neutral-500">
              Range: {formatINR(psMin)} – {formatINR(psMax)}
            </p>
          </details>

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
                    <span className="text-xs text-neutral-600">&nbsp;and up</span>
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

          {Array.isArray(tagOptions) && tagOptions.length > 0 && (
            <details className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-5" open>
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
                      onClick={() =>
                        setSelectedTags((prev) =>
                          active ? prev.filter((x) => x !== t) : [...prev, t]
                        )
                      }
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
