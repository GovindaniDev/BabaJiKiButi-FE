// ProductCatalog.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Search,
  Plus,
  ChevronDown,
  Package,
  Eye,
  Box,
  MoreVertical,
  IndianRupee,
  Check,
  Filter as FilterIcon,
} from "lucide-react";
import { getAllProducts } from "../../../../../auth/product/products";

/* ---------------------- helpers ---------------------- */
const formatINR0 = (num) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number(num || 0));

// Parse LocalDateTime from string | number | Date | array | object
const parseAnyDate = (v) => {
  if (v == null) return null;

  if (typeof v === "number") {
    const ms = v < 1e12 ? v * 1000 : v;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : v;

  if (Array.isArray(v)) {
    const [Y, M = 1, D = 1, h = 0, m = 0, s = 0, nanos = 0] = v;
    const ms = Math.floor((nanos || 0) / 1e6);
    const d = new Date(Y, (M || 1) - 1, D || 1, h || 0, m || 0, s || 0, ms);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof v === "object") {
    const Y = v.year, M = v.month, D = v.day || v.dayOfMonth || v.day_of_month;
    const h = v.hour ?? 0, m = v.minute ?? 0, s = v.second ?? 0, nanos = v.nano ?? 0;
    if (Y && M && D) {
      const ms = Math.floor((nanos || 0) / 1e6);
      const d = new Date(Y, M - 1, D, h, m, s, ms);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }

  if (typeof v === "string") {
    let s = v.trim();
    if (!s) return null;
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s)) s = s.replace(" ", "T");
    s = s.replace(/(\.\d{3})\d+$/, "$1");
    let d = new Date(s);
    if (!Number.isNaN(d.getTime())) return d;
    if (!/[zZ]|[+\-]\d{2}:?\d{2}$/.test(s)) {
      d = new Date(s + "Z");
      if (!Number.isNaN(d.getTime())) return d;
    }
  }
  return null;
};

const toDate = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
};

const getRelativeTime = (input) => {
  const date = toDate(input);
  if (!date) return "—";
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 60000) return "Just now";
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins} min${mins > 1 ? "s" : ""} ago`;
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(diffMs / 86400000);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const fmtAbsDateTime = (input) => {
  const d = toDate(input);
  if (!d) return "";
  return d.toLocaleString();
};

const stockBand = (n) => (n >= 50 ? "High" : n >= 15 ? "Medium" : "Low");

const getStatusColor = (s) =>
  s === "Published" ? "bg-green-100 text-green-700"
    : s === "Scheduled" ? "bg-orange-100 text-orange-700"
    : "bg-gray-100 text-gray-700";

const getStockColor = (s) =>
  s === "High" ? "bg-green-100 text-green-700"
    : s === "Medium" ? "bg-orange-100 text-orange-700"
    : "bg-red-100 text-red-700";


/* ---------------------- filter option lists ---------------------- */

const STATUS_OPTIONS = [
  {
    value: "All Status",
    label: "All status",
    chipClass: "bg-slate-100 text-slate-700",
  },
  {
    value: "Published",
    label: "Published only",
    chipClass: "bg-emerald-100 text-emerald-800",
  },
  {
    value: "Draft",
    label: "Draft only",
    chipClass: "bg-yellow-100 text-yellow-800",
  },
  {
    value: "Scheduled",
    label: "Scheduled only",
    chipClass: "bg-blue-100 text-blue-800",
  },
];

const CATEGORY_OPTIONS = [
  {
    value: "All Categories",
    label: "All categories",
    chipClass: "bg-slate-100 text-slate-700",
  },
  {
    value: "Immunity & General Wellness",
    label: "Immunity & General Wellness",
    chipClass: "bg-emerald-50 text-emerald-800",
  },
  {
    value: "Energy & Stamina",
    label: "Energy & Stamina",
    chipClass: "bg-orange-50 text-orange-800",
  },
  {
    value: "Digestive Health",
    label: "Digestive Health",
    chipClass: "bg-teal-50 text-teal-800",
  },
  {
    value: "Nutritional Supplements",
    label: "Nutritional Supplements",
    chipClass: "bg-indigo-50 text-indigo-800",
  },
  {
    value: "Men’s Health",
    label: "Men’s Health",
    chipClass: "bg-blue-50 text-blue-800",
  },
  {
    value: "Women’s Health",
    label: "Women’s Health",
    chipClass: "bg-pink-50 text-pink-800",
  },
  {
    value: "Weight Management",
    label: "Weight Management",
    chipClass: "bg-amber-50 text-amber-800",
  },
];

/* ---------------------- fancy dropdown component ---------------------- */

function FilterDropdown({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const current = options.find((o) => o.value === value) || options[0];

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Trigger pill */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/70 px-3 py-2 text-xs md:text-sm text-emerald-900 shadow-sm hover:bg-emerald-100/90 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1"
      >
        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wide text-emerald-700/80">
          <FilterIcon className="h-3 w-3" />
          {label}
        </span>

        <span
          className={`inline-flex items-center rounded-xl px-2 py-1 text-[11px] font-medium ${current?.chipClass}`}
        >
          {current?.value}
        </span>

        <ChevronDown
          className={`h-4 w-4 text-emerald-700/70 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-emerald-100 bg-white/95 backdrop-blur shadow-xl ring-1 ring-emerald-100/70 z-20">
          <div className="px-3 pt-3 pb-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700/70">
              {label} filter
            </p>
          </div>
          <div className="max-h-64 overflow-y-auto pb-2">
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 text-sm flex items-center justify-between gap-3 text-left transition-colors ${
                    active
                      ? "bg-emerald-50 text-emerald-900"
                      : "hover:bg-emerald-50/70 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    
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

/* ---------------------- component ---------------------- */
export default function ProductCatalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const apiItems = await getAllProducts();

        if (import.meta.env?.DEV) {
          console.log("[Catalog] /products/all raw:", apiItems);
        }

        const rows = (apiItems || []).map((p, idx) => {
          const status = p.status === "ACTIVE" ? "Published" : (p.status || "Draft");
          const category =
            Array.isArray(p.categories) && p.categories.length
              ? p.categories
                  .map((c) => c.categoryName || c.name || c.title || "")
                  .filter(Boolean)
                  .join(", ")
              : "Uncategorized";
          const variantsCount = Array.isArray(p.variants) ? p.variants.length : 0;

          // Collect raw timestamp candidates to log
          const rawUpdated =
            p.updatedAt ?? p.updated_at ?? p.audit?.updatedAt ?? p.audit?.updated_at ?? null;
          const rawCreated =
            p.createdAt ?? p.created_at ?? p.audit?.createdAt ?? p.audit?.created_at ?? null;

          const updatedAt = parseAnyDate(rawUpdated ?? rawCreated);

          if (import.meta.env?.DEV) {
            console.log(`[Catalog] row #${idx}`, {
              id: p.productId ?? p.id,
              slug: p.slug,
              title: p.title ?? p.name,
              rawUpdated,
              rawCreated,
              parsedUpdated: updatedAt,
            });
            if (!updatedAt) {
              console.warn(`[Catalog] ⚠️ No parsable date for`, {
                id: p.productId ?? p.id,
                slug: p.slug,
                rawUpdated,
                rawCreated,
              });
            }
          }

          return {
            id: p.productId ?? p.id,
            name: p.title ?? p.name ?? p.slug,
            code: (p.slug || "").toUpperCase(),
            image: p.productImg || "/images/box.svg",
            status,
            category,
            variants: variantsCount,
            priceRange:
              p.mrp && p.sellingPrice
                ? `${formatINR0(p.sellingPrice)} (MRP ${formatINR0(p.mrp)})`
                : p.sellingPrice
                ? `${formatINR0(p.sellingPrice)}`
                : "—",
            stock: stockBand(Number(p.stock ?? 0)),
            updated: updatedAt,
          };
        });

        setProducts(rows);
      } catch (e) {
        console.error("[Catalog] Failed to load products", e);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.code || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "All Status" || p.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All Categories" ||
        (p.category || "")
          .split(",")
          .map((s) => s.trim())
          .includes(categoryFilter);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  const stats = {
    totalProducts: products.length,
    totalChange: "",
    published: products.filter((p) => p.status === "Published").length,
    publishedPercent: products.length
      ? `${Math.round(
          (products.filter((p) => p.status === "Published").length / products.length) * 100
        )}% of total products`
      : "—",
    lowStock: products.filter((p) => p.stock === "Low").length,
    lowStockNote: "Requires attention",
    avgPrice: (() => {
      const nums = products
        .map((p) => p?.priceRange)
        .map((pr) => {
          const m = pr?.match(/([\d,]+)/);
          const s = m?.[1] || "0";
          return Number(s.replace(/,/g, ""));
        })
        .filter((n) => n > 0);
      if (!nums.length) return "—";
      const avg = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
      return formatINR0(avg);
    })(),
    avgPriceNote: "Across all variants",
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Product Catalog</h1>
          <p className="text-gray-600">Manage your Ayurveda products, variants, and inventory</p>
        </div>
        <button
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-colors"
          onClick={() => (window.location.href = "catalog/addProdPage")}
        >
          <Plus className="w-5 h-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Total Products</span>
            <Package className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
          <div className="text-sm text-green-600">{stats.totalChange}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Published</span>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.published}</div>
          <div className="text-sm text-gray-500">{stats.publishedPercent}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Low Stock</span>
            <Box className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.lowStock}</div>
          <div className="text-sm text-red-600">{stats.lowStockNote}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Avg. Price</span>
            <IndianRupee className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.avgPrice}</div>
          <div className="text-sm text-gray-500">{stats.avgPriceNote}</div>
        </div>
      </div>

      {/* Products */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Products</h2>
          <p className="text-sm text-gray-600">Search and filter your product catalog</p>
        </div>

      {/* Filters */}
<div className="p-4 border-b border-gray-200 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  {/* Search */}
  <div className="flex items-center space-x-2 flex-1 max-w-md bg-gray-50 px-3 py-2 rounded-xl border border-gray-200 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
    <Search className="w-4 h-4 text-gray-400" />
    <input
      type="text"
      placeholder="Search products by name or code…"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="flex-1 outline-none text-sm text-gray-700 bg-transparent placeholder:text-gray-400"
    />
  </div>

  {/* Dropdown filters */}
  <div className="flex items-center gap-2 md:gap-3 justify-end">
    <FilterDropdown
      label="Status"
      value={statusFilter}
      onChange={setStatusFilter}
      options={STATUS_OPTIONS}
    />
    <FilterDropdown
      label="Category"
      value={categoryFilter}
      onChange={setCategoryFilter}
      options={CATEGORY_OPTIONS}
    />
  </div>
</div>


        {/* Table / Loading / Error */}
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading products…</div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Variants</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Price Range</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <img src={product.image} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.code}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{product.variants} variants</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.priceRange}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStockColor(product.stock)}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <span title={fmtAbsDateTime(product.updated)}>
                          {getRelativeTime(product.updated)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No products found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
