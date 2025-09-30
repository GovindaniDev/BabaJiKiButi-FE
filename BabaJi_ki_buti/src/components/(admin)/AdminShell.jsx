import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./src/component/Sidebar";
import AdminHeader from "./src/component/AdminHeader";

export default function AdminShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex font-semibold" style={{ fontFamily: "'Arial', sans-serif" }}>
      <Sidebar open={sidebarOpen} />                       {/*  sticky sidebar  */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> {/*  sticky header  */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />                                       {/*  renders every /admin page  */}
        </main>
      </div>
    </div>
  );
}