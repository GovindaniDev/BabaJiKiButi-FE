// src/auth/cart/cartApi.js
import { app } from "../http";
import { emitCartChanged } from "./cartBus";

const DBG_CART = true;
const dlog = (...a) => DBG_CART && console.log("[cartApi]", ...a);

const unwrap = (res) => res?.data?.data ?? res?.data;

const slug = (s) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

function fallbackKeyFromServerItem(it) {
  const name =
    it.productName ?? it.name ?? it.title ?? it.product?.name ?? "product";
  const img = it.productImg ?? it.image ?? it.product?.image ?? it.product?.image1 ?? "";
  return `${slug(name)}::${slug(img)}`;
}

function normalizeCart(serverCart) {
  if (!serverCart) {
    dlog("normalizeCart <- null/undefined");
    return serverCart;
  }

  const items = (serverCart.items || []).map((it) => {
    const id = it.cartItemId ?? it.id ?? it.itemId ?? null;
    const productId = it.productId ?? it.pid ?? it.product?.id ?? null;
    const name =
      it.productName ?? it.name ?? it.title ?? it.product?.name ?? "Product";
    const img =
      it.productImg ?? it.image ?? it.product?.image ?? it.product?.image1 ?? "";

    const qty = Number(it.qty ?? it.quantity ?? 1);
    const unitPrice = Number(
      it.unitPrice ?? it.price ?? it.sellingPrice ?? it.product?.price ?? 0
    );
    const mrp = Number(
      it.mrp ?? it.product?.mrp ?? it.product?.price ?? unitPrice
    );

    const key =
      it.key ??
      productId ??
      fallbackKeyFromServerItem({ productName: name, productImg: img });

    return {
      key,
      cartItemId: id ?? key,
      productId,
      productName: name,
      productImg: img,
      qty,
      unitPrice,
      mrp,
      meta: {
        qtySize: it.qtySize ?? it.meta?.qtySize ?? it.product?.qtySize ?? null,
        qtyUnit: it.qtyUnit ?? it.meta?.qtyUnit ?? it.product?.qtyUnit ?? null,
        title: it.title ?? it.meta?.title ?? name,
        mrp,
      },
      lineTotal: Number((qty * unitPrice).toFixed(2)),
    };
  });

  const totalQty = items.reduce((s, i) => s + (i.qty || 0), 0);
  const distinctItems = items.length;
  const subtotal = items.reduce((s, i) => s + (i.unitPrice || 0) * (i.qty || 0), 0);

  const norm = {
    cartId: serverCart.cartId ?? serverCart.id ?? 0,
    userId: serverCart.userId ?? null,
    status: serverCart.status ?? "ACTIVE",
    items,
    totalQty,
    distinctItems,
    subtotal: Number(subtotal.toFixed(2)),
  };
  dlog("normalizeCart ->", norm);
  return norm;
}

export const cartApi = {
  async getCart(userId) {
    dlog("getCart req", { userId });
    try {
      const raw = await app.get(`/cart/${userId}`).then(unwrap);
      dlog("getCart res raw", raw);
      const out = normalizeCart(raw);
      dlog("getCart normalized", out);
      return out;
    } catch (e) {
      dlog("getCart ERROR", e);
      throw e;
    }
  },
  async addItem(userId, productId, qty = 1) {
    dlog("addItem req", { userId, productId, qty });
    try {
      const res = await app.post(`/cart/${userId}/items`, { productId, qty }).then(unwrap);
      dlog("addItem res", res);
      emitCartChanged("server:addItem");
      return res;
    } catch (e) {
      dlog("addItem ERROR", e);
      throw e;
    }
  },
  async updateQty(userId, itemId, qty) {
    dlog("updateQty req", { userId, itemId, qty });
    try {
      const res = await app.put(`/cart/${userId}/items/${itemId}`, { qty }).then(unwrap);
      dlog("updateQty res", res);
      emitCartChanged("server:updateQty");
      return res;
    } catch (e) {
      dlog("updateQty ERROR", e);
      throw e;
    }
  },
  async removeItem(userId, itemId) {
    dlog("removeItem req", { userId, itemId });
    try {
      const res = await app.delete(`/cart/${userId}/items/${itemId}`).then(unwrap);
      dlog("removeItem res", res);
      emitCartChanged("server:removeItem");
      return res;
    } catch (e) {
      dlog("removeItem ERROR", e);
      throw e;
    }
  },
  async clear(userId) {
    dlog("clear req", { userId });
    try {
      const res = await app.delete(`/cart/${userId}/items`).then(unwrap);
      dlog("clear res", res);
      emitCartChanged("server:clear");
      return res;
    } catch (e) {
      dlog("clear ERROR", e);
      throw e;
    }
  },
};
