import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { cartApi } from "../../auth/cart/cartApi";

const INR = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(n || 0));
const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect fill='#f5f5f5' width='100%' height='100%'/></svg>`);

export default function CartMenu({ userId }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const hoverTimer=useRef(null);

  const open = useCallback(() => setIsCartOpen(true), []);
  const close = useCallback(() => setIsCartOpen(false), []);

  const clearHoverTimer=()=>{
    if(hoverTimer.current){
      clearTimeout(hoverTimer.current);
      hoverTimer.current=null;
    }
  }

  const hasHover=()=>window.matchMedia("(hover:hover)").matches;


  const handleEnter=()=>{
    if(!hasHover()) return;
    clearHoverTimer();
    open();
  }

  const handleLeave=()=>{
     if(!hasHover()) return;
    clearHoverTimer();
    hoverTimer.current=setTimeout(()=>{
      close();
    },180)
  }

  // preload when userId changes (so badge is correct)
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!userId) { setCart(null); return; }
      try {
        setLoading(true);
        const c = await cartApi.getCart(userId);
        if (!ignore) setCart(c);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [userId]);

  // refresh on open
  useEffect(() => {
    if (!isCartOpen || !userId) return;
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        const c = await cartApi.getCart(userId);
        if (!ignore) setCart(c);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [isCartOpen, userId]);

  // refresh when other parts dispatch cart:changed
  useEffect(() => {
    if (!userId) return;
    const handler = async () => {
      const c = await cartApi.getCart(userId);
      setCart(c);
    };
    window.addEventListener("cart:changed", handler);
    return () => window.removeEventListener("cart:changed", handler);
  }, [userId]);

  // housekeeping
  useEffect(() => { close(); }, [location.pathname, close]);
  useEffect(() => {
    if (!isCartOpen) return;
    const onDoc = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) close(); };
    const onEsc = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [isCartOpen, close]);


  useEffect(()=>()=>clearHoverTimer(),[]);

  const items = cart?.items ?? [];
  const count = useMemo(() => Number(cart?.totalQty ?? items.reduce((n, it) => n + (it.qty || 0), 0)), [cart, items]);
  const subtotal = useMemo(() => Number(cart?.subtotal ?? items.reduce((s, it) => s + (Number(it.unitPrice || 0) * Number(it.qty || 0)), 0)), [cart, items]);

  // derived per-item savings
  const getSavings = (it) => {
    const mrp = Number(it.mrp ?? 0);
    const sell = Number(it.sellingPrice ?? it.unitPrice ?? 0);
    if (!mrp || mrp <= sell) return { save: 0, pct: 0 };
    const save = (mrp - sell) * (Number(it.qty) || 1);
    const pct = Math.round(((mrp - sell) / mrp) * 100);
    return { save, pct, mrp, sell };
  };

  return (
    <div
      ref={wrapperRef}
      className="relative pt-2"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* icon navigates to /cart; hover still opens preview */}
      <button
        type="button"
        className="relative p-2 rounded-full transition-colors hover:bg-gray-100"
        aria-label="Cart"
        onClick={() => { navigate("/cart"); setIsCartOpen(false); }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.09.835l.383 1.437M7.5 14.25h9.75a1.5 1.5 0 0 0 1.46-1.154l1.5-6A1.5 1.5 0 0 0 18.75 5.25H5.109m2.391 9L5.25 5.25m2.25 9-1.125 4.5m0 0h12.75m-12.75 0A1.125 1.125 0 1 0 8.625 19.5 1.125 1.125 0 0 0 7.5 18.75Zm11.625 0a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"/>
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] leading-[18px] text-center" style={{ backgroundColor: "#f2bfb0" }}>
            {count}
          </span>
        )}
      </button>

      {isCartOpen && (
        <div role="dialog" aria-label="Cart preview" className="absolute right-0 top-full w-80 rounded-lg border border-gray-200 bg-white shadow-lg z-50"
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          {loading ? (
            <div className="p-4 space-y-2"><SkeletonRow/><SkeletonRow/><SkeletonRow/></div>
          ) : items.length > 0 ? (
            <>
              <ul className="max-h-64 overflow-auto divide-y divide-gray-100">
                {items.slice(0, 6).map((it) => {
                  const { save, pct, mrp, sell } = getSavings(it);
                  const showMrp = !!mrp && mrp > (sell || it.unitPrice || 0);
                  const priceNow = Number(it.sellingPrice ?? it.unitPrice ?? 0);
                  return (
                    <li key={it.cartItemId} className="flex gap-3 p-3">
                      <img src={it.productImg || PLACEHOLDER} alt={it.productName || "Product"} className="w-12 h-12 rounded-md object-cover bg-gray-100" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{it.productName || "Product"}</p>
                        <p className="text-xs text-gray-500">
                          Qty {it.qty || 1} • {INR(priceNow)}{showMrp && <span className="line-through text-gray-400 ml-1">{INR(mrp)}</span>}
                          {pct > 0 && <span className="ml-2 text-emerald-600 font-semibold">{pct}% off</span>}
                        </p>
                      </div>
                      <div className="text-sm font-semibold text-gray-800">{INR(it.lineTotal || (priceNow * (it.qty || 1)))}</div>
                    </li>
                  );
                })}
              </ul>

              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-semibold text-gray-900">{INR(subtotal || 0)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3">
                <button className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50" onClick={() => navigate("/cart")}>
                  View Cart
                </button>
                <button className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-white hover:opacity-95"
                        style={{ backgroundColor: "#faeade", color: "#3a2a28", border: "1px solid #f0cabf" }}
                        onClick={() => navigate("/address")}>
                  Checkout
                </button>
              </div>
            </>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm text-gray-600 mb-3">Your cart is empty</p>
              <Link to="/shop" className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm text-white hover:opacity-95" style={{ backgroundColor: "#f2bfb0" }}>
                Shop Now
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SkeletonRow() {
  return <div className="h-14 rounded-md border border-gray-200 bg-gradient-to-r from-white via-[#fff3ef] to-white animate-pulse" />;
}
