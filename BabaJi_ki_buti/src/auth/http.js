import axios from "axios";

/** ------------------ keys & in-memory cache ------------------ */
const LS_KEY = "accessToken";
const SS_KEY = "accessToken";
let ACCESS_TOKEN = null;

// refresh token keys
const REFRESH_LS_KEY = "refreshToken";
const REFRESH_SS_KEY = "refreshToken";
let REFRESH_TOKEN = null;

// where the access token is persisted ("local" | "session" | null)
let STORAGE = null;

/** ------------------ axios instance ------------------ */
/**
 * IMPORTANT:
 * - baseURL is "/auth" so calls should be "/login", "/signup", "/refresh", "/logout", "/sessions" etc.
 * - Vite proxy maps "/auth" -> backend host in vite.config.ts
 */
export const api = axios.create({
  baseURL: "/auth",
  withCredentials: true,
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

// refresh token
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

export function clearAccessToken() {
  ACCESS_TOKEN = null;
  STORAGE = null;
  localStorage.removeItem(LS_KEY);
  sessionStorage.removeItem(SS_KEY);
  delete api.defaults.headers.common.Authorization;
}
export const getAccessToken = () => ACCESS_TOKEN;

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

/** ------------------ request interceptor ------------------ */
api.interceptors.request.use((config) => {
  const url = config.url || "";
  // These are relative to baseURL "/auth"
  const isAuthCall =
    url.includes("/login") || url.includes("/signup") || url.includes("/refresh");

  if (!isAuthCall && ACCESS_TOKEN) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${ACCESS_TOKEN}`;
  }

  // Optional: pass a friendlier UA for server deviceInfo
  if (typeof navigator !== "undefined") {
    config.headers["X-Client-UA"] = navigator.userAgent;
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
    const isRefreshCall = (original.url || "").includes("/refresh");

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
      const rt = getRefreshToken?.();
      if (!rt) throw new Error("No stored refresh token for /auth/refresh");

      const res = await api.post("/refresh", { refreshToken: rt });
      const payload = res?.data?.data ?? res?.data; // unwrap envelope or accept plain

      const newAccess = payload?.accessToken;
      if (!newAccess) throw new Error("No access token from /auth/refresh");

      // persist new access
      setAccessToken(newAccess, STORAGE === "local");

      // rotate refresh if provided
      if (payload?.refreshToken) setRefreshToken(payload.refreshToken, STORAGE === "local");

      // also refresh client session blob if backend returned sessionId again
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

      flushQueue(null, newAccess);

      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newAccess}`;
      return api(original);
    } catch (e) {
      flushQueue(e, null);
      clearAccessToken();
      clearRefreshToken();
      sessionStorage.removeItem("appSession");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("appSession:updated"));
      }
      throw e;
    } finally {
      isRefreshing = false;
    }
  }
);
