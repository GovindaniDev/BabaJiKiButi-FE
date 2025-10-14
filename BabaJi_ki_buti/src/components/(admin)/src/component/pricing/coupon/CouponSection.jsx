// src/pages/CouponForm.jsx
import React, { useMemo, useState } from "react";
import {
  Tag, Percent, IndianRupee, Truck, Calendar, CheckCircle2, XCircle, Info,
} from "lucide-react";

/* ------------------------------ helpers ------------------------------ */
const cn = (...a) => a.filter(Boolean).join(" ");
const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number(n || 0));

const TYPE_OPTIONS = [
  { key: "percentage", label: "Percentage", icon: Percent },
  { key: "fixed", label: "Flat", icon: IndianRupee },
  { key: "free_shipping", label: "Free Shipping", icon: Truck },
];

const STATUS_OPTIONS = [
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

/* ------------------------------ component ---------------------------- */
export default function CouponForm({ initial = null, onSave, onCancel }) {
  const [form, setForm] = useState(
    initial || {
      code: "",
      type: "percentage", // percentage | fixed | free_shipping
      value: "",
      maxDiscount: "",
      minOrder: "",
      startAt: "",
      endAt: "",
      usageTotalLimit: "",
      usagePerUser: "",
      firstOrderOnly: false,
      stackable: false,
      status: "active",
      scopeProducts: "", // comma sep IDs
      scopeCategories: "", // comma sep slugs
      notes: "",
    }
  );
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const summary = useMemo(() => {
    const t = form.type;
    const parts = [];
    if (t === "percentage") {
      parts.push(`${form.value || 0}% off`);
      if (form.maxDiscount) parts.push(`(max ${formatINR(form.maxDiscount)})`);
    } else if (t === "fixed") {
      parts.push(`${formatINR(form.value || 0)} off`);
    } else {
      parts.push("Free shipping");
    }
    if (form.minOrder) parts.push(`• Min order ${formatINR(form.minOrder)}`);
    if (form.firstOrderOnly) parts.push("• First order only");
    if (form.stackable) parts.push("• Stackable");
    parts.push(`• ${form.status === "active" ? "Active" : "Inactive"}`);
    return parts.join(" ");
  }, [form]);

  const update = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.code?.trim()) e.code = "Coupon code is required.";
    if (!/^[A-Z0-9_-]{3,20}$/.test(form.code.trim().toUpperCase()))
      e.code = "Use 3–20 chars (A–Z, 0–9, _ or -).";
    if (form.type === "percentage") {
      if (!form.value) e.value = "Enter a percentage.";
      else if (Number(form.value) <= 0 || Number(form.value) > 90)
        e.value = "Percentage should be between 1 and 90.";
    }
    if (form.type === "fixed") {
      if (!form.value) e.value = "Enter a flat amount.";
      else if (Number(form.value) <= 0) e.value = "Amount should be greater than 0.";
    }
    if (form.type === "percentage" && form.maxDiscount && Number(form.maxDiscount) < 0)
      e.maxDiscount = "Max discount cannot be negative.";

    if (form.minOrder && Number(form.minOrder) < 0) e.minOrder = "Min order cannot be negative.";

    if (form.startAt && form.endAt) {
      const s = new Date(form.startAt);
      const en = new Date(form.endAt);
      if (en < s) e.endAt = "End date must be after start date.";
    }

    if (form.usageTotalLimit && Number(form.usageTotalLimit) < 0)
      e.usageTotalLimit = "Must be ≥ 0.";
    if (form.usagePerUser && Number(form.usagePerUser) < 0)
      e.usagePerUser = "Must be ≥ 0.";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        type: form.type,
        value: Number(form.value || 0),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
        minOrder: form.minOrder ? Number(form.minOrder) : 0,
        startAt: form.startAt || null,
        endAt: form.endAt || null,
        usageTotalLimit: form.usageTotalLimit ? Number(form.usageTotalLimit) : null,
        usagePerUser: form.usagePerUser ? Number(form.usagePerUser) : null,
        firstOrderOnly: !!form.firstOrderOnly,
        stackable: !!form.stackable,
        status: form.status,
        scope: {
          products: form.scopeProducts
            ? form.scopeProducts.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
          categories: form.scopeCategories
            ? form.scopeCategories.split(",").map((s) => s.trim()).filter(Boolean)
            : [],
        },
        notes: form.notes?.trim() || "",
      };
      // handoff
      if (typeof onSave === "function") onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  const TypeButton = ({ option }) => {
    const Icon = option.icon;
    const active = form.type === option.key;
    return (
      <button
        type="button"
        onClick={() => update("type", option.key)}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-2 ring-1 transition",
          active
            ? "bg-green-600 text-white ring-green-600"
            : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
        )}
      >
        <Icon className="h-4 w-4" />
        {option.label}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="">
        <div className="mx-auto px-2 flex items-center gap-3">
          <Tag className="h-5 w-5 text-green-600" />
          <h1 className="text-xl font-bold text-slate-900">Create Coupon</h1>
        
        </div>
      </header>

      <form onSubmit={submit}>
        <div className="mx-10 max-w-5xl px-2 py-6 space-y-6">
          {/* Code */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
            <div className="grid grid-cols-12 gap-4 items-start">
              <label className="col-span-12 md:col-span-3 text-sm font-medium text-slate-700">
                Coupon Code
                <div className="text-xs font-normal text-slate-500">Example: NEW10, FLAT200</div>
              </label>
              <div className="col-span-12 md:col-span-9">
                <input
                  value={form.code}
                  onChange={(e) => update("code", e.target.value.toUpperCase())}
                  placeholder="Enter code (A–Z, 0–9, _ , -)"
                  className={cn(
                    "w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none",
                    errors.code ? "border-rose-400" : "border-slate-300 focus:ring-2 focus:ring-green-500"
                  )}
                />
                {errors.code ? (
                  <p className="mt-1 text-xs text-rose-600">{errors.code}</p>
                ) : (
                  <p className="mt-1 text-xs text-slate-500">
                    Keep it short and memorable. Visible to customers at checkout.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Type & Values */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
            <div className="grid grid-cols-12 gap-4">
              <label className="col-span-12 md:col-span-3 text-sm font-medium text-slate-700">
                Discount Type
                <div className="text-xs font-normal text-slate-500">Choose how the offer applies</div>
              </label>
              <div className="col-span-12 md:col-span-9 flex flex-wrap gap-2">
                {TYPE_OPTIONS.map((opt) => (
                  <TypeButton key={opt.key} option={opt} />
                ))}
              </div>

              {/* Value row */}
              {form.type !== "free_shipping" && (
                <>
                  <div className="col-span-12 md:col-span-3 text-sm font-medium text-slate-700">
                    {form.type === "percentage" ? "Percentage" : "Flat Amount"}
                  </div>
                  <div className="col-span-12 md:col-span-9">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={form.value}
                        onChange={(e) => update("value", e.target.value)}
                        placeholder={form.type === "percentage" ? "e.g., 10" : "e.g., 200"}
                        className={cn(
                          "w-48 rounded-lg border bg-white px-3 py-2 text-sm outline-none",
                          errors.value ? "border-rose-400" : "border-slate-300 focus:ring-2 focus:ring-green-500"
                        )}
                      />
                      {form.type === "percentage" ? <span className="text-slate-600 text-sm">%</span> : <span className="text-slate-600 text-sm">INR</span>}
                    </div>
                    {errors.value ? (
                      <p className="mt-1 text-xs text-rose-600">{errors.value}</p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">
                        {form.type === "percentage"
                          ? "Common choices: 5, 10, 15. Cap with Max Discount."
                          : "Flat amount deducted from eligible items subtotal."}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Max Discount (only for percentage) */}
              {form.type === "percentage" && (
                <>
                  <div className="col-span-12 md:col-span-3 text-sm font-medium text-slate-700">
                    Max Discount (optional)
                  </div>
                  <div className="col-span-12 md:col-span-9">
                    <input
                      type="number"
                      value={form.maxDiscount}
                      onChange={(e) => update("maxDiscount", e.target.value)}
                      placeholder="e.g., 500"
                      className={cn(
                        "w-48 rounded-lg border bg-white px-3 py-2 text-sm outline-none",
                        errors.maxDiscount ? "border-rose-400" : "border-slate-300 focus:ring-2 focus:ring-green-500"
                      )}
                    />
                    {errors.maxDiscount ? (
                      <p className="mt-1 text-xs text-rose-600">{errors.maxDiscount}</p>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">Cap the discount amount (₹).</p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Conditions */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
            <div className="grid grid-cols-12 gap-4">
              <label className="col-span-12 md:col-span-3 text-sm font-medium text-slate-700">
                Conditions
                <div className="text-xs font-normal text-slate-500">Minimums & dates</div>
              </label>

              <div className="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Min Order (₹)</label>
                  <input
                    type="number"
                    value={form.minOrder}
                    onChange={(e) => update("minOrder", e.target.value)}
                    placeholder="e.g., 999"
                    className={cn(
                      "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none",
                      errors.minOrder ? "border-rose-400" : "border-slate-300 focus:ring-2 focus:ring-green-500"
                    )}
                  />
                  {errors.minOrder && <p className="mt-1 text-xs text-rose-600">{errors.minOrder}</p>}
                </div>

                <div>
                  <label className="text-xs text-slate-600">Start Date</label>
                  <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={form.startAt}
                      onChange={(e) => update("startAt", e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-600">End Date</label>
                  <div className="mt-1 relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={form.endAt}
                      onChange={(e) => update("endAt", e.target.value)}
                      className={cn(
                        "w-full rounded-lg border bg-white pl-9 pr-3 py-2 text-sm outline-none",
                        errors.endAt ? "border-rose-400" : "border-slate-300 focus:ring-2 focus:ring-green-500"
                      )}
                    />
                  </div>
                  {errors.endAt && <p className="mt-1 text-xs text-rose-600">{errors.endAt}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Limits & Flags */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
            <div className="grid grid-cols-12 gap-4">
              <label className="col-span-12 md:col-span-3 text-sm font-medium text-slate-700">
                Limits & Flags
                <div className="text-xs font-normal text-slate-500">Usage caps and eligibility</div>
              </label>
              <div className="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Total Usage Limit</label>
                  <input
                    type="number"
                    value={form.usageTotalLimit}
                    onChange={(e) => update("usageTotalLimit", e.target.value)}
                    placeholder="e.g., 1000"
                    className={cn(
                      "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none",
                      errors.usageTotalLimit ? "border-rose-400" : "border-slate-300 focus:ring-2 focus:ring-green-500"
                    )}
                  />
                  {errors.usageTotalLimit && (
                    <p className="mt-1 text-xs text-rose-600">{errors.usageTotalLimit}</p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-slate-600">Usage Per User</label>
                  <input
                    type="number"
                    value={form.usagePerUser}
                    onChange={(e) => update("usagePerUser", e.target.value)}
                    placeholder="e.g., 1"
                    className={cn(
                      "mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none",
                      errors.usagePerUser ? "border-rose-400" : "border-slate-300 focus:ring-2 focus:ring-green-500"
                    )}
                  />
                  {errors.usagePerUser && (
                    <p className="mt-1 text-xs text-rose-600">{errors.usagePerUser}</p>
                  )}
                </div>

                <div className="flex flex-col justify-end">
                  <label className="text-xs text-slate-600 mb-1">Flags</label>
                  <div className="flex items-center gap-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.firstOrderOnly}
                        onChange={(e) => update("firstOrderOnly", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      First order only
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={form.stackable}
                        onChange={(e) => update("stackable", e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-green-600 focus:ring-green-500"
                      />
                      Stackable
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scope */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
            <div className="grid grid-cols-12 gap-4">
              <label className="col-span-12 md:col-span-3 text-sm font-medium text-slate-700">
                Applicability
                <div className="text-xs font-normal text-slate-500">
                  Restrict to products or categories (optional)
                </div>
              </label>
              <div className="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Product IDs (comma separated)</label>
                  <input
                    value={form.scopeProducts}
                    onChange={(e) => update("scopeProducts", e.target.value)}
                    placeholder="e.g., 101, 102, 103"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Categories (comma separated)</label>
                  <input
                    value={form.scopeCategories}
                    onChange={(e) => update("scopeCategories", e.target.value)}
                    placeholder="e.g., haircare, skincare"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status & Notes */}
          <div className="rounded-2xl bg-white ring-1 ring-slate-200 p-4">
            <div className="grid grid-cols-12 gap-4">
              <label className="col-span-12 md:col-span-3 text-sm font-medium text-slate-700">
                Status & Notes
              </label>
              <div className="col-span-12 md:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-600">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.key} value={s.key}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-slate-600">Notes (internal)</label>
                  <input
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    placeholder="Shown only to admins"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div className="col-span-12 md:col-span-9 md:col-start-4">
                <div className="mt-3 flex items-start gap-2 text-sm">
                  <Info className="h-4 w-4 text-slate-400 mt-0.5" />
                  <p className="text-slate-600">
                    <span className="font-semibold">Preview:</span> {summary || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Validation status */}
          {Object.keys(errors).length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 flex items-center gap-2">
              <XCircle className="h-4 w-4" /> Please fix the highlighted fields.
            </div>
          )}
          {Object.keys(errors).length === 0 && form.code && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Looks good. You can save this coupon.
            </div>
          )}

          <div className="h-20" /> {/* spacer for sticky footer */}
        </div>

        {/* Sticky actions (Flipkart-like) */}
        <div className="fixed inset-x-0 bottom-0 z-10 border-t bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {summary ? `Ready to save: ${summary}` : "Fill the form to see a live summary"}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => (typeof onCancel === "function" ? onCancel() : window.history.back())}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={cn(
                  "rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700",
                  saving && "opacity-60"
                )}
              >
                {saving ? "Saving..." : "Save Coupon"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
