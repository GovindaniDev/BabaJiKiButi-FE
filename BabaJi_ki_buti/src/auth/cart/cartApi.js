// src/auth/cart/cartApi.js
import { app } from "../http";
// use your existing products API (you already use this in ShopNow)
import { getAllProducts } from "../product/products";

/** ---------------------------------------------------------
 *  Small in-memory cache of products to enrich cart rows
 *  ------------------------------------------------------ */
let PRODUCTS_CACHE = null;            // array of products
let PRODUCTS_INDEX = new Map();       // productId -> product

async function ensureProductsIndex() {
  if (PRODUCTS_CACHE && PRODUCTS_INDEX.size) return PRODUCTS_INDEX;
  const all = await getAllProducts();               // <= you already have this
  PRODUCTS_CACHE = Array.isArray(all) ? all : [];

  PRODUCTS_INDEX = new Map();
  for (const p of PRODUCTS_CACHE) {
    // match the various shapes you use across the app
    const id =
      p?.productId ?? p?.id ?? p?.product_id ?? p?.slug ?? null;
    if (!id) continue;

    PRODUCTS_INDEX.set(String(id), {
      id: String(id),
      mrp: Number(p?.mrp ?? p?.price ?? 0),
      sellingPrice: Number(p?.sellingPrice ?? p?.price ?? 0),
      title:
        p?.productName ?? p?.name ?? p?.title ?? p?.product_title ?? "",
      img: p?.productImg ?? p?.image ?? p?.image1 ?? "",
    });
  }
  return PRODUCTS_INDEX;
}

const unwrap = (res) => res?.data?.data ?? res?.data ?? null;

/** Normalize a cart object so the UI reads one shape consistently */
const normalizeCart = (raw) => {
  const items = Array.isArray(raw?.items) ? raw.items : [];
  return {
    cartId: raw?.cartId ?? null,
    userId: raw?.userId ?? null,
    status: raw?.status ?? "ACTIVE",
    totalQty: Number(
      raw?.totalQty ??
        items.reduce((n, it) => n + Number(it?.qty || 0), 0)
    ),
    subtotal: Number(
      raw?.subtotal ??
        items.reduce(
          (s, it) => s + Number(it?.unitPrice || 0) * Number(it?.qty || 0),
          0
        )
    ),
    items: items.map((it) => ({
      cartItemId: it?.cartItemId,
      productId: it?.productId,
      productName: it?.productName,
      productImg: it?.productImg,
      qty: Number(it?.qty || 0),
      unitPrice: Number(it?.unitPrice || 0), // selling at time of add
      lineTotal:
        Number(it?.lineTotal) ??
        Number(it?.unitPrice || 0) * Number(it?.qty || 0),
      // enrichment slots (mrp / sellingPrice)
      mrp: null,
      sellingPrice: null,
    })),
    createdAt: raw?.createdAt ?? null,
    updatedAt: raw?.updatedAt ?? null,
  };
};

/** Enrich normalized cart with MRP/sellingPrice from products catalog */
async function enrichCart(cart) {
  const index = await ensureProductsIndex();
  const items = cart.items.map((it) => {
    const prod = index.get(String(it.productId)) || null;
    return {
      ...it,
      // Prefer live catalog, fallback to what we have
      productName: it.productName || prod?.title || "",
      productImg: it.productImg || prod?.img || it.productImg,
      mrp:
        prod?.mrp != null
          ? Number(prod.mrp)
          : (it.mrp != null ? Number(it.mrp) : null),
      sellingPrice:
        prod?.sellingPrice != null
          ? Number(prod.sellingPrice)
          : Number(it.unitPrice || 0),
    };
  });

  return { ...cart, items };
}

export const cartApi = {
  /** Get (or create) active cart, enriched with product prices */
  async getCart(userId) {
    const res = await app.get(`/cart/${userId}`);
    const data = unwrap(res);
    const cart = normalizeCart(data);
    return enrichCart(cart);
  },

  /** Add an item (or increment) */
  async addItem(userId, productId, qty = 1) {
    const res = await app.post(`/cart/${userId}/items`, { productId, qty });
    const cart = normalizeCart(unwrap(res));
    return enrichCart(cart);
  },

  /** Update quantity of a cart item */
  async updateQty(userId, itemId, qty) {
    const res = await app.put(`/cart/${userId}/items/${itemId}`, { qty });
    const cart = normalizeCart(unwrap(res));
    return enrichCart(cart);
  },

  /** Remove a specific item */
  async removeItem(userId, itemId) {
    const res = await app.delete(`/cart/${userId}/items/${itemId}`);
    const cart = normalizeCart(unwrap(res));
    return enrichCart(cart);
  },

  /** Clear cart */
  async clear(userId) {
    const res = await app.delete(`/cart/${userId}/items`);
    const cart = normalizeCart(unwrap(res));
    return enrichCart(cart);
  },

  /** Optional: force refresh of cached products (e.g., admin edits price) */
  async refreshProductsCache() {
    PRODUCTS_CACHE = null;
    PRODUCTS_INDEX = new Map();
    await ensureProductsIndex();
  },
};
