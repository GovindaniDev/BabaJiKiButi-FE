// src/auth/address/addressApi.js
// Matches backend:
//   Base: /api/users/{userId}/addresses
//   Wrapper: ApiResponse<T>  -> { data, message?, status? }
// Uses cookie session: credentials: 'include'

const BASE = (userId) => `/api/users/${encodeURIComponent(userId)}/addresses`;

async function http(url, { method = "GET", body, headers } = {}) {
  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg =
      (json && (json.message || json.error || json.status)) ||
      text ||
      `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  // Unwrap ApiResponse<T> -> return .data if present, otherwise json
  return json && Object.prototype.hasOwnProperty.call(json, "data")
    ? json.data
    : json;
}

/* ------------------------- mappers (DTO <-> UI) ------------------------- */
/** Backend -> UI: normalize keys your components prefer */
function fromDto(dto) {
  if (!dto) return null;
  return {
    id: dto.addressId,             // keep both if you like
    addressId: dto.addressId,      // explicit
    userId: dto.userId,

    name: dto.name,
    phone: dto.mobile,             // UI uses 'phone'
    altPhone: dto.alternativePhone,

    pincode: dto.pinCode,          // UI uses 'pincode'
    pinCode: dto.pinCode,          // if you need raw

    locality: dto.locality,
    address: dto.address,
    city: dto.city,
    state: dto.state,
    landmark: dto.landmark,

    type: dto.addressType,         // UI uses 'type'
    addressType: dto.addressType,  // raw

    isDefault: !!dto.isDefault,

    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

/** UI -> Backend: convert UI form shape to Create/Update request */
function toCreateReq(ui) {
  return {
    name: ui.name?.trim() || "",
    mobile: ui.phone?.trim() || "",
    alternativePhone: ui.altPhone?.trim() || "",
    pinCode: ui.pincode?.trim() || ui.pinCode?.trim() || "",
    locality: ui.locality?.trim() || "",
    address: ui.address?.trim() || "",
    city: ui.city?.trim() || "",
    state: ui.state?.trim() || "",
    landmark: ui.landmark?.trim() || "",
    addressType: ui.type || ui.addressType || "Home",
    makeDefault: !!ui.makeDefault,
  };
}

function toUpdateReq(ui) {
  // Same fields as create, backend requires all (NotBlank annotations)
  return toCreateReq(ui);
}

/* ------------------------------ API surface ----------------------------- */
export const addressApi = {
  /** List addresses for a user (sorted default first by backend) */
  async list(userId) {
    const data = await http(BASE(userId));
    return Array.isArray(data) ? data.map(fromDto) : [];
  },

  /** Get one address */
  async get(userId, addressId) {
    const data = await http(`${BASE(userId)}/${addressId}`);
    return fromDto(data);
  },

  /** Create new address (UI shape in; DTO back) */
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
