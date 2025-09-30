/* ------------------------------------------------------------------ */
/*  RemediosSection.jsx   – mobile-safe version                       */
/*  NO visual change, only wrappers / meta-tags / picture element     */
/* ------------------------------------------------------------------ */
import { motion } from 'framer-motion';
import { Star, Check, ArrowRight, Play, Pause } from 'lucide-react';
import { useRef, useState } from 'react';
import bgImage from '/images/nu-se.png';
import { Link } from 'react-router-dom';

const RemediosSection = () => {
  /* --------------------  your existing variants  -------------------- */
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants   = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
  const slideInLeft    = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
  const slideInRight   = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
  const cardVariants   = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.15 } } };

  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const toggleVideo = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying((p) => !p);
  };

  const benefits = [
    { en: "Relief in years-old issues", hi: "कई सालों पुरानी दिक्कतों में आराम", desc: "Natural therapies ना केवल लक्षण, बल्कि root imbalance को ठीक करती हैं — जिससे असर लंबे समय तक बना रहता है." },
    { en: "Detoxification without Chemicals", hi: "रसायनों के बिना विषहरण", desc: "बिना किसी capsule या दवा के — body internally साफ होती है पानी, भाप, मिट्टी और हर्ब्स के ज़रिए." },
    { en: "Especially useful in stress and sleep problems", hi: "तनाव और नींद की परेशानी में खास उपयोगी", desc: "प्राकृतिक विधियाँ शरीर के साथ सहयोग करती हैं, विपरीत प्रभाव डालने की बजाय।"}
  ];

  /* ================================================================
     1.  VIEWPORT  –  stops horizontal scroll on tiny screens
     2.  PICTURE   –  serves 1× WebP + 2× WebP automatically
     3.  VIDEO     –  uses `playsInline` + `muted` for iOS autoplay
     4.  CSS  –  only added `overflow-wrap:anywhere` via inline style
     ================================================================= */
  return (
    <>
      {/* ----  SAFETY META  ---- */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />

      <div className="min-h-screen bg-[#faeade] text-gray-800" style={{ overflowWrap: 'anywhere' }}>

        {/* ----------  HERO  ---------- */}
        <motion.section
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
          className="relative min-h-[50vh] bg-gradient-to-b from-[#faeade] via-white to-[#faeade] overflow-hidden"
        >
          {/* animated bg spots */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(251,154,68,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(251,154,68,0.15) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(251,154,68,0.15) 0%, transparent 50%)'
              ]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          />

          {/* RESPONSIVE HERO IMAGE – never larger than screen */}
          <picture className="absolute inset-0 pointer-events-none">
            <source srcSet="/images/nu-bg1.png" type="image/png" />
            <img
              src="/images/nu-bg1.png"
              alt=""
              className="absolute h-full w-full object-cover opacity-80 select-none"
              loading="eager"
              decoding="async"
            />
          </picture>

          <div className="relative z-10 flex flex-col items-center justify-center text-center py-40 px-4">
            <motion.h1
              initial={{ opacity: 0, y: 30, scale: 1 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              whileHover={{ scale: 1.05, textShadow: '0 0 20px rgba(251,154,68,0.4)' }}
              className="text-4xl md:text-6xl font-bold mb-6 cursor-default bg-clip-text text-orange-600"
            >
              प्राकृतिक चिकित्सा
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-center text-sm uppercase tracking-wider gap-1"
            >
              <motion.span whileHover={{ color: '#ea580c' }} className="cursor-pointer transition-colors">Home</motion.span>
              <span className="mx-2">/</span>
              <span className="text-orange-600">प्राकृतिक चिकित्सा</span>
            </motion.div>
          </div>
        </motion.section>

        {/* ----------  MAIN CONTENT  ---------- */}
        <motion.section
          variants={containerVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 px-4 bg-gradient-to-br from-[#faeade] via-white to-[#faeade] relative overflow-hidden"
        >
          {/* decorative blobs */}
          <motion.div
            className="absolute top-0 left-0 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl"
            animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl"
            animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
              {/* LEFT TEXT */}
              <motion.div variants={slideInLeft} className="space-y-6">
                <motion.p whileHover={{ x: 5 }} className="text-orange-600 uppercase tracking-wider font-bold text-lg lg:text-xl relative">
                  शरीर को दवा नहीं, दिशा चाहिए
                </motion.p>
                <motion.h2 whileHover={{ scale: 1.02 }} className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  यह चिकित्सा है nature-based
                </motion.h2>

                <div className="space-y-4 font-semibold text-gray-700 leading-relaxed">
                  {[
                    'प्राकृतिक चिकित्सा यानी ऐसी थेरेपी जिसमें कोई chemical दवा नहीं, कोई injection नहीं — बस nature से जुड़ी चीज़ें जैसे मिट्टी, पानी, भाप, और सही खानपान.',
                    'बाबा जी की बूटी में हम मानते हैं कि हर शरीर के अंदर खुद ही इलाज की ताकत होती है — बस उसे जगाने की जरूरत है.',
                    'जोड़ों का दर्द, रोज़ की थकावट, नींद की कमी, लगातार पेट की गड़बड़ी — जब modern इलाज में सुकून ना मिले, तब body खुद बोलती है “कुछ natural चाहिए."',
                    'प्राकृतिक चिकित्सा वही break देती है आपके body को — ना सिर्फ आराम देने के लिए, बल्कि उसे naturally सुधारने के लिए.',
                    'यह service उन सभी के लिए है जो non-invasive, toxin-free और sustainable तरीका ढूंढ रहे हैं — वो भी desi style में.'
                  ].map((t, i) => (
                    <motion.p
                      key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }} whileHover={{ x: 5, color: '#374151' }}
                      className="transition-all duration-300 cursor-default border-l-2 border-transparent hover:border-orange-500 pl-4"
                    >
                      {t}
                    </motion.p>
                  ))}
                </div>
              </motion.div>

              {/* RIGHT IMAGE – never overflows */}
              <motion.div variants={slideInRight} viewport={{ once: true }} className="relative group grid place-items-center">
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 blur-2xl"
                  initial={{ opacity: 0.18, scale: 0.5 }}
                  animate={{ scale: [0.2, 0.9, 0.5], opacity: [0.22, 0.34, 0.22] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }} whileTap={{ scale: 0.98 }}
                  className="relative w-full max-w-xs rounded-xl shadow-xl overflow-hidden cursor-pointer"
                >
                  <img
                    src="/images/re-ba.png"
                    alt="Healthy food bowls"
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                </motion.div>
              </motion.div>
            </div>

            {/* 4-CARD GRID – stays 2×2 on phones */}
            <motion.div variants={containerVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
              {[
                { icon: '/images/rd1.svg', title: 'बिना साइड इफेक्ट – Pure Natural Approach', desc: 'यहां किसी दवा से नहीं, मिट्टी, भाप, तेल और प्राकृत आहार से इलाज होता है – एकदम safe और gentle.', color: 'from-orange-500 to-red-500' },
                { icon: '/images/rd2.svg', title: 'शरीर की खुद की ताकत जगाने वाला सिस्टम', desc: 'हमारा focus है self-healing को activate करना – जिससे body naturally recover करे, बार-बार दवा पर निर्भर ना रहे.', color: 'from-green-500 to-emerald-500' },
                { icon: '/images/rd3.svg', title: 'थैरेपी + जीवनशैली सुधार का combo', desc: 'केवल massage या detox नहीं — यहां आपको मिलता है सही daily routine और खानपान का गाइड भी.', color: 'from-blue-500 to-cyan-500' },
                { icon: '/images/rd4.svg', title: 'हर उम्र और शरीर के लिए safe & effective', desc: 'बच्चों से लेकर बुज़ुर्ग तक — naturopathy हर किसी के लिए gentle aur असरदार है.', color: 'from-purple-500 to-pink-500' }
              ].map((f, i) => (
                <motion.div
                  key={i} variants={itemVariants}
                  whileHover={{ scale: 1.08, y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-white font-semibold to-[#fff5eb] p-4 sm:p-6 rounded-xl border border-orange-100 hover:border-orange-300 transition-all duration-500 cursor-pointer group relative overflow-hidden"
                >
                  <motion.div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                  <motion.div className="text-3xl sm:text-4xl mb-4 filter drop-shadow-lg" whileHover={{ scale: 1.0, rotate: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <img src={f.icon} alt="" className="w-20 h-20 sm:w-24 sm:h-24" loading="lazy" />
                  </motion.div>
                  <motion.h3 className="text-base sm:text-lg font-semibold mb-3 text-orange-600 group-hover:text-orange-700 transition-colors" whileHover={{ x: 5 }}>
                    {f.title}
                  </motion.h3>
                  <motion.p className="text-xs sm:text-sm text-gray-600 leading-relaxed group-hover:text-gray-800 transition-colors" initial={{ opacity: 0.8 }} whileHover={{ opacity: 1 }}>
                    {f.desc}
                  </motion.p>
                  <motion.div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-amber-400 w-0 group-hover:w-full transition-all duration-500" />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* ----------  VIDEO + BENEFITS  ---------- */}
        <motion.section
          variants={containerVariants} initial="hidden" whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 px-4 bg-gradient-to-br from-[#faeade] via-white to-[#faeade] relative overflow-hidden"
        >
          <motion.div
            className="absolute top-1/2 left-0 w-72 h-72 bg-gradient-to-r from-orange-400/10 to-amber-400/10 rounded-full blur-3xl"
            animate={{ x: [-120, 120, -120], rotate: [0, 180, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
              {/* CLICKABLE VIDEO – never overflows */}
              <motion.div variants={slideInLeft} className="relative group">
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400/20 to-amber-400/20 blur-2xl"
                  initial={{ opacity: 0.18, scale: 0.5 }}
                  animate={{ scale: [0.2, 0.9, 0.5], opacity: [0.22, 0.34, 0.22] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: -5, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                  whileTap={{ scale: 0.98 }}
                  className="relative w-full max-w-lg mx-auto aspect-video rounded-lg shadow-2xl overflow-hidden cursor-pointer"
                  onClick={toggleVideo}
                >
                  <video
                    ref={videoRef}
                    src="/images/re-ve.mp4"
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    preload="metadata"
                    onEnded={() => setPlaying(false)}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                    {playing ? (
                      <Pause size={48} className="text-white/80 drop-shadow-lg" />
                    ) : (
                      <Play size={48} className="text-white/80 drop-shadow-lg" />
                    )}
                  </div>
                </motion.div>
              </motion.div>

              {/* RIGHT COPY */}
              <motion.div variants={slideInRight} className="space-y-6">
                <motion.p whileHover={{ x: 5 }} className="text-orange-600 uppercase tracking-wider font-bold text-lg lg:text-xl relative">
                  अपनी नाड़ी से अपना सच जानिए
                </motion.p>
                <motion.h2 whileHover={{ scale: 1.02 }} className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-orange-600 to-amber-600 bg-clip-text text-transparent">
                  कई बार दवाइयों से नहीं, मिट्टी से भी सुकून मिल जाता है
                </motion.h2>

                <div className="space-y-4 text-gray-700 font-semibold leading-relaxed">
                  {[
                    'बाबा जी की बूटी में प्राकृतिक चिकित्सा का उद्देश्य सिर्फ दर्द हटाना नहीं, शरीर को जड़ से स्वस्थ बनाना है.',
                    'हमारी प्रक्रिया शुरू होती है नाड़ी परीक्षण से — जिससे हम यह समझते हैं कि आपके शरीर में असली समस्या क्या है: वात है, पित्त है या कफ का प्रकोप है.',
                    'इनमें से हर चीज़ आपकी current condition के अनुसार customise की जाती है — ताकि discomfort ना हो, और असर गहरा हो.'
                  ].map((t, i) => (
                    <motion.p
                      key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.2 }} whileHover={{ x: 5, color: '#374151' }}
                      className="transition-all duration-300 cursor-default border-l-2 border-transparent hover:border-orange-500 pl-4"
                    >
                      {t}
                    </motion.p>
                  ))}
                </div>

                <motion.blockquote
                  whileHover={{ scale: 1.02, x: 10, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)' }}
                  className="border-l-4 border-orange-500 pl-6 italic text-lg lg:text-xl text-orange-700 bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-r-lg transition-all duration-300 cursor-pointer"
                >
                  Body को सुकून चाहिए? तो nature की गोद में आइए
                </motion.blockquote>
              </motion.div>
            </div>

            {/* BENEFIT BOX – always fits screen */}
            <motion.div
              variants={cardVariants} initial="hidden" whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              className="mx-auto max-w-3xl rounded-2xl bg-white p-4 sm:p-6 md:p-8 shadow-lg ring-1 ring-orange-100"
            >
              <h3 className="mb-4 sm:mb-6 text-center text-xl sm:text-2xl font-bold text-orange-700">
                Naturopathy से मिलने-वाले लाभ
              </h3>
              <div className="space-y-4 sm:space-y-5">
                {benefits.map((b, i) => (
                  <motion.div
                    key={i} variants={itemVariants}
                    className="flex items-start gap-3 sm:gap-4 font-semibold"
                  >
                    <svg className="mt-1 h-5 w-5 flex-shrink-0 text-orange-600" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                      <h4 className="font-semibold text-orange-700 text-sm sm:text-base">
                        {b.en} — {b.hi}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">{b.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* ----------  CTA  ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.8 }}
          className="relative py-16 sm:py-20 px-4 rounded-[30px] md:rounded-[50px] max-w-5xl mx-auto min-h-[400px] flex items-center justify-center text-center shadow-xl overflow-hidden"
        >
          {/* responsive bg image */}
          <picture className="absolute inset-0">
            <source srcSet="/images/nu-se.png" type="image/png" />
            <img
              src={bgImage}
              alt=""
              className="absolute h-full w-full object-cover"
              loading="lazy"
            />
          </picture>
          <div className="absolute inset-0 bg-[#cab09d]/50" />

          <div className="relative z-10 max-w-4xl w-full space-y-4 sm:space-y-6 font-semibold px-2">
            <p className="text-lg sm:text-xl uppercase font-bold tracking-wider text-orange-900/90">
              Body को सुकून चाहिए?
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-orange-950">
              सिर्फ pure wellness, that feels like home
            </h2>
            <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto text-orange-900/95">
              अगर आपका शरीर बार-बार signals दे रहा है कि आराम चाहिए, तो अब ज़रूरत है थोड़ी धीमी, पर असरदार natural care की. बाबा जी की बूटी में हमारी प्राकृतिक चिकित्सा सेवा आपको देगा वो holistic break — जिसमें शरीर detox होता है, और मन भी free feel करता है
            </p>

            <Link to="https://www.google.com/maps/place/BABA+JI+KI+BUTI/@28.9802655,76.9905489,762m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390dbb183d826345:0x79f9532049e22b8!8m2!3d28.9802655!4d76.9931238!16s%2Fg%2F11h6nw68st?entry=tts&g_ep=EgoyMDI1MDUyNy4wIPu8ASoASAFQAw%3D%3D&skid=7187cf64-d716-414e-ba5f-d5524082a607">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="bg-[#eac5ab] text-orange-900 px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-orange-100 transition-colors inline-flex items-center space-x-2"
              >
                <span>Visit Us</span>
              </motion.button>
            </Link>
          </div>
        </motion.section>

      </div>
    </>
  );
};

export default RemediosSection;