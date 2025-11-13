import React, { useState } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, AlarmCheck } from "lucide-react";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      console.log("Contact form:", form);
      setIsSubmitted(true);
      setIsSubmitting(false);
      setForm({ name: "", phone: "", email: "", message: "" });
      
      // Reset success message after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* Animated background elements */}
     

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="pt-30 pb-12 text-center">
          <div className="max-w-4xl mx-auto px-6">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Contact <span className="text-transparent bg-clip-text bg-[#aa7a4f]">Baba Ji Ki Buti</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              We're here to help you with all your herbal and wellness needs. 
              Reach out to us for personalized guidance and support.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-lg">
  <span className="flex items-center gap-2 text-gray-700 font-medium">
    <img src="/images/loc.svg" alt="Location" className="w-4 h-4" />
    Sonipat, Haryana
  </span>
</div>

              <div className="px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-lg">
  <span className="flex items-center gap-2 text-gray-700 font-medium">
    <img src="/images/alarm.png" alt="Location" className="w-4 h-4" />
    Mon-Sat: 9AM-6PM
  </span>
</div>
            </div>
          </div>
        </section>

        {/* Contact Information Cards */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {/* Address */}
              <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
               <div
  className="w-16 h-16 flex items-center justify-center mb-6
             rounded-full border border-yellow-400/30 bg-black/90
             transition-transform duration-200 group-hover:scale-110 hover:scale-105"
>
  <img src="/images/loc.svg" alt="Location icon" className="w-8 h-8" />
</div>

                <h3 className="text-xl font-bold text-gray-900 mb-4">Visit Us</h3>
                <a href="https://www.google.com/maps/place/BABA+JI+KI+BUTI/@28.980219,76.993119,207321m/data=!3m1!1e3!4m6!3m5!1s0x390dbb183d826345:0x79f9532049e22b8!8m2!3d28.9802655!4d76.9931238!16s%2Fg%2F11h6nw68st?entry=ttu&g_ep=EgoyMDI1MDkxNS4wIKXMDSoASAFQAw%3D%3D" className="text-gray-600 leading-relaxed">
                  Kh. 333, Near Vivekanand School,<br />
                  Kakroi Road, Sector 23, Sonipat,<br />
                  Haryana 131001, India
                </a>
              </div>

              {/* Phone */}
              <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 flex items-center justify-center mb-6
             rounded-full border border-yellow-400/30 bg-black/90
             transition-transform duration-200 group-hover:scale-110 hover:scale-105">
                  <img src="/images/phone.svg" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Call Us</h3>
                <a 
                  href="tel:+919873033339" 
                  className="text-gray-600 hover:text-green-600 transition-colors text-lg font-medium"
                >
                  +91 98730 33339
                </a>
              </div>

              {/* Email */}
              <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 flex items-center justify-center mb-6
             rounded-full border border-yellow-400/30 bg-black/90
             transition-transform duration-200 group-hover:scale-110 hover:scale-105">
                  <img src="/images/msg3.svg" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Email Us</h3>
                <a 
                  href="mailto:contact@babajikibuti.com" 
                  className="text-gray-600 hover:text-blue-600 transition-colors break-all"
                >
                  contact@babajikibuti.com
                </a>
              </div>

              {/* Hours */}
              <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-white/20 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                <div className="w-16 h-16 flex items-center justify-center mb-6
             rounded-full border border-yellow-400/30 bg-black/90
             transition-transform duration-200 group-hover:scale-110 hover:scale-105">
                  <img src="/images/clock.svg" className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hours</h3>
                <p className="text-gray-600">
                  Monday to Saturday<br />
                  09:00 AM – 06:00 PM (IST)
                </p>
              </div>
            </div>

            {/* Main Content Grid */}
         {/* CONTACT + MAP SECTION */}
<section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:items-stretch">
    
    {/* 📨 FORM CARD */}
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl border border-white/20 h-full flex flex-col">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
          Send us a message
        </h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Have questions about our products or need personalized recommendations? 
          We'd love to hear from you!
        </p>
      </div>

      {/* Success message */}
      {isSubmitted && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium text-sm sm:text-base">
            Thank you! We received your message and will get back to you soon.
          </span>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-6 flex-grow">
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name *</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={onChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Phone Number *</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={onChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email Address *</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            required
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
            placeholder="your.email@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Your Message *</label>
          <textarea
            name="message"
            value={form.message}
            onChange={onChange}
            required
            rows={5}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
            placeholder="Tell us how we can help you..."
          />
        </div>
      </div>

      {/* Submit button pinned at bottom */}
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="mt-8 w-full bg-[#a26833] hover:bg-[#91582b] text-white font-semibold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Sending...
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Message
          </>
        )}
      </button>
    </div>

    {/* 📍 MAP CARD */}
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 md:p-12 shadow-2xl border border-white/20 h-full flex flex-col">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
          Find Our Location
        </h2>

        <div className="relative rounded-2xl overflow-hidden border-4 border-gray-100 shadow-inner
                        h-56 sm:h-72 md:h-full min-h-[18rem]">
          <iframe
            title="Baba Ji Ki Buti Location"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d424646.02828249306!2d76.993119!3d28.980219000000005!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390dbb183d826345%3A0x79f9532049e22b8!2sBABA%20JI%20KI%20BUTI!5e1!3m2!1sen!2sin!4v1743501904626!5m2!1sen!2sin"
            className="absolute inset-0 w-full h-full grayscale hover:grayscale-0 transition-all duration-500"
            style={{ border: 0 }}
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            loading="eager"
          />
        </div>

        <div className="mt-12 text-center">
         <a
  href="https://www.google.com/maps/place/BABA+JI+KI+BUTI/data=!4m2!3m1!1s0x0:0x79f9532049e22b8?sa=X&ved=1t:2428&ictx=111"
  target="_blank"
  rel="noopener noreferrer"
  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg
             bg-gradient-to-r from-amber-100 to-orange-50 text-[#a26833] font-semibold
             border border-amber-300 shadow-sm transition-all duration-300
             hover:from-orange-100 hover:to-amber-50 hover:shadow-md hover:-translate-y-[1px]"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 12l4.243-4.243M6 12h11.657" />
  </svg>
  Open in Google Maps
</a>

        </div>
      </div>
    </div>
  </div>
</section>

          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Experience the best in herbal wellness with our commitment to quality, 
                authenticity, and customer satisfaction.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 ">
              {[
                { 
                  title: "Free Shipping Worldwide", 
                  desc: "Get your orders delivered anywhere in the world at no extra cost",
                  icon: "/images/truck1.png",
                  color: "from-blue-500 to-cyan-500"
                },
                { 
                  title: "24/7 Customer Support", 
                  desc: "Our dedicated team is always ready to assist you with any queries",
                  icon: "/images/msg2.svg",
                  color: "from-green-500 to-emerald-500"
                },
                { 
                  title: "Secure Checkout", 
                  desc: "Shop with confidence using our encrypted and secure payment system",
                  icon: "/images/padlock.png",
                  color: "from-purple-500 to-pink-500"
                },
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group bg-white/80 backdrop-blur-sm  p-8 shadow-lg border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-105 text-center"
                >
                  <div className={`className="inline-flex items-center justify-center bg-white/5 w-10 h-10 hover:scale-105 transition ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform text-3xl`}>
                    <img src={feature.icon} alt="" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="bg-[#ba9f7d] rounded-3xl p-12 shadow-2xl text-white">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your Wellness Journey?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of satisfied customers who trust Baba Ji Ki Buti for their health and wellness needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center ">
                <a 
                  href="tel:+919873033339"
                  className="inline-flex items-center justify-center px-8 py-4 bg-black/75 font-semibold rounded-xl hover:bg-black transition-colors shadow-lg gap-3"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                </a>
                <a 
                  href="mailto:contact@babajikibuti.com"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/20 text-white font-semibold rounded-xl hover:bg-white/30 transition-colors border border-white/30 gap-3"
                >
                  <Mail className="w-5 h-5" />
                  Email Us
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactSection;