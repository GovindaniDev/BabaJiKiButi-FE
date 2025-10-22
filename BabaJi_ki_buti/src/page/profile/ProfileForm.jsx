import React from "react";


export default function ProfileForm({ form, saving, onChange, onSave }) {
return (
<section className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm">
<h2 className="text-lg font-semibold mb-4">Profile</h2>
<form onSubmit={onSave} className="space-y-4">
<div>
<label className="block text-sm font-medium mb-1">Email</label>
<input name="email" type="email" value={form.email} onChange={onChange} className="w-full border rounded-xl px-3 h-11" placeholder="you@example.com" />
</div>
<div>
<label className="block text-sm font-medium mb-1">Name</label>
<input name="name" value={form.name} onChange={onChange} className="w-full border rounded-xl px-3 h-11" placeholder="Your name" />
</div>
<div>
<label className="block text-sm font-medium mb-1">Phone</label>
<input name="phone" value={form.phone} onChange={onChange} className="w-full border rounded-xl px-3 h-11" placeholder="Optional" />
</div>
<button type="submit" disabled={saving} className="bg-gray-900 text-white rounded-xl px-4 h-11">{saving ? "Saving…" : "Save changes"}</button>
</form>
</section>
);
}