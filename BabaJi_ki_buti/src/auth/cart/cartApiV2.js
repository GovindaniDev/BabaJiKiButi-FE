// src/auth/cart/cartApiV2.js
import { app } from "../http";
import { emitCartChanged } from "./cartBus";
import { getProductById } from "../product/products";

const unwrap = (res) => res?.data?.data ?? res?.data;
const n = (x) => {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
};

function normalize(server) {
  if (!server) return null;

  const items = (server.items || []).map((it) => {
    // tolerant field picking
    const unitPrice = n(
      it.unitPrice ??
        it.sellingPrice ??
        it.price ??
        it.amountSell ??
        it.amount ??
        it.meta?.sellingPrice
    );
    const mrp = n(
      it.mrp ??
        it.listPrice ??
        it.maxRetailPrice ??
        it.meta?.mrp ??
        unitPrice // fallback
    );

    const qty = n(it.qty ?? it.quantity ?? 1);
    const name = it.productName ?? it.name ?? it.title ?? it.product?.name ?? "Product";
    const image =
      it.productImg ?? it.image ?? it.product?.image ?? it.product?.image1 ?? "";

    const key =
      it.key ??
      it.productId ??
      it.pid ??
      `${String(name).toLowerCase()}::${String(image).toLowerCase()}`;

    return {
      key,
      cartItemId: it.cartItemId ?? it.id ?? it.itemId ?? key,
      productId: it.productId ?? it.pid ?? it.product?.id ?? null,
      productName: name,
      productImg: image,
      qty,
      unitPrice, // ✅ selling
      mrp,       // ✅ mrp for discount/saved
      lineTotal: Number((qty * unitPrice).toFixed(2)),
      meta: {
        ...(it.meta || {}),
        title: it.meta?.title ?? it.title ?? name,
        titleHi: it.meta?.titleHi,
        qtySize: it.meta?.qtySize ?? it.qtySize,
        qtyUnit: it.meta?.qtyUnit ?? it.qtyUnit,
        mrp,
        sellingPrice: unitPrice,
      },
    };
  });

  const subtotal = items.reduce((s, i) => s + n(i.unitPrice) * (i.qty || 0), 0);

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
    const norm = normalize(raw);
    return await enrichCart(norm);
  },

  // If your backend supports it, consider sending unitPrice & mrp so server echoes them back coherently.
  async addItem(userId, productId, qty = 1 /*, unitPrice, mrp */) {
    const res = await app
      .post(`/cart/${userId}/items`, { productId, qty /*, unitPrice, mrp */ })
      .then(unwrap);
    emitCartChanged("server:addItem");
    return await enrichCart(normalize(res));
  },

  async updateQty(userId, itemId, qty) {
    const res = await app.put(`/cart/${userId}/items/${itemId}`, { qty }).then(unwrap);
    emitCartChanged("server:updateQty");
    return await enrichCart(normalize(res));
  },

  async removeItem(userId, itemId) {
    const res = await app.delete(`/cart/${userId}/items/${itemId}`).then(unwrap);
    emitCartChanged("server:removeItem");
    return await enrichCart(normalize(res));
  },

  async clear(userId) {
    const res = await app.delete(`/cart/${userId}/items`).then(unwrap);
    emitCartChanged("server:clear");
    return await enrichCart(normalize(res));
  },
};

// Enrich server items with product MRP/metadata if backend doesn't send them
async function enrichCart(cart) {
  if (!cart || !(cart.items || []).length) return cart;
  const items = await Promise.all(
    cart.items.map(async (it) => {
      // If MRP present and looks valid (> selling), keep as-is; else enrich
      const selling = Number(it.unitPrice || it.meta?.sellingPrice || 0);
      if (it.mrp != null && it.meta?.mrp != null && Number(it.mrp) > selling) return it;
      if (!it.productId) return it;
      try {
        const p = await getProductById(it.productId);
        if (!p) return it;
        // Prefer explicit MRP from product. Do NOT default to generic price,
        // otherwise selling==mrp and discount becomes 0 after login.
        const mrp = Number(
          p?.mrp ??
          it.mrp ??
          it.meta?.mrp ??
          0
        ) || Number(it.unitPrice || 0);
        const sellingFromProduct = Number(p?.sellingPrice ?? p?.offerPrice ?? p?.salePrice ?? NaN);
        const updated = {
          ...it,
          mrp,
          meta: {
            ...(it.meta || {}),
            qtySize: it.meta?.qtySize ?? p?.qtySize ?? null,
            qtyUnit: it.meta?.qtyUnit ?? p?.qtyUnit ?? null,
            title: it.meta?.title ?? p?.title ?? p?.productName ?? p?.name ?? it.productName,
            mrp,
            // keep selling from item; override if product has an explicit selling price
            sellingPrice: Number.isFinite(sellingFromProduct) ? sellingFromProduct : it.unitPrice,
          },
        };
        // If server sent bad MRP in meta, force sync there too
        if (updated.meta && updated.meta.mrp !== mrp) updated.meta.mrp = mrp;
        return updated;
      } catch {
        return it;
      }
    })
  );
  return { ...cart, items };
}
