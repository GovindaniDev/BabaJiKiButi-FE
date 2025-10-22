import React, { useEffect, useMemo, useState, useCallback } from "react";
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
  RefreshCw,
  Edit2,
  ShieldCheck,
  LockKeyhole,
  MoreVertical,
} from "lucide-react";
import { Link } from "react-router-dom";
import { userApi } from "../../../../../auth/user/userApi";

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
  user: "bg-slate-100 text-slate-700",
  affiliate: "bg-amber-100 text-amber-700",
};

const statusColor = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-rose-100 text-rose-700",
  blocked: "bg-orange-100 text-orange-700",
  deleted: "bg-slate-200 text-slate-700",
};

// Tolerant normalizer for backend variations
function normalizeUser(u = {}) {
  return {
    id: u.id ?? u.userId ?? u.uid ?? String(Math.random()),
    name: u.name ?? u.fullName ?? u.username ?? u.email?.split("@")[0] ?? "User",
    email: u.email ?? u.mail ?? "",
    phone: u.phone ?? u.mobile ?? u.contact ?? "",
    role: String(u.role ?? "user").toLowerCase(),
    status: String(u.status ?? "active").toLowerCase(),
    joinDate: u.joinDate ?? u.createdAt ?? u.created_at ?? "",
    lastLogin: u.lastLogin ?? u.last_seen ?? u.lastLoginAt ?? u.updatedAt ?? "",
    orders: Number(u.orders ?? u.orderCount ?? 0),
    totalSpent: Number(u.totalSpent ?? u.revenue ?? u.gmv ?? 0),
  };
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
  if (type === "role") return <Badge className={roleColor[value] || roleColor.user}>{value}</Badge>;
  if (type === "status") return <Badge className={statusColor[value] || statusColor.active}>{value}</Badge>;
  return null;
};

const ToolbarButton = ({ icon: Icon, children, onClick, variant = "ghost", disabled }) => {
  const base = "inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors focus:outline-none ring-1 ring-transparent";
  const styles = variant === "primary" ? "bg-violet-600 text-white hover:bg-violet-700" : "bg-white text-slate-700 hover:bg-slate-50 ring-slate-200";
  return (
    <button className={cn(base, styles, disabled && "opacity-60 cursor-not-allowed")} onClick={onClick} type="button" disabled={disabled}>
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
};

/* --------------------------------- Page -------------------------------- */

export default function Users() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState({ key: "joinDate", dir: "desc" });
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const list = await userApi.listAll();
      const norm = (Array.isArray(list) ? list : []).map(normalizeUser);
      setRows(norm);
    } catch (e) {
      console.error(e);
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const openEditor = (user) => {
    setEditUser(user);
    setDrawerOpen(true);
  };

  const closeEditor = () => {
    setDrawerOpen(false);
    setTimeout(() => setEditUser(null), 200);
  };

  const handleSaveUser = async (payload) => {
    const id = payload.id;
    setSavingId(id);
    try {
      const toSend = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        role: payload.role,
        status: payload.status,
      };
      const updated = id ? await userApi.updateById(id, toSend) : await userApi.create?.(toSend); // if you add a create API
      const norm = normalizeUser(updated ?? toSend);
      if (id) {
        setRows((prev) => prev.map((u) => (u.id === id ? { ...u, ...norm } : u)));
      } else {
        setRows((prev) => [norm, ...prev]);
      }
      closeEditor();
    } catch (e) {
      console.error(e);
      alert("Failed to save user.");
    } finally {
      setSavingId(null);
    }
  };

  const updateStatus = async (user, newStatus) => {
    setSavingId(user.id);
    try {
      const updated = await userApi.updateById(user.id, { status: newStatus });
      const norm = normalizeUser(updated);
      setRows((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...norm } : u)));
    } catch (e) {
      console.error(e);
      alert("Failed to change status.");
    } finally {
      setSavingId(null);
    }
  };

  const updateRole = async (user, newRole) => {
    setSavingId(user.id);
    try {
      const updated = await userApi.updateById(user.id, { role: newRole });
      const norm = normalizeUser(updated);
      setRows((prev) => prev.map((u) => (u.id === user.id ? { ...u, ...norm } : u)));
    } catch (e) {
      console.error(e);
      alert("Failed to change role.");
    } finally {
      setSavingId(null);
    }
  };

  const deleteUser = async (user, hard = false) => {
    if (!window.confirm(hard ? "Hard delete this user permanently?" : "Soft delete this user?")) return;
    setDeletingId(user.id);
    try {
      const ok = await userApi.deleteById(user.id, hard);
      if (ok) {
        setRows((prev) => prev.filter((u) => u.id !== user.id));
      } else {
        alert("Delete failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const actionsFor = (u) => {
    const isBusy = savingId === u.id || deletingId === u.id;
    return (
    <ActionMenu
      user={u}
      busy={isBusy}
      onEdit={() => openEditor(u)}
      onToggleBlock={() => updateStatus(u, u.status === "blocked" ? "active" : "blocked")}
      onToggleActive={() => updateStatus(u, u.status === "inactive" ? "active" : "inactive")}
      onSoftDelete={() => deleteUser(u, false)}
    />
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className=" flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Users</h1>
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

            <ToolbarButton icon={RefreshCw} onClick={load} disabled={loading}>
              Refresh
            </ToolbarButton>
            <ToolbarButton icon={Filter} onClick={() => {}}>Filter</ToolbarButton>
            <ToolbarButton icon={Download} onClick={exportCSV}>Export CSV</ToolbarButton>
            <ToolbarButton icon={Plus} variant="primary" onClick={() => openEditor({ id: null, name: "", email: "", phone: "", role: "user", status: "active" })}>
              Add User
            </ToolbarButton>
          </div>
        </div>

      {/* Analytics (click to filter) */}
      <section className=" max-w-7xl px-4 py-6">
        {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">{error}</div>}

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <CardStat
            title="Total Users"
            value={analytics.total}
            icon={UsersIcon}
            sub="All accounts"
            onClick={() => setStatus("all")}
            active={status === "all"}
          />
          <CardStat
            title="Active"
            value={analytics.active}
            icon={UserCheck}
            sub={`${Math.round((analytics.active / Math.max(1, analytics.total)) * 100)}% of total`}
            tone="emerald"
            onClick={() => setStatus("active")}
            active={status === "active"}
          />
          <CardStat
            title="Inactive"
            value={analytics.inactive}
            icon={UserX}
            sub={`${Math.round((analytics.inactive / Math.max(1, analytics.total)) * 100)}% of total`}
            onClick={() => setStatus("inactive")}
            active={status === "inactive"}
          />
          <CardStat
            title="Blocked"
            value={analytics.blocked}
            icon={Ban}
            sub="Restricted users"
            tone="orange"
            onClick={() => setStatus("blocked")}
            active={status === "blocked"}
          />
        </div>

      </section>

      {/* Filters */}
      <div className="max-w-7xl px-4 pb-4">
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
            {["all", "user", "admin", "affiliate"].map((r) => (
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
      <main className=" max-w-7xl px-4 pb-16">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
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
                {loading && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">Loading users…</td>
                  </tr>
                )}

                {!loading && filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} />
                        <div>
                          <div className="font-semibold text-slate-900">{u.name}</div>
                          <div className="text-xs text-slate-500">{u.email}</div>
                          {u.phone && <div className="text-xs text-slate-500">{u.phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Pill type="role" value={u.role} />
                       
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Pill type="status" value={u.status} />
                     
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{u.joinDate ? new Date(u.joinDate).toLocaleDateString() : "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "-"}</td>
                    <td className="px-6 py-4 text-slate-700">{u.orders}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{formatINR(u.totalSpent)}</td>
                    <td className="px-2 py-2">
                      <div className="flex items-center justify-center gap-1">
                        {/* Action buttons */}
                        {actionsFor(u)}
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">No users found for the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit / Create drawer */}
      {drawerOpen && (
        <EditDrawer
          user={editUser}
          onClose={closeEditor}
          onSave={handleSaveUser}
          saving={savingId === editUser?.id}
        />
      )}
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

function CardStat({ title, value, icon: Icon, sub, tone, onClick, active }) {
  const tones = {
    default: "bg-white border border-gray-200",
    emerald: "bg-emerald-50 border border-emerald-200",
    orange: "bg-orange-50 border border-orange-200",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg p-5 text-left transition",
        tones[tone || "default"],
        active && "ring-2 ring-violet-500"
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-600">{title}</span>
        <Icon className="w-5 h-5 text-gray-400" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {sub && <div className="text-sm text-gray-600">{sub}</div>}
    </button>
  );
}

function RoleSwitcher({ user, onChange, busy }) {
  const roles = ["user", "admin", "affiliate"];
  return (
    <select
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
      value={user.role}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
    >
      {roles.map((r) => <option key={r} value={r}>{r}</option>)}
    </select>
  );
}

function StatusSwitcher({ user, onChange, busy }) {
  const statuses = ["active", "inactive", "blocked", "deleted"];
  return (
    <select
      className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700"
      value={user.status}
      disabled={busy}
      onChange={(e) => onChange(e.target.value)}
    >
      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

// Replace your existing EditDrawer with this version
function EditDrawer({ user, onClose, onSave, saving }) {
  const isNew = !user?.id;
  const [form, setForm] = useState({
    id: user?.id ?? null,
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    role: user?.role ?? "user",
    status: user?.status ?? "active",
  });

  const canSave = form.name.trim() && form.email.trim();

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel (right) */}
      <div
        className="relative z-50 h-full w-full max-w-md bg-white shadow-2xl ring-1 ring-black/5
                   transform transition-transform duration-200"
        // If you want a slide-in effect, keep the next line.
        // When mounted, it's already at translate-x-0
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-lg font-semibold">{isNew ? "Add User" : "Edit User"}</h3>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">
            Close
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <Field label="Name">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Full name"
            />
          </Field>

          <Field label="Email">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="user@example.com"
              type="email"
            />
          </Field>

          <Field label="Phone">
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="10-digit phone"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
                <option value="affiliate">affiliate</option>
              </select>
            </Field>

            <Field label="Status">
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="blocked">blocked</option>
                <option value="deleted">deleted</option>
              </select>
            </Field>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <div className="text-xs text-slate-500">ID: {form.id || "new"}</div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl bg-white px-4 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50" onClick={onClose}>
              Cancel
            </button>
            <button
              className={cn(
                "rounded-xl px-4 py-2 text-sm font-medium text-white",
                canSave ? "bg-violet-600 hover:bg-violet-700" : "bg-violet-400 cursor-not-allowed"
              )}
              disabled={!canSave || saving}
              onClick={() => onSave(form)}
            >
              {saving ? "Saving..." : isNew ? "Create" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function Field({ label, children }) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-semibold text-slate-600">{label}</div>
      {children}
    </label>
  );
}
function ActionMenu({ user, busy, onEdit, onToggleBlock, onToggleActive, onSoftDelete }) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((o) => !o);
  const close = () => setOpen(false);

  const blockLabel = user.status === "blocked" ? "Unblock" : "Block";
  const activeLabel = user.status === "inactive" ? "Activate" : "Set Inactive";

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={busy}
        onClick={toggle}
        className={cn(
          "inline-flex items-center rounded-xl p-2 ring-1 ring-slate-200 bg-white hover:bg-slate-50 text-slate-600",
          busy && "opacity-60 cursor-not-allowed"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {open && (
        <>
          {/* backdrop to close on outside click */}
          <button
            className="fixed inset-0 z-40 cursor-default"
            onClick={close}
            aria-hidden="true"
            tabIndex={-1}
          />
          <div
            className="absolute right-0 z-50 mt-2 w-44 origin-top-right rounded-xl border border-slate-200 bg-white shadow-lg ring-1 ring-black/5"
            role="menu"
          >
            <MenuBtn onClick={() => { close(); onEdit?.(); }}>
              <Edit2 className="h-4 w-4" /> Edit
            </MenuBtn>

            <MenuBtn onClick={() => { close(); onToggleBlock?.(); }}>
              <LockKeyhole className="h-4 w-4" /> {blockLabel}
            </MenuBtn>

            <MenuBtn onClick={() => { close(); onToggleActive?.(); }}>
              <UserCheck className="h-4 w-4" /> {activeLabel}
            </MenuBtn>

            <MenuBtn danger onClick={() => { close(); onSoftDelete?.(); }}>
              <Trash2 className="h-4 w-4" /> Soft delete
            </MenuBtn>

            {/* View details */}
            <MenuLink to={`/admin/users/${user.id}`} onClick={close}>
              <Eye className="h-4 w-4" /> View
            </MenuLink>
          </div>
        </>
      )}
    </div>
  );
}

function MenuBtn({ children, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      role="menuitem"
      className={cn(
        "flex w-full items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50",
        danger ? "text-rose-600 hover:text-rose-700" : "text-slate-700"
      )}
    >
      {children}
    </button>
  );
}

function MenuLink({ to, children, onClick }) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
    >
      {children}
    </Link>
  );
}
