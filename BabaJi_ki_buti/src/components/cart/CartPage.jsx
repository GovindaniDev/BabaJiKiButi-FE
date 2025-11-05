// src/components/cart/CartPage.jsx
import { useEffect, useMemo, useState } from "react";
import { cartApi } from "../../auth/cart/cartApi";
import { Trash2, Plus, Minus, Tag, ShieldCheck, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
// import { useMe } from "../../auth/user/useMe"; // 🔧 CHANGE: not used; safe to remove
import PincodeChecker from "../PincodeChecker";

/* ------------------------------ helpers ------------------------------ */
const INR = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(num || 0));

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

/** Flipkart-ish delivery rule for demo */
const DELIVERY_THRESHOLD = 500; // free delivery above this
const DELIVERY_FEE = 40;

/* ------------------------------- Page -------------------------------- */
export default function CartPage({ userId }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyItemId, setBusyItemId] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [pin, setPin] = useState("");

  const navigate = useNavigate();
  const { isAuthenticated } = useAuth?.() || {};

  // 🔧 CHANGE: serviceability state (to control Place Order & show info)
  const [shipOk, setShipOk] = useState(true);      // assume OK until user checks
  const [codOk, setCodOk] = useState(true);
  const [shipRate, setShipRate] = useState(null);
  const [shipEta, setShipEta] = useState(null);
  const [lastCheckedPin, setLastCheckedPin] = useState("");

  // ---- load cart on mount/user change ----
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        if (!userId) {
          setCart({ items: [] });
          return;
        }
        const c = await cartApi.getCart(userId);
        if (!ignore) setCart(c);
      } catch (e) {
        console.error("Cart load failed", e);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => (ignore = true);
  }, [userId]);

  const items = cart?.items ?? [];

  // ---- derived totals (uses mrp/sellingPrice when available) ----
  const totals = useMemo(() => {
    let mrpTotal = 0;    // sum of MRP * qty
    let subTotal = 0;    // sum of selling (or unitPrice) * qty
    let totalQty = 0;

    for (const it of items) {
      const qty = Number(it?.qty || 0);
      const mrp = Number(it?.mrp ?? 0);
      const sell = Number(it?.sellingPrice ?? it?.unitPrice ?? 0);

      totalQty += qty;

      const effectiveMrp = mrp > 0 ? mrp : sell;
      mrpTotal += effectiveMrp * qty;

      const line = sell * qty;
      subTotal += line;
    }

    const savings = Math.max(0, mrpTotal - subTotal);
    return { mrpTotal, subTotal, savings, totalQty };
  }, [items]);

  const deliveryFee =
    totals.subTotal >= DELIVERY_THRESHOLD || totals.subTotal === 0
      ? 0
      : DELIVERY_FEE;
  const payable = totals.subTotal + deliveryFee;

  /* --------------------------- actions --------------------------- */
  const updateQty = async (it, nextQty) => {
    if (!userId || !it?.cartItemId) return;
    const q = clamp(nextQty, 1, 99);
    if (q === it.qty) return;
    try {
      setBusyItemId(it.cartItemId);
      const updated = await cartApi.updateQty(userId, it.cartItemId, q);
      setCart(updated);
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (e) {
      console.error("update qty failed", e);
    } finally {
      setBusyItemId(null);
    }
  };

  const removeItem = async (it) => {
    if (!userId || !it?.cartItemId) return;
    try {
      setBusyItemId(it.cartItemId);
      const updated = await cartApi.removeItem(userId, it.cartItemId);
      setCart(updated);
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (e) {
      console.error("remove failed", e);
    } finally {
      setBusyItemId(null);
    }
  };

  const clearCart = async () => {
    if (!userId) return;
    try {
      setClearing(true);
      const updated = await cartApi.clear(userId);
      setCart(updated);
      window.dispatchEvent(new CustomEvent("cart:changed"));
    } catch (e) {
      console.error("clear failed", e);
    } finally {
      setClearing(false);
    }
  };

  const applyCoupon = (e) => {
    e.preventDefault();
    alert(`Coupon "${coupon || "N/A"}" applied (demo)`);
  };

  // 🔧 CHANGE: remove unused checkPin form submit (PincodeChecker handles internally)
  // const checkPin = (e) => {
  //   e.preventDefault();
  //   alert(`Delivery availability checked for ${pin || "—"} (demo)`);
  // };

  const handlePlaceOrder = () => {
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent("/address")}`, { replace: true });
      return;
    }
    // 🔧 CHANGE: block navigation if not serviceable
    if (!shipOk) {
      alert(`Delivery not available to ${lastCheckedPin || "this pincode"}.`);
      return;
    }
    navigate("/address");
  };

  /* ----------------------------- UI ------------------------------ */
  if (!userId) {
    return (
      <div className="min-h-screen bg-white">
        {/* Topbar (same vibe as your cart page) */}
        <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[#faeade] border-b border-[#f1d6cf] w-full h-45">
          <div className="font-extrabold text-[20px] tracking-[0.3px] pt-20">BabajiKiButi</div>

          <div className="flex items-center gap-3 text-[#3a2a28] pt-20">
            <Home size={18} />
            <span>
              Deliver to: <b>Home</b>
            </span>
            <button className="text-[#8d5b53] font-semibold hover:underline">Change</button>
          </div>
        </div>

        {/* Centered notice */}
        <div className="max-w-[1120px] mx-auto px-3 py-10">
          <div className="rounded-xl border border-[#f1d6cf] bg-white shadow-sm p-8">
            <h2 className="text-xl font-semibold mb-2">Your Cart</h2>
            <p className="text-[#5c4b47] mb-4">Please sign in to view your cart.</p>
            <button
              onClick={() => navigate(`/login?next=${encodeURIComponent("/cart")}`)}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg font-semibold bg-[#f7c9b8] text-[#3a2a28]">
              Sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !loading && items.length === 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Topbar */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-[#faeade] border-b border-[#f1d6cf] w-full h-45">
        <div className="font-extrabold text-[20px] tracking-[0.3px] pt-20">BabajiKiButi</div>

        <div className="flex items-center gap-3 text-[#3a2a28] pt-20">
          <Home size={18} />
          <span>
            Deliver to: <b>Home</b>
          </span>
          <button className="text-[#8d5b53] font-semibold hover:underline">Change</button>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto my-4 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 px-3">
        {/* LEFT */}
        <div>
          <h2 className="text-[18px] mt-2 mb-3">Add To Cart · Items ({totals.totalQty})</h2>

          {/* PIN & Coupon row */}
          <div className="bg-white border border-[#f1d6cf] rounded-xl shadow-sm p-3 flex flex-wrap gap-3">
            {/* 🔧 CHANGE: remove wrapping <form> and extra button; let PincodeChecker manage itself */}
            <div className="flex items-center gap-2 border border-dashed border-[#f1d6cf] rounded-lg px-3 py-2">
              <PincodeChecker
                pickupPincode="110030"
                defaultWeight={0.5}
                // 🔧 CHANGE: declaredValue from cart subtotal instead of undefined product.price
                declaredValue={totals.subTotal}
                allowCOD={true}
                onResult={(serviceable, best, payload) => {
                  setShipOk(Boolean(serviceable));
                  setLastCheckedPin(payload?.meta?.delivery_postcode || "");
                  const anyCod = payload?.couriers?.some(c => Number(c.cod) === 1);
                  setCodOk(Boolean(anyCod));
                  setShipRate(best?.rate ?? null);
                  setShipEta(best?.etd ?? null);
                }}
              />
            </div>

            <form onSubmit={applyCoupon} className="flex items-center gap-2 border border-dashed border-[#f1d6cf] rounded-lg px-3 py-2">
              <Tag size={18} />
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="Apply coupon"
                className="bg-transparent outline-none min-w-[180px]"
              />
              <button type="submit" className="px-3 py-2 rounded-lg font-semibold bg-[#fdeee8] text-[#8d5b53]">
                Apply
              </button>
            </form>
          </div>

          {/* Items */}
          <div className="mt-3 bg-white border border-[#f1d6cf] rounded-xl shadow-sm">
            {loading ? (
              <div className="p-4">Loading…</div>
            ) : items.length === 0 ? (
              <div className="p-7 text-center text-[#5c4b47]">
                <p>Your cart is empty.</p>
              </div>
            ) : (
              items.map((it) => {
                const qty = Number(it.qty || 0);
                const mrp = Number(it.mrp ?? 0);
                const sell = Number(it.sellingPrice ?? it.unitPrice ?? 0);
                const showMrp = mrp > 0 && mrp > sell;
                const pct = showMrp && mrp > 0 ? Math.round(((mrp - sell) / mrp) * 100) : 0;
                const lineTotal = sell * qty;

                return (
                  <div
                    key={it.cartItemId}
                    className="grid grid-cols-[96px_1fr_160px] gap-3 p-4 border-b last:border-b-0 border-[#f6e2db]"
                  >
                    <div className="w-24 h-24 border border-[#f1d6cf] rounded-lg bg-white overflow-hidden flex items-center justify-center">
                      <img
                        alt={it.productName}
                        src={it.productImg || 'https://via.placeholder.com/80'}
                        loading="lazy"
                        className="max-w-[90%] max-h-[90%] object-contain"
                      />
                    </div>

                    <div>
                      <div className="font-semibold text-[#2f2220] mb-1.5">{it.productName}</div>

                      <div className="flex items-center gap-1.5 text-[#4b3a36] text-[13px]">
                        <ShieldCheck size={16} />
                        <span>Assured</span>
                      </div>

                      {/* price row (per item) */}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="font-bold text-[#2f2220]">{INR(sell)}</span>
                        {showMrp && (
                          <>
                            <span className="line-through text-[13px] text-[#9d8b87]">{INR(mrp)}</span>
                            <span className="text-[#0a8a32] font-bold text-[12px]">{pct}% off</span>
                          </>
                        )}
                      </div>

                      {/* qty controls */}
                      <div className="mt-2.5 flex items-center gap-2">
                        <button
                          disabled={busyItemId === it.cartItemId || qty <= 1}
                          onClick={() => updateQty(it, qty - 1)}
                          title="Decrease"
                          className="w-8 h-8 rounded-md border border-[#f1d6cf] bg-white grid place-items-center disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>

                        <input
                          value={qty}
                          onChange={(e) =>
                            updateQty(it, Number(e.target.value.replace(/\D/g, '')) || 1)
                          }
                          className="w-12 h-8 text-center rounded-md border border-[#f1d6cf]"
                        />

                        <button
                          disabled={busyItemId === it.cartItemId || qty >= 99}
                          onClick={() => updateQty(it, qty + 1)}
                          title="Increase"
                          className="w-8 h-8 rounded-md border border-[#f1d6cf] bg-white grid place-items-center disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>

                        <button
                          disabled={busyItemId === it.cartItemId}
                          onClick={() => removeItem(it)}
                          title="Remove"
                          className="ml-2 text-[#8d5b53] flex items-center gap-1.5 px-1 py-1 disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-center gap-1">
                      <div className="font-extrabold">{INR(lineTotal)}</div>
                      <div className="text-[12px] text-[#5a4c49]">Line total</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={clearCart}
              disabled={clearing || items.length === 0}
              className="px-3 py-2 rounded-lg font-semibold bg-[#ffe4dc] text-[#b33a2b] border border-[#f3b8aa] disabled:opacity-50"
            >
              {clearing ? 'Clearing…' : 'Clear Cart'}
            </button>
          </div>
        </div>

        {/* RIGHT */}
        {isEmpty ? null : (
          <aside>
            <div className="bg-white border border-[#f1d6cf] rounded-xl shadow-sm p-4 lg:sticky lg:top-[72px]">
              <div className="text-[14px] font-bold text-[#5c3f39] mb-2.5">PRICE DETAILS</div>

              <div className="flex justify-between py-2 text-[#3a2a28]">
                <span>Price ({totals.totalQty} items)</span>
                <b>{INR(totals.mrpTotal)}</b>
              </div>

              <div className="flex justify-between py-2 text-[#3a2a28]">
                <span>Discount</span>
                <b className="text-[#0a8a32]">– {INR(totals.savings)}</b>
              </div>

              <div className="flex justify-between py-2 text-[#3a2a28]">
                <span>Delivery Charges</span>
                {deliveryFee === 0 ? <b className="text-[#0a8a32]">Free</b> : <b>{INR(deliveryFee)}</b>}
              </div>

              {/* 🔧 CHANGE: show serviceability snippet */}
              {lastCheckedPin && (
                <div className="mt-2 p-2 rounded border border-[#f1d6cf] text-sm">
                  <div>
                    <b>Deliver to:</b> {lastCheckedPin} — {shipOk ? "Available ✅" : "Not serviceable ❌"}
                  </div>
                  {shipOk && (
                    <ul className="list-disc ml-5">
                      {shipEta ? <li>ETA: {shipEta} days</li> : null}
                      {shipRate != null ? <li>Est. ship fee (incl GST): ₹{shipRate}</li> : null}
                      <li>COD: {codOk ? "Available" : "Unavailable"}</li>
                    </ul>
                  )}
                </div>
              )}

              <div className="h-px bg-[#f1d6cf] my-2" />

              <div className="flex justify-between py-2 text-[#3a2a28] text-[16px] font-extrabold">
                <span>Total Amount</span>
                <b>{INR(payable)}</b>
              </div>

              <button
                onClick={handlePlaceOrder}
                // 🔧 CHANGE: Disable place order when not serviceable
                disabled={!shipOk}
                className="w-full mt-3 h-11 text-[15px] rounded-lg font-semibold bg-[#f7c9b8] text-[#3a2a28] disabled:opacity-60"
              >
                {shipOk ? "PLACE ORDER" : "Not Serviceable"}
              </button>

              {totals.savings > 0 && (
                <p className="text-[12px] text-[#5a4c49] mt-2">
                  You will save {INR(totals.savings)} on this order.
                </p>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
