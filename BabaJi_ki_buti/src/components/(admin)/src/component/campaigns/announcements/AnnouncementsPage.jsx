// src/admin/announcements/AnnouncementsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus, Save, X, Trash2, ArrowUp, ArrowDown, CheckCircle2, Clock, Globe, Link as LinkIcon,
  Megaphone, Eye, EyeOff, RefreshCcw, Rocket, Calendar, Settings2,
  Pencil
} from "lucide-react";
import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  reorderAnnouncements,
  updateAnnouncement,
  publishAnnouncements,
} from "../../../../../../auth/admin/cms/announcementApi";

/* --------------------------------- utils --------------------------------- */
const cn = (...c) => c.filter(Boolean).join(" ");

/** Convert a JS Date or ISO string to `YYYY-MM-DDTHH:mm` in **local time** for <input type="datetime-local" /> */
function toLocalInputValue(d) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

/** Convert a `datetime-local` value to ISO string (Instant) or null */
function localInputToISO(v) {
  if (!v) return null;                         // backend should receive null, not ""
  const d = new Date(v);                       // interpreted in local TZ
  if (Number.isNaN(d.getTime())) return null;  // guard
  return d.toISOString();                      // send as Instant (UTC)
}

/** Ensure we always send *enum* values that match backend (UPPERCASE) */
function normalizeChannel(v) {
  const x = (v || "").toString().trim().toUpperCase();
  return x === "HERO" || x === "BANNER" ? x : "TICKER";
}

/** Audience normalization if you have enum (optional keep as-is if String) */
function normalizeAudience(v) {
  const x = (v || "").toString().trim().toUpperCase();
  return x === "MEMBERS" ? "MEMBERS" : "ALL";
}

/* ----------------------------- UI primitives ----------------------------- */
const Button = ({
  children,
  variant = "default",
  size = "default",
  className,
  disabled,
  type = "button",
  onClick,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    default: "bg-emerald-700 text-white hover:bg-emerald-800",
    outline: "border border-gray-300 bg-white hover:bg-emerald-50 text-black",
    ghost: "hover:bg-emerald-50 text-black",
    destructive: "bg-rose-600 text-white hover:bg-rose-700",
    success: "bg-emerald-700 text-white hover:bg-emerald-800",
  };
  const sizes = {
    default: "h-9 py-2 px-4 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-6 text-base",
    icon: "h-9 w-9",
  };
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black",
      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

const Textarea = React.forwardRef(({ className, rows = 2, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black",
      "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent",
      "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

const Label = ({ children, htmlFor, className }) => (
  <label
    htmlFor={htmlFor}
    className={cn("text-xs font-medium text-black mb-1.5 block", className)}
  >
    {children}
  </label>
);

const Card = ({ children, className }) => (
  <div className={cn("rounded-lg border border-gray-200 bg-white shadow-sm", className)}>
    {children}
  </div>
);
const CardHeader = ({ children, className }) => (
  <div className={cn("flex flex-col space-y-1 p-5 pb-4", className)}>{children}</div>
);
const CardTitle = ({ children, className }) => (
  <h3 className={cn("text-base font-semibold text-black", className)}>{children}</h3>
);
const CardDescription = ({ children, className }) => (
  <p className={cn("text-xs text-gray-500 mt-0.5", className)}>{children}</p>
);
const CardContent = ({ children, className }) => (
  <div className={cn("p-5 pt-0", className)}>{children}</div>
);

/* --------------------------- page-specific consts -------------------------- */
const CHANNELS = [
  { id: "TICKER", label: "Top Ticker" },
  // { id: "HERO", label: "Hero Subtitle" },
  // { id: "BANNER", label: "Sitewide Banner" },
];

const DEFAULT_FORM = {
  message: "",
  emoji: "",
  ctaText: "",
  ctaHref: "",
  channel: "TICKER", // FIX: default to enum value (uppercase)
  audience: "ALL",
  active: true,
  startAt: "",
  endAt: "",
  priority: 5,
};

/* ------------------------------ preview ticker ----------------------------- */
function EmptyState({ onCreate }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center">
      <Megaphone className="mx-auto mb-3" />
      <h3 className="font-semibold text-gray-800">No announcements yet</h3>
      <p className="text-gray-500 text-sm">Create your first announcement for the ticker/banner.</p>
      <Button onClick={onCreate} className="mt-4">
        <Plus className="h-4 w-4 mr-2" /> New Announcement
      </Button>
    </div>
  );
}

function PreviewTicker({ items = [], speedSec = 35 }) {
  if (!items.length) return null;
  return (
    <div className="mt-6 rounded-lg overflow-hidden border border-gray-200">
      <div className="relative bg-gradient-to-r from-[#d4a574] via-[#c69463] to-[#d4a574]">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#d4a574] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#d4a574] to-transparent z-10 pointer-events-none" />
        <div className="relative flex h-10 items-center" style={{ ["--p-speed"]: `${speedSec}s` }}>
          <div className="flex animate-scroll whitespace-nowrap">
            {items.map((t, i) => (
              <div key={`p1-${i}`} className="inline-flex items-center mx-6">
                <span className="text-white font-semibold text-sm drop-shadow">
                  {t.emoji ? `${t.emoji} ` : ""}{t.message}
                </span>
              </div>
            ))}
          </div>
          <div className="flex animate-scroll whitespace-nowrap" aria-hidden="true">
            {items.map((t, i) => (
              <div key={`p2-${i}`} className="inline-flex items-center mx-6">
                <span className="text-white font-semibold text-sm drop-shadow">
                  {t.emoji ? `${t.emoji} ` : ""}{t.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes scroll { 0% { transform: translateX(0) } 100% { transform: translateX(-100%) } }
        .animate-scroll { animation: scroll var(--p-speed, 35s) linear infinite; }
      `}</style>
    </div>
  );
}

/* ---------------------------------- page ---------------------------------- */
export default function AnnouncementsPage() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [speedSec, setSpeedSec] = useState(35);
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  // load
  useEffect(() => {
  (async () => {
    setLoading(true);
    const data = await getAnnouncements().catch(() => null);

    if (data) {
      // 1) Normalise list: support both [ ... ] and { items: [ ... ], ticker: {...} }
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data.items)
        ? data.items
        : [];

      setList(items);

      // 2) Ticker settings only if present on the root object
      const meta = Array.isArray(data) ? null : data.ticker;

      setSpeedSec(
        meta && Number.isFinite(Number(meta.speedSec))
          ? Number(meta.speedSec)
          : 35
      );
      setEnabled(
        meta && typeof meta.enabled === "boolean"
          ? meta.enabled
          : true
      );
    }

    setLoading(false);
  })();
}, []);


  // derived ticker preview
  const now = useMemo(() => new Date(), []);
  const tickerItems = useMemo(() => {
    return list
      .filter(a => normalizeChannel(a.channel) === "TICKER" && !!a.active)
      .filter(a => {
        const okStart = a.startAt ? new Date(a.startAt) <= now : true;
        const okEnd = a.endAt ? new Date(a.endAt) >= now : true;
        return okStart && okEnd;
      })
      .sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5));
  }, [list, now]);

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const startEdit = (item) => {
    setForm({
      message: item.message || "",
      emoji: item.emoji || "",
      ctaText: item.ctaText || "",
      ctaHref: item.ctaHref || "",
      channel: normalizeChannel(item.channel || "TICKER"),
      audience: normalizeAudience(item.audience || "ALL"),
      active: Boolean(item.active),
      // FIX: convert backend Instant/ISO to datetime-local string
      startAt: item.startAt ? toLocalInputValue(item.startAt) : "",
      endAt: item.endAt ? toLocalInputValue(item.endAt) : "",
      priority: item.priority ?? 5,
    });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        message: form.message?.trim() || "", // keep NotBlank happy
        emoji: form.emoji || "",
        ctaText: form.ctaText || "",
        ctaHref: form.ctaHref || "",
        channel: normalizeChannel(form.channel),
        audience: normalizeAudience(form.audience),
        active: Boolean(form.active),
        priority: Number(form.priority || 5),
        // FIX: send Instant (ISO) or null
        startAt: localInputToISO(form.startAt),
        endAt: localInputToISO(form.endAt),
      };

      if (editingId) {
        const updated = await updateAnnouncement(editingId, payload);
        setList(prev => prev.map(x => x.id === editingId ? updated : x));
      } else {
        const created = await createAnnouncement(payload);
        setList(prev => [created, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      alert("Could not save. Please check fields & try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this announcement?")) return;
    await deleteAnnouncement(id).catch(() => null);
    setList(prev => prev.filter(x => x.id !== id));
  };

  const move = async (index, dir) => {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[index], next[j]] = [next[j], next[index]];
    setList(next);
    await reorderAnnouncements(next.map(x => x.id)).catch(() => null);
  };

  const toggleActive = async (item) => {
    // optimistic
    const updated = { ...item, active: !item.active };
    setList(prev => prev.map(x => x.id === item.id ? updated : x));

    // FIX: include required fields so backend validation passes
    const patch = {
      active: updated.active,
      message: item.message,                // NotBlank on update
      channel: normalizeChannel(item.channel),
      audience: normalizeAudience(item.audience),
      priority: Number(item.priority ?? 5), // safe carry-over
      // do not touch dates here
    };

    try {
      const saved = await updateAnnouncement(item.id, patch);
      // sync any canonical values from backend
      setList(prev => prev.map(x => x.id === item.id ? saved : x));
    } catch (e) {
      console.error(e);
      // rollback on error
      setList(prev => prev.map(x => x.id === item.id ? item : x));
      alert("Could not update status. Please try again.");
    }
  };

  const saveTickerSettings = async () => {
    setSaving(true);
    try {
      await publishAnnouncements({ ticker: { enabled: Boolean(enabled), speedSec: Number(speedSec || 35) } });
      alert("Ticker settings saved.");
    } catch {
      alert("Failed to save ticker settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-1">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Announcements</h1>
          <p className="text-gray-500 text-sm">Create, schedule, and manage ticker / banner messages.</p>
        </div>
        <Link to="/admin" className="text-emerald-700 hover:underline text-sm">← Back to Admin</Link>
      </div>

      {/* Editor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>New / Edit Announcement</CardTitle>
          <CardDescription>Solid inputs + compact styling to match Add Product</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Message */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Message</Label>
                <span
                  className={
                    "text-xs " +
                    (form.message.length > 360
                      ? "text-red-600"
                      : form.message.length > 300
                      ? "text-amber-600"
                      : "text-gray-400")
                  }
                >
                  {form.message.length}/400
                </span>
              </div>

              <Textarea
                value={form.message}
                onChange={(e) =>
                  setForm((f) => ({ ...f, message: (e.target.value || "").slice(0, 400) }))
                }
                maxLength={400}
                rows={2}
                placeholder="e.g., 🚨 GST price cut up to 12% on MRP"
              />

              {/* Helpers */}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {["🚨", "🪔", "⭐", "🎉", "🎁"].map((em) => (
                  <Button
                    key={em}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setForm((f) => {
                        const next = (f.message || "") + (f.message ? " " : "") + em;
                        return { ...f, message: next.slice(0, 400) };
                      })
                    }
                  >
                    {em}
                  </Button>
                ))}

                <select
                  onChange={(e) => {
                    const v = e.target.value;
                    if (!v) return;
                    setForm((f) => ({ ...f, message: v.slice(0, 400) }));
                  }}
                  className={cn(
                    "h-8 px-2 text-xs rounded-md border border-gray-300 bg-white text-black",
                    "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  )}
                  defaultValue=""
                  title="Quick template"
                >
                  <option value="" disabled>Templates…</option>
                  <option value="🚨 Price Drop: GST reduced up to 12% on MRP!">GST price drop</option>
                  <option value="🪔 Diwali Hampers → 15% OFF with SHUDDH15">Diwali hamper + code</option>
                  <option value="⭐ Members save 20% — auto-applied at checkout">Members auto-discount</option>
                  <option value="🎉 Get 10% OFF on orders above ₹3000 | Use TBOF10">Cart threshold + code</option>
                  <option value="🎁 FREE Truemato on orders above ₹4000">Free gift threshold</option>
                </select>

                <span className="text-[11px] text-gray-500">
                  Keep it short. Use emojis and a clear CTA/code.
                </span>
              </div>

              {/* Inline preview */}
              {form.message?.trim() ? (
                <div className="mt-3 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#d4a574] via-[#c69463] to-[#d4a574] px-3 py-2">
                    <div className="text-white text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                      {form.message}
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div>
              <Label>Emoji (optional)</Label>
              <Input
                value={form.emoji}
                onChange={(e) => setForm(f => ({ ...f, emoji: e.target.value }))}
                placeholder="e.g., 🪔"
              />
            </div>

            <div>
              <Label>Channel</Label>
              <select
                value={form.channel}
                onChange={(e) => setForm(f => ({ ...f, channel: normalizeChannel(e.target.value) }))}
                className={cn(
                  "flex h-9 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                )}
              >
                {CHANNELS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <Label>CTA Text</Label>
              <Input
                value={form.ctaText}
                onChange={(e) => setForm(f => ({ ...f, ctaText: e.target.value }))}
                placeholder="e.g., Shop Now"
              />
            </div>

            <div>
              <Label>CTA Link</Label>
              <Input
                value={form.ctaHref}
                onChange={(e) => setForm(f => ({ ...f, ctaHref: e.target.value }))}
                placeholder="/shop or https://..."
              />
            </div>

            <div>
              <Label>Audience</Label>
              <select
                value={form.audience}
                onChange={(e) => setForm(f => ({ ...f, audience: normalizeAudience(e.target.value) }))}
                className={cn(
                  "flex h-9 w-full items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-black",
                  "focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                )}
              >
                <option value="ALL">All Visitors</option>
                <option value="MEMBERS">Members Only</option>
              </select>
            </div>

            <div>
              <Label>Priority (1 highest)</Label>
              <Input
                type="number"
                min={1}
                max={9}
                value={form.priority}
                onChange={(e) => setForm(f => ({ ...f, priority: e.target.value }))}
              />
            </div>

            <div>
              <Label>Start At</Label>
              <Input
                type="datetime-local"
                value={form.startAt}
                onChange={(e) => setForm(f => ({ ...f, startAt: e.target.value }))}
              />
              <p className="text-[11px] text-gray-500 mt-1">Saved as Instant (UTC) on backend.</p>
            </div>

            <div>
              <Label>End At</Label>
              <Input
                type="datetime-local"
                value={form.endAt}
                onChange={(e) => setForm(f => ({ ...f, endAt: e.target.value }))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="active"
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm(f => ({ ...f, active: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              />
              <Label htmlFor="active" className="m-0">Active</Label>
            </div>

            <div className="md:col-span-2 flex items-center gap-3">
              <Button type="submit" variant="success" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? "Update" : "Save"}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Ticker settings + preview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ticker Settings</CardTitle>
          <CardDescription>Control visibility & speed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-col md:flex-row gap-3">
            <div className="flex items-center gap-3">
              <Settings2 />
              <div>
                <div className="font-semibold text-black">Top Ticker</div>
                <div className="text-xs text-gray-500">Preview updates live</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-black">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e)=>setEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                Enabled
              </label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Speed (sec)</span>
                <Input
                  type="number"
                  min={10}
                  max={120}
                  value={speedSec}
                  onChange={(e)=>setSpeedSec(e.target.value)}
                  className="w-24"
                />
              </div>
              <Button onClick={saveTickerSettings} variant="outline" disabled={saving}>
                <Rocket className="h-4 w-4 mr-2" /> Save Settings
              </Button>
            </div>
          </div>
          <PreviewTicker items={tickerItems} speedSec={speedSec} />
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="font-semibold text-black">All Announcements</div>
          <Button onClick={() => setForm(DEFAULT_FORM)}>
            <Plus className="h-4 w-4 mr-2" /> New
          </Button>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : list.length === 0 ? (
          <div className="p-6"><EmptyState onCreate={() => setForm(DEFAULT_FORM)} /></div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {list.map((a, i) => {
              const live = a.active &&
                (!a.startAt || new Date(a.startAt) <= now) &&
                (!a.endAt || new Date(a.endAt) >= now);
              const channel = normalizeChannel(a.channel);
              const audience = normalizeAudience(a.audience);

              return (
                <li key={a.id} className="px-5 py-3 flex items-center gap-4">
                  <div className="w-8 text-gray-400">{i+1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full",
                        channel === "TICKER" && "bg-emerald-50 text-emerald-700",
                        channel === "BANNER" && "bg-amber-50 text-amber-700",
                        channel === "HERO" && "bg-sky-50 text-sky-700"
                      )}>
                        {channel.toLowerCase()}
                      </span>
                      {live ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                          <CheckCircle2 size={14} /> Live
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                          <Clock size={14} /> Scheduled/Inactive
                        </span>
                      )}
                      <span className="text-xs text-gray-400">prio {a.priority ?? 5}</span>
                    </div>
                    <div className="mt-1 font-medium text-black truncate">
                      {a.emoji ? `${a.emoji} ` : ""}{a.message}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      {a.ctaText && a.ctaHref && (
                        <span className="inline-flex items-center gap-1">
                          <LinkIcon size={14} /> {a.ctaText} → {a.ctaHref}
                        </span>
                      )}
                      {a.startAt && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={14}/> {new Date(a.startAt).toLocaleString()}
                        </span>
                      )}
                      {a.endAt && (
                        <span className="inline-flex items-center gap-1">
                          <Calendar size={14}/> till {new Date(a.endAt).toLocaleString()}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Globe size={14}/> {audience.toLowerCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Move up"
                      onClick={() => move(i, -1)}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Move down"
                      onClick={() => move(i, +1)}
                    >
                      <ArrowDown size={16} />
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title={a.active ? "Deactivate" : "Activate"}
                      onClick={() => toggleActive(a)}
                      className={a.active ? "text-emerald-700" : "text-black"}
                    >
                      {a.active ? <EyeOff size={16}/> : <Eye size={16}/>}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      title="Edit"
                      onClick={() => startEdit(a)}
                    >
                      <Pencil size={16}/>
                    </Button>

                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      title="Delete"
                      onClick={() => handleDelete(a.id)}
                    >
                      <Trash2 size={16}/>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
