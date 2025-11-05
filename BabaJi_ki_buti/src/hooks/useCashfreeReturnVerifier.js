import { useEffect } from "react";

/**
 * Cashfree return handler for SUBSCRIPTIONS.
 * Your backend handles activation at:
 *   GET /api/subscriptions/payments/cashfree/return?order_id=...
 * …and then redirects the browser to /subscribe.
 *
 * So on the FE, we only need to detect the "came from CF" markers,
 * clean the URL, and refresh caller state.
 */
export function useCashfreeReturnVerifier(refresh) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const cameFromCf =
      params.get("sub") === "cf" && params.get("status") === "return";

    if (!cameFromCf) return;

    (async () => {
      try {
        // no verify call needed; backend already did activation during redirect
      } finally {
        try {
          const url = new URL(window.location.href);
          ["sub", "status", "order_id"].forEach((k) => url.searchParams.delete(k));
          window.history.replaceState({}, "", url.toString());
        } catch {}
        try {
          await (typeof refresh === "function" ? refresh() : Promise.resolve());
        } catch {}
      }
    })();
  }, [refresh]);
}
