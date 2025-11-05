// src/auth/order/orderApi.js
import { app } from "../http"; // adjust path if your structure differs

export const orderApi = {
  _unwrap(json) {
    try {
      return json && typeof json === "object" && "data" in json ? json.data : json;
    } catch {
      return json;
    }
  },

  async getMyPaged(page = 0, size = 10, sort = "createdAt,desc") {
    const res = await app.get(`/orders/my`, {
      params: { page, size, sort },
      withCredentials: true,
    });
    const data = res?.data?.data ?? res?.data; // Page<OrderDto> or ApiResponse<Page<OrderDto>>
    return data;
  },

  async getMyByPublicId(publicOrderId) {
    const res = await app.get(`/orders/my/by-public-id/${encodeURIComponent(publicOrderId)}`, {
      withCredentials: true,
    });
    const data = this._unwrap(res?.data);
    return { ok: true, status: 200, json: data, raw: res?.data };
  },

  async getPublicByPublicId(publicOrderId) {
    const res = await app.get(`/orders/public/by-public-id/${encodeURIComponent(publicOrderId)}`);
    return this._unwrap(res?.data);
  },

  async getSmartByPublicId(publicOrderId) {
    try {
      return await this.getPublicByPublicId(publicOrderId);
    } catch (e) {
      const second = await this.getMyByPublicId(publicOrderId);
      if (second.ok && second.json) return second.json;
      throw new Error(`Order fetch failed: ${second.status || e.message}`);
    }
  },

  async adminList(params = {}) {
    const res = await app.get(`/orders/admin`, {
      params,
      withCredentials: true,
    });
    return this._unwrap(res?.data);
  },

  async receipt(publicOrderId) {
    const res = await app.get(
      `/orders/public/${encodeURIComponent(publicOrderId)}/receipt`,
      { headers: { Accept: "text/html" } }
    );
    return res?.data;
  },

  async adminGet(id) {
    const res = await app.get(`/orders/admin/${id}`, { withCredentials: true });
    return this._unwrap(res?.data);
  },
};
