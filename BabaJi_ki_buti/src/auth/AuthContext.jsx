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
    const { data } = await api.get("/auth/me");
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
      if (data?.accessToken) setAccessToken(data.accessToken, remember);
      if (data?.refreshToken) setRefreshToken(data.refreshToken, remember);

      if (data?.user) {
        setUser(data.user);
      } else if (data?.accessToken) {
        const payload = jwtDecode(data.accessToken);
        setUser({
          id: payload.sub,
          email: payload.email,
          roles: payload.roles || [],
        });
      } else {
        try { await fetchMe(); } catch {}
      }
      return { ok: true };
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email or password";
      return { ok: false, message };
    }
  };

  // Call this from your SignUpForm; on res.ok redirect to /login
  const signup = async ({ name, email, password }) => {
    try {
      // If your backend expects `name` instead of `fullName`, change the key below.
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
