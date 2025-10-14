// src/pages/PricingPromotions.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Search, Tag, Percent, Users, Calendar, Filter, Plus, MoreVertical, Package,
  CheckCircle, XCircle, Loader2
} from 'lucide-react';

/* ======================= CONFIG ======================= */
const API_BASE = '/api'; // change if your backend path differs

/* ======================= HELPERS ======================= */
const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
    .format(Number(n || 0));

const toDisplayRow = (c) => {
  const type =
    c.type === 'percentage' ? 'Percentage' :
    c.type === 'fixed' ? 'Fixed Amount' : 'Free Shipping';

  const discount =
    c.type === 'percentage' ? `${c.value}%` :
    c.type === 'fixed' ? formatINR(c.value) : 'Free Shipping';

  const usageLimit = c.usageTotalLimit == null ? '∞' : String(c.usageTotalLimit);
  const usage = `${c.usedTotal ?? 0}/${usageLimit}`;

  const now = new Date();
  const end = c.endAt ? new Date(c.endAt) : null;
  const expired = end ? end < now : false;
  const status = expired ? 'expired' : (c.status || 'inactive'); // active | inactive | expired

  return {
    id: c.id,
    code: c.code,
    type,
    discount,
    usage,
    status,
    validUntil: c.endAt ? c.endAt.slice(0, 10) : '—',
  };
};

const fetchCoupons = async ({ q = '', page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  params.set('page', page);
  params.set('limit', limit);
  const res = await fetch(`${API_BASE}/coupons?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to load coupons');
  return res.json(); // { items, page, limit, total }
};

const checkCode = async (code) => {
  const res = await fetch(
    `${API_BASE}/coupons/check-code?code=${encodeURIComponent(code.trim().toUpperCase())}`,
    { headers: { Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error('Failed to check code');
  return res.json(); // { unique: boolean, existingId?: string }
};

/* ======================= PAGE ======================= */
const PricingPromotions = () => {
  const [activeTab, setActiveTab] = useState('coupons');
  const [searchQuery, setSearchQuery] = useState('');

  // Server data
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check-code
  const [codeToCheck, setCodeToCheck] = useState('');
  const [codeResult, setCodeResult] = useState(null); // { unique, existingId? } | { error }
  const [checking, setChecking] = useState(false);

  // Demo stats (you can wire to /api/coupons/analytics later)
  const stats = {
    activeCoupons: 23,
    activeCouponsChange: '+5 from last month',
    discountRevenue: '₹1.2L',
    discountRevenueChange: 'This month',
    customersUsingCoupons: '1,247',
    customersPercentage: '43% of total customers',
    avgDiscount: '12.5%',
    avgDiscountChange: 'Across all promotions',
  };

  const promotionRules = [
    { id: 1, name: 'Buy 2 Get 1 Free', type: 'BOGO', conditions: 'Any 3 capsules', status: 'active', orders: 45, revenue: '₹22,500' },
    { id: 2, name: 'Free Shipping Over ₹500', type: 'Shipping', conditions: 'Cart total > ₹500', status: 'active', orders: 189, revenue: '₹94,500' },
  ];

  // Load coupons (debounced on search)
  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCoupons({ q: searchQuery, page: 1, limit: 20 });
        setRows((data.items || []).map(toDisplayRow));
      } catch (e) {
        setError(e.message || 'Error loading coupons');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Check code availability
  const onCheck = async () => {
    if (!codeToCheck.trim()) {
      setCodeResult({ unique: null });
      return;
    }
    setChecking(true);
    setCodeResult(null);
    try {
      const res = await checkCode(codeToCheck);
      setCodeResult(res);
    } catch (e) {
      setCodeResult({ error: e.message || 'Failed to check' });
    } finally {
      setChecking(false);
    }
  };

  const filteredCoupons = useMemo(() => {
    if (!searchQuery) return rows;
    return rows.filter((c) => c.code.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [rows, searchQuery]);

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing & Promotions</h1>
          <p className="text-gray-500 mt-1">Manage discount codes, promotional rules, and pricing strategies</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          onClick={() => (window.location.href = 'pricing/coupon/CouponPage')}
        >
          <Plus className="w-4 h-4" />
          Create Promotion
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Coupons</h3>
            <Tag className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.activeCoupons}</div>
          <p className="text-sm text-gray-500 mt-1">{stats.activeCouponsChange}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Discount Revenue</h3>
            <Percent className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.discountRevenue}</div>
          <p className="text-sm text-gray-500 mt-1">{stats.discountRevenueChange}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Customers Using Coupons</h3>
            <Users className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.customersUsingCoupons}</div>
          <p className="text-sm text-gray-500 mt-1">{stats.customersPercentage}</p>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Avg. Discount</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.avgDiscount}</div>
          <p className="text-sm text-gray-500 mt-1">{stats.avgDiscountChange}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-8 px-6">
            <button
              onClick={() => setActiveTab('coupons')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'coupons'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Coupons
            </button>
            <button
              onClick={() => setActiveTab('promotion-rules')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'promotion-rules'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Promotion Rules
            </button>
            <button
              onClick={() => setActiveTab('price-lists')}
              className={`py-4 border-b-2 font-medium transition-colors ${
                activeTab === 'price-lists'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Price Lists
            </button>
          </div>
        </div>

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">Discount Coupons</h2>
              <p className="text-sm text-gray-500 mt-1">Manage coupon codes and their usage</p>
            </div>

            {/* Search + Filter + Check Code */}
            <div className="px-6 pb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search coupons..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
              </div>

              {/* Check Code */}
              <div className="flex items-center gap-2">
                <input
                  value={codeToCheck}
                  onChange={(e) => setCodeToCheck(e.target.value)}
                  placeholder="Check code availability (e.g., NEW10)"
                  className="px-3 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={onCheck}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center gap-2"
                >
                  {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Check Code
                </button>
                {codeResult?.unique === true && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
                    <CheckCircle className="w-4 h-4" /> Available
                  </span>
                )}
                {codeResult?.unique === false && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800">
                    <XCircle className="w-4 h-4" /> Already exists
                  </span>
                )}
                {codeResult?.error && (
                  <span className="text-sm text-rose-600">{codeResult.error}</span>
                )}
              </div>
            </div>

            {/* Coupons Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Coupon Code</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valid Until</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 text-center text-gray-500">Loading coupons…</td>
                    </tr>
                  )}

                  {error && !loading && (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 text-center text-rose-600">{error}</td>
                    </tr>
                  )}

                  {!loading && !error && filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{coupon.code}</td>
                      <td className="px-6 py-4 text-gray-600">{coupon.type}</td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{coupon.discount}</td>
                      <td className="px-6 py-4 text-gray-600">{coupon.usage}</td>
                      <td className="px-6 py-4">
                        {coupon.status === 'active' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Active</span>
                        )}
                        {coupon.status === 'inactive' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Inactive</span>
                        )}
                        {coupon.status === 'expired' && (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-rose-100 text-rose-800">Expired</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{coupon.validUntil}</td>
                      <td className="px-6 py-4">
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {!loading && !error && filteredCoupons.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-6 text-center text-gray-500">No coupons found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Promotion Rules Tab */}
        {activeTab === 'promotion-rules' && (
          <div>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900">Promotion Rules</h2>
              <p className="text-sm text-gray-500 mt-1">Advanced promotional logic and conditions</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Rule Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Conditions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Orders</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Revenue Impact</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {promotionRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{rule.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-gray-100 text-gray-800">
                          {rule.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{rule.conditions}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">{rule.orders}</td>
                      <td className="px-6 py-4 text-gray-900 font-semibold">{rule.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Price Lists Tab */}
        {activeTab === 'price-lists' && (
          <div className="p-20">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Price Lists Yet</h3>
              <p className="text-gray-500 mb-6 max-w-md">
                Create price lists for different customer segments or regions
              </p>
              <button className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">
                <Plus className="w-5 h-5" />
                Create Price List
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingPromotions;
