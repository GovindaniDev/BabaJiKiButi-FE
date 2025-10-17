import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useMe } from "../auth/user/useMe"; // 👈 NEW
import CartMenu from "../page/cart/CartMenu";

export default function NavBar() {
  /* ---------------------------- local state ---------------------------- */
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
const [isTherapyOpen, setIsTherapyOpen] = useState(false);
const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [searchPos, setSearchPos] = useState({ top: 0, left: 0 });

  /* ---------------------------- element refs --------------------------- */
  const servicesRef = useRef(null);
  const servicesMenuRef = useRef(null);
  const therapyMenuRef = useRef(null);
  const categoryBtnRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const searchBtnRef = useRef(null);

  // first focusable items for a11y focus on open
  const firstServicesItemRef = useRef(null);
  const firstTherapyItemRef = useRef(null);

  // timers for gentle hover-open / hover-close
  const hoverTimers = useRef({ services: null, therapy: null, category: null });

  /* ------------------------------ cart mock ---------------------------- */
  const [cartItems] = useState([]);
  const cartCount = cartItems.reduce((n, it) => n + (it.qty || 1), 0);

  /* ------------------------------- helpers ----------------------------- */
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

  /* ----------------------------- positions ----------------------------- */
  useEffect(() => {
    if (!isSearchOpen || !searchBtnRef.current) return;
    const rect = searchBtnRef.current.getBoundingClientRect();
    const panelWidth = 384;
    const gap = 8;
    setSearchPos({ top: rect.bottom + gap, left: Math.max(8, rect.right - panelWidth) });
  }, [isSearchOpen]);

  /* -------------------------- outside click close ---------------------- */
  useEffect(() => {
    function onDocClick(e) {
      const t = e.target;
      if (servicesRef.current && !servicesRef.current.contains(t) && servicesMenuRef.current && !servicesMenuRef.current.contains(t)) {
        setIsServicesOpen(false);
        setIsTherapyOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(t) && categoryBtnRef.current && !categoryBtnRef.current.contains(t)) {
        setIsCategoryOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(t)) setIsSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(t)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  /* ----------------------- body scroll lock (mobile) ------------------- */
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isMobileMenuOpen]);

  /* ------------------------------ data --------------------------------- */
  const categories = [
    { name: "Energy & Stamina", icon: "/images/c1.png", path: "/oil" },
    { name: "Pain Relief", icon: "/images/c2.png", path: "/rice" },
    { name: "Hair & Skin Care", icon: "/images/c3.png", path: "/jaggery" },
    { name: "Digestive Health", icon: "/images/c4.png", path: "/spices" },
    { name: "Men’s Health", icon: "/images/c5.png", path: "/immunity" },
    { name: "Women’s Health", icon: "/images/c6.png", path: "/breakfast-snacks" },
    { name: "Weight Management", icon: "/images/c7.png", path: "/grains-pulses" },
    { name: "Specialized Health", icon: "/images/c7.png", path: "/grains-pulses" },
    { name: "Nutritional Supplements", icon: "/images/c7.png", path: "/grains-pulses" },
    { name: "Immunity & General Wellness", icon: "/images/c7.png", path: "/grains-pulses" },
  ];

  const handleCategoryClick = (path) => {
    setIsCategoryOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  };

  /* --------------------------- keyboard a11y --------------------------- */
  const onServicesKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setIsServicesOpen(false);
      setIsTherapyOpen(false);
      servicesRef.current?.focus();
    }
    if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !isServicesOpen) {
      e.preventDefault();
      setIsServicesOpen(true);
      setTimeout(() => firstServicesItemRef.current?.focus(), 0);
    }
  }, [isServicesOpen]);

  const onCategoryKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setIsCategoryOpen(false);
      categoryBtnRef.current?.focus();
    }
    if ((e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") && !isCategoryOpen) {
      e.preventDefault();
      setIsCategoryOpen(true);
    }
  }, [isCategoryOpen]);

  const onDocKeyDown = useCallback((e) => {
    if (e.key === "Escape") {
      setIsServicesOpen(false);
      setIsTherapyOpen(false);
      setIsCategoryOpen(false);
      setIsMobileMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onDocKeyDown);
    return () => document.removeEventListener("keydown", onDocKeyDown);
  }, [onDocKeyDown]);

  /* -------------------------------- auth ------------------------------- */
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { me } = useMe({ skip: !isAuthenticated });

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

  useEffect(() => {
    if (loading) return;
    if (isAuthenticated && (location.pathname === "/login" || location.pathname === "/register")) {
      navigate("/profile", { replace: true });
    }
  }, [loading, isAuthenticated, location.pathname, navigate]);

  /* ------------------------------- render ------------------------------ */
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-transparent pointer-events-none">
        <div className="container mx-auto px-3 sm:px-4 mt-10">
          <div className="grid grid-cols-[auto,1fr,auto] items-center gap-3 h-14 rounded-full bg-white/65 backdrop-blur-md shadow-md ring-1 ring-black/5 px-3 sm:px-4 pointer-events-auto">
            {/* Brand */}
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} className="flex items-center gap-2 shrink-0 col-start-1">
              <img src="/images/logoNav.gif" alt="nav-logo" className="h-10 w-auto" />
            </Link>

            {/* Desktop links */}
           <ul
  className={`hidden pl-2 lg:flex col-start-2 min-w-0 items-center gap-6 text-sm font-semibold text-gray-800 whitespace-nowrap flex-nowrap
    ${isServicesOpen || isCategoryOpen ? "overflow-visible" : "overflow-x-auto"}`}
  style={
    (isServicesOpen || isCategoryOpen)
      ? { WebkitMaskImage: "none" } // prevent mask from clipping dropdown
      : { WebkitMaskImage: "linear-gradient(90deg, transparent 0, #000 12px, #000 calc(100% - 12px), transparent 100%)" }
  }
>
              <li className="shrink-0"><Link to="/" className="hover:text-amber-700 " onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>HOME</Link></li>
              <li className="shrink-0"><Link to="/about" className="hover:text-amber-700 whitespace-nowrap" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>ABOUT US</Link></li>
              <li className="shrink-0"><Link to="/shop" className="hover:text-amber-700 whitespace-nowrap" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>SHOP NOW</Link></li>

              {/* ------------------------- SERVICES (dropdown) ------------------------- */}
              <li className="relative shrink-0">
  <button
    ref={servicesRef}
    onClick={() => setIsServicesOpen(v => !v)}
    onMouseEnter={() => isPointerFine() && openWithHover("services", setIsServicesOpen)}
    onMouseLeave={() => isPointerFine() && closeWithHover("services", setIsServicesOpen)}
    onKeyDown={onServicesKeyDown}
    aria-haspopup="menu"
    aria-expanded={isServicesOpen}
    className="inline-flex items-center gap-1 hover:text-amber-700 whitespace-nowrap"
  >
    SERVICES
    <svg className={`w-4 h-4 transition ${isServicesOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
      <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/>
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
      <Link to="/opd" ref={firstServicesItemRef}
        onClick={() => { setIsServicesOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
        className="block px-4 py-2 text-sm hover:bg-[#faeade]" role="menuitem">ओ.पी.डी. सेवाएं</Link>

      <Link to="/bmi" onClick={() => { setIsServicesOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
        className="block px-4 py-2 text-sm hover:bg-[#faeade]" role="menuitem">BMI Calculator</Link>

      <Link to="/dosha" onClick={() => { setIsServicesOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
        className="block px-4 py-2 text-sm hover:bg-[#faeade]" role="menuitem">Dosha Test</Link>

      {/* nested submenu */}
      <div
        className="relative group"
        onMouseEnter={() => isPointerFine() && openWithHover("therapy", setIsTherapyOpen)}
        onMouseLeave={() => isPointerFine() && closeWithHover("therapy", setIsTherapyOpen)}
      >
        <button
          onClick={() => setIsTherapyOpen(v => !v)}
          aria-haspopup="menu"
          aria-expanded={isTherapyOpen}
          className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-[#faeade]"
        >
          <span>Therapy Services</span>
          <svg className={`w-4 h-4 transition ${isTherapyOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"/>
          </svg>
        </button>

        {isTherapyOpen && (
          <div
            ref={therapyMenuRef}
            role="menu"
            className="absolute left-full top-0 ml-2 w-56 rounded-xl bg-white shadow-lg py-2 z-[60] border border-amber-100"
          >
            <Link to="/service/nutrient" ref={firstTherapyItemRef}
              onClick={() => { setIsServicesOpen(false); setIsTherapyOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
              className="block px-4 py-2 text-sm hover:bg-[#faeade]" role="menuitem">न्यूट्रीशंट</Link>
            <Link to="/service/remedios"
              onClick={() => { setIsServicesOpen(false); setIsTherapyOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
              className="block px-4 py-2 text-sm hover:bg-[#faeade]" role="menuitem">प्राकृतिक चिकित्सा</Link>
            <Link to="/service/therapy"
              onClick={() => { setIsServicesOpen(false); setIsTherapyOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
              className="block px-4 py-2 text-sm hover:bg-[#faeade]" role="menuitem">Tailor-Made Ayurvedic Therapy</Link>
          </div>
        )}
      </div>

      <Link to="/panchkarma" onClick={() => { setIsServicesOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
        className="block px-4 py-2 text-sm hover:bg-[#faeade]" role="menuitem">पंचकर्म</Link>

      <Link to="/naadi" onClick={() => { setIsServicesOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
        className="block px-4 py-2 text-sm hover:bg-[#faeade]" role="menuitem">नाड़ी परीक्षण</Link>
    </div>
  )}
</li>


              {/* ---------------------- CATEGORY (mega menu) ----------------------- */}
              <li className="relative shrink-0">
  <button
    ref={categoryBtnRef}
    className="inline-flex items-center gap-1 hover:text-amber-700 whitespace-nowrap"
    onClick={() => setIsCategoryOpen(v => !v)}
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
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[min(92vw,900px)] rounded-[32px] shadow-xl bg-white z-50 overflow-hidden border border-amber-100"
      style={{ backgroundColor: "#fefcf8" }}
    >
      <div className="relative px-6 md:px-10 py-10 md:py-12">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 md:gap-8 mb-8">
          {categories.map((category, i) => (
            <a
              key={i}
              href={category.path}
              onClick={(e) => { e.preventDefault(); setIsCategoryOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
              className="group flex flex-col items-center text-center"
              role="menuitem"
            >
              <div className="mx-auto h-16 w-16 rounded-full grid place-items-center bg-white border border-amber-100 shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:bg-amber-50">
                <img src={category.icon} alt={category.name} className="h-16 w-16 object-contain transition-transform duration-200 group-hover:scale-110" />
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
            onClick={(e) => { e.preventDefault(); setIsCategoryOpen(false); window.scrollTo({top:0,behavior:"instant"}); }}
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


              <li className="shrink-0"><Link to="/blog" className="hover:text-amber-700 whitespace-nowrap" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>OUR BLOGS</Link></li>
              <li className="shrink-0"><Link to="/contact" className="hover:text-amber-700 whitespace-nowrap" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>CONTACTS</Link></li>
            </ul>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-4 shrink-0 col-start-3 justify-self-end">
              <div className="relative" ref={searchRef}>
                <div className="relative w-full max-w-[18rem] md:max-w-[22rem] lg:max-w-[24rem] xl:max-w-[28rem]">
                  <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                  <input type="text" placeholder="Search for products..." className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 bg-white/80 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div className="w-px h-8 bg-gray-200" />
              <CartMenu userId={me?.id} cartItems={cartItems} />
              <Link to="/wishlist" className="p-2 rounded-full hover:bg-gray-100" aria-label="Wishlist" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}>
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.01a15.247 15.247 0 01-.383-.187 25.18 25.18 0 01-4.244-2.832C4.688 15.36 2.25 12.686 2.25 9.5 2.25 7.014 4.285 5 6.75 5c1.494 0 2.904.73 3.75 1.874A4.725 4.725 0 0114.25 5c2.465 0 4.5 2.014 4.5 4.5 0 3.186-2.438 5.86-4.739 8.378a25.175 25.175 0 01-4.244 2.832 15.247 15.247 0 01-.383.187l-.022.01-.007.003-.003.001a.75.75 0 01-.644 0l-.003-.001z" /></svg>
              </Link>

              {/* Profile */}
              <div className="relative" ref={profileRef}>
                <button onClick={() => setIsProfileOpen((v) => !v)} className="p-2 rounded-full hover:bg-gray-100" aria-label="User Profile" title={isAuthenticated ? `Hi, ${displayName}` : "Sign in"} disabled={loading}>
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
                </button>
                {isProfileOpen && !loading && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 text-xs text-gray-500">Signed in</div>
                        <Link to="/profile" onClick={() => { setIsProfileOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">{`Profile (${displayName})`}</Link>
                        <button onClick={handleLogout} disabled={isLoggingOut} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50">{isLoggingOut ? "Logging out…" : "Logout"}</button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" onClick={() => { setIsProfileOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Login</Link>
                        <Link to="/register" onClick={() => { setIsProfileOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Register</Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Mobile actions */}
            <div className="lg:hidden flex items-center gap-2 col-start-3 justify-self-end">
              <CartMenu userId={me?.id} cartItems={cartItems} />
              <button onClick={() => setIsMobileMenuOpen((v) => !v)} className="p-2 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px]" aria-label="Open menu">
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z"/></svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/></svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* -------------------------- Mobile drawer --------------------------- */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} />
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white/90 backdrop-blur-md border-l border-gray-200 overflow-y-auto pt-[96px]">
              <div className="px-4 py-3 space-y-2">
                <Link to="/" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">HOME</Link>
                <Link to="/about" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">ABOUT US</Link>
                <Link to="/shop" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">SHOP NOW</Link>

                {/* CATEGORY (mobile) */}
                <div>
                  <button onClick={() => setIsCategoryOpen((v) => !v)} className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">
                    <span>CATEGORY</span>
                    <svg className={`w-4 h-4 transition ${isCategoryOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isCategoryOpen && (
                    <div className="mt-1 ml-1 grid grid-cols-2 gap-2">
                      {categories.map((c, i) => (
                        <Link key={i} to={c.path} onClick={() => { setIsCategoryOpen(false); setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                          <img src={c.icon} alt={c.name} className="h-10 w-10 object-contain" />
                          <span className="text-sm text-gray-700">{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* SERVICES (mobile) */}
                <div>
                  <button onClick={() => setIsMobileServicesOpen((v) => !v)} className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">
                    <span>SERVICES</span>
                    <svg className={`w-4 h-4 transition ${isMobileServicesOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {isMobileServicesOpen && (
                    <div className="mt-1 ml-1 space-y-1">
                      <Link to="/opd" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">ओ.पी.डी. सेवाएं</Link>
                      <Link to="/bmi" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">BMI Calculator</Link>
                      <Link to="/dosha" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Dosha Test</Link>
                      <Link to="/service/nutrient" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">न्यूट्रीशंट</Link>
                      <Link to="/service/remedios" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">प्राकृतिक चिकित्सा</Link>
                      <Link to="/service/therapy" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Tailor-Made Ayurvedic Therapy</Link>
                      <Link to="/panchkarma" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">पंचकर्म</Link>
                      <Link to="/naadi" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">नाड़ी परीक्षण</Link>
                    </div>
                  )}
                </div>

                <Link to="/blog" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">OUR BLOGS</Link>
                <Link to="/contact" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">CONTACTS</Link>

                <div className="pt-2 border-t border-gray-200">
                  <Link to="/wishlist" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">
                    <span>Wishlist</span>
                  </Link>
                  <Link to="/cart" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">
                    <span>Cart</span>
                    <span className="min-w-[22px] h-[22px] px-1 rounded-full bg-yellow-500 text-white text-xs grid place-items-center">{cartCount}</span>
                  </Link>
                </div>

                <div className="pt-3 border-t border-gray-200">
                  {loading ? (
                    <div className="px-2 py-2 text-gray-500 text-sm">Checking session…</div>
                  ) : isAuthenticated ? (
                    <>
                      <Link to="/profile" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">{`Profile (${displayName})`}</Link>
                      <button onClick={handleLogout} disabled={isLoggingOut} className="w-full text-left px-2 py-2 rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50">{isLoggingOut ? "Logging out…" : "Logout"}</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">Login</Link>
                      <Link to="/register" onClick={() => { setIsMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">Register</Link>
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
