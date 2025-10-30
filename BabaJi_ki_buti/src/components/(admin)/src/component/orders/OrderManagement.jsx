// src/pages/admin/OrderManagement.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  ShoppingCart,
  Clock,
  TrendingUp,
  Wallet,
  Filter,
  MoreVertical,
  ChevronDown,
  Check,
  RefreshCcw,
} from "lucide-react";
import { adminOrderApi } from "../../../../../auth/order/adminOrderApi";

/* ---------------- helpers ---------------- */
const inr = (x) => {
  const n = typeof x === "number" ? x : Number(x);
  if (!Number.isFinite(n)) return "₹0";
  try {
    return n.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  } catch {
    return `₹${n.toFixed(2)}`;
  }
};

const fmtDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
};

const dateKey = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const statusBadge = (s) => {
  switch ((s || "").toUpperCase()) {
    case "DELIVERED":
      return "bg-green-100 text-green-800";
    case "PROCESSING":
    case "PLACED":
      return "bg-yellow-100 text-yellow-800";
    case "SHIPPING":
      return "bg-blue-100 text-blue-800";
    case "CANCELLED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const payBadge = (p) => {
  switch ((p || "").toUpperCase()) {
    case "PAID":
      return "bg-green-100 text-green-800";
    case "REFUNDED":
      return "bg-blue-100 text-blue-800";
    case "PENDING":
      return "bg-purple-100 text-purple-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    case "NOT_PAID":
    default:
      return "bg-yellow-100 text-yellow-800";
  }
};

/* ---------------- component ---------------- */
export default function OrderManagement() {
  // UI state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // data state
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // for debounced search cancel
  const debounceRef = useRef(null);
  const inflightRef = useRef(null);

  const fetchAll = async ({ q, status } = {}) => {
    if (inflightRef.current) inflightRef.current.abort();
    const ctrl = new AbortController();
    inflightRef.current = ctrl;

    setLoading(true);
    setErr("");
    try {
      const [list, kpis] = await Promise.all([
        adminOrderApi.listAll({
          q: q || undefined,
          status: status && status !== "All Status" ? status : undefined,
          sort: "createdAt,desc",
          limit: 1000,
        }),
        adminOrderApi.stats({}), // add {from,to} later when date pickers exist
      ]);
      if (!ctrl.signal.aborted) {
        setRows(Array.isArray(list) ? list : []);
        setStats(kpis || null);
      }
    } catch (e) {
      if (!ctrl.signal.aborted) setErr(e.message || "Failed to load orders");
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
      inflightRef.current = null;
    }
  };

  // initial load
  useEffect(() => {
    fetchAll({});
    return () => {
      if (inflightRef.current) inflightRef.current.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // refetch when status changes (server-side)
  useEffect(() => {
    fetchAll({ q: searchQuery, status: statusFilter });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  // debounced server search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAll({ q: searchQuery, status: statusFilter });
    }, 400);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const filtered = useMemo(() => rows, [rows]);

  /* ---------------- derived analytics ---------------- */
  const analytics = useMemo(() => {
    const total = filtered.length;

    // counts
    const statusCounts = {
      PLACED: 0,
      PROCESSING: 0,
      SHIPPING: 0,
      DELIVERED: 0,
      CANCELLED: 0,
      _unknown: 0,
    };

    // NOTE: payment has PENDING, not PROCESSING
    const payCounts = {
      NOT_PAID: 0,
      PAID: 0,
      REFUNDED: 0,
      FAILED: 0,
      PENDING: 0,
      _unknown: 0,
    };

    let revenue = 0;
    let totalItems = 0;

    // revenue by day (last 14 days window)
    const today = new Date();
    const days = [...Array(14)].map((_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (13 - i));
      const yyyy = d.getFullYear(),
        mm = String(d.getMonth() + 1).padStart(2, "0"),
        dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    });
    const revenueByDay = new Map(days.map((k) => [k, 0]));

    for (const r of filtered) {
      const st = (r.status || "").toUpperCase();
      if (st in statusCounts) statusCounts[st]++;
      else statusCounts._unknown++;

      const ps = (r.paymentStatus || "").toUpperCase();
      if (ps in payCounts) payCounts[ps]++;
      else payCounts._unknown++;

      const amt = Number(r.netAmount || 0) || 0;
      revenue += amt;

      totalItems += Number(r.itemsCount || 0) || 0;

      const dk = dateKey(r.createdAt);
      if (dk && revenueByDay.has(dk)) {
        revenueByDay.set(dk, (revenueByDay.get(dk) || 0) + amt);
      }
    }

    const maxRev = Math.max(1, ...revenueByDay.values());
    const aov = stats?.avgOrderValue ?? (total ? revenue / total : 0);
    const itemsPerOrder = total ? totalItems / total : 0;

    return {
      total,
      revenue,
      aov,
      itemsPerOrder,
      statusCounts,
      payCounts,
      revenueSeries: days.map((k) => ({
        day: k,
        amount: revenueByDay.get(k) || 0,
      })),
      maxRev,
    };
  }, [filtered, stats]);

  return (
    <div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {(stats?.totalOrders ?? rows.length).toLocaleString()}
          </div>
          <p className="text-sm text-gray-500 mt-1">Latest snapshot</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Processing Orders</h3>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats?.processingOrders ?? analytics.statusCounts.PROCESSING ?? 0}
          </div>
          <p className="text-sm text-gray-500 mt-1">Currently in processing</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
            <Wallet className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {stats ? inr(stats.revenue) : inr(analytics.revenue)}
          </div>
          <p className="text-sm text-gray-500 mt-1">Selected range</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg Order Value</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {inr(analytics.aov)}
          </div>
          <p className="text-sm text-gray-500 mt-1">Selected range</p>
        </div>
      </div>

    

      {/* Order Management */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
            <p className="text-sm text-gray-500 mt-1">
              View and manage all customer orders
            </p>
          </div>
          <button
            onClick={() => fetchAll({ q: searchQuery, status: statusFilter })}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCcw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search (order no / name / email)…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="relative">
              <button
                onClick={() => setShowStatusDropdown((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {statusFilter}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showStatusDropdown && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[180px]">
                  {[
                    "All Status",
                    "PLACED",
                    "PROCESSING",
                    "SHIPPING",
                    "DELIVERED",
                    "CANCELLED",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setStatusFilter(s);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        statusFilter === s
                          ? "bg-yellow-50 text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      {s}
                      {statusFilter === s && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

         
        </div>

        {/* Error / Loading */}
        {err && <div className="p-4 text-red-600">{err}</div>}
        {loading && <div className="p-4 text-gray-600">Loading…</div>}

        {/* Table */}
        {!loading && !err && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Order No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {r.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {r.customerName || "-"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {r.customerEmail || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {r.itemsCount ?? 0}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {inr(r.netAmount || 0)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${payBadge(
                          r.paymentStatus
                        )}`}
                      >
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {fmtDate(r.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        title="More"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
