// src/pages/subscription/SubscribeButton.jsx
import { useCallback, useRef, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { subscriptionApi } from "../../auth/subscription/subscriptionApi";

export default function SubscribeButton({
  userId,
  planId,
  planPrice,       // number | string
  disabled = false,
  className = "",
  onAfterSuccess,  // optional: (paymentSessionId) => void
  children,
}) {
  const cashfreeRef = useRef(null);
  const [busy, setBusy] = useState(false);

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

  const start = useCallback(async () => {
    if (disabled || busy) return;

    // ---------- VALIDATIONS ----------
    if (!userId) { alert("Please sign in first."); return; }
    if (!planId) { alert("Plan not available. Please refresh and try again."); return; }
    const priceNum = Number(planPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      alert("Invalid plan price. Please contact support.");
      return;
    }
    // ---------------------------------

    setBusy(true);
    try {
      const cf = await init();

      // Must be allow-listed in Cashfree dashboard
      const returnUrl = `${window.location.origin}/subscribe?sub=cf&status=return`;

      // 1) Ask backend to create payment session
      const s = await subscriptionApi.createCheckoutSession({
        userId,
        planId,
        returnUrl,
      });
      if (!s.ok) throw new Error(s.error || "Unable to start payment session.");

      const paymentSessionId =
        s.data?.paymentSessionId ||
        s.data?.payment_session_id ||
        s.data?.payment_sessionid;

      if (!paymentSessionId) {
        throw new Error("Payment session not returned by server.");
      }

      // Optional callback (fires BEFORE redirect; useful for analytics)
      if (typeof onAfterSuccess === "function") {
        try { onAfterSuccess(paymentSessionId); } catch {}
      }

      // 2) Launch Cashfree checkout (redirect flow)
      await cf.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });

      // After redirect-back, useCashfreeReturnVerifier() runs.
    } catch (e) {
      console.error(e);
      alert(e?.message || "Unable to open payment. Please try again.");
    } finally {
      setBusy(false);
    }
  }, [disabled, busy, init, userId, planId, planPrice, onAfterSuccess]);

  return (
    <button
      type="button"
      disabled={disabled || busy}
      onClick={start}
      className={`${className} inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition
      ${disabled || busy ? "opacity-60 cursor-not-allowed" : "bg-[#2b1b16] text-[#faeade] hover:bg-[#3b2720]"}`}
      aria-busy={busy ? "true" : "false"}
    >
      {busy ? "Starting…" : (children ?? "Start Membership")}
    </button>
  );
}
