// ------------------------------
// File: src/page/profile/sections/LoyaltyPoints.jsx
// ------------------------------
import React, { useEffect, useState } from "react";
import SectionCard from "./SectionCard";
import { Gift, CalendarClock, ShoppingBag } from "lucide-react";
import { app } from "../../auth/http"; // keeps your axios instance and interceptors
import { useNavigate } from "react-router-dom";

/**
 * Backend:
 *   GET  /api/loyalty/summary?userId=
 *
 * UX notes:
 * - No direct redeem here. We only show a summary and lead users to shop.
 * - "Expiring soon" is pruned to reflect remaining balance only.
 *
 * SECURITY FIX: Do NOT trust localStorage for userId. Resolve from prop => /users/me.
 */

export default function LoyaltyPoints({ userId: userIdProp }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resolvedUserId, setResolvedUserId] = useState(null);
  const [resolvingUserId, setResolvingUserId] = useState(true);

  const [loyalty, setLoyalty] = useState({
    balance: 0,
    lifetimeEarned: 0,
    lifetimeRedeemed: 0,
    expiringSoon: [],
  });

  // --- Resolve userId (prop -> /users/me). DO NOT use localStorage.
  useEffect(() => {
    let alive = true;
    async function resolve() {
      if (userIdProp) {
        if (!alive) return;
        setResolvedUserId(Number(userIdProp));
        setResolvingUserId(false);
        return;
      }
      try {
        const meRes = await app.get(`/users/me`, { withCredentials: true });
        const me = meRes?.data?.data ?? meRes?.data;
        const uid =
          Number(me?.id) ||
          Number(me?.userId) ||
          (typeof me?.sub === "string" ? Number(me.sub) : null);
        if (!alive) return;
        setResolvedUserId(uid || null);
      } catch (e) {
        console.error("Unable to resolve user id via /users/me:", e);
        if (!alive) return;
        setResolvedUserId(null);
      } finally {
        if (alive) setResolvingUserId(false);
      }
    }
    resolve();
    return () => {
      alive = false;
    };
  }, [userIdProp]);

  // --- Fetch summary
  const fetchSummary = async (uid) => {
    const res = await app.get(`/loyalty/summary`, {
      params: { userId: uid },
      withCredentials: true,
    });
    const dto = res?.data?.data ?? res?.data;
    setLoyalty({
      balance: Number(dto?.balance ?? 0),
      lifetimeEarned: Number(dto?.lifetimeEarned ?? 0),
      lifetimeRedeemed: Number(dto?.lifetimeRedeemed ?? 0),
      expiringSoon: Array.isArray(dto?.expiringSoon) ? dto.expiringSoon : [],
    });
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (resolvingUserId) return;
      if (!resolvedUserId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        await fetchSummary(resolvedUserId);
      } catch (e) {
        console.error("Loyalty summary failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [resolvedUserId, resolvingUserId]);

  // --- UI helpers

  // Prune expiry rows to only reflect *remaining* points:
  // - ignore past expiries
  // - take buckets until cumulative >= current balance
  const prunedExpiries = (() => {
    const today = new Date().toISOString().slice(0, 10);
    const rows = (loyalty?.expiringSoon || [])
      .filter((r) => (r?.expiresOn || "") >= today) // not already expired
      .sort((a, b) => String(a.expiresOn).localeCompare(String(b.expiresOn)));

    const out = [];
    let remaining = Number(loyalty?.balance || 0);
    for (const r of rows) {
      if (remaining <= 0) break;
      const take = Math.min(Number(r.points || 0), remaining);
      if (take > 0) {
        out.push({ ...r, points: take });
        remaining -= take;
      }
    }
    return out;
  })();

  // Friendly “what is this worth?” message without exposing raw rules.
  const approxPercent = Math.max(
    0,
    Math.min(30, Math.floor(Number(loyalty?.balance || 0) / 50))
  );
  const headline =
    loyalty.balance > 0
      ? `You’ve earned ${loyalty.balance} pts — worth around ${approxPercent}% off on your next order!`
      : `Start earning points on every purchase and unlock instant discounts at checkout.`;

  const goShop = () => {
    navigate("/products");
  };

  return (
    <SectionCard
      title="Loyalty Points"
      icon={Gift}
      action={
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <CalendarClock className="h-4 w-4" /> Expiry alerts enabled
        </div>
      }
    >
      {!resolvedUserId && !resolvingUserId ? (
        <div className="text-sm text-gray-600">
          Please sign in to view your loyalty benefits.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left column: Feel-good summary + CTA */}
          <div className="space-y-4">
            <div className="rounded-2xl border p-4 bg-gradient-to-br from-amber-50 to-white">
              <div className="text-sm text-gray-600 mb-1">Current balance</div>
              <div className="text-4xl font-semibold tracking-tight">
                {loading ? "…" : `${loyalty.balance} pts`}
              </div>
              <div className="mt-2 text-sm text-gray-700">
                {loading ? "Loading…" : headline}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={goShop}
                  disabled={loading}
                  className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-gray-900 text-white disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Use points at checkout
                </button>
                <div className="text-xs text-gray-500 self-center">
                  Keep shopping to unlock bigger savings on every order.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border p-4">
                <div className="text-xs text-gray-500">Lifetime earned</div>
                <div className="text-xl font-semibold">
                  {loading ? "…" : `${loyalty.lifetimeEarned} pts`}
                </div>
              </div>
              <div className="rounded-xl border p-4">
                <div className="text-xs text-gray-500">Lifetime used</div>
                <div className="text-xl font-semibold">
                  {loading ? "…" : `${loyalty.lifetimeRedeemed} pts`}
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Expiring soon (after pruning) */}
          <div>
            <div className="text-sm font-medium mb-2">Expiring soon</div>
            <div className="rounded-2xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="p-3">Points</th>
                    <th className="p-3">Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td className="p-3 text-gray-500" colSpan={2}>
                        Loading…
                      </td>
                    </tr>
                  ) : prunedExpiries.length ? (
                    prunedExpiries.map((r, idx) => (
                      <tr key={`${r.expiresOn}-${idx}`} className="border-t">
                        <td className="p-3">{r.points}</td>
                        <td className="p-3">
                          {r?.expiresOn
                            ? new Date(r.expiresOn).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-3 text-gray-500" colSpan={2}>
                        Nothing expiring soon.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Soft reassurance */}
            <div className="mt-3 text-xs text-gray-500">
              Your points apply automatically on the checkout page—no coupon
              needed.
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
