// src/pages/ProductPageAlt.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star, Shield, Sparkles, Clock, Award, Heart,
  ChevronDown, Tag, FileText, BadgeCheck, Pill as PillIcon,
  Utensils, Moon, Gauge, Scale, Apple, Beaker, AlertTriangle, Info,
  Truck, Repeat2, ShieldCheck, Leaf, ExternalLink, ShoppingCart, ShoppingBag,
  Facebook, Twitter, Linkedin, Zap, Brain
} from "lucide-react";
import { getProductBySlug } from "../../../auth/product/products";

/* ------------------------------ utilities ------------------------------ */
const cn = (...a) => a.filter(Boolean).join(" ");
const cleanArray = (arr) => (Array.isArray(arr) ? arr.filter(Boolean) : []);
const hasItems = (arr) => cleanArray(arr).length > 0;
const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number(num || 0));

/* ----------------------------- small UI bits ---------------------------- */
function RatingStars({ value = 0, className }) {
  const n = Math.max(0, Math.min(5, Number(value) || 0));
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("w-4 h-4", i < n ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
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
          className="inline-flex items-center gap-1 rounded-full bg-[#faeade]/60 text-emerald-900 px-3 py-1 text-xs font-semibold ring-1 ring-[#f3cdbf]"
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
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 grid place-items-center ring-1 ring-emerald-200">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[12px] text-emerald-700/80">{label}</div>
        <div className="text-sm font-semibold text-emerald-900">{value || "No data added"}</div>
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
    return () => { mounted = false; };
  }, [slug]);

  /* -------------------------- derive product fields -------------------------- */
  const title = product?.title || product?.name || "No data added";
  const titleHi = product?.titleHi;
  const subtitle = product?.subtitle;
  const subtitleHi = product?.subtitleHi;
  const tagline = product?.tagline;
  const taglineHi = product?.taglineHi;

  const price = product?.sellingPrice ?? product?.price;
  const mrp = product?.mrp;
  const stock = Number(product?.stock ?? 0);
  const weightText = [product?.qtySize, product?.qtyUnit].filter(Boolean).join(" ");
  const img = product?.productImg || product?.image || "https://placehold.co/800x600?text=No+Image";

  const indication = product?.indication;
  const indicationHi = product?.indicationHi;

  const labReport = product?.labReport || null;
  const courseTime = product?.courseTime;

  const priceText = price != null ? formatINR(price) : null;
  const mrpText = mrp != null ? formatINR(mrp) : null;
  const discountPct = price != null && mrp != null && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;

  // Descriptions (EN / HI)
  const descriptionEn = cleanArray([product?.shortDesc, product?.longDesc]).filter(Boolean);
  const descriptionHi = cleanArray([product?.shortDescHi, product?.longDescHi]).filter(Boolean);

  // Ingredients
  const ingredients = cleanArray(product?.ingredients);

  // Usage
  const usageEn = cleanArray(product?.usage);
  const usageHi = cleanArray(product?.usageHi);

  // Safety / Precautions
  const safetyEn = cleanArray(product?.safetyFirst);
  const safetyHi = cleanArray(product?.safetyFirstHi);
  const precautionsEn = cleanArray(product?.precautionsWarnings);
  const precautionsHi = cleanArray(product?.precautionsWarningsHi);

  // Ideal For
  const idealForEn = cleanArray(product?.idealFor);
  const idealForHi = cleanArray(product?.idealForHi);

  // Categories / Variants / Tags
  const categories = cleanArray(product?.categories?.map((c) => c?.categoryName).filter(Boolean));
  const variants = cleanArray(product?.variants?.map((v) => v?.form).filter(Boolean));
  const tagsEn = cleanArray(product?.tagsEn || product?.tags);
  const tagsHi = cleanArray(product?.tagsHi);

  // Why Choose
  const whyChooseEn = cleanArray(product?.whyChoose);
  const whyChooseHi = cleanArray(product?.whyChooseHi);
  const whyChoose = mergeByIndex(whyChooseEn, whyChooseHi);

  // Key Benefits
  const kbEn = cleanArray(product?.keyBenefits);
  const kbHi = cleanArray(product?.keyBenefitsHi);
  const keyBenefits = mergeByIndex(kbEn, kbHi, true);

  // How it works (pairing bullets)
  const howEn = cleanArray(product?.howItWorks);
  const howHi = cleanArray(product?.howItWorksHi);
  const howItWorks = mergeByIndex(howEn, howHi);

  // Key Herbs & Why Herbs
  const khEn = cleanArray(product?.keyherbs || product?.keyHerbs);
  const khHi = cleanArray(product?.keyherbsHi || product?.keyHerbsHi);
  const keyherbs = mergeByIndex(khEn, khHi);

  const whyherbsEn = cleanArray(product?.whyherbs || product?.whyHerbs);
  const whyherbsHi = cleanArray(product?.whyherbsHi || product?.whyHerbsHi);
  const whyherbs = [...whyherbsEn.map((t) => ({ en: t })), ...whyherbsHi.map((t) => ({ hi: t }))];

  // Trust & Compliance
  const trustBadges = cleanArray(product?.trustBadges);
  const trustBadgestagEn = cleanArray(product?.trustBadgestag);
  const trustBadgestagHi = cleanArray(product?.trustBadgestagHi);

  // FAQs bilingual (que/ans + queHi/ansHi)
  const faqsRaw = cleanArray(product?.faqs);
  const faqs = faqsRaw.map((f) => ({
    q: f?.que, a: f?.ans, qHi: f?.queHi, aHi: f?.ansHi,
  }));

  // Reviews
  const reviews = cleanArray(product?.reviews);

  // Safety split
  const safetyAll = [...safetyEn.map((t) => ({ en: t })), ...safetyHi.map((t) => ({ hi: t }))];
  const precAll = [...precautionsEn.map((t) => ({ en: t })), ...precautionsHi.map((t) => ({ hi: t }))];

  const notFor = safetyAll.filter((o) =>
    /(not\s*for|pregnan|स्तनपान|गर्भ|breastfeed|child|बच्च|children|infant|<\s*5)/i.test(`${o.en || ""} ${o.hi || ""}`)
  );
  const importantNotes = [
    ...precAll,
    ...safetyAll.filter((o) =>
      !/(not\s*for|pregnan|स्तनपान|गर्भ|child|बच्च|children|infant|<\s*5)/i.test(`${o.en || ""} ${o.hi || ""}`)
    ),
  ];

  const averageRating = reviews.length
    ? Math.round(reviews.reduce((s, r) => s + (Number(r?.rating) || 0), 0) / reviews.length)
    : 0;

  /* --------------------------------- actions -------------------------------- */
  const inc = () => setQty((q) => Math.min(99, q + 1));
  const dec = () => setQty((q) => Math.max(1, q - 1));
  const addToCart = () => { if (!product) return; alert(`Added ${qty} x ${title || "Item"} to cart`); };
  const buyNow = () => { addToCart(); navigate("/checkout"); };

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
          <h1 className="text-2xl font-bold text-emerald-900 mb-2">Product not found</h1>
          <p className="text-emerald-800/70 mb-6">We couldn’t find a product for “{slug}”.</p>
          <Link to="/products" className="bg-emerald-600 text-white px-5 py-2 rounded-md hover:bg-emerald-700">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  /* ----------------------------------- UI ----------------------------------- */
  return (
    <div className="min-h-screen text-emerald-900 bg-gradient-to-b from-[#fff7f2] via-[#fffaf5] to-[#faeade]/25 relative">
      {/* Header / breadcrumb */}
      <header className="border-b border-amber-100/60 bg-[#faeade]">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <nav className="text-sm text-slate-700">
            <Link to="/" className="hover:underline">Home</Link>
            <span className="mx-2 text-slate-500">/</span>
            <Link to="/products" className="hover:underline">Products</Link>
            <span className="mx-2 text-slate-500">/</span>
            <span className="font-medium">{title || "Product"}</span>
          </nav>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold">
            <Leaf className="w-5 h-5" />
            Amrit Ayu
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT */}
        <aside className="self-start">
          <div className="relative rounded-[28px] overflow-hidden ring-1 ring-[#f3cdbf] shadow-[0_10px_40px_rgba(250,234,222,0.7)] bg-white">
            <img
              src={img}
              alt={title || "Product image"}
              className="w-full h-[520px] object-contain bg-gradient-to-b from-[#faeade]/40 to-white"
            />

            {/* Lab report badge/link (if present) */}
            <div className="absolute bottom-3 right-3">
              {labReport ? (
                <a
                  href={labReport}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur ring-1 ring-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-white"
                >
                  <FileText className="w-4 h-4" /> Lab Report <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur ring-1 ring-amber-200 text-amber-800 text-xs font-semibold">
                  <FileText className="w-4 h-4" /> No Lab Report
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
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
        <section className="self-start">
          <h1 className="text-3xl font-extrabold leading-tight">{title || "No data added"}</h1>
          {titleHi ? <div className="text-xl font-semibold text-emerald-800/90 mt-1">{titleHi}</div> : null}

          {subtitle ? <p className="mt-2 text-emerald-900/85">{subtitle}</p> : <p className="mt-2 italic text-emerald-900/70">No data added</p>}
          {subtitleHi ? <p className="text-emerald-800/85">{subtitleHi}</p> : null}

          {tagline ? <p className="mt-1 text-emerald-900/85">{tagline}</p> : <p className="text-emerald-900/70 italic">No data added</p>}
          {taglineHi ? <p className="text-emerald-800/85">{taglineHi}</p> : null}

          <div className="mt-2">
            {indication ? <p className="text-sm"><b>Indication:</b> {indication}</p> : <p className="text-sm italic text-emerald-900/70">Indication: No data added</p>}
            {indicationHi ? <p className="text-sm"><b>संकेत:</b> {indicationHi}</p> : null}
          </div>

          {/* Quick badges row: Course time & Lab report */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="default" className="gap-2">
              <Clock className="w-4 h-4" /> Course Time: {courseTime ? `${courseTime} days` : "No data added"}
            </Badge>
            <Badge variant="secondary" className="gap-2">
              <FileText className="w-4 h-4" />
              {labReport ? <a href={labReport} target="_blank" rel="noreferrer" className="underline">View Lab Report</a> : "No data added"}
            </Badge>
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-emerald-800/70 text-sm">Our Price:</div>
            <div className="flex items-end gap-3">
              {mrpText && priceText && mrp > (price || 0) && <span className="text-gray-400 line-through text-lg">{mrpText}</span>}
              {priceText ? <span className="text-3xl font-extrabold text-emerald-900">{priceText}</span> : <span className="italic text-emerald-900/70">No data added</span>}
              {discountPct != null && (
                <span className="rounded-full bg-[#faeade] px-3 py-1 text-xs font-bold text-emerald-900 ring-1 ring-[#f3cdbf]">-{discountPct}%</span>
              )}
            </div>
            {weightText ? <div className="text-emerald-900/80 text-sm">Weight: {weightText}</div> : <div className="text-emerald-900/60 text-sm">Weight: No data added</div>}
            <div className="mt-1">
              {stock > 0 ? (
                <span className="text-xs px-3 py-1 rounded bg-emerald-600 text-white">{stock} in stock</span>
              ) : (
                <span className="text-xs px-3 py-1 rounded bg-rose-100 text-rose-700">{stock === 0 ? "Out of stock" : "No data added"}</span>
              )}
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded ring-1 ring-emerald-200 overflow-hidden bg-white">
              <button className="px-3 py-2 hover:bg-emerald-50" onClick={dec} disabled={qty <= 1}>-</button>
              <input className="w-16 text-center bg-transparent py-2 border-x border-emerald-100" value={qty} readOnly />
              <button className="px-3 py-2 hover:bg-emerald-50" onClick={inc}>+</button>
            </div>

            <button
              onClick={addToCart}
              disabled={stock <= 0}
              className="bg-[#faeade] hover:bg-[#f6d7c9] text-emerald-900 font-semibold px-6 py-3 rounded inline-flex items-center gap-2 disabled:opacity-50 ring-1 ring-[#f3cdbf]"
            >
              <ShoppingCart className="w-4 h-4" /> ADD TO CART
            </button>

            <button
              onClick={buyNow}
              disabled={stock <= 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded inline-flex items-center gap-2 disabled:opacity-50"
            >
              BUY NOW — ONE CLICK
            </button>
          </div>

          {/* socials */}
          <div className="mt-4 flex items-center gap-4 text-emerald-800/70">
            <a href="#" className="hover:text-emerald-900" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
            <a href="#" className="hover:text-emerald-900" aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-emerald-900" aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a>
          </div>

          {/* intro EN + HI */}
          <div id="desc" className="mt-8 text-emerald-900/90 space-y-3 leading-relaxed">
            {hasItems(descriptionEn) ? descriptionEn.map((p, i) => <p key={`en-${i}`}>{p}</p>) : null}
            {hasItems(descriptionHi)
              ? descriptionHi.map((p, i) => <p key={`hi-${i}`} className="text-emerald-800/90">{p}</p>)
              : (!hasItems(descriptionEn) && <p className="italic text-emerald-900/70">No description added</p>)}
          </div>
        </section>
      </section>

      {/* Why Choose */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-extrabold text-[#3b2a18]">Why Choose {title || "No data added"}?</h3>
        </div>
        {hasItems(whyChoose) ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {whyChoose.map((row, i) => {
              const ICONS = [ShieldCheck, FileText, Beaker, BadgeCheck, Shield, Sparkles, Leaf, Award, Star];
              const Icon = ICONS[i % ICONS.length];
              const en = normalizeText(row.en);
              const hi = normalizeText(row.hi);
              return (
                <div key={i} className="rounded-2xl bg-white ring-1 ring-amber-100 p-6 shadow-sm hover:shadow-md transition">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl grid place-items-center bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><Icon className="w-6 h-6" /></div>
                    <div>
                      <div className="text-base font-semibold text-slate-800 leading-snug">{en || "No data added"}</div>
                      {hi ? <div className="text-sm text-amber-900 mt-1">{hi}</div> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-center italic text-slate-500">No data added</p>}
      </section>

      {/* Key Benefits */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <p className="text-amber-700/80 tracking-[0.2em] uppercase text-xs">मुख्य लाभ</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">Key Benefits</h3>
        </div>
        {hasItems(keyBenefits) ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {keyBenefits.map((b, i) => {
              const ICONS = [Shield, Zap, Brain, Moon, Apple, Sparkles, Award, Heart];
              const UseIcon = ICONS[i % ICONS.length];
              return (
                <div key={i} className="rounded-2xl bg-white p-8 ring-1 ring-amber-100 shadow-sm hover:shadow transition text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full grid place-items-center bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"><UseIcon className="w-8 h-8" /></div>
                  <div className="text-lg font-extrabold text-slate-800">{normalizeText(b.en) || "—"}</div>
                  {b.hi ? <div className="text-[15px] font-semibold text-emerald-700 mt-1">{normalizeText(b.hi)}</div> : null}
                  {b.enDesc ? <p className="mt-3 text-slate-700">{b.enDesc}</p> : null}
                  {b.hiDesc ? <p className="mt-1 text-[13px] text-slate-600">{b.hiDesc}</p> : null}
                </div>
              );
            })}
          </div>
        ) : <p className="text-center italic text-slate-500">No data added</p>}
      </section>

      {/* How it works (bullets) */}
      {hasItems(howItWorks) && (
        <section className="max-w-7xl mx-auto px-4 py-14">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800 text-center">How It Works</h3>
          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {howItWorks.map((row, i) => (
              <div key={i} className="flex items-start gap-3 bg-white ring-1 ring-amber-100 rounded-xl p-4">
                <Sparkles className="w-5 h-5 text-emerald-700 mt-1" />
                <div>
                  {row.en ? <div className="font-semibold text-slate-800">{row.en}</div> : null}
                  {row.hi ? <div className="text-sm text-amber-900 mt-1">{row.hi}</div> : null}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ingredients */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-3xl md:text-[32px] font-extrabold text-[#3b2a18] text-center">Ingredients</h2>
        <div className="mt-8 rounded-2xl bg-[#fffaf5] ring-1 ring-amber-100 p-6 shadow-sm overflow-x-auto">
          {hasItems(ingredients) ? (
            <table className="min-w-full border border-amber-100 rounded-lg">
              <thead className="bg-[#faeade]/50 text-amber-900 text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">Herb</th>
                  <th className="px-4 py-2 text-left">Latin Name</th>
                  <th className="px-4 py-2 text-left">Qty (g)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100 text-slate-700">
                {ingredients.map((ing, i) => (
                  <tr key={i} className="bg-white hover:bg-amber-50/50 transition align-top">
                    <td className="px-4 py-2">
                      <div>{ing?.herbName || "No data added"}</div>
                      {ing?.herbNameHi && ing.herbNameHi !== "---" ? (
                        <div className="text-[12px] text-amber-900/90">{ing.herbNameHi}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 italic text-slate-600">{ing?.latinName || "No data added"}</td>
                    <td className="px-4 py-2">{ing?.qtyGrams ?? "No data added"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="italic text-slate-500">No data added</p>}
        </div>
      </section>

      {/* Usage */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">How to Use</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <Utensils className="w-5 h-5" /> Usage (EN)
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-900/90">
              {hasItems(usageEn) ? usageEn.map((t, i) => <li key={i}>• {t}</li>) : <li className="italic opacity-70">No data added</li>}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <Utensils className="w-5 h-5" /> उपयोग (HI)
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-900/90">
              {hasItems(usageHi) ? usageHi.map((t, i) => <li key={i}>• {t}</li>) : <li className="italic opacity-70">No data added</li>}
            </ul>
          </Card>
        </div>
      </section>

      {/* Ideal For */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">Ideal For</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <BadgeCheck className="w-5 h-5" /> English
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-900/90">
              {hasItems(idealForEn) ? idealForEn.map((t, i) => <li key={i}>• {t}</li>) : <li className="italic opacity-70">No data added</li>}
            </ul>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <BadgeCheck className="w-5 h-5" /> हिन्दी
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-900/90">
              {hasItems(idealForHi) ? idealForHi.map((t, i) => <li key={i}>• {t}</li>) : <li className="italic opacity-70">No data added</li>}
            </ul>
          </Card>
        </div>
      </section>

      {/* Safety First */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">Safety First</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-2xl p-6 ring-1 ring-rose-200 bg-rose-50">
            <div className="flex items-center gap-2 font-semibold text-rose-900">
              <AlertTriangle className="w-5 h-5" /> Not For
            </div>
            <ul className="mt-3 space-y-1 text-sm text-rose-900/90">
              {hasItems(notFor) ? notFor.map((o, i) => <li key={i}>• {o.en || o.hi}</li>) : <li className="italic opacity-70">No data added</li>}
            </ul>
          </div>
          <div className="rounded-2xl p-6 ring-1 ring-emerald-200 bg-emerald-50">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <Info className="w-5 h-5" /> Important
            </div>
            <ul className="mt-3 space-y-1 text-sm text-emerald-900/90">
              {hasItems(importantNotes) ? importantNotes.map((o, i) => <li key={i}>• {o.en || o.hi}</li>) : <li className="italic opacity-70">No data added</li>}
            </ul>
          </div>
        </div>
      </section>

      {/* Key Herbs + Why These Herbs */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-10">
          <p className="text-amber-700/80 tracking-[0.2em] uppercase text-xs">प्रमुख जड़ी-बूटियाँ</p>
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">Key Herbs</h3>
        </div>
        {hasItems(keyherbs) ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyherbs.map((row, i) => {
              const [nameEn, descEn] = row.en ? String(row.en).split(":").map(s => s.trim()) : [];
              const [nameHi, descHi] = row.hi ? String(row.hi).split(":").map(s => s.trim()) : [];
              return (
                <Card key={i} className="p-6 hover:shadow-md transition-all duration-300 border border-amber-200 bg-white/95 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-emerald-700">{nameEn || nameHi || "Herb"}</h4>
                      {nameHi ? <Badge variant="secondary" className="text-xs">{nameHi}</Badge> : null}
                    </div>
                    {descEn ? <p className="text-sm text-slate-800">{descEn}</p> : null}
                    {descHi ? <p className="text-xs text-slate-600">{descHi}</p> : null}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : <p className="text-center text-slate-500 italic">No data added</p>}

        {hasItems(whyherbs) && (
          <div className="mt-10 rounded-2xl bg-[#fffaf5] ring-1 ring-amber-100 p-6 text-center text-slate-700 leading-relaxed">
            <h4 className="font-bold text-slate-800 mb-2">Why These Herbs?</h4>
            {whyherbs.map((r, i) => <p key={i} className="text-sm mb-1">{r.en || r.hi}</p>)}
          </div>
        )}
      </section>

      {/* Trust & Compliance */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="text-center mb-8">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-800">Trust & Compliance</h3>
        </div>
        <div className="rounded-2xl bg-white ring-1 ring-emerald-100 p-6">
          <div className="flex flex-wrap gap-2">
            {hasItems(trustBadges)
              ? trustBadges.map((t, i) => <Badge key={i} className="gap-2"><ShieldCheck className="w-4 h-4" /> {t}</Badge>)
              : <span className="italic text-emerald-900/70">No data added</span>}
          </div>
          <div className="mt-4 space-y-2 text-sm text-emerald-900/90">
            {hasItems(trustBadgestagEn) ? trustBadgestagEn.map((t, i) => <p key={`tbe-${i}`}>{t}</p>) : null}
            {hasItems(trustBadgestagHi) ? trustBadgestagHi.map((t, i) => <p key={`tbh-${i}`} className="text-amber-900">{t}</p>) : null}
            {!hasItems(trustBadgestagEn) && !hasItems(trustBadgestagHi) ? <p className="italic text-emerald-900/70">No data added</p> : null}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="max-w-7xl mx-auto px-4 py-14">
        <div className="rounded-2xl ring-1 ring-emerald-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">What Our Customers Say</h3>
            <RatingStars value={averageRating} />
          </div>
          {hasItems(reviews) ? (
            <div className="mt-4 grid md:grid-cols-2 gap-6">
              {reviews.map((r, i) => (
                <div key={i} className="bg-[#fffaf5] p-5 rounded-xl ring-1 ring-emerald-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{r?.name || "Verified Buyer"}</div>
                    <RatingStars value={r?.rating} />
                  </div>
                  {r?.age ? <div className="text-xs text-emerald-900/70 mb-2">Age: {r.age}</div> : null}
                  <p className="text-emerald-900/90 whitespace-pre-line">{r?.review || ""}</p>
                </div>
              ))}
            </div>
          ) : <p className="mt-3 text-emerald-900/70 italic">There are no reviews yet.</p>}

          {/* form shell (kept simple; wire up to API as needed) */}
      
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="max-w-7xl mx-auto px-4 pb-10">
        <div className="rounded-2xl ring-1 ring-emerald-100 bg-white p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Frequently Asked Questions</h3>
            <span className="text-emerald-800/70">→</span>
          </div>
          {hasItems(faqs) ? (
            <div className="mt-4 divide-y divide-emerald-100">
              {faqs.map((f, idx) => (
                <details key={idx} className="group">
                  <summary className="list-none flex items-center justify-between cursor-pointer py-3">
                    <span className="font-semibold">
                      {f.q || f.qHi || "Question"}
                      {f.qHi ? <span className="block text-sm text-amber-900">{f.qHi}</span> : null}
                    </span>
                    <ChevronDown className="w-5 h-5 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="pb-3 text-emerald-900/90 whitespace-pre-line">
                    {f.a || "No data added"}
                    {f.aHi ? <div className="mt-1 text-amber-900">{f.aHi}</div> : null}
                  </div>
                </details>
              ))}
            </div>
          ) : <p className="mt-3 text-emerald-900/70 italic">No data added</p>}
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
          en: typeof en === "string" ? en : (en?.titleEn || en?.en || en?.title),
          hi: typeof hi === "string" ? hi : (hi?.titleHi || hi?.hi || hi?.title),
          enDesc: typeof en === "string" ? "" : (en?.descEn || en?.subEn || en?.desc),
          hiDesc: typeof hi === "string" ? "" : (hi?.descHi || hi?.subHi || hi?.desc),
        }
      : {
          en: typeof en === "string" ? en : (en?.title || en?.en),
          hi: typeof hi === "string" ? hi : (hi?.title || hi?.hi),
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
    <span className={_cn(variants[variant] || variants.default, className)} {...props}>
      {children}
    </span>
  );
}
