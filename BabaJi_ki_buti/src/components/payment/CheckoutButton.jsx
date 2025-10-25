import { useCallback, useRef, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";

/**
 * Props:
 * - userId (number | string)
 * - addressId (number | string | null)
 * - shipping (number)
 * - discount (number)
 * - disabled (boolean)
 * - className (string)
 */
export default function CheckoutButton({
  userId,
  addressId,
  shipping = 0,
  discount = 0,
  disabled = false,
  className = "",
}) {
  const cashfreeRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // Resolve API base (same-origin by default)
  const API_BASE =
    (typeof window !== "undefined" && window.API_BASE_URL) ||
    import.meta?.env?.VITE_API_BASE ||
    "";

  const toUrl = (path) =>
    API_BASE
      ? API_BASE.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`)
      : path;

  const MODE =
    (import.meta?.env?.VITE_CASHFREE_MODE || "sandbox").toLowerCase() === "production"
      ? "production"
      : "sandbox";

  const init = useCallback(async () => {
    if (!cashfreeRef.current) {
      cashfreeRef.current = await load({ mode: MODE });
    }
    return cashfreeRef.current;
  }, [MODE]);

  const payNow = useCallback(async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      const cf = await init();

      // ✅ Ensure addressId is numeric and not null
      let addr = addressId;
      if (addr === undefined || addr === null || addr === "") {
        addr = 0; // fallback numeric sentinel
      } else if (typeof addr === "string") {
        const n = Number(addr);
        addr = Number.isFinite(n) ? n : 0;
      }

      const resp = await fetch(toUrl("/api/checkout"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          addressId: addr, // ✅ numeric value, never null
          shipping,
          discount,
        }),
      });

      if (!resp.ok) throw new Error(`Checkout API failed with ${resp.status}`);
      const json = await resp.json();
      const sessionId =
        json?.data?.paymentSessionId ||
        json?.paymentSessionId ||
        json?.data?.payment_session_id;

      if (!sessionId) throw new Error("No paymentSessionId returned");

      await cf.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });
    } catch (e) {
      console.error(e);
      alert("Unable to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [init, userId, addressId, shipping, discount, disabled, loading]);

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={payNow}
      className={`${className} inline-flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white bg-orange-700 hover:bg-orange-800 disabled:opacity-60 transition`}
    >
      {loading ? "Starting…" : "Pay Now"}
    </button>
  );
}
