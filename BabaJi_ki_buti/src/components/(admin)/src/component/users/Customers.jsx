// src/pages/Users.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  ChevronUp,
  ChevronDown,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Ban,
  Trash2,
  ShoppingBag,
  IndianRupee,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ------------------------------ helpers ------------------------------ */

const formatINR = (num) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(num || 0));

const cn = (...a) => a.filter(Boolean).join(" ");

const roleColor = {
  admin: "bg-violet-100 text-violet-700",
  customer: "bg-slate-100 text-slate-700",
  affiliate: "bg-amber-100 text-amber-700",
};

const statusColor = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-rose-100 text-rose-700",
  blocked: "bg-orange-100 text-orange-700",
  deleted: "bg-slate-200 text-slate-700",
};

/* ---------------------------- mock data/api --------------------------- */
// Replace with your real API call
async function fetchUsers() {
  return [
    { id: "u_1", name: "Rajesh Kumar", email: "rajesh@example.com", role: "customer", status: "active", joinDate: "2024-01-15", lastLogin: "2024-09-24", orders: 12, totalSpent: 45890 },
    { id: "u_2", name: "Priya Sharma", email: "priya@example.com", role: "customer", status: "active", joinDate: "2024-02-20", lastLogin: "2024-09-23", orders: 8, totalSpent: 23450 },
    { id: "u_3", name: "Admin User", email: "admin@company.com", role: "admin", status: "active", joinDate: "2023-12-01", lastLogin: "2024-09-24", orders: 0, totalSpent: 0 },
    { id: "u_4", name: "Amit Singh", email: "amit@example.com", role: "customer", status: "inactive", joinDate: "2024-03-10", lastLogin: "2024-08-15", orders: 3, totalSpent: 8900 },
    { id: "u_5", name: "Sneha Patel", email: "sneha@example.com", role: "affiliate", status: "active", joinDate: "2024-04-05", lastLogin: "2024-09-22", orders: 15, totalSpent: 67800 },
    { id: "u_6", name: "Karan Mehta", email: "karan@example.com", role: "customer", status: "blocked", joinDate: "2024-05-12", lastLogin: "2024-06-30", orders: 2, totalSpent: 3200 },
    { id: "u_7", name: "Archived User", email: "deleted@example.com", role: "customer", status: "deleted", joinDate: "2023-07-01", lastLogin: "2023-11-11", orders: 1, totalSpent: 799 },
  ];
}

/* ------------------------------ local UI bits ------------------------- */

const Badge = ({ className = "", children }) => (
  <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-black/5", className)}>
    {children}
  </span>
);

const Avatar = ({ name }) => {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-100 text-slate-700 text-sm font-bold ring-1 ring-slate-200">
      {initials}
    </div>
  );
};

const Pill = ({ type, value }) => {
  if (type === "role") return <Badge className={roleColor[value] || roleColor.customer}>{value}</Badge>;
  if (type === "status") return <Badge className={statusColor[value] || statusColor.active}>{value}</Badge>;
  return null;
};

const ToolbarButton = ({ icon: Icon, children, onClick, variant = "ghost" }) => {
  const base = "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none ring-1 ring-transparent";
  const styles = variant === "primary" ? "bg-violet-600 text-white hover:bg-violet-700" : "bg-white text-slate-700 hover:bg-slate-50 ring-slate-200";
  return (
    <button className={cn(base, styles)} onClick={onClick} type="button">
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
};

/* --------------------------------- Page -------------------------------- */

export default function Users() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ key: "joinDate", dir: "desc" });

  useEffect(() => {
    (async () => setRows(await fetchUsers()))();
  }, []);

  // ---------- analytics over ALL users ----------
  const analytics = useMemo(() => {
    const total = rows.length;
    const active = rows.filter((u) => u.status === "active").length;
    const inactive = rows.filter((u) => u.status === "inactive").length;
    const blocked = rows.filter((u) => u.status === "blocked").length;
    const deleted = rows.filter((u) => u.status === "deleted").length;
    const orders = rows.reduce((s, u) => s + (u.orders || 0), 0);
    const revenue = rows.reduce((s, u) => s + (u.totalSpent || 0), 0);
    return { total, active, inactive, blocked, deleted, orders, revenue };
  }, [rows]);

  const filtered = useMemo(() => {
    let r = [...rows];
    const q = query.trim().toLowerCase();
    if (q) r = r.filter((x) => x.name.toLowerCase().includes(q) || x.email.toLowerCase().includes(q));
    if (role !== "all") r = r.filter((x) => x.role === role);
    if (status !== "all") r = r.filter((x) => x.status === status);
    r.sort((a, b) => {
      const { key, dir } = sort;
      let va = a[key];
      let vb = b[key];
      if (["joinDate", "lastLogin"].includes(key)) {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      }
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return r;
  }, [rows, query, role, status, sort]);

  const onSort = (key) => {
    setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Role", "Status", "Join Date", "Last Login", "Orders", "Total Spent"];
    const lines = filtered.map((u) => [u.name, u.email, u.role, u.status, u.joinDate, u.lastLogin, u.orders, u.totalSpent].join(","));
    const csv = [headers.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className=" border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
          <div className="flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-72 rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <ToolbarButton icon={Filter} onClick={() => {}}>Filter</ToolbarButton>
            <ToolbarButton icon={Download} onClick={exportCSV}>Export CSV</ToolbarButton>
            <ToolbarButton icon={Plus} variant="primary" onClick={() => { /* navigate("/admin/users/new"); */ }}>
              Add User
            </ToolbarButton>
          </div>
        </div>
      </header>

      {/* ------------------------ Analytics Section (PURE JSX) ------------------------ */}
      <section className="mx-auto max-w-7xl px-4 py-6">
        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="rounded-lg p-5 bg-white border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Total Users</span>
              <UsersIcon className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{analytics.total}</div>
            <div className="text-sm text-gray-600">All accounts</div>
          </div>

          <div className="rounded-lg p-5 bg-emerald-50 border border-emerald-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Active</span>
              <UserCheck className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{analytics.active}</div>
            <div className="text-sm text-gray-600">
              {Math.round((analytics.active / Math.max(1, analytics.total)) * 100)}% of total
            </div>
          </div>

          <div className="rounded-lg p-5 bg-white border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Inactive</span>
              <UserX className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{analytics.inactive}</div>
            <div className="text-sm text-gray-600">
              {Math.round((analytics.inactive / Math.max(1, analytics.total)) * 100)}% of total
            </div>
          </div>

          <div className="rounded-lg p-5 bg-orange-50 border border-orange-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Blocked</span>
              <Ban className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{analytics.blocked}</div>
            <div className="text-sm text-gray-600">Restricted users</div>
          </div>
        </div>

     
      </section>

      {/* Filters */}
      <div className="mx-auto max-w-7xl px-4 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:hidden">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full rounded-xl border border-slate-200 bg-white px-9 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Role:</span>
            {["all", "customer", "admin", "affiliate"].map((r) => (
              <button
                key={r}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-slate-200",
                  role === r ? "bg-slate-900 text-white" : "bg-white text-slate-700"
                )}
                onClick={() => setRole(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            {["all", "active", "inactive", "blocked", "deleted"].map((s) => (
              <button
                key={s}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-slate-200",
                  status === s ? "bg-slate-900 text-white" : "bg-white text-slate-700"
                )}
                onClick={() => setStatus(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <main className="mx-auto max-w-7xl px-4 pb-14">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-m">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <Th>User</Th>
                  <Th onClick={() => onSort("role")} sortable sort={sort} id="role">Role</Th>
                  <Th onClick={() => onSort("status")} sortable sort={sort} id="status">Status</Th>
                  <Th onClick={() => onSort("joinDate")} sortable sort={sort} id="joinDate">Join Date</Th>
                  <Th onClick={() => onSort("lastLogin")} sortable sort={sort} id="lastLogin">Last Login</Th>
                  <Th onClick={() => onSort("orders")} sortable sort={sort} id="orders">Orders</Th>
                  <Th onClick={() => onSort("totalSpent")} sortable sort={sort} id="totalSpent">Total Spent</Th>
                  <Th className="text-center">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div>
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><Pill type="role" value={u.role} /></td>
                    <td className="px-6 py-4"><Pill type="status" value={u.status} /></td>
                    <td className="px-6 py-4 text-slate-700">{u.joinDate}</td>
                    <td className="px-6 py-4 text-slate-700">{u.lastLogin}</td>
                    <td className="px-6 py-4 text-slate-700">{u.orders}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatINR(u.totalSpent)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        <Link to={`/admin/users/${u.id}`} className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700" title="View">
                          <Eye className="h-5 w-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">No users found for the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

/* --------------------------------- misc -------------------------------- */

function Th({ children, className, sortable, onClick, sort, id }) {
  const isActive = sortable && sort?.key === id;
  return (
    <th className={cn("px-6 py-3 text-xs font-semibold uppercase tracking-wide", className)}>
      <button
        type="button"
        className={cn("group inline-flex items-center gap-1 text-slate-600", sortable && "hover:text-slate-900")}
        onClick={onClick}
      >
        {children}
        {sortable && (
          <span className="inline-flex h-4 w-4 items-center justify-center">
            {isActive ? (sort.dir === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />) : <ChevronUp className="h-4 w-4 opacity-0" />}
          </span>
        )}
      </button>
    </th>
  );
}
