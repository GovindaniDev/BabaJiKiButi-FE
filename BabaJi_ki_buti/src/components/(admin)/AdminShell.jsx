import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./src/component/Sidebar";
import AdminHeader from "./src/component/AdminHeader";

export default function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Tailwind width classes for open/closed states
  const sideWidthClass = sidebarOpen ? "w-50" : "w-10";     // 16rem vs 5rem
  const contentLeftClass = sidebarOpen ? "ml-54" : "ml-20"; // match sidebar width

  return (
    <div className="min-h-screen bg-gray-50 font-semibold" style={{ fontFamily: "'Arial', sans-serif" }}>
      {/* Fixed Sidebar (sticks to the left, full height) */}
      <aside className={`fixed inset-y-0 left-0 z-40 ${sideWidthClass} bg-white`}>
        {/* If your Sidebar doesn't accept a className, wrapping it like this is fine */}
        <Sidebar open={sidebarOpen} />
      </aside>

      {/* Fixed Admin Header (sticks to the top, spans from sidebar to right edge) */}
      <header className={`fixed top-0 right-0 z-30 ${sidebarOpen ? "left-54" : "left-20"} h-16 bg-white `}>
        <div className="h-full">
          <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
      </header>

      {/* Scrollable Main Content (only this part scrolls) */}
      <main className={`${contentLeftClass} pt-16 h-screen overflow-auto`}>
        <div className="p-6 min-w-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
