import React, { useState } from "react";
import {
  Search,
  User,
  ShoppingCart,
  X,
  Menu,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Star,
  Leaf,
  Shield,
  Award,
  Heart,
  Check,      // ⬅️ added
  Crown       // ⬅️ added
} from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";

/**
 * Minimal Button wrapper so your code works without extra UI libs.
 */
const Button = ({ children, className = "", variant, size, ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition-colors border border-transparent";
  const byVariant =
    variant === "ghost"
      ? "bg-transparent hover:bg-white/5"
      : variant === "outline"
      ? "bg-transparent border-white/20 hover:bg-white/5"
      : "bg-yellow-400 text-black hover:bg-yellow-300";
  const bySize =
    size === "sm" ? "px-3 py-1.5 text-xs" : size === "lg" ? "px-6 py-3 text-base" : "";
  return (
    <button className={[base, byVariant, bySize, className].join(" ")} {...props}>
      {children}
    </button>
  );
};

// --- Image fallbacks ---
const heroBg = "/images/hero-bg.jpg";
const scienceWisdom = "/images/science-wisdom.jpg";
const products = "/images/products.jpg";

/** Framer Motion helpers */
const container = {
  hidden: { opacity: 0 },
  show: (stagger = 0.08) => ({
    opacity: 1,
    transition: { staggerChildren: stagger, delayChildren: 0.1 },
  }),
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};
// Typewriter-ish per-character reveal (FIXED)
const char = {
  hidden: { opacity: 0, y: 10 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.035, delay: i * 0.03, ease: "easeOut" },
  }),
};

/** Animated number helper (triggers on scroll) */
const AnimatedCount = ({ end, suffix = "", duration = 1.2, formattingFn }) => (
  <CountUp
    end={end}
    duration={duration}
    separator=","
    suffix={suffix}
    {...(formattingFn ? { formattingFn } : {})}
    enableScrollSpy
    scrollSpyOnce
  />
);

/** Typewriter line with stagger + blinking caret */
const TypeLine = ({ segments = [], className = "" }) => {
  const chars = [];
  segments.forEach((seg) => {
    seg.text.split("").forEach((c) => chars.push({ c, cls: seg.className || "" }));
  });

  return (
    <span className={`inline-flex items-baseline ${className}`}>
      <span aria-label={segments.map((s) => s.text).join("")}>
        {chars.map((ch, i) => (
          <motion.span
            key={i}
            variants={char}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.9 }}
            custom={i}
            className={ch.cls}
          >
            {ch.c}
          </motion.span>
        ))}
      </span>
      <span className="ml-1 inline-block h-[1.1em] w-[2px] bg-yellow-300 animate-pulse" />
    </span>
  );
};

/* -------------------------- Subscription Plans -------------------------- */
const included = (text) => (
  <li className="flex items-start gap-3">
    <span className="mt-0.5 rounded-md bg-yellow-300/15 p-1">
      <Check className="h-4 w-4 text-yellow-300" />
    </span>
    <span className="text-white/85">{text}</span>
  </li>
);

const PlanCard = ({
  title,
  subtitle,
  priceMonthly,
  priceYearly,
  highlight = false,
  badge,
  perks = [],
  cta = "Subscribe",
  onClick,
  billing = "monthly",
  wrapperClassName = "",
}) => {
  const price = priceMonthly;
  const unit = "/month";
  return (
    <div className={wrapperClassName}>
      <motion.div
        variants={fadeUp}
        whileHover={{ y: -6 }}
        transition={{ type: "spring", stiffness: 240, damping: 18 }}
        className={[
          "relative h-full rounded-2xl border p-8 backdrop-blur-md",
          highlight
            ? "border-yellow-300/40 bg-yellow-300/10 shadow-lg shadow-yellow-300/10"
            : "border-white/10 bg-black/30",
        ].join(" ")}
      >
        {badge && (
          <div className="absolute -top-3 left-8 inline-flex items-center gap-1 rounded-full bg-yellow-300 px-3 py-1 text-xs font-semibold text-black">
            {badge === "Best Value" && <Crown className="h-4 w-4" />}
            {badge}
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-yellow-300">{price}</span>
            <span className="text-white/60">{unit}</span>
          </div>
        </div>

        <ul className="mb-8 space-y-3 text-sm">
          {perks.map((p, i) => (
            <React.Fragment key={i}>{included(p)}</React.Fragment>
          ))}
        </ul>

        <Button
          onClick={onClick}
          className={[
            "w-full justify-center",
            highlight ? "bg-yellow-300 text-black hover:bg-yellow-200" : "bg-transparent border-white/20 hover:bg-white/5",
          ].join(" ")}
          variant={highlight ? undefined : "outline"}
          size="lg"
        >
          {cta}
        </Button>

        {/* Small trust footer */}
        <div className="mt-4 text-[11px] text-white/60">Secure payment • Cancel anytime</div>
      </motion.div>
    </div>
  );
};

  const SubscriptionPlans = () => {
    const [billing, setBilling] = useState("monthly"); // 'monthly' | 'yearly'

    const plans = [
      {
        title: "Basic",
        subtitle: "standard plan - 99 monthly",
        priceMonthly: "₹99",
        priceYearly: "₹1,999",
        perks: [
          "subscription plan",
          "discount upto 50%",
          "updates notification",
          "upcoming event notification and sales early acceses",
        ],
      },
      // {
      //   title: "Plus",
      //   subtitle: "For repeat buyers",
      //   priceMonthly: "₹499",
      //   priceYearly: "₹4,999",
      //   highlight: true,
      //   badge: "Best Value",
      //   perks: [
      //     "10% member-only discount",
      //     "Free shipping on orders ₹499+",
      //     "Priority support & returns",
      //     "Earn 2× loyalty points",
      //     "Early access to limited drops",
      //   ],
      // },
      // {
      //   title: "Elite",
      //   subtitle: "For power users & families",
      //   priceMonthly: "₹999",
      //   priceYearly: "₹9,999",
      //   perks: [
      //     "15% member-only discount",
      //     "Free shipping on all orders",
      //     "VIP concierge support",
      //     "Earn 3× loyalty points",
      //     "Monthly surprise samples",
      //   ],
      // },
    ];

    // ✅ Center the cards smartly based on how many plans there are
    const gridClass =
      plans.length === 1
        ? "grid-cols-1 place-items-center"
        : plans.length === 2
        ? "grid-cols-1 sm:grid-cols-2 place-items-center"
        : "grid-cols-1 md:grid-cols-3";

    return (
      <section id="plans" className="py-20 bg-black/40">
        <motion.div
          className="container mx-auto px-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
        >
          <motion.div className="text-center mb-10" variants={fadeUp}>
            <span className="text-yellow-300 text-sm font-medium tracking-wide uppercase">
              Membership
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">Choose Your Plan</h2>
            <p className="mt-3 text-white/70">
              Save more on every order and unlock fast delivery, exclusive discounts, and priority support.
            </p>
          </motion.div>

          {/* Billing Toggle */}
          <motion.div className="mb-10 flex items-center justify-center gap-3" variants={fadeUp}>
            <Button
              variant={billing === "monthly" ? undefined : "outline"}
              className={billing === "monthly" ? "" : "text-white/80"}
              onClick={() => setBilling("monthly")}
            >
              Monthly
            </Button>
            {/* <Button
              variant={billing === "yearly" ? undefined : "outline"}
              className={billing === "yearly" ? "" : "text-white/80"}
              onClick={() => setBilling("yearly")}
            >
              Yearly <span className="ml-2 rounded-full bg-yellow-300/20 px-2 py-0.5 text-[10px] text-yellow-30">Save 20%</span>
            </Button> */}
          </motion.div>

          {/* Plans Grid */}
          <motion.div
            className={`grid gap-6 ${gridClass} max-w-6xl mx-auto`}
            variants={container}
          >
            {plans.map((p, idx) => (
              <PlanCard
                key={idx}
                {...p}
                billing={billing}
                onClick={() => {
                  // hook up to your checkout / cart flow
                  // e.g., navigate(`/checkout?plan=${p.title.toLowerCase()}&billing=${billing}`)
                  console.log("Subscribe:", p.title, billing);
                }}
                cta={p.highlight ? "Start Plus" : `Choose ${p.title}`}
                // When there's only one card, keep it nicely sized and centered
                wrapperClassName={plans.length === 1 ? "max-w-md w-full" : "w-full"}
              />
            ))}
          </motion.div>

          {/* Benefits strip */}
          <motion.div
            className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4"
            variants={container}
          >
            {[
              { icon: Leaf, label: "Ayurvedic Goodness", desc: "Member-only wellness tips & samples" },
              { icon: Shield, label: "Hassle-free Returns", desc: "Extended return window for members" },
              { icon: Star, label: "Priority Support", desc: "Skip the queue for faster help" },
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-yellow-300/15 p-2">
                      <Icon className="h-5 w-5 text-yellow-300" />
                    </span>
                    <div>
                      <div className="font-semibold">{b.label}</div>
                      <div className="text-sm text-white/70">{b.desc}</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>
    );
  };
/* ----------------------- /Subscription Plans ----------------------- */

const AboutUsSection = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const features = [
    { title: "100% Natural & Pure Formula", description: "Every product is crafted from natural organic herbs without synthetic additives. Creating value through medicine building peak experiences." },
    { title: "Science Backed Formulations", description: "We integrate ancient Ayurvedic principles with modern research. Optimized solutions to preventive and therapeutic healthcare and nutritional supplements." },
    { title: "Commitment to Excellence", description: "Our relentless pursuit of quality ensures your health improvement and satisfaction. Quality through rigorous research cycle is our highest promise of outstanding results." },
    { title: "Customer Centric Approach", description: "We listen to your needs and continuously advance technology. Creating comprehensible health solutions and support every customer's health path from beginning to finish." },
  ];

  const stats = [
    { number: 500000, label: "Happy Healthy Customers", description: "Trusted by millions for authentic wellness", suffix: "+", formatter: (v) => (v >= 100000 ? "5L" : v.toString()), customDisplay: "5L+" },
    { number: 100, label: "Natural Ingredients", description: "Pure, organic, and carefully sourced", suffix: "%" },
    { number: 10000, label: "Orders Every Month", description: "Growing community of wellness seekers", suffix: "+", formatter: (v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : v.toString()), customDisplay: "10K+" },
    { number: 50, label: "Authentic Ayurvedic Products", description: "Traditional formulations for modern needs", suffix: "+" },
  ];

  const pillars = [
    { icon: Leaf, title: "Natural Ingredients", description: "Our products are sourced exclusively from pure, natural herbs and ingredients. We maintain the highest standards for authentic Ayurvedic medicine to support your wellness journey." },
    { icon: Shield, title: "Scientifically Validated", description: "Every formula is developed and scientifically backed by clinical research. We combine traditional wisdom with modern testing to ensure effectiveness and safety." },
    { icon: Award, title: "Ethical Sourcing", description: "We prioritize sustainable practices and ethical sourcing in all our operations. Our supply chain ensures fair trade and environmental responsibility in every aspect." },
    { icon: Heart, title: "Quality Control", description: "Quality being our topmost priority, we maintain stringent quality control measures throughout our manufacturing process. Each product meets international standards for purity and effectiveness." },
  ];

  const testimonials = [
    { rating: 5, text: "Amazing results! I've been using their products for 6 months now and feel more energetic than ever. The natural approach really works.", author: "Rajesh Kumar", location: "Delhi", verified: true },
    { rating: 5, text: "Best quality ayurvedic products I've found. The customer service is exceptional and delivery is always on time. Highly recommended!", author: "Priya Sharma", location: "Mumbai", verified: true },
    { rating: 5, text: "Three generations of trust and it shows in every product. The effectiveness of their formulations is unmatched. Thank you Baba Ji Ki Buti!", author: "Dr. Amit Singh", location: "Chandigarh", verified: true },
  ];

  return (
    <div className="min-h-screen bg-black/80 backdrop-blur-md text-white">
      <main>
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center py-30 justify-center overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            <img src={heroBg} alt="Ayurvedic herbs and natural wellness" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/40" />
          </div>

          {/* Hero Content */}
          <motion.div
            className="relative z-10 container mx-auto px-4 text-center"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.35 }}
          >
            <div className="max-w-4xl mx-auto">
              {/* Badge */}
              <motion.div className="mb-6" variants={fadeUp}>
                <span className="inline-block bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-medium border border-yellow-300/30">
                  ✨ Trusted for 5 Decades • 3 Generations of Excellence
                </span>
              </motion.div>

              {/* Headline with typewriter reveal */}
              <h1 className="mb-8 leading-tight text-4xl sm:text-5xl md:text-6xl font-extrabold">
                <TypeLine
                  className="block"
                  segments={[
                    { text: "Authentic ", className: "" },
                    { text: "Ayurvedic", className: "text-yellow-300" },
                  ]}
                />
                <br />
                <TypeLine
                  className="block mt-2"
                  segments={[
                    { text: "Wellness for ", className: "" },
                    { text: "Modern Life", className: "text-yellow-300" },
                  ]}
                />
              </h1>

              {/* Subtitle */}
              <motion.p className="text-lg md:text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed" variants={fadeUp}>
                Discover the power of traditional Ayurvedic medicine with our carefully crafted, scientifically validated formulations. Experience natural healing that transforms lives, backed by 50+ years of trusted expertise.
              </motion.p>

              {/* CTA Buttons */}
              <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16" variants={fadeUp}>
                <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300 text-lg px-8 py-4">
                  Explore Our Products
                </Button>
                <Button variant="outline" size="lg" className="border-yellow-300/50 text-yellow-300 hover:bg-yellow-300/10 text-lg px-8 py-4">
                  Learn Our Story
                </Button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto" variants={fadeUp}>
                {[
                  { label: "Customers", customDisplay: "5L+" },
                  { label: "Products", number: 50, suffix: "+" },
                  { label: "Natural", number: 100, suffix: "%" },
                  { label: "Rated", customDisplay: "5★" },
                ].map((item, index) => (
                  <motion.div key={index} className="text-center" variants={fadeUp}>
                    <div className="text-3xl font-bold text-yellow-300 mb-2">
                      {"customDisplay" in item ? (
                        item.customDisplay
                      ) : (
                        <AnimatedCount end={item.number} suffix={item.suffix || ""} duration={1.2} />
                      )}
                    </div>
                    <div className="text-sm text-white/70 uppercase tracking-wide">{item.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* About Content */}
        <section className="py-20">
          <motion.div
            className="container mx-auto px-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            {/* Brand Introduction */}
            <motion.div className="text-center mb-20 max-w-4xl mx-auto" variants={fadeUp}>
              <div className="mb-4">
                <span className="text-yellow-300 text-sm font-medium tracking-wide uppercase">Baba Ji Ki Buti</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Apnaaye Natural Wellness</h2>
              <p className="text-lg text-white/80 leading-relaxed mb-6">
                Baba Ji Ki Buti par hum prachin Ayurvedic gyaan ko modern science ke saath milakar banate hain premium wellness solutions jo aapki zindagi ko badal denge. Hamara mission hai ki aapko shudh, taakatwar aur sustainable Ayurvedic products milein, jo aapko acchi sehat, santulan aur lambi umar ki taraf le jaayein.
              </p>
              <p className="text-white/70 leading-relaxed">
                Hamari soch hai ki asli wellness tabhi hoti hai jab aapka shareer, mann aur atma sabhi ko prakritik tareeke se poshan mile—yehi humare behtareen ingredients aur ethical practices ka maksad hai.
              </p>
              <p className="text-white/70 leading-relaxed">
                Hum vishwas karte hain ki sabko natural, asardar wellness solutions milna chahiye jo sirf sharirik swasthya hi nahi, balki man aur bhaavnaon ka santulan bhi banaye rakhein.
              </p>
            </motion.div>

            {/* Features Grid */}
            <motion.div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto" variants={container}>
              {[
                ...[
                  { title: "100% Natural & Pure Formula", description: "Every product is crafted from natural organic herbs without synthetic additives. Creating value through medicine building peak experiences." },
                  { title: "Science Backed Formulations", description: "We integrate ancient Ayurvedic principles with modern research. Optimized solutions to preventive and therapeutic healthcare and nutritional supplements." },
                  { title: "Commitment to Excellence", description: "Our relentless pursuit of quality ensures your health improvement and satisfaction. Quality through rigorous research cycle is our highest promise of outstanding results." },
                  { title: "Customer Centric Approach", description: "We listen to your needs and continuously advance technology. Creating comprehensible health solutions and support every customer's health path from beginning to finish." },
                ],
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="group"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                >
                  <div className="bg-black/30 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-yellow-300/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-300/5">
                    <h3 className="text-xl font-semibold mb-4 group-hover:text-yellow-300 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-white/75 leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-black/40 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-1/2 h-full">
              <img src={scienceWisdom} alt="Ancient wisdom meets modern science" className="w-full h-full object-cover opacity-20" />
              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <motion.div
                className="space-y-12"
                variants={container}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
              >
                <motion.div variants={fadeUp}>
                  <div className="mb-4">
                    <span className="text-yellow-300 text-sm font-medium tracking-wide uppercase">Ayurveda Meets Innovation</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6">Where Ancient Wisdom <br /> Merges with Modern <br /> Science</h2>
                  <p className="text-lg text-white/80 leading-relaxed mb-8">
                    At Baba Ji Ki Buti, our four decades of expertise meets cutting-edge research to create wellness solutions that honor traditional Ayurvedic principles while embracing scientific validation. Every product in our extensive range undergoes rigorous quality testing and follows authentic traditional formulations passed down through generations.
                  </p>
                </motion.div>

                {/* Stats Grid */}
                <motion.div className="grid grid-cols-2 gap-8" variants={container}>
                  {[
                    ...[
                      { number: 500000, label: "Happy Healthy Customers", description: "Trusted by millions for authentic wellness", suffix: "+", formatter: (v) => (v >= 100000 ? "5L" : v.toString()), customDisplay: "5L+" },
                      { number: 100, label: "Natural Ingredients", description: "Pure, organic, and carefully sourced", suffix: "%" },
                      { number: 10000, label: "Orders Every Month", description: "Growing community of wellness seekers", suffix: "+", formatter: (v) => (v >= 1000 ? `${Math.round(v / 1000)}K` : v.toString()), customDisplay: "10K+" },
                      { number: 50, label: "Authentic Ayurvedic Products", description: "Traditional formulations for modern needs", suffix: "+" },
                    ],
                  ].map((stat, index) => (
                    <motion.div key={index} className="text-center group" variants={scaleIn}>
                      <div className="bg-yellow-300/10 backdrop-blur-sm border border-yellow-300/20 p-6 rounded-2xl hover:bg-yellow-300/20 transition-all duration-300">
                        <div className="text-4xl font-bold text-yellow-300 mb-2 group-hover:scale-110 transition-transform">
                          {stat.customDisplay ? (
                            stat.customDisplay
                          ) : (
                            <AnimatedCount
                              end={stat.number}
                              duration={1.4}
                              suffix={stat.suffix || ""}
                              formattingFn={stat.formatter}
                            />
                          )}
                        </div>
                        <div className="text-sm font-semibold mb-2 uppercase tracking-wide">{stat.label}</div>
                        <div className="text-xs text-white/70">{stat.description}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right Image */}
              <motion.div className="relative" variants={scaleIn} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.3 }}>
                <div className="relative z-10">
                  <img src={products} alt="Premium ayurvedic products" className="w-full h-[600px] object-cover rounded-2xl shadow-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl" />
                </div>

                <div className="absolute -top-4 -right-4 w-24 h-24 border-2 border-yellow-300/30 rounded-2xl rotate-12 animate-pulse" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-yellow-300/20 rounded-full animate-pulse [animation-delay:1000ms]" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <motion.div
            className="container mx-auto px-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.div className="text-center mb-20 max-w-4xl mx-auto" variants={fadeUp}>
              <div className="mb-4">
                <span className="text-yellow-300 text-sm font-medium tracking-wide uppercase">Our Promise To You</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">We aim to maintain your Health, Naturally!</h2>
              <p className="text-lg text-white/80 leading-relaxed">
                At Baba Ji Ki Buti, we are committed to providing you with authentic Ayurvedic solutions that promote holistic wellness. Our mission is rooted in the belief that nature holds the key to optimal health, and we strive to unlock these treasures through time-tested formulations and modern scientific understanding.
              </p>
            </motion.div>

            <motion.div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto" variants={container}>
              {[
                ...[
                  { icon: Leaf, title: "Natural Ingredients", description: "Our products are sourced exclusively from pure, natural herbs and ingredients. We maintain the highest standards for authentic Ayurvedic medicine to support your wellness journey." },
                  { icon: Shield, title: "Scientifically Validated", description: "Every formula is developed and scientifically backed by clinical research. We combine traditional wisdom with modern testing to ensure effectiveness and safety." },
                  { icon: Award, title: "Ethical Sourcing", description: "We prioritize sustainable practices and ethical sourcing in all our operations. Our supply chain ensures fair trade and environmental responsibility in every aspect." },
                  { icon: Heart, title: "Quality Control", description: "Quality being our topmost priority, we maintain stringent quality control measures throughout our manufacturing process. Each product meets international standards for purity and effectiveness." },
                ],
              ].map((pillar, index) => {
                const IconComponent = pillar.icon;
                return (
                  <motion.div
                    key={index}
                    className="group text-center"
                    variants={fadeUp}
                    whileHover={{ y: -6 }}
                    transition={{ type: "spring", stiffness: 240, damping: 18 }}
                  >
                    <div className="bg-black/30 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-yellow-300/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-300/5 h-full">
                      <div className="w-16 h-16 mx-auto mb-6 bg-yellow-300/10 rounded-2xl flex items-center justify-center group-hover:bg-yellow-300/20 transition-colors">
                        <IconComponent className="h-8 w-8 text-yellow-300" />
                      </div>
                      <h3 className="text-xl font-semibold mb-4 group-hover:text-yellow-300 transition-colors">{pillar.title}</h3>
                      <p className="text-sm text-white/75 leading-relaxed">{pillar.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-black/30">
          <motion.div
            className="container mx-auto px-4"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
          >
            <motion.div className="text-center mb-16" variants={fadeUp}>
              <div className="mb-4">
                <span className="text-yellow-300 text-sm font-medium tracking-wide uppercase">Reviews & Opinions</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Customers Feedback</h2>
              <p className="text-white/70 max-w-2xl mx-auto">Hear what our valued customers have to say about their wellness journey with Baba Ji Ki Buti.</p>
            </motion.div>

            <motion.div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto" variants={container}>
              {[
                ...[
                  { rating: 5, text: "Amazing results! I've been using their products for 6 months now and feel more energetic than ever. The natural approach really works.", author: "Rajesh Kumar", location: "Delhi", verified: true },
                  { rating: 5, text: "Best quality ayurvedic products I've found. The customer service is exceptional and delivery is always on time. Highly recommended!", author: "Priya Sharma", location: "Mumbai", verified: true },
                  { rating: 5, text: "Three generations of trust and it shows in every product. The effectiveness of their formulations is unmatched. Thank you Baba Ji Ki Buti!", author: "Dr. Amit Singh", location: "Chandigarh", verified: true },
                ],
              ].map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="group"
                  variants={fadeUp}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 220, damping: 18 }}
                >
                  <div className="bg-black/30 backdrop-blur-md border border-white/10 p-8 rounded-2xl hover:border-yellow-300/30 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-300/5 h-full">
                    <div className="flex items-center mb-6">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-300" fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-white/80 leading-relaxed mb-6 italic">"{testimonial.text}"</p>
                    <div className="border-t border-white/10 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">{testimonial.author}</div>
                          <div className="text-sm text-white/70">{testimonial.location}</div>
                        </div>
                        {testimonial.verified && (
                          <div className="text-xs bg-yellow-300/20 text-yellow-300 px-2 py-1 rounded-full">Verified</div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ⬇️ NEW: Subscription Plans (directly after Reviews) */}
        <SubscriptionPlans />
      </main>
    </div>
  );
};

export default AboutUsSection;
