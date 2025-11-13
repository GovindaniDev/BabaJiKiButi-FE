// src/components/NavBar.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CartMenu from "../page/cart/CartMenu";
import { useAuth } from "../auth/AuthContext";
import { useMe } from "../auth/user/useMe";
import { wishlistApi } from "../auth/wishlist/wishlistApi";
import SearchBar from "../utils/SearchBar";
import styled from "styled-components";

export default function NavBar() {
  // ---------------------------- local state ----------------------------
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTherapyOpen, setIsTherapyOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // ✅ wishlist count
  const [wishlistCount, setWishlistCount] = useState(0);

  // ---------------------------- element refs ---------------------------
  const servicesRef = useRef(null);
  const servicesMenuRef = useRef(null);
  const therapyMenuRef = useRef(null);
  const categoryBtnRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const profileRef = useRef(null);
  const firstServicesItemRef = useRef(null);
  const firstTherapyItemRef = useRef(null);
  const searchRef = useRef(null);

  const hoverTimers = useRef({ services: null, therapy: null, category: null });

  // ------------------------------ cart mock ----------------------------
  const [cartItems] = useState([]);
  const cartCount = cartItems.reduce((n, it) => n + (it.qty || 1), 0);

  // ------------------------------- helpers -----------------------------
  const isPointerFine = () =>
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const openWithHover = (key, setter) => {
    clearTimeout(hoverTimers.current[key]);
    hoverTimers.current[key] = setTimeout(() => setter(true), 70);
  };
  const closeWithHover = (key, setter) => {
    clearTimeout(hoverTimers.current[key]);
    hoverTimers.current[key] = setTimeout(() => setter(false), 120);
  };

  // -------------------------- outside click close ----------------------
  useEffect(() => {
    function onDocClick(e) {
      const t = e.target;
      if (
        servicesRef.current &&
        !servicesRef.current.contains(t) &&
        servicesMenuRef.current &&
        !servicesMenuRef.current.contains(t)
      ) {
        setIsServicesOpen(false);
        setIsTherapyOpen(false);
      }
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(t) &&
        categoryBtnRef.current &&
        !categoryBtnRef.current.contains(t)
      ) {
        setIsCategoryOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(t))
        setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // ----------------------- body scroll lock (mobile) -------------------
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isMobileMenuOpen]);

  // ------------------------------ data ---------------------------------
  // If you have real category IDs from DB, put them here (replace null with the Long id).
  const categories = [
    { id: null, name: "Energy & Stamina",            icon: "/images/c1.png" },
    { id: null, name: "Pain Relief",                 icon: "/images/c2.png" },
    { id: null, name: "Hair & Skin Care",            icon: "/images/c3.png" },
    { id: null, name: "Digestive Health",            icon: "/images/c4.png" },
    { id: null, name: "Men's Health",                icon: "/images/c5.png" },
    { id: null, name: "Women's Health",              icon: "/images/c6.png" },
    { id: null, name: "Weight Management",           icon: "/images/c7.png" },
    { id: null, name: "Specialized Health",          icon: "/images/c7.png" },
    { id: null, name: "Nutritional Supplements",     icon: "/images/c7.png" },
    { id: null, name: "Immunity & General Wellness", icon: "/images/c7.png" },
  ];

  // --------------------------- keyboard a11y ---------------------------
  const onServicesKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        setIsServicesOpen(false);
        setIsTherapyOpen(false);
        servicesRef.current?.focus();
      }
      if (
        (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") &&
        !isServicesOpen
      ) {
        e.preventDefault();
        setIsServicesOpen(true);
        setTimeout(() => firstServicesItemRef.current?.focus(), 0);
      }
    },
    [isServicesOpen]
  );

  const onCategoryKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") {
        setIsCategoryOpen(false);
        categoryBtnRef.current?.focus();
      }
      if (
        (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") &&
        !isCategoryOpen
      ) {
        e.preventDefault();
        setIsCategoryOpen(true);
      }
    },
    [isCategoryOpen]
  );

  // -------------------------------- auth -------------------------------
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { me } = useMe({ skip: !isAuthenticated });
  const userId = me?.id ?? user?.id ?? null;
  const displayName =
    (me?.name && String(me.name).trim()) ||
    (user?.name && String(user.name).trim()) ||
    (user?.email && String(user.email).split("@")[0]) ||
    "User";

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await logout();
      setIsProfileOpen(false);
      navigate("/", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const authReady = !loading && (isAuthenticated && !!userId);

  // ------------------------ wishlist navigation ------------------------
  const onWishlistClick = (e) => {
    e?.preventDefault?.();
    if (loading) return;
    if (authReady) navigate("/wishlist");
    else navigate("/login", { state: { from: "/wishlist" } });
  };

  // ------------------------- wishlist count sync ------------------------
  useEffect(() => {
    let alive = true;

    async function fetchCount() {
      if (!authReady) {
        if (alive) setWishlistCount(0);
        return;
      }
      try {
        const c = await wishlistApi.count(userId);
        if (alive && Number.isFinite(+c)) setWishlistCount(+c);
      } catch {
        if (alive) setWishlistCount(0);
      }
    }

    fetchCount();

    const onChanged = (e) => {
      const d = e?.detail || {};
      if (authReady && d.userId && String(d.userId) !== String(userId)) return;

      if (typeof d.count === "number") {
        setWishlistCount(d.count);
      } else {
        fetchCount();
      }
    };

    window.addEventListener("wishlist:changed", onChanged);
    return () => {
      alive = false;
      window.removeEventListener("wishlist:changed", onChanged);
    };
  }, [authReady, userId]);

  // -------------------------- auth redirects ---------------------------
  useEffect(() => {
    if (loading) return;
    if (
      isAuthenticated &&
      (location.pathname === "/login" || location.pathname === "/register")
    ) {
      navigate("/profile", { replace: true });
    }
  }, [loading, isAuthenticated, location.pathname, navigate]);

  // -------------------------- WhatsApp button --------------------------
  const waNumber = "919873033339"; // your number
  const waMessage = `Hi Baba Ji Ki Buti! I want to know more about...`;
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;

  // -------------------------- Ask AI button ----------------------------
  const handleOpenAI = () => {
    try {
      navigate("/assistant");
    } catch {
      console.log("Open AI Assistant");
    }
  };

  // helper to go to a category (keeps scroll + closes menus)
  const goToCategory = (cat) => {
    const { id, name } = cat || {};
    setIsCategoryOpen(false);
    setIsMobileMenuOpen(false);
    if (id != null) {
      navigate(`/shop?categoryId=${encodeURIComponent(id)}&category=${encodeURIComponent(name || "")}`);
    } else {
      navigate(`/shop?category=${encodeURIComponent(name || "")}`);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  // ------------------------------- render ------------------------------
  return (
    <>
      {/* Announcement bar offset */}
      <header className="fixed inset-x-0 top-10 lg:top-0 z-50 bg-transparent pointer-events-none">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 mb-2 lg:mb-0 lg:mt-10">
          <div className="flex items-center justify-between gap-3 lg:gap-6 xl:gap-8 min-h-14 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-lg lg:shadow-md ring-1 ring-black/5 px-2 sm:px-3 md:px-4 pointer-events-auto">
            {/* Brand */}
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              className="flex items-center gap-2 shrink-0"
            >
              <img src="/images/logo2.png" alt="nav-logo" className="h-8 sm:h-10 w-auto" />
            </Link>

            {/* Spacer */}
            <div className="hidden lg:block w-6 xl:w-8 shrink-0" aria-hidden />

            {/* Desktop links */}
            <ul
              className={`hidden lg:flex min-w-0 items-center gap-4 xl:gap-6 lg:pl-6 xl:pl-10 text-sm font-semibold text-gray-800 whitespace-nowrap ${
                isServicesOpen || isCategoryOpen ? "overflow-visible" : "overflow-hidden"
              }`}
            >
              <li className="shrink-0">
                <Link to="/" className="hover:text-amber-700" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                  HOME
                </Link>
              </li>
              <li className="shrink-0">
                <Link to="/about" className="hover:text-amber-700" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                  ABOUT US
                </Link>
              </li>
              <li className="shrink-0">
                <Link to="/shop" className="hover:text-amber-700" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                  SHOP NOW
                </Link>
              </li>

              {/* SERVICES */}
              <li className="relative shrink-0">
                <button
                  ref={servicesRef}
                  onClick={() => setIsServicesOpen((v) => !v)}
                  onMouseEnter={() => isPointerFine() && openWithHover("services", setIsServicesOpen)}
                  onMouseLeave={() => isPointerFine() && closeWithHover("services", setIsServicesOpen)}
                  onKeyDown={onServicesKeyDown}
                  aria-haspopup="menu"
                  aria-expanded={isServicesOpen}
                  className="inline-flex items-center gap-1 hover:text-amber-700"
                >
                  SERVICES
                  <svg className={`w-4 h-4 transition ${isServicesOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                  </svg>
                </button>

                {isServicesOpen && (
                  <div
                    ref={servicesMenuRef}
                    onMouseEnter={() => isPointerFine() && openWithHover("services", setIsServicesOpen)}
                    onMouseLeave={() => isPointerFine() && closeWithHover("services", setIsServicesOpen)}
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg py-2 z-50 border border-amber-100"
                  >
                    <Link
                      to="/opd"
                      ref={firstServicesItemRef}
                      onClick={() => {
                        setIsServicesOpen(false);
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }}
                      className="block px-4 py-2 text-sm hover:bg-[#faeade]"
                      role="menuitem"
                    >
                      ओ.पी.डी. सेवाएं
                    </Link>
                    <Link
                      to="/bmi"
                      onClick={() => {
                        setIsServicesOpen(false);
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }}
                      className="block px-4 py-2 text-sm hover:bg-[#faeade]"
                      role="menuitem"
                    >
                      BMI Calculator
                    </Link>
                    <Link
                      to="/dosha"
                      onClick={() => {
                        setIsServicesOpen(false);
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }}
                      className="block px-4 py-2 text-sm hover:bg-[#faeade]"
                      role="menuitem"
                    >
                      Dosha Test
                    </Link>

                    {/* nested therapy submenu */}
                    <div
                      className="relative group"
                      onMouseEnter={() => isPointerFine() && openWithHover("therapy", setIsTherapyOpen)}
                      onMouseLeave={() => isPointerFine() && closeWithHover("therapy", setIsTherapyOpen)}
                    >
                      <button
                        onClick={() => setIsTherapyOpen((v) => !v)}
                        aria-haspopup="menu"
                        aria-expanded={isTherapyOpen}
                        className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-[#faeade]"
                      >
                        <span>Therapy Services</span>
                        <svg className={`w-4 h-4 transition ${isTherapyOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                          <path d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" />
                        </svg>
                      </button>

                      {isTherapyOpen && (
                        <div
                          ref={therapyMenuRef}
                          role="menu"
                          className="absolute left-full top-0 ml-2 w-56 rounded-xl bg-white shadow-lg py-2 z-[60] border border-amber-100"
                        >
                          <Link
                            to="/service/nutrient"
                            ref={firstTherapyItemRef}
                            onClick={() => {
                              setIsServicesOpen(false);
                              setIsTherapyOpen(false);
                              window.scrollTo({ top: 0, behavior: "instant" });
                            }}
                            className="block px-4 py-2 text-sm hover:bg-[#faeade]"
                            role="menuitem"
                          >
                            न्यूट्रीशंट
                          </Link>
                          <Link
                            to="/service/remedios"
                            onClick={() => {
                              setIsServicesOpen(false);
                              setIsTherapyOpen(false);
                              window.scrollTo({ top: 0, behavior: "instant" });
                            }}
                            className="block px-4 py-2 text-sm hover:bg-[#faeade]"
                            role="menuitem"
                          >
                            प्राकृतिक चिकित्सा
                          </Link>
                          <Link
                            to="/service/therapy"
                            onClick={() => {
                              setIsServicesOpen(false);
                              setIsTherapyOpen(false);
                              window.scrollTo({ top: 0, behavior: "instant" });
                            }}
                            className="block px-4 py-2 text-sm hover:bg-[#faeade]"
                            role="menuitem"
                          >
                            Tailor-Made Ayurvedic Therapy
                          </Link>
                        </div>
                      )}
                    </div>

                    <Link
                      to="/panchkarma"
                      onClick={() => {
                        setIsServicesOpen(false);
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }}
                      className="block px-4 py-2 text-sm hover:bg-[#faeade]"
                      role="menuitem"
                    >
                      पंचकर्म
                    </Link>
                    <Link
                      to="/naadi"
                      onClick={() => {
                        setIsServicesOpen(false);
                        window.scrollTo({ top: 0, behavior: "instant" });
                      }}
                      className="block px-4 py-2 text-sm hover:bg-[#faeade]"
                      role="menuitem"
                    >
                      नाड़ी परीक्षण
                    </Link>
                  </div>
                )}
              </li>

              {/* CATEGORY */}
              <li className="relative shrink-0">
                <button
                  ref={categoryBtnRef}
                  className="inline-flex items-center gap-1 hover:text-amber-700"
                  onClick={() => setIsCategoryOpen((v) => !v)}
                  onMouseEnter={() => isPointerFine() && openWithHover("category", setIsCategoryOpen)}
                  onMouseLeave={() => isPointerFine() && closeWithHover("category", setIsCategoryOpen)}
                  onKeyDown={onCategoryKeyDown}
                  aria-haspopup="menu"
                  aria-expanded={isCategoryOpen}
                >
                  CATEGORY
                  <svg className={`w-4 h-4 transition ${isCategoryOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCategoryOpen && (
                  <div
                    ref={categoryMenuRef}
                    onMouseEnter={() => isPointerFine() && openWithHover("category", setIsCategoryOpen)}
                    onMouseLeave={() => isPointerFine() && closeWithHover("category", setIsCategoryOpen)}
                    role="menu"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 rounded-[32px] shadow-xl bg-white z-50 overflow-hidden border border-amber-100"
                    style={{ backgroundColor: "#fefcf8", width: "min(92vw, 1200px)" }}
                  >
                    <div className="relative px-6 md:px-10 py-10 md:py-12">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 md:gap-8 mb-8">
                        {categories.map((category, i) => (
                          <button
                            key={i}
                            onClick={() => goToCategory(category)}
                            className="group flex flex-col items-center text-center"
                            role="menuitem"
                            type="button"
                          >
                            <div className="mx-auto h-16 w-16 rounded-full grid place-items-center bg-white border border-amber-100 shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:bg-amber-50">
                              <img
                                src={category.icon}
                                alt={category.name}
                                className="h-16 w-16 object-contain transition-transform duration-200 group-hover:scale-110"
                              />
                            </div>
                            <span className="mt-3 text-xs md:text-sm font-semibold text-[#5a6d52] leading-tight max-w-[120px] group-hover:text-amber-700 transition-colors">
                              {category.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <Link
                          to="/shop"
                          onClick={() => {
                            setIsCategoryOpen(false);
                            window.scrollTo({ top: 0, behavior: "instant" });
                          }}
                          className="px-6 md:px-8 py-2.5 md:py-3 
               border border-[#f6cfc0]
               text-[#9f4c4c] rounded-xl 
               font-semibold text-sm tracking-wide
               bg-white/60 backdrop-blur-sm
               hover:bg-[#faeade]/90 hover:text-[#6a2c2c]
               shadow-sm hover:shadow-md
               transition-all duration-200"
                        >
                          SHOP ALL
                        </Link>
                      </div>
                    </div>
                    <div className="relative h-16 md:h-20">
                      <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                        <path d="M0 60 Q150 20 300 60 T600 60 T900 60 T1200 60 V120 H0Z" fill="#f9ebd7" opacity="0.45" />
                        <path d="M0 80 Q150 50 300 80 T600 80 T900 80 T1200 80 V120 H0Z" fill="#f5e1c8" opacity="0.65" />
                        <path d="M0 95 Q150 75 300 95 T600 95 T900 95 T1200 95 V120 H0Z" fill="#f2dcc4" />
                      </svg>
                    </div>
                  </div>
                )}
              </li>

              <li className="shrink-0">
                <Link to="/blog" className="hover:text-amber-700" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                  JOIN COMMUNITY
                </Link>
              </li>
              <li className="shrink-0">
                <Link to="/contact" className="hover:text-amber-700" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                  CONTACTS
                </Link>
              </li>
            </ul>

            {/* Desktop search (≥2xl) */}
            <SearchBar ref={searchRef} />

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
              <div className="w-px h-6 2xl:h-8 bg-gray-200 hidden 2xl:block" />
              <CartMenu userId={userId} />

              {/* Wishlist with badge */}
              <button
                type="button"
                onClick={onWishlistClick}
                className="relative p-1.5 xl:p-2 rounded-full hover:bg-gray-100 disabled:opacity-50"
                aria-label="Wishlist"
                disabled={loading}
                title={authReady ? "Wishlist" : (loading ? "Checking session…" : "Sign in to view Wishlist")}
              >
                <svg className="w-4 xl:w-5 h-4 xl:h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.645 20.91l-.007-.003-.022-.01a15.247 15.247 0 01-.383-.187 25.18 25.18 0 01-4.244-2.832C4.688 15.36 2.25 12.686 2.25 9.5 2.25 7.014 4.285 5 6.75 5c1.494 0 2.904.73 3.75 1.874A4.725 4.725 0 0114.25 5c2.465 0 4.5 2.014 4.5 4.5 0 3.186-2.438 5.86-4.739 8.378a25.175 25.175 0 01-4.244 2.832 15.247 15.247 0 01-.383.187l-.022.01-.007.003-.003.001a.75.75 0 01-.644 0l-.003-.001z" />
                </svg>

                {wishlistCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f2bfb0] text-white text-[10px] leading-[18px] grid place-items-center"
                    aria-label={`${wishlistCount} items in wishlist`}
                  >
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen((v) => !v)}
                  className="p-1.5 xl:p-2 rounded-full hover:bg-gray-100"
                  aria-label="User Profile"
                  title={isAuthenticated ? `Hi, ${displayName}` : "Sign in"}
                  disabled={loading}
                >
                  <svg className="w-4 xl:w-5 h-4 xl:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                </button>
                {isProfileOpen && !loading && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 text-xs text-gray-500">Signed in</div>
                        <Link
                          to="/profile"
                          onClick={() => {
                            setIsProfileOpen(false);
                            window.scrollTo({ top: 0, behavior: "instant" });
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          {`Profile (${displayName})`}
                        </Link>
                        <button
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          {isLoggingOut ? "Logging out…" : "Logout"}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => {
                            setIsProfileOpen(false);
                            window.scrollTo({ top: 0, behavior: "instant" });
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Login
                        </Link>
                        <Link
                          to="/register"
                          onClick={() => {
                            setIsProfileOpen(false);
                            window.scrollTo({ top: 0, behavior: "instant" });
                          }}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile actions */}
            <div className="lg:hidden flex items-center gap-1 sm:gap-2 shrink-0">
              <CartMenu cartItems={cartItems} />
              <button
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                className="p-2 rounded-full hover:bg-gray-100 min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px]"
                aria-label="Open menu"
              >
                {isMobileMenuOpen ? (
                  <svg className="w-5 sm:w-6 h-5 sm:h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" />
                  </svg>
                ) : (
                  <svg className="w-5 sm:w-6 h-5 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[80]">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            {/* Drawer */}
            <div
              className="absolute right-0 top-0 h-full w-full max-w-[min(85vw,420px)] bg-white shadow-xl overflow-y-auto overscroll-contain z-50 pointer-events-auto"
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between z-10">
                <span className="font-semibold text-gray-800">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" />
                  </svg>
                </button>
              </div>

              {/* Search ONLY in drawer */}
              <div className="px-4 pt-3">
                <div className="relative">
                  <svg
                    className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <SearchBar />
                </div>
              </div>

              {/* Drawer content */}
              <div className="px-4 py-3 space-y-2 pb-24">
                <NavMobileLink to="/" onDone={() => setIsMobileMenuOpen(false)}>
                  HOME
                </NavMobileLink>
                <NavMobileLink to="/about" onDone={() => setIsMobileMenuOpen(false)}>
                  ABOUT US
                </NavMobileLink>
                <NavMobileLink to="/shop" onDone={() => setIsMobileMenuOpen(false)}>
                  SHOP NOW
                </NavMobileLink>

                {/* CATEGORY (mobile) */}
                <div>
                  <button
                    onClick={() => setIsCategoryOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
                  >
                    <span>CATEGORY</span>
                    <svg className={`w-4 h-4 transition ${isCategoryOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isCategoryOpen && (
                    <div className="mt-1 ml-1 grid grid-cols-2 gap-2">
                      {categories.map((c, i) => (
                        <button
                          key={i}
                          onClick={() => goToCategory(c)}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
                          type="button"
                        >
                          <img src={c.icon} alt={c.name} className="h-10 w-10 object-contain" />
                          <span className="text-sm text-gray-700">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* SERVICES (mobile) */}
                <div>
                  <button
                    onClick={() => setIsMobileServicesOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
                  >
                    <span>SERVICES</span>
                    <svg className={`w-4 h-4 transition ${isMobileServicesOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isMobileServicesOpen && (
                    <div className="mt-1 ml-1 space-y-1">
                      <NavMobileLink to="/opd" onDone={() => setIsMobileMenuOpen(false)}>
                        ओ.पी.डी. सेवाएं
                      </NavMobileLink>
                      <NavMobileLink to="/bmi" onDone={() => setIsMobileMenuOpen(false)}>
                        BMI Calculator
                      </NavMobileLink>
                      <NavMobileLink to="/dosha" onDone={() => setIsMobileMenuOpen(false)}>
                        Dosha Test
                      </NavMobileLink>
                      <NavMobileLink to="/service/nutrient" onDone={() => setIsMobileMenuOpen(false)}>
                        न्यूट्रीशंट
                      </NavMobileLink>
                      <NavMobileLink to="/service/remedios" onDone={() => setIsMobileMenuOpen(false)}>
                        प्राकृतिक चिकित्सा
                      </NavMobileLink>
                      <NavMobileLink to="/service/therapy" onDone={() => setIsMobileMenuOpen(false)}>
                        Tailor-Made Ayurvedic Therapy
                      </NavMobileLink>
                      <NavMobileLink to="/panchkarma" onDone={() => setIsMobileMenuOpen(false)}>
                        पंचकर्म
                      </NavMobileLink>
                      <NavMobileLink to="/naadi" onDone={() => setIsMobileMenuOpen(false)}>
                        नाड़ी परीक्षण
                      </NavMobileLink>
                    </div>
                  )}
                </div>

                <NavMobileLink to="/blog" onDone={() => setIsMobileMenuOpen(false)}>
                  OUR BLOGS
                </NavMobileLink>
                <NavMobileLink to="/contact" onDone={() => setIsMobileMenuOpen(false)}>
                  CONTACTS
                </NavMobileLink>

                <div className="pt-2 border-t border-gray-200">
                  {/* Mobile wishlist with badge */}
                  <button
                    type="button"
                    onClick={(e) => {
                      onWishlistClick(e);
                      setIsMobileMenuOpen(false);
                    }}
                    className="relative flex items-center justify-between w-full px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
                    aria-label="Wishlist"
                    disabled={loading}
                    title={authReady ? "Wishlist" : (loading ? "Checking session…" : "Sign in to view Wishlist")}
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.645 20.91l-.007-.003-.022-.01a15.247 15.247 0 01-.383-.187 25.18 25.18 0 01-4.244-2.832C4.688 15.36 2.25 12.686 2.25 9.5 2.25 7.014 4.285 5 6.75 5c1.494 0 2.904.73 3.75 1.874A4.725 4.725 0 0114.25 5c2.465 0 4.5 2.014 4.5 4.5 0 3.186-2.438 5.86-4.739 8.378a25.175 25.175 0 01-4.244 2.832 15.247 15.247 0 01-.383.187l-.022.01-.007.003-.003.001a.75.75 0 01-.644 0l-.003-.001z" />
                      </svg>
                      <span>Wishlist</span>
                    </span>
                    <span className="min-w-[22px] h-[22px] px-1 rounded-full bg-rose-600 text-white text-xs grid place-items-center">
                      {wishlistCount > 99 ? "99+" : wishlistCount}
                    </span>
                  </button>

                  <Link
                    to="/cart"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "instant" });
                    }}
                    className="flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
                  >
                    <span>Cart</span>
                    <span className="min-w-[22px] h-[22px] px-1 rounded-full bg-yellow-500 text-white text-xs grid place-items-center">
                      {cartCount}
                    </span>
                  </Link>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  {loading ? (
                    <div className="px-2 py-2 text-gray-500 text-sm">Checking session…</div>
                  ) : isAuthenticated ? (
                    <>
                      <NavMobileLink to="/profile" onDone={() => setIsMobileMenuOpen(false)}>
                        {`Profile (${displayName})`}
                      </NavMobileLink>
                      <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full text-left px-2 py-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {isLoggingOut ? "Logging out…" : "Logout"}
                      </button>
                    </>
                  ) : (
                    <>
                      <NavMobileLink to="/login" onDone={() => setIsMobileMenuOpen(false)}>
                        Login
                      </NavMobileLink>
                      <NavMobileLink to="/register" onDone={() => setIsMobileMenuOpen(false)}>
                        Register
                      </NavMobileLink>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Floating WhatsApp Button */}
      <WhatsAppFab href={waHref} />

      {/* Floating Ask AI Button */}
      <AIFab onClick={handleOpenAI} />
    </>
  );
}

/* ------------------------------- helpers ------------------------------- */
function NavMobileLink({ to, children, onDone, className = "" }) {
  return (
    <Link
      to={to}
      onClick={() => {
        onDone?.();
        window.scrollTo({ top: 0, behavior: "instant" });
      }}
      className={`block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50 ${className}`}
    >
      {children}
    </Link>
  );
}

/* =================== New WhatsApp FAB (expandable) =================== */
function WhatsAppFab({ href }) {
  return (
    <WhatsAppWrapper className="fixed right-4 bottom-4 md:right-6 md:bottom-6 z-[70]">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        title="Chat with us on WhatsApp"
        className="Btn"
      >
        <div className="sign">
          <svg className="socialSvg whatsappSvg" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z" />
          </svg>
        </div>
        <div className="text">Whatsapp</div>
      </a>
    </WhatsAppWrapper>
  );
}

const WhatsAppWrapper = styled.div`
  pointer-events: auto;

  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: 0.3s;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.199);
    background-color: #00d757;
    text-decoration: none;
  }

  .sign {
    width: 100%;
    transition-duration: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sign svg {
    width: 25px;
  }

  .sign svg path {
    fill: white;
  }

  .text {
    position: absolute;
    right: 0%;
    width: 0%;
    opacity: 0;
    color: white;
    font-size: 1.1em;
    font-weight: 600;
    transition-duration: 0.3s;
    letter-spacing: 0.2px;
  }

  .Btn:hover {
    width: 150px;
    border-radius: 40px;
    transition-duration: 0.3s;
  }

  .Btn:hover .sign {
    width: 30%;
    transition-duration: 0.3s;
    padding-left: 10px;
  }

  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: 0.3s;
    padding-right: 10px;
  }

  .Btn:active {
    transform: translate(2px, 2px);
  }

  @media (hover: none) and (pointer: coarse) {
    .Btn:focus,
    .Btn:active {
      width: 150px;
      border-radius: 40px;
    }
    .Btn:focus .sign,
    .Btn:active .sign {
      width: 30%;
      padding-left: 10px;
    }
    .Btn:focus .text,
    .Btn:active .text {
      opacity: 1;
      width: 70%;
      padding-right: 10px;
    }
  }
`;

/* =================== Ask AI FAB (mirrors WhatsApp behavior) =================== */
function AIFab({ onClick, label = "Ask AI" }) {
  return (
    <AIFabWrapper className="fixed left-4 bottom-4 md:left-6 md:bottom-6 z-[70]">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className="Btn"
      >
        <div className="sign">
          <svg viewBox="0 0 24 24" className="aiSvg" aria-hidden="true">
            <g fill="currentColor">
              <path d="M19 2a1 1 0 0 1 .9.56l.35 1.03 1.03.35a1 1 0 0 1 0 1.89l-1.03.35-.35 1.03a1 1 0 0 1-1.89 0l-.35-1.03-1.03-.35a1 1 0 0 1 0-1.89l1.03-.35.35-1.03A1 1 0 0 1 19 2Z"/>
              <path d="M9.107 5.448c.598-1.75 3.016-1.803 3.725-.159l.867 2.52a4 4 0 0 0 2.493 2.492l2.52.867c1.75.598 1.803 3.016.16 3.725l-2.52.867a4 4 0 0 0-2.492 2.493l-.867 2.52c-.598 1.75-3.016 1.803-3.724.16l-.868-2.52A4 4 0 0 0 5.748 16.3l-2.52-.868c-1.75-.598-1.803-3.016-.159-3.724l2.52-.868a4 4 0 0 0 2.493-2.492z"/>
            </g>
          </svg>
        </div>
        <div className="text">{label}</div>
      </button>
    </AIFabWrapper>
  );
}

const AIFabWrapper = styled.div`
  pointer-events: auto;

  .Btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    width: 45px;
    height: 45px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition-duration: 0.3s;
    box-shadow: 2px 2px 10px rgba(0,0,0,0.199);
    background: #111;
    color: #fff;
  }

  .sign {
    width: 100%;
    transition-duration: 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .aiSvg {
    width: 25px;
    height: 25px;
  }

  .text {
    position: absolute,
    right: 0%,
    width: 0%,
    opacity: 0,
    color: white,
    font-size: 1.05em,
    font-weight: 600,
    transition-duration: 0.3s,
    letter-spacing: 0.2px,
    white-space: nowrap;
  }

  .Btn:hover {
    width: 150px;
    border-radius: 40px;
    transition-duration: 0.3s;
  }
  .Btn:hover .sign {
    width: 30%;
    transition-duration: 0.3s;
    padding-left: 10px;
  }
  .Btn:hover .text {
    opacity: 1;
    width: 70%;
    transition-duration: 0.3s;
    padding-right: 10px;
  }

  .Btn:active {
    transform: translate(2px, 2px);
  }

  @media (hover: none) and (pointer: coarse) {
    .Btn:focus,
    .Btn:active {
      width: 150px;
      border-radius: 40px;
    }
    .Btn:focus .sign,
    .Btn:active .sign {
      width: 30%;
      padding-left: 10px;
    }
    .Btn:focus .text,
    .Btn:active .text {
      opacity: 1;
      width: 70%;
      padding-right: 10px;
    }
  }
`;
