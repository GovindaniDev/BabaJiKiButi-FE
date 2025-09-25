// src/auth/http.js
import axios from "axios";

/** ------------------ keys & in-memory cache ------------------ */
const LS_KEY = "accessToken";
const SS_KEY = "accessToken";
let ACCESS_TOKEN = null;

// ✅ NEW: store refresh token too
const REFRESH_LS_KEY = "refreshToken";
const REFRESH_SS_KEY = "refreshToken";
let REFRESH_TOKEN = null;

let STORAGE = null; // "local" | "session" | null

/** ------------------ axios instance ------------------ */
export const api = axios.create({
  baseURL: "/auth",             // Vite proxy (use rewrite in vite if backend has no /api)
  withCredentials: true,       // keep true; harmless for body-based refresh
});

/** ------------------ restore tokens on startup ------------------ */
// access token
const savedLocal = typeof window !== "undefined" && localStorage.getItem(LS_KEY);
const savedSession = typeof window !== "undefined" && sessionStorage.getItem(SS_KEY);
if (savedLocal) {
  ACCESS_TOKEN = savedLocal;
  STORAGE = "local";
  api.defaults.headers.common.Authorization = `Bearer ${ACCESS_TOKEN}`;
} else if (savedSession) {
  ACCESS_TOKEN = savedSession;
  STORAGE = "session";
  api.defaults.headers.common.Authorization = `Bearer ${ACCESS_TOKEN}`;
}

// ✅ NEW: restore refresh token
const savedRefreshLocal =
  typeof window !== "undefined" && localStorage.getItem(REFRESH_LS_KEY);
const savedRefreshSession =
  typeof window !== "undefined" && sessionStorage.getItem(REFRESH_SS_KEY);
if (savedRefreshLocal) {
  REFRESH_TOKEN = savedRefreshLocal;
} else if (savedRefreshSession) {
  REFRESH_TOKEN = savedRefreshSession;
}

/** ------------------ setters/getters ------------------ */
export function setAccessToken(token, remember = false) {
  ACCESS_TOKEN = token;
  STORAGE = remember ? "local" : "session";
  if (remember) {
    localStorage.setItem(LS_KEY, token);
    sessionStorage.removeItem(SS_KEY);
  } else {
    sessionStorage.setItem(SS_KEY, token);
    localStorage.removeItem(LS_KEY);
  }
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

// ✅ NEW: refresh token helpers
export function setRefreshToken(token, remember = false) {
  REFRESH_TOKEN = token;
  if (remember) {
    localStorage.setItem(REFRESH_LS_KEY, token);
    sessionStorage.removeItem(REFRESH_SS_KEY);
  } else {
    sessionStorage.setItem(REFRESH_SS_KEY, token);
    localStorage.removeItem(REFRESH_LS_KEY);
  }
}
export function clearRefreshToken() {
  REFRESH_TOKEN = null;
  localStorage.removeItem(REFRESH_LS_KEY);
  sessionStorage.removeItem(REFRESH_SS_KEY);
}
export const getRefreshToken = () => REFRESH_TOKEN;

export function clearAccessToken() {
  ACCESS_TOKEN = null;
  STORAGE = null;
  localStorage.removeItem(LS_KEY);
  sessionStorage.removeItem(SS_KEY);
  delete api.defaults.headers.common.Authorization;
}

export const getAccessToken = () => ACCESS_TOKEN;

/** ------------------ request interceptor ------------------ */
api.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAuthCall =
    url.includes("/auth/login") ||
    url.includes("/auth/register") ||
    url.includes("/auth/refresh");

  if (!isAuthCall && ACCESS_TOKEN) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  return config;
});

/** ------------------ single-flight refresh ------------------ */
let isRefreshing = false;
let queue = [];
const flushQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config || {};
    const status = err.response?.status;
    const isRefreshCall = (original.url || "").includes("/auth/refresh");

    if (status !== 401 || original._retry || isRefreshCall) {
      throw err;
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            if (token) {
              original.headers = original.headers || {};
              original.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      // ✅ CHANGED: send refresh token in BODY (your backend expects @RequestBody)
      const rt = getRefreshToken?.();
      if (!rt) throw new Error("No stored refresh token for /auth/refresh");

      const { data } = await api.post("/auth/refresh", { refreshToken: rt });

      const newAccess = data?.accessToken;
      if (!newAccess) throw new Error("No access token from /auth/refresh");

      // persist new access
      setAccessToken(newAccess, STORAGE === "local");

      // ✅ OPTIONAL: rotate refresh token if backend returns a new one
      if (data?.refreshToken) setRefreshToken(data.refreshToken, STORAGE === "local");

      flushQueue(null, newAccess);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      flushQueue(e, null);
      clearAccessToken();
      clearRefreshToken(); // ✅ also clear stored refresh if refresh fails
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);
