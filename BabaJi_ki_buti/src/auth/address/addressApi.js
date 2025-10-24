// src/auth/address/addressApi.js
// Base shape (matches backend):
//   /api/users/{userId}/addresses
// Backend wraps in ApiResponse<T> -> { data, message?, status? }

// ---- configurable API host (optional) ----
// Works same-origin (empty) OR with a full host like "https://api.example.com"
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE_URL) ||
  import.meta?.env?.VITE_API_BASE ||
  ""; // "" -> same origin

const BASE = (userId) => `/api/users/${encodeURIComponent(userId)}/addresses`;

// join helper that respects absolute URLs
const toUrl = (path) =>
  API_BASE
    ? API_BASE.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`)
    : path;

async function http(url, { method = "GET", body, headers } = {}) {
  // prevent stale GETs
  const finalUrl =
    method === "GET"
      ? url + (url.includes("?") ? "&" : "?") + "__ts=" + Date.now()
      : url;

  const res = await fetch(toUrl(finalUrl), {
    method,
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {}

  if (!res.ok) {
    const msg =
      (json && (json.message || json.error || json.status)) ||
      text ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  // Unwrap ApiResponse<T>
  return json && Object.prototype.hasOwnProperty.call(json, "data")
    ? json.data
    : json;
}

/* ------------------------- mappers (DTO <-> UI) ------------------------- */
function fromDto(dto) {
  if (!dto) return null;
  const rawType = dto.addressType || "Home";
  return {
    id: dto.addressId,
    addressId: dto.addressId,
    userId: dto.userId,

    name: dto.name,
    phone: dto.mobile,
    altPhone: dto.alternativePhone,

    pincode: dto.pinCode,
    pinCode: dto.pinCode,

    locality: dto.locality,
    address: dto.address,
    city: dto.city,
    state: dto.state,
    landmark: dto.landmark,

    // UI wants uppercase tokens, backend keeps TitleCase
    type: String(rawType).toUpperCase(),     // "HOME" | "WORK"  <-- for UI
    addressType: rawType,                    // "Home" | "Work"  <-- raw from backend

    isDefault: !!dto.isDefault,

    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function normalizeType(t) {
  // Map UI values ("HOME"/"WORK", or anything) -> backend TitleCase ("Home"/"Work")
  const up = String(t || "").trim().toUpperCase();
  if (up === "WORK") return "Work";
  return "Home";
}

/** UI -> Backend */
function toCreateReq(ui) {
  return {
    name: ui.name?.trim() || "",
    mobile: (ui.phone ?? ui.mobile ?? "").toString().trim(),
    alternativePhone:
      (ui.altPhone ?? ui.alternatePhone ?? ui.alternativePhone ?? "").toString().trim(),
    pinCode: ui.pincode?.trim() || ui.pinCode?.trim() || "",
    locality: ui.locality?.trim() || "",
    address: ui.address?.trim() || "",
    city: ui.city?.trim() || "",
    state: ui.state?.trim() || "",
    landmark: ui.landmark?.trim() || "",
    addressType: normalizeType(ui.type || ui.addressType), // -> Home|Work
    makeDefault: !!ui.makeDefault,
  };
}

function toUpdateReq(ui) {
  // Backend requires all fields (NotBlank), reuse create mapping
  return toCreateReq(ui);
}

/* ------------------------------ API surface ----------------------------- */
export const addressApi = {
  /** List addresses for a user (sorted default-first by backend) */
  async list(userId) {
    const data = await http(BASE(userId));
    return Array.isArray(data) ? data.map(fromDto) : [];
  },

  /** Get one address */
  async get(userId, addressId) {
    const data = await http(`${BASE(userId)}/${addressId}`);
    return fromDto(data);
  },

  /** Create new address (UI -> DTO -> UI) */
  async create(userId, uiPayload) {
    const req = toCreateReq(uiPayload);
    const data = await http(BASE(userId), { method: "POST", body: req });
    return fromDto(data);
  },

  /** Update address */
  async update(userId, addressId, uiPayload) {
    const req = toUpdateReq(uiPayload);
    const data = await http(`${BASE(userId)}/${addressId}`, {
      method: "PUT",
      body: req,
    });
    return fromDto(data);
  },

  /** Delete address */
  async remove(userId, addressId) {
    // Backend returns ApiResponse<{ deleted: true, addressId }>
    const data = await http(`${BASE(userId)}/${addressId}`, {
      method: "DELETE",
    });
    return data; // { deleted: true, addressId }
  },

  /** Mark as default */
  async makeDefault(userId, addressId) {
    const data = await http(`${BASE(userId)}/${addressId}/make-default`, {
      method: "POST",
    });
    return fromDto(data);
  },

  /** Fetch default address */
  async getDefault(userId) {
    const data = await http(`${BASE(userId)}/default`);
    return fromDto(data);
  },
};
