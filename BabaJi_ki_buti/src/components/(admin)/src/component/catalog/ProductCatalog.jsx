// ProductCatalog.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, ChevronDown, Filter, Package, Eye, DollarSign, Box, MoreVertical } from 'lucide-react';
import { getAllProducts } from '../../../../../auth/product/products';

export default function ProductCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);

  const formatINR = (num) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
      .format(Number(num || 0));

  const stockBand = (n) => (n >= 50 ? 'High' : n >= 15 ? 'Medium' : 'Low');

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const h = Math.floor(diffMs / 3600000);
    const d = Math.floor(diffMs / 86400000);
    if (h < 1) return 'Just now';
    if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
    return `${d} day${d > 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (s) =>
    s === 'Published' ? 'bg-green-100 text-green-700'
      : s === 'Scheduled' ? 'bg-orange-100 text-orange-700'
      : 'bg-gray-100 text-gray-700';

  const getStockColor = (s) =>
    s === 'High' ? 'bg-green-100 text-green-700'
      : s === 'Medium' ? 'bg-orange-100 text-orange-700'
      : 'bg-red-100 text-red-700';

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setError(null);
        const apiItems = await getAllProducts();

        const rows = (apiItems || []).map(p => {
          const status = p.status === 'ACTIVE' ? 'Published' : (p.status || 'Draft');
          const category = Array.isArray(p.categories) && p.categories.length
            ? p.categories.map(c => c.categoryName).join(', ')
            : 'Uncategorized';
          const variantsCount = Array.isArray(p.variants) ? p.variants.length : 0;

          return {
            id: p.productId ?? p.id,
            name: p.title ?? p.name ?? p.slug,
            code: (p.slug || '').toUpperCase(),
            image: p.productImg || '/images/box.svg',
            status,
            category,
            variants: variantsCount,
            priceRange: p.mrp && p.sellingPrice
              ? `${formatINR(p.sellingPrice)} (MRP ${formatINR(p.mrp)})`
              : (p.sellingPrice ? `${formatINR(p.sellingPrice)}` : '—'),
            stock: stockBand(Number(p.stock ?? 0)),
            updated: new Date()
          };
        });

        setProducts(rows);
      } catch {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter(p => {
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All Status' || p.status === statusFilter;
      const matchesCategory = categoryFilter === 'All Categories' ||
        (p.category || '').split(',').map(s => s.trim()).includes(categoryFilter);
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  const stats = {
    totalProducts: products.length,
    totalChange: '',
    published: products.filter(p => p.status === 'Published').length,
    publishedPercent: products.length
      ? `${Math.round((products.filter(p => p.status === 'Published').length / products.length) * 100)}% of total products`
      : '—',
    lowStock: products.filter(p => p.stock === 'Low').length,
    lowStockNote: 'Requires attention',
    avgPrice: (() => {
      const nums = products
        .map(p => (p.priceRange?.match(/\₹?([\d,]+)/)?.[1] || '0'))
        .map(s => Number(s.replace(/,/g, '')))
        .filter(n => n > 0);
      if (!nums.length) return '—';
      const avg = Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(avg);
    })(),
    avgPriceNote: 'Across all variants'
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
            <DollarSign className="w-5 h-5 text-gray-400" />
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
        <div className="p-4 border-b border-gray-200 flex items-center space-x-4">
          <div className="flex items-center space-x-2 flex-1 max-w-md bg-gray-50 px-3 py-2 rounded-lg">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 outline-none text-sm text-gray-600 bg-transparent"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>All Status</option>
              <option>Published</option>
              <option>Draft</option>
              <option>Scheduled</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 pr-8 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option>All Categories</option>
              <option>Immunity & General Wellness</option>
              <option>Energy & Stamina</option>
              <option>Digestive Health</option>
              <option>Nutritional Supplements</option>
              <option>Men’s Health</option>
              <option>Women’s Health</option>
              <option>Weight Management</option>
            </select>
            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>

          <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            <span>More Filters</span>
          </button>
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
                      <td className="px-6 py-4 text-sm text-gray-500">{getRelativeTime(product.updated)}</td>
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
