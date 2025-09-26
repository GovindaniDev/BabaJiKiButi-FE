import { motion } from 'framer-motion';
import { useState } from 'react';

import bgImage from '/images/nu-se.png';
import { Link } from 'react-router-dom';

/* ----------  mobile-slider component  ---------- */
function MobileSlider({ list, reverse = false }) {
  const doubled = [...list, ...list];          // seamless loop

  return (
    <div className="md:hidden w-full overflow-hidden">
      <motion.div
        className="flex gap-6 w-max"           /* ← as wide as children  */
        animate={{ x: reverse ? '50%' : '-50%' }}
        transition={{
          x: {
            duration: list.length * 1.8,       /* speed  */
            ease: 'linear',
            repeat: Infinity,
            repeatType: 'loop',
          },
        }}
      >
        {doubled.map((cat, i) => (
          <div
            key={`${cat.name}-${i}`}
            className="flex-shrink-0 flex flex-col items-center cursor-pointer group w-28"
          >
            <img
              src={cat.icon}
              alt={cat.name}
              className="w-20 h-20 rounded-full object-cover mb-2"
            />
            <h3 className="text-xs font-semibold text-gray-800 group-hover:text-orange-600 transition">
              {cat.name}
            </h3>
          </div>
        ))}
      </motion.div>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  LeftServicesSlider  –  infinite horizontal row  (mobile only)     */
/* ------------------------------------------------------------------ */
function LeftServicesSlider({ list }) {
  const doubled = [...list, ...list];          // seamless loop
  return (
    <div className="md:hidden w-full overflow-hidden">
      <motion.div
        className="flex gap-6 w-max"
        animate={{ x: '-50%' }}
        transition={{
          x: { duration: list.length * 2, ease: 'linear', repeat: Infinity, repeatType: 'loop' },
        }}
      >
        {doubled.map((s, i) => (
          <div
            key={`${s.title}-${i}`}
            className="flex-shrink-0 w-72 bg-white/60 rounded-xl p-4 shadow flex items-start space-x-4"
          >
            <img
              src={s.icon}
              alt=""
              className="w-20 h-20 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-base font-bold text-orange-600 mb-1">{s.title}</h3>
              <p className="text-sm text-black/90 leading-relaxed">{s.description}</p>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}



const TherapySection = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const PcontainerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const PitemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

  const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' } }
  };

 const services = [
    { icon: '/images/th-img1.png', title: 'Tailor-Made Ayurvedic Therapy', description: 'Benefit from two specialised therapy sessions per day, designed for your unique health condition.' },
    { icon: '/images/th-img2.png', title: 'Personalised Medications', description: 'Receive Ayurvedic medicines that target and address all your relevant health issues.' },
    { icon: '/images/th-img3.png', title: 'Supplements and Vitamins', description: 'If necessary, incorporate supplements & vitamins into your regimen to support overall well-being.' },
    { icon: '/images/th-img4.png', title: '24/7 Professional and Compassionate Care', description: 'Receive constant, high-quality care in a warm and supportive environment.' },
    { icon: '/images/th-img5.png', title: 'Physiotherapy and Exercise', description: 'Engage in a Personalised physiotherapy and exercise session tailored to your current recovery status.' },
    { icon: '/images/th-img6.png', title: 'Personalised Yoga', description: 'Explore the potential benefits of personalised yoga sessions to aid in your recovery.' },
    { icon: '/images/th-img7.png', title: 'Tailor-Made Diet', description: 'Embrace a diet plan, meticulously crafted, to align with your unique health parameters and needs.' },
  ];

  const healthCategories = [
    { name: 'Diabetes', icon: '/images/th-pr1.png' },
    { name: 'Fitness', icon: '/images/th-pr2.png' },
    { name: 'Liver Care', icon: '/images/th-pr3.png' },
    { name: 'Immunity & Wellness', icon: '/images/th-pr4.png' },
    { name: 'Pain Management', icon: '/images/th-pr5.png' },
  ];

  const h2Categories = [
    { name: "Women's Health", icon: '/images/th-pr6.png' },
    { name: 'Digestive Health', icon: '/images/th-pr7.png' },
    { name: "Men's Health", icon: '/images/th-pr8.png' },
    { name: 'Piles Care', icon: '/images/th-pr9.png' },
  ];


  return (
    <div className="min-h-screen bg-[#faeade] text-gray-800">
      {/* Hero Section */}
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
              'radial-gradient(circle at 20% 50%, rgba(251,154,68,0.15) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
        />

        <div className="relative z-10 flex flex-col items-center justify-center text-center py-32">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
            className="text-4xl md:text-6xl font-bold mb-6 cursor-default text-orange-600"
          >
            Tailor-Made Ayurvedic Therapy
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center text-sm uppercase tracking-wider gap-1"
          >
            <motion.span whileHover={{ color: '#ea580c' }} className="cursor-pointer transition-colors">Home</motion.span>
            <span className="mx-2">/</span>
            <span className="text-orange-600">Tailor-Made Ayurvedic Therapy</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 px-6 bg-gradient-to-br from-[#faeade] via-white to-[#faeade] relative overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-0 w-32 h-32 bg-orange-400/20 rounded-full blur-3xl"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

       <div className="max-w-7xl mx-auto relative z-10">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 items-center mb-16 px-4 md:px-0">
    {/* LEFT – text */}
    <motion.div variants={slideInLeft} className="space-y-4 md:space-y-6">
      <motion.p
        className="text-orange-600 uppercase tracking-wider font-bold text-sm"
        whileHover={{ x: 5 }}
      >
        शरीर को दवा नहीं, दिशा चाहिए
      </motion.p>

      <motion.h2
        className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800"
        whileHover={{ scale: 1.02 }}
      >
        यहाँ आपकी मिलता है विस्तृत
        <br />
        <span className="text-orange-600">specific Ayurvedic treatment</span>
      </motion.h2>

      <div className="space-y-3 md:space-y-4 text-gray-700 leading-relaxed">
        {[
          'Baba Ji Ki Buṭī की Tailor-Made Ayurvedic Therapy कोई generic plan नहीं है – ये आपके शरीर, आपकी बीमारी और आपकी स्थिति को ध्यान में रखते हुए design किया गया one-on-one इलाज है.',
          'यहां modern recovery principles और शुद्ध आयुर्वेद एक साथ मिलते हैं – ताकि ना सिर्फ बीमारी दूर हो, बल्कि body दोबारा balance में आ जाए.',
          'हर इंसान की health journey अलग होती है. किसी को surgery के बाद recovery चाहिए, किसी को पुराना joint pain है, तो किसी को energy restore करनी है.',
          'इसीलिए हमने तैयार की है एक ऐसी सेवा, जिसमें आप पाएंगे daily दो specialised therapies, custom medicines, yoga, physiotherapy, diet aur पूरी care – वो भी आपकी exact health condition के हिसाब से.'
        ].map((text, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ x: 5 }}
            className="transition-all duration-300 cursor-default border-l-2 border-transparent hover:border-orange-500 pl-4 text-sm md:text-base"
          >
            {text}
          </motion.p>
        ))}
      </div>
    </motion.div>

    {/* RIGHT – image */}
    <motion.div
      variants={slideInRight}
      className="relative group grid place-items-center mt-6 md:mt-0"
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-amber-400 blur-2xl"
        initial={{ opacity: 0.18, scale: 0.5 }}
        animate={{ scale: [0.2, 0.9, 0.5], opacity: [0.22, 0.34, 0.22] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.div
        whileHover={{ scale: 1.05, rotateY: 0 }}
        whileTap={{ scale: 0.98 }}
        className="relative w-full max-w-xs md:max-w-none md:w-96 rounded-xl shadow-xl overflow-hidden cursor-pointer"
      >
        <img
          src="/images/th-bg.png"
          alt="Therapy"
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
      </motion.div>
    </motion.div>
  </div>
</div>
      </motion.section>

      {/* Services Section */}
       <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 px-6 bg-gradient-to-br from-white via-[#faeade] to-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              यहाँ <span className="text-orange-600">Ayurvedic principles</span> के साथ जुड़ता है <span className="text-orange-600">personalised routine</span>
            </h2>
            <p className="text-gray-600 max-w-3xl font-semibold mx-auto">
              Tailor-Made Ayurvedic Therapy में सिर्फ बीमारी नहीं देखी जाती, बल्कि body की पूरी picture समझी जाती है – आपकी उम्र, पहले की medical history, lifestyle, diet और emotional state.
            </p>
          </motion.div>

          {/* -------  left / right services  ------- */}
     <div className="flex items-center justify-center max-w-7xl mx-auto">
  {/* desktop – original two-column layout */}
  <div className="hidden md:flex w-full">
    {/* LEFT 4 */}
    <motion.div variants={containerVariants} className="flex-1 space-y-8 pr-8">
      {services.slice(0, 4).map((s, i) => (
        <motion.div
          key={i}
          variants={itemVariants}
          whileHover={{ scale: 1.02, x: 5 }}
          className="flex items-start space-x-6 p-6 rounded-lg hover:bg-gray-800/30 transition-all duration-300"
        >
          <motion.div whileHover={{ scale: 1.1, rotate: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
            <img src={s.icon} alt="" className="w-28 h-28 rounded-full object-cover" />
          </motion.div>
          <div className="flex-1">
            <motion.h3 whileHover={{ x: 5 }} className="text-xl font-bold text-orange-600 mb-3">{s.title}</motion.h3>
            <motion.p whileHover={{ opacity: 1 }} initial={{ opacity: 0.8 }} className="text-black font-semibold leading-relaxed">{s.description}</motion.p>
          </div>
        </motion.div>
      ))}
    </motion.div>

    {/* centre line */}
    <motion.div
      className="w-px h-96 bg-gradient-to-b from-transparent via-[#d4af87] to-transparent flex-shrink-0"
      initial={{ scaleY: 0 }}
      whileInView={{ scaleY: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, delay: 0.5 }}
    />

    {/* RIGHT 3 */}
    <motion.div variants={containerVariants} className="flex-1 space-y-8 pl-8">
      {services.slice(4).map((s, i) => (
        <motion.div
          key={i + 4}
          variants={itemVariants}
          whileHover={{ scale: 1.02, x: -5 }}
          className="flex items-start space-x-6 p-6 rounded-lg hover:bg-gray-800/30 transition-all duration-300"
        >
          <motion.div whileHover={{ scale: 1.1, rotate: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
            <img src={s.icon} alt="" className="w-28 h-28 rounded-full object-cover" />
          </motion.div>
          <div className="flex-1">
            <motion.h3 whileHover={{ x: -5 }} className="text-xl font-bold text-orange-600 mb-3">{s.title}</motion.h3>
            <motion.p whileHover={{ opacity: 1 }} initial={{ opacity: 0.8 }} className="text-black font-semibold leading-relaxed">{s.description}</motion.p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>

  {/* mobile – one infinite horizontal slider showing 2 items at a time */}
  <div className="md:hidden w-full overflow-hidden">
    <motion.div
      className="flex gap-4 w-300"
      animate={{ x: '-50%' }}
      transition={{
        x: { duration: 10, ease: 'linear', repeat: Infinity, repeatType: 'loop' },
      }}
    >
      {/* duplicate once → seamless scroll */}
      {[...services, ...services].map((s, i) => (
        <div
          key={`${s.title}-${i}`}
          className="flex-shrink-0 w-44 bg-white/60 rounded-xl p-3 shadow flex flex-col items-center"
        >
          <img src={s.icon} alt="" className="w-16 h-16 rounded-full object-cover mb-2" />
          <h3 className="text-sm font-bold text-orange-600 text-center mb-1">{s.title}</h3>
          <p className="text-xs text-black/90 text-center leading-relaxed">{s.description}</p>
        </div>
      ))}
    </motion.div>
  </div>
</div>
        </div>
      </motion.section>

      {/* ------------------------------------------------------------------ */}
      {/*  PREVENTIVE MEDICINE  –  desktop grid  +  mobile infinite sliders   */}
      {/* ------------------------------------------------------------------ */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="py-16 px-6 bg-gradient-to-br from-[#faeade] via-white to-[#faeade]"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={itemVariants} className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-orange-500 mb-4">Preventive Medicine</h2>
            <p className="text-black font-semibold max-w-2xl mx-auto">
              Ayurveda is a treasure of knowledge when it comes to helping a person remain healthy over the lifespan.
            </p>
          </motion.div>

          {/*  desktop grid  |  mobile sliders  */}
          <motion.div
            variants={PcontainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="flex justify-center w-full mb-16"
          >
            {/* desktop – centred grid */}
            <div className="hidden md:flex md:flex-col md:gap-10">
              {/* row 1 */}
              <div className="grid md:grid-cols-5 gap-6 items-center">
                {healthCategories.map((cat, i) => (
                  <motion.div
                    key={i}
                    variants={PitemVariants}
                    whileHover={{ scale: 1.08, y: -4 }}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="w-32 h-32 rounded-full flex items-center justify-center mb-2">
                      <img src={cat.icon} alt="" className="w-32 h-32 rounded-full object-cover" />
                    </div>
                    <h3 className="text-sm font-semibold text-center text-gray-800 group-hover:text-orange-600 transition">
                      {cat.name}
                    </h3>
                  </motion.div>
                ))}
              </div>
              {/* row 2 */}
              <div className="grid md:grid-cols-4 gap-6 items-center justify-center">
                {h2Categories.map((cat, i) => (
                  <motion.div
                    key={i}
                    variants={PitemVariants}
                    whileHover={{ scale: 1.08, y: -4 }}
                    className="flex flex-col items-center cursor-pointer group"
                  >
                    <div className="w-32 h-32 rounded-full flex items-center justify-center mb-2">
                      <img src={cat.icon} alt="" className="w-32 h-32 rounded-full object-cover" />
                    </div>
                    <h3 className="text-sm font-semibold text-center text-gray-800 group-hover:text-orange-600 transition">
                      {cat.name}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* mobile – infinite sliders */}
            <div className="md:hidden w-full flex flex-col gap-10">
              <MobileSlider list={[...healthCategories, ...h2Categories]} />
            </div>
          </motion.div>

          {/* CTA banner – unchanged */}
          <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative py-20 px-6 rounded-[30px] md:rounded-[50px] max-w-5xl mx-auto min-h-[400px] flex items-center justify-center text-center shadow-xl overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${bgImage})` }}
            />
            <div className="absolute inset-0 bg-[#cab09d]/50" />
            <div className="relative z-10 max-w-2xl w-full space-y-6 font-semibold">
              <h2 className="text-3xl md:text-5xl font-bold text-orange-950">Life-long health कैसे maintain हो</h2>
              <p className="text-lg leading-relaxed max-w-2xl mx-auto text-orange-900/95">
                अगर आप एक ऐसा healing plan ढूंढ रहे हैं जो आपकी exact ज़रूरत के हिसाब से हो – तो Baba Ji Ki Booṭī की Tailor-Made Therapy आपके लिए है.
              </p>
              <Link to="https://www.google.com/maps/place/BABA+JI+KI+BUTI/@28.9802655,76.9905489,762m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390dbb183d826345:0x79f9532049e22b8!8m2!3d28.9802655!4d76.9931238!16s%2Fg%2F11h6nw68st?entry=tts&g_ep=EgoyMDI1MDUyNy4wIPu8ASoASAFQAw%3D%3D&skid=7187cf64-d716-414e-ba5f-d5524082a607">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#eac5ab] text-orange-900 px-8 py-3 rounded-full font-semibold hover:bg-orange-100 transition-colors inline-flex items-center space-x-2"
                >
                  <span>Visit Us</span>
                </motion.button>
              </Link>
            </div>
          </motion.section>
        </div>
      </motion.section>
    </div>
  );
};


export default TherapySection
;