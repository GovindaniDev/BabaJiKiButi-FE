import React, { useEffect, useRef, useState } from 'react';
import { Star, ShoppingCart, Check, Crown, Sparkles } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue
} from 'framer-motion';
import { Link } from 'react-router-dom';

/* =========================================================================
   DOSHA TEST – Professional UI, full-width stacked result + premium plan
   ========================================================================= */

export default function DoshaTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  // Parallax hero
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -64]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.75]);

  // Quiz data
  const questions = [
    {
      id: 1,
      question: 'आपकी त्वचा कैसी है?',
      options: [
        { text: 'शुष्क, पतली और खुरदरी', dosha: 'vata' },
        { text: 'गर्म, तैलीय और संवेदनशील', dosha: 'pitta' },
        { text: 'चिकनी, मोटी और चमकदार', dosha: 'kapha' }
      ]
    },
    {
      id: 2,
      question: 'आपकी भूख कैसी रहती है?',
      options: [
        { text: 'अनियमित, कभी बहुत भूख तो कभी नहीं', dosha: 'vata' },
        { text: 'तेज़ और नियमित, समय पर खाना ज़रूरी', dosha: 'pitta' },
        { text: 'धीमी और स्थिर, देर से भूख लगती है', dosha: 'kapha' }
      ]
    },
    {
      id: 3,
      question: 'आपका शरीर कैसा है?',
      options: [
        { text: 'पतला, हल्का, वजन बढ़ाना मुश्किल', dosha: 'vata' },
        { text: 'मध्यम, मांसपेशियों वाला', dosha: 'pitta' },
        { text: 'भारी, मोटा, वजन घटाना मुश्किल', dosha: 'kapha' }
      ]
    },
    {
      id: 4,
      question: 'आपको किस मौसम में असुविधा अधिक होती है?',
      options: [
        { text: 'सर्दी और हवादार मौसम में', dosha: 'vata' },
        { text: 'गर्मी और धूप में', dosha: 'pitta' },
        { text: 'ठंड और नमी वाले मौसम में', dosha: 'kapha' }
      ]
    },
    {
      id: 5,
      question: 'आपका स्वभाव कैसा है?',
      options: [
        { text: 'उत्साही, रचनात्मक, चंचल', dosha: 'vata' },
        { text: 'महत्वाकांक्षी, केंद्रित, प्रतिस्पर्धी', dosha: 'pitta' },
        { text: 'शांत, स्थिर, धैर्यवान', dosha: 'kapha' }
      ]
    },
    {
      id: 6,
      question: 'आपकी नींद कैसी रहती है?',
      options: [
        { text: 'हल्की, बार-बार टूटती है', dosha: 'vata' },
        { text: 'अच्छी लेकिन छोटी, जल्दी उठ जाते हैं', dosha: 'pitta' },
        { text: 'गहरी और लंबी, उठना मुश्किल', dosha: 'kapha' }
      ]
    },
    {
      id: 7,
      question: 'आपकी याददाश्त कैसी है?',
      options: [
        { text: 'जल्दी सीखते हैं, जल्दी भूल जाते हैं', dosha: 'vata' },
        { text: 'तेज़ और स्पष्ट याददाश्त', dosha: 'pitta' },
        { text: 'धीरे सीखते हैं, लंबे समय तक याद रहता है', dosha: 'kapha' }
      ]
    },
    {
      id: 8,
      question: 'आपको कैसी चीज़ें पसंद हैं?',
      options: [
        { text: 'गर्म, तेलीय और पौष्टिक भोजन', dosha: 'vata' },
        { text: 'ठंडा, मीठा और ताज़ा भोजन', dosha: 'pitta' },
        { text: 'मसालेदार, हल्का और सूखा भोजन', dosha: 'kapha' }
      ]
    },
    {
      id: 9,
      question: 'आपका पाचन कैसा रहता है?',
      options: [
        { text: 'अनियमित, कब्ज़ या गैस की समस्या', dosha: 'vata' },
        { text: 'मजबूत, कभी-कभी एसिडिटी', dosha: 'pitta' },
        { text: 'धीमा, भारीपन महसूस होता है', dosha: 'kapha' }
      ]
    },
    {
      id: 10,
      question: 'मानसिक दबाव में आप कैसी प्रतिक्रिया देते हैं?',
      options: [
        { text: 'चिंतित और घबराए हुए हो जाते हैं', dosha: 'vata' },
        { text: 'गुस्सा और चिड़चिड़ापन आता है', dosha: 'pitta' },
        { text: 'सुस्त और उदासीन हो जाते हैं', dosha: 'kapha' }
      ]
    }
  ];

  // Dosha info
  const doshaInfo = {
    vata: {
      name: 'वात',
      english: 'Vata',
      description: 'आपका प्रमुख दोष वात है। वात ऊर्जा, गति और रचनात्मकता का प्रतिनिधित्व करता है।',
      recommendations: [
        'गर्म, तेलीय और पौष्टिक भोजन करें',
        'ठंडी, सूखी और कच्ची चीज़ों से बचें',
        'तिल/घी की नियमित अभ्यंग (तेल मालिश)',
        'नियमित दिनचर्या और पर्याप्त नींद'
      ]
    },
    pitta: {
      name: 'पित्त',
      english: 'Pitta',
      description: 'आपका प्रमुख दोष पित्त है। पित्त अग्नि, परिवर्तन और बुद्धि का प्रतिनिधित्व करता है।',
      recommendations: [
        'ठंडा और मीठा भोजन करें (खीरा, नारियल पानी)',
        'तीखे, तले हुए और अत्यधिक मसालेदार खाने से बचें',
        'गुलाब जल/एलोवेरा का शीतल उपयोग',
        'शांत वातावरण, ध्यान और शीतल श्वास (शीतली)'
      ]
    },
    kapha: {
      name: 'कफ',
      english: 'Kapha',
      description: 'आपका प्रमुख दोष कफ है। कफ स्थिरता, शक्ति और धैर्य का प्रतिनिधित्व करता है।',
      recommendations: [
        'हल्का, गरम और मसालेदार भोजन',
        'दैनिक व्यायाम और स्वेदन (स्टीम)',
        'मीठा/दुग्धजन्य का संयमित सेवन',
        'गर्म पानी, अदरक/तुलसी चाय'
      ]
    }
  };

  // Benefits data
  const benefitsData = [
    { title: 'क्यों कुछ चीज़ें suit नहीं करती — समझेंगे', desc: 'Body nature जानकर food, habits और timing का सही चुनाव।' },
    { title: 'दवाएं/ट्रीटमेंट तेज असर दिखाएँ', desc: 'दोष clear होते ही herbs/formulas targeted काम करते हैं।' },
    { title: 'Lifestyle सुधार आसान', desc: 'Daily routine और decisions naturally health-friendly हो जाते हैं।' },
    { title: 'Long-term planning संभव', desc: 'दोष understanding lifelong balance की ओर ले जाती है।' }
  ];

  // Animation variants
  const containerStagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.08 } }
  };
  const itemFade = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 140, damping: 18 } }
  };
  const heroFade = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
  const cardPop = {
    hidden: { opacity: 0, scale: 0.98, y: 8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } },
    exit: { opacity: 0, scale: 0.98, y: -8, transition: { duration: 0.2 } }
  };

  // Progress spring
  const progressTarget = useMotionValue(0);
  const progressSmooth = useSpring(progressTarget, { stiffness: 120, damping: 18 });
  const progressWidth = useTransform(progressSmooth, v => `${v}%`);
  useEffect(() => {
    const pct = ((currentQuestion + 1) / questions.length) * 100;
    progressTarget.set(pct);
  }, [currentQuestion, questions.length, progressTarget]);

  // Theme
  const accent = '#C9A87A';
  const heroBg = 'url("https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1500&h=500&fit=crop")';

  // Placeholder image
  const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
      <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
      <stop stop-color='#f3eadf' offset='0'/><stop stop-color='#efe2d2' offset='1'/></linearGradient></defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        fill='#a88b67' font-size='20' font-family='system-ui, -apple-system, Segoe UI, Roboto'>Product</text>
    </svg>`
  );

  // Product map (replace img/href with real data)
  const productMap = {
    vata: [
      { id: 'ashwagandha', name: 'अश्वगंधा कैप्सूल', price: 399, benefit: 'तनाव संतुलन • नींद', img: PLACEHOLDER, href: '/product/ashwagandha' },
      { id: 'cow-ghee', name: 'देशी घी', price: 549, benefit: 'वात शमन • अग्नि', img: PLACEHOLDER, href: '/product/cow-ghee' },
      { id: 'dashmool', name: 'दशमूल काढ़ा', price: 299, benefit: 'जोड़/स्नायु', img: PLACEHOLDER, href: '/product/dashmool' },
      { id: 'triphala', name: 'त्रिफला पाउडर', price: 249, benefit: 'कोमल पाचन', img: PLACEHOLDER, href: '/product/triphala' }
    ],
    pitta: [
      { id: 'amla', name: 'आंवला जूस', price: 349, benefit: 'त्वचा/प्रतिरक्षा', img: PLACEHOLDER, href: '/product/amla-juice' },
      { id: 'rose-water', name: 'गुलाब जल', price: 199, benefit: 'त्वचा ठंडक', img: PLACEHOLDER, href: '/product/rose-water' },
      { id: 'shatavari', name: 'शतावरी टैबलेट', price: 429, benefit: 'पाचन व शीतलता', img: PLACEHOLDER, href: '/product/shatavari' },
      { id: 'neem', name: 'नीम कैप्सूल', price: 259, benefit: 'रक्त शुद्धि', img: PLACEHOLDER, href: '/product/neem' }
    ],
    kapha: [
      { id: 'tulsi', name: 'तुलसी ड्रॉप्स', price: 299, benefit: 'श्वसन • प्रतिरक्षा', img: PLACEHOLDER, href: '/product/tulsi' },
      { id: 'ginger', name: 'अदरक अर्क', price: 229, benefit: 'चयापचय • अग्नि', img: PLACEHOLDER, href: '/product/ginger' },
      { id: 'trikatu', name: 'त्रिकटु चूर्ण', price: 249, benefit: 'कफ शमन', img: PLACEHOLDER, href: '/product/trikatu' },
      { id: 'honey', name: 'शहद (रॉ)', price: 379, benefit: 'ऊर्जा • पाचन', img: PLACEHOLDER, href: '/product/honey' }
    ]
  };

  const getDoshaProducts = (key) => productMap[key] || [];
  const INR = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n || 0));

  // Actions
  const handleAnswer = (dosha) => {
    const newAnswers = { ...answers, [currentQuestion]: dosha };
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) setCurrentQuestion(q => q + 1);
    else calculateResult(newAnswers);
  };

  const calculateResult = (finalAnswers) => {
    const counts = { vata: 0, pitta: 0, kapha: 0 };
    Object.values(finalAnswers).forEach(d => (counts[d] += 1));
    const dominant = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
    setResult({ dominant, scores: counts, info: doshaInfo[dominant] });
    setShowResult(true);
    // optional: window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetQuiz = () => {
    setShowResult(false);
    setResult(null);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  /* ------------------------- Reusable UI pieces ------------------------- */

  const BenefitsSection = () => (
    <motion.div variants={containerStagger} initial="hidden" animate="visible">
      <motion.h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 mb-6" variants={itemFade}>
        <Sparkles className="w-6 h-6 text-amber-500" /> Benefits of Knowing दोष
      </motion.h3>
      <motion.div className="grid gap-5 sm:grid-cols-2" variants={containerStagger}>
        {benefitsData.map((item, i) => (
          <motion.div
            key={i}
            variants={itemFade}
            className="rounded-2xl bg-white/90 backdrop-blur border border-amber-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              <Star className="w-8 h-8 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" />
              <div>
                <p className="font-semibold text-gray-900 text-lg">{item.title}</p>
                <p className="text-gray-600 mt-1">{item.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  const ProductCard = ({ p }) => (
    <motion.div
      variants={itemFade}
      whileHover={{ y: -3 }}
      className="group bg-white rounded-2xl border border-[#eadbcc] shadow-sm overflow-hidden"
    >
      <div className="relative aspect-[4/3] bg-[#f6efe8]">
        <img src={p.img} alt={p.name} className="w-full h-full object-cover" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#7b5e57] border border-[#e7d5c5]">
          Dosha Fit
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900">{p.name}</h4>
        <p className="text-sm text-gray-600 mt-1">{p.benefit}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-[#7b5e57]">{INR(p.price)}</span>
          <div className="flex gap-2">
            <button
              onClick={() => console.log('Add to cart:', p.id)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-[#c9a87a] text-gray-900 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#c9a87a]/50 transition"
            >
              <ShoppingCart className="w-4 h-4" /> Add
            </button>
            <Link
              to={p.href}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border border-[#e7d5c5] text-[#7b5e57] hover:bg-[#fff7ef] focus:outline-none focus:ring-2 focus:ring-amber-200 transition"
            >
              View
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const RecommendedProducts = ({ dosha }) => {
    const items = getDoshaProducts(dosha);
    return (
      <section className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            {doshaInfo[dosha].name} के लिए सुझाए गए प्रोडक्ट्स
          </h3>
          <Link to="/shop" className="text-sm font-semibold text-[#7b5e57] hover:underline">सब देखें →</Link>
        </div>
        <motion.div
          variants={containerStagger}
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </motion.div>
      </section>
    );
  };

  const Included = ({ text }) => (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 rounded-md bg-black/10 p-1">
        <Check className="h-4 w-4 text-black/70" />
      </span>
      <span className="text-gray-800">{text}</span>
    </li>
  );

  const SubscriptionBand = () => (
    <section className="mt-12">
      <div
        className="relative overflow-hidden rounded-3xl border-2"
        style={{ borderColor: accent, background: 'linear-gradient(135deg,#f3e2cd,#f8efe3)' }}
      >
        {/* subtle pattern */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_20%_10%,rgba(255,255,255,.6),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,.4),transparent_45%)]" />
        <div className="relative p-6 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            {/* Left: Heading */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#7b5e57] border border-[#e7d5c5]">
                <Crown className="h-4 w-4" /> Membership
              </div>
              <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#2c2c2c] leading-tight">
                Save more with <span className="text-[#7b5e57] underline decoration-[#e8d8c3]">BJK Buti Plus</span>
              </h3>
              <p className="mt-2 text-[#4b3b37]">
                Fast delivery, member-only discounts, early access & priority support—cancel anytime.
              </p>
              {/* perks (2-col) */}
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                <Included text="Up to 50% discount" />
                <Included text="Fast delivery benefits" />
                <Included text="Sale & drops early access" />
                <Included text="Update notifications" />
              </ul>
            </div>

            {/* Right: Price + CTA */}
            <motion.div
              variants={cardPop}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              className="shrink-0 w-full max-w-sm bg-white rounded-2xl border border-[#e7d5c5] p-6 shadow-sm"
            >
              <div className="flex items-end gap-2">
                <div className="text-5xl font-extrabold text-[#7b5e57]">₹99</div>
                <div className="pb-2 text-sm text-gray-600">/month</div>
              </div>
              <button
                onClick={() => console.log('Subscribe: Basic monthly')}
                className="mt-6 w-full rounded-xl bg-[#7b5e57] px-5 py-3 font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#7b5e57]/50 transition"
              >
                Start Plus @ ₹99
              </button>
              <div className="mt-2 text-[11px] text-gray-500 text-center">Secure payment • Cancel anytime</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );

  /* -------------------------------- Result View -------------------------------- */
  if (showResult && result) {
    return (
      <MotionConfig reducedMotion="user">
        <div className="min-h-screen text-[17px] md:text-[18px] leading-relaxed" style={{ backgroundColor: '#faeade' }}>
          {/* Hero */}
          <motion.div
            ref={heroRef}
            className="relative bg-cover bg-center h-64 md:h-90"
            style={{
              backgroundImage: heroBg,
              backgroundBlendMode: 'overlay',
              backgroundColor: 'rgba(0,0,0,0.55)'
            }}
            variants={heroFade}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              style={{ y: heroY, opacity: heroOpacity }}
              className="relative z-10 h-full flex flex-col items-center justify-center text-white"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2 tracking-tight">Dosha Test</h1>
              <p className="text-lg md:text-xl lg:text-2xl/none opacity-90">Home / Dosha Test</p>
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.45),transparent_40%)]" />
          </motion.div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {/* Header + reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                आपका प्रमुख दोष: {result.info.name} ({result.info.english})
              </h2>
              <button
                onClick={resetQuiz}
                className="rounded-xl px-4 py-2 font-semibold border border-[#e7d5c5] text-[#7b5e57] bg-white hover:bg-[#fff7ef] focus:outline-none focus:ring-2 focus:ring-amber-200 transition"
              >
                फिर से परीक्षण करें
              </button>
            </div>

            {/* Scores */}
            <motion.div
              variants={containerStagger}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl p-6 shadow-sm border border-[#eadbcc]"
            >
              <p className="text-gray-800 mb-4">{result.info.description}</p>
              <div className="grid gap-5 sm:grid-cols-3">
                {['vata', 'pitta', 'kapha'].map((k) => {
                  const total = questions.length;
                  const val = result.scores[k] || 0;
                  const width = (val / total) * 100;
                  const label = k === 'vata' ? 'वात' : k === 'pitta' ? 'पित्त' : 'कफ';
                  return (
                    <div key={k}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold">{label}</span>
                        <span className="tabular-nums">{val}/{total}</span>
                      </div>
                      <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                        <motion.div
                          className="h-3 rounded-full"
                          style={{ backgroundColor: accent, width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Lifestyle tips */}
            <motion.div
              variants={cardPop}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.35 }}
              className="mt-8 bg-white rounded-2xl p-6 shadow-sm border border-[#eadbcc]"
            >
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">जीवनशैली व भोजन सुझाव</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {result.info.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-2xl mt-1" style={{ color: accent }}>•</span>
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Benefits */}
            <div className="mt-8">
              <BenefitsSection />
            </div>

            {/* Related products */}
            <RecommendedProducts dosha={result.dominant} />

            {/* Subscription plan */}
            <SubscriptionBand />
          </div>
        </div>
      </MotionConfig>
    );
  }

  /* -------------------------------- Quiz View -------------------------------- */
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen text-[17px] md:text-[18px] leading-relaxed" style={{ backgroundColor: '#faeade' }}>
        {/* Hero */}
        <motion.div
          ref={heroRef}
          className="relative bg-cover bg-center h-64 md:h-90"
          style={{
            backgroundImage: heroBg,
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0,0,0,0.55)'
          }}
          variants={heroFade}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 h-full flex flex-col items-center justify-center text-white"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2">Dosha Test</h1>
            <p className="text-lg md:text-xl lg:text-2xl/none opacity-90">Home / Dosha Test</p>
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.45),transparent_40%)]" />
        </motion.div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left content */}
            <motion.div variants={containerStagger} initial="hidden" animate="visible" className="space-y-6">
              <motion.h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight" variants={itemFade}>
                वात, पित्त, कफ – इनमें से कौन-सा दोष आपके शरीर में हावी है?
              </motion.h2>

              <motion.div className="rounded-2xl bg-white/90 backdrop-blur border border-amber-100 p-6 shadow-sm" variants={itemFade}>
                <p className="text-gray-800 mb-3">
                  <span className="font-bold">Dosha Test</span> आपकी आदतें, मानसिक स्थिति, पाचन, ऊर्जा और त्वचा जैसी चीज़ों के आधार पर
                  त्रिदोष का सरल विश्लेषण देता है।
                </p>
                <p className="text-gray-700">
                  संतुलन में दोष = स्वस्थ शरीर; असंतुलन = समस्या की शुरुआत। अभी टेस्ट करें और अपनी बॉडी का सही nature समझें।
                </p>
              </motion.div>

              {/* Compact benefits teaser */}
              <motion.div variants={itemFade}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {benefitsData.map((b, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex gap-3">
                      <Star className="w-6 h-6 text-amber-500" fill="currentColor" />
                      <div>
                        <div className="font-semibold text-gray-900">{b.title}</div>
                        <div className="text-gray-600 text-sm">{b.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right: quiz card */}
            <div className="lg:sticky lg:top-6 lg:self-start h-fit">
              <motion.div
                className="rounded-3xl shadow-2xl p-6 md:p-8 border-2 bg-gradient-to-br from-[#e7c9a1] to-[#f5e6da]"
                style={{ borderColor: accent }}
                variants={cardPop}
                initial="hidden"
                animate="visible"
                role="group"
                aria-labelledby="quiz-card-title"
              >
                <h2 id="quiz-card-title" className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-center mb-4" style={{ color: '#7b5e57' }}>
                  दोष परीक्षण
                </h2>
                <div className="w-32 h-1 mx-auto mb-6 rounded-full" style={{ backgroundColor: accent }} />

                {/* Progress */}
                <div className="w-full bg-white/50 rounded-full h-3 mb-6 overflow-hidden">
                  <motion.div className="h-3 rounded-full" style={{ backgroundColor: '#7b5e57', width: progressWidth }} />
                </div>
                <p className="text-center mb-6 text-[#2c2c2c] text-lg">
                  प्रश्न <span className="tabular-nums">{currentQuestion + 1}</span> / {questions.length}
                </p>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={currentQuestion} variants={cardPop} initial="hidden" animate="visible" exit="exit">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 text-[#2c2c2c]">
                      {questions[currentQuestion].question}
                    </h3>

                    {/* Accessible answers: buttons are keyboard/focus friendly */}
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(option.dosha)}
                          type="button"
                          className="w-full text-left p-4 md:p-5 rounded-xl bg-white/80 hover:bg-white border border-[#e7d5c5] hover:border-[#d7c2ad] focus:outline-none focus:ring-2 focus:ring-[#7b5e57]/30 transition shadow-sm"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          aria-label={option.text}
                        >
                          <span className="text-[#2c2c2c] text-base md:text-lg">{option.text}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {currentQuestion > 0 && (
                  <motion.button
                    onClick={() => setCurrentQuestion((q) => Math.max(0, q - 1))}
                    className="mt-6 text-[#7b5e57] font-semibold hover:opacity-80 transition-colors text-base md:text-lg focus:outline-none focus:ring-2 focus:ring-[#7b5e57]/30 rounded-lg px-2 py-1"
                    whileHover={{ x: -2 }}
                  >
                    ← पिछला प्रश्न
                  </motion.button>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
