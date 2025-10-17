// src/auth/cart/cartApiV2.js
import { app } from "../http";
import { emitCartChanged } from "./cartBus";

const unwrap = (res) => res?.data?.data ?? res?.data;

function normalize(server) {
  if (!server) return null;
  const items = (server.items || []).map((it) => {
    const id = it.cartItemId ?? it.id ?? it.itemId ?? null;
    const productId = it.productId ?? it.pid ?? null;
    const name = it.productName ?? it.name ?? "Product";
    const image = it.productImg ?? it.image ?? "";
    const qty = Number(it.qty ?? it.quantity ?? 1);
    const unitPrice = Number(it.unitPrice ?? it.price ?? 0);
    const key = it.key ?? productId ?? `${String(name).toLowerCase()}::${String(image).toLowerCase()}`;
    return {
      key,
      cartItemId: id ?? key,
      productId,
      productName: name,
      productImg: image,
      qty,
      unitPrice,
      lineTotal: Number((qty * unitPrice).toFixed(2)),
    };
  });
  const subtotal = items.reduce((s, i) => s + Number(i.unitPrice || 0) * (i.qty || 0), 0);
  return {
    cartId: server.cartId ?? server.id ?? 0,
    userId: server.userId ?? null,
    status: server.status ?? "ACTIVE",
    items,
    totalQty: items.reduce((s, i) => s + (i.qty || 0), 0),
    distinctItems: items.length,
    subtotal: Number(subtotal.toFixed(2)),
  };
}

export const cartApiV2 = {
  async getCart(userId) {
    const raw = await app.get(`/cart/${userId}`).then(unwrap);
    return normalize(raw);
  },
  async addItem(userId, productId, qty = 1) {
    const res = await app.post(`/cart/${userId}/items`, { productId, qty }).then(unwrap);
    emitCartChanged("server:addItem");
    return normalize(res);
  },
  async updateQty(userId, itemId, qty) {
    const res = await app.put(`/cart/${userId}/items/${itemId}`, { qty }).then(unwrap);
    emitCartChanged("server:updateQty");
    return normalize(res);
  },
  async removeItem(userId, itemId) {
    const res = await app.delete(`/cart/${userId}/items/${itemId}`).then(unwrap);
    emitCartChanged("server:removeItem");
    return normalize(res);
  },
  async clear(userId) {
    const res = await app.delete(`/cart/${userId}/items`).then(unwrap);
    emitCartChanged("server:clear");
    return normalize(res);
  },
};


