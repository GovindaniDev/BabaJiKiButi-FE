// src/pages/account/OrderPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ExternalLink, Eye } from "lucide-react";
import { getMyOrders, hydrateOrdersWithProductMeta } from "../../api/engagementApi";

const INR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
    .format(Number(n || 0));

const Badge = ({ children, tone = "slate" }) => (
  <span
    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${
      tone === "green"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : tone === "amber"
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : tone === "red"
        ? "bg-rose-50 text-rose-700 border-rose-200"
        : "bg-slate-50 text-slate-700 border-slate-200"
    }`}
  >
    {children}
  </span>
);

export default function OrdersPage() {
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [sort] = useState("createdAt,desc");
  const [pending, setPending] = useState(true);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setPending(true);
        const { list, total } = await getMyOrders({ page, size, sort });
        // 🔽 ensure we hydrate images via productId (+ variantId)
        const hydrated = await hydrateOrdersWithProductMeta(list);
        if (!alive) return;
        setOrders(hydrated || []);
        setTotal(Number(total || 0));
      } catch (e) {
        toast.error(e?.response?.data?.message || e?.message || "Failed to load orders");
      } finally {
        if (alive) setPending(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [page, size, sort]);

  const pages = useMemo(() => Math.max(1, Math.ceil(Number(total || 0) / size)), [total, size]);

  if (pending) {
    return (
      <div className="rounded-2xl border bg-white p-5">
        <div className="h-6 w-40 bg-gray-100 rounded mb-4" />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-3 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="rounded-2xl border bg-white p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">Your Orders</h3>
          <Badge>0 orders</Badge>
        </div>
        <p className="text-sm text-gray-600">No orders yet.</p>
        <Link to="/shop" className="mt-3 inline-flex items-center gap-2 text-sm text-primary-600">
          Start shopping <ExternalLink className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-white">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-lg">Your Orders</h3>
          <Badge tone="green">{total} total</Badge>
        </div>
        <ul className="divide-y">
          {orders.map((o) => (
            <li
              key={o.id}
              className="p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="min-w-0 flex items-start gap-3">
                {/* Thumbnail from first line item (renders only if a real product image exists) */}
                {o.items?.[0]?.img && (
                  <img
                    src={o.items[0].img}
                    alt={o.items[0].name || "Product image"}
                    className="h-12 w-12 rounded-lg object-cover border"
                    loading="lazy"
                  />
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">#{o.orderNumber || o.id}</span>
                    <span className="text-xs text-gray-500">
                      Placed {o.placedAt ? new Date(o.placedAt).toLocaleDateString() : "-"}
                    </span>
                    {o.status === "Delivered" ? (
                      <Badge tone="green">Delivered {o.deliveredOn || ""}</Badge>
                    ) : o.status === "Cancelled" ? (
                      <Badge tone="red">Cancelled</Badge>
                    ) : (
                      <Badge tone="amber">{o.status}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-1">
                    {o.items?.map((it) => `${it.name} ×${it.qty}`).join(", ")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to={`/orders/${o.id}`}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-gray-50 text-sm"
                  title="View details"
                >
                  <Eye className="h-4 w-4" /> View
                </Link>
                <div className="ml-2 font-semibold">{INR(o.amount)}</div>
              </div>
            </li>
          ))}
        </ul>

        <div className="px-5 py-4 border-t flex items-center justify-between text-sm text-gray-600">
          <span>Showing {Math.min(size, orders.length)} of {total}</span>
          <div className="inline-flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
            >
              Prev
            </button>
            <span className="px-2">Page {page + 1} / {pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              disabled={page >= pages - 1}
              className="px-3 py-1.5 rounded-lg border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
