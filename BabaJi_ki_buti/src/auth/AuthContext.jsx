import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import {
  api,
  app, // used to fetch /api/users/me
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
      storage: "local",
    })
  );
  window.dispatchEvent(new Event("appSession:updated"));
};

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // we will keep backend's UserDto here
  const [loading, setLoading] = useState(true);

  // Boot: if no AT but have RT, refresh; then try to fetch /users/me
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
            const res = await api.post("/refresh", { refreshToken: rt });
            const payload = res?.data?.data ?? res?.data;
            if (payload?.accessToken) setAccessToken(payload.accessToken, true);
            if (payload?.refreshToken) setRefreshToken(payload.refreshToken, true);
            if (payload?.sessionId) writeAppSession(payload.sessionId);
          } catch {
            setUser(null);
            return;
          }
        }

        // Try to fetch authoritative profile
        try {
          const meRes = await app.get("/users/me");
          const me = meRes?.data?.data ?? meRes?.data;
          setUser(me || null);
        } catch {
          // Fallback to claims if /me fails (optional)
          const accessNow = getAccessToken?.();
          const u = resolveUserFromJWT(accessNow);
          setUser(u);
        }
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
      if (payload?.sessionId) writeAppSession(payload.sessionId);

      // Fetch authoritative profile to get real name/email/phone/role/status
      let me = null;
      try {
        const meRes = await app.get("/users/me");
        me = meRes?.data?.data ?? meRes?.data;
      } catch {
        // As a last resort, decode (not used for role guarding ideally)
        me = resolveUserFromJWT(payload?.accessToken) || null;
      }

      setUser(me);
      return { ok: true, user: me };
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

  const signup = async ({ name, email, phone, password }) => {
    try {
      const res = await api.post("/signup", { name, email, phone, password });
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
    localStorage.removeItem("appSession");
    sessionStorage.removeItem("appSession");
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
    // 🔑 backend returns enum: "ADMIN" | "USER"
    isAdmin: (user?.role || "").toUpperCase() === "ADMIN",
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
  