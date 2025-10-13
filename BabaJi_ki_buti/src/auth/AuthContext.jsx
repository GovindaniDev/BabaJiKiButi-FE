import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  api,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearRefreshToken,
} from "./http";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

/* ------------------------------ helpers ------------------------------ */
const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

const normalizeRoles = (claims) => {
  const buckets = [
    claims?.roles,
    claims?.role,
    claims?.authorities,
    claims?.permissions,
    claims?.scopes,
    claims?.scope,
    claims?.["cognito:groups"],
    claims?.realm_access?.roles,
    claims?.resource_access?.account?.roles,
  ];

  let raw = buckets
    .flatMap((b) => {
      if (!b) return [];
      if (typeof b === "string") return b.split(/[,\s]+/);
      return toArray(b);
    })
    .filter(Boolean)
    .map(String);

  const norm = raw.map((r) => r.trim().toLowerCase().replace(/^role[_: -]?/i, ""));
  return Array.from(new Set(norm));
};

const resolveUserFromJWT = (access) => {
  if (!access) return null;
  try {
    const p = jwtDecode(access);
    const roles = normalizeRoles(p);
    return {
      id: p.sub,
      email: p.email,
      name: p.name || p.username || null,
      roles,
      exp: p.exp,
      iat: p.iat,
      jti: p.jti,
    };
  } catch {
    return null;
  }
};

/** Always write appSession to localStorage */
const writeAppSession = (sessionId) => {
  if (!sessionId || typeof window === "undefined") return;
  localStorage.setItem(
    "appSession",
    JSON.stringify({
      sessionId,
      startedAtUtc: new Date().toISOString(),
      startedAtLocal: new Date().toString(),
      storage: "local", // fixed to local
    })
  );
  window.dispatchEvent(new Event("appSession:updated"));
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Boot: if no AT but have RT, refresh; token storage still honors remember,
  // but appSession is ALWAYS stored in localStorage.
  useEffect(() => {
    (async () => {
      try {
        const access = getAccessToken?.();
        if (!access) {
          const rt = getRefreshToken?.();
          if (!rt) {
            setUser(null);
            return;
          }
          try {
            const hadLocalRT =
              typeof window !== "undefined" && !!localStorage.getItem("refreshToken");
            const rememberNow = hadLocalRT;

            const res = await api.post("/refresh", { refreshToken: rt });
            const payload = res?.data?.data ?? res?.data;

            if (payload?.accessToken) setAccessToken(payload.accessToken, rememberNow);
            if (payload?.refreshToken) setRefreshToken(payload.refreshToken, rememberNow);

            if (payload?.sessionId) {
              writeAppSession(payload.sessionId); // <-- always localStorage
            }
          } catch {
            setUser(null);
            return;
          }
        }
        const accessNow = getAccessToken?.();
        const u = resolveUserFromJWT(accessNow);
        setUser(u);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ------------------------------ API helpers ------------------------------ */
  const login = async (email, password, remember) => {
    try {
      const res = await api.post("/login", { email, password });
      const payload = res?.data?.data ?? res?.data;

      if (payload?.accessToken) setAccessToken(payload.accessToken, remember);
      if (payload?.refreshToken) setRefreshToken(payload.refreshToken, remember);

      if (payload?.sessionId) {
        writeAppSession(payload.sessionId); // <-- always localStorage
      }

      const u = resolveUserFromJWT(payload?.accessToken);
      setUser(u);
      return { ok: true, user: u };
    } catch (err) {
      const status = err?.response?.status ?? 0;
      const data = err?.response?.data;

      const serverMsg =
        (typeof data?.error?.message === "string" && data.error.message.trim()) ||
        (typeof data?.data?.message === "string" && data.data.message.trim()) ||
        (typeof data?.message === "string" && data.message.trim()) ||
        (typeof data?.error === "string" && data.error.trim()) ||
        (typeof data === "string" && data.trim()) ||
        "";

      if ([400, 401, 403, 404, 422, 423, 429].includes(status)) {
        return {
          ok: false,
          status,
          message:
            serverMsg ||
            (status === 401
              ? "Invalid email or password."
              : status === 403
              ? "You don't have access to this account."
              : status === 404
              ? "Account not found."
              : status === 423
              ? "Your account is locked. Please contact support."
              : status === 429
              ? "Too many attempts. Please wait a moment and try again."
              : status === 422
              ? "Some fields are invalid. Please fix and try again."
              : "Please check your credentials and try again."),
          fieldErrors: status === 422 && data?.errors ? data.errors : null,
        };
      }

      return {
        ok: false,
        status,
        message: serverMsg || "We couldn’t sign you in. Please try again.",
      };
    }
  };

  const signup = async ({ name, email, password }) => {
    try {
      const res = await api.post("/signup", { name, email, password });
      const payload = res?.data?.data ?? res?.data;
      return { ok: true, data: payload };
    } catch (err) {
      const status = err?.response?.status ?? 0;
      const data = err?.response?.data;

      const serverMsg =
        (typeof data?.data?.message === "string" && data.data.message.trim()) ||
        (typeof data?.message === "string" && data.message.trim()) ||
        (typeof data?.error === "string" && data.error.trim()) ||
        (typeof data === "string" && data.trim()) ||
        "";

      if ([400, 401, 403, 404, 409, 422, 429].includes(status)) {
        return {
          ok: false,
          status,
          message:
            serverMsg ||
            (status === 409
              ? "An account with this email already exists."
              : status === 404
              ? "Signup endpoint not found. Check your API path or proxy."
              : status === 429
              ? "Too many attempts. Please try again later."
              : status === 401 || status === 403
              ? "You’re not authorized to do that."
              : status === 422
              ? "Some fields are invalid. Please fix and try again."
              : "Please check the details and try again."),
          fieldErrors: (data && data.errors) || null,
        };
      }

      return {
        ok: false,
        status,
        message: serverMsg || "Unable to sign up. Please try again.",
      };
    }
  };

  const logout = async () => {
    try {
      const rt = getRefreshToken?.();
      if (rt) {
        await api.post("/logout", { refreshToken: rt });
      } else {
        await api.post("/logout", {});
      }
    } catch {
      // ignore
    }
    clearAccessToken();
    clearRefreshToken();
    localStorage.removeItem("appSession");     // <-- session only in localStorage
    sessionStorage.removeItem("appSession");   // harmless extra cleanup
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("appSession:updated"));
    }
    setUser(null);
  };

  const listSessions = async () => {
    const res = await api.get("/sessions");
    return res.data?.data ?? res.data;
  };

  const revokeSession = async (sessionId) => {
    await api.post("/logout", { sessionId });
    return true;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin: !!user?.roles?.includes("admin"),
    login,
    signup,
    setUser,
    logout,
    listSessions,
    revokeSession,
    loading,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
