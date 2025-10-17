// src/utils/addToCartUnified.js
import { cartApiV2 } from "../auth/cart/cartApiV2";
import { guestCart } from "../auth/cart/guestCart";
import { emitCartChanged } from "../auth/cart/cartBus";

const money = (x) => {
  if (x == null) return 0;
  if (typeof x === "number") return Number.isFinite(x) ? x : 0;
  const v = parseFloat(String(x).replace(/[^\d.-]/g, ""));
  return Number.isFinite(v) ? v : 0;
};

export async function addToCartUnified({ userId, product, productId, qty = 1 }) {
  const pid = productId ?? product?.productId ?? product?.id ?? null;
  const q = Number(qty) || 1;

  const unitPrice = product ? money(product.sellingPrice ?? product.unitPrice ?? product.price) : undefined;
  const mrp       = product ? money(product.mrp ?? product.listPrice ?? product.maxRetailPrice ?? unitPrice) : undefined;

  if (userId) {
    if (pid == null) return;
    await cartApiV2.addItem(userId, pid, q, unitPrice, mrp);
  } else {
    if (!product && pid != null) product = { id: pid, sellingPrice: unitPrice, mrp };
    guestCart.addItem(product, q);
  }
  emitCartChanged("button:addToCart");
}
