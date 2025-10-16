// src/components/CartMenu.jsx
import React, { useMemo, useRef, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useCart } from "../../auth/cart/useCart";

export default function CartMenu({ userId, cartItems = [] }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, refresh } = useCart(userId);      // 👈 same source as page
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const open = async () => { setIsCartOpen(true); await refresh(); };
  const close = () => setIsCartOpen(false);

  const menuItems = useMemo(() => {
    if (cart?.items?.length) {
      return cart.items.map((it) => ({
        id: it.cartItemId ?? it.key,
        key: it.key ?? it.cartItemId,
        name: it.productName ?? it.name ?? "Product",
        image: it.productImg ?? it.image ?? "",
        qty: Number(it.qty || 1),
        price: Number(it.unitPrice || it.price || 0),
        total: Number(it.unitPrice || it.price || 0) * Number(it.qty || 1),
      }));
    }
    return (cartItems || []).map((it) => ({
      id: it.id, key: it.key ?? it.id, name: it.name, image: it.image,
      qty: it.qty || 1, price: Number(it.price || 0), total: Number(it.price || 0) * (it.qty || 1),
    }));
  }, [cart, cartItems, location.pathname]);

  const count = useMemo(() => {
    const keys = new Set((cart?.items || []).map(i => i.key ?? i.cartItemId ?? i.id ?? i.itemId));
    if (keys.size > 0) return keys.size;
    return new Set(menuItems.map(i => i.key ?? i.id)).size;
  }, [cart, menuItems]);

  const subtotal = useMemo(
    () => cart?.subtotal != null
      ? Number(cart.subtotal)
      : menuItems.reduce((sum, it) => sum + (it.total || 0), 0),
    [cart, menuItems]
  );

  return (
    <div ref={wrapperRef} className="relative" onMouseEnter={open} onMouseLeave={close}>
      <button type="button" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Cart" aria-haspopup="dialog" aria-expanded={isCartOpen}
        onClick={() => navigate("/cart")}>
        {/* icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.09.835l.383 1.437M7.5 14.25h9.75a1.5 1.5 0 0 0 1.46-1.154l1.5-6A1.5 1.5 0 0 0 18.75 5.25H5.109m2.391 9L5.25 5.25m2.25 9-1.125 4.5m0 0h12.75m-12.75 0A1.125 1.125 0 1 0 8.625 19.5 1.125 1.125 0 0 0 7.5 18.75Zm11.625 0a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-yellow-500 text-white text-[10px] leading-[18px] text-center">
            {count}
          </span>
        )}
      </button>

      {isCartOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          {menuItems.length > 0 ? (
            <>
              <ul className="max-h-64 overflow-auto divide-y divide-gray-100">
                {menuItems.slice(0, 6).map((item) => (
                  <li key={item.id} className="flex gap-3 p-3">
                    <img src={item.image || "/images/placeholder.png"} alt={item.name || "Product"}
                         className="w-12 h-12 rounded-md object-cover bg-gray-100" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 line-clamp-1">{item.name || "Product"}</p>
                      <p className="text-xs text-gray-500">Qty {item.qty || 1} • ₹{(item.price || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">₹{(item.total || 0).toFixed(2)}</div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between px-3 py-2 border-t border-gray-100">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-semibold text-gray-900">₹{Number(subtotal || 0).toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 p-3">
                <button className="inline-flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50" onClick={() => navigate("/cart")}>
                  View Cart
                </button>
              </div>
            </>
          ) : (
            <div className="p-5 text-center">
              <p className="text-sm text-gray-600 mb-3">Your cart is empty</p>
              <Link to="/product" className="inline-flex items-center justify-center rounded-md bg-yellow-500 text-white px-3 py-2 text-sm hover:bg-yellow-600">
                Shop Now
              </Link>
              <div className="mt-3">
                <button className="text-xs text-gray-500 underline hover:text-gray-700"
                        onClick={() => { navigate("/cart"); window.scrollTo({ top: 0, behavior: "instant" }); }}>
                  Go to Cart
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
