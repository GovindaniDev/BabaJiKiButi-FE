import { app } from "../http";

// Helper: your backend sometimes wraps with {data: ...}
const unbox = (res) => res?.data?.data ?? res?.data;

export const userApi = {
  /** Get current profile (requires Authorization header) */
  getMe: async () => {
    const res = await app.get("/users/me");
    return unbox(res); // -> { id, email, name, phone, role, status }
  },

  /** Update current profile (all fields optional) */
  updateMe: async (payload /* { email?, name?, phone? } */) => {
    const res = await app.put("/users/me", payload);
    return unbox(res);
  },

  /** Soft-/hard-delete self (careful!) */
  deleteMe: async (hard = false) => {
    const res = await app.delete("/users/me", { params: { hard } });
    return res.status === 204;
  },

  // ---------- Admin endpoints (need ROLE_ADMIN) ----------
  listAll: async () => {
    const res = await app.get("/users");
    return unbox(res); // -> UserDto[]
  },

  getById: async (userId) => {
    const res = await app.get(`/users/${userId}`);
    return unbox(res);
  },

  updateById: async (userId, payload) => {
    const res = await app.put(`/users/${userId}`, payload);
    return unbox(res);
  },

  deleteById: async (userId, hard = false) => {
    const res = await app.delete(`/users/${userId}`, { params: { hard } });
    return res.status === 204;
  },
};
