import { useEffect, useMemo, useState } from "react";
import { subscriptionApi } from "../auth/subscription/subscriptionApi";

/** Plan + user-subscription state with helpers */
export function useSubscription(userId) {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState(null);
  const [error, setError] = useState(null);

  async function refresh() {
    if (!userId) {
      setPlan(null);
      setActive(false);
      setCurrent(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [planRes, activeRes] = await Promise.all([
        subscriptionApi.getPlan(),
        subscriptionApi.isActive(userId),
      ]);
      if (planRes.ok) setPlan(planRes.data ?? null);
      const isAct = !!(activeRes.ok && activeRes.data);
      setActive(isAct);
      if (isAct) {
        const cur = await subscriptionApi.myCurrent(userId);
        if (cur.ok) setCurrent(cur.data ?? null);
      } else {
        setCurrent(null);
      }
    } catch (e) {
      setError(e?.message || "Failed to load subscription");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    if (typeof window !== "undefined") {
      window.addEventListener("subscription:changed", onChange);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("subscription:changed", onChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return useMemo(
    () => ({
      loading,
      plan,
      active,
      current,
      error,
      async subscribe(planId) {
        if (!userId) throw new Error("Sign in required before subscribing");
        const res = await subscriptionApi.subscribe(userId, planId);
        if (!res.ok) throw new Error(res.error || "Subscribe failed");
        try {
          setActive(true);
          setCurrent(res.data ?? null);
          typeof window !== "undefined" &&
            window.dispatchEvent(new Event("subscription:changed"));
        } catch {}
        return res.data;
      },
      async cancel(reason) {
        if (!userId) throw new Error("Sign in required before cancelling");
        const res = await subscriptionApi.cancel(userId, reason);
        if (!res.ok) throw new Error(res.error || "Cancel failed");
        setActive(false);
        setCurrent(res.data ?? null);
        typeof window !== "undefined" &&
          window.dispatchEvent(new Event("subscription:changed"));
        return res.data;
      },
      refresh,
    }),
    [loading, plan, active, current, error, userId]
  );
}

/**
 * Cashfree return verifier (no orderId required).
 * Accepts optional paymentSessionId from URL if present; otherwise backend
 * should resolve the latest pending Cashfree order for this user.
 *
 * Recognizes: ?sub=cf&status=return[&paymentSessionId=...|payment_session_id=...|sessionId=...]
 */
export function useCashfreeReturnVerifier(userId, refresh) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const cameFromCf =
      params.get("sub") === "cf" && params.get("status") === "return";

    // Early exit; don't touch session vars unless needed
    if (!cameFromCf) return;

    // Optional only; backend can resolve without it
    const paymentSessionId =
      params.get("paymentSessionId") ||
      params.get("payment_session_id") ||
      params.get("sessionId") ||
      null;

    (async () => {
      try {
        if (userId) {
          await subscriptionApi.verifyPayment({
            userId,
            paymentSessionId: paymentSessionId ?? undefined,
          });
        }
      } catch (e) {
        console.error("[verifyPayment] failed:", e);
      } finally {
        // Clean URL
        try {
          const url = new URL(window.location.href);
          ["sub", "status", "paymentSessionId", "payment_session_id", "sessionId"].forEach(
            (k) => url.searchParams.delete(k)
          );
          window.history.replaceState({}, "", url.toString());
        } catch {}
        try {
          await (typeof refresh === "function" ? refresh() : Promise.resolve());
        } catch {}
      }
    })();
  }, [userId, refresh]);
}
