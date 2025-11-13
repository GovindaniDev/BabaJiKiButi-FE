import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useMe } from "../../auth/user/useMe";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import HeroSection from "../../sections/HeroSection";
import FooterSection from "../../sections/FooterSection";
import FlavorSection from "../../sections/FlavorSection";
import NutritionSection from "../../sections/NutritionSection";
import TestimonialSection from "../../sections/TestimonialSection";
import BenefitSection from "../../sections/BenefitSection";
import MessageSection from "../../sections/MessageSection";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
export default function HomePage() {   
    const [loading, setLoading] = useState(true);
      const location = useLocation();
    
      const { me, loading: meLoading } = useMe();
      const userId = me?.id ?? null;
    
      useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1500);
        return () => clearTimeout(timer);
      }, []);
    
    const isTouch =
    typeof window !== "undefined" &&
    matchMedia("(pointer: coarse)").matches;

  useGSAP(() => {
    // Kill any stale Smoother/Triggers before creating a new one
    const prev = ScrollSmoother.get();
    if (prev) prev.kill();
    ScrollTrigger.getAll().forEach(t => {
      if (t.vars && t.vars.id === "HOME_TMP") t.kill(true);
    });

    // Base smoother
    const smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: isTouch ? 0 : 1.4,   // subtle easing on desktop only
      smoothTouch: 0,               // never interpolate on touch
      normalizeScroll: true,
      effects: false,               // no parallax unless you turn it on explicitly
    });

    // Refresh after any media loads to lock layout
    const onWindowLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onWindowLoad);

    // Observe images inside smooth-content for first paint refresh
    const imgs = Array.from(document.querySelectorAll("#smooth-content img"));
    const refreshOnce = () => ScrollTrigger.refresh();
    imgs.forEach(img => img.addEventListener("load", refreshOnce, { once: true }));

    // Optional: route-height sanity trigger (helps when content injects)
    ScrollTrigger.create({
      id: "HOME_TMP",
      trigger: "#smooth-content",
      start: "top top",
      onRefresh: () => {}, // existence alone can help certain devtools resizes
    });

    return () => {
      window.removeEventListener("load", onWindowLoad);
      imgs.forEach(img => img.removeEventListener("load", refreshOnce));
      // Full cleanup in correct order
      const s = ScrollSmoother.get();
      if (s) s.kill();
      ScrollTrigger.getAll().forEach(t => t.kill(false));
      gsap.set("#smooth-content", { clearProps: "transform,willChange" });
    };
  }, { dependencies: [isTouch] });
    return(
        <div id="smooth-wrapper">
      <div id="smooth-content">
        {/* Make sure none of these contain sticky/fixed items.
            If they must, render those sticky/fixed bits via portals outside #smooth-content */}
        <HeroSection />
        <MessageSection />
        <FlavorSection />
        <NutritionSection />
        <BenefitSection />
        <TestimonialSection />
        <FooterSection />
      </div>
    </div>
    )
}

