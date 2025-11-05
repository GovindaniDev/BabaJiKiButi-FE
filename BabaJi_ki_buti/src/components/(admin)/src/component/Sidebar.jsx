import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { title: 'Dashboard', url: '/admin' },
  { title: 'Catalog', url: '/admin/catalog' },
  { title: 'Inventory', url: '/admin/inventory' },
  { title: 'Pricing & Promotions', url: '/admin/pricing' },
  { title: 'Orders', url: '/admin/orders' },
  { title: 'Returns', url: '/admin/returns' },
  { title: 'Customers', url: '/admin/users' },
  { title: 'Subscriptions & Loyalty', url: '/admin/subscriptions' },
  { title: 'Wallet & Referrals', url: '/admin/wallet' },
  // { title: 'Bundles & Recommendations', url: '/admin/bundles' },
  { title: 'Reviews & Q&A', url: '/admin/reviews' },
  { title: 'B2B', url: '/admin/b2b' },
  { title: 'Campaigns & Engagement', url: '/admin/campaigns' },
  { title: 'Campaigns Announcement', url: '/admin/campaigns/announcements' },
  //{ title: 'Content', url: '/admin/content' },
  { title: 'Reports', url: '/admin/reports' },
];

export default function Sidebar({ open }) {
  const location = useLocation();
  const activeNav = navItems.find(i => i.url === location.pathname)?.title || 'Dashboard';

  return (
    <aside
      className={`${
        open ? 'w-56' : 'w-0'
      } bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-300 overflow-hidden sticky top-0 h-screen`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg grid place-items-center text-white font-bold text-sm">BB</div>
          <div>
            <div className="text-sm font-semibold text-gray-800">Babaji Ki Buti</div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="p-3">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Navigation</div>
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.url}
              to={item.url}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                activeNav === item.title ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}