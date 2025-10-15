// src/auth/cart/cartApi.js
import { app } from "../http"; // <-- use app, not api

const unwrap = (res) => res?.data?.data ?? res?.data;

export const cartApi = {
  getCart(userId) {
    return app.get(`/cart/${userId}`).then(unwrap);
  },
  addItem(userId, productId, qty = 1) {
    return app.post(`/cart/${userId}/items`, { productId, qty }).then(unwrap);
  },
  updateQty(userId, itemId, qty) {
    return app.put(`/cart/${userId}/items/${itemId}`, { qty }).then(unwrap);
  },
  removeItem(userId, itemId) {
    return app.delete(`/cart/${userId}/items/${itemId}`).then(unwrap);
  },
  clear(userId) {
    return app.delete(`/cart/${userId}/items`).then(unwrap);
  },
};
