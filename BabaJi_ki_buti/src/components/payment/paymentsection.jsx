import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Package, Ticket, Shield, IndianRupee, X, ChevronDown } from "lucide-react";

/**
 * This is a self-contained previewable component.
 * It doesn't rely on react-router; links are simple <a> tags.
 * Tailwind classes assume you've extended the theme (sand/paper/brand-*).
 */

const currency = (n) => `₹${n.toFixed(2)}`;

const TermsBlock = ({ open, onClose }) => {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="terms"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden"
          aria-live="polite"
        >
          <div className="mt-3 rounded-lg border border-orange-200/60 bg-white/70 p-4 text-sm text-gray-700 shadow-sm">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-gray-900">Terms & Refund Policy</h3>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center rounded-md border border-transparent p-1 text-gray-500 hover:text-gray-700"
                aria-label="Close terms"
              >
                <X size={16} />
              </button>
            </div>
            <div className="mt-2 space-y-2">
              <p>
                <span className="font-medium">Returns:</span> Unopened, unused products may be returned within
                7 days of delivery. Items must be in original packaging with all
                seals intact.
              </p>
              <p>
                <span className="font-medium">Refunds:</span> Approved returns are refunded to the original
                payment method within 5–7 business days after inspection.
              </p>
              <p>
                <span className="font-medium">Cancellations:</span> Orders can be cancelled before shipment. If
                already shipped, please refuse delivery or raise a return request.
              </p>
              <p>
                <span className="font-medium">Contact:</span> support@babajikibooti.com • +91-98XXXXXX00
              </p>
              <p className="text-xs text-gray-500">This is sample copy — replace with your legal text.</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const PaymentPage = ({
  items = [
    { id: 1, name: "Herbal Mix – Digest Boost", qty: 1, price: 799, img: "/images/nu1.png" },
    { id: 2, name: "Ayur Diet Plan (14 days)", qty: 1, price: 1499, img: "/images/nu1.png" },
  ],
  shipping = 49,
  discount = 100,
  taxRate = 0.05,
  onPayNow = () => alert("Hook your payment SDK here"),
}) => {
  const [showTerms, setShowTerms] = useState(false);

  const { subtotal, tax, total } = useMemo(() => {
    const sub = items.reduce((s, it) => s + it.price * it.qty, 0);
    const taxed = (sub - discount + shipping) * taxRate;
    const grand = sub - discount + shipping + taxed;
    return { subtotal: sub, tax: taxed, total: grand };
  }, [items, shipping, discount, taxRate]);

  return (
    <div className="min-h-screen bg-[#faeade] py-20 text-gray-800">
      {/* Top bar / breadcrumb */}
      <header className="bg-gradient-to-b from-[#faeade] via-white to-[#faeade]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-4xl font-bold text-orange-700"
          >
            Payment
          </motion.h1>
          <p className="mt-2 text-sm text-gray-600">• No hidden charges</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 py-2 grid lg:grid-cols-3 gap-6">
        {/* Left column: address + notes */}
        <section className="lg:col-span-2 space-y-6">
          {/* Delivery info */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-[#fff5eb] rounded-xl border border-orange-100 shadow-sm"
          >
            <div className="p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-700">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Delivery Address</h2>
                  <a href="#" className="text-sm text-orange-700 hover:text-orange-800 font-medium">Change</a>
                </div>
                <p className="mt-1 text-gray-700">
                  Tejas (Default) — 110045 <br />
                  Baba Ji Ki Booti Wellness Center, Rohini, Delhi
                </p>
              </div>
            </div>
          </motion.div>

          {/* Items (compact) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-[#fff5eb] rounded-xl border border-orange-100 shadow-sm"
          >
            <div className="p-5 flex items-start gap-3 border-b border-orange-100">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-700">
                <Package size={20} />
              </div>
              <h2 className="font-semibold text-gray-900">Your Items</h2>
            </div>

            <ul className="divide-y divide-orange-100">
              {items.map((it) => (
                <li key={it.id} className="p-5 flex items-center gap-4">
                  <img
                    src={it.img}
                    alt={it.name}
                    className="w-16 h-16 rounded-md object-cover border border-orange-100"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{it.name}</p>
                    <p className="text-sm text-gray-600">Qty: {it.qty}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{currency(it.price * it.qty)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Coupon (optional) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-[#fff5eb] rounded-xl border border-orange-100 shadow-sm"
          >
            <div className="p-5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-orange-50 text-orange-700">
                <Ticket size={20} />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">Coupon</h2>
                <p className="text-sm text-gray-600">
                  Applied automatically: <span className="font-medium">WELCOME100</span>
                </p>
              </div>
              <span className="px-2 py-1 rounded-full text-xs bg-orange-50 text-orange-800">
                -{currency(discount)}
              </span>
            </div>
          </motion.div>
        </section>

        {/* Right column: Order Summary + Pay Now */}
        <aside className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white to-[#fff5eb] rounded-xl border border-orange-100 shadow-sm"
          >
            <div className="p-5 border-b border-orange-100">
              <h2 className="font-semibold text-gray-900">Order Summary</h2>
            </div>

            <div className="p-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">{currency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">{currency(shipping)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Discount</span>
                <span className="font-medium text-orange-800">-{currency(discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(0)}%)</span>
                <span className="font-medium text-gray-900">{currency(tax)}</span>
              </div>

              <div className="h-px my-2 bg-gradient-to-r from-orange-200/50 to-transparent" />

              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-extrabold text-orange-800 flex items-center gap-1">
                  <IndianRupee size={18} /> {total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Pay Now button directly under the summary */}
            <div className="p-5 pt-0">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onPayNow}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-semibold text-white bg-orange-700 hover:bg-orange-800 shadow-lg transition"
              >
                Pay Now
              </motion.button>

              {/* Secure note */}
              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-600">
                <Shield size={14} className="text-orange-700" />
                <span>Secure • Encrypted checkout</span>
              </div>
            </div>
          </motion.div>

          {/* Help / policy small card */}
          <div className="bg-gradient-to-br from-white to-[#fff5eb] rounded-xl border border-orange-100 p-4 text-sm text-gray-600">
            By placing your order, you agree to our {" "}
            <button
              type="button"
              onClick={() => setShowTerms((v) => !v)}
              className="inline-flex items-center gap-1 text-orange-800 font-medium hover:underline"
              aria-expanded={showTerms}
              aria-controls="terms-panel"
            >
              Terms & Refund Policy
              <ChevronDown
                size={16}
                className={`transition-transform ${showTerms ? "rotate-180" : "rotate-0"}`}
              />
            </button>
            <div id="terms-panel">
              <TermsBlock open={showTerms} onClose={() => setShowTerms(false)} />
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};

export default PaymentPage;
