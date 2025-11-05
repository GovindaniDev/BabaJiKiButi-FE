import { useCallback, useRef, useState } from "react";
import { load } from "@cashfreepayments/cashfree-js";
import { subscriptionApi } from "../../auth/subscription/subscriptionApi";
import { userErrorMessage, confirmMessage } from "../../utils/userMessages";

/**
 * SubscribeButton
 * - Creates a Cashfree Checkout session via your backend
 * - Redirects user to Cashfree
 * - Cashfree returns to:  {BACKEND}/api/subscriptions/payments/cashfree/return?order_id={order_id}
 *   where your backend activates and then 302 → /account?tab=membership
 *
 * Props:
 *  - userId (required)
 *  - planId (required)
 *  - planPrice (number/string, for quick FE validation)
 *  - onAfterSuccess?: (paymentSessionId) => void   // fires right before redirect
 *  - disabled?, className?, children?
 */
const API_BASE =
  (typeof window !== "undefined" && window.API_BASE_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE) ||
  ""; // "" = same-origin

function backendOrigin() {
  try {
    return API_BASE ? new URL(API_BASE).origin : window.location.origin;
  } catch {
    return window.location.origin;
  }
}

export default function SubscribeButton({
  userId,
  planId,
  planPrice,
  disabled = false,
  className = "",
  onAfterSuccess,
  children,
}) {
  const cfRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const MODE =
    (import.meta?.env?.VITE_CASHFREE_MODE || "sandbox").toLowerCase() === "production"
      ? "production"
      : "sandbox";

  const init = useCallback(async () => {
    if (!cfRef.current) {
      cfRef.current = await load({ mode: MODE });
    }
    return cfRef.current;
  }, [MODE]);

  const start = useCallback(async () => {
    if (disabled || busy) return;

    // ---------- VALIDATIONS ----------
    if (!userId) {
      alert("Please sign in to start your membership.");
      try { window.location.href = "/login?next=/subscribe"; } catch {}
      return;
    }
    if (!planId) {
      alert("The membership plan is currently unavailable. Please refresh and try again.");
      return;
    }
    const priceNum = Number(planPrice);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      alert("This plan price seems invalid. Please contact support.");
      return;
    }
    // ---------------------------------

    setBusy(true);
    try {
      const cf = await init();

      // ✅ Build return URL on the BACKEND origin and include Cashfree placeholder
      const serverReturnUrl = `${backendOrigin()}/api/subscriptions/payments/cashfree/return?order_id={order_id}`;

      // 1) Ask backend to create PENDING subscription + Cashfree order
      let s = await subscriptionApi.createCheckoutSession({
        userId,
        planId,
        returnUrl: serverReturnUrl,
      });

      if (!s.ok) {
        // Auth
        if (s.status === 401) {
          alert("Please sign in again to continue.");
          try { window.location.href = "/login?next=/subscribe"; } catch {}
          return;
        }
        // Duplicate/pending → allow abort + retry
        if (s.status === 409 || /already.*in progress|pending/i.test(s.error || "")) {
          const doAbort = window.confirm(
            confirmMessage("abort-pending", { server: s.userMessage || s.error })
          );
          if (!doAbort) return;

          const a = await subscriptionApi.abortPending(userId);
          if (!a.ok) {
            alert(userErrorMessage(a));
            return;
          }

          // retry once
          s = await subscriptionApi.createCheckoutSession({
            userId,
            planId,
            returnUrl: serverReturnUrl,
          });
          if (!s.ok) {
            alert(userErrorMessage(s));
            return;
          }
        } else {
          alert(userErrorMessage(s));
          return;
        }
      }

      const paymentSessionId =
        s.data?.paymentSessionId ||
        s.data?.payment_session_id ||
        s.data?.payment_sessionid;

      if (!paymentSessionId) {
        console.error("Unexpected checkout payload:", s);
        throw new Error("We couldn’t start the payment. Please try again.");
      }

      // Optional analytics hook
      if (typeof onAfterSuccess === "function") {
        try { onAfterSuccess(paymentSessionId); } catch {}
      }

      // 2) Launch Cashfree checkout (redirect flow)
      await cf.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });

      // Flow:
      // Cashfree -> BACKEND /return (activates) -> 302 /account?tab=membership&sub=cf&status=return
    } catch (e) {
      console.error(e);
      alert(userErrorMessage(e));
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
