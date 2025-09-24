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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    const { data } = await api.get("/me"); // should return { id, name, email, ... }
    setUser(data);
    return data;
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
            const { data } = await api.post("/refresh", { refreshToken: rt });
            if (data?.accessToken) setAccessToken(data.accessToken, true);
            if (data?.refreshToken) setRefreshToken(data.refreshToken, true); // rotate if provided
          } catch {
            setUser(null);
            return;
          }
        }
        await fetchMe();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password, remember) => {
    try {
      const { data } = await api.post("/login", { email, password });

      // 1) Store tokens
      if (data?.accessToken) setAccessToken(data.accessToken, remember);
      if (data?.refreshToken) setRefreshToken(data.refreshToken, remember);

      // 2) Resolve a concrete DB user object (with name)
      let u = null;
      if (data?.user) {
        // backend already returned DB user
        u = data.user;
        setUser(u);
      } else if (data?.accessToken) {
        // prefer DB over JWT so we always get name from DB
        try {
          u = await fetchMe(); // hits /auth/me
        } catch {
          // fallback to JWT fields if /auth/me fails
          const payload = jwtDecode(data.accessToken);
          u = {
            id: payload.sub,
            email: payload.email,
            roles: payload.roles || [],
            name: payload.name, // if your JWT includes it
          };
          setUser(u);
        }
      } else {
        // rare fallback
        u = await fetchMe().catch(() => null);
      }

      return { ok: true, user: u };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email or password";
      return { ok: false, message };
    }
  };

  const signup = async ({ name, email, password }) => {
    try {
      await api.post("/signup", { name, email, password });
      return { ok: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to sign up";
      return { ok: false, message };
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
    } catch {}
    clearAccessToken();
    clearRefreshToken();
    setUser(null);
  };

  const value = { user, isAuthenticated: !!user, login, signup, logout, loading };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
