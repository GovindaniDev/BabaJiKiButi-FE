import React, { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/AuthContext";
import { useMe } from "../../auth/user/useMe";
import { userApi } from "../../auth/user/userApi";

export default function AccountPage() {
  const { isAuthenticated } = useAuth();
  const { me, loading, error, refetch } = useMe();
  const [form, setForm] = useState({ email: "", name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (me) setForm({ email: me.email || "", name: me.name || "", phone: me.phone || "" });
  }, [me]);

  if (!isAuthenticated) return <div className="max-w-xl mx-auto p-6 pt-40 text-center">Please log in to view your account.</div>;
  if (loading) return <div className="p-6 pt-30">Loading your profile…</div>;
  if (error)   return <div className="p-6 text-red-600 pt-30">Failed to load: {String(error?.message || "Error")}</div>;
  if (!me)     return <div className="p-6 pt-30">No profile found.</div>;

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {};
      if (form.email !== me.email) payload.email = form.email.trim();
      if (form.name  !== me.name)  payload.name  = form.name.trim();
      if (form.phone !== me.phone) payload.phone = form.phone.trim();

      const updated = await userApi.updateMe(payload);
      toast.success("Profile updated");
      await refetch();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Update failed";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 pt-30">
      <h1 className="text-2xl font-semibold mb-4">My Account</h1>

      <div className="mb-4 text-sm text-gray-600">
        <div><strong>ID:</strong> {me.id}</div>
        <div><strong>Role:</strong> {me.role}</div>
        <div><strong>Status:</strong> {me.status}</div>
      </div>

      <form onSubmit={onSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={onChange}
            className="w-full border rounded px-3 h-10"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            className="w-full border rounded px-3 h-10"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            name="phone"
            value={form.phone}
            onChange={onChange}
            className="w-full border rounded px-3 h-10"
            placeholder="Optional"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-black text-white rounded px-4 h-10"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>
    </div>
  );
}
