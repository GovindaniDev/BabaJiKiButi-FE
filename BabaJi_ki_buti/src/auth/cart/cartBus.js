// src/auth/cart/cartBus.js
const EVT = "cart:changed";

// 🔧 toggle logging here
const DBG_CART = true;
const dlog = (...a) => DBG_CART && console.log("[cartBus]", ...a);

export function emitCartChanged(reason = "") {
  try {
    const payload = { reason, at: Date.now() };
    dlog("emitCartChanged ->", payload);
    window.dispatchEvent(new CustomEvent(EVT, { detail: payload }));
    // also poke localStorage to notify other tabs
    localStorage.setItem("__cart_changed__", String(payload.at));
  } catch (e) {
    dlog("emitCartChanged error", e);
  }
}

export function onCartChanged(handler) {
  const wrapped = (e) => {
    dlog("onCartChanged event", e?.detail);
    handler(e?.detail || {});
  };
  window.addEventListener(EVT, wrapped);
  return () => window.removeEventListener(EVT, wrapped);
}
