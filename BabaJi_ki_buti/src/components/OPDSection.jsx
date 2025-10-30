// src/components/OPDSection.jsx
import React from "react";
import { motion } from "framer-motion";
import {
  Scale,
  BriefcaseMedical,
  HeartPulse,
  Handshake,
  CheckCircle,
  MapPin,
  Clock,

} from "lucide-react";
import { Link } from "react-router-dom";

// ⬇️ Make sure these paths point to your real local image files
// (leave names as-is so the rest of your code stays unchanged)
// import heroImage from "@/assets/ayurvedic-herbs-hero.jpg";
// import consultationImage from "@/assets/consultation.jpg";

/** Minimal Button so this file compiles without shadcn/ui */
const Button = ({ className = "", variant = "solid", size = "md", children, ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  const byVariant =
    variant === "outline"
      ? "bg-transparent border border-babi-dark/30 text-babi-dark hover:bg-babi-dark/10"
      : variant === "secondary"
      ? "bg-babi-primary text-babi-white hover:opacity-90"
      : "bg-babi-dark text-white hover:opacity-90";
  const bySize =
    size === "lg" ? "text-lg px-8 py-4" : size === "sm" ? "text-sm px-3 py-1.5" : "text-base px-6 py-3";
  return (
    <button className={`${base} ${byVariant} ${bySize} ${className}`} {...props}>
      {children}
    </button>
  );
};

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function OPDSection() {
  return (
    <div className="min-h-screen bg-gradient-hero text-babi-dark">
      {/* Hero Section */}
      <motion.section
        className="relative py-24 bg-gradient-hero overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm">
          <img
            src="/images/ayurvedic-herbs-hero.jpg"
            alt="Ayurvedic herbs background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>

        <div className="container mx-auto px-6 lg:px-8 text-center relative z-10 py-8">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-babi-dark mb-6 tracking-tight"
            {...fadeInUp}
          >
            ओ.पी.डी. सेवाएं
          </motion.h1>
          <motion.div
            className="flex items-center justify-center space-x-2 text-babi-medium text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <span>Home</span>
            <span>/</span>
            <span className="text-babi-primary">ओ.पी.डी. सेवाएं</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Main Content */}
      <section className="py-20 px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-babi-dark mb-8 leading-tight">
                हर रविवार — निशुल्क आयुर्वेद परामर्श
              </h2>

              <div className="space-y-6 text-babi-medium mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-xl">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-babi-primary" />
                  <p className="text-lg">
                    <strong className="text-babi-primary">स्थान:</strong> बाबा जी की बुटी केंद्र, सोनिपत, हरियाणा
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-babi-primary" />
                  <p className="text-lg">
                    <strong className="text-babi-primary">समय:</strong> सुबह 10:00 बजे से शाम 06:00 बजे तक
                  </p>
                </div>
              </div>

              <p className="text-babi-medium leading-relaxed text-lg mb-8">
                हर रविवार को, बाबा जी की बुटी में अनुभवी और प्रमाणित आयुर्वेदाचार्य द्वारा निःशुल्क परामर्श प्रदान किया जाता है। यह सेवा हर उस व्यक्ति के लिए खुली है, जो अपने स्वास्थ्य को दवाइयों से नहीं — जड़ से समझकर, संतुलन और समाधान से ठीक करना चाहता है।
              </p>
            </motion.div>

            {/* Right Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-accent p-2 rounded-2xl shadow-elegant hover:shadow-glow transition-all duration-300">
                <img
                  src="/images/ayurvedic-consultation.jpg"
                  alt="Ayurvedic consultation"
                  className="rounded-xl w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-6 lg:px-8 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center text-babi-dark mb-16"
            {...fadeInUp}
          >
            इस सेवा में आपको क्या मिलेगा?
          </motion.h2>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {/* Service 1 */}
          <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
            <div className="w-20 h-20 bg-gradient-blue-cyan rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Handshake className="w-10 h-10 text-babi-white" />
            </div>
            <h3 className="text-xl font-semibold text-babi-primary mb-4">व्यक्तिगत परामर्श</h3>
            <p className="text-babi-medium leading-relaxed">
              हर रोगी के लिए पूरी गोपनीयता के साथ 1-on-1 consultation — ताकि आपका शरीर, मन और जीवनशैली एक सम्पूर्ण दृष्टिकोण से समझ सके।
            </p>
          </motion.div>

          {/* Service 2 */}
          <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
            <div className="w-20 h-20 bg-gradient-green-emerald rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <HeartPulse className="w-10 h-10 text-babi-white" />
            </div>
            <h3 className="text-xl font-semibold text-babi-primary mb-4">नाड़ी परीक्षण</h3>
            <p className="text-babi-medium leading-relaxed">
              आयुर्वेद की सबसे प्राचीन विधि — नाड़ी देखकर शरीर की ऊर्जा, दोषों और आंतरिक असंतुलन को गहराई से पहचाना जाता है।
            </p>
          </motion.div>

          {/* Service 3 */}
          <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
            <div className="w-20 h-20 bg-gradient-purple-pink rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <BriefcaseMedical className="w-10 h-10 text-babi-white" />
            </div>
            <h3 className="text-xl font-semibold text-babi-primary mb-4">रोगानुसार आयुर्वेदिक निर्देश</h3>
            <p className="text-babi-medium leading-relaxed">
              हर समस्या के लिए व्यक्ति-विशेष उपचार — ना कोई generalized approach, ना कोई copy-paste।
            </p>
          </motion.div>

          {/* Service 4 */}
          <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
            <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Scale className="w-10 h-10 text-babi-white" />
            </div>
            <h3 className="text-xl font-semibold text-babi-primary mb-4">त्रिदोष संतुलन</h3>
            <p className="text-babi-medium leading-relaxed">
              आपके वात, पित्त, कफ के संतुलन को पुनःस्थापित करने हेतु औषधि, आहार और दिनचर्या पर विशेष मार्गदर्शन।
            </p>
          </motion.div>
        </motion.div>
        </div>
      </section>

      {/* Two Column Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-xl"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-babi-dark mb-10">ये सेवा किनके लिए है?</h2>

              <div className="space-y-6">
                {[
                  "जिनके reports सब normal हैं, लेकिन शरीर थका हुआ है",
                  "जिनके स्वास्थ्य में दवाओं के साइड इफेक्ट्स दिख रहे हैं",
                  "जिनका बार-बार इलाज करवाने पर भी रोग वापस लौट आता है",
                  "जो preventive तरीके से अपनी immunity और energy को सुधारना चाहते हैं",
                ].map((text, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 bg-babi-primary rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-babi-white" />
                    </div>
                    <p className="text-babi-medium text-lg">{text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/80 backdrop-blur-sm p-8 rounded-xl"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-babi-dark mb-10">सेवा का स्वरूप</h2>

              <div className="space-y-6">
                {[
                  "पूर्णतः निशुल्क परामर्श",
                  "कोई registration charges नहीं",
                  "औषधि के लिए अलग prescription दिया जाता है",
                  "आप चाहें तो onsite काउंटर से औषधि ले सकते हैं — या घर ले जाकर भी मंगवा सकते हैं",
                ].map((text, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <div className="w-8 h-8 bg-babi-highlight rounded-full flex items-center justify-center mt-1 flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-babi-white" />
                    </div>
                    <p className="text-babi-medium text-lg">{text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        className="py-24 px-6 lg:px-8 bg-gradient-accent relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="absolute inset-0 bg-black/20">
          <img
            src="/images/ayurvedic-herbs-hero.jpg"
            alt="Ayurvedic herbs pattern"
            className="w-full h-full object-cover opacity-30"
          />
        </div>

        <div className="container mx-auto text-center relative z-10">
          <motion.p className="text-[#523122] text-xl font-semibold mb-6" {...fadeInUp}>
            हर दर्द का समाधान
          </motion.p>

          <motion.h2
            className="text-5xl md:text-6xl font-bold text-[#523122] mb-10 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
          >
            एक स्पर्श से, एक संवाद से।
          </motion.h2>

          <motion.p
            className="text-[#523122] max-w-4xl mx-auto mb-10 leading-relaxed text-lg font-semibold"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
          >
            ओ.पी.डी. में आइए, और अपने शरीर से फिर से रिश्ता बनाइए। परामर्श के लिए पहले से अपॉइंटमेंट लेना अनिवार्य नहीं, लेकिन शनिवार तक booking कराने पर waiting नहीं लगेगी |
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            viewport={{ once: true }}
          >
             <Link to="https://www.google.com/maps/place/BABA+JI+KI+BUTI/@28.9802655,76.9905489,762m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390dbb183d826345:0x79f9532049e22b8!8m2!3d28.9802655!4d76.9931238!16s%2Fg%2F11h6nw68st?entry=tts&g_ep=EgoyMDI1MDUyNy4wIPu8ASoASAFQAw%3D%3D&skid=7187cf64-d716-414e-ba5f-d5524082a607">
            <Button
              variant="outline"
              size="lg"
              className="px-12 py-4 text-xl border-babi-dark/30 text-[#523122] hover:bg-babi-dark/10 hover:scale-105 transition-all duration-300"
            >
              VISIT US
              
            </Button>
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

export default OPDSection;
