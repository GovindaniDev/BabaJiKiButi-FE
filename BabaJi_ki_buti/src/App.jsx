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
import ReturnRefundSection from "./page/returns/ReturnRefundPage";
import TermSection from "./page/terms/TermPage";
import ContactPage from "./page/contact/ContactPage";
import AboutPage from "./page/about/AboutPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import SessionsPage from "./page/account/SessionsPage";
import BMIPage from "./page/BMI/BMIPage";
import NutrientPage from "./page/service/Nutrient/NutrientPage";
import PanchkarmaPage from "./page/panchkarma/PanchkarmaPage";
import OPDPage from "./page/OPD/OPDPage";
import NaadiPage from "./page/naadi/NaadiPage";
import RemediosPage from "./page/service/remedios/RemediosPage";
import TherapyPage from "./page/service/therapy/TherapyPage";
import ProductCatalog from "./components/(admin)/src/component/catalog/ProductCatalog";
import DashboardBody from "./components/(admin)/src/component/Dashboard";
import AdminShell from "./components/(admin)/AdminShell";
import CatalogPage from "./page/admin/catalog/CatalogPage";
import InventoryPage from "./page/admin/inventory/InventoryPage";
import PricingPage from "./page/admin/pricing/PricingPage";
import OrderPage from "./page/admin/orders/OrderPage";
import DoshaPage from "./page/dosha/DoshaPage";
import AddProductPage from "./page/admin/catalog/AddProdPage";
import PDPpage from "./page/shopNow/products/PDPpage";
import ReturnPage from "./page/admin/return/ReturnPage";
import CustomerPage from "./page/admin/users/CustomerPage";
import CouponPage from "./page/admin/pricing/coupon/CouponPage";
import AddStockPage from "./page/admin/inventory/AddStockPage";
import CartPage from "./components/cart/CartPage";
import AccountPage from "./page/profile/AccountPage";
import RequireAdmin from "./auth/RequireAuth";
import AddressPage from "./page/address/AddressPage";
import { useMe } from "./auth/user/useMe";
import CartSection from "./page/cart/CartPage";
import PaymentPage from "./page/payment/paymentPage";
import ThankYou from "./page/order/ThankYou";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

const App = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isAdminRoute = location.pathname.startsWith("/admin");

  // ✅ now this runs inside AuthProvider (moved to main.jsx)
  const { me, loading: meLoading } = useMe();
  const userId = me?.id ?? null;

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const HomePage = () => {
    useGSAP(() => {
      const smoother = ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 2.3,
        effects: true,
      });
      return () => smoother.kill();
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

  // Optional: block routes until we know auth
  if (meLoading) return <Loading label="Loading account..." />;

  return (
    <>
      <Toaster reverseOrder={false} />
      <main>
        {loading && <Loading label="Please wait..." />}

        {!isAdminRoute && <NavBar />}

        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<Product userId={userId} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/terms" element={<TermSection />} />
          <Route path="/privacy" element={<PrivacySection />} />
          <Route path="/return" element={<ReturnRefundSection />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/bmi" element={<BMIPage />} />
          <Route path="/dosha" element={<DoshaPage />} />
          <Route path="/opd" element={<OPDPage />} />
          <Route path="/service/nutrient" element={<NutrientPage />} />
          <Route path="/panchkarma" element={<PanchkarmaPage />} />
          <Route path="/naadi" element={<NaadiPage />} />
          <Route path="/service/remedios" element={<RemediosPage />} />
          <Route path="/service/therapy" element={<TherapyPage />} />
          <Route path="/cart" element={<CartSection userId={userId} />} />
          <Route path="/order/thank-you" element={<ThankYou />} />
          {/* User Account */}
          <Route path="/profile" element={<AccountPage />} />

          {/* Admin (role-restricted) */}
          <Route element={<RequireAdmin />}>
            <Route path="/admin" element={<AdminShell />}>
              <Route index element={<DashboardBody />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="pricing" element={<PricingPage />} />
              <Route path="orders" element={<OrderPage />} />
              <Route path="catalog/AddProdPage" element={<AddProductPage />} />
              <Route path="returns" element={<ReturnPage />} />
              <Route path="users" element={<CustomerPage />} />
              <Route path="pricing/coupon/CouponPage" element={<CouponPage />} />
              <Route path="inventory/AddStockPage" element={<AddStockPage />} />
            </Route>
          </Route>

          {/* Authed-only (non-admin) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/address" element={<AddressPage/>} />
            <Route path="/payment" element={<PaymentPage />} />
          </Route>

          {/* Product Pages */}
          <Route path="/products/:slug" element={<PDPpage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {!isAdminRoute && !isHome && <FooterSection />}
      </main>
    </>
  );
};

export default App;
