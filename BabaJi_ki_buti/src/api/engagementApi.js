

import { app } from "../auth/http"; // keep if you’ll switch to real backend later

const DEMO_ON =
  (import.meta?.env?.VITE_USE_DEMO ?? "true").toString().toLowerCase() !== "false";

const LS_KEY = "demo-engagement-state:v1";

const n = (x) => (Number.isFinite(Number(x)) ? Number(x) : 0);

function loadState() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // default seed data
  const seed = {
    loyalty: {
      balance: 835,
      lifetimeEarned: 2200,
      lifetimeRedeemed: 1365,
      expiringSoon: [
        { points: 120, expiresOn: "2025-11-15" },
        { points: 90, expiresOn: "2025-12-05" },
      ],
    },
    wallet: {
      balance: 1420,
      lastUpdated: new Date().toISOString(),
      tiers: [
        { name: "Silver", cashbackRate: 0.01 },
        { name: "Gold", cashbackRate: 0.02 },
        { name: "Platinum", cashbackRate: 0.03 },
      ],
      txns: [
        { id: "w1", type: "Top-up", amount: 1000, at: "2025-10-10" },
        { id: "w2", type: "Auto-refund", amount: 249, at: "2025-10-16" },
        { id: "w3", type: "Cashback", amount: 99, at: "2025-10-18" },
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
        { threshold: 5000, rewardLabel: "₹200 off", reached: true },
        { threshold: 10000, rewardLabel: "₹500 off", reached: true },
        { threshold: 15000, rewardLabel: "₹1000 off", reached: false },
      ],
    },

    // 🔹 demo orders seed
    orders: [
      {
        id: "O-50150",
        placedAt: new Date().toISOString(),
        amount: 999,
        status: "Processing",
        items: [
          { id: 4, name: "Test Blend – Demo Pack", qty: 1, price: 999, img: "/images/nu4.png" },
        ],
        eta: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10),
        trackingId: "TRK999999",
      },
      {
        id: "O-50123",
        placedAt: "2025-10-12T10:20:00+05:30",
        amount: 799,
        status: "Out for delivery", // "Processing" | "Shipped" | "Out for delivery" | "Delivered" | "Cancelled"
        items: [
          { id: 1, name: "Herbal Mix – Digest Boost", qty: 1, price: 799, img: "/images/nu1.png" },
        ],
        eta: "2025-10-14",
        trackingId: "TRK783421",
      },
      {
        id: "O-50102",
        placedAt: "2025-10-05T09:00:00+05:30",
        amount: 1499,
        status: "Delivered",
        items: [
          { id: 2, name: "Ayur Diet Combo", qty: 1, price: 1499, img: "/images/nu2.png" },
        ],
        deliveredOn: "2025-10-07",
        trackingId: "TRK783020",
      },
      {
        id: "O-50088",
        placedAt: "2025-09-28T21:05:00+05:30",
        amount: 449,
        status: "Cancelled",
        items: [
          { id: 3, name: "Immunity Kadha", qty: 1, price: 449, img: "/images/nu3.png" },
        ],
        cancelledOn: "2025-09-29",
        trackingId: null,
      },
    ],
  };
  saveState(seed);
  return seed;
}
function saveState(s) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(s));
  } catch {}
}
const state = loadState();

/* ------------------------------ migration guards ------------------------------ */
function migrateState() {
  let changed = false;

  if (!state || typeof state !== "object") return;

  if (!state.wallet || typeof state.wallet !== "object") {
    state.wallet = { balance: 0, lastUpdated: null, tiers: [], txns: [] };
    changed = true;
  } else {
    if (!Array.isArray(state.wallet.tiers)) { state.wallet.tiers = []; changed = true; }
    if (!Array.isArray(state.wallet.txns))  { state.wallet.txns  = []; changed = true; }
  }

  if (!Array.isArray(state.orders)) {
    state.orders = [];
    changed = true;
  }

  if (!state.loyalty || typeof state.loyalty !== "object") {
    state.loyalty = { balance: 0, lifetimeEarned: 0, lifetimeRedeemed: 0, expiringSoon: [] };
    changed = true;
  } else if (!Array.isArray(state.loyalty.expiringSoon)) {
    state.loyalty.expiringSoon = [];
    changed = true;
  }

  if (!state.referral || typeof state.referral !== "object") {
    state.referral = { code: "DEMO", url: "", referredCount: 0, earnedCredits: 0 };
    changed = true;
  }

  if (!state.milestones || typeof state.milestones !== "object") {
    state.milestones = { currentSpend: 0, nextMilestone: 0, tiers: [] };
    changed = true;
  } else if (!Array.isArray(state.milestones.tiers)) {
    state.milestones.tiers = [];
    changed = true;
  }

  const hasDemo = Array.isArray(state.orders) && state.orders.some(o => String(o.id) === "O-50150");
  if (!hasDemo) {
    state.orders = [
      {
        id: "O-50150",
        placedAt: new Date().toISOString(),
        amount: 999,
        status: "Processing",
        items: [{ id: 4, name: "Test Blend – Demo Pack", qty: 1, price: 999, img: "/images/nu4.png" }],
        eta: new Date(Date.now() + 2 * 864e5).toISOString().slice(0, 10),
        trackingId: "TRK999999",
      },
      ...(Array.isArray(state.orders) ? state.orders : []),
    ];
    changed = true;
  }

  if (changed) saveState(state);
}
migrateState();

/* ----------------------------- Helpers ----------------------------- */
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
function normalizeWallet(s) {
  return {
    balance: n(s?.balance),
    lastUpdated: s?.lastUpdated,
    tiers: (s?.tiers || []).map((t) => ({
      name: t?.name || "Tier",
      cashbackRate: Number(t?.cashbackRate) || 0,
    })),
    txns: (s?.transactions || s?.txns || []).map((t) => ({
      id: String(t?.id || t?.txnId || Math.random()),
      type: t?.type || t?.kind || "Transaction",
      amount: n(t?.amount),
      at: t?.at || t?.createdAt || new Date().toISOString(),
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
    })),
    eta: o?.eta,
    deliveredOn: o?.deliveredOn,
    cancelledOn: o?.cancelledOn,
    trackingId: o?.trackingId || null,
  }));
}

/* ------------------------------ LOYALTY ------------------------------ */
export async function getLoyaltySummary(userId) {
  if (DEMO_ON) return normalizeLoyalty(state.loyalty);
  try {
    const { data } = await app.get(`/loyalty/summary`, { params: { userId } });
    return normalizeLoyalty(data?.data || data);
  } catch (e) {
    // fall back silently in dev
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
  const { data } = await app.post(`/loyalty/redeem`, { userId, points });
  return data?.data || data;
}

/* ------------------------------ WALLET ------------------------------ */
// export async function getWallet(userId) {
//   if (DEMO_ON) return normalizeWallet(state.wallet);
//   try {
//     const { data } = await app.get(`/wallet`, { params: { userId } });
//     return normalizeWallet(data?.data || data);
//   } catch (e) {
//     return normalizeWallet(state.wallet);
//   }
// }
// export async function topupWallet({ userId, amount }) {
//   if (DEMO_ON) {
//     const a = n(amount);
//     state.wallet.balance = n(state.wallet.balance) + a;
//     state.wallet.lastUpdated = new Date().toISOString();
//     state.wallet.txns = [
//       {
//         id: `t${Date.now()}`,
//         type: "Top-up",
//         amount: a,
//         at: new Date().toISOString().slice(0, 10),
//       },
//       ...(state.wallet.txns || []),
//     ];
//     saveState(state);
//     return { ok: true, demo: true };
//   }
//   const { data } = await app.post(`/wallet/topup`, { userId, amount });
//   return data?.data || data;
// }

/* ------------------------------ ORDERS ------------------------------ */
export async function getOrders(userId) {
  if (DEMO_ON) {
    const list = Array.isArray(state.orders) ? state.orders : [];
    return { total: list.length, list: normalizeOrders(list) };
  }
  try {
    const { data } = await app.get(`/orders`, { params: { userId } });
    const rows = data?.data || data;
    const list = Array.isArray(rows?.list) ? rows.list : (Array.isArray(rows) ? rows : []);
    return {
      total: Array.isArray(rows) ? rows.length : Number(rows?.total ?? list.length),
      list: normalizeOrders(list),
    };
  } catch (e) {
    const list = Array.isArray(state.orders) ? state.orders : [];
    return { total: list.length, list: normalizeOrders(list) };
  }
}

export async function trackOrder(orderId) {
  if (DEMO_ON) {
    const list = Array.isArray(state.orders) ? state.orders : [];
    const o = list.find((x) => String(x.id) === String(orderId));
    return o ? { trackingId: o.trackingId, status: o.status, eta: o.eta, demo: true } : null;
  }
  const { data } = await app.get(`/orders/${orderId}/track`);
  return data?.data || data;
}

export async function cancelOrder(orderId) {
  if (DEMO_ON) {
    const list = Array.isArray(state.orders) ? state.orders : [];
    state.orders = list.map((o) =>
      String(o.id) === String(orderId)
        ? { ...o, status: "Cancelled", cancelledOn: new Date().toISOString().slice(0, 10) }
        : o
    );
    saveState(state);
    return { ok: true, demo: true };
  }
  const { data } = await app.post(`/orders/${orderId}/cancel`);
  return data?.data || data;
}

/* ------------------------------ REFERRAL ----------------------------- */
export async function getReferralStats(userId) {
  if (DEMO_ON) return normalizeReferral(state.referral);
  try {
    const { data } = await app.get(`/referrals`, { params: { userId } });
    return normalizeReferral(data?.data || data);
  } catch (e) {
    return normalizeReferral(state.referral);
  }
}

/* ------------------------------ MILESTONES --------------------------- */
export async function getMilestones(userId) {
  if (DEMO_ON) return normalizeMilestones(state.milestones);
  try {
    const { data } = await app.get(`/rewards/milestones`, { params: { userId } });
    return normalizeMilestones(data?.data || data);
  } catch (e) {
    return normalizeMilestones(state.milestones);
  }
}
