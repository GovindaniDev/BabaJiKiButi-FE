// components/VideoPinSection.jsx
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";
import { useMediaQuery } from "react-responsive";

gsap.registerPlugin(ScrollTrigger);

const VideoPinSection = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  useGSAP(() => {
    if (isMobile) return; // no pinning or long scrub on mobile

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: ".vd-pin-section",
        start: "top top",
        end: "+=200%",
        scrub: 1.5,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
      },
    });

    tl.to(".video-box", {
      clipPath: "circle(100% at 50% 50%)",
      ease: "power1.inOut",
    }).to(
      ".play-btn-wrapper",
      {
        opacity: 0,
        scale: 0.8,
        ease: "power2.out",
      },
      "<0.5"
    );

    return () => tl.scrollTrigger?.kill();
  }, [isMobile]);

  return (
    <section className="vd-pin-section">
      <div
        className="video-box"
        style={{
          clipPath: isMobile ? "circle(100% at 50% 50%)" : "circle(6% at 50% 50%)",
          width: isMobile ? "100%" : "100vw",
          height: isMobile ? "auto" : "100vh",
          position: isMobile ? "relative" : "fixed",
          top: 0,
          left: 0,
          overflow: "hidden",
          marginLeft: isMobile ? 0 : "calc(-50vw + 50%)",
        }}
      >
        <video
          src="/videos/pin-video.mp4"
          playsInline
          muted
          loop
          autoPlay
          aria-label="Herbal wellness video"
          style={{
            width: "full",
            height: isMobile ? "100%" : "full",
            objectFit: "cover",
            display: "block",
            position: isMobile ? "relative" : "absolute",
            top: isMobile ? "0" : "58%",
            left: isMobile ? "0" : "50%",
            transform: isMobile ? "none" : "translate(-50%, -50%)",
            aspectRatio: isMobile ? "16 / 9" : "auto",
            maxHeight: isMobile ? "90vh" : "none",
          }}
        />

        {/* Touch-friendly overlay hidden by animation on desktop */}
        <div
          className="play-btn-wrapper pointer-events-none"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
          }}
        >
          <div
            className="play-btn"
            style={{
              width: isMobile ? 56 : "9vw",
              height: isMobile ? 56 : "9vw",
              borderRadius: "9999px",
              display: "grid",
              placeItems: "center",
              background: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(10px)",
            }}
          >
            <img src="/images/play.svg" alt="" style={{ width: isMobile ? 22 : "3vw" }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoPinSection;
