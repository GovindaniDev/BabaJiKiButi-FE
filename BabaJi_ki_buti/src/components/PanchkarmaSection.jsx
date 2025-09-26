
import React from "react";
import { motion } from "framer-motion";
import {
    Play,
    Microscope,
    Brain,
    BrainCircuit,
    ThumbsUp,
    CheckCircle,
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

function PanchkarmaSection() {
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
                        पंचकर्म
                    </motion.h1>
                    <motion.div
                        className="flex items-center justify-center space-x-2 text-babi-medium text-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <span>Home</span>
                        <span>/</span>
                        <span className="text-babi-primary">पंचकर्म</span>
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
                                    आयुर्वेद की शुद्धिकरण प्रक्रिया
                                </p>
                                <h1 className="text-4xl lg:text-5xl font-bold text-babi-white leading-tight">
                                    शरीर को बाहर से नहीं, अंदर से साफ करने की ज़रूरत है
                                </h1>
                            </div>

                            <div className="space-y-4 text-babi-white/80 leading-relaxed">
                                <p>
                                    पंचकर्म आयुर्वेद की वो चिकित्सा पद्धति है जो केवल इलाज नहीं, बल्कि एक complete internal reset है.
                                </p>
                                <p>
                                    ये थैरेपी न सिर्फ toxins को शरीर से बाहर निकालती है, बल्कि त्रिदोषों — वात, पित्त, कफ — को संतुलन में लाकर शरीर को फिर से स्वस्थ, हल्का और ऊर्जावान बनाती है.
                                </p>
                                <p>
                                    आजकल की दौड़-भाग वाली जिंदगी में जहां stress, processed food और गलत routine से शरीर अंदर ही अंदर बिगड़ता जाता है — वहाँ पंचकर्म एक scientifically time-tested तरीका है body ko detox, de-stress aur heal करने का.
                                </p>
                                <p>
                                    कभी-कभी हम खुद को थका, भारी और dull महसूस करते हैं — जबकि reports में सब कुछ normal आता है. ऐसे में पंचकर्म वही काम करता है जो दिमाग, शरीर और आत्मा — तीनों को दुबारा sync करता है. बाबा जी की बूटी में पंचकर्म आधुनिक सुविधा और पारंपरिक प्रक्रिया के perfect मिश्रण के साथ किया जाता है — ताकि आपकी purification journey हो safe, effective aur deeply healing.
                                </p>
                            </div>
                        </div>

                        {/* Right image */}
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-elegant ring-1 ring-babi-dark/30">
                                <img
                                    src="/images/traditional.jpg"
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
                                <Microscope className="w-10 h-10 text-babi-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-babi-primary mb-4">100% Personalized Procedure</h3>
                            <p className="text-babi-medium leading-relaxed">
                                हर व्यक्ति के शरीर की प्रकृति अलग होती है — इसी कारण पंचकर्म की प्रक्रिया भी पूरी तरह कस्टमाइज की जाती है।
                            </p>
                        </motion.div>

                        {/* Service 2 */}
                        <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
                            <div className="w-20 h-20 bg-gradient-green-emerald rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <Brain className="w-10 h-10 text-babi-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-babi-primary mb-4">Deep Detox at Cellular Level</h3>
                            <p className="text-babi-medium leading-relaxed">
                                ये सिर्फ पेट साफ करने वाली प्रक्रिया नहीं है — ये liver, intestines, lymph system और mind तक की सफाई करता है।
                            </p>
                        </motion.div>

                        {/* Service 3 */}
                        <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
                            <div className="w-20 h-20 bg-gradient-purple-pink rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <BrainCircuit className="w-10 h-10 text-babi-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-babi-primary mb-4">Physical + Mental Reset</h3>
                            <p className="text-babi-medium leading-relaxed">
                                थकान, नींद की कमी, skin dullness, chronic acidity – ये सब symptoms पंचकर्म से visibly कम होते हैं।
                            </p>
                        </motion.div>

                        {/* Service 4 */}
                        <motion.div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white/90 transition-all duration-300" variants={fadeInUp}>
                            <div className="w-20 h-20 bg-gradient-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <ThumbsUp className="w-10 h-10 text-babi-white" />
                            </div>
                            <h3 className="text-xl font-semibold text-babi-primary mb-4">Scientifically Rooted, Spiritually Aligned</h3>
                            <p className="text-babi-medium leading-relaxed">
                                सदियों पुरानी प्रक्रिया, modern approach के साथ – बिना नुकसान, बिना chemical, बस pure internal सफाई।
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
                                    src="/images/massage-therapy.jpg"
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
                                    Body साफ तो mind भी शांत – यही असली आराम है।
                                </h2>
                            </div>

                            <p className="text-babi-white/80 py-5 leading-relaxed">
                                बाबा जी की बूटी के पंचकर्म थैरेपी सेंटर में हम न सिर्फ शुद्धिकरण करते हैं, बल्कि body को restore भी करते हैं.
                                यहां पहले आपकी नाड़ी और दोष प्रकृति को समझा जाता है — फिर उसी के अनुसार पंचकर्म की विधि चुनी जाती है |
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
                                    "हर प्रक्रिया डॉक्टर की निगरानी में होती है, हर हर्बल तेल और decoction पारंपरिक methods से तैयार होता है. Therapy के बाद आपको मिलता है personalised pathya (diet) और routine — ताकि detox का असर लंबे समय तक बना रहे.",
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
                            <h2 className="text-3xl md:text-4xl py-5 font-bold text-babi-dark ">"Detox करवाना luxury नहीं, अब जरूरत है"</h2>

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
                                    "शरीर की गहराई से सफाई – toxins बाहर, ऊर्जा अंदर Purification सिर्फ बाहरी नहीं — liver, blood, skin और gut तक असर दिखता है.",
                                    "Chronic Problems में Long-Term आराम PCOS, acidity, weight gain, skin allergies, joint pain – पंचकर्म ने हजारों को राहत दी है.",

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
                        Body reset कराना है
                    </motion.p>

                    <motion.h2
                        className="text-5xl md:text-6xl font-bold text-babi-dark mb-10 leading-tight"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        अब वक्त है शरीर को एक gift देने का
                    </motion.h2>

                    <motion.p
                        className="text-babi-dark max-w-4xl mx-auto mb-10 leading-relaxed text-lg"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        viewport={{ once: true }}
                    >
                        हर रोज़ हम अपने शरीर में ज़हर भरते हैं – stress, food, chemicals और thoughts के ज़रिए. बाबा जी की बूटी में आपकी प्रक्रिया होती है प्राकृतिक तरीकों से, experienced experts के साथ, और पूरी देखरेख में.
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

export default PanchkarmaSection;
