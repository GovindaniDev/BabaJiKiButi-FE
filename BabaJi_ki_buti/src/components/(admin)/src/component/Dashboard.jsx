import React, { useState, useEffect } from 'react';
import {
  DollarSign, ShoppingCart, Users, TrendingUp, Package,Upload, Tag, Megaphone, Plus, Check, AlertTriangle, Info, XCircle
} from 'lucide-react';

/*  ALL ORIGINAL LOGIC UNTOUCHED  */
export default function DashboardBody() {
  const [metrics, setMetrics] = useState([
    { id: 1, title: 'Revenue', value: 245000, change: 12.5, period: 'Today', icon: DollarSign, isPositive: true, prefix: '₹' },
    { id: 2, title: 'Orders', value: 156, change: 8.2, period: 'Today', icon: ShoppingCart, isPositive: true },
    { id: 3, title: 'Customers', value: 2847, change: 5.1, period: 'Active', icon: Users, isPositive: true },
    { id: 4, title: 'Conversion Rate', value: 3.4, change: -0.2, period: 'Last 7 days', icon: TrendingUp, isPositive: false, suffix: '%' }
  ]);

  const [alerts] = useState([
    { id: 1, type: 'warning', title: 'Low Stock Alert', description: '5 products below threshold', badge: 'warning', dismissed: false },
    { id: 2, type: 'info', title: 'New Orders', description: '12 orders awaiting fulfillment', badge: 'info', dismissed: false },
    { id: 3, type: 'error', title: 'Payment Failed', description: '3 payments need attention', badge: 'error', dismissed: false }
  ]);

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, title: 'Order #12345 was placed', description: 'Customer: Raj Sharma • 2 items • ₹1,250', time: new Date(Date.now() - 2 * 60000), color: 'green', type: 'order' },
    { id: 2, title: 'Inventory alert for Ashwagandha', description: 'Stock level: 12 units remaining', time: new Date(Date.now() - 5 * 60000), color: 'orange', type: 'inventory' },
    { id: 3, title: 'New customer registration', description: 'Priya Patel from Mumbai', time: new Date(Date.now() - 8 * 60000), color: 'green', type: 'customer' }
  ]);

  useEffect(() => {
    const id = setInterval(() => {
      setMetrics(prev =>
        prev.map(m => ({
          ...m,
          value: m.id === 1 ? m.value + Math.floor(Math.random() * 5000) : m.value + Math.floor(Math.random() * 10)
        }))
      );
      if (Math.random() > 0.7) {
        const newAct = [
          { title: `Order #${Math.floor(Math.random() * 90000) + 10000} was placed`, description: `Customer: ${['Amit', 'Priya', 'Rahul'][Math.floor(Math.random() * 3)]} • ${Math.floor(Math.random() * 5) + 1} items • ₹${Math.floor(Math.random() * 5000) + 500}`, color: 'green', type: 'order' },
          { title: 'New customer registration', description: `${['Neha', 'Vikram', 'Anjali'][Math.floor(Math.random() * 3)]} from ${['Delhi', 'Mumbai', 'Bangalore'][Math.floor(Math.random() * 3)]}`, color: 'green', type: 'customer' }
        ][Math.floor(Math.random() * 2)];
        setRecentActivity(prev => [{ id: Date.now(), ...newAct, time: new Date() }, ...prev.slice(0, 9)]);
      }
    }, 10000);
    return () => clearInterval(id);
  }, []);

  const formatNumber = (n, pre = '', suf = '') => `${pre}${n.toLocaleString('en-IN')}${suf}`;
  const getRelativeTime = (d) => {
    const diff = Date.now() - d;
    const min = Math.floor(diff / 60000);
    const hr = Math.floor(diff / 3600000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min} min ago`;
    if (hr < 24) return `${hr} hour${hr > 1 ? 's' : ''} ago`;
    return d.toLocaleDateString();
  };

  const quickActions = [
    { title: 'Create Product', icon: Package, desc: 'Add new product to catalog' },
    { title: 'Create Coupon', icon: Tag, desc: 'Set up discount code' },
    { title: 'Start Campaign', icon: Megaphone, desc: 'Launch marketing campaign' },
    { title: 'Import CSV', icon: Upload, desc: 'Bulk import data' },
  ];

  return (
    <div>
      {/* ---- Header area ---- */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-medium">
          <Plus className="w-5 h-5" /><span>Quick Action</span>
        </button>
      </div>

      {/* ---- Metrics ---- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metrics.map((m) => (
          <div key={m.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{m.title}</span>
              <m.icon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">{formatNumber(m.value, m.prefix || '', m.suffix || '')}</div>
            <div className="flex items-center space-x-2 text-sm">
              <span className={m.isPositive ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {m.isPositive ? '↗' : '↘'} {Math.abs(m.change)}%
              </span>
              <span className="text-gray-500">{m.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ---- Quick Actions | Alerts ---- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Quick Actions</h2>
          <p className="text-sm text-gray-600 mb-5">Frequently used actions to manage your store</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((a) => (
              <button key={a.title} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg grid place-items-center flex-shrink-0">
                  <a.icon className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">{a.title}</div>
                  <div className="text-sm text-gray-600">{a.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Card */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Alerts</h2>
          <p className="text-sm text-gray-600 mb-5">Important notifications requiring attention</p>
          {alerts.length ? (
            <div className="space-y-3">
              {alerts.map((al) => (
                <div key={al.id} className="p-3 rounded-lg border border-gray-200 hover:border-gray-300">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {al.badge === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-600" />}
                      {al.badge === 'info' && <Info className="w-4 h-4 text-blue-600" />}
                      {al.badge === 'error' && <XCircle className="w-4 h-4 text-red-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm mb-1">{al.title}</div>
                      <div className="text-xs text-gray-600">{al.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">All caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* ---- Recent Activity ---- */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Recent Activity</h2>
        <p className="text-sm text-gray-600 mb-5">Latest orders and customer interactions</p>
        <div className="space-y-4">
          {recentActivity.map((act) => (
            <div key={act.id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${act.color === 'green' ? 'bg-green-500' : 'bg-orange-500'}`} />
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 mb-1">{act.title}</div>
                  <div className="text-sm text-gray-600">{act.description}</div>
                </div>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{getRelativeTime(act.time)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}