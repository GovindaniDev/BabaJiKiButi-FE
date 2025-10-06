/*  NavBar.jsx  ––– bootstrap-skin, mobile-safe, desktop ≡ mobile items  */
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import CartMenu from "../page/cart/CartMenu";

export default function NavBar() {
  /* ******  EVERYTHING BELOW IS 100 % YOUR OLD CODE  ****** */
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);
  const searchBtnRef = useRef(null);
  const [searchPos, setSearchPos] = useState({ top: 0, left: 0 });
  const [isTherapyOpen, setIsTherapyOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const liRef = useRef(null);
  const [cartItems] = useState([]);
  const cartCount = cartItems.reduce((n, it) => n + (it.qty || 1), 0);

  useEffect(() => {
    if (!isSearchOpen || !searchBtnRef.current) return;
    const rect = searchBtnRef.current.getBoundingClientRect();
    const panelWidth = 384;
    const gap = 8;
    setSearchPos({
      top: rect.bottom + gap,
      left: Math.max(8, rect.right - panelWidth),
    });
  }, [isSearchOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsServicesOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* lock body scroll on mobile drawer */
  useEffect(() => {
    if (isMobileMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => (document.body.style.overflow = "");
  }, [isMobileMenuOpen]);

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
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "instant" });
    console.log("Navigate to:", path);
  };

  const onKeyDown = (e) => { if (e.key === "Escape") setIsOpen(false); };
  /* ******  END OLD CODE  ****** */

  /* ----------  NEW LAYOUT  ---------- */
  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16 bg-white/60 fixed top-10 left-3 right-3 z-50 font-[Poppins,sans-serif] rounded-full">
          {/* 1.  Brand  */}
          <Link
            to="/"
            onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
            className="flex items-center gap-2 px-6"
          >
            <img src="/images/logoNav.gif" alt="nav-logo" className="h-12 w-auto" />
          </Link>

          {/* 2.  Desktop links  */}
          <ul className="hidden lg:flex items-center gap-6 text-sm font-semibold text-gray-800">
            <li><Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} className="hover:text-amber-700">HOME</Link></li>
            <li><Link to="/about" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} className="hover:text-amber-700">ABOUT US</Link></li>
            <li><Link to="/shop" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} className="hover:text-amber-700">SHOP NOW</Link></li>

            {/* Services dropdown (nested therapy kept) */}
            <li className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsServicesOpen((v) => !v)}
                className="inline-flex items-center gap-1 hover:text-amber-700"
              >
                SERVICES
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" /></svg>
              </button>
              {isServicesOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg py-2 z-50">
                  <Link to="/opd" onClick={() => setIsServicesOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#faeade]">ओ.पी.डी. सेवाएं</Link>
                  <Link to="/bmi" onClick={() => setIsServicesOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#faeade]">BMI Calculator</Link>
                  <Link to="/dosha" onClick={() => setIsServicesOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#faeade]">Dosha Test</Link>
                  <div
                    className="relative group"
                    onMouseEnter={() => setIsTherapyOpen(true)}
                    onMouseLeave={() => setIsTherapyOpen(false)}
                  >
                    <button className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-[#faeade]">
                      <span>Therapy Services</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" /></svg>
                    </button>
                    {isTherapyOpen && (
                      <div className="absolute left-full top-0 ml-2 w-56 rounded-xl bg-white shadow-lg py-2  z-60">
                        <Link to="/service/nutrient" onClick={() => { setIsServicesOpen(false); setIsTherapyOpen(false); }} className="block px-4 py-2 text-sm hover:bg-[#faeade]">न्यूट्रीशंट</Link>
                        <Link to="/service/remedios" onClick={() => { setIsServicesOpen(false); setIsTherapyOpen(false); }} className="block px-4 py-2 text-sm hover:bg-[#faeade]">प्राकृतिक चिकित्सा</Link>
                        <Link to="/service/therapy" onClick={() => { setIsServicesOpen(false); setIsTherapyOpen(false); }} className="block px-4 py-2 text-sm hover:bg-[#faeade]">Tailor-Made Ayurvedic Therapy</Link>
                      </div>
                    )}
                  </div>
                  <Link to="/panchkarma" onClick={() => setIsServicesOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#faeade]">पंचकर्म</Link>
                  <Link to="/naadi" onClick={() => setIsServicesOpen(false)} className="block px-4 py-2 text-sm hover:bg-[#faeade]">नाड़ी परीक्षण</Link>
                </div>
              )}
            </li>

            {/* Category mega-menu */}
            <li ref={liRef} className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)} onFocus={() => setIsOpen(true)} onBlur={(e) => { if (!liRef.current?.contains(e.relatedTarget)) setIsOpen(false); }} onKeyDown={onKeyDown}>
              <button className="inline-flex items-center gap-1 hover:text-amber-700">
                CATEGORY
                <svg className={`w-4 h-4 transition ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {isOpen && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[880px] rounded-[32px] shadow-xl bg-white z-50 overflow-hidden"
                  style={{ backgroundColor: "#fefcf8" }}
                >
                  <div className="relative px-10 py-12">
                    {/* Category Grid */}
                    <div className="flex flex-wrap justify-center gap-8 mb-8">
                      {categories.map((category, i) => (
                        <a
                          key={i}
                          href={category.path}
                          onClick={(e) => {
                            e.preventDefault();
                            handleCategoryClick(category.path);
                          }}
                          className="group flex flex-col items-center text-center w-[120px]"
                        >
                          <div className="relative flex flex-col items-center text-center group cursor-pointer">
                            {/* Icon wrapper */}
                            <div className="mx-auto h-16 w-16 rounded-full grid place-items-center bg-white border border-amber-100 shadow-sm transition-all duration-200 group-hover:scale-110 group-hover:bg-amber-50">
                              <img
                                src={category.icon}
                                alt={category.name}
                                className="h-16 w-16 object-contain transition-transform duration-200 group-hover:scale-110"
                              />
                            </div>
                            {/* Category name */}
                            <span className="mt-3 text-sm font-semibold text-[#5a6d52] leading-tight max-w-[100px] group-hover:text-amber-700 transition-colors">
                              {category.name}
                            </span>
                          </div>
                        </a>
                      ))}
                    </div>


                    {/* Shop All Button */}
                    <div className="flex justify-center">
                      <a
                        href="/all-categories"
                        onClick={(e) => {
                          e.preventDefault();
                          handleCategoryClick("/all-categories");
                        }}
                        className="px-8 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 text-sm font-semibold"
                      >
                        SHOP ALL
                      </a>
                    </div>
                  </div>

                  {/* Bottom Wave */}
                  <div className="relative h-20">
                    <svg
                      viewBox="0 0 1200 120"
                      preserveAspectRatio="none"
                      className="absolute inset-0 w-full h-full"
                    >
                      <path
                        d="M0 60 Q150 20 300 60 T600 60 T900 60 T1200 60 V120 H0Z"
                        fill="#f9ebd7"
                        opacity="0.45"
                      />
                      <path
                        d="M0 80 Q150 50 300 80 T600 80 T900 80 T1200 80 V120 H0Z"
                        fill="#f5e1c8"
                        opacity="0.65"
                      />
                      <path
                        d="M0 95 Q150 75 300 95 T600 95 T900 95 T1200 95 V120 H0Z"
                        fill="#f2dcc4"
                      />
                    </svg>
                  </div>
                </div>
              )}

            </li>

            <li><Link to="/blog" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} className="hover:text-amber-700">OUR BLOGS</Link></li>
            <li><Link to="/contact" onClick={() => window.scrollTo({ top: 0, behavior: "instant" })} className="hover:text-amber-700">CONTACTS</Link></li>
          </ul>

          {/* 3.  Desktop actions  */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="relative" ref={searchRef}>
              <button ref={searchBtnRef} onClick={() => setIsSearchOpen(v => !v)} className="p-2 rounded-full hover:bg-gray-100" aria-label="Search">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
              </button>
              {isSearchOpen && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 mr-10 w-70 rounded-lg border border-gray-200 bg-white shadow-lg z-50">
                  <div className="relative flex items-center">
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /></svg>
                    <input type="text" placeholder="Search for products..." autoFocus className="w-full pl-10 pr-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none" />
                  </div>
                </div>
              )}
            </div>
            <div className="w-px h-6 bg-gray-300" />
            <CartMenu cartItems={cartItems} />
            <Link to="/wishlist" className="p-2 rounded-full hover:bg-gray-100" aria-label="Wishlist">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.01a15.247 15.247 0 01-.383-.187 25.18 25.18 0 01-4.244-2.832C4.688 15.36 2.25 12.686 2.25 9.5 2.25 7.014 4.285 5 6.75 5c1.494 0 2.904.73 3.75 1.874A4.725 4.725 0 0114.25 5c2.465 0 4.5 2.014 4.5 4.5 0 3.186-2.438 5.86-4.739 8.378a25.175 25.175 0 01-4.244 2.832 15.247 15.247 0 01-.383.187l-.022.01-.007.003-.003.001a.75.75 0 01-.644 0l-.003-.001z" /></svg>
            </Link>
            <div className="relative" ref={profileRef}>
              <button onClick={() => setIsProfileOpen(v => !v)} className="p-2 rounded-full hover:bg-gray-100" aria-label="User Profile">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" /></svg>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-2 z-50">
                  <Link to="/login" onClick={() => { setIsProfileOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Login</Link>
                  <Link to="/register" onClick={() => { setIsProfileOpen(false); window.scrollTo({ top: 0, behavior: "instant" }); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Register</Link>
                </div>
              )}
            </div>
          </div>

          {/* 4.  Mobile header  */}
          <div className="lg:hidden flex items-center gap-2">
            <CartMenu cartItems={cartItems} />
            <button onClick={() => setIsMobileMenuOpen(v => !v)} className="p-2 rounded-full hover:bg-gray-100 min-h-11 min-w-11" aria-label="Open menu">
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" /></svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
              )}
            </button>
          </div>
        </nav>
      </div>

      {/* 5.  Mobile drawer (full-height sheet) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-23 z-40 flex flex-col">
          {/* backdrop (starts below navbar) */}
          <div
            className="absolute inset-x-0 top-0 bottom-0 bg-black/30"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* sheet (fills below the navbar) */}
          <div className="relative w-full max-w-sm ml-auto h-[calc(100svh-4rem)] bg-white/90 backdrop-blur-md border-l border-gray-200 overflow-y-auto">
            <div className="px-4 py-3 space-y-2">
              {/* same order as desktop */}
              <Link to="/"
                onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); setIsMobileMenuOpen(false); }}
                className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
              >HOME</Link>

              <Link to="/about"
                onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); setIsMobileMenuOpen(false); }}
                className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
              >ABOUT US</Link>

              <Link to="/shop"
                onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); setIsMobileMenuOpen(false); }}
                className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
              >SHOP NOW</Link>

              {/* CATEGORY */}
              <div>
                <button
                  onClick={() => setIsOpen(v => !v)}
                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
                >
                  <span>CATEGORY</span>
                  <svg className={`w-4 h-4 transition ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="mt-1 ml-3 grid grid-cols-2 gap-2">
                    {categories.map((c, i) => (
                      <Link
                        key={i}
                        to={c.path}
                        onClick={() => { setIsOpen(false); setIsMobileMenuOpen(false); }}
                        className="flex flex-col items-center text-center p-2 rounded-lg hover:bg-gray-50"
                      >
                        <img src={c.icon} alt={c.name} className="h-14 w-14 object-contain" />
                        <span className="mt-1 text-xs text-gray-700">{c.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* SERVICES */}
              <div>
                <button
                  onClick={() => setIsMobileServicesOpen(v => !v)}
                  className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
                >
                  <span>SERVICES</span>
                  <svg className={`w-4 h-4 transition ${isMobileServicesOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isMobileServicesOpen && (
                  <div className="mt-1 ml-3 space-y-1">
                    <Link to="/opd" onClick={() => { setIsMobileMenuOpen(false); setIsMobileServicesOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">ओ.पी.डी. सेवाएं</Link>
                    <Link to="/bmi" onClick={() => { setIsMobileMenuOpen(false); setIsMobileServicesOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">BMI Calculator</Link>
                    <Link to="/dosha" onClick={() => { setIsMobileMenuOpen(false); setIsMobileServicesOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Dosha Test</Link>
                    <Link to="/service/nutrient" onClick={() => { setIsMobileMenuOpen(false); setIsMobileServicesOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">न्यूट्रीशंट</Link>
                    <Link to="/service/remedios" onClick={() => { setIsMobileMenuOpen(false); setIsMobileServicesOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">प्राकृतिक चिकित्सा</Link>
                    <Link to="/service/therapy" onClick={() => { setIsMobileMenuOpen(false); setIsMobileServicesOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Tailor-Made Ayurvedic Therapy</Link>
                    <Link to="/panchkarma" onClick={() => { setIsMobileMenuOpen(false); setIsMobileServicesOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">पंचकर्म</Link>
                    <Link to="/naadi" onClick={() => { setIsMobileMenuOpen(false); setIsMobileServicesOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">नाड़ी परीक्षण</Link>
                  </div>
                )}
              </div>

              <Link to="/blog" onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); setIsMobileMenuOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">OUR BLOGS</Link>
              <Link to="/contact" onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); setIsMobileMenuOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">CONTACTS</Link>

              <div className="pt-2 border-t border-gray-200">
                <Link to="/wishlist" onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); setIsMobileMenuOpen(false); }} className="flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">
                  <span>Wishlist</span>
                </Link>
                <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">
                  <span>Cart</span>
                  <span className="min-w-[22px] h-[22px] px-1 rounded-full bg-yellow-500 text-white text-xs grid place-items-center">{cartCount}</span>
                </Link>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <Link to="/login" onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); setIsMobileMenuOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">Login</Link>
                <Link to="/register" onClick={() => { window.scrollTo({ top: 0, behavior: "instant" }); setIsMobileMenuOpen(false); }} className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">Register</Link>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}