// src/pages/order/ThankYou.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { orderApi } from "../../auth/order/orderApi";
import { IndianRupee, CheckCircle2, XCircle, RotateCw, FileDown, MapPin } from "lucide-react";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number(n || 0));

export default function ThankYou() {
  const [params] = useSearchParams();
  const publicOrderId = params.get("orderId"); // e.g. order_BBK-...
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [softError, setSoftError] = useState("");
  const triesRef = useRef(0);
  const maxPolls = 7;
  const pollDelayMs = 4000;

  const fetchOrder = useCallback(async () => {
    if (!publicOrderId) {
      setSoftError("Missing order id in URL.");
      setLoading(false);
      return;
    }
    try {
      setSoftError("");
      const data = await orderApi.getSmartByPublicId(publicOrderId);
      setOrder(data || null);
    } catch (e) {
      setSoftError(e?.message || "Failed to fetch your order.");
    } finally {
      setLoading(false);
    }
  }, [publicOrderId]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Poll while not PAID
  useEffect(() => {
    if (!order || loading) return;
    const shouldPoll = order?.paymentStatus !== "PAID" && triesRef.current < maxPolls;
    if (!shouldPoll) return;

    const t = setTimeout(async () => {
      triesRef.current += 1;
      try {
        const data = await orderApi.getSmartByPublicId(publicOrderId);
        setOrder(data || null);
      } catch { /* ignore */ }
    }, pollDelayMs);

    return () => clearTimeout(t);
  }, [order, loading, publicOrderId]);

  const status = order?.paymentStatus;
  const isPaid = status === "PAID";
  const items = useMemo(() => order?.items ?? [], [order]);

  const onTryAgain = () => {
    // Hard navigation is the most reliable
    window.location.assign("/payment");
  };

const onDownloadReceipt = () => {
  if (!publicOrderId) return;
  const url = `http://localhost:8080/api/orders/public/${encodeURIComponent()}/receipt`;
  window.open(url, "_blank", "noopener,noreferrer");publicOrderId
};


  return (
    <div className="min-h-screen bg-[#faeade]">
      <header className="bg-gradient-to-b from-[#faeade] via-white to-[#faeade] sticky top-22 z-10">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold text-orange-700">Order status</h1>
          <p className="text-gray-700 mt-1">
            Order reference: <span className="font-mono">{publicOrderId || "-"}</span>
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-24 space-y-6">
        {loading ? (
          <div className="bg-white rounded-xl border border-orange-100 shadow-sm p-6">
            <div className="flex items-center gap-3 text-gray-700">
              <RotateCw className="animate-spin" />
              <span>Confirming payment…</span>
            </div>
          </div>
        ) : softError ? (
          <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6">
            <div className="flex items-center gap-3 text-red-700">
              <XCircle />
              <span>{softError}</span>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchOrder}
                className="px-4 py-2 rounded-lg font-semibold bg-orange-700 text-white hover:bg-orange-800"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <>
            {isPaid ? (
              <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-5 flex items-start gap-3">
                <CheckCircle2 className="mt-0.5" />
                <div>
                  <div className="font-semibold">Payment successful</div>
                  <div className="text-sm">Thanks! Your order is being processed.</div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-900 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <XCircle className="mt-0.5" />
                  <div>
                    <div className="font-semibold">
                      {order?.paymentStatus === "NOT_PAID" ? "Payment not completed" : "Payment pending"}
                    </div>
                    <div className="text-sm">
                      If you already paid, this page will update shortly. Otherwise you can try again.
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={fetchOrder}
                    className="px-4 py-2 rounded-lg font-semibold bg-gray-100 text-gray-800"
                  >
                    Refresh status
                  </button>
                  <button
                    onClick={onTryAgain}
                    className="px-4 py-2 rounded-lg font-semibold bg-orange-700 text-white hover:bg-orange-800"
                  >
                    Try payment again
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl border border-orange-100 shadow-sm">
              <div className="p-5 border-b border-orange-100 flex items-center justify-between">
                <div className="font-semibold text-gray-900">Order Summary</div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{order?.orderNumber}</span>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-5">
                  <div className="flex items-center gap-2 text-gray-900 font-semibold">
                    <MapPin size={18} className="text-orange-700" />
                    Shipping Address
                  </div>
                  <div className="mt-2 text-sm text-gray-700">
                    <div>{order?.shipping?.name} — {order?.shipping?.phone}</div>
                    <div>{order?.shipping?.fullAddress}{order?.shipping?.locality ? `, ${order?.shipping?.locality}` : ""}</div>
                    <div>{order?.shipping?.city}, {order?.shipping?.state} {order?.shipping?.zipCode}</div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600">
                        <th className="py-2 pr-3">Product</th>
                        <th className="py-2 pr-3 text-right">Qty</th>
                        <th className="py-2 pr-3 text-right">Unit</th>
                        <th className="py-2 pr-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {(order?.items || []).map((it, idx) => (
                        <tr key={it.id ?? idx} className="border-t border-orange-100">
                          <td className="py-2 pr-3">{it.productName}</td>
                          <td className="py-2 pr-3 text-right">{it.quantity}</td>
                          <td className="py-2 pr-3 text-right">{INR(it.price)}</td>
                          <td className="py-2 pr-3 text-right">{INR(it.totalAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <div className="text-sm text-gray-700">
                    <div>Public Order ID: <span className="font-mono">{order?.cfPublicOrderId || "-"}</span></div>
                    <div>Payment Ref: <span className="font-mono">{order?.cfPaymentReference || "-"}</span></div>
                    <div>Status: <span className="font-semibold">{order?.paymentStatus}</span></div>
                  </div>
                  <div className="text-sm text-gray-900">
                    <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{INR(order?.subtotal)}</span></div>
                    <div className="flex justify-between"><span>Discount</span><span className="font-medium">– {INR(order?.discountAmount)}</span></div>
                    <div className="flex justify-between"><span>Shipping</span><span className="font-medium">{INR(order?.shippingAmount)}</span></div>
                    <div className="h-px my-2 bg-gradient-to-r from-orange-200/50 to-transparent" />
                    <div className="flex justify-between text-base">
                      <span className="font-semibold">Total</span>
                      <span className="font-extrabold text-orange-800 inline-flex items-center gap-1">
                        <IndianRupee size={16} /> {INR(order?.netAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  {isPaid ? (
                    <button
                      onClick={onDownloadReceipt}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700"
                    >
                      <FileDown size={18} /> Download receipt
                    </button>
                  ) : (
                    <button
                      onClick={onTryAgain}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-orange-700 text-white hover:bg-orange-800"
                    >
                      Try payment again
                    </button>
                  )}
                  <Link
                    to="/orders"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-100 text-gray-800"
                  >
                    Go to my orders
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
