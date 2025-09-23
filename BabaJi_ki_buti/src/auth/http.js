// src/api/http.js
import axios from "axios";

/** ------------------ persistence helpers ------------------ */
const LS_KEY = "accessToken";
const SS_KEY = "accessToken";
let ACCESS_TOKEN = null;
let STORAGE = null; // "local" | "session" | null

/** ------------------ axios instance ------------------ */
export const api = axios.create({
  baseURL: "/api",           // <-- use the Vite proxy
  withCredentials: true,     // keep if refresh token is in HttpOnly cookie
});

/** Restore on startup (and prime the default header for immediate use) */
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

export function clearAccessToken() {
  ACCESS_TOKEN = null;
  STORAGE = null;
  localStorage.removeItem(LS_KEY);
  sessionStorage.removeItem(SS_KEY);
  delete api.defaults.headers.common.Authorization;
}

export const getAccessToken = () => ACCESS_TOKEN;

/** Attach Authorization where needed */
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

/** Single-flight 401 refresh */
let isRefreshing = false;
let queue = [];
const flushQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
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
      const { data } = await api.post("/auth/refresh");
      const newToken = data?.accessToken;
      if (!newToken) throw new Error("No access token from /auth/refresh");

      setAccessToken(newToken, STORAGE === "local");
      flushQueue(null, newToken);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshErr) {
      flushQueue(refreshErr, null);
      clearAccessToken();
      throw refreshErr;
    } finally {
      isRefreshing = false;
    }
  }
);
