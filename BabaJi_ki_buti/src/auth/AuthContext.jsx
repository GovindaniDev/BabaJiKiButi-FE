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
            const res = await api.post("/refresh", { refreshToken: rt });
            const payload = res?.data?.data ?? res?.data;

            if (payload?.accessToken) setAccessToken(payload.accessToken, true);
            if (payload?.refreshToken) setRefreshToken(payload.refreshToken, true);

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

  const safeString = (v) =>
    typeof v === "string" ? v.trim() : "";

  const pickServerMessage = (err) => {
    const status = err?.response?.status ?? 0;
    // Axios usually parses JSON; if not, we’ll check responseText below.
    const data = err?.response?.data;

    const fieldErrors =
      safeString(err?.response?.data?.errors?.password) ||
      safeString(err?.response?.data?.errors?.email) ||
      "";

    // Primary paths (nested ApiResponse → flat → "error" → field errors → raw string)
    let msg =
      safeString(data?.data?.message) ||
      safeString(data?.message) ||
      safeString(data?.error) ||
      fieldErrors ||
      safeString(data);

    // Fallback: sometimes dev proxies keep body in request.responseText
    if (!msg) {
      const rt = err?.response?.request?.responseText;
      if (rt && typeof rt === "string") {
        try {
          const parsed = JSON.parse(rt);
          msg =
            safeString(parsed?.data?.message) ||
            safeString(parsed?.message) ||
            safeString(parsed?.error) ||
            safeString(rt);
        } catch {
          msg = safeString(rt);
        }
      }
    }

    // Final fallback so we never return an empty string
    if (!msg) msg = "An error occurred.";

    // Debug once (you can remove after verifying)
    // eslint-disable-next-line no-console
    console.debug("[auth.login] error debug:", { status, data, msg });

    return { status, msg, data };
  };

  const login = async (email, password, remember) => {
    try {
      const res = await api.post("/login", { email, password });
      const payload = res?.data?.data ?? res?.data;

      if (payload?.accessToken) setAccessToken(payload.accessToken, remember);
      if (payload?.refreshToken) setRefreshToken(payload.refreshToken, remember);

      if (payload?.sessionId) {
        localStorage.setItem(
          "appSession",
          JSON.stringify({
            sessionId: payload.sessionId,
            startedAtUtc: new Date().toISOString(),
            startedAtLocal: new Date().toString(),
            storage: remember ? "local" : "session",
          })
        );
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("appSession:updated"));
        }
      }

      const u = resolveUserFromJWT(payload?.accessToken);
      setUser(u);
      return { ok: true, user: u };
    } catch (err) {
      const { status, msg, data } = pickServerMessage(err);

      // Mirror the server message for each branch; only fallback when server message is truly absent
      if (status === 401) {
        return {
          ok: false,
          status,
          message: msg,
          fieldErrors: {
            email: /email/i.test(msg) ? msg : "",
            password: /password/i.test(msg) ? msg : "",
          },
          server: data ?? null,
        };
      }

      if (status === 423) {
        return { ok: false, status, message: msg, server: data ?? null };
      }

      if (status === 429) {
        return { ok: false, status, message: msg, server: data ?? null };
      }

      if (status === 404) {
        return { ok: false, status, message: msg, server: data ?? null };
      }

      if (status === 422) {
        return {
          ok: false,
          status,
          message: msg,
          fieldErrors: (data && data.errors) || null,
          server: data ?? null,
        };
      }

      if (status === 400 || status === 403) {
        return { ok: false, status, message: msg, server: data ?? null };
      }

      // Unknown/Network
      return {
        ok: false,
        status,
        message: msg || "Something went wrong on our side. Please try again.",
        server: data ?? null,
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

      // Always surface server message; fallback only if empty
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
