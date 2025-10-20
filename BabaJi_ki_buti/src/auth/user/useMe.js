// src/auth/user/useMe.js
import { useEffect, useState } from "react";
import { userApi } from "./userApi";
import { useAuth } from "../AuthContext";

export function useMe({ skip = false } = {}) {
  const auth = typeof useAuth === "function" ? useAuth() : null;
  const isAuthenticated = !!auth?.isAuthenticated;

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip && isAuthenticated);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (skip || !isAuthenticated) { setLoading(false); return; }
      try {
        const me = await userApi.getMe();
        if (alive) setData(me);
      } catch (e) {
        if (alive) setError(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [skip, isAuthenticated]);

  const refetch = async () => {
    if (!isAuthenticated) return null;
    setLoading(true);
    try {
      const me = await userApi.getMe();
      setData(me);
      return me;
    } catch (e) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { me: data, loading, error, refetch, isAuthenticated };
}
