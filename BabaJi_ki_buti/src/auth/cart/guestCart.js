// src/auth/cart/guestCart.js
import { emitCartChanged } from "./cartBus";

const DBG_CART = true;
const dlog = (...a) => DBG_CART && console.log("[guestCart]", ...a);

const LS_KEY = "guest_cart_v1";

const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

function productKey(p) {
  return (
    p?.productId ??
    p?.id ??
    p?.sku ??
    `${slug(p?.productName ?? p?.name ?? p?.title)}::${slug(
      p?.image ?? p?.image1 ?? p?.productImg
    )}`
  );
}

function load() {
  try {
    const v = JSON.parse(localStorage.getItem(LS_KEY)) || null;
    dlog("load ->", v);
    return v;
  } catch (e) {
    dlog("load ERROR", e);
    return null;
  }
}
function save(c) {
  dlog("save <-", c);
  localStorage.setItem(LS_KEY, JSON.stringify(c));
  return c;
}

function ensureCart() {
  const c = load();
  if (c) return c;
  const init = {
    cartId: 0,
    userId: null,
    status: "ACTIVE",
    items: [],
    totalQty: 0,
    distinctItems: 0,
    subtotal: 0,
  };
  dlog("ensureCart init", init);
  return save(init);
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
  dlog("recalc ->", { totalQty, distinctItems, subtotal: cart.subtotal });
  return cart;
}

function buildItemFromProduct(product, qty) {
  const key = productKey(product);
  const pid = product?.productId ?? product?.id ?? null;
  const unitPrice = Number(
    product?.sellingPrice ?? product?.price ?? product?.mrp ?? 0
  );
  const mrp = Number(
    ((product?.mrp ?? product?.price ?? product?.sellingPrice) ?? unitPrice) || 0
  );

  const meta = {
    qtySize: product?.qtySize ?? null,
    qtyUnit: product?.qtyUnit ?? null,
    tags: product?.tags ?? product?.tagsEn ?? [],
    title: product?.title ?? product?.productName ?? product?.name ?? null,
    subtitle: product?.subtitle ?? null,
    indication: product?.indication ?? null,
    mrp,
  };

  const item = {
    key,
    cartItemId: Date.now() + Math.random(),
    productId: pid,
    productName:
      product?.productName || product?.name || product?.title || "Product",
    productImg:
      product?.productImg || product?.image || product?.image1 || "",
    qty: Math.max(1, Number(qty) || 1),
    unitPrice,
    mrp,
    meta,
    lineTotal: Number(
      (unitPrice * Math.max(1, Number(qty) || 1)).toFixed(2)
    ),
  };
  dlog("buildItemFromProduct ->", item);
  return item;
}

export const guestCart = {
  get() {
    const c = ensureCart();
    dlog("get ->", c);
    return c;
  },

  addItem(product, qty = 1) {
    dlog("addItem req", { product, qty });
    const cart = ensureCart();
    const key = productKey(product);
    const found = cart.items.find((i) => i.key === key);
    if (found) {
      found.qty += qty;
      const latestPrice = Number(
        product?.sellingPrice ??
          product?.price ??
          product?.mrp ??
          found.unitPrice ??
          0
      );
      found.unitPrice = latestPrice;
      found.lineTotal = Number(
        (found.qty * Number(found.unitPrice)).toFixed(2)
      );
      dlog("addItem merged ->", found);
    } else {
      const built = buildItemFromProduct(product, qty);
      cart.items.push(built);
      dlog("addItem new ->", built);
    }
    const res = save(recalc(cart));
    emitCartChanged("guest:addItem");
    return res;
  },

  updateQty(itemId, qty) {
    dlog("updateQty req", { itemId, qty });
    const cart = ensureCart();
    const it = cart.items.find((i) => i.cartItemId === itemId);
    if (!it) {
      dlog("updateQty not found", itemId);
      return cart;
    }
    it.qty = Math.max(1, Number(qty) || 1);
    it.lineTotal = Number(
      (it.qty * Number(it.unitPrice || 0)).toFixed(2)
    );
    const res = save(recalc(cart));
    emitCartChanged("guest:updateQty");
    return res;
  },

  removeItem(itemId) {
    dlog("removeItem req", { itemId });
    const cart = ensureCart();
    cart.items = cart.items.filter((i) => i.cartItemId !== itemId);
    const res = save(recalc(cart));
    emitCartChanged("guest:removeItem");
    return res;
  },

  clear() {
    dlog("clear req");
    const cart = ensureCart();
    cart.items = [];
    const res = save(recalc(cart));
    emitCartChanged("guest:clear");
    return res;
  },

  async mergeIntoServer(userId, cartApi) {
    const cart = load();
    dlog("mergeIntoServer start", { userId, cart });
    if (!cart || !cart.items.length) {
      dlog("mergeIntoServer skip (empty)");
      return;
    }
    for (const it of cart.items) {
      if (it.productId != null) {
        dlog("mergeIntoServer addItem", it);
        await cartApi.addItem(userId, it.productId, it.qty);
      } else {
        console.warn(
          "Skipping merge of guest item without productId:",
          it
        );
      }
    }
    localStorage.removeItem(LS_KEY);
    dlog("mergeIntoServer done, LS cleared");
  },
};
