// src/admin/ReferralLoyaltyRulesPage.jsx
import React, { useEffect, useState } from "react";
import { app } from '../../../../../auth/httpAPI';
import toast from "react-hot-toast";

const toInt = (v, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

export default function ReferralLoyaltyRulesSection() {
  const [loading, setLoading] = useState(true);

  const [loyaltyRules, setLoyaltyRules] = useState(null);
  const [loyaltyOriginal, setLoyaltyOriginal] = useState(null);
  const [savingLoyalty, setSavingLoyalty] = useState(false);

  const [referralRules, setReferralRules] = useState(null);
  const [referralOriginal, setReferralOriginal] = useState(null);
  const [savingReferral, setSavingReferral] = useState(false);

  const [error, setError] = useState(null);

  /* ---------------------- initial load ---------------------- */
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [loyaltyRes, referralRes] = await Promise.all([
          app.get("/admin/loyalty/rules"),
          app.get("/admin/referrals/rules"),
        ]);

        const lr = loyaltyRes?.data?.data ?? loyaltyRes?.data ?? {};
        const rr = referralRes?.data?.data ?? referralRes?.data ?? {};

        if (!cancelled) {
          setLoyaltyRules(lr);
          setLoyaltyOriginal(lr);
          setReferralRules(rr);
          setReferralOriginal(rr);
        }
      } catch (e) {
        console.error("Failed to load rules", e);
        if (!cancelled) {
          setError("Failed to load rules. Please try again.");
          toast.error("Failed to load rules");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const loyaltyDirty =
    loyaltyRules && loyaltyOriginal
      ? JSON.stringify(loyaltyRules) !== JSON.stringify(loyaltyOriginal)
      : false;

  const referralDirty =
    referralRules && referralOriginal
      ? JSON.stringify(referralRules) !== JSON.stringify(referralOriginal)
      : false;

  /* ---------------------- handlers: loyalty ---------------------- */
  const handleLoyaltyChange = (field, value) => {
    setLoyaltyRules((prev) => ({
      ...prev,
      [field]: toInt(value, 0),
    }));
  };

  const saveLoyalty = async () => {
    if (!loyaltyRules) return;
    setSavingLoyalty(true);
    try {
      const payload = {
        ...loyaltyRules,
        earnDivisor: toInt(loyaltyRules.earnDivisor, 10),
        pointsPerPercent: toInt(loyaltyRules.pointsPerPercent, 50),
        maxPercent: toInt(loyaltyRules.maxPercent, 30),
        minApplicablePercent: toInt(loyaltyRules.minApplicablePercent, 5),
        expiryMonths: toInt(loyaltyRules.expiryMonths, 12),
        minRedeemPoints: toInt(loyaltyRules.minRedeemPoints, 50),
      };

      const { data } = await app.put("/admin/loyalty/rules", payload);
      const updated = data?.data ?? data ?? payload;
      setLoyaltyRules(updated);
      setLoyaltyOriginal(updated);
      toast.success("Loyalty rules updated");
    } catch (e) {
      console.error("Failed to save loyalty rules", e);
      toast.error("Failed to save loyalty rules");
    } finally {
      setSavingLoyalty(false);
    }
  };

  const resetLoyalty = () => {
    setLoyaltyRules(loyaltyOriginal);
  };

  /* ---------------------- handlers: referral ---------------------- */
  const handleReferralChange = (field, value) => {
    setReferralRules((prev) => ({
      ...prev,
      [field]: toInt(value, 0),
    }));
  };

  const saveReferral = async () => {
    if (!referralRules) return;
    setSavingReferral(true);
    try {
      const payload = {
        ...referralRules,
        referrerPoints: toInt(referralRules.referrerPoints, 300),
        refereePoints: toInt(referralRules.refereePoints, 0),
        dailyCap: toInt(referralRules.dailyCap, 1000),
      };

      const { data } = await app.put("/admin/referrals/rules", payload);
      const updated = data?.data ?? data ?? payload;
      setReferralRules(updated);
      setReferralOriginal(updated);
      toast.success("Referral rules updated");
    } catch (e) {
      console.error("Failed to save referral rules", e);
      toast.error("Failed to save referral rules");
    } finally {
      setSavingReferral(false);
    }
  };

  const resetReferral = () => {
    setReferralRules(referralOriginal);
  };

  /* ---------------------- derived helper text ---------------------- */
  const renderLoyaltySummaryLine = () => {
    if (!loyaltyRules) return null;
    const {
      earnDivisor,
      pointsPerPercent,
      maxPercent,
      minApplicablePercent,
      expiryMonths,
      minRedeemPoints,
    } = loyaltyRules;

    return (
      <p className="text-xs text-gray-500 leading-relaxed">
        Customers earn <span className="font-semibold">1 point</span> for every{" "}
        <span className="font-semibold">₹{earnDivisor || 10}</span> spent.{" "}
        <span className="font-semibold">{pointsPerPercent || 50} points</span>{" "}
        ≈ <span className="font-semibold">1% discount</span>, up to a maximum of{" "}
        <span className="font-semibold">{maxPercent || 30}%</span> per order.
        Discount is only applied if it&apos;s at least{" "}
        <span className="font-semibold">{minApplicablePercent || 5}%</span> and the
        customer redeems at least{" "}
        <span className="font-semibold">{minRedeemPoints || 50} points</span>. Points
        expire after{" "}
        <span className="font-semibold">{expiryMonths || 12} months</span>.
      </p>
    );
  };

  const renderReferralSummaryLine = () => {
    if (!referralRules) return null;
    const { referrerPoints, refereePoints, dailyCap } = referralRules;

    return (
      <p className="text-xs text-gray-500 leading-relaxed">
        For each successful referral, the{" "}
        <span className="font-semibold">referrer</span> gets{" "}
        <span className="font-semibold">{referrerPoints || 0} points</span>
        {refereePoints ? (
          <>
            , and the <span className="font-semibold">referee</span> gets{" "}
            <span className="font-semibold">{refereePoints} points</span> as a welcome
            bonus.
          </>
        ) : (
          ""
        )}{" "}
        Daily cap per user is{" "}
        <span className="font-semibold">{dailyCap || 0} points</span> (referral side).
      </p>
    );
  };

  /* ---------------------- render ---------------------- */
  return (
    <div className=" space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Referral &amp; Loyalty Rules
          </h1>
          <p className="text-sm text-gray-500">
            Configure how customers earn and redeem points, and how your referral
            program works.
          </p>
        </div>
        {loading && (
          <div className="text-xs text-gray-500 animate-pulse">
            Loading latest rules…
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Content grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Loyalty card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Loyalty rules (points &amp; redemption)
              </h2>
              <p className="text-xs text-gray-500">
                Controls how many points customers earn on orders and how they can
                redeem them at checkout.
              </p>
            </div>
            {loyaltyDirty && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
                Unsaved changes
              </span>
            )}
          </div>

          {!loyaltyRules ? (
            <div className="text-xs text-gray-400 italic">No data yet…</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Earn divisor (₹ → 1 point)
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={loyaltyRules.earnDivisor ?? ""}
                    onChange={(e) =>
                      handleLoyaltyChange("earnDivisor", e.target.value)
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    Example: 10 ⇒ every ₹10 spent earns 1 point.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Points per 1% discount
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={loyaltyRules.pointsPerPercent ?? ""}
                    onChange={(e) =>
                      handleLoyaltyChange("pointsPerPercent", e.target.value)
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    Example: 50 ⇒ 50 points = 1% discount.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Max discount (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={loyaltyRules.maxPercent ?? ""}
                    onChange={(e) =>
                      handleLoyaltyChange("maxPercent", e.target.value)
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    Hard cap per order (e.g. 30%).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Min applicable discount (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={loyaltyRules.minApplicablePercent ?? ""}
                    onChange={(e) =>
                      handleLoyaltyChange(
                        "minApplicablePercent",
                        e.target.value
                      )
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    If computed discount % is lower, no discount is applied.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Points expiry (months)
                  </label>
                  <input
                    type="number"
                    min={1}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={loyaltyRules.expiryMonths ?? ""}
                    onChange={(e) =>
                      handleLoyaltyChange("expiryMonths", e.target.value)
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    How long before earned points expire.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Min points to redeem
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={loyaltyRules.minRedeemPoints ?? ""}
                    onChange={(e) =>
                      handleLoyaltyChange("minRedeemPoints", e.target.value)
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    Customer must have at least this many points to redeem.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 px-3 py-2">
                {renderLoyaltySummaryLine()}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={resetLoyalty}
                  disabled={!loyaltyDirty || savingLoyalty}
                  className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                >
                  Reset changes
                </button>
                <button
                  type="button"
                  onClick={saveLoyalty}
                  disabled={!loyaltyDirty || savingLoyalty}
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed"
                >
                  {savingLoyalty ? "Saving…" : "Save loyalty rules"}
                </button>
              </div>
            </>
          )}
        </section>

        {/* Referral card */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                Referral rules (bonus points)
              </h2>
              <p className="text-xs text-gray-500">
                Configure how many loyalty points are awarded for referrals and
                per-day caps.
              </p>
            </div>
            {referralDirty && (
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
                Unsaved changes
              </span>
            )}
          </div>

          {!referralRules ? (
            <div className="text-xs text-gray-400 italic">No data yet…</div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Referrer bonus (points)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={referralRules.referrerPoints ?? ""}
                    onChange={(e) =>
                      handleReferralChange("referrerPoints", e.target.value)
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    Points credited to the existing customer who shares the
                    code.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Referee bonus (points)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={referralRules.refereePoints ?? ""}
                    onChange={(e) =>
                      handleReferralChange("refereePoints", e.target.value)
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    Points credited to the new customer using the code.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-700">
                    Daily cap per user (points)
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="block w-full rounded-lg border-gray-300 text-sm focus:ring-emerald-500 focus:border-emerald-500"
                    value={referralRules.dailyCap ?? ""}
                    onChange={(e) =>
                      handleReferralChange("dailyCap", e.target.value)
                    }
                  />
                  <p className="text-[11px] text-gray-500">
                    To limit abuse from excessive referrals in a single day.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 px-3 py-2">
                {renderReferralSummaryLine()}
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={resetReferral}
                  disabled={!referralDirty || savingReferral}
                  className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-40"
                >
                  Reset changes
                </button>
                <button
                  type="button"
                  onClick={saveReferral}
                  disabled={!referralDirty || savingReferral}
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed"
                >
                  {savingReferral ? "Saving…" : "Save referral rules"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* Small note */}
      <p className="text-[11px] text-gray-400">
        Changes take effect immediately for new orders and referrals. Existing
        earned points are not recalculated retroactively.
      </p>
    </div>
  );
}
