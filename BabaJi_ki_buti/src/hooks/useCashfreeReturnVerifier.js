// src/hooks/useCashfreeReturnVerifier.js
import { useEffect } from "react";
import { subscriptionApi } from "../auth/subscription/subscriptionApi";

/**
 * Cashfree return verifier (no orderId required).
 * Recognizes: ?sub=cf&status=return[&paymentSessionId=...|payment_session_id=...|sessionId=...]
 */
export function useCashfreeReturnVerifier(userId, refresh) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const cameFromCf =
      params.get("sub") === "cf" && params.get("status") === "return";

    // Early exit; don't touch anything unless this is Cashfree return
    if (!cameFromCf) return;

    // Optional; backend should be able to resolve latest pending by userId
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
