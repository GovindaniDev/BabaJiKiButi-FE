// auth/admin/cms/announcementApi.js

/* ------------------------- env & tiny helpers ------------------------- */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  ""; // if empty, you must have a dev proxy

const toUrl = (path) =>
  API_BASE
    ? API_BASE.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`)
    : path;

// unwrap { data } or { result }
const unwrap = (json) => {
  if (!json) return json;
  if (typeof json === "object") {
    if ("data" in json) return json.data;
    if ("result" in json) return json.result;
  }
  return json;
};

function getAuthHeaders() {
  const headers = { "Content-Type": "application/json" };
  try {
    const token =
      (typeof window !== "undefined" && window.AUTH_TOKEN) ||
      (typeof localStorage !== "undefined" && localStorage.getItem("accessToken")) ||
      (typeof sessionStorage !== "undefined" && sessionStorage.getItem("accessToken"));
    if (token) headers["Authorization"] = `Bearer ${token}`;
  } catch {}
  return headers;
}

function pruneNullish(obj) {
  if (!obj || typeof obj !== "object") return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== null && v !== undefined) out[k] = v;
  }
  return out;
}

/* ------------------------- normalization helpers ------------------------- */
// API → FE (ensure lower-case for enums)
function normalizeIn(a) {
  if (!a) return a;
  return {
    ...a,
    channel: (a.channel ?? "").toString().toLowerCase(),   // TICKER -> ticker
    audience: (a.audience ?? "").toString().toLowerCase(), // ALL -> all
  };
}

// FE → API (only send fields if present, and upper-case for enums)
function normalizeOut(a) {
  if (!a) return a;
  const out = { ...a };

  // enums: only send if non-empty
  if (out.channel != null && out.channel !== "") {
    out.channel = out.channel.toString().toUpperCase();
  } else {
    delete out.channel;
  }
  if (out.audience != null && out.audience !== "") {
    out.audience = out.audience.toString().toUpperCase();
  } else {
    delete out.audience;
  }

  return pruneNullish(out);
}

/* ------------------------------- http core ------------------------------- */
async function http(method, path, body) {
  const res = await fetch(toUrl(path), {
    method,
    headers: getAuthHeaders(),
    credentials: "include", // keep for cookie-based auth too
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      json?.message ||
      json?.error ||
      (res.status === 401 ? "Unauthorized: Authentication is required to access this resource" : "Request failed");
    console.error(`[announcementApi] ${method} ${path} failed:`, { status: res.status, message: msg });
    throw { status: res.status, message: msg, details: json?.details ?? null };
  }
  return unwrap(json);
}

/* ----------------------------- exported calls ---------------------------- */
/**
 * Backend contract (adjust paths if different):
 *  GET    /api/announcements           -> { items: [...], ticker: { enabled, speedSec } }
 *  POST   /api/announcements           -> create one
 *  PUT    /api/announcements/:id       -> update
 *  DELETE /api/announcements/:id       -> delete
 *  POST   /api/announcements/reorder   -> { order: [ids...] }
 *  POST   /api/announcements/publish   -> { ticker: { enabled, speedSec } }
 */

export async function getAnnouncements() {
  const data = await http("GET", "/api/announcements");
  return {
    ...data,
    items: Array.isArray(data?.items) ? data.items.map(normalizeIn) : [],
  };
}

export async function createAnnouncement(body) {
  const created = await http("POST", "/api/announcements", normalizeOut(body));
  return normalizeIn(created);
}

export async function updateAnnouncement(id, body) {
  const updated = await http("PUT", `/api/announcements/${id}`, normalizeOut(body));
  return normalizeIn(updated);
}

export async function deleteAnnouncement(id) {
  return http("DELETE", `/api/announcements/${id}`);
}

export async function reorderAnnouncements(order) {
  return http("POST", "/api/announcements/reorder", { order });
}

export async function publishAnnouncements(payload) {
  // payload.ticker stays as-is
  return http("POST", "/api/announcements/publish", pruneNullish(payload));
}
