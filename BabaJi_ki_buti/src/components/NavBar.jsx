// src/components/NavBar.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CartMenu from "../page/cart/CartMenu";
import { useAuth } from "../auth/AuthContext";
import { useMe } from "../auth/user/useMe";
import { wishlistApi } from "../auth/wishlist/wishlistApi"; // 👈 NEW
import SearchBar from "../utils/SearchBar";

export default function NavBar() {
  // ---------------------------- local state ----------------------------
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isTherapyOpen, setIsTherapyOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  // ✅ NEW: wishlist count
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
  const searchRef = useRef(null); // keep for desktop 2xl search

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
  const categories = [
    { name: "Energy & Stamina", icon: "/images/c1.png", path: "/oil" },
    { name: "Pain Relief", icon: "/images/c2.png", path: "/rice" },
    { name: "Hair & Skin Care", icon: "/images/c3.png", path: "/jaggery" },
    { name: "Digestive Health", icon: "/images/c4.png", path: "/spices" },
    { name: "Men's Health", icon: "/images/c5.png", path: "/immunity" },
    { name: "Women's Health", icon: "/images/c6.png", path: "/breakfast-snacks" },
    { name: "Weight Management", icon: "/images/c7.png", path: "/grains-pulses" },
    { name: "Specialized Health", icon: "/images/c7.png", path: "/grains-pulses" },
    { name: "Nutritional Supplements", icon: "/images/c7.png", path: "/grains-pulses" },
    { name: "Immunity & General Wellness", icon: "/images/c7.png", path: "/grains-pulses" },
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
      // Use the new count(userId)
      const c = await wishlistApi.count(userId);
      if (alive && Number.isFinite(+c)) setWishlistCount(+c);
    } catch {
      if (alive) setWishlistCount(0);
    }
  }

  fetchCount();

  const onChanged = (e) => {
    const d = e?.detail || {};
    // Ignore events from other users (multi-tab/multi-session safety)
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

  // ------------------------------- render ------------------------------
  return (
    <>
      {/* Keep below announcement bar (top-10). */}
      <header className="fixed inset-x-0 top-10 lg:top-0 z-50 bg-transparent pointer-events-none">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 mb-2 lg:mb-0 lg:mt-10">
          <div className="flex items-center justify-between gap-3 lg:gap-6 xl:gap-8 min-h-14 py-2 rounded-full bg-white/70 backdrop-blur-md shadow-lg lg:shadow-md ring-1 ring-black/5 px-2 sm:px-3 md:px-4 pointer-events-auto">
            {/* Brand */}
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              className="flex items-center gap-2 shrink-0"
            >
              <img src="/images/logoNav.gif" alt="nav-logo" className="h-8 sm:h-10 w-auto" />
            </Link>

            {/* Spacer to keep nav links away from logo on lg+ */}
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
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[min(92vw,1200px)] rounded-[32px] shadow-xl bg-white z-50 overflow-hidden border border-amber-100"
                    style={{ backgroundColor: "#fefcf8" }}
                  >
                    <div className="relative px-6 md:px-10 py-10 md:py-12">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 md:gap-8 mb-8">
                        {categories.map((category, i) => (
                          <a
                            key={i}
                            href={category.path}
                            onClick={(e) => {
                              e.preventDefault();
                              setIsCategoryOpen(false);
                              window.scrollTo({ top: 0, behavior: "instant" });
                            }}
                            className="group flex flex-col items-center text-center"
                            role="menuitem"
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
                          </a>
                        ))}
                      </div>
                      <div className="flex justify-center">
                        <a
                          href="/all-categories"
                          onClick={(e) => {
                            e.preventDefault();
                            setIsCategoryOpen(false);
                            window.scrollTo({ top: 0, behavior: "instant" });
                          }}
                          className="px-6 md:px-8 py-2.5 md:py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm font-semibold"
                        >
                          SHOP ALL
                        </a>
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
            <SearchBar/>
            {/* <div className="relative hidden 2xl:block" ref={searchRef}>
              <div className="relative w-full max-w-[22rem]">
                <svg
                  className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for products..."
                  className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
             
            </div> */}

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
              <div className="w-px h-6 2xl:h-8 bg-gray-200 hidden 2xl:block" />
              <CartMenu userId={userId} />

              {/* ✅ Desktop Wishlist with badge */}
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
                  <input
                    type="text"
                    placeholder="Search for products..."
                    className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
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
                        <Link
                          key={i}
                          to={c.path}
                          onClick={() => {
                            setIsCategoryOpen(false);
                            setIsMobileMenuOpen(false);
                            window.scrollTo({ top: 0, behavior: "instant" });
                          }}
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50"
                        >
                          <img src={c.icon} alt={c.name} className="h-10 w-10 object-contain" />
                          <span className="text-sm text-gray-700">{c.name}</span>
                        </Link>
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
                  {/* ✅ Mobile wishlist with badge */}
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
                        <path d="M11.645 20.91l-.007-.003-..." />
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
