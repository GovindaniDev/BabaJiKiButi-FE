// src/components/cart/CartPage.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { cartApi } from "../../auth/cart/cartApi";
import { guestCart } from "../../auth/cart/guestCart";

/* ------------------------------ helpers ------------------------------ */
const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(num || 0));

/** Flipkart-ish delivery rule for demo */
const DELIVERY_THRESHOLD = 500; // free delivery above this
const DELIVERY_FEE = 40;

/* ------------------------------- Page -------------------------------- */
export default function CartPage({ userId }) {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [coupon, setCoupon] = useState("");
  const [pin, setPin] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const navigate = useNavigate();

  /* ------------------------------- data ------------------------------- */
  const refresh = async () => {
    if (userId) {
      const c = await cartApi.getCart(userId);
      setCart(c);
    } else {
      setCart(guestCart.get());
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  /* ------------------------------ actions ----------------------------- */
  const mutate = async (fn) => {
    await fn();
    await refresh();
    window.dispatchEvent(new CustomEvent("cart:changed"));
  };

  const inc = async (item) => {
    setUpdatingId(item.cartItemId);
    await mutate(async () => {
      if (userId) await cartApi.updateQty(userId, item.cartItemId, (item.qty || 1) + 1);
      else guestCart.updateQty(item.cartItemId, (item.qty || 1) + 1);
    });
    setUpdatingId(null);
  };

  const dec = async (item) => {
    const next = Math.max(1, (item.qty || 1) - 1);
    setUpdatingId(item.cartItemId);
    await mutate(async () => {
      if (userId) await cartApi.updateQty(userId, item.cartItemId, next);
      else guestCart.updateQty(item.cartItemId, next);
    });
    setUpdatingId(null);
  };

  const remove = async (item) => {
    setUpdatingId(item.cartItemId);
    await mutate(async () => {
      if (userId) await cartApi.removeItem(userId, item.cartItemId);
      else guestCart.removeItem(item.cartItemId);
    });
    setUpdatingId(null);
  };

  const clear = async () => {
    await mutate(async () => {
      if (userId) await cartApi.clear(userId);
      else guestCart.clear();
    });
  };

  const goCheckout = () => {
    if (!userId) {
      navigate("/login?next=/checkout");
      return;
    }
    navigate("/checkout");
  };

  /* ------------------------- computed totals -------------------------- */
  // We use MRP subtotal vs selling subtotal to show Discount & Savings (Flipkart style)
  const summary = useMemo(() => {
    const items = cart?.items || [];

    const sellingSubtotal = items.reduce(
      (s, it) => s + Number(it.unitPrice || 0) * (it.qty || 1),
      0
    );
    const mrpSubtotal = items.reduce(
      (s, it) =>
        s +
        Number((it.mrp ?? it.meta?.mrp ?? it.unitPrice) || 0) * (it.qty || 1),
      0
    );
    const discount = Math.max(0, mrpSubtotal - sellingSubtotal);

    const s = Number(cart?.subtotal || sellingSubtotal || 0); // safety
    const deliveryCharge = s > 0 && s < DELIVERY_THRESHOLD ? DELIVERY_FEE : 0;
    const total = sellingSubtotal + deliveryCharge;

    const count = items.reduce((n, it) => n + (it.qty || 1), 0);

    return {
      count,
      mrpSubtotal,
      sellingSubtotal,
      discount,
      delivery: deliveryCharge,
      total,
      youSave: discount, // product savings only (like Flipkart green line)
    };
  }, [cart]);

  /* ------------------------------ render ------------------------------ */
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20">
        <Skeleton />
      </div>
    );
  }

  if (!cart || (cart.items?.length ?? 0) === 0) {
    return <EmptyCart />;
  }

  return (
    <div className="bg-[#faeade] min-h-screen">
      <div className="max-w-6xl mx-auto px-3 md:px-4 py-30">
        {/* Header strip */}
        <div className="hidden md:flex items-center gap-2 text-sm text-[#6f4d3b] mb-4">
          <span className="font-semibold text-[#5b3b2b]">Your Cart</span>
          <span>›</span>
          <span className="text-[#7b5a47]">Review your items</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: items */}
          <div className="lg:col-span-2">
            {/* Address / Pincode bar */}
            <div className="bg-[#fff7f0] rounded-md shadow-sm border border-amber-200 p-4 mb-3">
              <p className="text-sm text-[#5b3b2b]">
                Deliver to{" "}
                <span className="font-semibold text-[#4a2f24]">
                  {pin ? `PIN ${pin}` : "your location"}
                </span>
              </p>
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  placeholder="Enter pincode"
                  value={pin}
                  onChange={(e) =>
                    setPin(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="px-3 py-2 border border-amber-300 rounded text-sm w-40 bg-white text-[#4a2f24] placeholder:text-amber-700/50"
                />
                <button
                  className="px-4 py-2 bg-[#cc5f29] text-white rounded text-sm hover:bg-[#b95726]"
                  onClick={() => {}}
                >
                  Check
                </button>
              </div>
            </div>

            {/* Items list */}
            <div className="bg-white rounded-md shadow-sm border border-amber-200 overflow-hidden">
              {(cart.items || []).map((it, idx) => (
                <div
                  key={it.cartItemId}
                  className="p-4 border-b border-amber-100 last:border-0"
                >
                  <CartItemRow
                    item={it}
                    updating={updatingId === it.cartItemId}
                    onInc={() => inc(it)}
                    onDec={() => dec(it)}
                    onRemove={() => remove(it)}
                  />

                  {/* Delivery message */}
                  {idx === 0 && (
                    <div className="mt-3 text-xs text-amber-800">
                      Delivery by{" "}
                      <span className="text-[#4a2f24] font-medium">3–5 days</span>{" "}
                      • ₹{summary.delivery === 0 ? 0 : DELIVERY_FEE} delivery fee
                      {summary.delivery === 0 && (
                        <span className="ml-1 text-emerald-700 font-medium">
                          (Free)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Coupon box */}
            <div className="bg-[#fff7f0] rounded-md shadow-sm border border-amber-200 p-4 mt-3">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#4a2f24]">
                    Apply Coupons
                  </p>
                  <p className="text-xs text-[#6f4d3b] mt-1">
                    Additional discounts may apply at checkout.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter coupon"
                    className="px-3 py-2 border border-amber-300 rounded text-sm w-40 bg-white text-[#4a2f24] placeholder:text-amber-700/50"
                  />
                  <button
                    disabled={applyingCoupon || coupon.trim().length === 0}
                    onClick={async () => {
                      setApplyingCoupon(true);
                      setTimeout(() => setApplyingCoupon(false), 600);
                    }}
                    className="px-4 py-2 bg-[#e46c2f] text-white rounded text-sm hover:bg-[#cc5f29] disabled:opacity-50"
                  >
                    {applyingCoupon ? "Applying…" : "Apply"}
                  </button>
                </div>
              </div>
            </div>

            {/* Actions bottom (mobile) */}
            <div className="lg:hidden mt-3 flex justify-between items-center">
              <button
                onClick={clear}
                className="px-4 py-2 border border-amber-300 text-[#4a2f24] rounded text-sm bg-white"
              >
                Clear Cart
              </button>
              <button
                onClick={goCheckout}
                className="px-6 py-2 bg-[#e46c2f] text-white rounded text-sm font-semibold hover:bg-[#cc5f29]"
              >
                Place Order
              </button>
            </div>
          </div>

          {/* Right column: price summary */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-20">
              <PriceDetails
                count={summary.count}
                mrpSubtotal={summary.mrpSubtotal}
                discount={summary.discount}
                delivery={summary.delivery}
                total={summary.total}
                youSave={summary.youSave}
              />

              <div className="hidden lg:block mt-3">
                <button
                  onClick={goCheckout}
                  className="w-full px-6 py-3 bg-[#e46c2f] text-white rounded text-sm font-semibold hover:bg-[#cc5f29]"
                >
                  Place Order
                </button>
              </div>

              <div className="hidden lg:block mt-2">
                <button
                  onClick={clear}
                  className="w-full px-6 py-2 border border-amber-300 text-[#4a2f24] rounded text-sm bg-white"
                >
                  Clear Cart
                </button>
              </div>

              {/* Free delivery hint */}
              {summary.sellingSubtotal > 0 &&
                summary.sellingSubtotal < DELIVERY_THRESHOLD && (
                  <div className="mt-3 text-xs text-[#5b3b2b] bg-[#fff7f0] border border-amber-200 rounded-md shadow-sm p-3">
                    Add items worth{" "}
                    <span className="font-semibold">
                      {formatINR(DELIVERY_THRESHOLD - summary.sellingSubtotal)}
                    </span>{" "}
                    more to get{" "}
                    <span className="text-emerald-700 font-medium">
                      Free Delivery
                    </span>.
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------- child components -------------------------- */

function CartItemRow({ item, updating, onInc, onDec, onRemove }) {
  const {
    productImg,
    productName,
    qty,
    unitPrice,
  } = item || {};

  // Prefer Hindi title if available in guest meta; fallback to productName
  const displayTitle =
    item?.meta?.titleHi || item?.meta?.title || productName || "Product";

  const mrp = Number((item?.mrp ?? item?.meta?.mrp ?? unitPrice) || 0);
  const selling = Number(unitPrice || 0);
  const savingPerUnit = Math.max(0, mrp - selling);
  const saved = savingPerUnit * (qty || 1);
  const discountPct = mrp > 0 ? Math.round(((mrp - selling) / mrp) * 100) : 0;
  const lineTotal = selling * (qty || 1);

  const sizeText = (() => {
    const size = item?.qtySize ?? item?.meta?.qtySize;
    const unit = item?.qtyUnit ?? item?.meta?.qtyUnit;
    if (!size && !unit) return null;
    return `${size ?? ""} ${unit ?? ""}`.trim();
  })();

  return (
    <div className="flex gap-4">
      {/* Image */}
      <div className="w-24 h-24 flex-shrink-0 bg-white border border-amber-200 rounded overflow-hidden">
        <img
          src={productImg || "/images/placeholder.png"}
          alt={displayTitle}
          className="w-full h-full object-contain p-1"
          onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
        />
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="flex justify-between gap-4">
          <div className="pr-2">
            {/* Title (Hindi preferred) */}
            <h3 className="text-sm font-medium text-[#4a2f24] leading-5 line-clamp-2">
              {displayTitle}
            </h3>

            {/* Variant / pack size */}
            {sizeText && (
              <div className="mt-1 text-xs text-[#7b5a47]">Pack: {sizeText}</div>
            )}

            {/* Price cluster with MRP, Selling, % Off */}
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              {mrp > selling && mrp > 0 && (
                <span className="text-[#8c6a57] line-through text-sm">
                  {formatINR(mrp)}
                </span>
              )}
              <span className="text-lg font-semibold text-[#3c281f]">
                {formatINR(selling)}
              </span>
              {discountPct > 0 && (
                <span className="text-emerald-700 text-sm font-semibold">
                  {discountPct}% Off
                </span>
              )}
            </div>

            {/* You save ... */}
            {saved > 0 && (
              <div className="mt-1 text-xs text-emerald-700 font-medium">
                You save {formatINR(saved)} on this item
              </div>
            )}
          </div>

          {/* Right-aligned: line total */}
          <div className="hidden sm:block text-right">
            <div className="text-sm text-[#7b5a47]">Item total</div>
            <div className="text-base font-semibold text-[#3c281f]">
              {formatINR(lineTotal)}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 flex items-center gap-4">
          {/* Qty stepper */}
          <div className="inline-flex items-center border border-amber-300 rounded bg-white">
            <button
              onClick={onDec}
              disabled={updating || (qty || 1) <= 1}
              className="w-8 h-8 text-lg leading-8 text-[#4a2f24] disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              –
            </button>
            <div className="w-10 text-center text-sm select-none text-[#4a2f24]">
              {qty}
            </div>
            <button
              onClick={onInc}
              disabled={updating}
              className="w-8 h-8 text-lg leading-8 text-[#4a2f24] disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Actions */}
          <button
            onClick={onRemove}
            disabled={updating}
            className="text-sm font-medium text-[#c15f2a] hover:text-[#a95326] disabled:opacity-50"
          >
            Remove
          </button>

          <button
            disabled
            className="text-sm font-medium text-amber-700/50 cursor-not-allowed"
            title="Save for later coming soon"
          >
            Save for later
          </button>
        </div>

        {/* Mobile line total */}
        <div className="sm:hidden mt-2 text-sm text-[#5b3b2b]">
          Total: <span className="font-semibold">{formatINR(lineTotal)}</span>
        </div>

        {/* Updating indicator */}
        {updating && (
          <div className="mt-2 text-xs text-amber-700/80">Updating…</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------ right card components ----------------------- */

function PriceDetails({ count, mrpSubtotal, discount, delivery, total, youSave }) {
  return (
    <div className="bg-white rounded-md shadow-sm border border-amber-200">
      <div className="px-4 py-3 border-b border-amber-100 text-amber-700 text-sm font-semibold">
        PRICE DETAILS
      </div>
      <div className="p-4 space-y-3 text-sm">
        <Row
          label={`Price (${count} ${count === 1 ? "item" : "items"})`}
          value={formatINR(mrpSubtotal)}
        />
        <Row
          label={`Discount`}
          value={<span className="text-emerald-700">− {formatINR(discount)}</span>}
        />
        <Row
          label={
            <span>
              Delivery Charges{" "}
              {delivery === 0 && (
                <span className="text-emerald-700 font-medium">(Free)</span>
              )}
            </span>
          }
          value={delivery === 0 ? "₹0" : formatINR(delivery)}
        />
        <div className="border-t border-dashed border-amber-200 my-1" />
        <Row
          label={<span className="text-base font-semibold text-[#3c281f]">Total Amount</span>}
          value={<span className="text-base font-semibold text-[#3c281f]">{formatINR(total)}</span>}
        />
        {youSave > 0 && (
          <div className="pt-1 text-xs text-emerald-700">
            You will save {formatINR(youSave)} on this order
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[#6f4d3b]">{label}</div>
      <div className="text-[#3c281f]">{value}</div>
    </div>
  );
}

/* ---------------------------- misc bits ---------------------------- */

function EmptyCart() {
  return (
    <div className="bg-[#faeade] min-h-[70vh]">
      <div className="max-w-4xl mx-auto px-4 py-60 text-center">
        <img
          src="https://placehold.co/160x120?text=Cart"
          alt="Empty cart"
          className="mx-auto opacity-80"
        />
        <h2 className="mt-4 text-xl font-semibold text-[#3c281f]">
          Your cart is empty
        </h2>
        <p className="mt-1 text-sm text-[#6f4d3b]">Add items to it now.</p>
        <Link
          to="/shop"
          className="inline-flex items-center mt-6 px-6 py-2 bg-[#e46c2f] text-white rounded hover:bg-[#cc5f29]"
        >
          Shop Now
        </Link>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-40 bg-amber-200/60 rounded mb-4"></div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <div className="h-20 bg-amber-200/50 rounded"></div>
          <div className="h-40 bg-amber-200/50 rounded"></div>
          <div className="h-24 bg-amber-200/50 rounded"></div>
        </div>
        <div className="h-56 bg-amber-200/50 rounded"></div>
      </div>
    </div>
  );
}
