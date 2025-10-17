// src/auth/cart/guestCart.js
import { emitCartChanged } from "./cartBus";

const LS_KEY = "guest_cart_v1";

function load() {
  try { return JSON.parse(localStorage.getItem(LS_KEY)) || null; } catch { return null; }
}
function save(c) { localStorage.setItem(LS_KEY, JSON.stringify(c)); return c; }

function ensureCart() {
  const c = load();
  if (c) return c;
  return save({ cartId: 0, userId: null, status: "ACTIVE", items: [], totalQty: 0, distinctItems: 0, subtotal: 0 });
}

function recalc(cart) {
  const totalQty = cart.items.reduce((s,i)=>s+(i.qty||0),0);
  const distinctItems = cart.items.length;
  const subtotal = cart.items.reduce((s,i)=>s+Number(i.unitPrice||0)*(i.qty||0),0);
  cart.totalQty = totalQty; cart.distinctItems = distinctItems; cart.subtotal = Number(subtotal.toFixed(2));
  return cart;
}

export const guestCart = {
  get() { return ensureCart(); },
  addItem(product, qty=1) {
    const cart = ensureCart();
    const key = product?.id ?? product?.productId ?? `${(product?.name||product?.title||"Product").toLowerCase()}::${(product?.image||product?.image1||product?.productImg||"").toLowerCase()}`;
    const found = cart.items.find(i=>i.key===key);
    if (found) {
      found.qty += qty;
      found.unitPrice = Number(product?.sellingPrice ?? product?.price ?? product?.mrp ?? found.unitPrice ?? 0);
      found.lineTotal = Number((found.qty * Number(found.unitPrice||0)).toFixed(2));
    } else {
      const unitPrice = Number(product?.sellingPrice ?? product?.price ?? product?.mrp ?? 0);
      cart.items.push({ key, cartItemId: Date.now()+Math.random(), productId: product?.productId ?? product?.id ?? null, productName: product?.productName||product?.name||product?.title||"Product", productImg: product?.productImg||product?.image||product?.image1||"", qty: Math.max(1, Number(qty)||1), unitPrice, lineTotal: Number((unitPrice * Math.max(1, Number(qty)||1)).toFixed(2)) });
    }
    const res = save(recalc(cart)); emitCartChanged("guest:addItem"); return res;
  },
  updateQty(itemId, qty){ const cart=ensureCart(); const it=cart.items.find(i=>i.cartItemId===itemId); if(!it) return cart; it.qty=Math.max(1,Number(qty)||1); it.lineTotal=Number((it.qty*Number(it.unitPrice||0)).toFixed(2)); const res=save(recalc(cart)); emitCartChanged("guest:updateQty"); return res; },
  removeItem(itemId){ const cart=ensureCart(); cart.items=cart.items.filter(i=>i.cartItemId!==itemId); const res=save(recalc(cart)); emitCartChanged("guest:removeItem"); return res; },
  clear(){ const cart=ensureCart(); cart.items=[]; const res=save(recalc(cart)); emitCartChanged("guest:clear"); return res; }
};


