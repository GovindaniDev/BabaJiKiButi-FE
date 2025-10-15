// src/auth/cart/guestCart.js
const LS_KEY = "guest_cart_v1";

function load() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || null;
  } catch {
    return null;
  }
}
function save(c) {
  localStorage.setItem(LS_KEY, JSON.stringify(c));
  return c;
}

function ensureCart() {
  const c = load();
  if (c) return c;
  const blank = {
    cartId: 0,
    userId: null,
    status: "ACTIVE",
    items: [],
    totalQty: 0,
    distinctItems: 0,
    subtotal: 0,
  };
  return save(blank);
}

function recalc(cart) {
  const totalQty = cart.items.reduce((s, i) => s + (i.qty || 0), 0);
  const distinctItems = cart.items.length;
  const subtotal = cart.items.reduce(
    (s, i) => s + Number(i.unitPrice || 0) * (i.qty || 0),
    0
  );
  cart.totalQty = totalQty;
  cart.distinctItems = distinctItems;
  cart.subtotal = Number(subtotal.toFixed(2));
  return cart;
}

/** Build a cart item from a product object (captures extra attributes) */
function buildItemFromProduct(product, qty) {
  const pid = product?.productId ?? product?.id;
  const unitPrice = Number(
    product?.sellingPrice ?? product?.price ?? product?.mrp ?? 0
  );

  // Prefer explicit MRP if present; fall back to unitPrice
  const mrp = Number(
    // 👇 add parens since we mix ?? and ||
    ((product?.mrp ?? product?.price ?? product?.sellingPrice) ?? unitPrice) || 0
  );

  // Extra attributes the UI may read (kept inside a meta bag)
  const meta = {
    qtySize: product?.qtySize ?? null,
    qtyUnit: product?.qtyUnit ?? null,
    tags: product?.tags ?? product?.tagsEn ?? [],
    title: product?.title ?? product?.productName ?? product?.name ?? null,
    subtitle: product?.subtitle ?? null,
    indication: product?.indication ?? null,
    // keep mrp in meta too for consistency with UI fallback
    mrp,
  };

  return {
    cartItemId: Date.now() + Math.random(), // temp client id
    productId: pid,
    productName:
      product?.productName || product?.name || product?.title || "Product",
    productImg: product?.productImg || product?.image || product?.image1 || "",
    qty: Math.max(1, Number(qty) || 1),
    unitPrice,
    mrp,          // <— added explicit mrp for UI
    meta,         // <— extra fields for the UI
    lineTotal: Number((unitPrice * (Math.max(1, Number(qty) || 1))).toFixed(2)),
  };
}

export const guestCart = {
  get() {
    return ensureCart();
  },

  addItem(product, qty = 1) {
    const cart = ensureCart();
    const pid = product?.productId ?? product?.id;

    // price snapshot for this add
    const unitPrice = Number(
      product?.sellingPrice ?? product?.price ?? product?.mrp ?? 0
    );

    // If already present, just bump qty (and keep stored attributes)
    const found = cart.items.find((i) => i.productId === pid);
    if (found) {
      found.qty += qty;
      // Optionally refresh unitPrice snapshot if product price changed:
      found.unitPrice = unitPrice || found.unitPrice;
      found.lineTotal = Number((found.qty * Number(found.unitPrice)).toFixed(2));
    } else {
      cart.items.push(buildItemFromProduct(product, qty));
    }
    return save(recalc(cart));
  },

  updateQty(itemId, qty) {
    const cart = ensureCart();
    const it = cart.items.find((i) => i.cartItemId === itemId);
    if (!it) return cart;
    it.qty = Math.max(1, Number(qty) || 1);
    it.lineTotal = Number((it.qty * Number(it.unitPrice || 0)).toFixed(2));
    return save(recalc(cart));
  },

  removeItem(itemId) {
    const cart = ensureCart();
    cart.items = cart.items.filter((i) => i.cartItemId !== itemId);
    return save(recalc(cart));
  },

  clear() {
    const cart = ensureCart();
    cart.items = [];
    return save(recalc(cart));
  },

  /**
   * Optional: call this right after login to merge guest -> server.
   * Keeps server-side source of truth, using only quantities (server will price).
   */
  async mergeIntoServer(userId, cartApi) {
    const cart = load();
    if (!cart || !cart.items.length) return;
    for (const it of cart.items) {
      await cartApi.addItem(userId, it.productId, it.qty);
    }
    this.clear();
  },
};
