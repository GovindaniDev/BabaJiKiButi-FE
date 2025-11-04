import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams, useLocation, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Truck, MapPin, CheckCircle2, Clock, XCircle, ChevronRight, Phone,
  Package, ArrowLeft, RefreshCcw, Download, ReceiptText, ShieldCheck, Sparkles, Percent, Wallet
} from "lucide-react";

import { cartApi } from "../../auth/cart/cartApi";
import { useAuth } from "../../auth/AuthContext";
import { useMe } from "../../auth/user/useMe";
import { app } from "../../auth/http";
import { addressApi } from "../../auth/address/addressApi";
import {
  getOrder,
  getOrderTimeline,
  trackOrder,
  requestRefund,
  requestReturn,
} from "../../api/engagementApi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { buildFlipkartInvoice } from "../../utils/invoicePdf";
/* money fmt */
const INR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number(n || 0));

/* -------------------------- helpers / fallbacks -------------------------- */
async function _getOrder(orderId) {
  if (!orderId) return null;
  try {
    if (typeof getOrder === "function") return await getOrder(orderId, { useDemo: true }); // hydrates items
    const { data } = await app.get(`/orders/${orderId}`);
    return data?.data ?? data ?? null;
  } catch {
    return {
      id: String(orderId),
      placedAt: null,
      amount: 0,
      status: "Processing",
      items: [],
      shipping: null,
    };
  }
}
async function _getTimeline(orderId) {
  if (typeof getOrderTimeline === "function") {
    try { return await getOrderTimeline(orderId, { useDemo: true }); }
    catch { /* fall through */ }
  }
  try {
    const tr = await trackOrder(orderId, { useDemo: true });
    const events = Array.isArray(tr?.events) ? tr.events : [];
    if (events.length) {
      return events.map((e, i) => ({
        key: String(i),
        title: e.status || e.title || "Update",
        at: e.at || e.time || null,
        desc: e.location || e.note || "",
      }));
    }
  } catch {}
  return [
    { key: "Confirmed", title: "Order Confirmed", at: null, desc: "" },
    { key: "processing", title: "Processing", at: null, desc: "" },
    { key: "Outfordelivery", title: "Out for delivery", at: null, desc: "" },
    { key: "delivered", title: "Delivered", at: null, desc: "" },
  ];
}
async function _requestReturn(payload = { orderId: "", items: [], reason: "Other", note: "" }) {
  if (!payload?.orderId) throw new Error("orderId required");
  try {
    if (typeof requestReturn === "function") return await requestReturn(payload, { useDemo: true });
    const { data } = await app.post(`/orders/${payload.orderId}/returns`, payload);
    return data?.data ?? data ?? { ok: true };
  } catch (e) { throw e; }
}
async function _requestRefund(payload = { orderId: "", method: "original", upiId: "", bank: { name: "", acct: "", ifsc: "" } }) {
  if (!payload?.orderId) throw new Error("orderId required");
  try {
    if (typeof requestRefund === "function") return await requestRefund(payload, { useDemo: true });
    const { data } = await app.post(`/orders/${payload.orderId}/refunds`, payload);
    return data?.data ?? data ?? { ok: true };
  } catch (e) { throw e; }
}

/* -------------------------------- UI bits -------------------------------- */
function Pill({ tone = "slate", children }) {
  const m = {
    slate: "bg-slate-50 text-slate-700 border-slate-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    red: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${m[tone]}`}>{children}</span>;
}
function StatusBadge({ status }) {
  if (status === "Delivered") return <Pill tone="green"><CheckCircle2 className="h-3.5 w-3.5" /> Delivered</Pill>;
  if (status === "Cancelled") return <Pill tone="red"><XCircle className="h-3.5 w-3.5" /> Cancelled</Pill>;
  if (status === "Shipped" || status === "Out for delivery") return <Pill tone="blue"><Truck className="h-3.5 w-3.5" /> {status}</Pill>;
  return <Pill tone="amber"><Clock className="h-3.5 w-3.5" /> {status || "Processing"}</Pill>;
}
function Step({ active, done, title, at, desc }) {
  return (
    <div className="relative pl-7">
      <div className={`absolute left-0 top-0 h-5 w-5 rounded-full border flex items-center justify-center ${done ? "bg-emerald-600 border-emerald-600 text-white" : active ? "border-emerald-600 text-emerald-600" : "border-slate-300 text-slate-300"}`}>
        <CheckCircle2 className="h-3.5 w-3.5" />
      </div>
      <div className="font-medium">{title}</div>
      <div className="text-xs text-gray-500">{at ? new Date(at).toLocaleString() : ""} {desc ? `• ${desc}` : ""}</div>
    </div>
  );
}
function Timeline({ steps = [], status = "Processing" }) {
  const indices = useMemo(() => {
    const map = { Placed: 0, Processing: 1, Shipped: 2, "Out for delivery": 2, Delivered: 3, Cancelled: 3 };
    return { cur: map[status] ?? 0 };
  }, [status]);
  return (
    <div className="rounded-2xl border bg-white p-5">
      <h3 className="font-semibold mb-3">Tracking</h3>
      <div className="space-y-5">
        {steps.map((s, i) => (
          <div key={s.key || i} className="relative">
            {i !== 0 && <div className={`absolute left-[9px] -top-5 w-[2px] h-5 ${i <= indices.cur ? "bg-emerald-500" : "bg-slate-200"}`} />}
            <Step active={i === indices.cur} done={i < indices.cur} title={s.title} at={s.at} desc={s.desc} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- Return Dialog ----------------------------- */
function ReturnDialog({ open = false, onClose = () => {}, order = null, onSubmitted = () => {} }) {
  const [selected, setSelected] = useState(() =>
    (order?.items || []).map((it) => ({ itemId: it.id ?? it.itemId, qty: 0 }))
  );
  const [reason, setReason] = useState("Wrong/Defective product");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (open) {
      setSelected((order?.items || []).map((it) => ({ itemId: it.id ?? it.itemId, qty: 0 })));
      setReason("Wrong/Defective product");
      setNote("");
    }
  }, [open, order]);

  if (!open) return null;

  const setQty = (idx, qty, max) => {
    const v = Math.max(0, Math.min(Number(qty || 0), Number(max || 1)));
    setSelected((s) => s.map((x, i) => (i === idx ? { ...x, qty: v } : x)));
  };

  const submit = async () => {
    const items = selected.filter((x) => x.qty > 0);
    if (!items.length) return toast.error("Select at least one item to return");
    try {
      await _requestReturn({ orderId: order.id, items, reason, note });
      toast.success("Return request submitted");
      onSubmitted();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Return failed");
    }
  };




  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="w-full md:max-w-2xl bg-white rounded-t-2xl md:rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Return / Replace</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-sm text-gray-600">Select items and quantities to return.</div>
          <div className="space-y-3">
            {(order?.items || []).map((it, i) => {
              const max = Number(it.qty ?? it.quantity ?? 1);
              return (
                <div key={i} className="flex items-center gap-3 border rounded-xl p-3">
                  <img src={it.image || it.img || "/images/placeholder.png"} onError={(e)=>e.currentTarget.src="/images/placeholder.png"} className="h-12 w-12 rounded-lg object-cover border" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium line-clamp-1">{it.name}</div>
                    <div className="text-xs text-gray-500">Ordered: {max}</div>
                  </div>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    value={selected[i]?.qty || 0}
                    onChange={(e) => setQty(i, e.target.value, max)}
                    className="w-20 px-2 py-1.5 rounded-lg border text-sm"
                  />
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600">Reason</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full mt-1 rounded-xl border px-3 py-2 text-sm">
                <option>Wrong/Defective product</option>
                <option>Missing/Incomplete item</option>
                <option>Quality not as expected</option>
                <option>Arrived late</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Note (optional)</label>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the issue" className="w-full mt-1 rounded-xl border px-3 py-2 text-sm" />
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
            Pickup will be scheduled after approval. Keep items in original packaging.
          </div>
        </div>
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
          <button onClick={submit} className="px-4 py-2 rounded-xl bg-black text-white">Submit Request</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- Refund Dialog ----------------------------- */
function RefundDialog({ open = false, onClose = () => {}, order = null, onSubmitted = () => {} }) {
  const [method, setMethod] = useState("original");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState({ name: "", acct: "", ifsc: "" });

  useEffect(() => {
    if (open) {
      setMethod("original");
      setUpiId("");
      setBank({ name: "", acct: "", ifsc: "" });
    }
  }, [open]);

  if (!open) return null;

  const submit = async () => {
    try {
      const payload = { orderId: order.id, method, upiId, bank };
      if (method === "upi" && !/^[\w.\-]{2,}@[a-z]{2,}$/i.test(upiId)) {
        return toast.error("Enter valid UPI ID");
      }
      if (method === "bank" && (!bank.name || !bank.acct || !bank.ifsc)) {
        return toast.error("Fill bank details");
      }
      await _requestRefund(payload);
      toast.success("Refund request submitted");
      onSubmitted();
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Refund failed");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center p-0 md:p-6">
      <div className="w-full md:max-w-lg bg-white rounded-t-2xl md:rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Request Refund</h3>
          <button onClick={onClose} className="text-sm text-gray-500">Close</button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-sm text-gray-600">Choose how you’d like to receive your money.</div>
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="radio" name="refmethod" value="original" checked={method === "original"} onChange={() => setMethod("original")} />
              <span className="text-sm">Original payment method</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" name="refmethod" value="upi" checked={method === "upi"} onChange={() => setMethod("upi")} />
              <span className="text-sm">UPI</span>
            </label>
            {method === "upi" && (
              <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. username@upi" className="w-full rounded-xl border px-3 py-2 text-sm" />
            )}
            <label className="flex items-center gap-2">
              <input type="radio" name="refmethod" value="bank" checked={method === "bank"} onChange={() => setMethod("bank")} />
              <span className="text-sm">Bank transfer (NEFT)</span>
            </label>
            {method === "bank" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input placeholder="Account holder" value={bank.name} onChange={(e) => setBank({ ...bank, name: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
                <input placeholder="Account number" value={bank.acct} onChange={(e) => setBank({ ...bank, acct: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
                <input placeholder="IFSC" value={bank.ifsc} onChange={(e) => setBank({ ...bank, ifsc: e.target.value })} className="rounded-xl border px-3 py-2 text-sm" />
              </div>
            )}
          </div>
          <div className="rounded-xl bg-slate-50 border p-3 text-xs text-gray-600">
            Refunds are initiated after pickup/quality check (as applicable).
          </div>
        </div>
        <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
          <button onClick={submit} className="px-4 py-2 rounded-xl bg-black text-white">Submit</button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- totals from hydrated items ----------------------- */
function totalsFromOrder(order) {
  const items = Array.isArray(order?.items) ? order.items : [];
  let listing = 0;
  let special = 0;
  for (const it of items) {
    const qty = Number(it.qty ?? it.quantity ?? 1);
    const mrp = Number(it.originalPrice ?? it.mrp ?? it.mrpPrice ?? it.price ?? 0);
    const sell = Number(it.sellingPrice ?? it.price ?? 0);
    listing += (mrp > 0 ? mrp : sell) * qty;
    special += sell * qty;
  }
  const fees = 0;
  const totalAmount = special + fees;
  const savings = Math.max(0, listing - special);
  return { listing, special, fees, totalAmount, savings, qty: items.reduce((q, it) => q + Number(it.qty ?? it.quantity ?? 1), 0) };
}


// Build a client-side PDF when there's no server invoiceUrl
function buildInvoicePdf({ order, address, totals }) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const padX = 40;
  const padY = 40;

  // -------- Header --------
  doc.setFontSize(18).setFont("helvetica", "bold");
  doc.text("Tax Invoice", padX, padY);

  doc.setFontSize(10).setFont("helvetica", "normal");
  // Your brand (adjust)
  doc.text("Babaji Ki Buti", padX, padY + 18);
  doc.text("support@babajikibuti.com", padX, padY + 33);

  // Order meta (right)
  const rightX = 420;
  doc.setFont("helvetica", "bold");
  doc.text(`Order #${order.orderNumber || order.id}`, rightX, padY);
  doc.setFont("helvetica", "normal");
  doc.text(`Placed: ${order.placedAt ? new Date(order.placedAt).toLocaleString() : "-"}`, rightX, padY + 16);
  doc.text(`Payment: ${order.paymentMode || order.paymentMethod || "—"}`, rightX, padY + 32);
  if (order.trackingId) doc.text(`Tracking: ${order.trackingId}`, rightX, padY + 48);

  // -------- Billing / Shipping --------
  const ship = address || order.shipping || {};
  const addrLines = [
    ship?.name || "",
    ship?.address || ship?.line1 || "",
    [ship?.locality, ship?.line2].filter(Boolean).join(", "),
    [ship?.city, ship?.state, ship?.pincode || ship?.pinCode].filter(Boolean).join(", "),
    ship?.phone || ship?.mobile ? `Phone: ${ship.phone || ship.mobile}` : ""
  ].filter(Boolean);

  doc.setFont("helvetica", "bold");
  doc.text("Deliver To", padX, padY + 70);
  doc.setFont("helvetica", "normal");
  addrLines.forEach((t, i) => doc.text(t, padX, padY + 88 + i * 14));

  // -------- Items table --------
  const rows = (order.items || []).map((it) => {
    const qty = Number(it.qty ?? it.quantity ?? 1);
    const mrp = Number(it.originalPrice ?? it.mrp ?? it.mrpPrice ?? it.price ?? 0);
    const rate = Number(it.sellingPrice ?? it.price ?? 0);
    const line = rate * qty;
    return [
      (it.name || "Item") + (it.variantLabel ? ` (${it.variantLabel})` : ""),
      String(qty),
      `₹${rate.toFixed(0)}`,
      mrp > rate ? `₹${mrp.toFixed(0)}` : "—",
      `₹${line.toFixed(0)}`
    ];
  });

  autoTable(doc, {
    startY: padY + 150,
    head: [["Item", "Qty", "Price", "MRP", "Amount"]],
    body: rows,
    styles: { font: "helvetica", fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [33, 33, 33] },
    columnStyles: {
      1: { halign: "right", cellWidth: 50 },
      2: { halign: "right", cellWidth: 70 },
      3: { halign: "right", cellWidth: 70 },
      4: { halign: "right", cellWidth: 90 },
    },
  });

  // -------- Totals block --------
  const y = doc.lastAutoTable.finalY + 14;
  const line = (label, val, bold = false) => {
    if (bold) doc.setFont("helvetica", "bold");
    else doc.setFont("helvetica", "normal");
    doc.text(label, rightX, yLine);
    doc.text(val, rightX + 160, yLine, { align: "right" });
  };

  let yLine = y;
  line("Listing price", `₹${totals.listing.toFixed(0)}`); yLine += 16;
  line("Special price", `₹${totals.special.toFixed(0)}`); yLine += 16;
  line("Fees", `₹${(totals.fees || 0).toFixed(0)}`); yLine += 10;
  doc.setDrawColor(200); doc.line(rightX, yLine, rightX + 160, yLine); yLine += 18;
  line("Total amount", `₹${totals.totalAmount.toFixed(0)}`, true);

  if (totals.listing > totals.special) {
    doc.setTextColor(15, 115, 61);
    doc.text(`You saved ₹${(totals.listing - totals.special).toFixed(0)} 🎉`, rightX, yLine + 18);
    doc.setTextColor(0, 0, 0);
  }

  // Footer
  const h = doc.internal.pageSize.getHeight();
  doc.setFontSize(9).setFont("helvetica", "normal");
  doc.text("This is a computer-generated invoice. Prices include taxes where applicable.", padX, h - 40);

  // Save
  doc.save(`Invoice_${order.orderNumber || order.id}.pdf`);
}

/* --------------------------------- Page --------------------------------- */
export default function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const preload = location?.state?.order || null; // ⬅️ preloaded from Account page
  const { isAuthenticated } = useAuth() || {};
  const { me } = useMe();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [order, setOrder] = useState(preload || null);
  const [timeline, setTimeline] = useState([]);
  const [pending, setPending] = useState(!preload);

  // address
  const [addr, setAddr] = useState(null);
  const [addrLoading, setAddrLoading] = useState(true);
  const [addrError, setAddrError] = useState("");

  // dialogs default from ?action=
  const [returnOpen, setReturnOpen] = useState(params.get("action") === "return");
  const [refundOpen, setRefundOpen] = useState(params.get("action") === "refund");

  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    (async () => {
      try {
        setPending(!preload);
        const [oRaw, t] = await Promise.all([_getOrder(id), _getTimeline(id)]);

        // ✅ Keep preloaded items if the fetched order has none
        const o =
          (oRaw && (!Array.isArray(oRaw.items) || oRaw.items.length === 0) && preload?.items?.length)
            ? { ...oRaw, items: preload.items }
            : oRaw;

        if (!alive) return;
        setOrder(o);

        const std = [
          { key: "Confirmed", title: "Order Confirmed", at: o?.placedAt, desc: "" },
          { key: "processing", title: "Processing", at: o?.acceptedAt || o?.processingAt, desc: "" },
          { key: "Out for delivery", title: "Out for delivery", at: o?.shippedAt, desc: o?.courier || "" },
          { key: "delivered", title: "Delivered", at: o?.deliveredOn, desc: "" },
        ];
        setTimeline(Array.isArray(t) && t.length ? t : std);
      } catch (e) {
        toast.error(e?.response?.data?.message || e?.message || "Failed to load order");
      } finally {
        if (alive) setPending(false);
      }
    })();
    return () => { alive = false; };
  }, [id, isAuthenticated, preload]);

  // fetch default address
  useEffect(() => {
    if (!me?.id) return;
    let ignore = false;
    (async () => {
      try {
        setAddrLoading(true);
        setAddrError("");
        const a = await addressApi.getDefault(me.id);
        if (!ignore) setAddr(a || null);
      } catch (e) {
        if (!ignore) setAddrError(e?.message || "Failed to load default address");
      } finally {
        if (!ignore) setAddrLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [me?.id]);

const onDownloadInvoice = async (e) => {
  e.preventDefault();

  // 1) If server provides invoice PDF URL, download that
  if (order.invoiceUrl) {
    try {
      const res = await fetch(order.invoiceUrl, { credentials: "include" });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${order.orderNumber || order.id}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {}
  }

  // 2) Else generate Flipkart-style client PDF
  await buildFlipkartInvoice({
    order,
    address: addr || order.shipping,
    totals,
    seller: {
      name: "Tech-Connect Retail Private Limited",
      gstin: "06AAICA4872D1ZS",
      pan: "AAICA4872D",
      cin: "U52100HR2010PTC068415",
      stateCode: "HR",
      addressLines: [
        "Regd. office: Rectangle No. 06, Rectangle No. 08 and Rectangle No. 13, Village- Khaliqpur, Tehsil- Bahli,",
        "District- Jhajjar/F.C- FarukhNagar, Jhajjar, Haryana - 124103, IN-HR."
      ],
      fromAddressLines: [
        "Ship-from Address: Rectangle No. 08, ..., Jhajjar, Haryana - 124103, IN-HR.",
      ],
    },
    options: {
      defaultGstPct: 18,
      brandName: "Babaji Ki Buti",
      // brandLogoBase64: "data:image/png;base64,....",   // optional
      // thankYouBase64: "data:image/png;base64,....",    // optional
      // signatureBase64: "data:image/png;base64,....",   // optional
    },
  });
};


  const canReturn = useMemo(() => {
    if (!order) return false;
    if (order.status !== "Delivered") return false;
    const deliveredAt = order.deliveredOn ? new Date(order.deliveredOn).getTime() : 0;
    return deliveredAt && Date.now() - deliveredAt <= 7 * 24 * 60 * 60 * 1000 && !order.returnRequested;
  }, [order]);

  const canRefund = useMemo(() => {
    if (!order) return false;
    const prepaid = (order.paymentMode || order.paymentMethod || "").toLowerCase() !== "cod";
    return (prepaid && order.status === "Delivered") || !!order.refundEligible;
  }, [order]);

  const totals = useMemo(() => totalsFromOrder(order), [order]);

  const onReorder = async () => {
    try {
      if (!Array.isArray(order?.items) || !order.items.length) return;
      for (const it of order.items) {
        const productId = it.productId ?? it.id;
        const quantity = Number(it.qty ?? it.quantity ?? 1);
        const productVariantId = it.productVariantId ?? it.variantId ?? undefined;
        if (typeof cartApi?.add === "function") {
          await cartApi.add({ productId, quantity, productVariantId });
        } else if (typeof cartApi?.addItem === "function") {
          await cartApi.addItem({ productId, quantity, productVariantId });
        }
      }
      toast.success("Items added to your cart");
      navigate("/cart");
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.message || "Failed to reorder");
    }
  };

  const onTrack = async () => {
    try {
      const res = await trackOrder(order.id, { useDemo: true });
      if (!res) return toast.error("Tracking unavailable");
      toast.success(
        [
          res.trackingId ? `Tracking: ${res.trackingId}` : "",
          res.status ? `Status: ${res.status}` : "",
          res.eta ? `ETA: ${new Date(res.eta).toLocaleDateString()}` : "",
        ].filter(Boolean).join(" • ")
      );
    } catch {
      toast.error("Failed to fetch tracking");
    }
  };

  if (!isAuthenticated) {
    return <div className="max-w-6xl mx-auto p-6 pt-28 text-center">Please log in to view this order.</div>;
  }
  if (pending) {
    return <div className="max-w-6xl mx-auto p-6 pt-36 text-center">Loading order…</div>;
  }
  if (!order) {
    return <div className="max-w-6xl mx-auto p-6 pt-24 text-red-600">Order not found.</div>;
  }

  // Prefer address from addressApi; fallback to order.shipping
  const shipping = addr || order.shipping || null;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-30 md:py-28">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl border" title="Back">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight gap-3">Order  {">"}  {(order.items || []).map((it, idx) => {
             
                 return(
                  <>
                    <span className="text-gray">{it.name || "Item"}</span>
                  </>
                 )
              })}</h1>
            {/* <div className="text-sm text-gray-600">
              Placed on {order.placedAt ? new Date(order.placedAt).toLocaleDateString() : "-"}
            </div> */}
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* left: timeline + items */}
        <div className="md:col-span-2 space-y-6">
          <Timeline steps={timeline} status={order.status} />

          <div className="rounded-2xl border bg-white">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Items</h3>
              <Pill tone="blue"><Package className="h-4 w-4" /> {order.items?.length || 0} item(s)</Pill>
            </div>
            <ul className="divide-y">
              {(order.items || []).map((it, idx) => {
                const mrp = Number(it.originalPrice ?? it.mrp ?? it.mrpPrice ?? it.price) || 0;
                const sell = Number(it.sellingPrice ?? it.price ?? it.amount ?? 0) || 0;
                const hasDiscount = mrp > sell && mrp > 0;
                const pctOff = hasDiscount ? Math.round(((mrp - sell) / mrp) * 100) : 0;

                return (
                  <li key={idx} className="p-5 flex items-center gap-4">
                    <img
                      src={it.image || it.img || "/images/placeholder.png"}
                      onError={(e)=>e.currentTarget.src="/images/placeholder.png"}
                      className="h-16 w-16 rounded-lg object-contain bg-gray-50 border"
                      alt={it.name || "Product"}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-medium line-clamp-2">
                        {it.name || "Item"}
                      </div>
                      {it.sellerName && (
                        <div className="text-xs text-gray-500 mt-0.5">Seller: {it.sellerName}</div>
                      )}
                      <div className="mt-1 flex items-center gap-2 text-sm">
                        <span className="font-semibold">{INR(sell)}</span>
                        {hasDiscount && (
                          <>
                            <span className="line-through text-gray-400 text-xs">
                              {INR(mrp)}
                            </span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-semibold">
                              <Percent className="h-3 w-3" />
                              {pctOff}% off
                            </span>
                          </>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Qty: {it.qty ?? it.quantity ?? 1}{it.variantLabel ? ` • ${it.variantLabel}` : ""}
                      </div>
                    </div>

                    <Link
                      to={`/products/${it.slug || it.productSlug || it.productId || it.id}`}
                      className="text-sm text-primary-600"
                      title="View product"
                    >
                      View <ChevronRight className="h-4 w-4 inline" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* right: delivery + price details + actions */}
        <div className="space-y-6">
          {/* Delivery details */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="font-semibold mb-3">Delivery details</h3>
            {addrLoading ? (
              <div className="text-sm text-gray-600">Loading address…</div>
            ) : addrError ? (
              <div className="text-sm text-red-600">{addrError}</div>
            ) : shipping ? (
              <div className="text-sm text-gray-700 space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{shipping.name}</span>{shipping.isDefault ? " (Default)" : ""}
                </div>
                <div className="ml-6">
                  {shipping.address || shipping.line1 || "-"}
                  {shipping.locality ? `, ${shipping.locality}` : ""}
                  {shipping.line2 ? `, ${shipping.line2}` : ""}
                  <br />
                  {(shipping.city || "") + (shipping.state ? `, ${shipping.state}` : "")} {shipping.pincode || shipping.pinCode || ""}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {shipping.phone || shipping.mobile || "-"}
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-700">No default address found.</div>
            )}
          </div>

          {/* Price details */}
          <div className="rounded-2xl border bg-white p-5">
            <h3 className="font-semibold mb-3">Price details</h3>
            <div className="text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Listing price</span>
                <span className="line-through text-gray-400">{INR(totals.listing)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Special price</span>
                <span className="font-medium">{INR(totals.special)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total fees</span>
                <span className="font-medium">{totals.fees === 0 ? "₹0" : INR(totals.fees)}</span>
              </div>

              <div className="h-px my-2 bg-slate-200" />

              <div className="flex items-center justify-between text-base">
                <span className="font-semibold">Total amount</span>
                <span className="font-extrabold">{INR(totals.totalAmount)}</span>
              </div>

              {totals.listing > totals.special && (
                <div className="text-xs text-emerald-700">You saved {INR(totals.savings)} on this order</div>
              )}
            </div>

            {/* <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-600">Payment method</span>
              <span className="inline-flex items-center gap-1 font-medium">
                <Wallet className="h-4 w-4" />
                {(order.paymentMode || order.paymentMethod || "—")}
              </span>
            </div> */}

            <a
              href={order.invoiceUrl || "#"}
              onClick={onDownloadInvoice}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm"
            >
              <Download className="h-4 w-4" /> Download Invoice
            </a>
          </div>

          {/* Actions */}
          <div className="rounded-2xl border bg-white p-5 space-y-2">
            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm" onClick={onTrack}>
              <Truck className="h-4 w-4" /> Track Package
            </button>

            {order.status === "Delivered" && (
              <Link
                to={`/orders/${order.id}?action=return`}
                onClick={(e) => { e.preventDefault(); setReturnOpen(true); }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm"
              >
                <RefreshCcw className="h-4 w-4" /> Return / Replace
              </Link>
            )}

            <button
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm"
              onClick={() => setRefundOpen(true)}
              disabled={!canRefund}
              title={canRefund ? "Request refund" : "Refund not available"}
            >
              <ReceiptText className="h-4 w-4" /> Request Refund
            </button>

            <button className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border hover:bg-gray-50 text-sm" onClick={onReorder}>
              <Sparkles className="h-4 w-4" /> Order Again
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-600 mt-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> Buyer protection on eligible purchases
            </div>
          </div>
        </div>
      </div>

      {/* dialogs */}
      <ReturnDialog
        open={returnOpen}
        onClose={() => setReturnOpen(false)}
        order={order}
        onSubmitted={async () => {
          const o = await _getOrder(id);
          setOrder(o);
        }}
      />
      <RefundDialog
        open={refundOpen}
        onClose={() => setRefundOpen(false)}
        order={order}
        onSubmitted={async () => {
          const o = await _getOrder(id);
          setOrder(o);
        }}
      />
    </div>
  );
}
