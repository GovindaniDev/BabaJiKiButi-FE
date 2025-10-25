// src/auth/order/orderApi.js
export const orderApi = {
  /**
   * Helper: unwrap common ApiResponse<T> -> { data, message?, status? }
   * Always return the inner payload if present, else the object itself.
   */
  _unwrap(json) {
    try {
      return json && typeof json === "object" && "data" in json ? json.data : json;
    } catch {
      return json;
    }
  },

  async getMyByPublicId(publicOrderId) {
    const url = `http://localhost:8080/api/orders/my/by-public-id/${encodeURIComponent(publicOrderId)}`;
    const res = await fetch(url, { credentials: "include" });
    let json = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }
    // ✅ normalize here so callers get the order object directly when ok
    return {
      ok: res.ok,
      status: res.status,
      json: res.ok ? this._unwrap(json) : null,
      raw: json, // optional: keep raw for debugging if needed
    };
  },

  async getPublicByPublicId(publicOrderId) {
    const url = `http://localhost:8080/api/orders/public/by-public-id/${encodeURIComponent(publicOrderId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Public order fetch failed: ${res.status}`);
    const json = await res.json();
    // ✅ unwrap so ThankYou receives the order object, not { data: ... }
    return this._unwrap(json);
  },

  /** Smart resolver used by ThankYou page */
  async getSmartByPublicId(publicOrderId) {
    // ✅ Try PUBLIC first (works even without cookies)
    try {
      return await this.getPublicByPublicId(publicOrderId); // returns plain order object
    } catch (e) {
      // Fallback to MY when the user is authenticated
      const second = await this.getMyByPublicId(publicOrderId);
      if (second.ok && second.json) return second.json; // already unwrapped
      throw new Error(`Order fetch failed: ${second.status || e.message}`);
    }
  },

  // Admin helpers (unchanged, but unwrapped for convenience)
  async adminList(params = "") {
    const res = await fetch(`http://localhost:8080/api/orders/admin${params ? `?${params}` : ""}`);
    if (!res.ok) throw new Error(`Admin orders fetch failed: ${res.status}`);
    const json = await res.json();
    return this._unwrap(json);
  },

  async receipt(publicOrderId) {
    // not used by ThankYou.jsx since we just open a tab,
    // but left here for completeness if you later want to fetch & render inside the app
    const url = `http://localhost:8080/api/orders/public/${encodeURIComponent(publicOrderId)}/receipt`;
    const res = await fetch(url, { headers: { Accept: "text/html" } });
    if (!res.ok) throw new Error(`Receipt fetch failed: ${res.status}`);
    return await res.text();
  },

  async adminGet(id) {
    const res = await fetch(`http://localhost:8080/api/orders/admin/${id}`);
    if (!res.ok) throw new Error(`Admin order get failed: ${res.status}`);
    const json = await res.json();
    return this._unwrap(json);
  },
};
