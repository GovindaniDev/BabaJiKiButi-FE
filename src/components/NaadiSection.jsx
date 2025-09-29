
import React from "react";
import { motion } from "framer-motion";
import {
    UserRound as UserStar,
    ShieldCheck as ShieldUser,
    HandHeart,
    Handshake,
    CheckCircle,
    Play,

} from "lucide-react";

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

function NaadiSection() {
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

                <div className="container mx-auto px-6 lg:px-8 text-center relative z-10">
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold py-10 text-babi-dark mb-6 tracking-tight"
                        {...fadeInUp}
                    >
                        नाड़ी परण
                    </motion.h1>
                    <motion.div
                        className="flex items-center justify-center space-x-2 text-babi-medium text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <span>Home</span>
                        <span>/</span>
                        <span className="text-babi-primary">नाड़ी परण</span>
                    </motion.div>
                </div>
            </motion.section>

            {/* Main Content */}
            <section className="relative bg-babi-dark py-20">
                {/* Background pattern / subtle accent gradient */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-babi-primary/20 to-transparent"></div>
                </div>

                <div className="container mx-auto px-4 relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left content */}
                        <div className="space-y-8">
                            <div className="space-y-2">
                                <p className="text-babi-primary text-sm font-medium tracking-wide">
                                    शरीर बोले उससे पहले, नाड़ी सब बता देती है
                                </p>
                                <h1 className="text-4xl lg:text-5xl font-bold text-babi-white leading-tight">
                                    आयुर्वेद की सबसे प्राचीन और सटीक जांच प्रणाली
                                </h1>
                            </div>

                            <div className="space-y-4 text-babi-white/80 leading-relaxed">
                                <p>
                                    नाड़ी परीक्षण (Pulse Diagnosis) कोई आम जांच नहीं, बल्कि आयुर्वेद की एक ऐसी गहरी विद्या है जो बिना मशीन के, सिर्फ आपकी कलाई की नाड़ी को महसूस कर बता देती है कि आपके शरीर में क्या चल रहा है – बाहर नहीं, अंदर.
                                </p>
                                <p>
                                    यह केवल बीमारी पकड़ने का तरीका नहीं है, बल्कि आपकी body, mind aur lifestyle की स्थिति को एक holistic नज़रिया देता है. बाबा जी की बूटी में ये प्रक्रिया की जाती है अनुभव वाले आयुर्वेदाचार्यों द्वारा — पूरी श्रद्धा, तकनीक और संवेदनशीलता के साथ।
                                </p>
                                <p>
                                    कई बार reports normal होती हैं पर शरीर अंदर से imbalance में होता है. नाड़ी परीक्षण वही imbalance पकड़ने का काम करता है – चाहे वह वात, पित्त, कफ का हो या mental stress का.
                                </p>
                                <p>
                                    यह service खास उनके लिए है जो बार-बार इलाज बदल चुके हैं, लेकिन कभी खुद के शरीर को सुना नहीं. अब वक्त है खुद को समझने का – और नाड़ी इसके लिए सबसे सटीक शुरुआत है.
                                </p>
                            </div>
                        </div>

                        {/* Right image */}
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-elegant ring-1 ring-babi-dark/30">
                                <img
                                    src="/images/pulse-diagnosis.jpg"
                                    alt="आयुर्वेदिक दवा तैयारी"
                                    className="w-full h-full object-cover"
                                />
                                {/* Optional glow shadow: uncomment if you’ve defined it */}
                                {/* <div className="pointer-events-none absolute inset-0 shadow-glow"></div> */}
                            </div>
                        </div>
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
                                <UserStar className="w-10 h-10 text-babi-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-babi-primary mb-4">Experts You Can Trust</h3>
                            <p className="text-babi-medium leading-relaxed">
                                अनुभवी आयुर्वेदाचार्य, जिनकी उंगलियों में वर्षों का अभ्यास और धड़कन से जुड़ने की कला है।
                            </p>
                        </motion.div>

                        {/* Service 2 */}
                        <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
                            <div className="w-20 h-20 bg-gradient-green-emerald rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <ShieldUser className="w-10 h-10 text-babi-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-babi-primary mb-4">Safe & Non-Invasive</h3>
                            <p className="text-babi-medium leading-relaxed">
                                कोई मशीन नहीं, कोई डर नहीं – सिर्फ छूकर किया जाने वाला परीक्षण, पूरी तरह सुरक्षित और authentic.
                            </p>
                        </motion.div>

                        {/* Service 3 */}
                        <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
                            <div className="w-20 h-20 bg-gradient-purple-pink rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <HandHeart className="w-10 h-10 text-babi-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-babi-primary mb-4">Personal Attention</h3>
                            <p className="text-babi-medium leading-relaxed">
                                हर व्यक्ति की नाड़ी अलग होती है – इसलिए diagnosis भी पूरी तरह personal, आपके शरीर के मुताबिक।
                            </p>
                        </motion.div>

                        {/* Service 4 */}
                        <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
                            <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Handshake className="w-10 h-10 text-babi-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-babi-primary mb-4">Clarity Before Cure</h3>
                            <p className="text-babi-medium leading-relaxed">
                                इलाज से पहले सही समझ ज़रूरी होती है – और नाड़ी परीक्षण वही clarity लाता है।
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* VideoSection */}
            <section className="py-20 bg-babi-dark text-babi-white">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Video thumbnail */}
                        <div className="relative">
                            <div className="aspect-video rounded-xl overflow-hidden bg-babi-dark/10 shadow-elegant">
                                <img
                                    src="/images/pulse-diagnosis-demonstration.jpg"
                                    alt="आयुर्वेदिक मसाज थेरेपी"
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                                    <Button size="lg" aria-label="Play video">
                                        <Play className="h-6 w-6 ml-0.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <p className="text-babi-primary text-sm font-medium">अपनी नाड़ी से अपना सच जानिए</p>
                                <h2 className="text-3xl py-5 lg:text-4xl font-bold">
                                    Choose Our Pulse Diagnosis To Know Your Health closely
                                </h2>
                            </div>

                            <p className="text-babi-white/80 py-5 leading-relaxed">
                                नाड़ी परीक्षण सिर्फ एक जांच नहीं, बल्कि एक अनुभव है. यहां आपकी pulse सिर्फ धड़कन नहीं बताती, बल्कि यह भी बताती है कि body में क्या imbalance है, किस दोष (वात, पित्त, कफ) ने कब, क्यों और कैसे असर डाला |
                            </p>

                        </div>
                    </div>
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

                            <div className="space-y-6">
                                {[
                                    "बाबा जी की बूटी में हम नाड़ी को modern tools से नहीं, आयुर्वेद की पारंपरिक नाड़ी विद्या से पढ़ते हैं — जिससे बीमारी को symptoms से नहीं, source से समझा जाता है |",
                                    "जिन लोगों को बार-बार treatment change करने की जरूरत पड़ती है, जिन्हें chronic fatigue, stress, anxiety, hormonal imbalance या unexplained health issues हैं – उनके लिए ये service एक eye-opener साबित होती है |",
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
                            <h2 className="text-3xl md:text-4xl py-5 font-bold text-babi-dark ">"Yeh सिर्फ जाँच नहीं, समझ की शुरुआत है – और इलाज की भी"</h2>

                        </motion.div>

                        {/* Right Column */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            viewport={{ once: true }}
                            className="bg-white/80 backdrop-blur-sm p-8 rounded-xl"
                        >


                            <div className="space-y-6">
                                {[
                                    "रिपोर्ट नहीं, फिर भी असल जड़ तक बिना किसी blood test या scan के, नाड़ी परीक्षण से सीधा बीमारी की root cause तक पहुंचा जाता है |",
                                    "Symptoms से पहले रोग की पहचान वात, पित्त या कफ में गड़बड़ी symptoms आने से पहले detect हो जाती है – जिससे समय रहते इलाज possible है |",
                                    "शरीर और मन – दोनों को समझने वाला approach यह सिर्फ physical issue की बात नहीं करता, emotional imbalance को भी ध्यान में रखता है |",

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
                    <motion.p className="text-babi-dark text-xl mb-6" {...fadeInUp}>
                        हर report बदल ली, लेकिन clarity नहीं मिली?
                    </motion.p>

                    <motion.h2
                        className="text-5xl md:text-3xl font-bold text-babi-dark mb-10 leading-tight"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        रविवार आइए — और जानिए, आपका शरीर क्या कहना चाहता है।
                    </motion.h2>

                    <motion.p
                        className="text-babi-dark max-w-4xl mx-auto mb-10 leading-relaxed text-lg"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        बाबा जी की बूटी में हर रविवार, अनुभवी वैद्य आपकी pulse पढ़कर बताएंगे बीमारी की असली जड़ — बिना मशीन, बिना confusion. हर रविवार, सुबह 10:00 – शाम 6:00
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6, duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <Button>
                            <a
                                href="https://www.google.com/maps/place/BABA+JI+KI+BUTI/@28.9802655,76.9931238,762m/data=!3m2!1e3!4b1!4m6!3m5!1s0x390dbb183d826345:0x79f9532049e22b8!8m2!3d28.9802655!4d76.9931238!16s%2Fg%2F11h6nw68st?entry=ttu&g_ep=EgoyMDI1MDkyMy4wIKXMDSoASAFQAw%3D%3D"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center px-12 py-4 text-xl rounded-xl border border-babi-dark/30 text-babi-dark hover:bg-babi-dark/10 hover:scale-105 transition-all duration-300"
                            >
                                VISIT US
                            </a>
                        </Button>
                    </motion.div>
                </div>
            </motion.section>
        </div>
    );
}

export default NaadiSection;
