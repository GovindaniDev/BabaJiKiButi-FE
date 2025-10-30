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
   DOSHA TEST – EN/HI language toggle
   ========================================================================= */

export default function DoshaTest() {
  // ------------------------- language toggle -------------------------
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('dosha:lang') || 'hi';
    } catch {
      return 'hi';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('dosha:lang', lang);
    } catch {}
  }, [lang]);

  const L = (t) => (typeof t === 'string' ? t : t?.[lang] ?? t?.hi ?? t?.en ?? '');

  // -------------------------- quiz state -----------------------------
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  // Parallax hero
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -64]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.75]);

  // --------------------------- copy bank -----------------------------
  const STR = {
    title: { en: 'Dosha Test', hi: 'दोष परीक्षण' },
    breadcrumb: { en: 'Home / Dosha Test', hi: 'होम / दोष परीक्षण' },
    heroQHeading: {
      en: 'Vata, Pitta or Kapha — which dosha dominates your body?',
      hi: 'वात, पित्त, कफ – इनमें से कौन-सा दोष आपके शरीर में हावी है?'
    },
    intro1: {
      en: 'Dosha Test gives a simple analysis of your tridosha based on habits, mind, digestion, energy and skin.',
      hi: 'Dosha Test आपकी आदतें, मानसिक स्थिति, पाचन, ऊर्जा और त्वचा जैसी चीज़ों के आधार पर त्रिदोष का सरल विश्लेषण देता है।'
    },
    intro2: {
      en: 'Balance = health; imbalance = the start of problems. Take the test now.',
      hi: 'संतुलन में दोष = स्वस्थ शरीर; असंतुलन = समस्या की शुरुआत। अभी टेस्ट करें।'
    },
    questionCount: { en: 'Question', hi: 'सवाल' },
    prevQ: { en: '← Previous question', hi: '← पिछला सवाल' },
    yourDominant: { en: 'Your dominant dosha:', hi: 'आपका प्रमुख दोष:' },
    retest: { en: 'Retake the test', hi: 'फिर से परीक्षण करें' },
    lifestyleTips: { en: 'Lifestyle & Diet Suggestions', hi: 'जीवनशैली व भोजन सुझाव' },
    benefitsHeading: { en: 'Benefits of Knowing Your Dosha', hi: 'क्यों कुछ चीज़ें suit नहीं करती — समझेंगे' },
    productsFor: { en: 'Recommended products for', hi: 'के लिए सुझाए गए प्रोडक्ट्स' },
    seeAll: { en: 'See all →', hi: 'सब देखें →' },
    membership: { en: 'Membership', hi: 'मेंबरशिप' },
    saveMore: { en: 'Save more with', hi: 'ज़्यादा बचत करें —' },
    plusName: { en: 'BJK Buti Plus', hi: 'BJK Buti Plus' },
    plusDesc: {
      en: 'Fast delivery, member-only discounts, early access & priority support—cancel anytime.',
      hi: 'तेज़ डिलीवरी, मेंबर-ओनली डिस्काउंट, अर्ली एक्सेस व प्रायोरिटी सपोर्ट — कभी भी रद्द करें।'
    },
    perk1: { en: 'Up to 50% discount', hi: '50% तक छूट' },
    perk2: { en: 'Fast delivery benefits', hi: 'तेज़ डिलीवरी फायदे' },
    perk3: { en: 'Early access to sales & drops', hi: 'सेल व नए प्रोडक्ट्स पर अर्ली एक्सेस' },
    perk4: { en: 'Update notifications', hi: 'अपडेट नोटिफिकेशन' },
    pricePerMonth: { en: '/month', hi: '/महीना' },
    startPlus: { en: 'Start Plus @ ₹99', hi: 'Plus शुरू करें @ ₹99' },
    secureCancel: { en: 'Secure payment • Cancel anytime', hi: 'सुरक्षित भुगतान • कभी भी रद्द' },
    doshaFit: { en: 'Dosha Fit', hi: 'दोष फिट' },
    add: { en: 'Add', hi: 'ऐड' },
    view: { en: 'View', hi: 'देखें' },
    // benefit cards (4)
    b1: {
      title: { en: 'Why some things don’t suit — clarity', hi: 'क्यों कुछ चीज़ें suit नहीं करती — समझेंगे' },
      desc: {
        en: 'Choose foods, habits and timing aligned with your body nature.',
        hi: 'Body nature जानकर food, habits और timing का सही चुनाव।'
      }
    },
    b2: {
      title: { en: 'Faster impact from treatments', hi: 'दवाएं/ट्रीटमेंट तेज असर दिखाएँ' },
      desc: {
        en: 'Once doshas are clear, herbs/formulas work more precisely.',
        hi: 'दोष clear होते ही herbs/formulas targeted काम करते हैं।'
      }
    },
    b3: {
      title: { en: 'Lifestyle becomes easier', hi: 'Lifestyle सुधार आसान' },
      desc: {
        en: 'Daily routine and decisions naturally become health-friendly.',
        hi: 'Daily routine और decisions naturally health-friendly हो जाते हैं।'
      }
    },
    b4: {
      title: { en: 'Supports long-term planning', hi: 'Long-term planning संभव' },
      desc: {
        en: 'Understanding doshas guides lifelong balance.',
        hi: 'दोष understanding lifelong balance की ओर ले जाती है।'
      }
    }
  };

  // ------------------------ questions (EN/HI) ------------------------
  const questions = [
    {
      id: 1,
      question: { en: 'How is your skin?', hi: 'आपकी त्वचा कैसी है?' },
      options: [
        { text: { en: 'Dry, thin, rough', hi: 'शुष्क, पतली और खुरदरी' }, dosha: 'vata' },
        { text: { en: 'Warm, oily, sensitive', hi: 'गर्म, तैलीय और संवेदनशील' }, dosha: 'pitta' },
        { text: { en: 'Smooth, thick, glowing', hi: 'चिकनी, मोटी और चमकदार' }, dosha: 'kapha' }
      ]
    },
    {
      id: 2,
      question: { en: 'How is your appetite?', hi: 'आपकी भूख कैसी रहती है?' },
      options: [
        { text: { en: 'Irregular; sometimes strong, sometimes low', hi: 'अनियमित, कभी बहुत भूख तो कभी नहीं' }, dosha: 'vata' },
        { text: { en: 'Sharp and regular; meals on time', hi: 'तेज़ और नियमित, समय पर खाना ज़रूरी' }, dosha: 'pitta' },
        { text: { en: 'Slow and steady; hunger comes late', hi: 'धीमी और स्थिर, देर से भूख लगती है' }, dosha: 'kapha' }
      ]
    },
    {
      id: 3,
      question: { en: 'What is your body build?', hi: 'आपका शरीर कैसा है?' },
      options: [
        { text: { en: 'Lean, light; hard to gain weight', hi: 'पतला, हल्का, वजन बढ़ाना मुश्किल' }, dosha: 'vata' },
        { text: { en: 'Medium, muscular', hi: 'मध्यम, मांसपेशियों वाला' }, dosha: 'pitta' },
        { text: { en: 'Heavy, broad; hard to lose weight', hi: 'भारी, मोटा, वजन घटाना मुश्किल' }, dosha: 'kapha' }
      ]
    },
    {
      id: 4,
      question: { en: 'Which weather feels uncomfortable?', hi: 'आपको किस मौसम में असुविधा अधिक होती है?' },
      options: [
        { text: { en: 'Cold & windy', hi: 'सर्दी और हवादार मौसम में' }, dosha: 'vata' },
        { text: { en: 'Heat & sun', hi: 'गर्मी और धूप में' }, dosha: 'pitta' },
        { text: { en: 'Cold & damp', hi: 'ठंड और नमी वाले मौसम में' }, dosha: 'kapha' }
      ]
    },
    {
      id: 5,
      question: { en: 'What is your temperament?', hi: 'आपका स्वभाव कैसा है?' },
      options: [
        { text: { en: 'Enthusiastic, creative, restless', hi: 'उत्साही, रचनात्मक, चंचल' }, dosha: 'vata' },
        { text: { en: 'Ambitious, focused, competitive', hi: 'महत्वाकांक्षी, केंद्रित, प्रतिस्पर्धी' }, dosha: 'pitta' },
        { text: { en: 'Calm, steady, patient', hi: 'शांत, स्थिर, धैर्यवान' }, dosha: 'kapha' }
      ]
    },
    {
      id: 6,
      question: { en: 'How is your sleep?', hi: 'आपकी नींद कैसी रहती है?' },
      options: [
        { text: { en: 'Light, easily disturbed', hi: 'हल्की, बार-बार टूटती है' }, dosha: 'vata' },
        { text: { en: 'Good but short; early rising', hi: 'अच्छी लेकिन छोटी, जल्दी उठ जाते हैं' }, dosha: 'pitta' },
        { text: { en: 'Deep and long; hard to wake', hi: 'गहरी और लंबी, उठना मुश्किल' }, dosha: 'kapha' }
      ]
    },
    {
      id: 7,
      question: { en: 'How is your memory?', hi: 'आपकी याददाश्त कैसी है?' },
      options: [
        { text: { en: 'Learn fast, forget fast', hi: 'जल्दी सीखते हैं, जल्दी भूल जाते हैं' }, dosha: 'vata' },
        { text: { en: 'Sharp and clear', hi: 'तेज़ और स्पष्ट याददाश्त' }, dosha: 'pitta' },
        { text: { en: 'Slow to learn, long retention', hi: 'धीरे सीखते हैं, लंबे समय तक याद रहता है' }, dosha: 'kapha' }
      ]
    },
    {
      id: 8,
      question: { en: 'What do you prefer?', hi: 'आपको कैसी चीज़ें पसंद हैं?' },
      options: [
        { text: { en: 'Warm, oily, nourishing food', hi: 'गर्म, तेलीय और पौष्टिक भोजन' }, dosha: 'vata' },
        { text: { en: 'Cool, sweet, fresh food', hi: 'ठंडा, मीठा और ताज़ा भोजन' }, dosha: 'pitta' },
        { text: { en: 'Spicy, light & dry food', hi: 'मसालेदार, हल्का और सूखा भोजन' }, dosha: 'kapha' }
      ]
    },
    {
      id: 9,
      question: { en: 'How is your digestion?', hi: 'आपका पाचन कैसा रहता है?' },
      options: [
        { text: { en: 'Irregular; constipation or gas', hi: 'अनियमित, कब्ज़ या गैस की समस्या' }, dosha: 'vata' },
        { text: { en: 'Strong; occasional acidity', hi: 'मजबूत, कभी-कभी एसिडिटी' }, dosha: 'pitta' },
        { text: { en: 'Slow; heaviness after meals', hi: 'धीमा, भारीपन महसूस होता है' }, dosha: 'kapha' }
      ]
    },
    {
      id: 10,
      question: { en: 'Under stress, how do you respond?', hi: 'मानसिक दबाव में आप कैसी प्रतिक्रिया देते हैं?' },
      options: [
        { text: { en: 'Anxious and nervous', hi: 'चिंतित और घबराए हुए हो जाते हैं' }, dosha: 'vata' },
        { text: { en: 'Irritable / angry', hi: 'गुस्सा और चिड़चिड़ापन आता है' }, dosha: 'pitta' },
        { text: { en: 'Lethargic / indifferent', hi: 'सुस्त और उदासीन हो जाते हैं' }, dosha: 'kapha' }
      ]
    }
  ];

  // Dosha info
  const doshaInfo = {
    vata: {
      name: { en: 'Vata', hi: 'वात' },
      english: 'Vata',
      description: {
        en: 'Your dominant dosha is Vata — representing movement, energy and creativity.',
        hi: 'आपका प्रमुख दोष वात है। वात ऊर्जा, गति और रचनात्मकता का प्रतिनिधित्व करता है।'
      },
      recommendations: [
        { en: 'Eat warm, oily and nourishing meals', hi: 'गर्म, तेलीय और पौष्टिक भोजन करें' },
        { en: 'Avoid cold, dry and raw foods', hi: 'ठंडी, सूखी और कच्ची चीज़ों से बचें' },
        { en: 'Regular abhyanga with sesame/ghī', hi: 'तिल/घी की नियमित अभ्यंग (तेल मालिश)' },
        { en: 'Keep a routine and sleep well', hi: 'नियमित दिनचर्या और पर्याप्त नींद' }
      ]
    },
    pitta: {
      name: { en: 'Pitta', hi: 'पित्त' },
      english: 'Pitta',
      description: {
        en: 'Your dominant dosha is Pitta — representing fire, transformation and intellect.',
        hi: 'आपका प्रमुख दोष पित्त है। पित्त अग्नि, परिवर्तन और बुद्धि का प्रतिनिधित्व करता है।'
      },
      recommendations: [
        { en: 'Prefer cooling & sweet foods (cucumber, coconut water)', hi: 'ठंडा और मीठा भोजन करें (खीरा, नारियल पानी)' },
        { en: 'Avoid very spicy, fried foods', hi: 'तीखे, तले हुए और अत्यधिक मसालेदार खाने से बचें' },
        { en: 'Use rose water/aloe for cooling', hi: 'गुलाब जल/एलोवेरा का शीतल उपयोग' },
        { en: 'Choose calm settings, meditation, sheetali breath', hi: 'शांत वातावरण, ध्यान और शीतल श्वास (शीतली)' }
      ]
    },
    kapha: {
      name: { en: 'Kapha', hi: 'कफ' },
      english: 'Kapha',
      description: {
        en: 'Your dominant dosha is Kapha — representing stability, strength and patience.',
        hi: 'आपका प्रमुख दोष कफ है। कफ स्थिरता, शक्ति और धैर्य का प्रतिनिधित्व करता है।'
      },
      recommendations: [
        { en: 'Eat light, warm and gently spicy food', hi: 'हल्का, गरम और मसालेदार भोजन' },
        { en: 'Daily exercise and steam/svedana', hi: 'दैनिक व्यायाम और स्वेदन (स्टीम)' },
        { en: 'Limit sweets & dairy', hi: 'मीठा/दुग्धजन्य का संयमित सेवन' },
        { en: 'Warm water; ginger/tulsi tea', hi: 'गर्म पानी, अदरक/तुलसी चाय' }
      ]
    }
  };

  // Benefits data
  const benefitsData = [STR.b1, STR.b2, STR.b3, STR.b4];

  // Animations
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

  // Progress
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
  const PLACEHOLDER =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='600' height='400'>
      <defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
      <stop stop-color='#f3eadf' offset='0'/><stop stop-color='#efe2d2' offset='1'/></linearGradient></defs>
      <rect width='100%' height='100%' fill='url(#g)'/>
      <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
        fill='#a88b67' font-size='20' font-family='system-ui, -apple-system, Segoe UI, Roboto'>Product</text>
    </svg>`
    );

  // Products (with EN/HI fields)
  const productMap = {
    vata: [
      {
        id: 'ashwagandha',
        name: { en: 'Ashwagandha Capsules', hi: 'अश्वगंधा कैप्सूल' },
        price: 399,
        benefit: { en: 'Stress balance • Sleep', hi: 'तनाव संतुलन • नींद' },
        img: PLACEHOLDER,
        href: '/product/ashwagandha'
      },
      {
        id: 'cow-ghee',
        name: { en: 'Desi Cow Ghee', hi: 'देशी घी' },
        price: 549,
        benefit: { en: 'Vata pacifying • Agni', hi: 'वात शमन • अग्नि' },
        img: PLACEHOLDER,
        href: '/product/cow-ghee'
      },
      {
        id: 'dashmool',
        name: { en: 'Dashmool Decoction', hi: 'दशमूल काढ़ा' },
        price: 299,
        benefit: { en: 'Joints / nerves', hi: 'जोड़/स्नायु' },
        img: PLACEHOLDER,
        href: '/product/dashmool'
      },
      {
        id: 'triphala',
        name: { en: 'Triphala Powder', hi: 'त्रिफला पाउडर' },
        price: 249,
        benefit: { en: 'Gentle digestion', hi: 'कोमल पाचन' },
        img: PLACEHOLDER,
        href: '/product/triphala'
      }
    ],
    pitta: [
      {
        id: 'amla',
        name: { en: 'Amla Juice', hi: 'आंवला जूस' },
        price: 349,
        benefit: { en: 'Skin / immunity', hi: 'त्वचा/प्रतिरक्षा' },
        img: PLACEHOLDER,
        href: '/product/amla-juice'
      },
      {
        id: 'rose-water',
        name: { en: 'Rose Water', hi: 'गुलाब जल' },
        price: 199,
        benefit: { en: 'Skin cooling', hi: 'त्वचा ठंडक' },
        img: PLACEHOLDER,
        href: '/product/rose-water'
      },
      {
        id: 'shatavari',
        name: { en: 'Shatavari Tablets', hi: 'शतावरी टैबलेट' },
        price: 429,
        benefit: { en: 'Digestion & cooling', hi: 'पाचन व शीतलता' },
        img: PLACEHOLDER,
        href: '/product/shatavari'
      },
      {
        id: 'neem',
        name: { en: 'Neem Capsules', hi: 'नीम कैप्सूल' },
        price: 259,
        benefit: { en: 'Blood purification', hi: 'रक्त शुद्धि' },
        img: PLACEHOLDER,
        href: '/product/neem'
      }
    ],
    kapha: [
      {
        id: 'tulsi',
        name: { en: 'Tulsi Drops', hi: 'तुलसी ड्रॉप्स' },
        price: 299,
        benefit: { en: 'Respiratory • Immunity', hi: 'श्वसन • प्रतिरक्षा' },
        img: PLACEHOLDER,
        href: '/product/tulsi'
      },
      {
        id: 'ginger',
        name: { en: 'Ginger Extract', hi: 'अदरक अर्क' },
        price: 229,
        benefit: { en: 'Metabolism • Agni', hi: 'चयापचय • अग्नि' },
        img: PLACEHOLDER,
        href: '/product/ginger'
      },
      {
        id: 'trikatu',
        name: { en: 'Trikatu Churna', hi: 'त्रिकटु चूर्ण' },
        price: 249,
        benefit: { en: 'Kapha pacifying', hi: 'कफ शमन' },
        img: PLACEHOLDER,
        href: '/product/trikatu'
      },
      {
        id: 'honey',
        name: { en: 'Raw Honey', hi: 'शहद (रॉ)' },
        price: 379,
        benefit: { en: 'Energy • Digestion', hi: 'ऊर्जा • पाचन' },
        img: PLACEHOLDER,
        href: '/product/honey'
      }
    ]
  };

  const getDoshaProducts = (key) => productMap[key] || [];
  const INR = (n) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(
      Number(n || 0)
    );

  // Actions
  const handleAnswer = (dosha) => {
    const newAnswers = { ...answers, [currentQuestion]: dosha };
    setAnswers(newAnswers);
    if (currentQuestion < questions.length - 1) setCurrentQuestion((q) => q + 1);
    else calculateResult(newAnswers);
  };

  const calculateResult = (finalAnswers) => {
    const counts = { vata: 0, pitta: 0, kapha: 0 };
    Object.values(finalAnswers).forEach((d) => (counts[d] += 1));
    const dominant = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b));
    setResult({ dominant, scores: counts, info: doshaInfo[dominant] });
    setShowResult(true);
  };

  const resetQuiz = () => {
    setShowResult(false);
    setResult(null);
    setCurrentQuestion(0);
    setAnswers({});
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  /* ------------------------- Reusable UI pieces ------------------------- */

  const LangToggle = () => (
    <div className="absolute bottom-6 right-4 z-20">
      <div className="inline-flex rounded-full border border-[#e7d5c5] bg-white/80 backdrop-blur">
        <button
          onClick={() => setLang('en')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-l-full ${
            lang === 'en' ? 'bg-[#7b5e57] text-white' : 'text-[#7b5e57] hover:bg-[#fff7ef]'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('hi')}
          className={`px-3 py-1.5 text-sm font-semibold rounded-r-full ${
            lang === 'hi' ? 'bg-[#7b5e57] text-white' : 'text-[#7b5e57] hover:bg-[#fff7ef]'
          }`}
        >
          हिन्दी
        </button>
      </div>
    </div>
  );

  const BenefitsSection = () => (
    <motion.div variants={containerStagger} initial="hidden" animate="visible">
      <motion.h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2 mb-6" variants={itemFade}>
        <Sparkles className="w-6 h-6 text-amber-500" /> {L(STR.benefitsHeading)}
      </motion.h3>
      <motion.div className="grid gap-5 sm:grid-cols-2" variants={containerStagger}>
        {benefitsData.map((b, i) => (
          <motion.div
            key={i}
            variants={itemFade}
            className="rounded-2xl bg-white/90 backdrop-blur border border-amber-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex gap-4">
              <Star className="w-8 h-8 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" />
              <div>
                <p className="font-semibold text-gray-900 text-lg">{L(b.title)}</p>
                <p className="text-gray-600 mt-1">{L(b.desc)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  const ProductCard = ({ p }) => (
    <motion.div variants={itemFade} whileHover={{ y: -3 }} className="group bg-white rounded-2xl border border-[#eadbcc] shadow-sm overflow-hidden">
      <div className="relative aspect-[4/3] bg-[#f6efe8]">
        <img src={p.img} alt={L(p.name)} className="w-full h-full object-cover" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#7b5e57] border border-[#e7d5c5]">
          {L(STR.doshaFit)}
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-gray-900">{L(p.name)}</h4>
        <p className="text-sm text-gray-600 mt-1">{L(p.benefit)}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-lg font-bold text-[#7b5e57]">{INR(p.price)}</span>
          <div className="flex gap-2">
            <button
              onClick={() => console.log('Add to cart:', p.id)}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 bg-[#c9a87a] text-gray-900 font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#c9a87a]/50 transition"
            >
              <ShoppingCart className="w-4 h-4" /> <span className="text-white">{L(STR.add)}</span>
            </button>
            <Link
              to={p.href}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 border border-[#e7d5c5] text-[#7b5e57] hover:bg-[#fff7ef] focus:outline-none focus:ring-2 focus:ring-amber-200 transition"
            >
              {L(STR.view)}
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
            {L(doshaInfo[dosha].name)} {L(STR.productsFor)}
          </h3>
          <Link to="/shop" className="text-sm font-semibold text-[#7b5e57] hover:underline">
            {L(STR.seeAll)}
          </Link>
        </div>
        <motion.div variants={containerStagger} initial="hidden" animate="visible" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
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
      <div className="relative overflow-hidden rounded-3xl border-2" style={{ borderColor: accent, background: 'linear-gradient(135deg,#f3e2cd,#f5e6da)' }}>
        {/* subtle pattern */}
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_20%_10%,rgba(255,255,255,.6),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,.4),transparent_45%)]" />
        <div className="relative p-6 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            {/* Left: Heading */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#7b5e57] border border-[#e7d5c5]">
                <Crown className="h-4 w-4" /> {L(STR.membership)}
              </div>
              <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#2c2c2c] leading-tight">
                {L(STR.saveMore)} <span className="text-[#7b5e57] underline decoration-[#e8d8c3]">{L(STR.plusName)}</span>
              </h3>
              <p className="mt-2 text-[#4b3b37]">{L(STR.plusDesc)}</p>
              {/* perks (2-col) */}
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                <Included text={L(STR.perk1)} />
                <Included text={L(STR.perk2)} />
                <Included text={L(STR.perk3)} />
                <Included text={L(STR.perk4)} />
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
                <div className="pb-2 text-sm text-gray-600">{L(STR.pricePerMonth)}</div>
              </div>
              <button
                onClick={() => console.log('Subscribe: Basic monthly')}
                className="mt-6 w-full rounded-xl bg-[#7b5e57] px-5 py-3 font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#7b5e57]/50 transition"
              >
                {L(STR.startPlus)}
              </button>
              <div className="mt-2 text-[11px] text-gray-500 text-center">{L(STR.secureCancel)}</div>
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
            style={{ backgroundImage: heroBg, backgroundBlendMode: 'overlay', backgroundColor: 'rgba(0,0,0,0.55)' }}
            variants={heroFade}
            initial="hidden"
            animate="visible"
          >
            <LangToggle />
            <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 h-full flex flex-col items-center justify-center text-white">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-2 tracking-tight">{L(STR.title)}</h1>
              <p className="text-lg md:text-xl lg:text-2xl/none opacity-90">{L(STR.breadcrumb)}</p>
            </motion.div>
            <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.45),transparent_40%)]" />
          </motion.div>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
            {/* Header + reset */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                {L(STR.yourDominant)} {L(result.info.name)} ({result.info.english})
              </h2>
              <button
                onClick={resetQuiz}
                className="rounded-xl px-4 py-2 font-semibold border border-[#e7d5c5] text-[#7b5e57] bg-white hover:bg-[#fff7ef] focus:outline-none focus:ring-2 focus:ring-amber-200 transition"
              >
                {L(STR.retest)}
              </button>
            </div>

            {/* Scores */}
            <motion.div variants={containerStagger} initial="hidden" animate="visible" className="bg-white rounded-2xl p-6 shadow-sm border border-[#eadbcc]">
              <p className="text-gray-800 mb-4">{L(result.info.description)}</p>
              <div className="grid gap-5 sm:grid-cols-3">
                {['vata', 'pitta', 'kapha'].map((k) => {
                  const total = questions.length;
                  const val = result.scores[k] || 0;
                  const width = (val / total) * 100;
                  const label =
                    k === 'vata' ? L(doshaInfo.vata.name) : k === 'pitta' ? L(doshaInfo.pitta.name) : L(doshaInfo.kapha.name);
                  return (
                    <div key={k}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="font-semibold">{label}</span>
                        <span className="tabular-nums">
                          {val}/{total}
                        </span>
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
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">{L(STR.lifestyleTips)}</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {result.info.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="text-2xl mt-1" style={{ color: accent }}>
                      •
                    </span>
                    <span className="text-gray-700">{L(rec)}</span>
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
          style={{ backgroundImage: heroBg, backgroundBlendMode: 'overlay', backgroundColor: 'rgba(0,0,0,0.55)' }}
          variants={heroFade}
          initial="hidden"
          animate="visible"
        >
          <LangToggle />
          <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 h-full flex flex-col items-center justify-center text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-2">{L(STR.title)}</h1>
            <p className="text-lg md:text-xl lg:text-2xl/none opacity-90">{L(STR.breadcrumb)}</p>
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,.45),transparent_40%)]" />
        </motion.div>

        {/* Body */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left content */}
            <motion.div variants={containerStagger} initial="hidden" animate="visible" className="space-y-6">
              <motion.h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 leading-tight" variants={itemFade}>
                {L(STR.heroQHeading)}
              </motion.h2>

              <motion.div className="rounded-2xl bg-white/90 backdrop-blur border border-amber-100 p-6 shadow-sm" variants={itemFade}>
                <p className="text-gray-800 mb-3">
                  <span className="font-bold">{L(STR.title)}</span> {L(STR.intro1)}
                </p>
                <p className="text-gray-700">{L(STR.intro2)}</p>
              </motion.div>

              {/* Compact benefits teaser */}
              <motion.div variants={itemFade}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {benefitsData.map((b, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-amber-100 flex gap-3">
                      <Star className="w-6 h-6 text-amber-500" fill="currentColor" />
                      <div>
                        <div className="font-semibold text-gray-900">{L(b.title)}</div>
                        <div className="text-gray-600 text-sm">{L(b.desc)}</div>
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
                  {L(STR.title)}
                </h2>
                <div className="w-32 h-1 mx-auto mb-6 rounded-full" style={{ backgroundColor: accent }} />

                {/* Progress */}
                <div className="w-full bg-white/50 rounded-full h-3 mb-6 overflow-hidden">
                  <motion.div className="h-3 rounded-full" style={{ backgroundColor: '#7b5e57', width: progressWidth }} />
                </div>
                <p className="text-center mb-6 text-[#2c2c2c] text-lg">
                  {L(STR.questionCount)} <span className="tabular-nums">{currentQuestion + 1}</span> / {questions.length}
                </p>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={currentQuestion} variants={cardPop} initial="hidden" animate="visible" exit="exit">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 text-[#2c2c2c]">
                      {L(questions[currentQuestion].question)}
                    </h3>

                    {/* Accessible answers */}
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(option.dosha)}
                          type="button"
                          className="w-full text-left p-4 md:p-5 rounded-xl bg-white/80 hover:bg-white border border-[#e7d5c5] hover:border-[#d7c2ad] focus:outline-none focus:ring-2 focus:ring-[#7b5e57]/30 transition shadow-sm"
                          whileHover={{ y: -1 }}
                          whileTap={{ scale: 0.98 }}
                          aria-label={L(option.text)}
                        >
                          <span className="text-[#2c2c2c] text-base md:text-lg">{L(option.text)}</span>
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
                    {L(STR.prevQ)}
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
