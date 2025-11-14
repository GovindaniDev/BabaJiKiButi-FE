import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Search,
  Users,
  Crown,
  ArrowDownUp,
  CalendarRange,
  Download,
  RefreshCw,
  ChevronDown,
  Check,
  Filter as FilterIcon,
} from "lucide-react";
import { subscriptionApi } from "../../../../../auth/subscription/subscriptionApi";

const cn = (...c) => c.filter(Boolean).join(" ");

/* ---------------------- Filter option lists ---------------------- */

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All statuses", chipClass: "bg-slate-100 text-slate-700" },
  { value: "ACTIVE", label: "Active only", chipClass: "bg-emerald-100 text-emerald-800" },
  { value: "CANCELED", label: "Canceled only", chipClass: "bg-red-100 text-red-800" },
  { value: "EXPIRED", label: "Expired only", chipClass: "bg-amber-100 text-amber-800" },
  { value: "TRIAL", label: "Trial only", chipClass: "bg-indigo-100 text-indigo-800" },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100].map((n) => ({
  value: n,
  label: `${n} rows`,
  chipClass: "bg-slate-100 text-slate-700",
}));

/* ---------------------- Fancy dropdown pill ---------------------- */

function FilterDropdown({ label, value, onChange, options, compact = false }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const current =
    options.find((o) => String(o.value) === String(value)) || options[0];

  useEffect(() => {
    const handleClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const triggerBase =
    "inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 shadow-sm hover:bg-emerald-100/90 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1";
  const triggerSize = compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-xs md:text-sm";

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`${triggerBase} ${triggerSize}`}
      >
        {!compact && (
          <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-emerald-700/80">
            <FilterIcon className="h-3 w-3" />
            {label}
          </span>
        )}

        <span
          className={`inline-flex items-center rounded-xl px-2 py-1 text-[11px] font-medium ${current?.chipClass}`}
        >
          {current?.value}
        </span>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-emerald-700/70 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-emerald-100 bg-white/95 backdrop-blur shadow-xl ring-1 ring-emerald-100/70 z-20">
          {!compact && (
            <div className="px-3 pt-3 pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/70">
                {label} filter
              </p>
            </div>
          )}
          <div className="max-h-64 overflow-y-auto pb-2">
            {options.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full px-3 py-2.5 text-sm flex items-center justify-between gap-3 text-left transition-colors",
                    active
                      ? "bg-emerald-50 text-emerald-900"
                      : "hover:bg-emerald-50/70 text-gray-700"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex min-w-[18px] h-[18px] rounded-full border border-white/80 shadow-sm",
                        opt.chipClass
                      )}
                    />
                    <span className="font-medium">{opt.label}</span>
                  </div>
                  {active && (
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------- Helpers ---------------------- */

const formatDateTime = (v) => {
  if (!v) return "—";
  const d = v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusBadgeClass = (s) => {
  const v = (s || "").toUpperCase();
  if (v === "ACTIVE") return "bg-emerald-100 text-emerald-800";
  if (v === "TRIAL") return "bg-indigo-100 text-indigo-800";
  if (v === "CANCELED") return "bg-red-100 text-red-800";
  if (v === "EXPIRED") return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-800";
};

function mapSubscriptionRow(raw) {
  const status = (raw.status || raw.state || "ACTIVE").toUpperCase();
  const user = raw.user || {};
  const plan = raw.plan || {};

  return {
    id: raw.subscriptionId || raw.id || raw.uuid,
    userId: raw.userId || user.id,
    userName: raw.userName || user.name || "Unknown user",
    userEmail: raw.userEmail || user.email || "",
    planName: plan.name || raw.planName || "Membership",
    price: raw.price ?? plan.price ?? null,
    currency: raw.currency || plan.currency || "INR",
    status,
    startedAt: raw.startAt || raw.startedAt || raw.createdAt,
    endsAt: raw.endAt || raw.expiryAt || raw.expiresAt,
    autoRenew: raw.autoRenew ?? raw.auto_renew ?? false,
    nextBillingAt: raw.nextBillingAt || raw.renewsAt || null,
    provider: raw.provider || "cashfree",
    raw,
  };
}

/* ======================== Admin Subscriptions ======================== */

export default function AdminSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  const [error, setError] = useState("");

  const [rows, setRows] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [plan, setPlan] = useState(null);

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // pagination
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);

  const totalPages = Math.max(1, Math.ceil(totalElements / Math.max(1, size)));
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  /* ---- Load plan + active count ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setMetaLoading(true);
      try {
        const [planRes, countRes] = await Promise.all([
          subscriptionApi.getPlan(),
          subscriptionApi.countActive(),
        ]);

        if (!cancelled) {
          if (planRes?.ok) setPlan(planRes.data);
          if (countRes?.ok) setActiveCount(Number(countRes.data || 0));
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- Load active subscriptions page ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await subscriptionApi.getActive(page, size);
        if (!res.ok) {
          if (!cancelled)
            setError(res.userMessage || res.error || "Failed to load subscriptions.");
          return;
        }
        const payload = res.data;
        const content = payload?.content ?? (Array.isArray(payload) ? payload : []);
        const total = payload?.totalElements ?? content.length;

        if (!cancelled) {
          setRows(Array.isArray(content) ? content : []);
          setTotalElements(Number.isFinite(total) ? total : content.length);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setError("Failed to load subscriptions.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, size]);

  /* ---- Derived stats ---- */
  const mappedRows = useMemo(() => rows.map(mapSubscriptionRow), [rows]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;

    return mappedRows.filter((r) => {
      const matchSearch =
        !q ||
        r.userName.toLowerCase().includes(q) ||
        (r.userEmail || "").toLowerCase().includes(q) ||
        String(r.userId || "").toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "ALL" ||
        (r.status || "").toUpperCase() === statusFilter.toUpperCase();

      const startDate = r.startedAt ? new Date(r.startedAt) : null;
      const matchFrom = from ? (startDate ? startDate >= from : false) : true;
      const matchTo = to ? (startDate ? startDate <= to : false) : true;

      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [mappedRows, searchQuery, statusFilter, fromDate, toDate]);

  const planPriceNum = useMemo(() => {
    if (!plan?.price) return null;
    const n = Number(plan.price);
    return Number.isFinite(n) ? n : null;
  }, [plan]);

  const estimatedMRR = useMemo(() => {
    if (!planPriceNum) return null;
    return activeCount * planPriceNum;
  }, [activeCount, planPriceNum]);

  /* ---- Handlers ---- */
  const exportCsv = () => {
    const header = [
      "SubscriptionId",
      "UserId",
      "Name",
      "Email",
      "Plan",
      "Price",
      "Currency",
      "Status",
      "StartedAt",
      "EndsAt",
      "AutoRenew",
      "NextBillingAt",
      "Provider",
    ];
    const lines = filtered.map((r) =>
      [
        r.id,
        r.userId ?? "",
        `"${(r.userName || "").replaceAll('"', '""')}"`,
        `"${(r.userEmail || "").replaceAll('"', '""')}"`,
        `"${(r.planName || "").replaceAll('"', '""')}"`,
        r.price ?? "",
        r.currency || "",
        r.status || "",
        r.startedAt || "",
        r.endsAt || "",
        r.autoRenew ? "true" : "false",
        r.nextBillingAt || "",
        r.provider || "",
      ].join(",")
    );

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscriptions_active.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(n || 0);

  const handleCancelFromAdmin = async (row) => {
    if (!window.confirm(`Cancel membership for ${row.userName}?`)) return;
    try {
      const res = await subscriptionApi.cancel(row.userId, "Admin canceled via dashboard");
      if (!res.ok) {
        alert(res.userMessage || res.error || "Failed to cancel subscription.");
        return;
      }
      alert("Membership canceled.");
      // Refresh current page
      setPage((p) => p); // triggers useEffect
    } catch (e) {
      console.error(e);
      alert("Failed to cancel subscription.");
    }
  };

  return (
    <div className="md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Crown className="h-7 w-7 text-amber-500" />
            Membership Subscriptions
          </h1>
          <p className="text-sm text-gray-600">
            View and manage Babaji Ki Buti membership subscribers.
          </p>
        </div>
        <button
          onClick={() => setPage((p) => p)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 mb-6">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Active Members
            </span>
            <Users className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {metaLoading ? "—" : activeCount}
          </div>
          <p className="text-xs text-gray-500 mt-1">Across all plans</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Plan Price
            </span>
            <Crown className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {planPriceNum ? formatINR(planPriceNum) : "—"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {plan?.name || "Membership"} •{" "}
            {(plan?.interval || "MONTHLY").toLowerCase() === "yearly"
              ? "Yearly"
              : "Monthly"}{" "}
            billing
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Est. MRR
            </span>
            <ArrowDownUp className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {estimatedMRR ? formatINR(estimatedMRR) : "—"}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Approx monthly recurring revenue
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Rows (Current Page)
            </span>
            <CalendarRange className="h-4 w-4 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{rows.length}</div>
          <p className="text-xs text-gray-500 mt-1">
            {totalElements} total active subscriptions
          </p>
        </div>
      </div>

      {/* Filters + export */}
      <div className="rounded-xl border border-gray-200 bg-white mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-gray-200 p-4">
          {/* Search + status + date range */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by name, email or user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-9 pr-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <FilterDropdown
              label="Status"
              value={statusFilter}
              onChange={(val) => setStatusFilter(String(val))}
              options={STATUS_FILTER_OPTIONS}
            />

            <div className="flex items-center gap-2 text-xs md:text-sm">
              <span className="text-gray-500">Started between</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
              />
              <span className="text-gray-400">–</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-2 py-1 border border-gray-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Export + page size */}
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Rows per page</span>
              <FilterDropdown
                label="Rows per page"
                compact
                value={size}
                onChange={(val) => {
                  const n = Number(val) || 20;
                  setPage(0);
                  setSize(n);
                }}
                options={PAGE_SIZE_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Started
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ends
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Auto Renew
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                    Loading subscriptions…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-6 text-center text-gray-500">
                    No subscriptions found for current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-semibold text-gray-900">{row.userName}</div>
                      <div className="text-xs text-gray-500">
                        {row.userEmail || "—"} • ID: {row.userId ?? "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">{row.planName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {row.price != null ? formatINR(row.price) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                          statusBadgeClass(row.status)
                        )}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDateTime(row.startedAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {formatDateTime(row.endsAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {row.autoRenew ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                          ON
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                          OFF
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() =>
                            window.open(`/admin/users/${row.userId}/subscriptions`, "_blank")
                          }
                          className="text-xs rounded-lg border border-gray-200 px-2 py-1 text-gray-700 hover:bg-gray-50"
                        >
                          History
                        </button>
                        {row.status === "ACTIVE" && (
                          <button
                            onClick={() => handleCancelFromAdmin(row)}
                            className="text-xs rounded-lg border border-red-200 px-2 py-1 text-red-600 hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-200 p-4">
          <div className="text-xs md:text-sm text-gray-600">
            Page <span className="font-semibold">{page + 1}</span> of{" "}
            <span className="font-semibold">{totalPages}</span> •{" "}
            <span className="font-semibold">{totalElements}</span> total active
          </div>
          <div className="flex gap-2">
            <button
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
              className={cn(
                "px-3 py-1 rounded-lg border text-sm",
                canPrev
                  ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                  : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              )}
            >
              Prev
            </button>
            <button
              disabled={!canNext}
              onClick={() => canNext && setPage((p) => p + 1)}
              className={cn(
                "px-3 py-1 rounded-lg border text-sm",
                canNext
                  ? "bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                  : "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
              )}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
