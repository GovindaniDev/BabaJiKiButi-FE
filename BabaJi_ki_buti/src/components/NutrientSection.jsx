import { motion } from 'framer-motion';
import { Check, Play, Pause } from 'lucide-react';
import { useRef, useState } from 'react';
import bgImage from '/images/nu-se.png';
import { Link } from 'react-router-dom';

const NutrientSection = () => {
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants   = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } } };
  const slideInLeft    = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };
  const slideInRight   = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } } };

  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const toggleVideo = () => {
    if (!videoRef.current) return;
    playing ? videoRef.current.pause() : videoRef.current.play();
    setPlaying((p) => !p);
  };

  /* ----------  data  ---------- */
  const features = [
    { icon: '/images/dish.svg', title: 'Taste Made Diet Plan', desc: 'हर शरीर की ज़रूरत अलग होती है — इसी लिए यहाँ मिलती है आपकी प्रकृति (वात, पित्त, कफ) के अनुसार डायट।', color: 'from-orange-500 to-red-500' },
    { icon: '/images/leaf.svg', title: 'Herbal Mixes for Natural Boosting', desc: 'Herbal churn, kwath और drink mixes – जो digestion, fat burning और energy को naturally enhance करें।', color: 'from-green-500 to-emerald-500' },
    { icon: '/images/weight.svg', title: 'Weight Loss without Weakness', desc: 'यहां weight तो कम होगा, लेकिन energy भी बनी रहेगी — क्योंकि focus सिर्फ fat कम करने का नहीं, muscle aur strength बढ़ाने का भी है।', color: 'from-blue-500 to-cyan-500' },
    { icon: '/images/note.svg', title: 'Easy to Follow Diet', desc: 'कोई complicated foreign diet नहीं – desi, seasonal aur ghar का simple खाना, जो चले हर दिन आराम से।', color: 'from-purple-500 to-pink-500' },
  ];

  /* ----------  mobile-slider helper  ---------- */
  const MobileSlider = ({ list, reverse = false }) => {
    const doubled = [...list, ...list];
    return (
      <div className="md:hidden overflow-hidden">
        <motion.div
          className="flex gap-4 w-max"
          animate={{ x: reverse ? '50%' : '-50%' }}
          transition={{ x: { duration: list.length * 2.2, ease: 'linear', repeat: Infinity, repeatType: 'loop' } }}
        >
          {doubled.map((item, i) => (
            <div key={i} className="flex-shrink-0 w-72 bg-white/60 rounded-xl p-4 shadow flex items-start space-x-4">
              <img src={item.icon} alt="" className="w-20 h-20 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-bold text-orange-600 mb-1">{item.title}</h3>
                <p className="text-sm text-black/90 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    );
  };

  /* ----------  UI  ---------- */
  return (
    <div className="min-h-screen bg-[#faeade] text-gray-800">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative min-h-[50vh] bg-gradient-to-b from-[#faeade] via-white to-[#faeade] overflow-hidden"
      >
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(251,154,68,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(251,154,68,0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(251,154,68,0.15) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-0 pointer-events-none">
          <img src="/images/nu-bg1.png" alt="" className="absolute h-full w-full opacity-80 select-none" />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center py-40 px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05, textShadow: '0 0 20px rgba(251,154,68,0.4)' }}
            className="text-4xl md:text-6xl font-bold mb-6 cursor-default bg-clip-text text-orange-600"
          >
            न्यूट्रीईट
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center text-sm uppercase tracking-wider gap-1"
          >
            <motion.span whileHover={{ color: '#ea580c' }} className="cursor-pointer transition-colors">Home</motion.span>
            <span className="mx-2">/</span>
            <span className="text-orange-600">न्यूट्रीईट</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Intro + image */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 px-4 bg-gradient-to-br from-[#faeade] via-white to-[#faeade] relative overflow-hidden"
      >
        <motion.div className="absolute top-0 left-0 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} />
        <motion.div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl" animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
            <motion.div variants={slideInLeft} className="space-y-6">
              <motion.p whileHover={{ x: 5 }} className="text-orange-600 uppercase tracking-wider font-bold text-xl relative">Fat से Fit जाने का रास्ता</motion.p>
              <motion.h2 whileHover={{ scale: 1.02 }} className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                बिना chemical diet, बिना starvation
              </motion.h2>
              <div className="space-y-4 font-semibold text-gray-700 leading-relaxed">
                {[
                  'ज़्यादातर लोग सोचते हैं कि weight loss या fitness सिर्फ exercise से possible है. लेकिन असली फर्क तभी आता है जब खाना body type के हिसाब से खाया जाए.',
                  'NutreeEat इसी सोच से बना है — एक Ayurvedic + Natural food solution, जिसमें हर व्यक्ति के लिए एकदम unique meal, herbal mix और timing बनाई जाती है. यहां आपको मिलता है वो plan जो ना सिर्फ body को हल्का बनाता है, बल्कि digestion, immunity और mood को भी uplift करता है.',
                  'Baba Ji Ki Booṭī में हम खाना बंद नहीं कराते – हम सही खाना, सही समय पर, सही body के लिए recommend करते हैं. यहां सिर्फ diet chart नहीं, एक real, sustainable, aur desi lifestyle plan मिलता है.',
                ].map((text, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ x: 5, color: '#374151' }}
                    className="transition-all duration-300 cursor-default border-l-2 border-transparent hover:border-orange-500 pl-4"
                  >
                    {text}
                  </motion.p>
                ))}
              </div>
            </motion.div>

            <motion.div variants={slideInRight} className="relative group grid place-items-center">
              <motion.div
                className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 blur-2xl"
                initial={{ opacity: 0.18, scale: 0.5 }}
                animate={{ scale: [0.2, 0.9, 0.5], opacity: [0.22, 0.34, 0.22] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <motion.div whileHover={{ scale: 1.05, rotateY: 5 }} whileTap={{ scale: 0.98 }} className="relative w-80 rounded-xl shadow-xl overflow-hidden cursor-pointer">
                <img src="/images/nu1.png" alt="Healthy food bowls" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </motion.div>
            </motion.div>
          </div>

          {/* 4-feature grid → mobile slider */}
          <div className="hidden md:grid md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                whileHover={{ scale: 1.08, y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-white font-semibold to-[#fff5eb] p-6 rounded-xl border border-orange-100 hover:border-orange-300 transition-all duration-500 cursor-pointer group relative overflow-hidden"
              >
                <motion.div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                <motion.div className="text-4xl mb-4 filter drop-shadow-lg" whileHover={{ scale: 1.0, rotate: 0 }} transition={{ type: 'spring', stiffness: 300 }}>
                  <img src={f.icon} alt="" className="w-30" />
                </motion.div>
                <motion.h3 className="text-lg font-semibold mb-3 text-orange-600 group-hover:text-orange-700 transition-colors" whileHover={{ x: 5 }}>
                  {f.title}
                </motion.h3>
                <motion.p className="text-gray-600 text-sm leading-relaxed group-hover:text-gray-800 transition-colors" initial={{ opacity: 0.8 }} whileHover={{ opacity: 1 }}>
                  {f.desc}
                </motion.p>
                <motion.div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-orange-400 to-amber-400 w-0 group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>
          <MobileSlider list={features} />
        </div>
      </motion.section>

      {/* Video + text */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 px-4 bg-gradient-to-br from-[#faeade] via-white to-[#faeade] relative overflow-hidden"
      >
        <motion.div className="absolute top-1/2 left-0 w-72 h-72 bg-gradient-to-r from-orange-400/10 to-amber-400/10 rounded-full blur-3xl" animate={{ x: [-120, 120, -120], rotate: [0, 180, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div variants={slideInLeft} className="relative group">
              <motion.div className="absolute -inset-4 bg-gradient-to-r from-orange-400/20 to-amber-400/20 rounded-lg opacity-30 blur-2xl" animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }} transition={{ duration: 4, repeat: Infinity }} />
              <motion.div whileHover={{ scale: 1.05, rotateY: -5, boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }} whileTap={{ scale: 0.98 }} className="relative aspect-video rounded-lg shadow-2xl overflow-hidden cursor-pointer" onClick={toggleVideo}>
                <video ref={videoRef} src="/videos/nu-ve.mp4" poster="/images/nu1.png" className="w-full h-full object-cover" playsInline preload="metadata" onEnded={() => setPlaying(false)} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
                  {playing ? <Pause size={48} className="text-white/80 drop-shadow-lg" /> : <Play size={48} className="text-white/80 drop-shadow-lg" />}
                </div>
              </motion.div>
            </motion.div>

            <motion.div variants={slideInRight} className="space-y-6">
              <motion.p whileHover={{ x: 5 }} className="text-orange-600 uppercase tracking-wider font-bold text-xl relative">अपनी नाड़ी से अपना सच जानिए</motion.p>
              <motion.h2 whileHover={{ scale: 1.02 }} className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-800 via-orange-600 to-amber-600 bg-clip-text text-transparent">NutreeEat body को अंदर से reset करता है</motion.h2>
              <div className="space-y-4 text-gray-700 font-semibold leading-relaxed">
                {[
                  'NutreeEat service बाबा जी की बूटी के अंदर nutrition based आयुर्वेदिक healing का सबसे मजबूत हिस्सा है. यहां ना कोई protein powder, ना foreign pills – सिर्फ body balancing के लिए real खाना दिया जाता है.',
                  'यहां खाना आपकी body type, आयुर्वेदिक दोष (वात, पित्त, कफ), और current health condition के हिसाब से चुना जाता है.',
                  'Expert वैद्य और आहार विशेषज्ञ मिलकर तय करते हैं — क्या खाएं, कितना खाएं, कब खाएं, और कौन से herbs आपके system को naturally support करेंगे.',
                ].map((t, i) => (
                  <motion.p key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.2 }} whileHover={{ x: 5, color: '#374151' }} className="transition-all duration-300 cursor-default border-l-2 border-transparent hover:border-orange-500 pl-4">
                    {t}
                  </motion.p>
                ))}
              </div>
              <motion.blockquote
                whileHover={{ scale: 1.02, x: 10, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.15)' }}
                className="border-l-4 border-orange-500 pl-6 italic text-xl text-orange-700 bg-gradient-to-r from-orange-500/10 to-transparent p-4 rounded-r-lg transition-all duration-300 cursor-pointer"
              >
                “जब खाना therapy बन जाए, तब healing आसान हो जाती है!”
              </motion.blockquote>
            </motion.div>
          </div>

          {/* benefits list */}
          <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="text-orange-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-orange-700">शरीर की गहराई से सफाई – toxins बाहर, ऊर्जा अंदर Purification सिर्फ बाहरी नहीं — liver, blood, skin और gut तक असर दिखता है.</h4>
                </div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="space-y-4">
              <div className="flex items-start space-x-3">
                <Check className="text-orange-600 mt-1 flex-shrink-0" size={20} />
                <div>
                  <h4 className="font-semibold text-orange-700">Chronic Problems में Long-Term आराम PCOS, acidity, weight gain, skin allergies, joint pain – पंचकर्म ने हजारों को राहत दी है.</h4>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative py-20 px-4 rounded-[30px] md:rounded-[50px] max-w-5xl mx-auto min-h-[400px] flex items-center justify-center text-center shadow-xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${bgImage})` }} />
        <div className="absolute inset-0 bg-[#cab09d]/50" />
        <div className="relative z-10 max-w-4xl w-full space-y-6 font-semibold px-2">
          <p className="text-lg md:text-xl uppercase font-bold tracking-wider text-orange-900/90">Body reset कराना है</p>
          <h2 className="text-2xl md:text-5xl font-bold text-orange-950">अब वक्त है शरीर को एक gift देने का</h2>
          <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-orange-900/95">
            हर रोज़ हम अपने शरीर में ज़हर भरते हैं – stress, food, chemicals और thoughts के ज़रिए. बाबा जी की बूटी में आपकी प्रक्रिया होती है प्राकृतिक तरीकों से, experienced experts के साथ, और पूरी देखरेख में.
          </p>
          <Link to="https://www.google.com/maps/place/BABA+JI+KI+BUTI/@28.9802655,76.9905489,762m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390dbb183d826345:0x79f9532049e22b8!8m2!3d28.9802655!4d76.9931238!16s%2Fg%2F11h6nw68st?entry=tts&g_ep=EgoyMDI1MDUyNy4wIPu8ASoASAFQAw%3D%3D&skid=7187cf64-d716-414e-ba5f-d5524082a607">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-[#eac5ab] text-orange-900 px-6 md:px-8 py-3 rounded-full font-semibold hover:bg-orange-100 transition-colors inline-flex items-center space-x-2">
              <span>Visit Us</span>
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default NutrientSection;