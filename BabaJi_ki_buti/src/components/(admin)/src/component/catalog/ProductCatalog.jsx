import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  Menu,
  ChevronDown,
  MoreVertical,
  Filter,
  Package,
  Eye,
  TrendingUp,
  DollarSign,
  Box
} from 'lucide-react';

export default function ProductCatalog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);

  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Ashwagandha Capsules',
      code: 'ASH-CAP-500',
      image: '/images/box.svg',
      status: 'Published',
      category: 'Capsules',
      variants: 3,
      priceRange: '₹450 - ₹850',
      stock: 'High',
      updated: new Date(Date.now() - 2 * 3600000)
    },
    {
      id: 2,
      name: 'Triphala Powder',
      code: 'TRI-POW-100',
      image: '/images/box.svg',
      status: 'Draft',
      category: 'Powders',
      variants: 2,
      priceRange: '₹280 - ₹520',
      stock: 'Low',
      updated: new Date(Date.now() - 24 * 3600000)
    },
    {
      id: 3,
      name: 'Brahmi Oil',
      code: 'BRA-OIL-50',
      image: '/images/box.svg',
      status: 'Scheduled',
      category: 'Oils',
      variants: 1,
      priceRange: '₹650',
      stock: 'Medium',
      updated: new Date(Date.now() - 3 * 3600000)
    },
    {
      id: 4,
      name: 'Triphala Powder',
      code: 'TRI-POW-100',
      image: '/images/box.svg',
      status: 'Draft',
      category: 'Powders',
      variants: 2,
      priceRange: '₹280 - ₹520',
      stock: 'Low',
      updated: new Date(Date.now() - 24 * 3600000)
    },
    {
      id: 5,
      name: 'Brahmi Oil',
      code: 'BRA-OIL-50',
      image: '/images/box.svg',
      status: 'Scheduled',
      category: 'Oils',
      variants: 1,
      priceRange: '₹650',
      stock: 'Medium',
      updated: new Date(Date.now() - 3 * 3600000)
    }
  ]);

  const stats = {
    totalProducts: 247,
    totalChange: '+12 from last month',
    published: 189,
    publishedPercent: '76% of total products',
    lowStock: 23,
    lowStockNote: 'Requires attention',
    avgPrice: '₹485',
    avgPriceNote: 'Across all variants'
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Published': return 'bg-green-100 text-green-700';
      case 'Draft': return 'bg-gray-100 text-gray-700';
      case 'Scheduled': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStockColor = (stock) => {
    switch (stock) {
      case 'High': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-orange-100 text-orange-700';
      case 'Low': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All Status' || product.status === statusFilter;
    const matchesCategory = categoryFilter === 'All Categories' || product.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
   <>
     <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Product Catalog</h1>
            <p className="text-gray-600">Manage your Ayurveda products, variants, and inventory</p>
          </div>
          <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium transition-colors">
            <Plus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>

        {/* Stats Cards */}
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

        {/* Products Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          {/* Section Header */}
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
                <option>Capsules</option>
                <option>Powders</option>
                <option>Oils</option>
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>

            <button className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </button>
          </div>

          {/* Table */}
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
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center text-2xl">
                        <img src={product.image} alt="" />
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

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">No products found</p>
              <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
   </>
  );
}