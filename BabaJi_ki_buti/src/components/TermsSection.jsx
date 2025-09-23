import React from "react";

const TermSection = () => {
  return (
    <main className="min-h-screen font-serif" style={{ backgroundColor: "#faeade" }}>
      {/* Terms Content */}
      <section className="mx-auto max-w-6xl px-6 md:px-12 pb-16">
        <div className="bg-[#faeade] py-40 text-center relative overflow-hidden">
            {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-200/30 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full translate-x-20 translate-y-20"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-amber-900 mb-4 tracking-wide">
            Terms & Conditions
          </h1>
          <div className="flex items-center justify-center space-x-2 text-amber-700/80">
            <span className="text-sm md:text-base font-medium">Home</span>
            <span className="text-amber-600">•</span>
            <span className="text-sm md:text-base font-medium">Terms & Conditions</span>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-500 mx-auto mt-6 rounded-full"></div>
        </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200/50 overflow-hidden">
          {/* Welcome Section */}
          <div className="p-8 md:p-12 border-b border-amber-200/30">
            <p className="text-lg leading-relaxed text-amber-900/90 font-medium">
              Welcome to <span className="font-bold text-amber-800 text-xl">Baba Ji Ki Buti</span>. These Terms and
              Conditions ("Terms") govern your use of our website{" "}
              <a
                href="https://www.babajikibuti.com"
                target="_blank"
                rel="noreferrer"
                className="text-amber-700 hover:text-amber-800 underline decoration-amber-400 underline-offset-2 font-semibold transition-colors"
              >
                www.babajikibuti.com
              </a>{" "}
              and any purchase of products or services from us. By accessing or
              using our website, you agree to comply with and be bound by the
              following Terms.
            </p>
          </div>

          {/* Terms Content */}
          <div className="p-8 md:p-12 space-y-10">
            {[
              {
                title: "1. Use of Website",
                content: [
                  "This website is intended for individuals aged 18 years or older. If you are under 18, you may use the site only with involvement of a parent or guardian.",
                  "You agree not to misuse the site for unlawful purposes or to interfere with its normal functioning.",
                  "We reserve the right to refuse service, terminate accounts, or cancel orders at our sole discretion.",
                ],
              },
              {
                title: "2. Product Information",
                content: [
                  "All products are Ayurvedic and formulated for general wellness. They are not intended to diagnose, treat, cure, or prevent any disease.",
                  "Results may vary based on individual body types, age, and health conditions.",
                  "Please consult a qualified medical practitioner before using any product, especially if you are pregnant, nursing, or taking medication.",
                ],
              },
              {
                title: "3. Pricing and Availability",
                content: [
                  "All prices listed on the website are in Indian Rupees (INR) and are subject to change without notice.",
                  "We make every effort to ensure accurate product descriptions and pricing. However, in the event of an error, we reserve the right to cancel or revise the order.",
                  "Product availability is subject to stock. In case of unavailability, the customer will be informed and refunded promptly.",
                ],
              },
              {
                title: "4. Orders and Payments",
                content: [
                  "Orders placed through our website are subject to confirmation via email or SMS.",
                  "Payment methods accepted include Credit/Debit Cards, UPI, Net Banking, Wallets, and COD (where available).",
                  "For COD orders, refusal to accept delivery without valid reason may affect future ordering eligibility.",
                ],
              },
              {
                title: "5. Shipping and Delivery",
                content: [
                  "Shipping timelines and return conditions are outlined in our Shipping & Returns Policy.",
                  "We are not liable for delays caused by third-party courier services or unforeseen circumstances.",
                ],
              },
              {
                title: "6. Intellectual Property",
                content: [
                  "All content on this website, including product names, images, logos, text, graphics, and layout, is the property of Baba Ji Ki Buti and protected under intellectual property laws.",
                  "You may not reproduce, modify, distribute, or commercially exploit any part of the website without our written permission.",
                ],
              },
              {
                title: "7. Limitation of Liability",
                content: [
                  "Baba Ji Ki Buti shall not be held liable for any direct, indirect, incidental, or consequential damages arising from the use or misuse of our products or services.",
                  "We do not guarantee uninterrupted or error-free access to our website.",
                ],
              },
              {
                title: "8. User Accounts",
                content: [
                  "If you create an account on our website, you are responsible for maintaining the confidentiality of your login credentials and for all activity under your account.",
                  "You agree to provide accurate and up-to-date information.",
                ],
              },
              {
                title: "9. External Links",
                content: [
                  "Our website may contain links to third-party websites. We are not responsible for the content, privacy policies, or practices of those sites.",
                ],
              },
              {
                title: "10. Changes to Terms",
                content: [
                  "We reserve the right to update or modify these Terms at any time. Updated terms will be posted on this page with the revised effective date.",
                ],
              },
              {
                title: "11. Governing Law",
                content: [
                  "These Terms shall be governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the courts of Sonipat, Haryana.",
                ],
              },
              {
                title: "12. Contact Us",
                content: [
                  "Baba Ji Ki Buti Pvt. Ltd.",
                  "Bypass Road, Near Sec-23, Sonipat, Haryana – 131001",
                  "Email: contact@babajikibuti.com",
                  "Phone: +91 98730 33339",
                ],
              },
            ].map((section, index) => (
              <div key={index} className="group">
                <div className="flex items-center space-x-3 mb-4">
                 
                  <h2 className="font-bold text-xl text-amber-900 group-hover:text-amber-700 transition-colors">
                    {section.title}
                  </h2>
                </div>
                <div className="ml-11 space-y-3">
                  {section.content.map((point, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-amber-900/80 leading-relaxed font-medium text-base">
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Footer Note */}
            <div className="mt-12 pt-8 border-t border-amber-200/50 text-center">
              <div className="inline-flex items-center space-x-2 bg-amber-100/50 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                <p className="text-sm text-amber-700 font-medium">
                  Last updated: <time dateTime="2025-09-22" className="font-semibold">22 Sep 2025</time>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default TermSection;