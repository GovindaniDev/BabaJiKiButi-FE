// src/components/NavBar.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import CartMenu from "../page/cart/CartMenu";

export default function NavBar() {
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const profileRef = useRef(null);

  // FIX: useState returns [value, setter]
  const [cartItems] = useState([]);
  const cartCount = cartItems.reduce((n, it) => n + (it.qty || 1), 0);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsServicesOpen(false);
      if (searchRef.current && !searchRef.current.contains(event.target)) setIsSearchOpen(false);
      if (profileRef.current && !profileRef.current.contains(event.target)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 md:p-6 p-3 font-[Poppins,sans-serif]">
      <div className="mx-auto flex items-center justify-between bg-white/70 backdrop-blur-md rounded-full px-6 py-3 shadow-sm">
        {/* Logo */}
        <div className="flex items-center">
  <Link to="/" className="flex items-center gap-2" onClick={()=>window.scrollTo({top:0,behavior:"instant"})}>
    <img
      src="/images/logo.jpg"
      alt="nav-logo"
      className="md:w-16 w-12 rounded-full shadow-[0_0_20px_5px_#8B4513] transition-transform duration-500 hover:scale-110 hover:rotate-0 hover:skew-y-0"

      style={{ transformStyle: "preserve-3d" }}
    />
  </Link>
</div>



        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-800">
          <li> <Link to="/" className="block px-2 py-2 rounded-lg text-gray-800 "  onClick={()=>window.scrollTo({top:0,behavior:"instant"})}>HOME</Link></li>
         
          <li><Link to="/about" className="hover:text-gray-900 transition-colors" onClick={()=>window.scrollTo({top:0,behavior:"instant"})} >ABOUT US</Link></li>
          <li>
            <Link to="/shop" className="hover:text-gray-900 transition-colors" onClick={()=>{window.scrollTo({top:0,behavior:"instant"})}}>SHOP NOW</Link>
          </li>

          {/* Services */}
          <li className="relative" ref={dropdownRef}>
            <button
              type="button"
              className="inline-flex items-center gap-1 hover:text-gray-900 transition-colors"
              onClick={() => setIsServicesOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={isServicesOpen}
            >
              SERVICES
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isServicesOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg py-2">
                <a href="/opd" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsServicesOpen(false)}>ओ.पी.डी. सेवाएं</a>
                <a href="/bmi" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsServicesOpen(false)}>BMI Calculator</a>
                <a href="#dosha" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsServicesOpen(false)}>Dosha Test</a>
                <Link to="/service/nutrient" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsServicesOpen(false)}>न्यूट्रीशंट</Link>
                <a href="#naturopathy" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsServicesOpen(false)}>प्राकृतिक चिकित्सा</a>
                <a href="#tailor" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsServicesOpen(false)}>Tailor-Made Ayurvedic Therapy</a>
                <a href="/panchkarma" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsServicesOpen(false)}>पंचकर्म</a>
                <a href="/naadi" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" role="menuitem" onClick={() => setIsServicesOpen(false)}>नाड़ी परीक्षण</a>
              </div>
            )}
          </li>

          <li><Link to="/blog" className="hover:text-gray-900 transition-colors" onClick={()=>window.scrollTo({top:0,behavior:"instant"})}>OUR BLOGS</Link></li>
          <li><Link to="/contact" className="hover:text-gray-900 transition-colors" onClick={()=>{window.scrollTo({top:0,behavior:"instant"})}}>CONTACTS</Link></li>
        </ul>

        {/* Desktop actions: Search | Cart | Profile */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setIsSearchOpen(v => !v)}
              aria-label="Search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>
            {isSearchOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg p-4">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                    Search
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-300" />

          {/* Cart (hover opens preview; click navigates) */}
          <CartMenu cartItems={cartItems} />
          {/* Wishlist */}
          <Link
            to="/wishlist"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Wishlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-gray-600">
              <path d="M11.645 20.91l-.007-.003-.022-.01a15.247 15.247 0 01-.383-.187 25.18 25.18 0 01-4.244-2.832C4.688 15.36 2.25 12.686 2.25 9.5 2.25 7.014 4.285 5 6.75 5c1.494 0 2.904.73 3.75 1.874A4.725 4.725 0 0114.25 5c2.465 0 4.5 2.014 4.5 4.5 0 3.186-2.438 5.86-4.739 8.378a25.175 25.175 0 01-4.244 2.832 15.247 15.247 0 01-.383.187l-.022.01-.007.003-.003.001a.75.75 0 01-.644 0l-.003-.001z" />
            </svg>
          </Link>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setIsProfileOpen(v => !v)}
              aria-label="User Profile"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg py-2">
                <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>Login</Link>
                <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>Register</Link>
                <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>My Profile</a>
                <a href="#orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsProfileOpen(false)}>My Orders</a>
              </div>
            )}
          </div>
        </div>

        {/* Mobile header: Cart + Hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <CartMenu cartItems={cartItems} />
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(v => !v)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 text-gray-800"
          >
            {isMobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M5.47 5.47a.75.75 0 011.06 0L12 10.94l5.47-5.47a.75.75 0 111.06 1.06L13.06 12l5.47 5.47a.75.75 0 11-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 01-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 010-1.06z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel (mirrors desktop content) */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-2 mx-2 rounded-2xl border border-gray-200 bg-white/90 backdrop-blur-md shadow-lg">
          <div className="px-4 py-3 space-y-2">
            {/* Search */}
            <div className="pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Links */}
            <Link to="/" className="block px-2 py-2 rounded-lg text-gray-800 ">HOME</Link>
            <Link to="/wishlist" className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">WISHLIST</Link>
            <a href="/about" className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">ABOUT US</a>
            <Link to="/shop" className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">SHOP NOW</Link>

            {/* Services accordion (same items as desktop) */}
            <div className="pt-2">
              <button
                type="button"
                className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
                onClick={() => setIsMobileServicesOpen(v => !v)}
                aria-expanded={isMobileServicesOpen}
              >
                <span>SERVICES</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`size-4 transition-transform ${isMobileServicesOpen ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                </svg>
              </button>

              {isMobileServicesOpen && (
                <div className="mt-1 ml-3 space-y-1">
                  <a href="/opd" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">ओ.पी.डी. सेवाएं</a>
                  <a href="/bmi" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">BMI Calculator</a>
                  <a href="#dosha" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Dosha Test</a>
                  <a href="#nutrient" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">न्यूट्रीशंट</a>
                  <a href="#naturopathy" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">प्राकृतिक चिकित्सा</a>
                  <a href="#tailor" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">Tailor-Made Ayurvedic Therapy</a>
                  <a href="/panchakarma" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">पंचकर्म</a>
                  <a href="/naadi" className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50">नाड़ी परीक्षण</a>
                </div>
              )}
            </div>

            {/* Mobile cart quick link (count badge) */}
            <Link
              to="/cart"
              className="mt-2 flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50 border-t border-gray-200"
            >
              <span>Cart</span>
              <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-yellow-500 text-white text-xs">
                {cartCount}
              </span>
            </Link>

            {/* Profile quick links */}
            <div className="pt-3 border-t border-gray-200">
              <div className="space-y-1">
                <Link to="/login" className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">Login</Link>
                <a href="#register" className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">Register</a>
                <a href="#profile" className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">My Profile</a>
                <a href="#orders" className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50">My Orders</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
