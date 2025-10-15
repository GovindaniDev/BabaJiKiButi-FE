// src/auth/user/useMe.js
import { useEffect, useState } from "react";
import { userApi } from "./userApi";
import { useAuth } from "../AuthContext";

export function useMe({ skip = false } = {}) {
  const { isAuthenticated } = useAuth();
  const [data, setData]     = useState(null);
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(!skip);

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

  return { me: data, loading, error, refetch: async () => {
    setLoading(true);
    try { const me = await userApi.getMe(); setData(me); setError(null); }
    catch(e){ setError(e); }
    finally{ setLoading(false); }
  }};
}
