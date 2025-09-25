// App.jsx
import { Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import HeroSection from "./sections/HeroSection";
import { ScrollSmoother, ScrollTrigger } from "gsap/all";
import gsap from "gsap";
import MessageSection from "./sections/MessageSection";
import FlavorSection from "./sections/FlavorSection";
import { useGSAP } from "@gsap/react";
import NutritionSection from "./sections/NutritionSection";
import BenefitSection from "./sections/BenefitSection";
import TestimonialSection from "./sections/TestimonialSection";
import FooterSection from "./sections/FooterSection";
import Product from "./page/shopNow/shop";
import Wishlist from "./page/wishlist/Wishlist";
import NotFound from "./page/error/NotFound";
import LoginPage from "./page/login/LoginPage";
import SignUpPage from "./page/register/SignUpPage";
import Loading from "./components/loading";
import { useEffect, useState } from "react";
import PrivacySection from "./page/privacy/PrivacyPage";
import ReturnRefundSection from "./page/return/ReturnRefundPage";
import TermSection from "./page/terms/TermPage";
import ContactPage from "./page/contact/ContactPage";
import AboutPage from "./page/about/AboutPage";
import AuthProvider from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import SessionsPage from "./page/account/SessionsPage";
import BMIPage from "./page/BMI/BMIPage";

// ✅ register once
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isHome = location.pathname === "/";

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Home page with smoother. Footer & NavBar live inside the scroll container.
  const HomePage = () => {
    useGSAP(() => {
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1.5,
        effects: true,
      });
      return () => smoother.kill(); // cleanup on route change
    }, []);

    return (
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <HeroSection />
          <MessageSection />
          <FlavorSection />
          <NutritionSection />
          <BenefitSection />
          <TestimonialSection />
          <FooterSection /> 
        </div>
      </div>
    );
  };

  return (
    <AuthProvider>
     <Toaster  reverseOrder={false} />
      <main>
        {loading && <Loading label="Please wait..." />}

        {/* Show global NavBar/Footer on non-home pages only */}
        {<NavBar />}

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<Product />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/sessions" element={<SessionsPage />} />
          </Route>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/terms" element={<TermSection />} />
          <Route path="/privacy" element={<PrivacySection />} />
          <Route path="/return" element={<ReturnRefundSection />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/bmi" element={<BMIPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        {!isHome && <FooterSection />}
      </main>
    </AuthProvider>
  );
};

export default App;
