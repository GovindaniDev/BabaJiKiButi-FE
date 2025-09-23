import React from "react";
import { Link } from "react-router-dom";
import SlidingStrip from "../components/SlidingStrip";

const FooterSection = () => {
  const popularSearches = [
    "Dull skin or hair fall troubling you? Time for a natural fix.",
    "Feeling Drained? Need a Natural Energy Boost?",
    "Looking For A Health Focused Combo Just For You?",
    "Worried About Weight Control? We’ve Got Your Back.",
  ];

  return (
    <section className="footer-section bg-black text-white relative">
      {/* Top decorative dip */}
      <img
        src="/images/footer-dip.png"
        alt=""
        className="w-full block object-cover -translate-y-1 select-none pointer-events-none"
      />

      {/* Sliding text strip */}
      <div className="bg-[#1E1E1F]">
        <SlidingStrip
          items={popularSearches}
          speedSec={32} // lower = faster
          className="py-2"
        />
      </div>

      {/* Main footer wrapper (removed forced height) */}
      <div className="relative pt-10 md:pt-16 pb-10 md:pb-12 overflow-hidden">
        {/* Header row */}
        <div className="overflow-hidden relative z-10 px-5 md:px-10">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2 mb-4">
            <span className="col-start-2 col-end-3 justify-self-center text-center text-[#fdebd2] text-2xl md:text-3xl font-bold">
              Baba Ji Ki Buti
            </span>
            <div />
          </div>

          <p className="text-center text-gray-300 text-sm max-w-2xl mx-auto px-4 mb-8">
            Baba ji Ki Buti कोई सिर्फ दवा नहीं, एक भरोसा है – जो body, mind और
            health तीनो का खयाल रखता है – बिना दिखावे, बस असर के साथ।
          </p>
        </div>

        {/* Main Footer Content */}
        <div className="relative z-10 px-5 md:px-10">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {/* Store Address */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Store Address</h3>
                <div className="flex items-start gap-3">
                  <div className="mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full">
                    <img src="/images/loc.svg" alt="Location" className="w-4 h-4" />
                  </div>
                  <div>
                    <a
                      href="https://www.google.com/maps/place/BABA+JI+KI+BUTI/@28.980219,76.993119,207321m/data=!3m1!1e3!4m6!3m5!1s0x390dbb183d826345:0x79f9532049e22b8!8m2!3d28.9802655!4d76.9931238!16s%2Fg%2F11h6nw68st?entry=ttu&g_ep=EgoyMDI1MDkxNS4wIKXMDSoASAFQAw%3D%3D"
                      className="hover:text-yellow-400 transition-colors"
                    >
                      <address className="not-italic text-gray-300 leading-relaxed hover:text-yellow-400 transition-colors text-sm">
                        Kh. 333, Near Vivekanand School,
                        <br />
                        Kakroi Road, Sector 23, Sonipat,
                        <br />
                        Haryana 131001, India
                      </address>
                    </a>
                  </div>
                </div>
              </div>

              {/* Contact Us */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img src="/images/mail.svg" alt="Mail" className="w-4 h-4" />
                    <a
                      href="mailto:contact@babajikibuti.com"
                      className="text-gray-300 hover:text-yellow-400 transition-colors text-sm"
                    >
                      contact@babajikibuti.com
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <img src="/images/phone.svg" alt="Phone" className="w-4 h-4" />
                    <a
                      href="tel:+919873033339"
                      className="text-gray-300 hover:text-yellow-400 transition-colors text-sm"
                    >
                      +91 98730 33339
                    </a>
                  </div>
                </div>
              </div>

              {/* Stay Connected */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4">Stay Connected</h3>
                <div className="flex gap-3">
                  {[
                    { href: "https://www.facebook.com/", icon: "facebook.svg", label: "Facebook" },
                    { href: "https://www.instagram.com/yourhandle", icon: "insta.svg", label: "Instagram" },
                    { href: "https://x.com/i/flow/login?lang=en", icon: "twitter.svg", label: "Twitter" },
                    { href: "https://www.whatsapp.com/", icon: "whatsapp.svg", label: "Whatsapp" },
                  ].map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-yellow-400/30 bg-white/5 w-10 h-10 hover:scale-105 transition"
                      aria-label={item.label}
                    >
                      <img src={`/images/${item.icon}`} alt={item.label} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Shop By Category */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold mb-4 text-center">Shop By Category</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {[
                    "बाल और त्वचा",
                    "ऊर्जा और सहनशक्ति",
                    "महिला स्वास्थ्य",
                    "दर्द से राहत",
                    "रोग प्रतिरोधक क्षमता",
                    "पाचन स्वास्थ्य",
                    "विशेष स्वास्थ्य",
                    "पुरुष स्वास्थ्य",
                    "वजन नियंत्रण",
                    "पोषण संबंधी सप्लीमेंट्स",
                  ].map((label, i) => (
                    <a
                      key={i}
                      href="#"
                      className="group flex items-start gap-2 text-white/90 hover:text-yellow-400 transition-colors"
                    >
                      <span className="text-[#cdb085] mt-[2px]">▶</span>
                      <span className="text-sm">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>


<div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-700 pt-5 md:pt-6 text-gray-400 text-sm">
  <Link to="https://govindaniit.com/" className="text-center md:text-left hover:text-yellow-400">
    © 2025 Baba Ji Ki Buti. All Rights Reserved. Crafted By Govindani
    Infotech Pvt. Ltd.
  </Link>
  <div className="flex items-center gap-6 mt-4 md:mt-0">
    <Link
      to="/terms"
      onClick={() => window.scrollTo({ top: 0 ,behavior:"instant"})}
      className="hover:text-yellow-400"
    >
      Terms & Conditions
    </Link>
    <Link
      to="/privacy"
      onClick={() => window.scrollTo({ top: 0,behavior:"instant"})}
      className="hover:text-yellow-400"
    >
      Privacy Policy
    </Link>
    <Link
      to="/return"
      onClick={() => window.scrollTo({ top: 0,behavior:"instant"})}
      className="hover:text-yellow-400"
    >
      Returns & Refunds
    </Link>
  </div>
</div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterSection;
