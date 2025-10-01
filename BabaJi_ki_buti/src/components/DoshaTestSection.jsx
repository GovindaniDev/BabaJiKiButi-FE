import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Star } from 'lucide-react';
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useSpring,
  useTransform,
  useMotionValue
} from 'framer-motion';

export default function DoshaTest() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);

  // Scroll-driven hero parallax
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.6]);

  // Quiz
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
      ],
      products: [
        'अश्वगंधा — स्थिरता और तनाव संतुलन',
        'घी — वायु-शमन और पाचन के लिए',
        'दशमूल — वात शमन संयोजन',
        'त्रिफला — कोमल पाचन सहायक'
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
      ],
      products: ['आंवला — प्रतिरक्षा और त्वचा के लिए', 'गुलाब जल — त्वचा को ठंडक', 'शतावरी — पाचन संतुलन', 'नीम — रक्त शुद्धि']
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
      ],
      products: ['तुलसी — श्वसन तंत्र', 'अदरक — पाचन/चयापचय', 'त्रिकटु — कफ शमन', 'शहद — ऊर्जा और पाचन']
    }
  };

  // Benefits data
  const benefitsData = [
    {
      title: 'आपको समझ आएगा कि क्यों कुछ चीज़ें आपको suit नहीं करती',
      desc: 'शरीर की nature जानने से आप सही plan करेंगे कि कौन सी food, habits aur timing आपके लिए सही है.'
    },
    {
      title: 'दवाएं और treatment काम करने लगते हैं',
      desc: 'जब सही दोष पकड़ लें गे आ जाए, तो फिर herbs aur formulas भी सीधा असर दिखाती हैं.'
    },
    {
      title: 'Lifestyle सुधारना आसान हो जाता है',
      desc: 'Dosha समझ में आने से आपकी daily routine aur decision-making health-friendly बन जाती है.'
    },
    {
      title: 'Life-long health planning possible होती है',
      desc: 'ये सिर्फ आज की बीमारी की बात नहीं — dosha understanding आपको पूरी life का balance कर सकती है.'
    }
  ];

  // Handlers
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
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  // Motion variants
  const containerStagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } }
  };
  const itemFade = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 16 } }
  };
  const heroFade = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } };
  const cardPop = {
    hidden: { opacity: 0, scale: 0.96, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 180, damping: 18 } },
    exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.15 } }
  };
  const optionStagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };
  const optionItem = { hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } };

  // Progress spring
 const progressTarget = useMotionValue(0);
  const progressSmooth = useSpring(progressTarget, { stiffness: 120, damping: 20 });
  const progressWidth = useTransform(progressSmooth, v => `${v}%`);
  useEffect(() => {
    const pct = ((currentQuestion + 1) / questions.length) * 100;
    progressTarget.set(pct);
  }, [currentQuestion, questions.length, progressTarget]);

  // Theme
  const accent = '#c9a87a';

  const heroBg = 'url("https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=1200&h=400&fit=crop")';

  // Benefits Section Component
  const BenefitsSection = () => (
    <motion.div variants={containerStagger} initial="hidden" animate="visible">
      <motion.h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6" variants={itemFade}>
        Benefits of Knowing दोष
      </motion.h3>
      <motion.div className="space-y-6">
        {benefitsData.map((item, i) => (
          <motion.div key={i} className="flex gap-4 items-start" variants={itemFade}>
            <Star className="w-10 h-10 md:w-12 md:h-12 text-amber-500 flex-shrink-0 mt-1" fill="currentColor" />
            <div>
              <p className="font-semibold text-gray-900 mb-1 text-xl md:text-2xl">{item.title}</p>
              <p className="text-gray-600">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );

  // RESULT VIEW
  if (showResult && result) {
    return (
      <MotionConfig reducedMotion="user">
        <div
        className="min-h-screen text-[17px] md:text-[18px] leading-relaxed"
        style={{ backgroundColor: '#faeade', fontFamily: "'Arial', sans-serif" }}
      >
        {/* Hero with parallax for quiz page */}
        <motion.div
          ref={heroRef}
          className="relative bg-cover bg-center h-64 md:h-90"
          style={{
            backgroundImage: heroBg,
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0,0,0,0.6)'
          }}
          variants={heroFade}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 h-full flex flex-col items-center justify-center text-white"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">Dosha Test</h1>
            <p className="text-lg md:text-xl lg:text-2xl">Home / Dosha Test</p>
          </motion.div>
        </motion.div>

          {/* ==========  RESULT PAGE  ========== */}
<div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
  <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 items-start">
    {/*  LEFT  –  all textual content  */}
    <motion.div
      variants={containerStagger}
      initial="hidden"
      animate="visible"
      className="lg:col-span-2 space-y-6"
    >
      <motion.h2 className="text-4xl md:text-5xl font-bold text-gray-900" variants={itemFade}>
        आपका प्रमुख दोष: {result.info.name} ({result.info.english})
      </motion.h2>

      {/*  dosha bars  */}
      <motion.div className="bg-white rounded-xl p-6 shadow-md" variants={itemFade}>
        <p className="text-gray-800 mb-4">{result.info.description}</p>
        <div className="space-y-3">
          {['vata', 'pitta', 'kapha'].map((k) => {
            const total = questions.length;
            const val = result.scores[k] || 0;
            const width = (val / total) * 100;
            const label = k === 'vata' ? 'वात' : k === 'pitta' ? 'पित्त' : 'कफ';
            return (
              <div key={k}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">{label}</span>
                  <span>{val}/{total}</span>
                </div>
                <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                  <motion.div
                    className="h-3 rounded-full"
                    style={{ backgroundColor: accent }}
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/*  recommendations  */}
      <motion.div className="bg-white rounded-xl p-6 shadow-md" variants={itemFade}>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">जीवनशैली व भोजन सुझाव</h3>
        <ul className="space-y-3">
          {result.info.recommendations.map((rec, i) => (
            <motion.li
              key={i}
              className="flex gap-3 items-start"
              variants={itemFade}
            >
              <span className="text-2xl mt-1" style={{ color: accent }}>•</span>
              <span className="text-gray-700">{rec}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </motion.div>

    {/*  RIGHT  –  sticky card  */}
    <div className="lg:col-span-1 lg:sticky lg:top-4 h-fit">
      <motion.div
        className="bg-gradient-to-br from-[#e7c9a1] to-[#f5e6da] rounded-3xl shadow-2xl p-10 border-2"
        style={{ borderColor: accent }}
        variants={cardPop}
        initial="hidden"
        animate="visible"
        layout
      >
        <div className="text-center mb-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#7b5e57' }}>
            दोष परीक्षण
          </h2>
          <div className="w-32 h-1 mx-auto mb-6" style={{ backgroundColor: accent }} />
          <p className="text-gray-700 font-semibold">
            नीचे दिए गए परिणामों के साथ अपनी दिनचर्या सुधारें।
          </p>
        </div>

        <motion.button
          onClick={resetQuiz}
          className="w-full text-gray-900 py-3 rounded-lg font-semibold hover:opacity-90 transition-all text-lg"
          style={{ backgroundColor: accent }}
          whileTap={{ scale: 0.98 }}
          whileHover={{ y: -1 }}
        >
          फिर से परीक्षण करें
        </motion.button>
      </motion.div>
    </div>
  </div>
</div>
        </div>
      </MotionConfig>
    );
  }

  // QUIZ VIEW
  return (
    <MotionConfig reducedMotion="user">
      <div
        className="min-h-screen text-[17px] md:text-[18px] leading-relaxed"
        style={{ backgroundColor: '#faeade', fontFamily: "'Arial', sans-serif" }}
      >
        {/* Hero with parallax for quiz page */}
        <motion.div
          ref={heroRef}
          className="relative bg-cover bg-center h-64 md:h-90"
          style={{
            backgroundImage: heroBg,
            backgroundBlendMode: 'overlay',
            backgroundColor: 'rgba(0,0,0,0.6)'
          }}
          variants={heroFade}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative z-10 h-full flex flex-col items-center justify-center text-white"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">Dosha Test</h1>
            <p className="text-lg md:text-xl lg:text-2xl">Home / Dosha Test</p>
          </motion.div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left info */}
            <motion.div variants={containerStagger} initial="hidden" animate="visible" className="space-y-6">
              <motion.h2 className="text-3xl md:text-5xl font-bold text-gray-900" variants={itemFade}>
                वात, पित्त, कफ – इन तीनों में से कौन-सा दोष आपके शरीर में हावी है?
              </motion.h2>

              <motion.div className="bg-white rounded-lg p-6 shadow-md text-dark-black" variants={itemFade}>
                <p className="text-gray-800 mb-4">
                  <span className="font-bold">Dosha Test</span> आपके शरीर के इन त्रिदोषों का विश्लेषण करता है – आपकी आदतें, मानसिक
                  स्थिति, पाचन, ऊर्जा और त्वचा जैसी चीज़ों को ध्यान में रखते हुए.
                </p>
                <p className="text-gray-700">
                  आयुर्वेद के अनुसार, हर इंसान की body अलग nature रखती है – किसी में वात ज्यादा होता है, किसी में पित्त या कफ. जब ये दोष
                  संतुलन में होते हैं तो शरीर स्वस्थ रहता है, और जब इनमें से कोई भी असंतुलन में आता है – तब शुरू होती है बीमारी.
                </p>
              </motion.div>

              <BenefitsSection />

              <motion.div className="bg-white rounded-lg p-6 shadow-md" variants={itemFade}>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">अब अंदाज़ा नहीं, सटीक जानकारी लो – Dosha Test करो अभी</h3>
                <p className="text-gray-700 mb-3">
                  Ayurveda कहता है – इलाज से पहले शरीर को समझना ज़रूरी है. Baba Ji Ki Booti का Dosha Test आपको तुरंत clarity देता है – बिलकुल आसान
                  भाषा में, बिना किसी confusion के.
                </p>
                <p className="text-gray-700 font-semibold">Test करो, result जानो, और body को balance करने की सही राह चुनो.</p>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN – STICKY CARD */}
            <div className="lg:sticky lg:top-6 lg:self-start h-fit">
              <motion.div
                className="bg-gradient-to-br from-[#e7c9a1] to-[#f5e6da] rounded-3xl shadow-2xl p-6 md:p-8 border-2"

                style={{ borderColor: accent }}
                variants={cardPop}
                initial="hidden"
                animate="visible"
              >
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4" style={{ color: '#7b5e57' }}>
                  दोष परीक्षण
                </h2>
                <div className="w-32 h-1 mx-auto mb-6" style={{ backgroundColor: accent }} />

                {/* Progress */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-6 overflow-hidden">
                  <motion.div className="h-3 rounded-full" style={{ backgroundColor: accent, width: progressWidth }} />
                </div>

                <p className="text-center mb-6 text-gray-800 text-lg">
                  प्रश्न {currentQuestion + 1} / {questions.length}
                </p>

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div key={currentQuestion} variants={cardPop} initial="hidden" animate="visible" exit="exit">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-6 text-[#2c2c2c]">
                      {questions[currentQuestion].question}
                    </h3>
                    <motion.div variants={optionStagger} initial="hidden" animate="visible" className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={index}
                          onClick={() => handleAnswer(option.dosha)}
                          className="w-full text-left p-4 md:p-5 rounded-lg bg-white/70 hover:bg-white border border-[#e7d5c5] hover:border-[#d7c2ad] transition-all shadow-sm"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          variants={optionItem}
                        >
                          <span className="text-[#2c2c2c] text-base md:text-lg">{option.text}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </motion.div>
                </AnimatePresence>

                {currentQuestion > 0 && (
                  <motion.button
                    onClick={() => setCurrentQuestion((q) => Math.max(0, q - 1))}
                    className="text-[#7b5e57] hover:opacity-80 transition-colors text-base md:text-lg mt-6"
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