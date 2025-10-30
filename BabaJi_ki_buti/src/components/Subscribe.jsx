// src/pages/SubscriptionPage.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BadgePercent,
  Sparkles,
  Gift,
  Crown,
  ShieldCheck,
  Calendar,
  PiggyBank,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
} from "lucide-react";

import { useAuth } from "../auth/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import SubscribeButton from "./subscription/SubscribeButton";
import { useCashfreeReturnVerifier } from "../hooks/useCashfreeReturnVerifier";

// ---------- utilities ----------
const cn = (...c) => c.filter(Boolean).join(" ");

// ---------- shared UI ----------
const Button = ({
  children,
  variant = "primary",
  size = "md",
  className,
  as = "button",
  ...props
}) => {
  const Comp = as;
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary:
      "bg-[#2b1b16] text-[#faeade] hover:bg-[#3b2720] focus-visible:ring-[#e08a55] focus-visible:ring-offset-[#faeade]",
    outline:
      "border border-[rgba(43,27,22,0.12)] text-[#2b1b16] hover:bg-white/60 focus-visible:ring-[#2b1b16] focus-visible:ring-offset-[#faeade]",
    ghost:
      "text-[#2b1b16] hover:bg-black/5 focus-visible:ring-[#e08a55] focus-visible:ring-offset-[#faeade]",
  };
  const sizes = { sm: "h-9 px-3 text-sm", md: "h-11 px-5", lg: "h-12 px-6 text-lg" };
  return (
    <Comp className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Comp>
  );
};

// ---------- animations ----------
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

// ---------- Plan card ----------
// ---------- Plan card ----------
const PlanCard = ({
  title,
  subtitle,
  price,
  billing = "monthly",
  perks = [],
  badge,
  highlight,
  cta,       // optional fallback
  onClick,   // optional fallback
  disabled = false,
  footer = null, // 👈 NEW
}) => {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        "relative w-full rounded-2xl border p-6 md:p-7 shadow-sm",
        "bg-[#fff7f1]/90 backdrop-blur",
        highlight ? "border-[#e08a55]" : "border-[rgba(43,27,22,0.12)]"
      )}
      style={{
        backgroundImage:
          "radial-gradient(800px 200px at 50% -20%, rgba(224,138,85,0.10), transparent)",
      }}
    >
      {badge && (
        <div className="absolute -top-3 left-6 rounded-full bg-[#e08a55] px-3 py-1 text-xs font-bold text-white shadow">
          {badge}
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-xl font-extrabold text-[#2b1b16]">{title}</h3>
        <p className="text-sm text-[rgba(43,27,22,0.7)]">{subtitle}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-extrabold text-[#2b1b16]">{price}</span>
          <span className="text-[rgba(43,27,22,0.7)]">/ {billing}</span>
        </div>
      </div>

      <ul className="mb-6 space-y-3">
        {perks.map((p, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-[#2b1b16]">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#e08a55] shrink-0" />
            <span className="text-[rgba(43,27,22,0.85)]">{p}</span>
          </li>
        ))}
      </ul>

      {/* 👇 CTA comes from parent */}
      {footer ?? (
        <Button onClick={onClick} className="w-full" disabled={disabled}>
          {cta} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}

      {highlight && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-[#e08a55]/30"
        />
      )}
    </motion.div>
  );
};


// ---------- Accordion ----------
const AccordionItem = ({ q, a, isOpen, onToggle }) => (
  <div className="border-b border-[rgba(43,27,22,0.12)] last:border-0">
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between py-5 text-left text-[#2b1b16] hover:text-[#3b2720] transition-colors"
      aria-expanded={isOpen}
    >
      <span className="font-semibold pr-4">{q}</span>
      <ChevronDown
        className={cn(
          "h-5 w-5 transition-transform text-[rgba(43,27,22,0.6)] shrink-0",
          isOpen ? "rotate-180" : ""
        )}
      />
    </button>
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="pb-5 text-[rgba(43,27,22,0.75)] text-sm leading-relaxed">{a}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// ============================== PAGE ==============================
export default function SubscriptionPage({userId}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
 

  const [billing, setBilling] = useState("monthly");
  const [openIdx, setOpenIdx] = useState(0);

 const { loading, plan, active, current, error, subscribe, cancel, refresh } = useSubscription(userId);

useCashfreeReturnVerifier(userId, refresh);


  // Static perks / FAQ (your content)
  const perks = [
    "हर ऑर्डर पर 12% तक बचत",
    "सेल पर जल्दी एक्सेस",
    "ऑर्डर/प्रोडक्ट अपडेट",
    "सीक्रेट ऑफ़र्स और गिफ्ट्स",
  ];
  const faqs = [
    { q: "डिस्काउंट कैसे मिलेगा?", a: "मेंबरशिप एक्टिव होते ही, योग्य प्रोडक्ट्स पर चेकआउट में मेंबर प्राइस अपने आप लागू हो जाती है।" },
    { q: "कोई समस्या आए तो?", a: "चैट/ईमेल सपोर्ट से संपर्क करें; हम बिलिंग/एक्सेस को तुरंत ठीक करेंगे।" },
    { q: "सेल प्राइस के साथ स्टैक होगा?", a: "कई केस में अतिरिक्त मेंबर ऑफ़र मिलता है; जहां संभव न हो, साइट सर्वश्रेष्ठ कीमत दिखाती है।" },
    { q: "प्लान अपग्रेड कैसे करें?", a: "अकाउंट से कभी भी बदल सकते हैं; बचे दिनों का ऑटो-प्रोरेशन हो जाता है।" },
    { q: "कभी भी कैंसिल?", a: "हाँ, कैंसिल कर सकते हैं; फायदे मौजूदा बिलिंग पीरियड तक बने रहेंगे।" },
  ];

  const priceText = useMemo(() => {
    if (!plan?.price) return "₹—";
    // Format ₹xx.xx
    try {
      const n = Number(plan.price);
      if (Number.isFinite(n)) return `₹${n.toFixed(0)}`;
    } catch {}
    return `₹${String(plan.price)}`;
  }, [plan]);

  const planTitle = plan?.name || "Babaji Ki Buti – सदस्यता";
  const planSubtitle = useMemo(() => {
    const i = (plan?.interval || "MONTHLY").toLowerCase();
    return i === "yearly" ? "Standard plan • billed yearly" : "Standard plan • billed monthly";
  }, [plan?.interval]);

  const join = async () => {
    if (!isAuthenticated || !userId) {
      navigate("/login?next=/subscribe");
      return;
    }
    try {
      await subscribe(plan?.id);
      // UX: navigate or toast. For now, remain and show ACTIVE box.
      // navigate("/account?tab=membership");
    } catch (e) {
      alert(e?.message || "Subscription failed");
    }
  };

  const cancelNow = async () => {
    if (!isAuthenticated || !userId) {
      navigate("/login?next=/subscribe");
      return;
    }
    if (!window.confirm("Cancel your membership now? Benefits remain until end of period.")) return;
    try {
      await cancel("User requested cancellation");
    } catch (e) {
      alert(e?.message || "Cancel failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#faeade] text-[#2b1b16]">
      {/* top spacer */}
      <div className="h-16" aria-hidden />

      {/* HERO */}
      <section
        className="relative overflow-hidden  border-[rgba(43,27,22,0.12)]"
        style={{
          background:
            "radial-gradient(900px 300px at 50% -10%, rgba(224,138,85,0.12), rgba(250,234,222,0))",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(rgba(0,0,0,0.06) 0.5px, transparent 0.6px)",
            backgroundSize: "3px 3px",
            opacity: 0.4,
          }}
        />
        <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl px-4 pt-10 pb-16 md:pt-14 md:pb-20 relative">
          <motion.p variants={fadeUp} className="text-center text-[rgba(43,27,22,0.7)] text-sm uppercase tracking-[0.18em] mb-3 font-bold">
            शुद्धता • परंपरा • भरोसा
          </motion.p>
          <motion.h1 variants={fadeUp} className="text-center text-4xl font-extrabold md:text-6xl mb-4">
            Every Day Member Savings
          </motion.h1>
          <motion.p variants={fadeUp} className="text-center text-[rgba(43,27,22,0.7)] max-w-2xl mx-auto font-bold">
            12% तक बचत + जल्दी एक्सेस + एक्सक्लूसिव ऑफ़र्स
          </motion.p>

          {/* hero badges */}
          <motion.div variants={container} className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 max-w-4xl mx-auto">
            {[
              { icon: BadgePercent, title: "Extra Discount", desc: "Sitewide sale पर भी edge" },
              { icon: Sparkles, title: "Early Access", desc: "नई launches सबसे पहले" },
              { icon: Gift, title: "Exclusive Offers", desc: "मिस्ट्री गिफ्ट्स, मेंबर डील्स" },
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex items-center gap-3 rounded-2xl border p-5 hover:bg-white transition-colors"
                  style={{
                    borderColor: "rgba(43,27,22,0.12)",
                    backgroundColor: "#fff7f1",
                    backgroundImage: "radial-gradient(280px 120px at 10% 10%, rgba(224,138,85,0.10), transparent)",
                  }}
                >
                  <span className="rounded-xl bg-[#e08a55]/15 p-3 ring-1 ring-[#e08a55]/25">
                    <Icon className="h-6 w-6 text-[#e08a55]" />
                  </span>
                  <div>
                    <div className="font-bold text-[#2b1b16]">{b.title}</div>
                    <div className="text-sm text-[rgba(43,27,22,0.7)]">{b.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        <svg className="w-full" viewBox="0 0 1200 80" preserveAspectRatio="none" style={{ height: 64 }}>
          <path d="M0,0 Q300,40 600,20 T1200,25 L1200,80 L0,80 " fill="#fff7f1" />
        </svg>
      </section>

      {/* SELECT & SAVE */}
      <section className="bg-[#fff7f1]">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <div className="text-center mb-12">
            <p className="text-sm uppercase tracking-wider text-[rgba(43,27,22,0.7)] mb-2">
              Select & Save
            </p>
            <h2 className="text-3xl font-extrabold md:text-4xl">Pick a plan that fits you</h2>
            {error && <p className="mt-2 text-sm text-red-700">Error: {String(error)}</p>}
          </div>

          {/* Billing toggle (only monthly for now, wired for growth) */}
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }} className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setBilling("monthly")}
              className={cn(
                "px-8 py-3 rounded-full font-semibold transition-all border",
                billing === "monthly"
                  ? "bg-[#2b1b16] text-[#faeade] border-[#2b1b16] shadow-[0_0_0_3px_rgba(43,27,22,0.15)]"
                  : "bg-white text-[#2b1b16] border-[rgba(43,27,22,0.12)] hover:bg-[#faeade]"
              )}
            >
              Monthly
            </button>
          </motion.div>

          {/* Plans */}
       <motion.div
  variants={container}
  initial="hidden"
  whileInView="show"
  viewport={{ once: true, amount: 0.25 }}
  className="mx-auto mt-10 grid max-w-md gap-6"
>
  <PlanCard
    title={planTitle}
    subtitle={planSubtitle}
    price={loading ? "…" : priceText}
    billing="monthly"
    perks={perks}
    highlight
    badge={active ? "Active" : "Popular"}
    disabled={loading}
    footer={
      !isAuthenticated ? (
        <Button onClick={() => navigate("/login?next=/subscribe")} className="w-full">
          Sign in to Join <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      ) : active ? (
        <Button onClick={cancelNow} className="w-full" variant="outline">
          Cancel Membership
        </Button>
      ) : (
        <SubscribeButton
          userId={userId}
          planId={plan?.id}
          planPrice={plan?.price}
          className="w-full"
          disabled={loading || !plan?.id || !plan?.price}
        >
          Start Membership <ArrowRight className="ml-2 h-4 w-4" />
        </SubscribeButton>
      )
    }
  />
</motion.div>

          {/* Current subscription badge */}
          {active && current && (
            <div className="mx-auto mt-6 max-w-md rounded-xl border border-[rgba(43,27,22,0.12)] bg-white p-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">Membership Active</div>
                  <div className="text-[rgba(43,27,22,0.7)]">
                    Valid till{" "}
                    {new Date(current.endAt).toLocaleString(undefined, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <Crown className="h-5 w-5 text-[#e08a55]" />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* COMPARISON */}
      <section className="bg-[#faeade] pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[rgba(43,27,22,0.12)] md:grid-cols-2 mt-6">
            <div
              className="p-8"
              style={{
                backgroundColor: "#fff7f1",
                backgroundImage:
                  "radial-gradient(600px 160px at 50% -10%, rgba(224,138,85,0.10), transparent)",
              }}
            >
              <h3 className="mb-6 text-xl font-bold text-[#2b1b16] flex items-center gap-2">
                <span className="text-2xl">😐</span>
                Non-member Perks
              </h3>
              <ul className="space-y-4 text-sm text-[rgba(43,27,22,0.85)]">
                {["Pays on sight", "Waits for sitewide sale", "Gets 15% sitewide sale", "Waits for new launches", "Gets regular privileges"].map(
                  (t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-lg">❌</span>
                      <span>{t}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
            <div className="p-8 text-[#faeade]" style={{ background: "#2b1b16" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-[#e08a55]" />
                </div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">😎</span>
                  Member Perks
                </h3>
              </div>
              <ul className="space-y-4 text-sm">
                {["Save 12% every day", "Early access to sitewide sale", "Unlock up to 18% sitewide", "Early access to launches", "Mystery gifts & special deals"].map(
                  (t, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#e08a55] shrink-0 mt-0.5" />
                      <span>{t}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          {/* CTA */}
          {!active && (
            <div className="text-center mt-12">
              <Button size="lg" onClick={join} className="px-10" disabled={loading}>
                Join the Collective
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* HOW TO JOIN */}
      <section className="bg-[#fff7f1] pb-6">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <h3 className="mb-8 text-center text-3xl font-extrabold">How to Join?</h3>
          <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.25 }} className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: Calendar, title: "Choose Your Plan", desc: "Pick a duration that fits your routine." },
              { icon: PiggyBank, title: "Enjoy the Perks", desc: "Instant savings + exclusive benefits." },
              { icon: ShieldCheck, title: "Renew Seamlessly", desc: "Auto-renew so you never miss benefits." },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="rounded-2xl border p-6 text-center hover:shadow-lg transition-shadow"
                  style={{
                    borderColor: "rgba(43,27,22,0.12)",
                    backgroundColor: "white",
                    backgroundImage:
                      "radial-gradient(220px 120px at 50% -20%, rgba(224,138,85,0.10), transparent)",
                  }}
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#faeade] border border-[rgba(43,27,22,0.12)]">
                    <Icon className="h-8 w-8 text-[#e08a55]" />
                  </div>
                  <div className="font-bold text-lg text-[#2b1b16] mb-2">{s.title}</div>
                  <p className="text-sm text-[rgba(43,27,22,0.7)]">{s.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>

          {!active && (
            <div className="text-center mt-10">
              <Button size="lg" onClick={join} className="px-12 py-6 text-lg" disabled={loading}>
                ADD MEMBERSHIP
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#faeade] pb-6">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="rounded-2xl border border-[rgba(43,27,22,0.12)] bg-white p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.15)]">
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                q={f.q}
                a={f.a}
                isOpen={openIdx === i}
                onToggle={() => setOpenIdx(openIdx === i ? null : i)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
