// src/auth/order/adminOrderApi.js
// Complete Admin Orders Client — matches your Postman flows
// Endpoints covered:
//  - GET /api/admin/orders/all                     (listAll, latestFirst, search, filter)
//  - GET /api/admin/orders                         (page, paged + filters)
//  - GET /api/admin/orders/{id}                    (getById)
//  - GET /api/admin/orders/by-public-id/{public}   (getByPublicOrderId)
//  - GET /api/admin/orders/stats                   (stats)

const API_BASE =
  (typeof window !== "undefined" && window.API_BASE_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  "http://localhost:8080";

const toUrl = (path) =>
  API_BASE.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`);

const unwrap = (json) => {
  try { return json && typeof json === "object" && "data" in json ? json.data : json; }
  catch { return json; }
};

// ---- auth helpers (JWT & CSRF optional) ----
function getAuthHeaders() {
  const h = {};

  // If you use JWT (role=ADMIN must be present):
  const token =
    (typeof window !== "undefined" && window.AUTH_TOKEN) ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken");
  if (token) h.Authorization = `Bearer ${token}`;

  // Spring CSRF from cookie (name may vary)
  const xsrf = document.cookie
    ?.split("; ")
    ?.find((c) => c.startsWith("XSRF-TOKEN="))
    ?.split("=")?.[1];
  if (xsrf) h["X-XSRF-TOKEN"] = decodeURIComponent(xsrf);

  return h;
}

async function httpJson(url, opts = {}) {
  const res = await fetch(url, {
    credentials: "include",
    headers: { Accept: "application/json", ...getAuthHeaders(), ...(opts.headers || {}) },
    ...opts,
  });
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const body = isJson ? await res.json().catch(() => null) : null;
  if (!res.ok) {
    const msg = (body && (body.message || body.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return unwrap(body);
}

function setParams(obj) {
  const p = new URLSearchParams();
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    p.set(k, String(v));
  });
  return p.toString();
}

export const adminOrderApi = {
  /* ----------------- UNPAGED LIST (ALL) -----------------
   * Mirrors Postman:
   * - Get all orders latest first
   * - Get all filter by status & date range
   * - Get orders search by keyword (q = order no / name / email)
   */
  async listAll({ q, status, paymentStatus, from, to, sort = "createdAt,desc", limit = 1000 } = {}) {
    const qs = setParams({ q, status, paymentStatus, from, to, sort, limit });
    return httpJson(toUrl(`/api/admin/orders/all?${qs}`));
  },

  // Convenience: exactly your "latest first" Postman call
  async latestFirst({ limit = 1000 } = {}) {
    return this.listAll({ sort: "createdAt,desc", limit });
  },

  // Convenience: search only (q)
  async search(q, { limit = 1000, sort = "createdAt,desc" } = {}) {
    return this.listAll({ q, limit, sort });
  },

  // Convenience: filter by status/date (and optional paymentStatus)
  async filter({ status, paymentStatus, from, to, limit = 2000, sort = "createdAt,desc" } = {}) {
    return this.listAll({ status, paymentStatus, from, to, limit, sort });
  },

  /* ----------------- PAGED LIST (server-side paging) ----------------- */
  async page({ q, status, paymentStatus, from, to, page = 0, size = 20, sort = "createdAt,desc" } = {}) {
    const qs = setParams({ q, status, paymentStatus, from, to, page, size, sort });
    return httpJson(toUrl(`/api/admin/orders?${qs}`));
  },

  /* ----------------- GET BY KEYS ----------------- */
  async getById(id) {
    if (!id) throw new Error("id is required");
    return httpJson(toUrl(`/api/admin/orders/${encodeURIComponent(id)}`));
  },

  async getByPublicOrderId(publicOrderId) {
    if (!publicOrderId) throw new Error("publicOrderId is required");
    return httpJson(toUrl(`/api/admin/orders/by-public-id/${encodeURIComponent(publicOrderId)}`));
  },

  /* ----------------- KPIs / STATS ----------------- */
  async stats({ from, to } = {}) {
    const qs = setParams({ from, to });
    return httpJson(toUrl(`/api/admin/orders/stats?${qs}`));
  },
};
