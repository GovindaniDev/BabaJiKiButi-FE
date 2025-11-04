import { app } from "../auth/http";
import { getProductById, getProductBySlug } from "../auth/product/products";

// Default to LIVE backend unless explicitly enabled via env
const DEMO_ON =
  (import.meta?.env?.VITE_USE_DEMO ?? "false").toString().toLowerCase() !== "false";

const PAGE_SIZE = 20;
const LS_KEY = "demo-engagement-state:v1";

const n = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);

/* ---------------- local demo state ---------------- */
function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seed = {
    loyalty: {
      balance: 835,
      lifetimeEarned: 2200,
      lifetimeRedeemed: 1365,
      expiringSoon: [
        { points: 120, expiresOn: "2025-11-15" },
        { points: 90,  expiresOn: "2025-12-05" },
      ],
    },
    wallet: {
      balance: 1420,
      lastUpdated: new Date().toISOString(),
      tiers: [
        { name: "Silver",   cashbackRate: 0.01 },
        { name: "Gold",     cashbackRate: 0.02 },
        { name: "Platinum", cashbackRate: 0.03 },
      ],
      txns: [
        { id: "w1", type: "Top-up",     amount: 1000, at: "2025-10-10" },
        { id: "w2", type: "Auto-refund",amount: 249,  at: "2025-10-16" },
        { id: "w3", type: "Cashback",   amount: 99,   at: "2025-10-18" },
      ],
    },
    referral: {
      code: "YASH123",
      url:
        typeof window !== "undefined"
          ? `${window.location.origin}/ref/YASH123`
          : "https://example.com/ref/YASH123",
      referredCount: 8,
      earnedCredits: 640,
    },
    milestones: {
      currentSpend: 12850,
      nextMilestone: 15000,
      tiers: [
        { threshold:  5000, rewardLabel: "₹200 off",  reached: true  },
        { threshold: 10000, rewardLabel: "₹500 off",  reached: true  },
        { threshold: 15000, rewardLabel: "₹1000 off", reached: false },
      ],
    },
    orders: [
      {
        id: "O-50150",
        placedAt: new Date().toISOString(),
        amount: 999,
        status: "Processing",
        items: [{ id: 4, name: "Test Blend – Demo Pack", qty: 1, price: 999, img: "/images/nu4.png" }],
        eta: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10),
        trackingId: "TRK999999",
      },
      {
        id: "O-50123",
        placedAt: "2025-10-12T10:20:00+05:30",
        amount: 799,
        status: "Out for delivery",
        items: [{ id: 1, name: "Herbal Mix – Digest Boost", qty: 1, price: 799, img: "/images/nu1.png" }],
        eta: "2025-10-14",
        trackingId: "TRK783421",
      },
      {
        id: "O-50102",
        placedAt: "2025-10-05T09:00:00+05:30",
        amount: 1499,
        status: "Delivered",
        items: [{ id: 2, name: "Ayur Diet Combo", qty: 1, price: 1499, img: "/images/nu2.png" }],
        deliveredOn: "2025-10-07",
        trackingId: "TRK783020",
      },
      {
        id: "O-50088",
        placedAt: "2025-09-28T21:05:00+05:30",
        amount: 449,
        status: "Cancelled",
        items: [{ id: 3, name: "Immunity Kadha", qty: 1, price: 449, img: "/images/nu3.png" }],
        cancelledOn: "2025-09-29",
        trackingId: null,
      },
    ],
  };
  saveState(seed);
  return seed;
}
function saveState(s) { try { localStorage.setItem(LS_KEY, JSON.stringify(s)); } catch {} }
const state = loadState();

/* ---------------- helpers ---------------- */
const isHttpNotImplemented = (e) => {
  const s = e?.response?.status;
  return s === 404 || s === 400 || s === 405 || s === 501;
};

const DEFAULTS = {
  order: (orderId) => ({
    id: String(orderId ?? "O-XXXX"),
    orderNumber: null,
    placedAt: null,
    amount: 0,
    status: "Processing",
    items: [],
    eta: null,
    deliveredOn: null,
    cancelledOn: null,
    trackingId: null,
    shipping: null,
    paymentMode: "—",
  }),
  timeline: (o = null) => ([
    { key: "Confirmed",     title: "Order Confirmed", at: o?.placedAt ?? null, desc: "" },
    { key: "processing",    title: "Processing",      at: o?.acceptedAt || o?.processingAt || null, desc: "" },
    { key: "Outfordelivery",title: "Out for delivery",at: o?.shippedAt || null, desc: o?.trackingId ? `Tracking ${o.trackingId}` : "" },
    { key: "delivered",     title: "Delivered",       at: o?.deliveredOn || null, desc: "" },
  ]),
  track: (orderId) => ({
    trackingId: null,
    status: "Processing",
    eta: null,
    orderId: String(orderId ?? ""),
  }),
};

function mapOrderStatusToUi(s) {
  switch (String(s || "").toUpperCase()) {
    case "DELIVERED": return "Delivered";
    case "CANCELLED": return "Cancelled";
    case "SHIPPING":  return "Shipped";
    case "OUT FOR DELIVERY": return "Out for delivery";
    case "PROCESSING":
    case "PLACED":
    default:          return "Processing";
  }
}

/* ---------- product meta pickers ---------- */
const pickProductImage = (p) =>
  p?.productImg || p?.image || p?.image1 || p?.thumbnail || p?.cover || "/images/placeholder.png";

const pickProductTitle = (p) =>
  p?.productName || p?.name || p?.title || p?.product_title || "Item";

const pickProductPrices = (p) => {
  const mrp = Number(p?.mrp ?? p?.price ?? 0) || 0;
  const selling = Number(p?.sellingPrice ?? p?.salePrice ?? p?.price ?? mrp) || 0;
  return { mrp, selling };
};

/* ---------- normalization for list APIs ---------- */
function normalizeOrdersFromBackend(list = []) {
  return list.map((o) => ({
    id: String(o?.id ?? o?.orderNumber ?? Math.random()),
    orderNumber: o?.orderNumber || null,
    placedAt: o?.createdAt || null,
    amount: Number(o?.netAmount ?? 0),
    status: mapOrderStatusToUi(o?.status),
    items: (o?.items || []).map((it) => ({
      id: String(it?.id ?? Math.random()),
      name: it?.productName || "Item",
      qty: Number(it?.quantity ?? 1),
      price: Number(it?.price ?? 0),
      productId: it?.productId ?? null,
      productVariantId: it?.productVariantId ?? null,
      productSlug: it?.productSlug ?? it?.slug ?? null,
      img: "/images/placeholder.png",
    })),
    eta: null,
    deliveredOn: null,
    cancelledOn: null,
    trackingId: null,
    shipping: o?.shipping ?? null,
    paymentMode: o?.paymentMode ?? o?.paymentMethod ?? "—",
  }));
}

/* ---------- robust normalization for single-order fetch ---------- */
function normalizeSingleOrderFromBackend(raw) {
  if (!raw) return DEFAULTS.order();

  const itemsRaw =
    raw.items ||
    raw.orderItems ||
    raw.itemList ||
    raw.lines ||
    [];

  const items = itemsRaw.map((it) => {
    const p = it.product || {};

    const qty = n(it.quantity ?? it.qty ?? 1);
    const mrp =
      n(it.mrp ?? it.mrpPrice ?? it.listPrice ?? it.originalPrice ?? it.price ?? p.mrp ?? p.price);
    const selling =
      n(it.sellingPrice ?? it.salePrice ?? it.netPrice ?? it.price ?? p.sellingPrice ?? p.price ?? mrp);

    const productId = it.productId ?? p.id ?? it.id ?? null;
    const productSlug = it.productSlug ?? it.slug ?? p.slug ?? null;

    const name =
      it.productName ?? it.name ?? p.name ?? p.productName ?? "Item";

    const imgCandidate =
      it.image || it.img || p.image || p.image1 || p.thumbnail || p.cover;

    return {
      id: String(it.id ?? it.itemId ?? Math.random()),
      name,
      qty,
      price: selling,
      sellingPrice: selling,
      originalPrice: mrp,
      img: imgCandidate || "/images/placeholder.png",
      productId,
      productVariantId: it.productVariantId ?? it.variantId ?? p.variantId ?? null,
      productSlug,
      slug: productSlug,
      sellerName: it.sellerName ?? it.seller ?? p.seller ?? undefined,
      variantLabel: it.variantLabel ?? it.variant ?? undefined,
    };
  });

  return {
    id: String(raw.id ?? raw.orderNumber ?? Math.random()),
    orderNumber: raw.orderNumber ?? null,
    placedAt: raw.createdAt ?? raw.placedAt ?? raw.orderDate ?? null,
    amount: n(raw.netAmount ?? raw.amount ?? raw.totalAmount ?? 0),
    status: mapOrderStatusToUi(raw.status),
    items,
    eta: raw.eta ?? null,
    deliveredOn: raw.deliveredOn ?? raw.deliveredAt ?? null,
    cancelledOn: raw.cancelledOn ?? raw.cancelledAt ?? null,
    trackingId: raw.trackingId ?? null,
    shipping: raw.shipping ?? raw.shippingAddress ?? raw.address ?? null,
    paymentMode: raw.paymentMode ?? raw.paymentMethod ?? "—",
    refundEligible: Boolean(raw.refundEligible),
    returnRequested: Boolean(raw.returnRequested),
  };
}

function normalizeLoyalty(s) {
  return {
    balance: n(s?.balance),
    lifetimeEarned: n(s?.lifetimeEarned),
    lifetimeRedeemed: n(s?.lifetimeRedeemed),
    expiringSoon: (s?.expiringSoon || []).map((r) => ({
      points: n(r?.points),
      expiresOn: r?.expiresOn,
    })),
  };
}
function normalizeReferral(s) {
  const code = s?.code || s?.referralCode || "YASH123";
  const url =
    s?.url ||
    s?.link ||
    (typeof window !== "undefined" ? `${window.location.origin}/ref/${code}` : "");
  return {
    code,
    url,
    referredCount: n(s?.referredCount),
    earnedCredits: n(s?.earnedCredits),
  };
}
function normalizeMilestones(s) {
  return {
    currentSpend: n(s?.currentSpend),
    nextMilestone: n(s?.nextMilestone),
    tiers: (s?.tiers || []).map((t) => ({
      threshold: n(t?.threshold),
      rewardLabel: t?.rewardLabel || t?.label || "Reward",
      reached: Boolean(t?.reached),
    })),
  };
}
function normalizeOrders(list) {
  return (list || []).map((o) => ({
    id: String(o?.id),
    placedAt: o?.placedAt,
    amount: n(o?.amount),
    status: o?.status || "Processing",
    items: (o?.items || []).map((it) => ({
      id: String(it?.id ?? Math.random()),
      name: it?.name || "Item",
      qty: n(it?.qty || it?.quantity || 1),
      price: n(it?.price),
      img: it?.img || it?.image || "/images/placeholder.png",
      productId: it?.productId ?? null,
      productVariantId: it?.productVariantId ?? null,
      productSlug: it?.productSlug ?? it?.slug ?? null,
    })),
    eta: o?.eta,
    deliveredOn: o?.deliveredOn,
    cancelledOn: o?.cancelledOn,
    trackingId: o?.trackingId || null,
    shipping: o?.shipping ?? null,
    paymentMode: o?.paymentMode ?? o?.paymentMethod ?? "—",
  }));
}

/* ---------- hydration: attach product meta to order items ---------- */
export async function hydrateOrdersWithProductMeta(orders = []) {
  if (!Array.isArray(orders) || orders.length === 0) return orders;

  const byId = new Map();
  const bySlug = new Map();
  const toFetchIds = new Set();
  const toFetchSlugs = new Set();

  for (const o of orders) {
    for (const it of o?.items || []) {
      const pid = it?.productId ?? it?.id;
      const slug = it?.productSlug ?? it?.slug;
      if (pid != null && !byId.has(String(pid))) toFetchIds.add(String(pid));
      else if (slug && !bySlug.has(slug)) toFetchSlugs.add(slug);
    }
  }

  await Promise.all(
    Array.from(toFetchIds).map(async (id) => {
      try {
        const p = await getProductById(id);
        if (p) byId.set(String(id), p);
      } catch {}
    })
  );

  await Promise.all(
    Array.from(toFetchSlugs).map(async (slug) => {
      try {
        const p = await getProductBySlug(slug);
        if (p) bySlug.set(slug, p);
      } catch {}
    })
  );

  return orders.map((o) => ({
    ...o,
    items: (o?.items || []).map((it) => {
      const pid = it?.productId ?? it?.id;
      const slug = it?.productSlug ?? it?.slug;
      const p = (pid != null ? byId.get(String(pid)) : null) || (slug ? bySlug.get(slug) : null);

      if (!p) {
        return {
          ...it,
          img: it?.img || "/images/placeholder.png",
        };
      }

      const { mrp, selling } = pickProductPrices(p);
      return {
        ...it,
        name: it?.name || pickProductTitle(p),
        img: pickProductImage(p),
        slug: p?.slug ?? slug ?? null,
        productId: p?.id ?? pid,
        mrp,
        price: selling,
        sellingPrice: selling,
        originalPrice: mrp,
      };
    }),
  }));
}

/* ---------------- LOYALTY ---------------- */
export async function getLoyaltySummary(userId) {
  if (DEMO_ON) return normalizeLoyalty(state.loyalty);
  try {
    // baseURL '/api' => '/api/loyalty/summary'
    const { data } = await app.get(`/loyalty/summary`, { params: { userId } });
    return normalizeLoyalty(data?.data || data);
  } catch {
    return normalizeLoyalty(state.loyalty);
  }
}
export async function redeemPoints({ userId, points }) {
  if (DEMO_ON) {
    const p = n(points);
    state.loyalty.balance = Math.max(state.loyalty.balance - p, 0);
    state.loyalty.lifetimeRedeemed = n(state.loyalty.lifetimeRedeemed) + p;
    saveState(state);
    return { ok: true, demo: true };
  }
  // baseURL '/api' => '/api/loyalty/redeem'
  const { data } = await app.post(`/loyalty/redeem`, { userId, points });
  return data?.data || data;
}

/* ---------------- Single order + timeline ---------------- */
export async function getOrder(orderId, { useDemo = false } = {}) {
  if (!orderId) return null;
  try {
    const { data } = await app.get(`/orders/${encodeURIComponent(orderId)}`, {
      withCredentials: true,
    });
    const raw = data?.data ?? data;
    const norm = normalizeSingleOrderFromBackend(raw);
    const [hydrated] = await hydrateOrdersWithProductMeta([norm]);
    return hydrated || DEFAULTS.order(orderId);
  } catch (e) {
    if (!(DEMO_ON || useDemo) && !isHttpNotImplemented(e)) throw e;
    const list = Array.isArray(state.orders) ? state.orders : [];
    const found = list.find((x) => String(x.id) === String(orderId));
    const normalized = found ? normalizeOrders([found])[0] : DEFAULTS.order(orderId);
    const [hydrated] = await hydrateOrdersWithProductMeta([normalized]);
    return hydrated || DEFAULTS.order(orderId);
  }
}

export async function getOrderTimeline(orderId, { useDemo = false } = {}) {
  if (!orderId) return [];
  try {
    const res = await app.get(`/orders/${encodeURIComponent(orderId)}/timeline`, {
      withCredentials: true,
    });
    const arr = res?.data?.data ?? res?.data ?? [];
    if (Array.isArray(arr) && arr.length) return arr;
  } catch (e) {
    if (!(DEMO_ON || useDemo) && !isHttpNotImplemented(e)) throw e;
  }

  try {
    const [o, tr] = await Promise.all([
      getOrder(orderId, { useDemo }),
      trackOrder(orderId, { useDemo }),
    ]);
    if (!o) return DEFAULTS.timeline();
    return DEFAULTS.timeline({ ...o, trackingId: tr?.trackingId ?? null });
  } catch (e) {
    if (!(DEMO_ON || useDemo)) return DEFAULTS.timeline();
    const list = Array.isArray(state.orders) ? state.orders : [];
    const o = list.find((x) => String(x.id) === String(orderId));
    if (!o) return DEFAULTS.timeline();
    return DEFAULTS.timeline(o);
  }
}

/* ---------------- Return / Refund ---------------- */
export async function requestReturn(
  { orderId, items = [], reason = "Other", note = "" },
  { useDemo = false } = {}
) {
  if (!orderId) throw new Error("orderId required");
  try {
    const { data } = await app.post(
      `/orders/${encodeURIComponent(orderId)}/returns`,
      { items, reason, note },
      { withCredentials: true }
    );
    return data?.data ?? data;
  } catch (e) {
    if (!(DEMO_ON || useDemo) && !isHttpNotImplemented(e)) throw e;
    const list = Array.isArray(state.orders) ? state.orders : [];
    const idx = list.findIndex((x) => String(x.id) === String(orderId));
    if (idx >= 0) {
      list[idx] = { ...list[idx], returnRequested: true };
      state.orders = list;
      saveState(state);
    }
    return { ok: true, demo: true, fallback: true };
  }
}

export async function requestRefund(
  { orderId, method = "original", upiId = "", bank = { name: "", acct: "", ifsc: "" } },
  { useDemo = false } = {}
) {
  if (!orderId) throw new Error("orderId required");
  try {
    const { data } = await app.post(
      `/orders/${encodeURIComponent(orderId)}/refunds`,
      { orderId, method, upiId, bank },
      { withCredentials: true }
    );
    return data?.data ?? data;
  } catch (e) {
    if (!(DEMO_ON || useDemo) && !isHttpNotImplemented(e)) throw e;
    const list = Array.isArray(state.orders) ? state.orders : [];
    const idx = list.findIndex((x) => String(x.id) === String(orderId));
    if (idx >= 0) {
      list[idx] = { ...list[idx], refundRequested: true };
      state.orders = list;
      saveState(state);
    }
    return { ok: true, demo: true, fallback: true };
  }
}

/* ---------------- ORDERS (my + by userId) ---------------- */
export async function getMyOrders(
  { page = 0, size = 20, sort = "createdAt,desc", useDemo = false } = {}
) {
  const unwrap = (payload) => {
    const data = payload?.data ?? payload;
    const content = Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
    const total = Number.isFinite(data?.totalElements)
      ? data.totalElements
      : Array.isArray(content)
      ? content.length
      : 0;
    return { total, content };
  };

  try {
    const resA = await app.get(`/orders/my`, { params: { page, size, sort }, withCredentials: true });
    const { total, content } = unwrap(resA?.data);
    const normalized = normalizeOrdersFromBackend(content);
    const hydrated = await hydrateOrdersWithProductMeta(normalized);
    return { total, list: hydrated };
  } catch {}

  try {
    const resB = await app.get(`/orders`, { params: { page, size, sort }, withCredentials: true });
    const { total, content } = unwrap(resB?.data);
    const normalized = normalizeOrdersFromBackend(content);
    const hydrated = await hydrateOrdersWithProductMeta(normalized);
    return { total, list: hydrated };
  } catch (eB) {
    console.error("getMyOrders failed:", eB);
  }

  if (DEMO_ON || useDemo) {
    const list = Array.isArray(state.orders) ? state.orders : [];
    const normalized = normalizeOrders(list);
    const hydrated = await hydrateOrdersWithProductMeta(normalized);
    return { total: hydrated.length, list: hydrated };
  }
  return { total: 0, list: [] };
}

export async function getOrdersByUserId(
  userId,
  { page = 0, size = PAGE_SIZE, sort = "createdAt,desc", useDemo = false } = {}
) {
  if (!userId) return getMyOrders({ page, size, sort, useDemo });

  const unwrap = (payload) => {
    const data = payload?.data ?? payload;
    const content = Array.isArray(data?.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
    const total = Number.isFinite(data?.totalElements)
      ? data.totalElements
      : Array.isArray(content)
      ? content.length
      : 0;
    return { total, content };
  };

  try {
    const resA = await app.get(`/users/${encodeURIComponent(userId)}/orders`, {
      params: { page, size, sort },
    });
    const { total, content } = unwrap(resA?.data);
    const normalized = normalizeOrdersFromBackend(content);
    const hydrated = await hydrateOrdersWithProductMeta(normalized);
    return { total, list: hydrated };
  } catch {}

  try {
    const resB = await app.get(`/orders`, {
      params: { userId, page, size, sort },
    });
    const { total, content } = unwrap(resB?.data);
    const normalized = normalizeOrdersFromBackend(content);
    const hydrated = await hydrateOrdersWithProductMeta(normalized);
    return { total, list: hydrated };
  } catch {}

  try {
    const r = await getMyOrders({ page, size, sort, useDemo });
    if (r?.list?.length) return r;
  } catch {}

  if (DEMO_ON || useDemo) {
    const list = Array.isArray(state.orders) ? state.orders : [];
    const normalized = normalizeOrders(list);
    const hydrated = await hydrateOrdersWithProductMeta(normalized);
    return { total: hydrated.length, list: hydrated };
  }
  return { total: 0, list: [] };
}

/* ---------------- tracking / cancel ---------------- */
export async function trackOrder(orderId, { useDemo = false } = {}) {
  try {
    const { data } = await app.get(`/orders/${encodeURIComponent(orderId)}/track`);
    return data?.data || data || DEFAULTS.track(orderId);
  } catch (e) {
    if (!useDemo && !isHttpNotImplemented(e)) throw e;
    const list = Array.isArray(state.orders) ? state.orders : [];
    const o = list.find((x) => String(x.id) === String(orderId));
    return o
      ? { trackingId: o.trackingId ?? null, status: o.status ?? "Processing", eta: o.eta ?? null, demo: true }
      : DEFAULTS.track(orderId);
  }
}
export async function cancelOrder(orderId, { useDemo = false } = {}) {
  try {
    const { data } = await app.post(`/orders/${encodeURIComponent(orderId)}/cancel`);
    return data?.data || data;
  } catch (e) {
    if (!useDemo && !isHttpNotImplemented(e)) throw e;
    const list = Array.isArray(state.orders) ? state.orders : [];
    state.orders = list.map((o) =>
      String(o.id) === String(orderId)
        ? { ...o, status: "Cancelled", cancelledOn: new Date().toISOString().slice(0, 10) }
        : o
    );
    saveState(state);
    return { ok: true, demo: true, fallback: true };
  }
}

/* ---------------- referral / milestones ---------------- */
export async function getReferralStats(userId) {
  if (DEMO_ON) return normalizeReferral(state.referral);
  try {
    // baseURL '/api' => '/api/referrals/summary'
    const { data } = await app.get(`/referrals/summary`, { params: { userId } });
    return normalizeReferral(data?.data || data);
  } catch {
    return normalizeReferral(state.referral);
  }
}
export async function getMilestones(userId) {
  if (DEMO_ON) return normalizeMilestones(state.milestones);
  try {
    // baseURL '/api' => '/api/rewards/milestones'
    const { data } = await app.get(`/rewards/milestones`, { params: { userId } });
    return normalizeMilestones(data?.data || data);
  } catch {
    return normalizeMilestones(state.milestones);
  }
}
