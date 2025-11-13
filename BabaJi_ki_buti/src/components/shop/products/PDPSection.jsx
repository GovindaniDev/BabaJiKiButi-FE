import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  ShoppingCart,
  ArrowUp,
  Star,
  Leaf,
  Heart,
  Zap,
  Brain,
  Moon,
  Apple,
  Bone,
  Sparkles,
  Activity,
  Check,
  Quote,
  Shield,
  Award,
  FlaskConical,
  MapPin,
  Clock,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../auth/AuthContext";
import { useMe } from "../../../auth/user/useMe";
import { cartApi } from "../../../auth/cart/cartApi";
import { getProductBySlug } from "../../../auth/product/products";

/* ----------------------------- small helpers ----------------------------- */
const safe = (x, def = []) => (Array.isArray(x) ? x : def);
const obj = (x) => (x && typeof x === "object" ? x : {});
const num = (x) => Number(x ?? 0);

/* ========================================================================
   MAIN PAGE (single-file, all sections below as inline components)
   ======================================================================== */
export default function ProductPageAlt() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [language, setLanguage] = useState("en"); // 'en' | 'hi'
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

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
        setProduct(null);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [slug]);

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
          <h1 className="text-2xl font-bold mb-2">Product not found</h1>
          <p className="mb-6">We couldn’t find a product for “{slug}”.</p>
          <a
            href="/products"
            className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700"
          >
            Back to Products
          </a>
        </div>
      </div>
    );
  }

  const productData = { data: product };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* Language toggle */}
      <div className="fixed top-4 py-30 right-4 z-50">
        <button
          onClick={() => setLanguage(language === "en" ? "hi" : "en")}
          className="bg-white px-4 py-2 rounded-full shadow-lg border-2 border-amber-200 hover:border-amber-400 transition-all font-medium text-sm"
        >
          {language === "en" ? "हिंदी" : "English"}
        </button>
      </div>

      {/* Sections (inline components below) */}
      <ProductHero data={productData} language={language} />
      <ProductInfo data={productData} language={language} />
      <KeyBenefits data={productData} language={language} />
      <HowItWorks data={productData} language={language} />
      <KeyHerbs data={productData} language={language} />
      <Ingredients data={productData} language={language} />
      <Usage data={productData} language={language} />
      <Reviews data={productData} language={language} />
      <FAQ data={productData} language={language} />
      <TrustBadges data={productData} language={language} />
      <BackToTop />
    </div>
  );
}

/* ========================================================================
   INLINE SECTIONS
   ======================================================================== */

function ProductHero({ data, language = "en" }) {
  const product = obj(data?.data);
  const mrp = num(product.mrp);
  const sp = num(product.sellingPrice ?? product.price);
  const discount = mrp > 0 ? Math.round(((mrp - sp) / mrp) * 100) : 0;
  const tags = safe(product.tags);

  // NEW: quantity state (min 1, max = stock or 10 fallback)
  const [qty, setQty] = React.useState(1);
  const stock = Math.max(0, num(product.stock));
  const MAX_QTY = stock > 0 ? Math.min(stock, 10) : 10;
  const clampQty = (n) => Math.min(Math.max(n, 1), MAX_QTY);

  // ---- Auth + user ----
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { me } = useMe({ skip: !isAuthenticated });
  const userId = me?.id;
  const productId = product?.id ?? product?.productId;

  // UI states for CTA buttons
  const [adding, setAdding] = React.useState(false);
  const [added, setAdded] = React.useState(false);

  const addToCartFlow = async () => {
    if (!userId) {
      if (typeof toast === "function") {
        toast.error(
          language === "en"
            ? "Please log in to add items to your cart."
            : "कृपया कार्ट में जोड़ने के लिए लॉगिन करें।"
        );
      }
      navigate("/login", {
        state: { from: `/products/${product?.slug || product?.id}` },
      });
      return;
    }
    try {
      setAdding(true);
      await cartApi.addItem(userId, productId, qty);
      setAdded(true);
      window.dispatchEvent(new CustomEvent("cart:changed"));
      if (typeof toast === "function") {
        toast.success(
          language === "en" ? "Added to cart" : "कार्ट में जोड़ा गया"
        );
      }
      setTimeout(() => setAdded(false), 1500);
    } catch (e) {
      console.error(e);
      if (typeof toast === "function") {
        toast.error(
          language === "en"
            ? "Couldn't add to cart. Please try again."
            : "कार्ट में जोड़ने में समस्या हुई।"
        );
      }
    } finally {
      setAdding(false);
    }
  };

  /* ------------------------------------------------------------------
     ✅ FIXED: Buy Now → ensures item in cart → jumps to /address
     ------------------------------------------------------------------ */
  const buyNowFlow = async () => {
    // If not logged in, send to login with next=/address
    if (!userId) {
      const next = encodeURIComponent("/address?buynow=1");
      navigate(`/login?next=${next}`, {
        replace: true,
        state: { from: `/products/${product?.slug || product?.id}` },
      });
      return;
    }
    try {
      await cartApi.addItem(userId, productId, qty); // ensure item exists in server cart
      window.dispatchEvent(new CustomEvent("cart:changed"));
      navigate("/address?buynow=1"); // go straight to place-order/address page
    } catch (e) {
      console.error(e);
      if (typeof toast === "function") {
        toast.error(
          language === "en"
            ? "Something went wrong. Please try again."
            : "कुछ गलत हो गया, कृपया फिर से प्रयास करें।"
        );
      }
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-amber-100 via-orange-50 to-amber-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmYjkyM2MiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzMuMzEgMCA2IDIuNjkgNiA2cy0yLjY5IDYtNiA2LTYtMi42OS02LTYgMi42OS02IDYtNk0yMCA0MGMzLjMxIDAgNiAyLjY5IDYgNnMtMi42OSA2LTYgNi02LTIuNjktNi02IDIuNjktNiA2LTYiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 relative">
        <div className="grid lg:grid-cols-2 py-8 gap-12 items-center">
          <div className="order-2 lg:order-1">
            {tags.includes("BESTSELLER") && (
              <span className="inline-block px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold mb-4 shadow-lg">
                {language === "en" ? "⭐ BESTSELLER" : "⭐ बेस्टसेलर"}
              </span>
            )}

            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              {language === "en" ? product.title : product.titleHi}
            </h1>

            <p className="text-xl lg:text-2xl text-amber-700 font-medium mb-4">
              {language === "en" ? product.subtitle : product.subtitleHi}
            </p>

            <p className="text-lg text-gray-700 italic mb-6">
              {language === "en" ? product.tagline : product.taglineHi}
            </p>

            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-gray-600">
                ({safe(product.reviews).length}{" "}
                {language === "en" ? "reviews" : "समीक्षाएं"})
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {safe(language === "en" ? product.tagsEn : product.tagsHi)
                .slice(0, 4)
                .map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-white border border-amber-200 rounded-full text-sm text-gray-700"
                  >
                    {tag}
                  </span>
                ))}
            </div>

            {/* COMPACT: Price + Qty + Buttons */}
            <div className="bg-white rounded-xl p-4 shadow-md border border-amber-200 mb-4 max-w-md">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-bold text-gray-900">₹{sp}</span>
                {mrp > 0 && (
                  <span className="text-lg text-gray-400 line-through">₹{mrp}</span>
                )}
                {discount > 0 && (
                  <span className="px-2 py-0.5 bg-green-500 text-white rounded-full text-xs font-semibold">
                    {discount}% OFF
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-600 mb-3">
                {language === "en" ? (
                  <p>
                    <span className="font-semibold">Package:</span>{" "}
                    {product.qtySize} {product.qtyUnit} • {product.courseTime} days course
                  </p>
                ) : (
                  <p>
                    <span className="font-semibold">पैकेज:</span>{" "}
                    {product.qtySize} {product.qtyUnit} • {product.courseTime} दिन का कोर्स
                  </p>
                )}
              </div>

              {/* Quantity selector (compact) */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-800 mb-1">
                  {language === "en" ? "Quantity" : "मात्रा"}
                </label>
                <div className="flex items-center gap-3">
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

                  <span className="text-xs text-gray-500">
                    {stock > 0
                      ? language === "en"
                        ? `${stock} in stock`
                        : `${stock} स्टॉक में`
                      : language === "en"
                        ? "Out of stock"
                        : "स्टॉक खत्म"}
                  </span>
                </div>
              </div>

              {/* Buttons (compact) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={addToCartFlow}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                  disabled={stock === 0 || adding}
                  type="button"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {adding
                    ? language === "en"
                      ? "Adding..."
                      : "जोड़ रहे हैं..."
                    : added
                      ? language === "en"
                        ? "Added ✓"
                        : "जोड़ दिया ✓"
                      : language === "en"
                        ? "Add to Cart"
                        : "कार्ट में जोड़ें"}
                </button>

                <button
                  onClick={buyNowFlow}
                  className="w-full bg-white border border-amber-300 text-amber-700 hover:bg-amber-50 font-semibold py-3 rounded-lg transition-all shadow-md disabled:opacity-60"
                  disabled={stock === 0}
                  type="button"
                >
                  {language === "en" ? "Buy Now" : "अभी खरीदें"}
                </button>
              </div>

              {stock < 20 && stock > 0 && (
                <p className="text-center text-red-600 text-xs mt-2 font-medium">
                  {language === "en"
                    ? `Only ${stock} left in stock!`
                    : `स्टॉक में केवल ${stock} बचे!`}
                </p>
              )}
            </div>

            {product.labReport ? (
              <a
                href={product.labReport}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-amber-700 hover:text-amber-800 font-medium"
              >
                {language === "en" ? "📋 View Lab Report" : "📋 लैब रिपोर्ट देखें"}
              </a>
            ) : null}
          </div>

          <div className="order-0 lg:order-1 -mt-10 md:-mt-20 lg:-mt-26">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-3xl transform rotate-3 blur-2xl opacity-30"></div>
              <img
                src={product.productImg || product.image}
                alt={product.title || "Product"}
                className="relative transform hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductInfo({ data, language = "en" }) {
  const product = obj(data?.data);
  const why = safe(language === "en" ? product.whyChoose : product.whyChooseHi);
  const ideal = safe(language === "en" ? product.idealFor : product.idealForHi);
  const whyHerbs = safe(language === "en" ? product.whyherbs : product.whyherbsHi);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {language === "en" ? "About This Product" : "उत्पाद के बारे में"}
            </h2>
            <p className="text-gray-700 leading-relaxed text-lg mb-8">
              {language === "en" ? product.longDesc : product.longDescHi}
            </p>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "en" ? "Why Choose This?" : "क्यों चुनें?"}
              </h3>
              <div className="space-y-3">
                {why.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-800">{item}</span>
                  </div>
                ))}
                {!why.length && (
                  <div className="text-gray-500 italic">No reasons added</div>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {language === "en" ? "Ideal For" : "उपयुक्त"}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {ideal.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl"
                  >
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-800 text-sm">{item}</span>
                  </div>
                ))}
                {!ideal.length && (
                  <div className="col-span-full text-center text-gray-500 italic">
                    No audience added
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {language === "en" ? "Ayurvedic Wisdom" : "आयुर्वेदिक ज्ञान"}
              </h3>
              <div className="space-y-3">
                {whyHerbs.map((item, i) => (
                  <p key={i} className="text-gray-700 leading-relaxed">
                    {item}
                  </p>
                ))}
                {!whyHerbs.length && (
                  <div className="text-gray-500 italic">No content added</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KeyBenefits({ data, language = "en" }) {
  const product = obj(data?.data);
  const list = safe(
    language === "en" ? product.keyBenefits : product.keyBenefitsHi
  );
  const icons = [Heart, Zap, Brain, Moon, Apple, Bone, Sparkles, Activity];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-amber-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Key Benefits" : "मुख्य लाभ"}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {language === "en"
              ? "Experience holistic wellness with every dose"
              : "हर खुराक के साथ समग्र स्वास्थ्य का अनुभव करें"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((benefit, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={i}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-amber-100"
              >
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <p className="text-gray-800 font-medium leading-relaxed">
                  {benefit}
                </p>
              </div>
            );
          })}
          {!list.length && (
            <div className="col-span-full text-center text-gray-500 italic">
              No benefits added
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HowItWorks({ data, language = "en" }) {
  const product = obj(data?.data);
  const items = safe(
    language === "en" ? product.howItWorks : product.howItWorksHi
  );

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "How It Works" : "यह कैसे काम करता है"}
          </h2>
          <p className="text-lg text-gray-600">
            {language === "en"
              ? "Powered by nature's most potent herbs"
              : "प्रकृति की सबसे शक्तिशाली जड़ी-बूटियों से संचालित"}
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item, i) => {
            const [herb, description] = String(item || "").split(":");
            return (
              <div
                key={i}
                className="group bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border-l-4 border-amber-500"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 rounded-lg p-3 group-hover:bg-amber-200 transition-colors">
                    <Leaf className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {herb}
                    </h3>
                    <p className="text-gray-700">{description}</p>
                  </div>
                </div>
              </div>
            );
          })}
          {!items.length && (
            <div className="text-center text-gray-500 italic">No data added</div>
          )}
        </div>
      </div>
    </div>
  );
}

function KeyHerbs({ data, language = "en" }) {
  const product = obj(data?.data);

  // ---------- tiny helpers (scoped to this component) ----------
  const isPresent = (v) =>
    !(v === null || v === undefined || (typeof v === "string" && v.trim() === ""));
  const nonEmptyPair = (o) => !!(o && (isPresent(o.en) || isPresent(o.hi)));

  // Merge EN/HI arrays by index (like old page)
  const mergeByIndex = (enArr = [], hiArr = []) => {
    const len = Math.max(enArr.length, hiArr.length);
    return Array.from({ length: len }).map((_, i) => {
      const en = enArr[i];
      const hi = hiArr[i];
      return {
        en: typeof en === "string" ? en : en?.titleEn || en?.en || en?.title || "",
        hi: typeof hi === "string" ? hi : hi?.titleHi || hi?.hi || hi?.title || "",
      };
    });
  };

  // ---------- build bilingual "key herbs" like the old page ----------
  const keyHerbDetailsRaw = safe(
    product?.keyHerbDetails ||
      product?.keyHerbsDetails ||
      product?.keyherbdetails ||
      product?.keyherbsdetails
  );

  // If you also have simple keyherbs lists:
  const khEnRaw = safe(product?.keyherbs || product?.keyHerbs);
  const khHiRaw = safe(product?.keyherbsHi || product?.keyHerbsHi);

  // Prefer explicit (title/desc) details; fallback to simple arrays if needed
  let keyherbs = keyHerbDetailsRaw.map((h) => ({
    // Build "Title: Description" style strings (old behavior)
    en: [h?.herbTitleEn, h?.herbDescEn].filter(isPresent).join(": "),
    hi: [h?.herbTitleHi, h?.herbDescHi].filter(isPresent).join(": "),
  }));

  if (!keyherbs.length || keyherbs.every((k) => !isPresent(k.en) && !isPresent(k.hi))) {
    keyherbs = mergeByIndex(khEnRaw, khHiRaw);
  }

  const keyherbsSafe = keyherbs.filter(nonEmptyPair);

  // ---------- "Why These Herbs?" bilingual lines ----------
  const whyherbsEnRaw = safe(product?.whyherbs || product?.whyHerbs);
  const whyherbsHiRaw = safe(product?.whyherbsHi || product?.whyHerbsHi);
  const whyherbs = [
    ...whyherbsEnRaw.filter(isPresent).map((t) => ({ en: t })),
    ...whyherbsHiRaw.filter(isPresent).map((t) => ({ hi: t })),
  ];
  const whyherbsSafe = whyherbs.filter(nonEmptyPair);

  // ---------- render ----------
  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Key Herbs" : "मुख्य जड़ी-बूटियाँ"}
          </h2>
          <p className="text-lg text-gray-600">
            {language === "en"
              ? "Traditional herbs backed by ancient wisdom"
              : "प्राचीन ज्ञान द्वारा समर्थित पारंपरिक जड़ी-बूटियाँ"}
          </p>
        </div>

        {/* Herbs grid (EN with optional HI chip + description lines) */}
        {keyherbsSafe.length ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyherbsSafe.map((row, i) => {
              const [nameEn, descEn] = row.en
                ? String(row.en).split(":").map((s) => s.trim())
                : [];
              const [nameHi, descHi] = row.hi
                ? String(row.hi).split(":").map((s) => s.trim())
                : [];

              return (
                <div
                  key={i}
                  className="p-6 bg-white/95 backdrop-blur-sm rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all duration-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-emerald-700">
                        {nameEn || nameHi || "Herb"}
                      </h4>
                      {nameHi ? (
                        <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-900 px-2.5 py-1 text-xs font-semibold">
                          {nameHi}
                        </span>
                      ) : null}
                    </div>

                    {descEn ? (
                      <p className="text-sm text-slate-800">{descEn}</p>
                    ) : null}
                    {descHi ? (
                      <p className="text-xs text-slate-600">{descHi}</p>
                    ) : null}
                    {!descEn && !descHi ? (
                      <p className="text-sm italic text-slate-500">No description added</p>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-slate-500 italic">No key herbs added</p>
        )}

        {/* Optional: why these herbs */}
        {whyherbsSafe.length ? (
          <div className="mt-10 bg-white rounded-2xl p-6 border border-emerald-100">
            <h3 className="text-xl font-bold mb-3">
              {language === "en" ? "Why These Herbs?" : "ये जड़ी-बूटियाँ क्यों?"}
            </h3>
            <ul className="list-disc pl-6 text-slate-800 space-y-1">
              {whyherbsSafe.map((row, i) => (
                <li key={i}>{language === "en" ? row.en || row.hi : row.hi || row.en}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Ingredients({ data, language = "en" }) {
  const product = obj(data?.data);
  const ingredients = safe(product.ingredients);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Full Ingredients List" : "सामग्री की पूरी सूची"}
          </h2>
          <p className="text-lg text-gray-600">
            {language === "en"
              ? "Complete transparency in every gram"
              : "हर ग्राम में पूर्ण पारदर्शिता"}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
            <div className="grid grid-cols-4 gap-4 text-white font-semibold">
              <div>{language === "en" ? "Herb" : "जड़ी-बूटी"}</div>
              <div>{language === "en" ? "Hindi Name" : "हिंदी नाम"}</div>
              <div>{language === "en" ? "Latin Name" : "लैटिन नाम"}</div>
              <div className="text-right">
                {language === "en" ? "Quantity" : "मात्रा"}
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-100">
            {ingredients.map((ing, i) => (
              <div
                key={i}
                className="grid grid-cols-4 gap-4 p-4 hover:bg-amber-50 transition-colors"
              >
                <div className="font-medium text-gray-900">
                  {ing?.herbName || "-"}
                </div>
                <div className="text-gray-700">{ing?.herbNameHi || "-"}</div>
                <div className="text-gray-600 italic text-sm">
                  {ing?.latinName || "-"}
                </div>
                <div className="text-right font-semibold text-amber-600">
                  {ing?.qtyGrams != null ? `${ing.qtyGrams}g` : "-"}
                </div>
              </div>
            ))}
            {!ingredients.length && (
              <div className="p-6 text-center text-gray-500 italic">
                No ingredients added
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 text-center text-sm text-gray-600 italic">
            {language === "en"
              ? "+ 24 more traditional herbs for complete wellness"
              : "+ 24 अन्य पारंपरिक जड़ी-बूटियाँ पूर्ण स्वास्थ्य के लिए"}
          </div>
        </div>
      </div>
    </div>
  );
}

function Usage({ data, language = "en" }) {
  const product = obj(data?.data);
  const usage = safe(language === "en" ? product.usage : product.usageHi);
  const safety = safe(language === "en" ? product.safetyFirst : product.safetyFirstHi);
  const precautions = safe(
    language === "en" ? product.precautionsWarnings : product.precautionsWarningsHi
  );

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-50 to-cyan-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-blue-200">
            <div className="bg-gradient-to-br from-blue-400 to-cyan-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {language === "en" ? "How to Use" : "उपयोग विधि"}
            </h3>
            <div className="space-y-3">
              {usage.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
              {!usage.length && (
                <div className="text-gray-500 italic">No usage added</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-amber-200">
            <div className="bg-gradient-to-br from-amber-400 to-orange-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {language === "en" ? "Safety First" : "सुरक्षा पहले"}
            </h3>
            <div className="space-y-3">
              {safety.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
              {!safety.length && (
                <div className="text-gray-500 italic">No safety notes</div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-xl border border-red-200">
            <div className="bg-gradient-to-br from-red-400 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <AlertCircle className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {language === "en" ? "Precautions" : "सावधानियां"}
            </h3>
            <div className="space-y-3">
              {precautions.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
              {!precautions.length && (
                <div className="text-gray-500 italic">No precautions added</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Reviews({ data, language = "en" }) {
  const product = obj(data?.data);
  const reviews = safe(product.reviews);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "What Our Customers Say" : "हमारे ग्राहक क्या कहते हैं"}
          </h2>
          <p className="text-lg text-gray-600">
            {language === "en"
              ? "Real experiences from real people"
              : "वास्तविक लोगों के वास्तविक अनुभव"}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.map((review, idx) => (
            <div
              key={review?.reviewId || `${review?.name}-${idx}`}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <Quote className="w-8 h-8 text-amber-400 mb-4" />

              <div className="flex mb-3">
                {[...Array(num(review?.rating))].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{review?.review}</p>

              <div className="border-t pt-4">
                <p className="font-semibold text-gray-900">{review?.name}</p>
                {review?.age ? (
                  <p className="text-sm text-gray-500">
                    {language === "en" ? `Age ${review.age}` : `उम्र ${review.age}`}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
          {!reviews.length && (
            <div className="col-span-full text-center text-gray-500 italic">
              No reviews yet
            </div>
          )}
        </div>

        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-100 to-orange-100 px-6 py-3 rounded-full">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-gray-900">
              5.0 {language === "en" ? "average rating" : "औसत रेटिंग"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FAQ({ data, language = "en" }) {
  const product = obj(data?.data);
  const faqs = safe(product.faqs);
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Frequently Asked Questions" : "अक्सर पूछे जाने वाले प्रश्न"}
          </h2>
          <p className="text-lg text-gray-600">
            {language === "en" ? "Everything you need to know" : "आपको जानने की जरूरत है सब कुछ"}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div
              key={faq?.faqId || i}
              className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between hover:bg-amber-50 transition-colors"
              >
                <span className="text-left font-semibold text-gray-900 text-lg">
                  {language === "en" ? faq?.que : faq?.queHi}
                </span>
                <ChevronDown
                  className={`w-6 h-6 text-amber-600 transition-transform flex-shrink-0 ml-4 ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === i ? "max-h-48" : "max-h-0"
                }`}
              >
                <div className="px-6 pb-5 text-gray-700 leading-relaxed">
                  {language === "en" ? faq?.ans : faq?.ansHi}
                </div>
              </div>
            </div>
          ))}

          {!faqs.length && (
            <div className="text-center text-gray-500 italic">No FAQs added</div>
          )}
        </div>
      </div>
    </div>
  );
}

function TrustBadges({ data, language = "en" }) {
  const product = obj(data?.data);
  const badges = safe(product.trustBadges);
  const tagsEn = safe(product.trustBadgestag);
  const tagsHi = safe(product.trustBadgestagHi);
  const tagLine = (language === "en" ? tagsEn : tagsHi)[0];
  const icons = [Award, Shield, FlaskConical, MapPin];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {language === "en" ? "Our Commitment to Quality" : "गुणवत्ता के प्रति हमारी प्रतिबद्धता"}
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {badges.map((badge, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div
                key={`${badge}-${i}`}
                className="bg-white rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <p className="font-semibold text-gray-900">{badge}</p>
              </div>
            );
          })}
          {!badges.length && (
            <div className="col-span-full text-center text-gray-500 italic">
              No badges added
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-12 shadow-2xl border-2 border-amber-200 text-center">
          {tagLine ? (
            <p className="text-2xl text-gray-800 mb-8 leading-relaxed">{tagLine}</p>
          ) : null}

          <button
            onClick={() => (window.location.href = "/address?buynow=1")}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-12 py-4 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            {language === "en" ? "Order Now" : "अभी ऑर्डर करें"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BackToTop() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      onClick={goTop}
      aria-label="Back to top"
      className={`fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-1/2 z-50
            -translate-x-1/2
            rounded-full shadow-lg border-2 border-amber-200
            bg-gradient-to-r from-amber-500 to-orange-500 text-white p-3
            hover:from-amber-600 hover:to-orange-600 transition-all
            md:p-4 md:text-lg
            ${show
              ? "opacity-100 translate-y-0 pointer-events-auto"
              : "opacity-0 translate-y-3 pointer-events-none"}`}
    >
      <ArrowUp className="w-5 h-5" />
    </button>
  );
}
