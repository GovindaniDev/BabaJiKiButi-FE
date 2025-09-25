// src/auth/AuthContext.jsx
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

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, email, name, roles, exp, iat, jti }
  const [loading, setLoading] = useState(true);

  const resolveUserFromJWT = (access) => {
    if (!access) return null;
    try {
      const p = jwtDecode(access);
      return {
        id: p.sub,
        email: p.email,
        name: p.name || p.username || null,
        roles: p.roles || [],
        exp: p.exp,
        iat: p.iat,
        jti: p.jti,
      };
    } catch {
      return null;
    }
  };

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
            // unwrap envelope: { data: {...}, timestamp, error }
            const res = await api.post("/refresh", { refreshToken: rt });
            const payload = res?.data?.data ?? res?.data;

            if (payload?.accessToken) setAccessToken(payload.accessToken, true);
            if (payload?.refreshToken) setRefreshToken(payload.refreshToken, true);

            // ✅ store "appSession" in localStorage (not sessionStorage)
            if (payload?.sessionId) {
              localStorage.setItem(
                "appSession",
                JSON.stringify({
                  sessionId: payload.sessionId,
                  startedAtUtc: new Date().toISOString(),
                  startedAtLocal: new Date().toString(),
                  storage: "local",
                })
              );
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("appSession:updated"));
              }
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

  const login = async (email, password, remember) => {
    try {
      const res = await api.post("/login", { email, password });
      const payload = res?.data?.data ?? res?.data; // unwrap envelope

      // store tokens
      if (payload?.accessToken) setAccessToken(payload.accessToken, remember);
      if (payload?.refreshToken) setRefreshToken(payload.refreshToken, remember);

      // ✅ always store client-visible session in localStorage
      if (payload?.sessionId) {
        localStorage.setItem(
          "appSession",
          JSON.stringify({
            sessionId: payload.sessionId,
            startedAtUtc: new Date().toISOString(),
            startedAtLocal: new Date().toString(),
            storage: "local", // this blob lives in localStorage
          })
        );
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("appSession:updated"));
        }
      }

      // resolve user from JWT
      const u = resolveUserFromJWT(payload?.accessToken);
      setUser(u);

      return { ok: true, user: u };
    } catch (err) {
      const message =
        err?.response?.data?.message || err?.message || "Invalid email or password";
      return { ok: false, message };
    }
  };

  const signup = async ({ name, email, password }) => {
    try {
      await api.post("/signup", { name, email, password });
      return { ok: true };
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || "Unable to sign up";
      return { ok: false, message };
    }
  };

  const logout = async () => {
    try {
      const rt = getRefreshToken?.();
      if (rt) {
        await api.post("/logout", { refreshToken: rt });
      } else {
        await api.post("/logout", {}); // backend accepts empty body too
      }
    } catch {
      // ignore
    }
    clearAccessToken();
    clearRefreshToken();

    // ✅ remove from localStorage (not sessionStorage)
    localStorage.removeItem("appSession");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("appSession:updated"));
    }
    setUser(null);
  };

  /** ---------- sessions API (list & revoke) ---------- */
  const listSessions = async () => {
    const res = await api.get("/sessions"); // returns SessionDto[] (top-level array)
    return res.data?.data ?? res.data; // support envelope or plain
  };

  const revokeSession = async (sessionId) => {
    await api.post("/logout", { sessionId });
    return true;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    listSessions,
    revokeSession,
    loading,
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
