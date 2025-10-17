// src/auth/cart/guestCart.js
import { emitCartChanged } from "./cartBus";

const LS_KEY = "guest_cart_v1";

const n = (x) => {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
};

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

function migrate(cart) {
  let changed = false;
  for (const it of cart.items || []) {
    // numeric guards
    const origQty = it.qty;
    it.qty = Math.max(1, Number.isFinite(+origQty) ? +origQty : 1);

    // backfill mrp/unitPrice from meta/product-ish data if missing
    const maybeMrp =
      n(it.mrp) ||
      n(it.meta?.mrp) ||
      n(it.listPrice) ||
      n(it.maxRetailPrice) ||
      n(it.price) ||
      n(it.sellingPrice) ||
      n(it.meta?.sellingPrice) ||
      n(it.unitPrice); // last resort

    const maybeSell =
      n(it.unitPrice) ||
      n(it.sellingPrice) ||
      n(it.price) ||
      n(it.meta?.sellingPrice) ||
      maybeMrp;

    if (!Number.isFinite(it.unitPrice) || it.unitPrice === 0) {
      it.unitPrice = maybeSell;
      changed = true;
    }
    if (!Number.isFinite(it.mrp) || it.mrp === 0) {
      it.mrp = maybeMrp;
      changed = true;
    }

    // ensure meta exists and mirrors
    it.meta = {
      ...(it.meta || {}),
      title: it.meta?.title ?? it.productName ?? it.name ?? it.title,
      mrp: n(it.meta?.mrp ?? it.mrp),
      sellingPrice: n(it.meta?.sellingPrice ?? it.unitPrice),
      qtySize: it.meta?.qtySize ?? it.qtySize,
      qtyUnit: it.meta?.qtyUnit ?? it.qtyUnit,
    };

    // recompute lineTotal
    const newLineTotal = Number((it.qty * n(it.unitPrice)).toFixed(2));
    if (newLineTotal !== it.lineTotal) {
      it.lineTotal = newLineTotal;
      changed = true;
    }
  }
  return changed ? cart : cart;
}

function ensureCart() {
  const c = load();
  if (c) {
    const migrated = migrate(c);
    return save(recalc(migrated));
  }
  return save({
    cartId: 0,
    userId: null,
    status: "ACTIVE",
    items: [],
    totalQty: 0,
    distinctItems: 0,
    subtotal: 0,
  });
}


function recalc(cart) {
  const totalQty = cart.items.reduce((s, i) => s + (i.qty || 0), 0);
  const distinctItems = cart.items.length;
  const subtotal = cart.items.reduce((s, i) => s + n(i.unitPrice) * (i.qty || 0), 0);
  cart.totalQty = totalQty;
  cart.distinctItems = distinctItems;
  cart.subtotal = Number(subtotal.toFixed(2));
  return cart;
}

export const guestCart = {
  get() {
    return ensureCart();
  },

  addItem(product, qty = 1) {
    const cart = ensureCart();

    const title =
      product?.productName || product?.name || product?.title || "Product";
    const image =
      product?.productImg || product?.image || product?.image1 || "";
    const key =
      product?.id ??
      product?.productId ??
      `${String(title).toLowerCase()}::${String(image).toLowerCase()}`;

    // canonical prices
    const mrp = n(
      product?.mrp ??
        product?.listPrice ??
        product?.maxRetailPrice ??
        product?.meta?.mrp ??
        product?.price ??
        product?.sellingPrice // fallback
    );
    const unitPrice = n(
      product?.sellingPrice ?? product?.price ?? product?.unitPrice ?? mrp
    );

    let found = cart.items.find((i) => i.key === key);
    if (found) {
      found.qty = (found.qty || 1) + qty;
      // backfill/normalize prices if older item missed them
      if (found.unitPrice == null) found.unitPrice = unitPrice;
      if (found.mrp == null) found.mrp = mrp;
      found.meta = {
        ...(found.meta || {}),
        title: product?.title ?? title,
        titleHi: product?.titleHi,
        qtySize: product?.qtySize,
        qtyUnit: product?.qtyUnit,
        mrp,
        sellingPrice: unitPrice,
      };
      found.lineTotal = Number((found.qty * n(found.unitPrice)).toFixed(2));
    } else {
      const safeQty = Math.max(1, Number(qty) || 1);
      cart.items.push({
        key,
        cartItemId: Date.now() + Math.random(),
        productId: product?.productId ?? product?.id ?? null,
        productName: title,
        productImg: image,
        qty: safeQty,
        unitPrice, // ✅ selling
        mrp,       // ✅ mrp (needed for discount/saved)
        lineTotal: Number((unitPrice * safeQty).toFixed(2)),
        meta: {
          title: product?.title ?? title,
          titleHi: product?.titleHi,
          qtySize: product?.qtySize,
          qtyUnit: product?.qtyUnit,
          mrp,
          sellingPrice: unitPrice,
        },
      });
    }

    const res = save(recalc(cart));
    emitCartChanged("guest:addItem");
    return res;
  },

  updateQty(itemId, qty) {
    const cart = ensureCart();
    const it = cart.items.find((i) => i.cartItemId === itemId);
    if (!it) return cart;
    it.qty = Math.max(1, Number(qty) || 1);
    it.lineTotal = Number((it.qty * n(it.unitPrice)).toFixed(2));
    const res = save(recalc(cart));
    emitCartChanged("guest:updateQty");
    return res;
  },

  removeItem(itemId) {
    const cart = ensureCart();
    cart.items = cart.items.filter((i) => i.cartItemId !== itemId);
    const res = save(recalc(cart));
    emitCartChanged("guest:removeItem");
    return res;
  },

  clear() {
    const cart = ensureCart();
    cart.items = [];
    const res = save(recalc(cart));
    emitCartChanged("guest:clear");
    return res;
  },
};
