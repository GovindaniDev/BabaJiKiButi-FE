// src/auth/cart/cartBus.js
const EVT = "cart:changed";

export function emitCartChanged(reason = "") {
  try {
    const payload = { reason, at: Date.now() };
    window.dispatchEvent(new CustomEvent(EVT, { detail: payload }));
    localStorage.setItem("__cart_changed__", String(payload.at));
  } catch (e) {
    // noop
  }
}

export function onCartChanged(handler) {
  const wrapped = (e) => handler(e?.detail || {});
  window.addEventListener(EVT, wrapped);
  return () => window.removeEventListener(EVT, wrapped);
}


