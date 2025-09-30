import React from "react";

const ReturnRefundSection = () => {
  return (
    <main className="min-h-screen font-serif" style={{ backgroundColor: "#faeade" }}>
      {/* Return & Refund Content */}
      <section className="mx-auto max-w-6xl px-6 md:px-12 pb-16">
        <div className="bg-[#faeade] py-40 text-center relative overflow-hidden">
            {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-200/30 rounded-full -translate-x-16 -translate-y-16"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-200/20 rounded-full translate-x-20 translate-y-20"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-amber-900 mb-4 tracking-wide">
            Shipping & Returns
          </h1>
          <div className="flex items-center justify-center space-x-2 text-amber-700/80">
            <span className="text-sm md:text-base font-medium">Home</span>
            <span className="text-amber-600">•</span>
            <span className="text-sm md:text-base font-medium">Shipping & Returns</span>
          </div>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-500 mx-auto mt-6 rounded-full"></div>
        </div>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200/50 overflow-hidden">
          {/* Welcome Section */}
          <div className="p-8 md:p-12 border-b border-amber-200/30">
            <p className="text-lg leading-relaxed text-amber-900/90 font-medium">
              At <span className="font-bold text-amber-800 text-xl">Baba Ji Ki Buti</span>, we aim to deliver your order in the fastest, safest, and most cost-effective manner possible. This policy outlines how we handle shipping and returns to ensure your experience is smooth and transparent.
            </p>
          </div>

          {/* Policy Content */}
          <div className="p-8 md:p-12 space-y-10">
            {[
              {
                title: "1. Shipping Policy",
                content: [
                  "**Order Processing Time:** All orders are processed within **1 to 2 business days** (excluding Sundays and public holidays). You will receive an email confirmation with tracking details once your order is dispatched.",
                  "**Delivery Timeframe:**",
                  "• **Domestic Shipping (India):** 3 to 7 business days depending on your location.",
                  "• **International Shipping:** Currently not available. (To be updated)",
                  "**Shipping Charges:** A flat shipping fee may apply to orders below this value or for Cash on Delivery (COD) orders.",
                  "**Delays:** In rare cases, delays may occur due to weather, festivals, courier service issues, or unforeseen circumstances. We appreciate your patience and understanding in such events."
                ],
              },
              {
                title: "2. Return & Replacement Policy",
                content: [
                  "**Eligibility for Return/Replacement:** We accept returns or replacements only in the following conditions:",
                  "• You received the **wrong product**.",
                  "• The product was **damaged or leaked** during transit.",
                  "• The **product is expired or defective** upon delivery.",
                  "**Conditions:**",
                  "• The return request must be raised **within 48 hours** of product delivery.",
                  "• The product must be unused, unopened, and in its original packaging.",
                  "• Proof of issue (images or videos) must be emailed to **support@babajikibuti.com**.",
                  "**Non-Returnable Items:** Due to hygiene and safety reasons, **we do not accept returns** for:",
                  "• Opened or used products",
                  "• Products returned without original packaging",
                  "• Products damaged due to customer misuse",
                  "• Sale/discounted items (unless defective)"
                ],
              },
              {
                title: "3. Refunds (If Applicable)",
                content: [
                  "Once your return is approved:",
                  "• A **replacement** will be shipped at no extra cost **OR**",
                  "• A **refund** will be initiated to your original payment method (within 7–10 business days)",
                  "Refunds are not applicable for Cash on Delivery (COD) orders. In such cases, a **store credit or wallet balance** will be issued."
                ],
              },
              {
                title: "4. Cancellation Policy",
                content: [
                  "• Orders can be canceled within **12 hours** of placing them by contacting our support team.",
                  "• After dispatch, cancellation is not possible.",
                  "• Baba Ji Ki Buti reserves the right to cancel an order in case of product unavailability or incorrect address."
                ],
              },
              {
                title: "5. Contact for Returns",
                content: [
                  "For any return or refund requests, please contact:",
                  "**Email:** support@babajikibuti.com",
                  "**Phone:** +91 98730 33339",
                  "**Office Hours:** 10:00 AM – 6:00 PM (Mon–Sat)"
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
                    // Handle bold text formatting with **text**
                    if (point.includes("**")) {
                      const parts = point.split("**");
                      return (
                        <div key={i} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-amber-900/80 leading-relaxed font-medium text-base">
                            {parts.map((part, partIndex) => 
                              partIndex % 2 === 1 ? (
                                <span key={partIndex} className="font-bold text-amber-800">{part}</span>
                              ) : (
                                <span key={partIndex}>{part}</span>
                              )
                            )}
                          </p>
                        </div>
                      );
                    }
                    // Handle bullet points with •
                    else if (point.startsWith("• ")) {
                      const bulletContent = point.slice(2);
                      return (
                        <div key={i} className="flex items-start space-x-3 ml-6">
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2.5 flex-shrink-0"></div>
                          <p className="text-amber-900/80 leading-relaxed font-medium text-base">
                            {bulletContent.includes("**") ? (
                              bulletContent.split("**").map((part, partIndex) => 
                                partIndex % 2 === 1 ? (
                                  <span key={partIndex} className="font-bold text-amber-800">{part}</span>
                                ) : (
                                  <span key={partIndex}>{part}</span>
                                )
                              )
                            ) : (
                              bulletContent
                            )}
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

export default ReturnRefundSection;