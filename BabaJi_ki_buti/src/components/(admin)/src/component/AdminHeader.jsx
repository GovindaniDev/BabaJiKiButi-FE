import React, { useState } from 'react';
import { Search, Bell, Menu, ChevronDown, LogOut, Settings, X } from 'lucide-react';

export default function AdminHeader({ sidebarOpen, setSidebarOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Dummy data – keep or lift up as needed
  const notifications = 3;
  const alerts = [
    { id: 1, title: 'Low Stock Alert',  description: '5 products below threshold', badge: 'warning' },
    { id: 2, title: 'New Orders',       description: '12 orders awaiting fulfillment', badge: 'info' },
    { id: 3, title: 'Payment Failed',   description: '3 payments need attention', badge: 'error' },
  ];

  const dismissAlert = (id) => {
    /* lift state up if you want persistence */
    console.log('dismiss', id);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center space-x-4 flex-1">
        <button onClick={() => setSidebarOpen((s) => !s)} className="p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5 text-gray-600" />
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.target.search.value.trim();
            if (q) alert(`Searching for: ${q}`);
          }}
          className="flex items-center space-x-2 flex-1 max-w-xl"
        >
          <Search className="w-5 h-5 text-gray-400" />
          <input
            name="search"
            type="text"
            placeholder="Search orders, customers..."
            className="flex-1 outline-none text-sm text-gray-600 bg-transparent"
          />
        </form>
      </div>

      {/* Right */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications((s) => !s)}
            className="relative p-2 hover:bg-gray-100 rounded-lg"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs grid place-items-center font-semibold">
                {notifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {alerts.map((al) => (
                  <div key={al.id} className="p-4 border-b border-gray-100 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{al.title}</div>
                        <div className="text-xs text-gray-600 mt-1">{al.description}</div>
                      </div>
                      <button onClick={() => dismissAlert(al.id)} className="ml-2 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu((s) => !s)}
            className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-2 py-1"
          >
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">Admin User</div>
              <div className="text-xs text-gray-500">admin@babajikibuti.com</div>
            </div>
            <div className="w-8 h-8 bg-emerald-600 rounded-full grid place-items-center text-white font-semibold text-sm">A</div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                <Settings className="w-4 h-4" /><span>Settings</span>
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2">
                <LogOut className="w-4 h-4" /><span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}