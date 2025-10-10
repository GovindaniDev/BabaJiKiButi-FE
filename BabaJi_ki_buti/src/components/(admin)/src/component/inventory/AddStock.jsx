// src/page/inventory/AddStock.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronsUpDown, Package, Search, Loader2, X } from "lucide-react";
import { app } from "../../../../../auth/httpAPI"; // ⬅️ If your file is httpApp.js, change to "../../../../../auth/httpApp"

// ---------- tolerant accessors so UI always shows proper fields ----------
const getId = (p) => p?.productId ?? p?.id;

// Prefer true “name” keys; extend this list if your DTO uses a different one.
const getName = (p) =>
  p?.name ??
  p?.productName ??
  p?.title ??
  p?.productTitle ??
  p?.displayName ??
  p?.label ??
  p?.product_name ??
  p?.product_title ??
  "";

const getSlug = (p) => p?.slug ?? p?.productSlug ?? p?.product_slug ?? "";

const getStock = (p) =>
  typeof p?.currentStock === "number"
    ? p.currentStock
    : typeof p?.stock === "number"
    ? p.stock
    : typeof p?.quantity === "number"
    ? p.quantity
    : 0;

export default function AddStock() {
  const [open, setOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockToAdd, setStockToAdd] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // server data
  const [allProducts, setAllProducts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [loadError, setLoadError] = useState("");

  // toasts
  const [toast, setToast] = useState(null);
  const showToast = (title, description, variant = "default") => {
    setToast({ title, description, variant });
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => setToast(null), 3200);
  };

  // ---- fetch ALL products on mount ----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingAll(true);
        setLoadError("");
        // GET /api/products/all (proxied as /api in httpAPI/httpApp)
        const res = await app.get("/products/all");
        const list = res?.data?.data ?? res?.data ?? [];
        if (!alive) return;
        setAllProducts(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!alive) return;
        const msg =
          err?.response?.data?.data?.message ||
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Failed to load products.";
        setLoadError(msg);
      } finally {
        if (alive) setLoadingAll(false);
      }
    })();
    return () => {
      alive = false;
      window.clearTimeout(showToast._t);
    };
  }, []);

  // ---- client-side filtering by product NAME (primary) or SLUG (secondary) ----
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allProducts;
    return allProducts.filter((p) => {
      const n = (getName(p) || "").toLowerCase();
      const s = (getSlug(p) || "").toLowerCase();
      return n.includes(q) || s.includes(q);
    });
  }, [allProducts, searchQuery]);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setStockToAdd("");
    setOpen(false);
    setSearchQuery("");
  };

  const handleAddStock = async () => {
    const qty = parseInt(stockToAdd, 10);
    if (!selectedProduct || !qty || qty <= 0) {
      showToast("Invalid Input", "Please select a product and enter a valid stock quantity.", "destructive");
      return;
    }

    try {
      const id = getId(selectedProduct);
      await app.post(`/products/${id}/stock`, { quantity: qty });

      const newStock = getStock(selectedProduct) + qty;
      showToast(
        "Stock Added Successfully",
        `Added ${qty} units to ${getName(selectedProduct) || "product"}. New stock: ${newStock}`,
        "success"
      );

      // optimistic update
      setSelectedProduct((prev) =>
        prev ? { ...prev, currentStock: newStock, stock: newStock, quantity: newStock } : prev
      );
      setAllProducts((list) =>
        list.map((p) => (getId(p) === id ? { ...p, currentStock: newStock, stock: newStock, quantity: newStock } : p))
      );
      setStockToAdd("");
    } catch (err) {
      const msg =
        err?.response?.data?.data?.message ||
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to add stock.";
      showToast("Add Stock Failed", msg, "destructive");
    }
  };

  const newStockPreview = useMemo(() => {
    const base = getStock(selectedProduct || {});
    const qty = parseInt(stockToAdd, 10);
    return qty > 0 ? base + qty : null;
  }, [selectedProduct, stockToAdd]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            toast.variant === "destructive" ? "bg-red-500 text-white" : "bg-green-600 text-white"
          }`}
        >
          <div className="font-semibold">{toast.title}</div>
          <div className="text-sm">{toast.description}</div>
        </div>
      )}

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-8 w-8 text-green-600" />
            Add Stock
          </h1>
          <p className="text-gray-600">Search and select a product to add stock to your inventory</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Select Product</h2>
            <p className="text-sm text-gray-600">Search from the product list using product name or slug</p>
          </div>

          <div className="space-y-6">
            {/* Combobox */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Product</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                >
                  {selectedProduct ? (
                    <span className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      {/* always show NAME as the main label */}
                      {getName(selectedProduct) || "[No name]"}
                    </span>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Search product...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 text-gray-400" />
                </button>

                {open && (
                  <div
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto"
                    role="listbox"
                  >
                    {/* Top bar */}
                    <div className="p-2 border-b border-gray-200 flex items-center gap-2">
                      <Search className="h-4 w-4 text-gray-400" />
                      <input
                        autoFocus
                        type="text"
                        placeholder="Type name or slug…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-2 py-2 rounded-md focus:outline-none"
                        aria-label="Search product by name or slug"
                      />
                      {searchQuery ? (
                        <button onClick={() => setSearchQuery("")} className="p-1 rounded hover:bg-gray-100" title="Clear">
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      ) : null}
                    </div>

                    {/* Results */}
                    <div className="py-1">
                      {loadingAll && (
                        <div className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading products…
                        </div>
                      )}

                      {loadError && !loadingAll && (
                        <div className="px-4 py-3 text-sm text-red-600">{loadError}</div>
                      )}

                      {!loadingAll && !loadError && filteredProducts.length === 0 && (
                        <div className="px-4 py-3 text-sm text-gray-500">No products found.</div>
                      )}

                      {!loadingAll &&
                        !loadError &&
                        filteredProducts.map((product) => {
                          const pid = getId(product);
                          const isSel = selectedProduct && getId(selectedProduct) === pid;
                          return (
                            <div
                              key={pid}
                              onClick={() => handleProductSelect(product)}
                              className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-start gap-2"
                              role="option"
                              aria-selected={isSel}
                            >
                              <Check className={`h-4 w-4 mt-1 ${isSel ? "opacity-100" : "opacity-0"}`} />
                              <div className="flex flex-col">
                                {/* NAME on the first line */}
                                <span className="font-medium text-gray-900">{getName(product) || "[No name]"}</span>
                                {/* Slug as secondary metadata */}
                                <span className="text-xs text-gray-500">Slug: {getSlug(product) || "—"}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Product details */}
            {selectedProduct && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Product Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Product Name</p>
                    <p className="font-medium text-gray-900">{getName(selectedProduct) || "[No name]"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Slug</p>
                    <p className="font-medium text-gray-900">{getSlug(selectedProduct) || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Stock</p>
                    <p className="text-2xl font-bold text-green-600">{getStock(selectedProduct)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Add stock form */}
            {selectedProduct && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Stock Quantity to Add</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter quantity to add"
                    value={stockToAdd}
                    onChange={(e) => setStockToAdd(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  {newStockPreview !== null && (
                    <p className="text-sm text-gray-600">
                      New stock will be: <span className="font-semibold text-green-600">{newStockPreview}</span>
                    </p>
                  )}
                </div>

                <button
                  onClick={handleAddStock}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-md flex items-center justify-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Add Stocks
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
