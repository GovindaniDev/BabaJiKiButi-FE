// src/auth/httpApp.js
import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAccessToken,
  clearRefreshToken,
} from "./http";

// This instance will hit your main backend (product, orders, etc.)
export const app = axios.create({
  baseURL: "/api", // proxy maps to backend baseUrl/api
  withCredentials: true,
});

/* ----------  REQUEST: attach access token  ---------- */
app.interceptors.request.use((config) => {
  const token = getAccessToken?.();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof navigator !== "undefined") {
    config.headers["X-Client-UA"] = navigator.userAgent;
  }
  return config;
});

/* ----------  RESPONSE: auto refresh if 401  ---------- */
let isRefreshing = false;
let queue = [];

const flushQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
};

app.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config || {};
    const status = err?.response?.status;

    // If not unauthorized or already retried, just fail
    if (status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    // mark as retried to avoid loop
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            if (token) {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${token}`;
            }
            resolve(app(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const rt = getRefreshToken?.();
      if (!rt) throw new Error("No refresh token available for /api");

      // Call your existing /auth refresh endpoint
      const refreshRes = await axios.post("/auth/refresh", { refreshToken: rt });
      const payload = refreshRes?.data?.data ?? refreshRes?.data;

      const newAccess = payload?.accessToken;
      if (!newAccess) throw new Error("No access token from refresh");

      // Persist new tokens
      setAccessToken(newAccess, true);
      if (payload?.refreshToken) setRefreshToken(payload.refreshToken, true);

      flushQueue(null, newAccess);

      // Retry the failed request with new token
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return app(original);
    } catch (e) {
      flushQueue(e, null);
      clearAccessToken();
      clearRefreshToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("appSession:updated"));
      }
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);
