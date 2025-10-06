import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";
import { SplitText } from "gsap/all";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// News Ticker Component
const InfiniteNewsTicker = () => {
  const announcements = [
    "🚨 BREAKING NEWS!!! 💸 GST PRICE CUT UP TO 12% ON MRP",
    "🪔 Diwali Hampers & Snacks → 15% OFF with SHUDDH15",
    "⭐ Members 20% OFF auto-applied",
    "🎉 Big Savings Alert! Get 10% OFF on orders above ₹3000 | Use code TBOF10",
    "🎁 FREE Truemato on orders above ₹4000"
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-40 w-full bg-gradient-to-r from-[#d4a574] via-[#c69463] to-[#d4a574] overflow-hidden"  style={{ fontFamily: "'Arial', sans-serif" }}>
      {/* Gradient edges for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-r from-[#d4a574] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 bg-gradient-to-l from-[#d4a574] to-transparent z-10 pointer-events-none"></div>
      
      <div className="relative flex h-8 md:h-10 items-center">
        {/* First set of announcements */}
        <div className="flex animate-scroll whitespace-nowrap">
          {announcements.map((announcement, index) => (
            <div key={`set1-${index}`} className="inline-flex items-center mx-4 md:mx-6">
              <span className="text-white font-bold text-[10px] md:text-sm drop-shadow-md">
                {announcement}
              </span>
             
            </div>
          ))}
        </div>
        
        {/* Duplicate set for seamless loop */}
        <div className="flex animate-scroll whitespace-nowrap" aria-hidden="true">
          {announcements.map((announcement, index) => (
            <div key={`set2-${index}`} className="inline-flex items-center mx-4 md:mx-6">
              <span className="text-white font-bold text-[10px] md:text-sm drop-shadow-md">
                {announcement}
              </span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        .animate-scroll {
          animation: scroll 35s linear infinite;
        }
      `}</style>
    </div>
  );
};

const HeroSection = () => {
  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const isTablet = useMediaQuery({
    query: "(max-width: 1024px)",
  });

  useGSAP(() => {
    const titleSplit = SplitText.create(".hero-title", {
      type: "chars",
    });

    const tl = gsap.timeline({
      delay: 1,
    });

    tl.to(".hero-content", {
      opacity: 1,
      y: 0,
      ease: "power1.inOut",
    })
      .to(
        ".hero-text-scroll",
        {
          duration: 1,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "circ.out",
        },
        "-=0.5"
      )
      .from(
        titleSplit.chars,
        {
          yPercent: 200,
          stagger: 0.02,
          ease: "power2.out",
        },
        "-=0.5"
      );

    const heroTl = gsap.timeline({
      scrollTrigger: {
        trigger: ".hero-container",
        start: "1% top",
        end: "bottom top",
        scrub: true,
      },
    });
    heroTl.to(".hero-container", {
      rotate: 7,
      scale: 0.9,
      yPercent: 30,
      ease: "power1.inOut",
    });
  });

  return (
    <section className="bg-main-bg pt-8 md:pt-10">
      {/* News Ticker */}
      <InfiniteNewsTicker />
      
      <div className="hero-container">
        {isTablet ? (
          <>
            {isMobile && (
              <img
                src="/images/bg-mobile.png"
                className="absolute bottom-40 size-full object-cover"
              />
            )}
            <img
              src="/images/bg-mobile.png"
              className="absolute bottom-0 left-1/2 -translate-x-1/2  object-auto"
            />
          </>
        ) : (
          <video
            src="/videos/hero-bg.mp4"
            autoPlay
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="hero-content opacity-0">
          <div className="overflow-hidden">
            <h1 className="hero-title">babaji ki buti</h1>
          </div>
          <div
            style={{
              clipPath: "polygon(50% 0, 50% 0, 50% 100%, 50% 100%)",
            }}
            className="hero-text-scroll"
          >
            <div className="hero-subtitle">
              <h1>Health + Wellness </h1>
            </div>
          </div>

          <h2>
           बाबा जी की बूटी: हिमालयन शिलाजीत—ज़ोरदार ऊर्जा, दमदार स्टैमिना, दिमाग़ की तेज़ी।
          </h2>

          <button
            onClick={() => window.location.href = '/shop'}
            className="md:mt-16 mt-10 text-dark-brown bg-light-brown uppercase font-bold text-lg rounded-full md:p-5 p-3 md:px-16 px-10"
          >
            Shop Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;