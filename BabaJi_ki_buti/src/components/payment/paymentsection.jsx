// src/components/payment/paymentsection.jsx
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Shield, IndianRupee, ChevronDown, Tag } from "lucide-react";
import { addressApi } from "../../auth/address/addressApi";
import { cartApi } from "../../auth/cart/cartApi";
import { useMe } from "../../auth/user/useMe";
import { useNavigate, Link } from "react-router-dom";

/* ----------------------------- helpers ----------------------------- */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

const DELIVERY_THRESHOLD = 500;
const DELIVERY_FEE = 49;
const TAX_RATE = 0.05;

/* ----------------------------- component --------------------------- */
export default function PaymentSection({ userId: userIdProp }) {
  const navigate = useNavigate();

  // allow either prop or hook; keeps component reusable
  const { me, loading: meLoading } = typeof useMe === "function" ? useMe() : { me: null, loading: false };
  const userId = userIdProp ?? me?.id ?? null;

  const [addr, setAddr] = useState(null);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrError, setAddrError] = useState("");

  const [cart, setCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState("");

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);

  /* ---------- local cache helpers (same key as AddressPage) ---------- */
  const cacheKey = userId ? `addr_cache:${userId}` : null;

  const readDefaultFromCache = () => {
    if (!cacheKey) return null;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed?.addresses) ? parsed.addresses : [];
      return list.find((a) => a?.isDefault) ?? null;
    } catch {
      return null;
    }
  };

  /* -------- guard: require auth -------- */
  useEffect(() => {
    if (!meLoading && !userId) {
      navigate("/login?next=/payment", { replace: true });
    }
  }, [meLoading, userId, navigate]);

  /* -------- address: prime from cache, then fetch from server -------- */
  useEffect(() => {
    if (!userId) return;
    let ignore = false;

    const cachedDefault = readDefaultFromCache();
    if (cachedDefault) {
      setAddr(cachedDefault);
      setAddrLoading(false);
    }

    (async () => {
      try {
        setAddrLoading(true);
        setAddrError("");
        const a = await addressApi.getDefault(userId); // null if none
        if (!ignore) setAddr(a || null);
      } catch (e) {
        if (!ignore) setAddrError(e?.message || "Failed to load default address");
      } finally {
        if (!ignore) setAddrLoading(false);
      }
    })();

    // live updates from AddressPage
    const onAddressChanged = () => {
      const latest = readDefaultFromCache();
      if (latest) setAddr(latest);
    };
    const onStorage = (e) => {
      if (e.key === cacheKey) onAddressChanged();
    };
    window.addEventListener("address:changed", onAddressChanged);
    window.addEventListener("storage", onStorage);

    return () => {
      ignore = true;
      window.removeEventListener("address:changed", onAddressChanged);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, cacheKey]);

  /* -------- cart: fetch live from server -------- */
  useEffect(() => {
    if (!userId) return;
    let ignore = false;
    (async () => {
      try {
        setCartLoading(true);
        setCartError("");
        const c = await cartApi.getCart(userId);
        if (!ignore) setCart(c || { items: [] });
      } catch (e) {
        if (!ignore) setCartError(e?.message || "Failed to load cart");
      } finally {
        if (!ignore) setCartLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [userId]);

  /* -------- redirect only if server+cache both have no default -------- */
  useEffect(() => {
    if (!meLoading && userId && !addrLoading) {
      const cachedDefault = readDefaultFromCache();
      if (!addr && !cachedDefault) {
        navigate("/address?next=/payment", { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meLoading, userId, addrLoading, addr, navigate]);

  const items = cart?.items ?? [];

  /* -------- totals -------- */
  const totals = useMemo(() => {
    let mrpTotal = 0;
    let subTotal = 0;
    let totalQty = 0;

    for (const it of items) {
      const qty = Number(it?.qty || 0);
      const mrp = Number(it?.mrp ?? 0);
      const sell = Number(it?.sellingPrice ?? it?.unitPrice ?? 0);

      totalQty += qty;
      const effectiveMrp = mrp > 0 ? mrp : sell;
      mrpTotal += effectiveMrp * qty;
      subTotal += sell * qty;
    }

    const savings = Math.max(0, mrpTotal - subTotal);
    const shipping = subTotal >= DELIVERY_THRESHOLD || subTotal === 0 ? 0 : DELIVERY_FEE;
    const couponDiscount = Math.min(couponApplied?.amount ?? 0, subTotal);
    const taxableBase = Math.max(0, subTotal - couponDiscount);
    const tax = taxableBase * TAX_RATE;
    const totalPayable = taxableBase + shipping + tax;

    return { mrpTotal, subTotal, savings, totalQty, shipping, tax, couponDiscount, totalPayable };
  }, [items, couponApplied]);

  const isEmpty = !cartLoading && items.length === 0;

  /* -------- actions -------- */
  const onApplyCoupon = (e) => {
    e.preventDefault();
    const code = coupon.trim().toUpperCase();
    if (!code) return setCouponApplied(null);
    if (code === "BBWELCOME") setCouponApplied({ code, amount: 100 });
    else if (code === "AYUR10") setCouponApplied({ code, amount: 50 });
    else setCouponApplied({ code, amount: 0 });
  };

  const onRemoveCoupon = () => setCouponApplied(null);
  const onPayNow = () => alert("Hook your payment SDK here");

  /* ------------------------------- UI (unchanged design) -------------------------------- */
  return (
    <div className="min-h-screen bg-[#faeade] ">
      {/* Header */}
      <header className="bg-gradient-to-b from-[#faeade] via-white to-[#faeade] sticky top-22 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-4xl font-bold text-orange-700">
            Payment
          </motion.h1>
        
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-25 grid lg:grid-cols-3 gap-6">
        {/* LEFT: Delivery + Items + Coupon */}
        <section className="lg:col-span-2 space-y-6">
          {/* Delivery address */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white to-[#fff5eb] rounded-xl border border-orange-100 shadow-sm">
            <div className="p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-700"><MapPin size={20} /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Delivery Address</h2>
                  <Link to="/address?next=/payment" className="text-sm text-orange-700 hover:text-orange-800 font-medium">Change</Link>
                </div>

                {addrLoading ? (
                  <p className="mt-2 text-gray-600">Loading address…</p>
                ) : addrError ? (
                  <p className="mt-2 text-red-600">{addrError}</p>
                ) : addr ? (
                  <p className="mt-1 text-gray-700">
                    <span className="font-medium">{addr.name}</span> {addr.isDefault ? "(Default)" : ""} — {addr.pincode}
                    <br />
                    {addr.address}{addr.locality ? `, ${addr.locality}` : ""}
                    <br />
                    {addr.city}, {addr.state}{addr.landmark ? ` — Landmark: ${addr.landmark}` : ""}
                    <br />
                    {addr.phone}
                  </p>
                ) : (
                  <p className="mt-2 text-gray-700">
                    No default address.{" "}
                    <Link to="/address?next=/payment" className="text-orange-700 font-medium hover:underline">Set one now</Link>.
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Cart items */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-orange-100 shadow-sm">
            <div className="p-5 border-b border-orange-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Cart ({totals.totalQty} {totals.totalQty === 1 ? "item" : "items"})</h2>
              {!cartLoading && !isEmpty && (
                <span className="text-sm text-gray-600">
                  {INR(totals.subTotal)} <span className="text-gray-400">subtotal</span>
                </span>
              )}
            </div>

            {cartLoading ? (
              <div className="p-5 text-gray-600">Loading cart…</div>
            ) : cartError ? (
              <div className="p-5 text-red-600">{cartError}</div>
            ) : isEmpty ? (
              <div className="p-7 text-gray-600">Your cart is empty.</div>
            ) : (
              <ul className="divide-y divide-orange-100">
                {items.map((it, idx) => {
                  const qty = Number(it.qty || 0);
                  const mrp = Number(it.mrp ?? 0);
                  const sell = Number(it.sellingPrice ?? it.unitPrice ?? 0);
                  const showMrp = mrp > 0 && mrp > sell;
                  const lineTotal = sell * qty;
                  const key = it.cartItemId ?? it.id ?? it.itemId ?? it.productId ?? `row-${idx}`;
                  return (
                    <li key={key} className="p-5 flex gap-4">
                      <div className="w-20 h-20 border rounded-lg bg-white overflow-hidden grid place-items-center">
                        <img alt={it.productName} src={it.productImg || "https://via.placeholder.com/72"} loading="lazy" className="max-w-[90%] max-h-[90%] object-contain" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{it.productName}</div>
                        <div className="text-sm text-gray-600 mt-0.5">Qty: {qty}</div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{INR(sell)}</span>
                          {showMrp && (
                            <>
                              <span className="line-through text-xs text-gray-500">{INR(mrp)}</span>
                              <span className="text-xs text-green-700 font-semibold">{Math.round(((mrp - sell) / mrp) * 100)}% off</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{INR(lineTotal)}</div>
                        <div className="text-xs text-gray-500">Line total</div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>

          {/* Coupon */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-orange-100 shadow-sm">
            <div className="p-5 border-b border-orange-100 flex items-center gap-2">
              <Tag size={18} className="text-orange-700" />
              <h3 className="font-semibold text-gray-900">Apply Coupon</h3>
            </div>

            <form onSubmit={onApplyCoupon} className="p-5 flex flex-wrap gap-3">
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Enter coupon code"
                className="flex-1 min-w-[220px] bg-white border border-orange-200 rounded-lg px-3 py-2 outline-none"
              />
              <button type="submit" className="px-4 py-2 rounded-lg font-semibold bg-orange-700 text-white hover:bg-orange-800">
                Apply
              </button>

              {couponApplied && (
                <button type="button" onClick={onRemoveCoupon} className="px-3 py-2 rounded-lg font-semibold bg-gray-100 text-gray-700">
                  Remove {couponApplied.code}
                </button>
              )}
            </form>
          </motion.div>
        </section>

        {/* RIGHT: Order Summary + Pay Now */}
        <aside className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-white to-[#fff5eb] rounded-xl border border-orange-100 shadow-sm">
            <div className="p-5 border-b border-orange-100">
              <h2 className="font-semibold text-gray-900">Order Summary</h2>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Price ({totals.totalQty} items)</span>
                <span className="font-medium text-gray-900">{INR(totals.mrpTotal)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-green-700">– {INR(Math.max(0, totals.savings))}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{INR(totals.subTotal)}</span>
              </div>

              {totals.couponDiscount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Coupon {couponApplied?.code ? `(${couponApplied.code})` : ""}</span>
                  <span className="font-medium text-green-700">– {INR(totals.couponDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-gray-600">Shipping {totals.shipping === 0 ? "(Free above ₹500)" : ""}</span>
                <span className="font-medium text-gray-900">{totals.shipping === 0 ? "Free" : INR(totals.shipping)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({Math.round(TAX_RATE * 100)}%)</span>
                <span className="font-medium text-gray-900">{INR(totals.tax)}</span>
              </div>

              <div className="h-px my-2 bg-gradient-to-r from-orange-200/50 to-transparent" />

              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="font-extrabold text-orange-800 flex items-center gap-1">
                  <IndianRupee size={18} /> {INR(totals.totalPayable)}
                </span>
              </div>
            </div>

            <div className="p-5 pt-0">
              <motion.button
                whileHover={{ scale: addr && !isEmpty ? 1.02 : 1 }}
                whileTap={{ scale: addr && !isEmpty ? 0.98 : 1 }}
                onClick={onPayNow}
                disabled={!addr || isEmpty}
                className={`w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold shadow-lg transition
                  ${addr && !isEmpty ? "text-white bg-orange-700 hover:bg-orange-800" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              >
                Pay Now
              </motion.button>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                <Shield size={14} className="text-orange-700" />
                <span>Secure • Encrypted checkout</span>
              </div>
            </div>
          </motion.div>

          <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-4 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <ChevronDown size={14} className="text-orange-700" />
              <span>7-day replacement • GST invoice available</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
