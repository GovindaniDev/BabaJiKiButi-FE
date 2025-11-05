// src/auth/subscription/subscriptionApi.js
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
  const options = { method, credentials: "include", headers };
  if (body !== undefined && body !== null) options.body = JSON.stringify(body);

  let resp, text = null, json = null;
  try {
    resp = await fetch(url.toString(), options);
  } catch (e) {
    return { ok: false, error: e?.message || "Network failure", status: 0, raw: null, userMessage: "We couldn’t reach the server. Check your internet and try again." };
  }

  try { text = await resp.text(); } catch {}
  if (text && text.trim().length) {
    try { json = JSON.parse(text); } catch {}
  }

  // Helper to extract clean server text
  const extractMsg = () => {
    if (!json) return (text && text.slice(0, 200)) || "";
    if (typeof json === "object") {
      return (
        json.message ||
        json.error ||
        json.detail ||
        (typeof json.data === "string" ? json.data : "") ||
        ""
      );
    }
    return String(json);
  };

  if (!resp.ok) {
    const errorMsg = extractMsg() || `HTTP ${resp.status}`;
    // Build a friendly message here as well so callers can directly show it
    let userMessage = errorMsg;
    try {
      // Lazy import to avoid circular deps if any
      const { userErrorMessage } = await import("../../utils/userMessages.js");
      userMessage = userErrorMessage({ status: resp.status, error: errorMsg, raw: json });
    } catch {
      // fallback keeps working even if import fails (e.g., build step)
      if (resp.status === 0) userMessage = "We couldn’t reach the server. Check your internet and try again.";
      else if (resp.status === 401) userMessage = "Please sign in to continue.";
      else if (resp.status === 409) userMessage = "A subscription payment is already in progress. You can abort it and try again.";
      else if (resp.status >= 500) userMessage = "We’re facing an issue on our side. Please try again in a minute.";
    }

    console.error("❌ subscriptionApi error:", errorMsg, json);
    return { ok: false, error: errorMsg, status: resp.status, raw: json ?? text, userMessage };
  }

  if (!text || !text.trim().length) {
    return { ok: true, data: null, status: resp.status };
  }

  return { ok: true, data: unwrap(json ?? text), status: resp.status };
}

/* ---------- Cashfree checkout ---------- */
async function createCheckoutSession({ userId, planId, returnUrl }) {
  return http("/api/subscriptions/payments/cashfree/checkout", {
    method: "POST",
    body: { userId, planId, returnUrl },
  });
}

/* ---------- Abort pending subscription (so user can retry) ---------- */
async function abortPending(userId) {
  return http("/api/subscriptions/payments/cashfree/abort", {
    method: "POST",
    body: { userId },
  });
}

function emitSubscriptionChanged(type, data) {
  try {
    typeof window !== "undefined" &&
      window.dispatchEvent(new CustomEvent("subscription:changed", { detail: { type, sub: data } }));
  } catch {}
}

export const subscriptionApi = {
  createCheckoutSession,
  abortPending,

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
