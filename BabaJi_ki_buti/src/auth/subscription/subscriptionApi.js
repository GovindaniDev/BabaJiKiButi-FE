// Works with backend routes under /api/subscriptions
// - credentials: "include" (cookie session OK)
// - Sends JWT (if present) + Spring CSRF header (if cookie present)
// - Unwraps ApiResponse<T> → { data, ... }
// - Returns { ok, data?, error?, status }
// - Emits "subscription:changed" on key state updates

/* =========================== BASE =========================== */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "";

const toUrl = (path) =>
  API_BASE
    ? API_BASE.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`)
    : path;

const unwrap = (json) => {
  if (!json) return json;
  if (typeof json === "object") {
    if ("data" in json) return json.data;
    if ("result" in json) return json.result;
  }
  return json;
};

/* ====================== AUTH HEADERS ======================== */
function getAuthHeaders() {
  const headers = {};
  try {
    const token =
      (typeof window !== "undefined" && window.AUTH_TOKEN) ||
      (typeof localStorage !== "undefined" && localStorage.getItem("accessToken")) ||
      (typeof sessionStorage !== "undefined" && sessionStorage.getItem("accessToken"));
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  try {
    const m =
      typeof document !== "undefined" &&
      document.cookie &&
      document.cookie.match(/XSRF-TOKEN=([^;]+)/);
    if (m && m[1]) headers["X-XSRF-TOKEN"] = decodeURIComponent(m[1]);
  } catch {}
  return headers;
}

/// src/auth/subscription/subscriptionApi.js
/* ... previous code ... */

async function http(path, { method = "GET", body, params } = {}) {
  const base =
    (typeof window !== "undefined" && window.location.origin) || "http://localhost";
  const url = new URL(toUrl(path), base);

  if (params && typeof params === "object") {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
  }

  const headers = { "Content-Type": "application/json", ...getAuthHeaders() };

  const options = {
    method,
    credentials: "include",
    headers,
  };
  if (body !== undefined && body !== null) options.body = JSON.stringify(body);

  let resp, text = null, json = null;
  try {
    resp = await fetch(url.toString(), options);
  } catch (e) {
    return { ok: false, error: e?.message || "Network failure", status: 0 };
  }

  // Try text first (handles empty body / non-JSON)
  try { text = await resp.text(); } catch {}
  if (text && text.trim().length) {
    try { json = JSON.parse(text); } catch { /* leave as null */ }
  }

  if (!resp.ok) {
    const errorMsg =
      (json && (json.message || json.error || json.detail)) ||
      (text && text.slice(0, 200)) ||
      `HTTP ${resp.status}`;
    console.error("❌ subscriptionApi error:", errorMsg, json);
    return { ok: false, error: errorMsg, status: resp.status, raw: json ?? text };
  }

  // 204 No Content or non-JSON success
  if (!text || !text.trim().length) {
    return { ok: true, data: null, status: resp.status };
  }

  return { ok: true, data: unwrap(json ?? text), status: resp.status };
}


/* ==================== EVENTS (UI REACTIVITY) ==================== */
function emitSubscriptionChanged(type, data) {
  try {
    typeof window !== "undefined" &&
      window.dispatchEvent(new CustomEvent("subscription:changed", { detail: { type, sub: data } }));
  } catch {}
}

/* ==================== CASHFREE HELPERS ==================== */
/**
 * Create a Cashfree payment session for subscription checkout.
 * Backend SHOULD return: { paymentSessionId }.
 * (Backend keeps/knows the Cashfree order; frontend doesn't need it.)
 */
async function createCheckoutSession({ userId, planId, returnUrl }) {
  return http("/api/subscriptions/checkout", {
    method: "POST",
    body: { userId, planId, returnUrl },
  });
}

/**
 * Verify payment success IN BACKEND using the user's pending record.
 * Optional: pass `paymentSessionId` if you capture it in the URL,
 * but backend should be able to resolve by userId + latest pending.
 */
async function verifyPayment({ userId, paymentSessionId } = {}) {
  return http("/api/subscriptions/verify", {
    method: "POST",
    body: { userId, paymentSessionId: paymentSessionId ?? null },
  });
}

/* ======================= PUBLIC API ========================= */
export const subscriptionApi = {
  createCheckoutSession,
  verifyPayment,

  async getPlan() {
    return http("/api/subscriptions/plan");
  },

  async subscribe(userId, planId) {
    const res = await http("/api/subscriptions/subscribe", {
      method: "POST",
      body: { userId, planId: planId ?? null },
    });
    if (res.ok) emitSubscriptionChanged("subscribed", res.data);
    return res;
  },

  async cancel(userId, reason) {
    const res = await http("/api/subscriptions/cancel", {
      method: "POST",
      body: { userId, reason: reason || null },
    });
    if (res.ok) emitSubscriptionChanged("canceled", res.data);
    return res;
  },

  async myCurrent(userId) {
    return http("/api/subscriptions/my/current", { params: { userId } });
  },

  async myHistory(userId) {
    return http("/api/subscriptions/my/history", { params: { userId } });
  },

  async isActive(userId) {
    return http("/api/subscriptions/my/is-active", { params: { userId } });
  },

  async getActive(page = 0, size = 20) {
    return http("/api/subscriptions/active", { params: { page, size } });
  },

  async countActive() {
    return http("/api/subscriptions/active/count");
  },
};
