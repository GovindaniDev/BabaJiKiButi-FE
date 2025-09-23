import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import SplitText from "gsap/SplitText"; // if you use "gsap/all", you can keep that, but this is clearer

gsap.registerPlugin(ScrollTrigger, SplitText);

const MessageSection = () => {
  useGSAP(() => {
    // Split the text
    const firstSplit = new SplitText(".first-message", { type: "words" });
    const secondSplit = new SplitText(".second-message", { type: "words" });
    const paraSplit = new SplitText(".message-content p", {
      type: "words,lines",
      linesClass: "paragraph-line",
    });

    // Animate first headline words on scroll
    gsap.to(firstSplit.words, {
      color: "#faeade",
      ease: "power1.in",
      stagger: 1,
      scrollTrigger: {
        trigger: ".message-content",
        start: "top center",
        end: "30% center",
        scrub: true,
      },
    });

    // Animate second headline words on scroll
    gsap.to(secondSplit.words, {
      color: "#faeade",
      ease: "power1.in",
      stagger: 1,
      scrollTrigger: {
        trigger: ".second-message",
        start: "top center",
        end: "bottom center",
        scrub: true,
      },
    });

    // Reveal the center “Baba Ji Ki Buti” slab
    gsap.to(".msg-text-scroll", {
      duration: 1,
      clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      ease: "circ.inOut",
      scrollTrigger: {
        trigger: ".msg-text-scroll",
        start: "top 60%",
      },
    });

    // Paragraph rise-in
    gsap.from(paraSplit.words, {
      yPercent: 300,
      rotate: 3,
      ease: "power1.inOut",
      duration: 1,
      stagger: 0.01,
      scrollTrigger: {
        trigger: ".message-content p",
        start: "top center",
      },
    });

    // Clean up split text on unmount
    return () => {
      firstSplit.revert();
      secondSplit.revert();
      paraSplit.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  });

  return (
    <section className="message-content">
      <div className="container mx-auto flex-center py-28 relative">
        <div className="w-full h-full">
          <div className="msg-wrapper text-center">
  {/* First line */}
  <h1 className="first-message text-balance leading-tight mb-6">
    Awaken your ancient wisdom with
  </h1>

  {/* Middle box */}
 <div style={{ clipPath: "polygon(0 0, 0 0, 0 100%, 0% 100%)", }} className="msg-text-scroll" > <div className="bg-light-brown md:pb-5 pb-3 px-5"> <h2 className="text-red-brown">Baba Ji Ki Buti</h2> </div> </div>

  {/* Second line */}
  <h1 className="second-message text-balance leading-tight mt-6">
    your soul’s strength with every sacred sip
  </h1>
</div>


          <div className="flex-center md:mt-20 mt-10">
            <div className="max-w-md px-10 flex-center overflow-hidden">
              <p className="leading-relaxed text-pretty">
                Embrace the divine power of nature and elevate your spirit with{" "}
                <span className="font-semibold">Baba Ji Ki Buti</span>—a
                timeless blend crafted for clarity, vitality, and inner balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MessageSection;
