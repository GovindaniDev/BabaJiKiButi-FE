import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Plus,
  Package,
  TrendingUp,
  RefreshCw,
  Filter,
} from "lucide-react";

// If you already have an axios instance like in AddStock.jsx, reuse it:
import { app } from '../../../../../auth/httpAPI';

/**
 * Expected backend shape (one row per stock movement):
 * {
 *   stockInventoryId: number,
 *   product: { productId, title, slug, sku }, // sku optional depending on your Product
 *   previousStock: number,
 *   addedStock: number,
 *   availableStock: number,
 *   statusAfter: "LOW" | "ADEQUATE" | "OUT_OF_STOCK" | ... (ProductStatus enum),
 *   addedAt: "2025-10-06T12:34:56+05:30"
 * }
 */

export default function InventoryManagement() {
  // -------- UI state --------
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd
  const [toDate, setToDate] = useState("");     // yyyy-mm-dd

  // pagination (works even if your API returns a flat list)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // -------- helpers --------
  const getId = (r) => r?.stockInventoryId ?? r?.id;
  const getTitle = (r) =>
    r?.product?.title ?? r?.product?.name ?? r?.productName ?? "—";
  const getSku = (r) => r?.product?.sku ?? r?.product?.slug ?? "—";

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
      // Show local date & time in a compact format
      return d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso ?? "—";
    }
  };

  const statusBadge = (status) => {
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium";
    switch ((status || "").toUpperCase()) {
      case "LOW":
      case "LOW_STOCK":
        return <span className={`${base} bg-red-100 text-red-800`}>Low</span>;
      case "OUT_OF_STOCK":
        return (
          <span className={`${base} bg-gray-200 text-gray-800`}>
            Out of stock
          </span>
        );
      case "ADEQUATE":
      case "IN_STOCK":
      default:
        return (
          <span className={`${base} bg-green-100 text-green-800`}>
            Adequate
          </span>
        );
    }
  };

  // -------- fetch from backend --------
  const fetchData = async () => {
    setLoading(true);
    setErr("");

    try {
      // Adjust this endpoint to your actual mapping (examples):
      // - GET /api/stock-inventory?page=0&size=20&status=LOW&from=2025-10-01&to=2025-10-07&search=ashwa
      // - or GET /api/stock-inventory (flat list)
      const params = {
        page,
        size,
      };

      if (statusFilter && statusFilter !== "All Status") {
        params.status = statusFilter;
      }
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      if (searchQuery) params.search = searchQuery;

      const { data } = await app.get("/api/stock-inventory", { params });

      // Support both pageable and non-pageable responses
      if (Array.isArray(data)) {
        setRows(data);
        setTotalElements(data.length);
      } else if (Array.isArray(data?.content)) {
        setRows(data.content);
        setTotalElements(data.totalElements ?? data.content.length);
      } else if (Array.isArray(data?.data?.content)) {
        // if you wrap responses like { data: { content: [], totalElements: n } }
        setRows(data.data.content);
        setTotalElements(data.data.totalElements ?? data.data.content.length);
      } else {
        // last resort: assume { data: [] }
        const list = Array.isArray(data?.data) ? data.data : [];
        setRows(list);
        setTotalElements(list.length);
      }
    } catch (e) {
      console.error(e);
      setErr(
        e?.response?.data?.message ||
          "Failed to load stock inventory. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size]);

  // -------- derived stats --------
  const totalMovements = rows.length;
  const totalAddedUnits = rows.reduce((sum, r) => sum + (r.addedStock ?? 0), 0);

  const statusCounts = useMemo(() => {
    const counts = rows.reduce((acc, r) => {
      const k = (r.statusAfter || "UNKNOWN").toUpperCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
    return counts;
  }, [rows]);

  // -------- client filters (on already loaded page) --------
  const filtered = rows.filter((r) => {
    const q = searchQuery.trim().toLowerCase();
    const matchSearch =
      !q ||
      getTitle(r).toLowerCase().includes(q) ||
      String(getSku(r)).toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "All Status" ||
      (r.statusAfter || "").toUpperCase() === statusFilter.toUpperCase();

    const addedDate = r.addedAt ? new Date(r.addedAt) : null;
    const matchFrom = fromDate ? addedDate >= new Date(fromDate) : true;
    const matchTo = toDate
      ? addedDate <= new Date(`${toDate}T23:59:59`)
      : true;

    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const statusOptions = useMemo(() => {
    const unique = new Set(
      rows
        .map((r) => (r.statusAfter || ""))
        .filter(Boolean)
        .map((s) => s.toUpperCase())
    );
    return ["All Status", ...Array.from(unique)];
  }, [rows]);

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">
            Track product stock changes and current availability
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            onClick={() => {
              // Simple CSV export of currently filtered rows
              const header = [
                "Product",
                "SKU",
                "Previous",
                "Added",
                "Available",
                "StatusAfter",
                "AddedAt",
              ];
              const csv = [
                header.join(","),
                ...filtered.map((r) =>
                  [
                    `"${getTitle(r).replaceAll('"', '""')}"`,
                    `"${String(getSku(r)).replaceAll('"', '""')}"`,
                    r.previousStock ?? 0,
                    r.addedStock ?? 0,
                    r.availableStock ?? 0,
                    r.statusAfter ?? "",
                    r.addedAt ?? "",
                  ].join(",")
                ),
              ].join("\n");

              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "stock_inventory.csv";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4" />
            Export
          </button>

          <button
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-colors"
            onClick={() => (window.location.href = "catalog/addProdPage")}
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => (window.location.href = "inventory/addStock")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Movements</h3>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalMovements}</div>
          <p className="text-sm text-gray-500 mt-1">Rows loaded</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Units Added</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalAddedUnits}</div>
          <p className="text-sm text-gray-500 mt-1">Sum of addedStock</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Adequate</h3>
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {statusCounts.ADEQUATE ?? statusCounts.IN_STOCK ?? 0}
          </div>
          <p className="text-sm text-gray-500 mt-1">Latest status after add</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Low / OOS</h3>
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {(statusCounts.LOW ?? statusCounts.LOW_STOCK ?? 0) +
              (statusCounts.OUT_OF_STOCK ?? 0)}
          </div>
          <p className="text-sm text-gray-500 mt-1">Needs attention</p>
        </div>
      </div>

      {/* Inventory Table Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Stock Movements</h2>
          <p className="text-sm text-gray-500 mt-1">
            previousStock → addedStock → availableStock
          </p>
        </div>

        {/* Search & Filters */}
        <div className="p-4 border-b border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by product or SKU…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s === "All Status" ? s : s.replaceAll("_", " ")}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg"
              />
              <span className="text-gray-400">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>

            <button
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              onClick={() => {
                setPage(0);
                fetchData();
              }}
            >
              <Filter className="w-4 h-4" />
              Apply
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={size}
              onChange={(e) => {
                setPage(0);
                setSize(Number(e.target.value) || 20);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {err && (
            <div className="p-4 text-red-700 bg-red-50 border-b border-red-200">
              {err}
            </div>
          )}
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Previous
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Available
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status After
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Added At
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td className="px-6 py-6 text-gray-500" colSpan={6}>
                    Loading…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-6 py-6 text-gray-500" colSpan={6}>
                    No rows match your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={getId(r)} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {getTitle(r)}
                      </div>
                      <div className="text-sm text-gray-500">{getSku(r)}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {r.previousStock ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {r.addedStock ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {r.availableStock ?? 0}
                    </td>
                    <td className="px-6 py-4">{statusBadge(r.statusAfter)}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {formatDateTime(r.addedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{page + 1}</span>{" "}
            of{" "}
            <span className="font-medium">
              {Math.max(1, Math.ceil(totalElements / size))}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="px-3 py-1.5 border rounded disabled:opacity-50"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>
            <button
              className="px-3 py-1.5 border rounded disabled:opacity-50"
              disabled={(page + 1) * size >= totalElements}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
