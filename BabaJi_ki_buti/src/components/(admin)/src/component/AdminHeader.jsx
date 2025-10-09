// src/component/AdminHeader.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Menu, ChevronDown, LogOut, Settings, X } from "lucide-react";
import { useAuth } from "../../../../auth/AuthContext";
// Adjust the import path if your AuthContext lives elsewhere


export default function AdminHeader({ sidebarOpen, setSidebarOpen }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth(); // expects { user, logout } from your context

  // Dummy data – keep or lift up as needed
  const notifications = 3;
  const alerts = [
    { id: 1, title: "Low Stock Alert", description: "5 products below threshold", badge: "warning" },
    { id: 2, title: "New Orders", description: "12 orders awaiting fulfillment", badge: "info" },
    { id: 3, title: "Payment Failed", description: "3 payments need attention", badge: "error" },
  ];

  const dismissAlert = (id) => {
    /* lift state up if you want persistence */
    console.log("dismiss", id);
  };

  const handleLogout = async () => {
    try {
      await logout();              // provided by your AuthContext
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err);
      // (optional) show a toast here
    } finally {
      setShowUserMenu(false);
    }
  };

  // click-outside to close popovers
  useEffect(() => {
    const onClick = (e) => {
      if (showNotifications && notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (showUserMenu && userRef.current && !userRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showNotifications, showUserMenu]);

  const displayName = user?.name || user?.username || "Admin User";
  const displayEmail = user?.email || "admin@babajikibuti.com";
  const avatarInitial = (displayName?.[0] || "A").toUpperCase();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left */}
      <div className="flex items-center space-x-4 flex-1">
        <button
          onClick={() => setSidebarOpen((s) => !s)}
          className="p-2 hover:bg-gray-100 rounded-lg"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          <Menu className="w-5 h-5 text-gray-600" />
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const q = e.currentTarget.search.value.trim();
            if (q) alert(`Searching for: ${q}`);
          }}
          className="flex items-center space-x-2 flex-1 max-w-xl"
          role="search"
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
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((s) => !s)}
            className="relative p-2 hover:bg-gray-100 rounded-lg"
            aria-haspopup="menu"
            aria-expanded={showNotifications}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs grid place-items-center font-semibold">
                {notifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              role="menu"
              aria-label="Notifications"
            >
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
                      <button
                        onClick={() => dismissAlert(al.id)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                        aria-label="Dismiss notification"
                      >
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
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu((s) => !s)}
            className="flex items-center space-x-3 hover:bg-gray-100 rounded-lg px-2 py-1"
            aria-haspopup="menu"
            aria-expanded={showUserMenu}
          >
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">{displayName}</div>
              <div className="text-xs text-gray-500">{displayEmail}</div>
            </div>
            <div className="w-8 h-8 bg-emerald-600 rounded-full grid place-items-center text-white font-semibold text-sm">
              {avatarInitial}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>

          {showUserMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
              role="menu"
              aria-label="User menu"
            >
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/admin/settings");
                }}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center space-x-2"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
