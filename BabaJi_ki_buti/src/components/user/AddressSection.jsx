// src/page/address/AddressPage.jsx
import React, { useEffect, useState } from "react";
import { MapPin, Plus, Edit2, Trash2, Home, Briefcase } from "lucide-react";
import { addressApi } from "../../auth/address/addressApi";
import { useMe } from "../../auth/user/useMe";
import { useNavigate, useLocation } from "react-router-dom";

export default function AddressSection({ userId: userIdProp }) {
  const { me, loading: meLoading } = (typeof useMe === "function" ? useMe() : {}) || {};
  const userId = userIdProp ?? me?.id ?? null;
  const navigate = useNavigate();

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const nextPath = params.get("next");

  // ---------------- guard: require auth ----------------
  useEffect(() => {
    if (!meLoading && !userId) {
      navigate("/login?next=/address", { replace: true });
    }
  }, [meLoading, userId, navigate]);

  // ---------------- cache helpers ----------------
  const cacheKey = userId ? `addr_cache:${userId}` : null;
  const bumpKey  = userId ? `addr_bump:${userId}` : null; // 👈 unified bump key

  const readCache = () => {
    if (!cacheKey) return null;
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed?.addresses)) return null;
      return parsed.addresses;
    } catch {
      return null;
    }
  };

  const writeCache = (list) => {
    if (!cacheKey) return;
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ addresses: list ?? [] }));
    } catch {
      /* ignore quota errors */
    }
  };

  const bump = () => {
    if (!bumpKey) return;
    try {
      localStorage.setItem(bumpKey, String(Date.now()));
      window.dispatchEvent(new CustomEvent("address:changed")); // 👈 unified event name
    } catch {}
  };

  const clearCache = () => {
    if (!cacheKey) return;
    try {
      localStorage.removeItem(cacheKey);
    } catch {
      /* ignore */
    }
  };

  // ---------------- state ----------------
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const emptyForm = () => ({
    name: "",
    phone: "",
    pincode: "",
    locality: "",
    address: "",
    city: "",
    state: "",
    landmark: "",
    alternatePhone: "",
    type: "HOME",
  });

  const [formData, setFormData] = useState(emptyForm());

  // -------- helpers ----------
  const dedupeAndNormalize = (list) => {
    const byId = new Map();
    for (const a of list || []) {
      const key = a?.id ?? a?.addressId;
      if (!key) continue;
      // ensure id exists and make sure type is uppercase for UI
      const typeUp = String(a?.type || a?.addressType || "Home").toUpperCase();
      byId.set(key, { ...a, id: key, type: typeUp });
    }
    let seenDefault = false;
    const out = Array.from(byId.values()).map((a) => {
      let isDefault = !!a.isDefault;
      if (isDefault) {
        if (seenDefault) isDefault = false;
        else seenDefault = true;
      }
      return { ...a, isDefault };
    });
    return out;
  };

  const setAddressesAndCache = (updater) => {
    setAddresses((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      const normalized = dedupeAndNormalize(next);
      writeCache(normalized);
      return normalized;
    });
  };

  const refresh = async () => {
    if (!userId) return;
    setLoading(true);
    setError("");
    try {
      // 1) Load list
      const raw = await addressApi.list(userId);
      let normalized = dedupeAndNormalize(raw);

      // 2) Ask backend who is default (authoritative)
      try {
        const def = await addressApi.getDefault(userId);
        const defId = def?.id ?? def?.addressId;
        if (defId != null) {
          normalized = normalized.map((a) => ({
            ...a,
            isDefault: (a.id ?? a.addressId) === defId,
          }));
        }
      } catch {
        // If /default not implemented, rely on list shape
      }

      setAddresses(normalized);
      writeCache(normalized);
    } catch (e) {
      console.error("address load failed", e);
      setError(e?.message || "Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  // -------- effects ----------
  useEffect(() => {
    if (!userId) return;
    const cached = readCache();
    if (cached) {
      setAddresses(dedupeAndNormalize(cached));
      setLoading(false);
      refresh();
    } else {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Listen for cross-tab/page changes & custom events
  useEffect(() => {
    if (!userId) return;
    const onChange = () => refresh();
    const onStorage = (e) => {
      if (e.key === bumpKey) refresh();
    };
    window.addEventListener("address:changed", onChange);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("address:changed", onChange);
      window.removeEventListener("storage", onStorage);
    };
  }, [userId, bumpKey]);

  // -------- UI handlers ----------
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditingId(null);
    setFormData(emptyForm());
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    const {
      isDefault,
      id,
      addressId,
      altPhone,
      alternatePhone,
      addressType,
      type,
      ...rest
    } = addr;
    const alt = altPhone ?? alternatePhone ?? "";
    // Ensure form type is uppercase for the radios
    const formType = String(type || addressType || "HOME").toUpperCase();
    setFormData({ ...rest, alternatePhone: alt, type: formType });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this address?")) return;
    setDeletingId(id);
    setError("");

    const prev = addresses;
    const optimistic = prev.filter((a) => a.id !== id);
    setAddressesAndCache(optimistic);

    try {
      await addressApi.remove(userId, id);
      bump(); // notify others just in case default changed
    } catch (e) {
      console.error("delete failed", e);
      setError(e?.message || "Failed to delete address");
      setAddressesAndCache(prev);
    } finally {
      setDeletingId(null);
    }
  };

  const validate = (data) => {
    const req = ["name", "phone", "pincode", "locality", "address", "city", "state"];
    for (const k of req) {
      if (!String(data[k] || "").trim()) return `Please fill ${k}`;
    }
    if (!/^\d{10}$/.test(data.phone)) return "Phone must be 10 digits";
    if (!/^\d{6}$/.test(data.pincode)) return "Pincode must be 6 digits";
    return "";
  };

  const handleSubmit = async () => {
    const msg = validate(formData);
    if (msg) {
      alert(msg);
      return;
    }
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        // Update (optimistic)
        const prev = addresses;
        const optimistic = prev.map((a) =>
          a.id === editingId ? { ...a, ...formData } : a
        );
        setAddressesAndCache(optimistic);

        const updated = await addressApi.update(userId, editingId, formData);
        setAddressesAndCache((list) =>
          list.map((a) =>
            a.id === editingId ? { ...a, ...updated, id: updated?.id ?? editingId } : a
          )
        );
        bump();
      } else {
        // Create (optimistic)
        const tempId = `tmp-${Date.now()}`;
        const temp = { ...formData, id: tempId, isDefault: false };
        const wasEmpty = addresses.length === 0;
        const hadDefault = addresses.some((a) => a.isDefault);
        setAddressesAndCache((list) => [...list, temp]);

        const created = await addressApi.create(userId, formData);
        const createdId = created?.id ?? created?.addressId;
        setAddressesAndCache((list) =>
          list.map((a) => (a.id === tempId ? { ...created, id: createdId || a.id } : a))
        );

        // If this is the first address or there was no default, auto-set default
        if (wasEmpty || !hadDefault) {
          setAddressesAndCache((list) =>
            list.map((a) => ({ ...a, isDefault: (a.id ?? a.addressId) === (createdId || a.id) }))
          );
          try {
            const serverDefault = await addressApi.makeDefault(userId, createdId);
            setAddressesAndCache((list) =>
              list.map((a) =>
                (a.id ?? a.addressId) === createdId
                  ? { ...a, ...serverDefault, isDefault: true }
                  : { ...a, isDefault: false }
              )
            );
            bump(); // notify PaymentSection
          } catch (e) {
            console.warn("Auto-set default failed (non-fatal)", e);
          }
        } else {
          bump();
        }
      }

      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm());
    } catch (e) {
      console.error("save failed", e);
      setError(e?.message || "Failed to save address");
      refresh();
    } finally {
      setSaving(false);
    }
  };

  // AddressPage.jsx
  const handleSetDefault = async (id) => {
    if (settingDefaultId) return; // Prevent double requests
    setSettingDefaultId(id);
    setError(null);

    // Optimistically update local state so UI reflects change immediately
    const prev = addresses;
    const optimistic = prev.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddressesAndCache(optimistic);

    try {
      // Make API call to backend to persist change
      const updatedAddr = await addressApi.makeDefault(userId, id);

      // Update state again with the server response, in case other details changed
      setAddressesAndCache((list) =>
        list.map((a) =>
          a.id === id ? { ...a, ...updatedAddr, isDefault: true } : { ...a, isDefault: false }
        )
      );

      // Notify other tabs/pages (PaymentSection and others)
      bump();

      // If user came from payment, optionally redirect them there
      if (nextPath) setTimeout(() => navigate(nextPath, { replace: true }), 10);
    } catch (e) {
      // On failure, revert optimistic change and notify error
      setError(e?.message || "Failed to set default");
      setAddressesAndCache(prev);
    } finally {
      setSettingDefaultId(null);
    }
  };

  // Selected/default address (enables checkout)
  const defaultAddr = addresses.find((a) => a.isDefault);

  // ---------------- UI ----------------
  return (
    <div className="min-h-screen bg-[#faeade]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#faeade] to-[#f7d8c9] border-b border-[#f1c5b6] h-56">
        <div className=" max-w-6xl mx-auto px-4 py-25  ">
          <div className="flex items-center justify-center gap-3 mt-5">
            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/70 ring-1 ring-[#f1c5b6] shadow-sm">
              <MapPin className="w-5 h-5 text-[#c85f46]" />
            </span>
            <h1 className="text-3xl tracking-wide font-semibold text-[#47332e]">
              Manage Addresses
            </h1>
          </div>
          {error ? (
            <p className="mt-3 text-center text-sm text-red-600">{error}</p>
          ) : null}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        {loading ? (
          <div className="py-20 text-center text-[#6b4c43]">Loading addresses…</div>
        ) : (
          <>
            {/* Checkout button (enabled only if a default address exists) */}
            <div className="mt-2 mb-4 flex justify-end">
              <button
                onClick={() => navigate("/payment")}
                disabled={!defaultAddr}
                className={`px-5 py-3 rounded-lg font-semibold shadow-sm transition
                  ${
                    defaultAddr
                      ? "bg-[#cc7f66] text-white hover:bg-[#b86f59]"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                aria-disabled={!defaultAddr}
                title={defaultAddr ? "Proceed to payment" : "Select an address to continue"}
              >
                {defaultAddr ? "Checkout" : "Select an address to continue"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Add New Address */}
              <button
                type="button"
                onClick={handleAddNew}
                className="relative rounded-2xl p-8 bg-white/60 backdrop-blur border border-dashed border-[#f1c5b6] ring-1 ring-inset ring-[#f7d8c9] hover:bg-[#fdeee7] hover:translate-y-[-2px] transition-all shadow-sm"
              >
                <div className="w-16 h-16 mx-auto bg-[#e6a995] rounded-full flex items-center justify-center mb-4 shadow">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <p className="text-center text-lg font-semibold text-[#c85f46]">
                  Add a New Address
                </p>
                <p className="mt-2 text-center text-sm text-[#85655c]">
                  Save multiple locations for faster checkout
                </p>
              </button>

              {/* Address Cards */}
              {addresses.map((addr) => (
                <div
                  key={addr.id ?? addr.addressId}
                  onClick={() => {
                    if (!addr.isDefault && !settingDefaultId) {
                      handleSetDefault(addr.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative rounded-2xl p-5 bg-white/80 backdrop-blur border border-[#f1c5b6] ring-1 ring-inset ring-[#f7d8c9] shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all"
                >
                  {addr.isDefault && (
                    <div className="absolute -top-2 -right-2">
                      <span className="inline-block rounded-full bg-[#f7d8c9] text-[#8d5b4f] text-[11px] px-3 py-1 shadow">
                        Default
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 bg-[#fdeee7] text-[#6b4c43] px-3 py-1 rounded-full text-xs ring-1 ring-[#f1c5b6]">
                      {addr.type === "WORK" ? (
                        <Briefcase className="w-3.5 h-3.5" />
                      ) : (
                        <Home className="w-3.5 h-3.5" />
                      )}
                      {addr.type || "HOME"}
                    </span>
                  </div>

                  <div className="mb-2">
                    <p className="font-semibold text-[#3d2b26] text-base leading-6">
                      {addr.name}
                    </p>
                    <p className="text-[#6b4c43] text-sm">{addr.phone}</p>
                  </div>

                  <div className="text-[#6b4c43] text-sm leading-relaxed space-y-0.5 mt-3">
                    <p>{addr.address}</p>
                    <p>{addr.locality}</p>
                    <p>
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    {addr.landmark ? <p>Landmark: {addr.landmark}</p> : null}
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#f3cbbd] flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card-select
                        handleEdit(addr);
                      }}
                      className="inline-flex items-center gap-1.5 text-[#b1614d] hover:text-[#8f4f3f] text-sm font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      disabled={deletingId === addr.id}
                      onClick={(e) => {
                        e.stopPropagation(); // prevent card-select
                        handleDelete(addr.id);
                      }}
                      className="inline-flex items-center gap-1.5 text-[#6b4c43] hover:text-[#b94a4a] text-sm font-medium disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      {deletingId === addr.id ? "Deleting..." : "Delete"}
                    </button>

                    {!addr.isDefault && (
                      <button
                        disabled={!!settingDefaultId}
                        onClick={(e) => {
                          e.stopPropagation(); // prevent card-select
                          handleSetDefault(addr.id);
                        }}
                        className="ml-auto inline-flex items-center justify-center rounded-full text-sm font-semibold px-3 py-1.5 ring-1 ring-inset ring-[#e6a995] text-[#b1614d] hover:bg-[#fdeee7] disabled:opacity-60"
                      >
                        {settingDefaultId === addr.id ? "Setting…" : "Set Default"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ring-1 ring-[#f1c5b6] shadow-xl">
              <div className="sticky top-0 bg-gradient-to-r from-[#fff] to-[#fdeee7] border-b border-[#f3cbbd] px-6 py-4 rounded-t-2xl">
                <h2 className="text-xl font-semibold text-[#3d2b26]">
                  {editingId ? "Edit Address" : "Add a New Address"}
                </h2>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6b4c43] mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#f1c5b6] focus:outline-none focus:ring-2 focus:ring-[#e6a995] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6b4c43] mb-1">
                      10-digit mobile number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      maxLength="10"
                      className="w-full px-3 py-2 rounded-lg border border-[#f1c5b6] focus:outline-none focus:ring-2 focus:ring-[#e6a995] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6b4c43] mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      maxLength="6"
                      className="w-full px-3 py-2 rounded-lg border border-[#f1c5b6] focus:outline-none focus:ring-2 focus:ring-[#e6a995] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6b4c43] mb-1">
                      Locality <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="locality"
                      value={formData.locality}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#f1c5b6] focus:outline-none focus:ring-2 focus:ring-[#e6a995] bg-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-[#6b4c43] mb-1">
                    Address (Area and Street) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-2 rounded-lg border border-[#f1c5b6] focus:outline-none focus:ring-2 focus:ring-[#e6a995] bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-[#6b4c43] mb-1">
                      City/District/Town <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#f1c5b6] focus:outline-none focus:ring-2 focus:ring-[#e6a995] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6b4c43] mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#f1c5b6] focus:outline-none focus:ring-2 focus:ring-[#e6a995] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6b4c43] mb-1">
                      Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-[#f1c5b6] focus:outline-none focus:ring-2 focus:ring-[#e6a995] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6b4c43] mb-1">
                      Alternate Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleInputChange}
                      maxLength="10"
                      className="w-full px-3 py-2 rounded-lg border border-[#f1c5b6] focus:outline-none focus:ring-2 focus:ring-[#e6a995] bg-white"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-[#6b4c43] mb-2">
                    Address Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="HOME"
                        checked={formData.type === "HOME"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <Home className="w-4 h-4 mr-1 text-[#6b4c43]" />
                      <span className="text-[#6b4c43]">Home</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="type"
                        value="WORK"
                        checked={formData.type === "WORK"}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <Briefcase className="w-4 h-4 mr-1 text-[#6b4c43]" />
                      <span className="text-[#6b4c43]">Work</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 justify-end">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData(emptyForm());
                    }}
                    className="px-6 py-2 rounded-lg ring-1 ring-inset ring-[#f1c5b6] text-[#6b4c43] hover:bg-[#fdeee7] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    onClick={handleSubmit}
                    className="px-6 py-2 rounded-lg bg-[#cc7f66] text-white hover:bg-[#b86f59] font-medium disabled:opacity-50"
                  >
                    {saving ? "Saving…" : editingId ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
