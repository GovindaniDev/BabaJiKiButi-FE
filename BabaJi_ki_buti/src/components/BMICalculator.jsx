import React, { useState } from 'react';
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

// Product configuration - easy to edit
const PRODUCT_DATA = {
  Underweight: [
    { id: 'wg1', name: 'Weight Gain Powder', tagline: 'Natural weight gain support', href: '#', img: 'https://images.pexels.com/photos/4474036/pexels-photo-4474036.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'wg2', name: 'Shatavari Kalp', tagline: 'Strength & vitality booster', href: '#', img: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'wg3', name: 'Herbal Appetite Booster', tagline: 'Improves digestion naturally', href: '#', img: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=200' }
  ],
  Normal: [
    { id: 'n1', name: 'Immunity Booster', tagline: 'Daily immune system support', href: '#', img: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'n2', name: 'Daily Multivitamin (Ayurvedic)', tagline: 'Complete nutrition balance', href: '#', img: 'https://images.pexels.com/photos/4474036/pexels-photo-4474036.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'n3', name: 'Heart & Liver Support', tagline: 'Organ health maintenance', href: '#', img: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=200' }
  ],
  Overweight: [
    { id: 'ow1', name: 'Fat Cutter Syrup', tagline: 'Natural weight management', href: '#', img: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'ow2', name: 'Metabolism Tea', tagline: 'Boosts natural metabolism', href: '#', img: 'https://images.pexels.com/photos/4474036/pexels-photo-4474036.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'ow3', name: 'Sugar Balance Capsules', tagline: 'Maintains healthy levels', href: '#', img: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=200' }
  ],
  Obese: [
    { id: 'ob1', name: 'Advanced Fat Burner', tagline: 'Intensive weight support', href: '#', img: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'ob2', name: 'Keto-Support Herbs', tagline: 'Ketogenic diet enhancement', href: '#', img: 'https://images.pexels.com/photos/4474036/pexels-photo-4474036.jpeg?auto=compress&cs=tinysrgb&w=200' },
    { id: 'ob3', name: 'Detox Kadha', tagline: 'Complete body cleansing', href: '#', img: 'https://images.pexels.com/photos/4033148/pexels-photo-4033148.jpeg?auto=compress&cs=tinysrgb&w=200' }
  ]
};

function getProductsForCategory(category) {
  return PRODUCT_DATA[category] || [];
}

// Category styles restricted to provided palette
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

/* -------------------------------- Subscription Band (from Dosha test) -------------------------------- */
const SubscriptionBand = () => {
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
                <Crown className="h-4 w-4" /> Membership
              </div>
              <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-[#2c2c2c] leading-tight">
                Save more with <span className="text-[#7b5e57] underline decoration-[#e8d8c3]">BJK Buti Plus</span>
              </h3>
              <p className="mt-2 text-[#4b3b37]">
                Fast delivery, member-only discounts, early access & priority support—cancel anytime.
              </p>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                <Included text="Up to 50% discount" />
                <Included text="Fast delivery benefits" />
                <Included text="Sale & drops early access" />
                <Included text="Update notifications" />
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
};
/* ----------------------------------------------------------------------------------------------------- */

function BMICalculator() {
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
    if (!w || w <= 0 || w > 300) newErrors.weight = 'वज़न 1-300 किलो के बीच होना चाहिए';

    if (formData.heightUnit === 'cm') {
      const h = parseFloat(formData.heightCm || '0');
      if (!h || h < 100 || h > 250) newErrors.height = 'ऊँचाई 100-250 सेमी के बीच होनी चाहिए';
    } else {
      const ft = parseFloat(formData.heightFt || '0');
      const inch = parseFloat(formData.heightIn || '0');
      if (!ft || ft < 3 || ft > 8) newErrors.heightFt = 'फुट 3-8 के बीच होना चाहिए';
      if (isNaN(inch) || inch < 0 || inch >= 12) newErrors.heightIn = 'इंच 0-11 के बीच होना चाहिए';
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

  const getMessage = () => {
    if (!result) return '';
    const name = (formData.name || '').trim() || 'आप';
    const age = formData.age ? `, उम्र: ${formData.age} वर्ष` : '';
    const categoryInHindi = {
      Underweight: 'कम वजन (Underweight)',
      Normal: 'सामान्य वजन (Normal Weight)',
      Overweight: 'अधिक वजन (Overweight)',
      Obese: 'मोटापा (Obese)'
    };
    return `${name}${age}, आपका BMI है: ${result.bmi.toFixed(2)}\nश्रेणी: ${categoryInHindi[result.category]}`;
  };

  const isUnderAge = formData.age && parseInt(formData.age, 10) < 18;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 py-30 text-gray-900">
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
                  जानिए आपका Body Score और पाएं सही Health Guide
                </h1>

                <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    Body Mass Index यानी BMI बताता है कि आपका वज़न आपकी हाइट के हिसाब से सही है या नहीं.
                    बहुत लोग diet aur gym start करते हैं bina yeh samjhe कि unka body type क्या है.
                    Baba Ji Ki Buti का ये free BMI Calculator आपको देता है एक आसान health idea —
                    और साथ में मिलती best category-wise product guide भी.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-[#aa7a4f] flex items-center gap-2">
                  <Shield className="w-6 h-6 text-[#a26833]" />
                  How It Works?
                </h2>

                <div className="space-y-3">
                  {[
                    "Apna naam aur age daliye (optional)",
                    "Gender choose kariye (optional) — future personalization",
                    "Apni height aur weight daliye",
                    "Click kariye — 'Calculate BMI'",
                    "Pata chalega aapka BMI zone aur सही health suggestion bhi!"
                  ].map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-[#a26833] mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Underweight ho ya overweight, normal ya obese — aapke zone ke hisab se curated सुझाव.
                  Hum recommend karenge ऐसे products jo aapki body ke liye zyada relevant hon.
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
                    BMI Calculator | Baba Ji Ki Buti
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      आपका नाम
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="आपका नाम"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      आपकी उम्र
                    </label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      placeholder="उम्र"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      वज़न (किलो में) *
                    </label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      placeholder="वज़न किलो में"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    />
                    {errors.weight && (
                      <p className="text-[#a26833] text-sm mt-1">{errors.weight}</p>
                    )}
                  </div>

                  {/* Height Unit Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ऊँचाई का फ़ॉर्म चुने *
                    </label>
                    <select
                      value={formData.heightUnit}
                      onChange={(e) => handleInputChange('heightUnit', e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                    >
                      <option value="cm">सेंटीमीटर (cm)</option>
                      <option value="ft">फुट-इंच (Feet, Inches)</option>
                    </select>
                  </div>

                  {/* Height Input */}
                  {formData.heightUnit === 'cm' ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ऊँचाई (cm) *
                      </label>
                      <input
                        type="number"
                        value={formData.heightCm}
                        onChange={(e) => handleInputChange('heightCm', e.target.value)}
                        placeholder="ऊँचाई सेंटीमीटर में"
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
                          फुट (Feet) *
                        </label>
                        <input
                          type="number"
                          value={formData.heightFt}
                          onChange={(e) => handleInputChange('heightFt', e.target.value)}
                          placeholder="फुट"
                          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                        />
                        {errors.heightFt && (
                          <p className="text-[#a26833] text-sm mt-1">{errors.heightFt}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          इंच (Inches) *
                        </label>
                        <input
                          type="number"
                          value={formData.heightIn}
                          onChange={(e) => handleInputChange('heightIn', e.target.value)}
                          placeholder="इंच"
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
                    BMI चेक करें
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
                        <span className="text-gray-700">BMI Result:</span>
                        <span className="text-2xl font-bold text-[#a26833]">
                          {result.bmi.toFixed(1)}
                        </span>
                      </div>

                      <div className={`px-4 py-2 rounded-lg border text-center ${result.bgColor}`}>
                        <span className={`font-bold ${result.color}`}>
                          {result.category}
                        </span>
                      </div>

                      <p className="text-gray-700 text-center bg-white/80 rounded-lg p-3 border border-gray-100">
                        {getMessage().split('\n').map((line, index) => (
                          <span key={index}>
                            {line}
                            {index === 0 && <br />}
                          </span>
                        ))}
                      </p>

                      {isUnderAge && (
                        <p className="text-[#F59E0B] text-sm text-center bg-white/80 rounded-lg p-2 border border-yellow-400/30">
                          ध्यान दें: 18 वर्ष से कम उम्र के लिए BMI ranges अलग होती हैं
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
                    आपके लिए खास सुझाव
                    <Leaf className="w-8 h-8 text-[#a26833]" />
                  </h3>
                  <p className="text-gray-700 max-w-2xl mx-auto">
                    आपके BMI category के हिसाब से ये products specially curated हैं।
                    Baba Ji की expertise से चुने गए natural और effective solutions।
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
                            alt={product.name}
                            className="w-full h-32 rounded-lg object-cover"
                          />
                          <div className="absolute top-2 right-2 bg-black/75 rounded-full p-1">
                            <Heart className="w-4 h-4 text-white" fill="currentColor" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-lg">{product.name}</h4>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">{product.tagline}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className="text-[#aa7a4f] font-semibold text-sm">Baba's Pick ⭐</span>
                          <a
                            href={product.href}
                            className="bg-[#a26833] text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          >
                            View Product
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* ---- Subscription band appended after products ---- */}
              <SubscriptionBand />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BMICalculator;
