// ------------------------------
// File: src/page/profile/sections/Referral.jsx
// ------------------------------
import React, { useEffect, useMemo, useState } from "react";
import { Share2, Copy, Link as LinkIcon, RefreshCw } from "lucide-react";
import SectionCard from "./SectionCard";
import { app } from "../../auth/http"; // keep this import; http.js wires tokens & refresh

const INR2 = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));

/**
 * Props:
 * - userId?: number (optional)
 * - onShare?: fn   (optional override)
 * - onCopy?: fn    (optional override)
 *
 * Backend:
 *   GET  /api/referrals/code?userId=
 *   GET  /api/referrals/summary?userId=
 *   POST /api/referrals/code/regenerate?userId=
 *   GET  /api/admin/referrals/rules
 */
export default function Referral({ userId: userIdProp, onCopy: onCopyProp, onShare: onShareProp }) {
  const [loading, setLoading] = useState(true);
  const [refStats, setRefStats] = useState(null);
  const [rules, setRules] = useState(null);
  const [regenBusy, setRegenBusy] = useState(false);
  const [resolvedUserId, setResolvedUserId] = useState(null);
  const [resolvingUserId, setResolvingUserId] = useState(true);

  // Resolve userId exactly once (prop -> localStorage -> /users/me)
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
        const cached = localStorage.getItem("userId");
        if (cached) {
          if (!alive) return;
          setResolvedUserId(Number(cached));
          setResolvingUserId(false);
          return;
        }
      } catch {}

      try {
        const meRes = await app.get(`/users/me`, { withCredentials: true });
        const me = meRes?.data?.data ?? meRes?.data;
        const uid =
          Number(me?.id) || Number(me?.userId) || (typeof me?.sub === "string" ? Number(me.sub) : null);
        if (uid) {
          try { localStorage.setItem("userId", String(uid)); } catch {}
          if (!alive) return;
          setResolvedUserId(uid);
        } else {
          if (!alive) return;
          setResolvedUserId(null);
        }
      } catch (e) {
        console.error("Unable to resolve user id via /users/me:", e);
        if (!alive) return;
        setResolvedUserId(null);
      } finally {
        if (alive) setResolvingUserId(false);
      }
    }

    resolve();
    return () => { alive = false; };
  }, [userIdProp]);

  const fetchSummary = async (uid) => {
    // ensure/bootstraps code (idempotent)
    try {
      await app.get(`/referrals/code`, { params: { userId: uid }, withCredentials: true });
    } catch (e) {
      // non-fatal
    }

    const res = await app.get(`/referrals/summary`, {
      params: { userId: uid },
      withCredentials: true,
    });
    const dto = res?.data?.data ?? res?.data;
    setRefStats({
      code: dto?.code || "",
      url: dto?.url || "",
      referredCount: Number(dto?.referredCount ?? 0),
      earnedCredits: Number(dto?.earnedCredits ?? 0),
    });
  };

  const fetchRules = async () => {
    try {
      const res = await app.get(`/admin/referrals/rules`, { withCredentials: true });
      const dto = res?.data?.data ?? res?.data;
      setRules({
        referrerPoints: Number(dto?.referrerPoints ?? 0),
        refereePoints: Number(dto?.refereePoints ?? 0),
        dailyCap: Number(dto?.dailyCap ?? 0),
      });
    } catch {
      setRules(null); // non-admin users may get 403; fine
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (resolvingUserId) return;
      if (!resolvedUserId) { setLoading(false); return; }
      setLoading(true);
      try {
        await Promise.all([fetchSummary(resolvedUserId), fetchRules()]);
      } catch (e) {
        console.error("Referral load failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [resolvedUserId, resolvingUserId]);

  const onCopy = onCopyProp
    ? onCopyProp
    : async (text) => {
        try { await navigator.clipboard.writeText(String(text ?? "")); } catch {}
      };

  const onShare = onShareProp
    ? onShareProp
    : async () => {
        try {
          if (navigator.share && refStats?.url) {
            await navigator.share({
              title: "Use my referral link",
              text: "Grab your discount on your first order!",
              url: refStats.url,
            });
          } else if (refStats?.url) {
            await onCopy(refStats.url);
            alert("Link copied!");
          }
        } catch {}
      };

  const onRegenerate = async () => {
    if (!resolvedUserId) return;
    setRegenBusy(true);
    try {
      const res = await app.post(`/referrals/code/regenerate`, null, {
        params: { userId: resolvedUserId },
        withCredentials: true,
      });
      const dto = res?.data?.data ?? res?.data; // { code, url }
      setRefStats((prev) => ({
        ...(prev || {}),
        code: dto?.code || prev?.code,
        url: dto?.url || prev?.url,
      }));
    } catch (e) {
      console.error("Regenerate failed:", e);
    } finally {
      setRegenBusy(false);
    }
  };

  const hint = (() => {
    if (!rules)
      return "Your friend gets a reward; you get credits when they place their first order.";
    const rref = rules.referrerPoints || 0;
    const rfee = rules.refereePoints || 0;
    const cap  = rules.dailyCap || 0;
    return `Friend: ${INR2(rfee)} · You: ${INR2(rref)} per referral · Daily cap: ${INR2(cap)}.`;
  })();

  return (
    <SectionCard
      title="Referral Program"
      icon={Share2}
      action={<div className="text-sm text-gray-600">Earn credits when friends shop</div>}
    >
      {!resolvedUserId && !resolvingUserId ? (
        <div className="text-sm text-gray-600">Please sign in to view your referral details.</div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 h-11 rounded-xl border px-3 flex items-center justify-between bg-gray-50">
                <span className="truncate text-sm">
                  {loading ? "Loading…" : (refStats?.url || "—")}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCopy(refStats?.url)}
                    disabled={!refStats?.url || loading}
                    className="px-3 py-1.5 rounded-lg border bg-white flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <Copy className="h-4 w-4" /> Copy
                  </button>
                  <button
                    onClick={onRegenerate}
                    disabled={regenBusy || loading}
                    title="Regenerate code"
                    className="px-3 py-1.5 rounded-lg border bg-white flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${regenBusy ? "animate-spin" : ""}`} />
                    New code
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onShare}
                disabled={!refStats?.url || loading}
                className="h-11 px-4 rounded-xl border bg-white flex items-center gap-2 disabled:opacity-50"
              >
                <Share2 className="h-4 w-4" /> Share
              </button>
              <button
                onClick={() => onCopy(refStats?.code)}
                disabled={!refStats?.code || loading}
                className="h-11 px-4 rounded-xl border bg-white flex items-center gap-2 disabled:opacity-50"
              >
                <LinkIcon className="h-4 w-4" /> Copy Code ({refStats?.code || "—"})
              </button>
            </div>

            <div className="text-xs text-gray-500 mt-3">{hint}</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-4">
              <div className="text-xs text-gray-500">Referred friends</div>
              <div className="text-2xl font-semibold">
                {loading ? "…" : (refStats?.referredCount ?? 0)}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-xs text-gray-500">Credits earned</div>
              <div className="text-2xl font-semibold">
                {loading ? "…" : INR2(refStats?.earnedCredits ?? 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}
