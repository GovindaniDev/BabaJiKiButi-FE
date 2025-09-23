import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

import { api, clearAccessToken, getAccessToken, setAccessToken } from "./http";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, email, roles, ... }
  const [loading, setLoading] = useState(true);

  // Try to get user info; if unauthorized, try refresh once.
  const fetchMe = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data);
    return data;
  };

  useEffect(() => {
    (async () => {
      try {
        await fetchMe();
      } catch (err) {
        if (err?.response?.status === 401) {
          try {
            // Cookie-based refresh OR token refresh via interceptor
            await api.post("/auth/refresh"); 
            await fetchMe();
          } catch {
            // As a last resort, if you still have an access token locally, set headers & try /me once.
            const token = getAccessToken?.();
            if (token) {
              try { await fetchMe(); } catch { setUser(null); }
            } else {
              setUser(null);
            }
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

 // AuthContext.jsx
const login = async (email, password, remember) => {
  try {
    const { data } = await api.post("/auth/login", { email, password });
    if (data?.accessToken) setAccessToken(data.accessToken, remember);
    if (data?.user) setUser(data.user);
    else if (data?.accessToken) {
     const payload = jwtDecode(data.accessToken);

      setUser({ id: payload.sub, email: payload.email, roles: payload.roles || [] });
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


  const logout = async () => {
    try { await api.post("/auth/logout", {}, { withCredentials: true }); } catch {}
    clearAccessToken();
    setUser(null);
  };

  const value = { user, isAuthenticated: !!user, login, logout, loading };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
