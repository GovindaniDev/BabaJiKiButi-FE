// InventoryManagement.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Download,
  Plus,
  Package,
  RefreshCw,
} from "lucide-react";

// ✅ axios instance pointing to /api
import { app } from "../../../../../auth/httpAPI";

/**
 * Backend: GET /api/products/stock
 * Response: ApiResponse<Page<StockInventoryDto>>
 * StockInventoryDto:
 * {
 *   stockInventoryId: number,
 *   productId: number,
 *   productName: string,
 *   previousStock: number,
 *   addedStock: number,
 *   availableStock: number,
 *   statusAfter: "DRAFT" | "ACTIVE" | "INACTIVE" | "LOW_STOCK",
 *   addedAt: "2025-10-06T12:34:56+05:30"
 * }
 */

export default function InventoryManagement() {
  // -------- UI state --------
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filters (client-side)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [fromDate, setFromDate] = useState(""); // yyyy-mm-dd
  const [toDate, setToDate] = useState("");     // yyyy-mm-dd

  // pagination (server-provided)
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalElements, setTotalElements] = useState(0);

  // Optional local modal flag (referenced by a button)
  const [showAddModal, setShowAddModal] = useState(false);

  // -------- helpers --------
  const getId = (r) => r?.stockInventoryId ?? r?.id ?? `${r?.productId}-${r?.addedAt}`;
  const getTitle = (r) => r?.productName ?? "—";

  const formatDateTime = (iso) => {
    try {
      const d = new Date(iso);
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

  // Status options for filter dropdown
  const statusOptions = ["All Status", "ACTIVE", "LOW_STOCK", "INACTIVE", "DRAFT"];

  // ✅ Status badge (kept your color scheme)
  const StatusBadge = ({ value }) => {
    const base =
      "inline-flex items-center px-3 py-1 rounded-full text-xs md:text-sm font-medium";
    const s = (value || "").toUpperCase();

    if (s === "ACTIVE") {
      return <span className={`${base} bg-green-100 text-green-800`}>ACTIVE</span>;
    }
    if (s === "LOW_STOCK") {
      return <span className={`${base} bg-red-100 text-red-800`}>LOW_STOCK</span>;
    }
    if (s === "INACTIVE") {
      return <span className={`${base} bg-black text-white`}>INACTIVE</span>;
    }
    if (s === "DRAFT") {
      return <span className={`${base} bg-gray-200 text-gray-800`}>DRAFT</span>;
    }
    return <span className={`${base} bg-black text-white`}>{value || "—"}</span>;
  };

  // -------- fetch from backend --------
  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = { page, size };
      const { data } = await app.get("/products/stock", { params });

      // ApiResponse<Page<StockInventoryDto>>
      const content =
        data?.data?.content ??
        data?.content ??
        (Array.isArray(data) ? data : []);
      const total =
        data?.data?.totalElements ??
        data?.totalElements ??
        content.length;

      setRows(Array.isArray(content) ? content : []);
      setTotalElements(Number.isFinite(total) ? total : 0);
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
  const totalAvailableUnits = rows.reduce((sum, r) => sum + (r.availableStock ?? 0), 0);

  // Provide a defined value for “pendingReorders” (no API given)
  const pendingReorders = 0;

  const statusCounts = useMemo(() => {
    return rows.reduce((acc, r) => {
      const k = (r.statusAfter || "UNKNOWN").toUpperCase();
      acc[k] = (acc[k] || 0) + 1;
      return acc;
    }, {});
  }, [rows]);

  const activeCount = statusCounts.ACTIVE ?? 0;
  const lowStockCount = statusCounts.LOW_STOCK ?? 0;
  const draftCount = statusCounts.DRAFT ?? 0;
  const inactiveCount = statusCounts.INACTIVE ?? 0;

  // -------- client filters (on already loaded page) --------
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return rows.filter((r) => {
      const matchSearch =
        !q ||
        getTitle(r).toLowerCase().includes(q) ||
        String(r.productId ?? "").toLowerCase().includes(q);

      const matchStatus =
        statusFilter === "All Status" ||
        (r.statusAfter || "").toUpperCase() === statusFilter.toUpperCase();

      const addedDate = r.addedAt ? new Date(r.addedAt) : null;
      const matchFrom = fromDate ? (addedDate ? addedDate >= new Date(fromDate) : false) : true;
      const matchTo = toDate ? (addedDate ? addedDate <= new Date(`${toDate}T23:59:59`) : false) : true;

      return matchSearch && matchStatus && matchFrom && matchTo;
    });
  }, [rows, searchQuery, statusFilter, fromDate, toDate]);

  // ---- Pagination helpers ----
  const totalPages = Math.max(1, Math.ceil(totalElements / Math.max(1, size)));
  const canPrev = page > 0;
  const canNext = page + 1 < totalPages;

  return (
    <div className="p-2 md:p-0">
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">
            Track product stock changes and current availability
          </p>
        </div>
        <div className="flex gap-3">
          {/* Export current filtered view */}
          <button
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            onClick={() => {
              const header = [
                "Product",
                "ProductId",
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
                    r.productId ?? "",
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
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-colors"
            onClick={() => (window.location.href = "catalog/addProdPage")}
          >
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => (setShowAddModal(true), (window.location.href = "inventory/AddStockPage"))}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Movements</h3>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalMovements}</div>
          <p className="text-sm text-gray-500 mt-1">Rows in current page</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Added Units</h3>
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalAddedUnits}</div>
          <p className="text-sm text-gray-500 mt-1">Sum of addedStock</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Available Units</h3>
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalAvailableUnits}</div>
          <p className="text-sm text-gray-500 mt-1">Sum of availableStock</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Pending Reorders</h3>
            <RefreshCw className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{pendingReorders}</div>
          <p className="text-sm text-gray-500 mt-1">Need supplier approval</p>
        </div>
      </div>

      {/* Stock Movements */}
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
                placeholder="Search by product or ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
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
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rows per page:</span>
            <select
              value={size}
              onChange={(e) => {
                setPage(0);
                setSize(Number(e.target.value) || 20);
              }}
              className="px-2 py-1 border border-gray-200 rounded"
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Added At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                    Loading…
                  </td>
                </tr>
              ) : err ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-red-600">
                    {err}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                    No results.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={getId(r)} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{getTitle(r)}</div>
                      <div className="text-sm text-gray-500">
                        ID: {r.productId ?? "—"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {r.previousStock ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {r.addedStock ?? 0}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">
                      {r.availableStock ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge value={r.statusAfter} />
                    </td>
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
            Page <span className="font-medium">{page + 1}</span> of{" "}
            <span className="font-medium">{totalPages}</span> •{" "}
            <span className="font-medium">{totalElements}</span> total
          </div>
          <div className="flex gap-2">
            <button
              disabled={!canPrev}
              onClick={() => canPrev && setPage((p) => p - 1)}
              className={`px-3 py-1 border rounded ${
                canPrev ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
              }`}
            >
              Prev
            </button>
            <button
              disabled={!canNext}
              onClick={() => canNext && setPage((p) => p + 1)}
              className={`px-3 py-1 border rounded ${
                canNext ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
