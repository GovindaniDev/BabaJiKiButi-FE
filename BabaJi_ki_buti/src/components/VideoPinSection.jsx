// components/VideoPinSection.jsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useEffect, useRef } from "react";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

const VideoPinSection = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const rootRef = useRef(null);

  const computePinType = () => {
    const el = document.documentElement;
    const s = getComputedStyle(el);
    return (s.transform !== "none" || s.webkitTransform) ? "transform" : "fixed";
  };

  // refresh when the video becomes measurable + when tab visibility changes
  useEffect(() => {
    const box = rootRef.current?.querySelector(".video-box");
    const video = box?.querySelector("video");
    if (!video) return;

    const refresh = () => ScrollTrigger.refresh();
    video.preload = "metadata"; // hint to get dimensions early
    video.addEventListener("loadedmetadata", refresh);
    video.addEventListener("loadeddata", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      video.removeEventListener("loadedmetadata", refresh);
      video.removeEventListener("loadeddata", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useGSAP(() => {
    if (isMobile) return; // keep mobile simple

    // pin the section
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: rootRef.current,
        start: "top top",
        end: "+=200%",
        scrub: 1.5,
        pin: true,
        pinSpacing: "margin",      // avoids weird padding measurements
        pinType: computePinType(),
        anticipatePin: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1,
      },
    });

    // start CSS at final clip-path (100%), animate from small → big
    // but DO NOT render the "from" immediately
    tl.fromTo(
      ".video-box",
      { clipPath: "circle(6% at 50% 50%)" },
      { clipPath: "circle(100% at 50% 50%)", ease: "power1.inOut", immediateRender: false }
    ).to(
      ".play-btn-wrapper",
      { opacity: 0, scale: 0.8, ease: "power2.out" },
      "<0.5"
    );

    return () => tl.scrollTrigger?.kill();
  }, [isMobile]);

  return (
    <section ref={rootRef} className="vd-pin-section">
      <div className="video-box">
        <video
          src="/videos/pin-video.mp4"
          playsInline
          muted
          loop
          autoPlay
          preload="metadata"
          aria-label="Herbal wellness video"
        />
   <div
    className="play-btn-wrapper pointer-events-none"
    aria-hidden
    style={{
      position: 'absolute',
      inset: 0,
      display: 'grid',
      placeItems: 'center',
    }}
  >
    <div
      className="play-btn"
      style={{
        width: isMobile ? 56 : '9vw',
        height: isMobile ? 56 : '9vw',
        borderRadius: '9999px',
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(255,255,255,0.1)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <img
        src="/images/play.svg"
        alt=""
        style={{ width: isMobile ? 22 : '3vw' }}
      />
    </div>
  </div>
      </div>
    </section>
  );
};

export default VideoPinSection;
