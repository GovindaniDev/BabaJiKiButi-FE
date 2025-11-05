// src/pages/account/AccountPage.jsx
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  BarChart3,
  Gift,
  Share2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trophy,
  User as UserIcon,
  ExternalLink,
  Truck,
  Eye,
  XCircle,
  Trash2,
  Crown,               // ⬅️ used in the active card
} from "lucide-react";

// UI
import TabNav from "./TabNav";
import StatTile from "./StatTile";

// Sections
import ProfileForm from "./ProfileForm";
import LoyaltyPoints from "./LoyaltyPoints";
import Referral from "./Referral";
import Milestones from "./Milestones";
import Insights from "./Insights";

// Live API adapters
import {
  getLoyaltySummary,
  redeemPoints,
  getReferralStats,
  getMilestones,
  trackOrder,
  cancelOrder,
  getMyOrders,
} from "../../api/engagementApi";

import { useAuth } from "../../auth/AuthContext";
import { useMe } from "../../auth/user/useMe";
import { userApi } from "../../auth/user/userApi";
import { app } from "../../auth/http";
import { cartApi } from "../../auth/cart/cartApi";

// ⬇️ NEW: bring in your subscription API
import { subscriptionApi } from "../../auth/subscription/subscriptionApi";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n || 0));
const pct = (n) => `${Math.round(Number(n || 0) * 100)}%`;

// Tabs: Wallet removed, Orders added
const TABS = [
  { key: "overview", label: "Overview", icon: TrendingUp },
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "loyalty", label: "Loyalty", icon: Gift },
  { key: "orders", label: "Orders", icon: Truck },
  { key: "referrals", label: "Referrals", icon: Share2 },
  { key: "milestones", label: "Milestones", icon: Trophy },
  { key: "insights", label: "Insights", icon: BarChart3 },
];

/* -------------------------- tiny UI helpers -------------------------- */
const Badge = ({ children, tone = "slate" }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${
      tone === "green"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : tone === "amber"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : tone === "red"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-slate-50 text-slate-700 border-slate-200"
    }`}
  >
    {children}
  </span>
);

/* ------------------------- Orders panel (inline) ------------------------- */
function OrdersPanel({ orders = [], onTrack, onCancel, onReorder, total }) {
  if (!orders.length)
    return (
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Your Orders</h3>
          <Badge>0 orders</Badge>
        </div>
        <p className="text-sm text-gray-600">No orders yet.</p>
        <Link to="/shop" className="mt-3 inline-flex items-center gap-2 text-sm text-primary-600">
          Start shopping <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    );

  return (
    <div className="rounded-2xl border bg-white">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <h3 className="font-semibold text-lg">Your Orders</h3>
        <Badge tone="green">{total ?? orders.length} total</Badge>
      </div>

      <ul className="divide-y">
        {orders.map((o) => (
          <li
            key={o.id}
            className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div className="min-w-0 flex items-start gap-3">
              {/* Thumbnail of first item */}
              {o.items?.[0]?.img && (
                <img
                  src={o.items[0].img}
                  alt={o.items?.[0]?.name || "Product"}
                  onError={(e) => (e.currentTarget.src = "/images/placeholder.png")}
                  className="h-12 w-12 rounded-lg object-contain bg-gray-50 border"
                />
              )}

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium">
                    {o.items?.map((it) => `${it.name}`).join(", ")}
                  </span>
                  <span className="text-xs text-gray-500">
                    Placed {o.placedAt ? new Date(o.placedAt).toLocaleDateString() : "-"}
                  </span>
                  {o.status === "Delivered" ? (
                    <Badge tone="green">Delivered {o.deliveredOn || ""}</Badge>
                  ) : o.status === "Cancelled" ? (
                    <Badge tone="red">Cancelled</Badge>
                  ) : (
                    <Badge tone="amber">{o.status}</Badge>
                  )}
                </div>

                {/* Items summary with price */}
                <div className="mt-1 text-sm text-gray-700 line-clamp-2">
                  {o.items
                    ?.map((it) => `${it.name} ×${it.qty} — ₹${Number(it.price || 0).toFixed(0)}`)
                    .join(", ")}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/orders/${o.id}`}
                state={{ order: o }}   // ⬅️ this preloads items into OrderDetails, used as a fallback
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                title="View details"
              >
                <Eye className="h-4 w-4" /> View
              </Link>
              <div className="ml-2 font-semibold">{INR(o.amount)}</div>
            </div>
          </li>
        ))}
      </ul>

      <div className="px-5 py-4 border-t text-sm text-gray-600">
        Showing {orders.length} {orders.length === 1 ? "order" : "orders"}.
      </div>
    </div>
  );
}

/* ----------------------------- Danger Zone ----------------------------- */
function DangerZone({ onDelete, isDeleting }) {
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="font-semibold text-lg mb-1">Danger Zone</h3>
      <p className="text-sm text-gray-600 mb-4">
        Deleting your account is permanent. This action cannot be undone.
      </p>
      <button
        onClick={onDelete}
        disabled={isDeleting}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white ${
          isDeleting ? "bg-rose-400" : "bg-rose-600 hover:bg-rose-700"
        }`}
      >
        <Trash2 className="h-4 w-4" />
        {isDeleting ? "Deleting..." : "Delete account"}
      </button>
    </div>
  );
}

export default function AccountPage() {
  const { isAuthenticated, logout } = useAuth() || {};
  const { me, loading, error, refetch } = useMe();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab =
    TABS.find((t) => t.key === searchParams.get("tab"))?.key || "overview";

  // profile state
  const [form, setForm] = useState({ email: "", name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  // engagement state
  const [loyalty, setLoyalty] = useState(null);
  const [refStats, setRefStats] = useState(null);
  const [milestones, setMilestonesState] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);

  const [redeemPts, setRedeemPts] = useState(0);

  // ui state
  const [activeTab, setActiveTab] = useState(initialTab);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // NEW: subscription state
  const [subActive, setSubActive] = useState(false);
  const [subCurrent, setSubCurrent] = useState(null);
  const [subLoading, setSubLoading] = useState(false);

  // sync tab to URL
  useEffect(() => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("tab", activeTab);
        return p;
      },
      { replace: true }
    );
  }, [activeTab, setSearchParams]);

  useEffect(() => {
    if (me)
      setForm({
        email: me.email || "",
        name: me.name || "",
        phone: me.phone || "",
      });
  }, [me]);

  // fetch bundles (session-based orders + hydrator) + subscription status
  useEffect(() => {
    if (!me?.id) return;
    let alive = true;

    (async () => {
      setPending(true);
      setSubLoading(true);
      try {
        const [L, R, M, myOrders] = await Promise.all([
          getLoyaltySummary(me.id),
          getReferralStats(me.id),
          getMilestones(me.id),
          getMyOrders({ page: 0, size: 10 }),
        ]);

        // Fetch subscription in parallel (separate await to keep types clearer)
        const [isAct, current] = await Promise.all([
          subscriptionApi.isActive(me.id),
          subscriptionApi.myCurrent(me.id),
        ]);

        if (!alive) return;

        setLoyalty(L);
        setRefStats(R);
        setMilestonesState(M);

        setOrders(myOrders?.list || []);
        setOrdersTotal(myOrders?.total ?? (myOrders?.list?.length ?? 0));

        // Normalize 'isActive' shape safely
        const activeFlag =
          !!(isAct?.ok && (isAct.data === true || isAct.data?.active === true));
        setSubActive(activeFlag);
        setSubCurrent(current?.ok ? current.data : null);

        setRedeemPts(Math.min(200, L?.balance || 0));
      } catch (e) {
        console.error(e);
        toast.error(
          e?.response?.data?.message || e?.message || "Failed to load data"
        );
      } finally {
        if (alive) {
          setPending(false);
          setSubLoading(false);
        }
      }
    })();

    return () => {
      alive = false;
    };
  }, [me?.id]);

  // guards
  if (!isAuthenticated)
    return (
      <div className="max-w-6xl mx-auto p-6 pt-32 text-center">
        Please log in to view your account.
      </div>
    );
  if (loading)
    return <div className="max-w-6xl mx-auto p-6 pt-32 text-center">Loading your profile…</div>;
  if (error)
    return (
      <div className="max-w-6xl mx-auto p-6 pt-24 text-red-600">
        Failed to load: {String(error?.message || "Error")}
      </div>
    );

  // handlers
  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (form.email !== me.email) payload.email = form.email.trim();
      if (form.name !== me.name) payload.name = form.name.trim();
      if (form.phone !== me.phone) payload.phone = form.phone.trim();
      if (!Object.keys(payload).length) toast("No changes to save");
      else {
        await userApi.updateMe(payload);
        toast.success("Profile updated");
        await refetch();
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Update failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };
  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Babaji Ki Buti",
          text: "Use my referral link",
          url: refStats?.url,
        });
      } catch {}
    } else {
      copy(refStats?.url);
    }
  };

  const redeem = async () => {
    const pts = Math.min(Math.max(Number(redeemPts || 0), 0), loyalty?.balance || 0);
    if (!pts) return toast("Enter points to redeem");
    try {
      await redeemPoints({ userId: me.id, points: pts });
      toast.success(`${pts} points applied`);
      setLoyalty((s) => ({
        ...s,
        balance: Math.max((s?.balance || 0) - pts, 0),
        lifetimeRedeemed: (s?.lifetimeRedeemed || 0) + pts,
      }));
      setRedeemPts(0);
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Redeem failed");
    }
  };

  const handleTrack = async (order) => {
    try {
      const res = await trackOrder(order.id);
      if (!res) return toast.error("Tracking unavailable");
      const msg = [
        `Order #${order.orderNumber || order.id}`,
        res.trackingId ? `Tracking: ${res.trackingId}` : "",
        res.status ? `Status: ${res.status}` : "",
        res.eta ? `ETA: ${res.eta}` : "",
      ]
        .filter(Boolean)
        .join(" • ");
      toast.success(msg);
    } catch {
      toast.error("Failed to fetch tracking");
    }
  };

  const handleCancel = async (order) => {
    if (!confirm(`Cancel order #${order.orderNumber || order.id}?`)) return;
    try {
      await cancelOrder(order.id);
      toast.success(`Order #${order.orderNumber || order.id} cancelled`);
      setOrders((list) =>
        list.map((o) =>
          o.id === order.id
            ? {
                ...o,
                status: "Cancelled",
                cancelledOn: new Date().toISOString().slice(0, 10),
              }
            : o
        )
      );
    } catch {
      toast.error("Cancel failed");
    }
  };

  const handleReorder = async (order) => {
    try {
      if (!Array.isArray(order?.items) || !order.items.length) {
        return toast.error("No items found in this order");
      }

      for (const it of order.items) {
        const productId = it.productId ?? it.id;
        const quantity = Number(it.qty ?? it.quantity ?? 1);
        const productVariantId = it.productVariantId ?? it.variantId ?? undefined;

        if (typeof cartApi?.add === "function") {
          await cartApi.add({ productId, quantity, productVariantId });
        } else if (typeof cartApi?.addItem === "function") {
          await cartApi.addItem({ productId, quantity, productVariantId });
        } else {
          throw new Error("cartApi.add(...) is not available");
        }
      }

      toast.success("Items added to your cart");
      navigate("/cart");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to reorder";
      toast.error(msg);
    }
  };

  // ⬇️ Use the definitive subscription flag from API (fallback to legacy hints if needed)
  const subscribed =
    subActive ||
    Boolean(me?.subscription?.active) ||
    Boolean(me?.isSubscribed) ||
    Boolean(me?.plan);

  const deliveredCount = Array.isArray(orders)
    ? orders.filter((o) => o.status === "Delivered").length
    : 0;

  let progressPct = 1;
  if (milestones?.nextMilestone) {
    const from =
      (milestones.tiers?.filter((t) => t.reached).slice(-1)[0]?.threshold ?? 0) || 0;
    const to = milestones.nextMilestone || 1;
    const cur = Math.min(Math.max((milestones.currentSpend || 0) - from, 0), to - from);
    progressPct = cur / (to - from || 1);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-25">
      {/* Header */}
      <div className="mb-4 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Account</h1>
          <p className="text-sm text-gray-600">Welcome back, {me?.name || me?.email}</p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          {/* ⬇️ Membership status badge */}
          <span
            className={`inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border ${
              subscribed
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-slate-50 text-slate-700 border-slate-200"
            }`}
            title={subLoading ? "Checking…" : subscribed ? "Membership active" : "Not subscribed"}
          >
            <ShieldCheck className="h-4 w-4" />
            {subLoading ? "Checking…" : subscribed ? "Member Active" : "Free user"}
          </span>

          <span className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Sparkles className="h-4 w-4" /> {loyalty?.balance ?? 0} pts
          </span>
        </div>
      </div>

      {/* Tabs */}
      <TabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {/* Loading shimmer */}
      {pending && (
        <div className="grid md:grid-cols-4 gap-4 mb-6 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100" />
          ))}
        </div>
      )}

      {/* Content per-tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* ⬇️ Show a compact membership strip in overview */}
          <div className="rounded-2xl border bg-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                <Crown className={`h-5 w-5 ${subscribed ? "text-emerald-600" : "text-slate-500"}`} />
              </div>
              <div>
                <div className="font-semibold">
                  {subscribed ? "Membership Active" : "No active membership"}
                </div>
                <div className="text-sm text-gray-600">
                  {subscribed && subCurrent?.endAt
                    ? `Valid till ${new Date(subCurrent.endAt).toLocaleString()}`
                    : "Unlock extra savings & perks by subscribing."}
                </div>
              </div>
            </div>
            {!subscribed && (
              <Link
                to="/subscribe"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700 text-sm"
              >
                Get membership <ExternalLink className="h-4 w-4" />
              </Link>
            )}
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <StatTile
              icon={Gift}
              label="Loyalty Points"
              value={`${loyalty?.balance ?? 0} pts`}
              sub={`Lifetime: +${loyalty?.lifetimeEarned ?? 0} / -${
                loyalty?.lifetimeRedeemed ?? 0
              }`}
            />

            {/* Orders tile */}
            <StatTile
              icon={Truck}
              label="Orders"
              value={`${ordersTotal ?? 0}`}
              sub={`${deliveredCount}/${ordersTotal ?? 0} delivered`}
            />

            <StatTile
              icon={Share2}
              label="Referrals"
              value={`${refStats?.referredCount ?? 0} friends`}
              sub={`Credits: ${INR(refStats?.earnedCredits ?? 0)}`}
            />
            <StatTile
              icon={TrendingUp}
              label="This Year Spend"
              value={INR(milestones?.currentSpend ?? 0)}
              sub={`${pct(progressPct)} to next milestone`}
            />
          </div>
          <Milestones milestones={milestones} progressPct={progressPct} />
        </div>
      )}

      {activeTab === "profile" && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* ⬇️ If not subscribed, show upsell. If subscribed, show validity. */}
            {subscribed ? (
              <div className="rounded-2xl border bg-white p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 border border-emerald-200">
                      <Crown className="h-5 w-5 text-emerald-600" />
                    </span>
                    <div>
                      <h3 className="font-semibold text-lg">Membership Active</h3>
                      <p className="text-sm text-gray-600">
                        {subCurrent?.endAt
                          ? `Valid till ${new Date(subCurrent.endAt).toLocaleString()}`
                          : "Enjoy member perks and extra savings."}
                      </p>
                    </div>
                  </div>
                  <Link
                    to="/subscribe"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50"
                    title="Manage membership"
                  >
                    Manage <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border bg-gradient-to-r from-amber-50 to-amber-100 p-5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h3 className="font-semibold text-lg">Unlock more with Subscription</h3>
                    <p className="text-sm text-amber-800/90">
                      Get free delivery, exclusive discounts & faster support.
                    </p>
                  </div>
                  <Link
                    to="/subscribe"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white hover:bg-amber-700"
                  >
                    Buy subscription <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}

            <ProfileForm form={form} saving={saving} onChange={onChange} onSave={onSave} />
            {/* <DangerZone onDelete={handleDeleteAccount} isDeleting={deleting} /> */}
          </div>
        </div>
      )}

      {activeTab === "loyalty" && (
        <LoyaltyPoints
          loyalty={loyalty}
          redeemPts={redeemPts}
          setRedeemPts={setRedeemPts}
          onRedeem={redeem}
        />
      )}

      {activeTab === "orders" && (
        <OrdersPanel
          total={ordersTotal}
          orders={orders}
          onTrack={handleTrack}
          onCancel={handleCancel}
          onReorder={handleReorder}
        />
      )}

      {activeTab === "referrals" && (
        <Referral refStats={refStats} onCopy={(text) => copy(text)} onShare={shareLink} />
      )}

      {activeTab === "milestones" && (
        <Milestones milestones={milestones} progressPct={progressPct} />
      )}

      {activeTab === "insights" && <Insights loyalty={loyalty} refStats={refStats} />}
    </div>
  );
}
