// src/auth/wishlist/wishlistApi.js
// Works with your backend routes under /api/wishlist
// - Uses cookie session: credentials: "include"
// - Sends JWT (if present) + Spring CSRF header (if cookie present)
// - Unwraps ApiResponse<T> -> { data, message?, status? }
// - Fires `window` events so the rest of the app can react: "wishlist:changed"
// - Simple per-user in-memory cache, cleared on logout/session switch

import { getAccessToken } from "../http";

 // <-- keep paths correct for your project

/* ------------------------ base URL helpers ------------------------ */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE_URL) ||
  (() => {
    try {
      return import.meta?.env?.VITE_API_BASE;
    } catch {
      return undefined;
    }
  })() ||
  ""; // "" -> same origin

const toUrl = (path) =>
  API_BASE
    ? API_BASE.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`)
    : path;

/* --------------------------- unwrapping --------------------------- */
const unwrap = (json) => {
  try {
    return json && typeof json === "object" && "data" in json ? json.data : json;
  } catch {
    return json;
  }
};

/* ------------------------- auth & csrf hdrs ------------------------ */
function readCookie(name) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.split("; ").find((c) => c.startsWith(`${name}=`));
  return m ? decodeURIComponent(m.split("=")[1]) : null;
}

function getAuthHeaders() {
  const headers = {};

  // ✅ Prefer the central source to avoid drift with interceptors
  const token = getAccessToken?.();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Spring CSRF cookie -> header
  const xsrf = readCookie("XSRF-TOKEN");
  if (xsrf) headers["X-XSRF-TOKEN"] = xsrf;

  return headers;
}

/* ----------------------------- fetch() ---------------------------- */
async function http(url, { method = "GET", body, headers } = {}) {
  const res = await fetch(toUrl(url), {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
      ...(headers || {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  // Some servers send 204 with empty body
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    // non-JSON body, keep as text
  }

  if (!res.ok) {
    const msg =
      (json && (json.message || json.error || json.status)) ||
      text ||
      `HTTP ${res.status}`;
    const err = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    err.status = res.status;
    err.body = json ?? text;

    if (res.status === 401 && typeof window !== "undefined") {
      try {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      } catch {}
    }
    throw err;
  }

  // ✅ If mutation returns empty body (e.g., 204), let caller decide (toggle() will refetch)
  const isMutation = /^(POST|PUT|PATCH|DELETE)$/i.test(method);
  if ((res.status === 204 || !text) && isMutation) {
    return null; // <-- previously threw "Empty response from server."
  }

  return unwrap(json);
}

/* --------------------------- normalizers -------------------------- */
// WishlistDto { wishlistId, userId, items: WishlistItemDto[], totalItems, createdAt, updatedAt }
// WishlistItemDto { wishlistItemId, productId, productName, productImg, slug }
function normalizeWishlist(dto) {
  if (!dto)
    return {
      id: null,
      userId: null,
      items: [],
      total: 0,
    };

  const items = Array.isArray(dto.items)
    ? dto.items.map((it) => ({
        id: it.wishlistItemId,
        wishlistItemId: it.wishlistItemId,
        productId: it.productId,
        name: it.productName,
        image: it.productImg,
        slug: it.slug,
        _raw: it,
      }))
    : [];

  return {
    id: dto.wishlistId,
    wishlistId: dto.wishlistId,
    userId: dto.userId,
    items,
    total: Number(dto.totalItems ?? items.length) || items.length,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    _raw: dto,
  };
}

/* ------------------------------ events ---------------------------- */
function emitChanged(payload) {
  if (typeof window === "undefined" || !window.dispatchEvent) return;
  try {
    window.dispatchEvent(new CustomEvent("wishlist:changed", { detail: payload }));
  } catch {}
}

/* ------------------------------ cache ----------------------------- */
const _cache = new Map(); // key = String(userId) -> normalized wishlist
function _setCache(userId, wl) {
  if (userId == null) return wl;
  _cache.set(String(userId), wl);
  return wl;
}
function _getCache(userId) {
  if (userId == null) return null;
  return _cache.get(String(userId)) || null;
}
export function clearWishlistCache() {
  _cache.clear();
}

// Auto-clear cache on session changes (logout/login/refresh rotations if you emit appSession:updated)
if (typeof window !== "undefined") {
  window.addEventListener("appSession:updated", clearWishlistCache);
}

/* ------------------------------ client ---------------------------- */
export const wishlistApi = {
  /** GET /api/wishlist/{userId}  -> WishlistDto */
  async get(userId) {
    const data = await http(`/api/wishlist/${encodeURIComponent(userId)}`);
    const wl = normalizeWishlist(data);
    _setCache(userId, wl);
    return wl;
  },

  /** ✨ NEW: just the number of items (uses cache, falls back to GET) */
  async count(userId) {
    if (!userId) return 0;
    const cached = _getCache(userId);
    if (cached) return Number(cached.total) || 0;
    const wl = await this.get(userId);
    return Number(wl.total) || 0;
  },

  /** ✨ NEW: flat list of items (uses cache, falls back to GET) */
  async list(userId) {
    if (!userId) return [];
    const cached = _getCache(userId);
    if (cached) return cached.items || [];
    const wl = await this.get(userId);
    return wl.items || [];
  },

  /** Convenience: check presence (uses cache first; falls back to GET). */
  async has(userId, productId) {
    if (!userId || !productId) return false;
    const cached = _getCache(userId);
    if (cached && Array.isArray(cached.items)) {
      return cached.items.some((it) => String(it.productId) === String(productId));
    }
    const wl = await this.get(userId);
    return wl.items.some((it) => String(it.productId) === String(productId));
  },

  /** POST /api/wishlist/{userId}/items  { productId } -> WishlistDto */
  async addItem(userId, productId) {
    const data = await http(`/api/wishlist/${encodeURIComponent(userId)}/items`, {
      method: "POST",
      body: { productId },
    });
    const wl = _setCache(userId, normalizeWishlist(data));
    emitChanged({ action: "added", userId, productId, count: wl.total, wishlist: wl });
    return wl;
  },

  /**
   * POST /api/wishlist/{userId}/toggle/{productId}
   * -> { added: boolean, wishlist: WishlistDto }  OR WishlistDto  OR 204 No Content
   */
  async toggle(userId, productId) {
    const data = await http(
      `/api/wishlist/${encodeURIComponent(userId)}/toggle/${encodeURIComponent(productId)}`,
      { method: "POST" }
    );

    if (data == null) {
      const wl = _setCache(userId, normalizeWishlist(await this.get(userId)));
      const added = wl.items.some((it) => String(it.productId) === String(productId));
      emitChanged({ action: added ? "added" : "removed", userId, productId, count: wl.total, wishlist: wl });
      return { added, wishlist: wl };
    }

    const returnedWishlist = data?.wishlist ?? data;
    const wl = _setCache(userId, normalizeWishlist(returnedWishlist));
    const added =
      typeof data?.added === "boolean"
        ? data.added
        : wl.items.some((it) => String(it.productId) === String(productId));

    emitChanged({ action: added ? "added" : "removed", userId, productId, count: wl.total, wishlist: wl });
    return { added, wishlist: wl };
  },

  /** DELETE /api/wishlist/{userId}/items/{itemId} -> WishlistDto */
  async removeItem(userId, itemId) {
    const data = await http(
      `/api/wishlist/${encodeURIComponent(userId)}/items/${encodeURIComponent(itemId)}`,
      { method: "DELETE" }
    );
    const wl = _setCache(userId, normalizeWishlist(data));
    emitChanged({ action: "removed", userId, itemId, count: wl.total, wishlist: wl });
    return wl;
  },

  /** DELETE /api/wishlist/{userId}/items -> WishlistDto */
  async clear(userId) {
    const data = await http(`/api/wishlist/${encodeURIComponent(userId)}/items`, {
      method: "DELETE",
    });
    const wl = _setCache(userId, normalizeWishlist(data));
    emitChanged({ action: "cleared", userId, count: wl.total, wishlist: wl });
    return wl;
  },

  /** POST /api/wishlist/{userId}/items/{itemId}/move-to-cart  { qty } */
  async moveToCart(userId, itemId, qty = 1) {
    const data = await http(
      `/api/wishlist/${encodeURIComponent(userId)}/items/${encodeURIComponent(itemId)}/move-to-cart`,
      { method: "POST", body: { qty: Number(qty) || 1 } }
    );
    const wl = _setCache(userId, normalizeWishlist(data));
    emitChanged({ action: "movedToCart", userId, itemId, qty, count: wl.total, wishlist: wl });
    return wl;
  },
};

/* -------------------------- dev harness (optional) -------------------------- */
if (typeof window !== "undefined" && !window.__wl) {
  // Simple helpers for manual testing in the browser console:
  window.__wl = {
    get: (u) => wishlistApi.get(u),
    has: (u, p) => wishlistApi.has(u, p),
    add: (u, p) => wishlistApi.addItem(u, p),
    tog: (u, p) => wishlistApi.toggle(u, p),
    rm: (u, i) => wishlistApi.removeItem(u, i),
    clr: (u) => wishlistApi.clear(u),
    mv: (u, i, q) => wishlistApi.moveToCart(u, i, q),
    _clearCache: clearWishlistCache,
  };
}
