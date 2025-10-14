// src/auth/http.js
import axios from "axios";

/** ------------------ keys & in-memory cache ------------------ */
const AT_LS = "accessToken";
const AT_SS = "accessToken";
let ACCESS_TOKEN = null;

const RT_LS = "refreshToken";
const RT_SS = "refreshToken";
let REFRESH_TOKEN = null;

// where access token is persisted ("local" | "session" | null)
let STORAGE = null;

/** ------------------ create instances ------------------ */
// Auth endpoints (login/signup/refresh/logout/sessions)
export const api = axios.create({
  baseURL: "/auth",
  withCredentials: true, // set true only if your backend expects cookies for auth endpoints
});

// App/business endpoints (products, orders, etc.)
export const app = axios.create({
  baseURL: "/api",
  withCredentials: true, // if you don't use cookies for /api, you can set this to false
});

/** ------------------ restore tokens on startup ------------------ */
const savedATLocal = typeof window !== "undefined" && localStorage.getItem(AT_LS);
const savedATSession = typeof window !== "undefined" && sessionStorage.getItem(AT_SS);
if (savedATLocal) {
  ACCESS_TOKEN = savedATLocal; STORAGE = "local";
} else if (savedATSession) {
  ACCESS_TOKEN = savedATSession; STORAGE = "session";
}

const savedRTLocal = typeof window !== "undefined" && localStorage.getItem(RT_LS);
const savedRTSession = typeof window !== "undefined" && sessionStorage.getItem(RT_SS);
if (savedRTLocal) REFRESH_TOKEN = savedRTLocal;
else if (savedRTSession) REFRESH_TOKEN = savedRTSession;

/** ------------------ token helpers ------------------ */
export function setAccessToken(token, remember = false) {
  ACCESS_TOKEN = token;
  STORAGE = remember ? "local" : "session";
  if (remember) {
    localStorage.setItem(AT_LS, token);
    sessionStorage.removeItem(AT_SS);
  } else {
    sessionStorage.setItem(AT_SS, token);
    localStorage.removeItem(AT_LS);
  }
}

export function clearAccessToken() {
  ACCESS_TOKEN = null;
  STORAGE = null;
  localStorage.removeItem(AT_LS);
  sessionStorage.removeItem(AT_SS);
}

export const getAccessToken = () => ACCESS_TOKEN;

export function setRefreshToken(token, remember = false) {
  REFRESH_TOKEN = token;
  if (remember) {
    localStorage.setItem(RT_LS, token);
    sessionStorage.removeItem(RT_SS);
  } else {
    sessionStorage.setItem(RT_SS, token);
    localStorage.removeItem(RT_LS);
  }
}

export function clearRefreshToken() {
  REFRESH_TOKEN = null;
  localStorage.removeItem(RT_LS);
  sessionStorage.removeItem(RT_SS);
}

export const getRefreshToken = () => REFRESH_TOKEN;

/** ------------------ shared interceptors ------------------ */
const isAuthUrl = (url = "") =>
  url.includes("/login") ||
  url.includes("/signup") ||
  url.includes("/refresh") ||
  url.includes("/logout");

// Request: add Authorization (skip only for auth calls)
const onRequest = (config) => {
  const url = config.url || "";
  if (!isAuthUrl(url) && ACCESS_TOKEN) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }
  if (typeof navigator !== "undefined") {
    config.headers["X-Client-UA"] = navigator.userAgent;
  }
  return config;
};

// Response: single-flight refresh on 401 for NON-auth calls
let isRefreshing = false;
let waitQueue = [];
const flushQueue = (error, token = null) => {
  waitQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  waitQueue = [];
};

const onResponseError = async (err) => {
  const original = err.config || {};
  const status = err?.response?.status;
  const url = original?.url || "";

  if (status !== 401 || isAuthUrl(url) || original._retry) {
    return Promise.reject(err);
  }

  original._retry = true;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      waitQueue.push({
        resolve: (token) => {
          if (token) {
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${token}`;
          }
          resolve((original.baseURL?.includes("/auth") ? api : app)(original));
        },
        reject,
      });
    });
  }

  isRefreshing = true;
  try {
    const rt = getRefreshToken?.();
    if (!rt) throw new Error("No stored refresh token for /auth/refresh");

    // refresh via the AUTH instance
    const res = await api.post("/refresh", { refreshToken: rt });
    const payload = res?.data?.data ?? res?.data;

    const newAT = payload?.accessToken;
    if (!newAT) throw new Error("No access token from /auth/refresh");

    setAccessToken(newAT, STORAGE === "local");
    if (payload?.refreshToken) setRefreshToken(payload.refreshToken, STORAGE === "local");

    // optional session metadata
    if (payload?.sessionId) {
      sessionStorage.setItem(
        "appSession",
        JSON.stringify({
          sessionId: payload.sessionId,
          startedAtUtc: new Date().toISOString(),
          startedAtLocal: new Date().toString(),
          storage: STORAGE || "session",
        })
      );
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("appSession:updated"));
      }
    }

    flushQueue(null, newAT);

    original.headers = original.headers || {};
    original.headers.Authorization = `Bearer ${newAT}`;

    // retry against the same instance (auth vs app) the request came from
    return (original.baseURL?.includes("/auth") ? api : app)(original);
  } catch (e) {
    flushQueue(e, null);
    clearAccessToken();
    clearRefreshToken();
    sessionStorage.removeItem("appSession");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("appSession:updated"));
    }
    return Promise.reject(e);
  } finally {
    isRefreshing = false;
  }
};

// Wire both instances
api.interceptors.request.use(onRequest);
app.interceptors.request.use(onRequest);
api.interceptors.response.use((r) => r, onResponseError);
app.interceptors.response.use((r) => r, onResponseError);
