import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  Star,
  Heart,
  Shield,
  Award,
  Leaf,
  Crown,
  Check
} from 'lucide-react';

/* ------------------------------ Language ------------------------------ */
function useLang() {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('bmi:lang') || 'hi';
    } catch {
      return 'hi';
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem('bmi:lang', lang);
    } catch {}
  }, [lang]);
  const L = (t) => (typeof t === 'string' ? t : t?.[lang] ?? t?.hi ?? t?.en ?? '');
  return { lang, setLang, L };
}

/* ----------------------------- Copy Strings ---------------------------- */
const STR = {
  pageTitle: { en: 'Know Your Body Score & Get the Right Guide', hi: 'जानिए आपका Body Score और पाएं सही Health Guide' },
  intro1: {
    en: 'Body Mass Index (BMI) tells whether your weight suits your height.',
    hi: 'Body Mass Index (BMI) बताता है कि आपका वज़न आपकी हाइट के हिसाब से सही है या नहीं।'
  },
  intro2: {
    en: 'Many start diet/gym without knowing their body type. This free BMI Calculator gives you a quick health idea and a category-wise product guide.',
    hi: 'कई लोग बिना body type समझे diet/gym शुरू कर देते हैं। यह free BMI Calculator आपकी health का आसान आइडिया देता है और category-wise product guide भी।'
  },
  howItWorks: { en: 'How It Works?', hi: 'कैसे काम करता है?' },
  steps: [
    { en: 'Enter your name and age (optional)', hi: 'अपना नाम और उम्र भरें (वैकल्पिक)' },
    { en: 'Choose gender (optional) — future personalization', hi: 'जेंडर चुनें (वैकल्पिक) — बाद में पर्सनलाइजेशन' },
    { en: 'Enter height and weight', hi: 'अपनी ऊँचाई और वज़न दर्ज करें' },
    { en: 'Click — “Calculate BMI”', hi: 'क्लिक करें — “BMI चेक करें”' },
    { en: 'See your BMI zone with the right suggestions!', hi: 'अपना BMI ज़ोन और सही सुझाव देखें!' }
  ],
  note: {
    en: 'Underweight, overweight, normal or obese — we curate suggestions based on your zone.',
    hi: 'Underweight, overweight, normal या obese — आपके ज़ोन के अनुसार सुझाव क्यूरेट किए जाते हैं।'
  },

  // Form
  calcTitle: { en: 'BMI Calculator | Baba Ji Ki Buti', hi: 'BMI कैलकुलेटर | बाबा जी की बूटी' },
  name: { en: 'Your Name', hi: 'आपका नाम' },
  age: { en: 'Your Age', hi: 'आपकी उम्र' },
  weight: { en: 'Weight (kg) *', hi: 'वज़न (किलो में) *' },
  weightPh: { en: 'Weight in kg', hi: 'वज़न किलो में' },
  unitLabel: { en: 'Height format *', hi: 'ऊँचाई का फ़ॉर्म चुने *' },
  unitCm: { en: 'Centimeters (cm)', hi: 'सेंटीमीटर (cm)' },
  unitFt: { en: 'Feet-Inches', hi: 'फुट-इंच' },
  heightCm: { en: 'Height (cm) *', hi: 'ऊँचाई (cm) *' },
  heightCmPh: { en: 'Height in centimeters', hi: 'ऊँचाई सेंटीमीटर में' },
  feet: { en: 'Feet *', hi: 'फुट (Feet) *' },
  inches: { en: 'Inches *', hi: 'इंच (Inches) *' },
  calcBtn: { en: 'Calculate BMI', hi: 'BMI चेक करें' },

  // Errors
  errWeight: {
    en: 'Weight must be between 1–300 kg',
    hi: 'वज़न 1-300 किलो के बीच होना चाहिए'
  },
  errHeightCm: {
    en: 'Height must be between 100–250 cm',
    hi: 'ऊँचाई 100-250 सेमी के बीच होनी चाहिए'
  },
  errFeet: {
    en: 'Feet must be between 3–8',
    hi: 'फुट 3-8 के बीच होना चाहिए'
  },
  errInches: {
    en: 'Inches must be between 0–11',
    hi: 'इंच 0-11 के बीच होना चाहिए'
  },

  // Results block
  bmiResult: { en: 'BMI Result:', hi: 'BMI परिणाम:' },
  category: { en: 'Category', hi: 'श्रेणी' },
  under18Note: {
    en: 'Note: BMI ranges differ for those under 18.',
    hi: 'ध्यान दें: 18 वर्ष से कम उम्र के लिए BMI रेंज अलग होती हैं।'
  },

  // Message lines
  msgYourBMI: {
    en: (name, age, bmi) => `${name}${age ? `, Age: ${age} yrs` : ''}, your BMI is: ${bmi}`,
    hi: (name, age, bmi) => `${name}${age ? `, उम्र: ${age} वर्ष` : ''}, आपका BMI है: ${bmi}`
  },
  msgCategory: {
    en: (label) => `Category: ${label}`,
    hi: (label) => `श्रेणी: ${label}`
  },

  // Category labels
  catLabels: {
    Underweight: { en: 'Underweight', hi: 'कम वजन (Underweight)' },
    Normal: { en: 'Normal Weight', hi: 'सामान्य वजन (Normal Weight)' },
    Overweight: { en: 'Overweight', hi: 'अधिक वजन (Overweight)' },
    Obese: { en: 'Obese', hi: 'मोटापा (Obese)' }
  },

  // Products section
  picksTitle: { en: 'Special Picks for You', hi: 'आपके लिए खास सुझाव' },
  picksDesc: {
    en: 'These products are curated based on your BMI category. Natural & effective selections.',
    hi: 'आपके BMI category के हिसाब से ये products specially curated हैं। Natural और effective चयन।'
  },
  badgePick: { en: "Baba's Pick ⭐", hi: 'Baba का पसंदीदा ⭐' },
  viewProduct: { en: 'View Product', hi: 'प्रोडक्ट देखें' },

  // Membership band
  membership: { en: 'Membership', hi: 'मेंबरशिप' },
  saveMoreWith: { en: 'Save more with', hi: 'ज़्यादा बचत करें —' },
  plusName: { en: 'BJK Buti Plus', hi: 'BJK Buti Plus' },
  plusDesc: {
    en: 'Fast delivery, member-only discounts, early access & priority support—cancel anytime.',
    hi: 'तेज़ डिलीवरी, मेंबर-ओनली डिस्काउंट, अर्ली एक्सेस व प्रायोरिटी सपोर्ट — कभी भी रद्द करें।'
  },
  perk1: { en: 'Up to 50% discount', hi: '50% तक छूट' },
  perk2: { en: 'Fast delivery benefits', hi: 'तेज़ डिलीवरी फायदे' },
  perk3: { en: 'Early access to sales & drops', hi: 'सेल व नए प्रोडक्ट्स पर अर्ली एक्सेस' },
  perk4: { en: 'Update notifications', hi: 'अपडेट नोटिफिकेशन' },
  priceSuffix: { en: '/month', hi: '/महीना' },
  ctaPlus: { en: 'Start Plus @ ₹99', hi: 'Plus शुरू करें @ ₹99' },
  payNote: { en: 'Secure payment • Cancel anytime', hi: 'सुरक्षित भुगतान • कभी भी रद्द' }
};

/* ------------------------- Product configuration ------------------------- */
const PRODUCT_DATA = {
  Underweight: [
    {
      id: 'wg1',
      name: { en: 'Weight Gain Powder', hi: 'वेट गेन पाउडर' },
      tagline: { en: 'Natural weight gain support', hi: 'प्राकृतिक वज़न बढ़ाने में मदद' },
      href: '#',
      img: 'https://images.pexels.com/photos/4474036/pexels-photo-4474036.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'wg2',
      name: { en: 'Shatavari Kalp', hi: 'शतावरी कल्प' },
      tagline: { en: 'Strength & vitality booster', hi: 'बल और ऊर्जा बढ़ाने में सहायक' },
      href: '#',
      img: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'wg3',
      name: { en: 'Herbal Appetite Booster', hi: 'हर्बल भूख बढ़ाने वाला' },
      tagline: { en: 'Improves digestion naturally', hi: 'पाचन में प्राकृतिक सुधार' },
      href: '#',
      img: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=200'
    }
  ],
  Normal: [
    {
      id: 'n1',
      name: { en: 'Immunity Booster', hi: 'इम्यूनिटी बूस्टर' },
      tagline: { en: 'Daily immune system support', hi: 'रोज़ाना प्रतिरक्षा सहयोग' },
      href: '#',
      img: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'n2',
      name: { en: 'Daily Multivitamin (Ayurvedic)', hi: 'डेली मल्टीविटामिन (आयुर्वेदिक)' },
      tagline: { en: 'Complete nutrition balance', hi: 'सम्पूर्ण पोषण संतुलन' },
      href: '#',
      img: 'https://images.pexels.com/photos/4474036/pexels-photo-4474036.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'n3',
      name: { en: 'Heart & Liver Support', hi: 'हृदय एवं लीवर सपोर्ट' },
      tagline: { en: 'Organ health maintenance', hi: 'अंग स्वास्थ्य का संरक्षण' },
      href: '#',
      img: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=200'
    }
  ],
  Overweight: [
    {
      id: 'ow1',
      name: { en: 'Fat Cutter Syrup', hi: 'फैट कटर सिरप' },
      tagline: { en: 'Natural weight management', hi: 'प्राकृतिक वज़न प्रबंधन' },
      href: '#',
      img: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'ow2',
      name: { en: 'Metabolism Tea', hi: 'मेटाबॉलिज़्म टी' },
      tagline: { en: 'Boosts natural metabolism', hi: 'प्राकृतिक मेटाबॉलिज़्म बढ़ाए' },
      href: '#',
      img: 'https://images.pexels.com/photos/4474036/pexels-photo-4474036.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'ow3',
      name: { en: 'Sugar Balance Capsules', hi: 'शुगर बैलेंस कैप्सूल' },
      tagline: { en: 'Maintains healthy levels', hi: 'स्वस्थ स्तर बनाए रखने में मदद' },
      href: '#',
      img: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=200'
    }
  ],
  Obese: [
    {
      id: 'ob1',
      name: { en: 'Advanced Fat Burner', hi: 'एडवांस्ड फैट बर्नर' },
      tagline: { en: 'Intensive weight support', hi: 'तेज़ वज़न घटाने में सहायता' },
      href: '#',
      img: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'ob2',
      name: { en: 'Keto-Support Herbs', hi: 'कीटो-सपोर्ट हर्ब्स' },
      tagline: { en: 'Enhances ketogenic diet', hi: 'कीटोजेनिक डाइट में सहायक' },
      href: '#',
      img: 'https://images.pexels.com/photos/4474036/pexels-photo-4474036.jpeg?auto=compress&cs=tinysrgb&w=200'
    },
    {
      id: 'ob3',
      name: { en: 'Detox Kadha', hi: 'डिटॉक्स काढ़ा' },
      tagline: { en: 'Complete body cleansing', hi: 'शरीर की सम्पूर्ण शुद्धि' },
      href: '#',
      img: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=200'
    }
  ]
};

function getProductsForCategory(category) {
  return PRODUCT_DATA[category] || [];
}

/* ----------------------- Category styles + helpers ---------------------- */
function getBMICategory(bmi) {
  if (bmi < 18.5) {
    return { category: 'Underweight', color: 'text-[#a26833]', bgColor: 'bg-[#ba9f7d]/20 border-[#a26833]' };
  } else if (bmi < 25) {
    return { category: 'Normal', color: 'text-[#aa7a4f]', bgColor: 'bg-[#aa7a4f]/10 border-[#aa7a4f]' };
  } else if (bmi < 30) {
    return { category: 'Overweight', color: 'text-[#ba9f7d]', bgColor: 'bg-[#ba9f7d]/20 border-[#ba9f7d]' };
  } else {
    return { category: 'Obese', color: 'text-white', bgColor: 'bg-black/75 border-black/75' };
  }
}

/* -------------------------------- Subscription Band -------------------------------- */
const SubscriptionBand = ({ L }) => {
  const accent = '#C9A87A';
  const Included = ({ text }) => (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 rounded-md bg-black/10 p-1">
        <Check className="h-4 w-4 text-black/70" />
      </span>
      <span className="text-gray-800">{text}</span>
    </li>
  );

  return (
    <section className="mt-12">
      <div
        className="relative overflow-hidden rounded-3xl border-2"
        style={{ borderColor: accent, background: 'linear-gradient(135deg,#f3e2cd,#f8efe3)' }}
      >
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_20%_10%,rgba(255,255,255,.6),transparent_40%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,.4),transparent_45%)]" />
        <div className="relative p-6 md:p-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-[#7b5e57] border border-[#e7d5c5]">
                <Crown className="h-4 w-4" /> {L(STR.membership)}
              </div>
              <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#2c2c2c] leading-tight">
                {L(STR.saveMoreWith)} <span className="text-[#7b5e57] underline decoration-[#e8d8c3]">{L(STR.plusName)}</span>
              </h3>
              <p className="mt-2 text-[#4b3b37]">
                {L(STR.plusDesc)}
              </p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                <Included text={L(STR.perk1)} />
                <Included text={L(STR.perk2)} />
                <Included text={L(STR.perk3)} />
                <Included text={L(STR.perk4)} />
              </ul>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 8 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              className="shrink-0 w-full max-w-sm bg-white rounded-2xl border border-[#e7d5c5] p-6 shadow-sm"
            >
              <div className="flex items-end gap-2">
                <div className="text-5xl font-extrabold text-[#7b5e57]">₹99</div>
                <div className="pb-2 text-sm text-gray-600">{L(STR.priceSuffix)}</div>
              </div>
              <button
                onClick={() => console.log('Subscribe: Basic monthly')}
                className="mt-6 w-full rounded-xl bg-[#7b5e57] px-5 py-3 font-semibold text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#7b5e57]/50 transition"
              >
                {L(STR.ctaPlus)}
              </button>
              <div className="mt-2 text-[11px] text-gray-500 text-center">{L(STR.payNote)}</div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* --------------------------------- Component --------------------------------- */
function BMICalculator() {
  const { lang, setLang, L } = useLang();

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    heightUnit: 'cm',
    heightCm: '',
    heightFt: '',
    heightIn: ''
  });

  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    const w = parseFloat(formData.weight || '0');
    if (!w || w <= 0 || w > 300) newErrors.weight = L(STR.errWeight);

    if (formData.heightUnit === 'cm') {
      const h = parseFloat(formData.heightCm || '0');
      if (!h || h < 100 || h > 250) newErrors.height = L(STR.errHeightCm);
    } else {
      const ft = parseFloat(formData.heightFt || '0');
      const inch = parseFloat(formData.heightIn || '0');
      if (!ft || ft < 3 || ft > 8) newErrors.heightFt = L(STR.errFeet);
      if (isNaN(inch) || inch < 0 || inch >= 12) newErrors.heightIn = L(STR.errInches);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = () => {
    if (!validateForm()) return;
    const weight = parseFloat(formData.weight);
    let heightM;
    if (formData.heightUnit === 'cm') {
      heightM = parseFloat(formData.heightCm) / 100;
    } else {
      const totalInches = (parseFloat(formData.heightFt) * 12) + parseFloat(formData.heightIn);
      heightM = totalInches * 0.0254;
    }
    const bmi = weight / (heightM * heightM);
    const { category, color, bgColor } = getBMICategory(bmi);
    setResult({ bmi, category, color, bgColor });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const getMessageLines = () => {
    if (!result) return [];
    const name = (formData.name || '').trim() || (lang === 'hi' ? 'आप' : 'You');
    const bmiText = (Math.round(result.bmi * 10) / 10).toFixed(1);
    const catLabel = L(STR.catLabels[result.category]);
    return [L(STR.msgYourBMI)(name, formData.age, bmiText), L(STR.msgCategory)(catLabel)];
  };

  const isUnderAge = formData.age && parseInt(formData.age, 10) < 18;

  /* ---------------------------- Lang Toggle UI ---------------------------- */
  const LangToggle = () => (
    <div className="fixed z-30 bottom right-4">
      <div className="inline-flex rounded-full border border-[#e7d5c5] bg-white/90 backdrop-blur">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-30 text-gray-900">
      <LangToggle />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main Grid - Two Columns */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 lg:order-1 order-2"
            >
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-[#aa7a4f] leading-tight">
                  {L(STR.pageTitle)}
                </h1>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    {L(STR.intro1)} {L(STR.intro2)}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#aa7a4f] flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#a26833]" />
                  {L(STR.howItWorks)}
                </h2>

                <div className="space-y-3">
                  {STR.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-[#a26833] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{L(step)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {L(STR.note)}
                </p>
              </div>
            </motion.div>

            {/* Right Column - Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:order-2 order-1"
            >
              <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-2xl">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[#aa7a4f] flex items-center justify-center gap-2">
                    <Stethoscope className="w-6 h-6 text-[#a26833]" />
                    {L(STR.calcTitle)}
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {L(STR.name)}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={L(STR.name)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {L(STR.age)}
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder={L(STR.age)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {L(STR.weight)}
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder={L(STR.weightPh)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                    {errors.weight && (
                      <p className="text-[#a26833] text-sm mt-1">{errors.weight}</p>
                    )}
                  </div>

                  {/* Height Unit Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {L(STR.unitLabel)}
                    </label>
                    <select
                      value={formData.heightUnit}
                      onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    >
                      <option value="cm">{L(STR.unitCm)}</option>
                      <option value="ft">{L(STR.unitFt)}</option>
                    </select>
                  </div>

                  {/* Height Input */}
                  {formData.heightUnit === 'cm' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {L(STR.heightCm)}
                      </label>
                      <input
                        type="number"
                        value={formData.heightCm}
                        onChange={(e) => handleInputChange('heightCm', e.target.value)}
                        placeholder={L(STR.heightCmPh)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                      />
                      {errors.height && (
                        <p className="text-[#a26833] text-sm mt-1">{errors.height}</p>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {L(STR.feet)}
                        </label>
                        <input
                          type="number"
                          value={formData.heightFt}
                          onChange={(e) => handleInputChange('heightFt', e.target.value)}
                          placeholder={L(STR.feet)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                        {errors.heightFt && (
                          <p className="text-[#a26833] text-sm mt-1">{errors.heightFt}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {L(STR.inches)}
                        </label>
                        <input
                          type="number"
                          value={formData.heightIn}
                          onChange={(e) => handleInputChange('heightIn', e.target.value)}
                          placeholder={L(STR.inches)}
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                        {errors.heightIn && (
                          <p className="text-[#a26833] text-sm mt-1">{errors.heightIn}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Calculate Button */}
                  <button
                    onClick={calculateBMI}
                    className="w-full bg-[#a26833] text-white font-bold py-4 px-6 rounded-lg hover:opacity-90 transition-all transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {L(STR.calcBtn)}
                  </button>

                  {/* Results */}
                  {result && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4 mt-6"
                      role="region"
                      aria-live="polite"
                    >
                      <div className="flex items-center justify-between bg-white/80 rounded-lg p-4 border border-gray-200">
                        <span className="text-gray-700">{L(STR.bmiResult)}</span>
                        <span className="text-2xl font-bold text-[#a26833]">
                          {result.bmi.toFixed(1)}
                        </span>
                      </div>

                      <div className={`px-4 py-2 rounded-lg border text-center ${result.bgColor}`}>
                        <span className={`font-bold ${result.color}`}>
                          {L(STR.catLabels[result.category])}
                        </span>
                      </div>

                      <p className="text-gray-700 text-center bg-white/80 rounded-lg p-3 border border-gray-100">
                        {getMessageLines().map((line, i) => (
                          <span key={i}>
                            {line}
                            {i === 0 && <br />}
                          </span>
                        ))}
                      </p>

                      {isUnderAge && (
                        <p className="text-[#F59E0B] text-sm text-center bg-white/80 rounded-lg p-2 border border-yellow-400/30">
                          {L(STR.under18Note)}
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Product Recommendations Section */}
          {result && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 border border-gray-200 shadow-2xl"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-[#aa7a4f] flex items-center justify-center gap-3 mb-4">
                    <Award className="w-8 h-8 text-[#a26833]" />
                    {L(STR.picksTitle)}
                    <Leaf className="w-8 h-8 text-[#a26833]" />
                  </h3>
                  <p className="text-gray-700 max-w-2xl mx-auto">
                    {L(STR.picksDesc)}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {getProductsForCategory(result.category).map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white/80 rounded-xl p-6 border border-gray-200 hover:shadow-lg hover:shadow-[#ba9f7d]/30 transition-all transform hover:scale-[1.02]"
                    >
                      <div className="space-y-4">
                        <div className="relative">
                          <img
                            src={product.img}
                            alt={L(product.name)}
                            className="w-full h-32 rounded-lg object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/75 rounded-full p-1">
                            <Heart className="w-4 h-4 text-white" fill="currentColor" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-lg">{L(product.name)}</h4>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{L(product.tagline)}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[#aa7a4f] font-semibold text-sm">{L(STR.badgePick)}</span>
                          <a
                            href={product.href}
                            className="bg-[#a26833] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            {L(STR.viewProduct)}
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Subscription band */}
              <SubscriptionBand L={L} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BMICalculator;
