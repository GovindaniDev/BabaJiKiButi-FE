import React from "react";

const PrivacySection = () => {
  return (
    <main className="min-h-screen font-serif" style={{ backgroundColor: "#faeade" }}>
      {/* Privacy Content */}
      <section className="mx-auto max-w-6xl px-6 md:px-12 pb-16">
        <div className="bg-[#faeade] py-35 text-center relative overflow-hidden">
            {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-200/30 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full translate-x-20 translate-y-20"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-amber-900 mb-4 tracking-wide">
            Privacy Policy
          </h1>
          <div className="flex items-center justify-center space-x-2 text-amber-700/80">
            <span className="text-sm md:text-base font-medium">Home</span>
            <span className="text-amber-600">•</span>
            <span className="text-sm md:text-base font-medium">Privacy Policy</span>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-500 mx-auto mt-6 rounded-full"></div>
        </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200/50 overflow-hidden">
          {/* Welcome Section */}
          <div className="p-8 md:p-12 border-b border-amber-200/30">
            <p className="text-lg leading-relaxed text-amber-900/90 font-medium">
              At <span className="font-bold text-amber-800 text-xl">Baba Ji Ki Buti</span>, we are committed to protecting your privacy. This Privacy Policy outlines how we collect, use, disclose, and safeguard your information when you visit our website or use our services. Your trust is important to us, and we take your privacy seriously.
            </p>
          </div>

          {/* Privacy Content */}
          <div className="p-8 md:p-12 space-y-10">
            {[
              {
                title: "1. Information We Collect",
                content: [
                  "We may collect the following types of information:",
                  "**Personal Information:**",
                  "• Name",
                  "• Contact information (email address, phone number, billing/shipping address)",
                  "• Account login details (if applicable)",
                  "**Order Information:**",
                  "• Products purchased",
                  "• Payment method (processed securely via third-party gateways)",
                  "• Transaction history",
                  "**Technical Information:**",
                  "• IP address",
                  "• Browser type and version",
                  "• Device type",
                  "• Pages visited and browsing behavior",
                  "**Voluntary Information:**",
                  "• Product reviews, survey responses, or any feedback submitted voluntarily"
                ],
              },
              {
                title: "2. How We Use Your Information",
                content: [
                  "We use the information we collect to:",
                  "• Process and deliver your orders efficiently",
                  "• Communicate order updates and customer support",
                  "• Send promotional offers or newsletters (only if you opt in)",
                  "• Improve website functionality, content, and user experience",
                  "• Detect and prevent fraud or misuse of services"
                ],
              },
              {
                title: "3. Data Protection and Security",
                content: [
                  "We implement strong security measures to protect your personal data:",
                  "• Secure servers and encrypted storage",
                  "• SSL (Secure Socket Layer) technology for safe transactions",
                  "• Limited access to personal information within the organization",
                  "We do not store your payment details on our servers. All transactions are securely processed by trusted third-party payment gateways."
                ],
              },
              {
                title: "4. Sharing of Information",
                content: [
                  "We do not sell or rent your personal information to any third parties.",
                  "However, we may share your information with trusted service providers who assist in:",
                  "• Order fulfillment and shipping",
                  "• Payment processing",
                  "• Marketing communication (with your consent)",
                  "• Website analytics and maintenance",
                  "These third parties are required to use your information only to perform designated tasks and are obligated to maintain confidentiality."
                ],
              },
              {
                title: "5. Cookies and Tracking Technologies",
                content: [
                  "We use cookies and similar technologies to:",
                  "• Provide a better browsing experience",
                  "• Remember your preferences",
                  "• Analyze site traffic and user behavior",
                  "• Serve relevant advertisements (if applicable)",
                  "You may choose to disable cookies through your browser settings, but doing so may affect the functionality of the website."
                ],
              },
              {
                title: "6. Your Rights",
                content: [
                  "You have the right to:",
                  "• Access the personal data we hold about you",
                  "• Request corrections or updates",
                  "• Withdraw consent for marketing communications",
                  "• Request deletion of your data (subject to legal obligations)",
                  "For such requests, please contact us at contact@babajikibuti.com."
                ],
              },
              {
                title: "7. Data Retention",
                content: [
                  "We retain your personal information only as long as necessary to:",
                  "• Fulfill the purposes outlined in this policy",
                  "• Comply with legal, tax, or regulatory requirements",
                  "• Provide customer service and resolve disputes"
                ],
              },
              {
                title: "8. Changes to This Policy",
                content: [
                  "We may update this Privacy Policy periodically. Any changes will be posted on this page with a revised effective date. We encourage you to review this policy regularly."
                ],
              },
              {
                title: "9. Contact Us",
                content: [
                  "If you have any questions or concerns regarding this Privacy Policy, please contact us:",
                  "Baba Ji Ki Buti Pvt. Ltd.",
                  "Bypass Road, Near Sec-23, Sonipat, Haryana, India – 131001",
                  "Email: contact@babajikibuti.com",
                  "Phone: +91 98730 33339",
                  "Website: www.babajikibuti.com"
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
                  {section.content.map((point, i) => {
                    // Handle bold text formatting
                    if (point.startsWith("**") && point.endsWith("**")) {
                      const boldText = point.slice(2, -2);
                      return (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-amber-900/80 leading-relaxed font-bold text-base">
                            {boldText}
                          </p>
                        </div>
                      );
                    }
                    // Handle bullet points with •
                    else if (point.startsWith("• ")) {
                      return (
                        <div key={i} className="flex items-start space-x-3 ml-6">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2.5 flex-shrink-0"></div>
                          <p className="text-amber-900/80 leading-relaxed font-medium text-base">
                            {point.slice(2)}
                          </p>
                        </div>
                      );
                    }
                    // Regular content
                    else {
                      return (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-amber-900/80 leading-relaxed font-medium text-base">
                            {point}
                          </p>
                        </div>
                      );
                    }
                  })}
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

export default PrivacySection;