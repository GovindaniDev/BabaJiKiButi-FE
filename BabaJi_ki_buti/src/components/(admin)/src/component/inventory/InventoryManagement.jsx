import React, { useState } from 'react';
import { Search, Download, Plus, Package, AlertTriangle, TrendingUp, RefreshCw, Filter } from 'lucide-react';

const InventoryManagement = () => {
  const [inventoryData, setInventoryData] = useState([
    {
      id: 1,
      name: 'Ashwagandha Capsules',
      sku: 'ASH-CAP-500',
      location: 'Main Warehouse',
      onHand: 145,
      reserved: 23,
      available: 122,
      threshold: 50,
      status: 'adequate'
    },
    {
      id: 2,
      name: 'Triphala Powder',
      sku: 'TRI-POW-100',
      location: 'Main Warehouse',
      onHand: 23,
      reserved: 8,
      available: 15,
      threshold: 30,
      status: 'low'
    },
    {
      id: 3,
      name: 'Brahmi Oil',
      sku: 'BRA-OIL-50',
      location: 'Cold Storage',
      onHand: 67,
      reserved: 12,
      available: 55,
      threshold: 25,
      status: 'adequate'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [locationFilter, setLocationFilter] = useState('All Locations');
  const [showAddModal, setShowAddModal] = useState(false);

  // Calculate statistics
  const totalSKUs = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => item.available < item.threshold).length;
  const totalStockValue = inventoryData.reduce((sum, item) => sum + (item.onHand * 100), 0) / 100;
  const pendingReorders = inventoryData.filter(item => item.status === 'low').length;

  // Filter inventory
  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = locationFilter === 'All Locations' || item.location === locationFilter;
    return matchesSearch && matchesLocation;
  });

  const getLocations = () => {
    const locations = ['All Locations', ...new Set(inventoryData.map(item => item.location))];
    return locations;
  };

  return (
    <div>
        {/* Page Title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-gray-500 mt-1">Track stock levels, set thresholds, and manage reorder rules</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button 
              onClick={() => {setShowAddModal(true), window.location.href="inventory/AddStockPage"}}
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
              <h3 className="text-sm font-medium text-gray-600">Total SKUs</h3>
              <Package className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{totalSKUs}</div>
            <p className="text-sm text-gray-500 mt-1">Across 3 locations</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Low Stock Items</h3>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-yellow-600">{lowStockItems}</div>
            <p className="text-sm text-gray-500 mt-1">Below threshold</p>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Stock Value</h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900">₹{totalStockValue.toFixed(2)}L</div>
            <p className="text-sm text-gray-500 mt-1">Total inventory value</p>
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

        {/* Inventory Table Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Inventory Levels</h2>
            <p className="text-sm text-gray-500 mt-1">Monitor stock levels and manage thresholds</p>
          </div>

          {/* Search and Filters */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {getLocations().map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              More Filters
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">On Hand</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Reserved</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Available</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Threshold</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.map(item => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.sku}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                        {item.location}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{item.onHand}</td>
                    <td className="px-6 py-4 text-gray-600">{item.reserved}</td>
                    <td className="px-6 py-4 text-gray-900 font-semibold">{item.available}</td>
                    <td className="px-6 py-4 text-gray-600">{item.threshold}</td>
                    <td className="px-6 py-4">
                      {item.status === 'adequate' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Adequate
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Low Stock
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
};

export default InventoryManagement;