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

  const [isTherapyOpen, setIsTherapyOpen] = useState(false);
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
        {/* Add state: const [isTherapyOpen, setIsTherapyOpen] = useState(false); */}

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
      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
    </svg>
  </button>

  {isServicesOpen && (
    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-2xl py-2 z-50 border border-[#faeade] overflow-visible">
      <Link to="/opd" className="relative block px-4 py-2.5 text-sm text-gray-700 hover:text-[#d4956c] overflow-hidden group"
        onClick={() => { setIsServicesOpen(false); window.scrollTo({ top:0, behavior:'instant' }); }}>
        <span className="absolute inset-0 bg-[#faeade] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        <span className="relative">ओ.पी.डी. सेवाएं</span>
      </Link>

      <Link to="/bmi" className="relative block px-4 py-2.5 text-sm text-gray-700 hover:text-[#d4956c] overflow-hidden group"
        onClick={() => { setIsServicesOpen(false); window.scrollTo({ top:0, behavior:'instant' }); }}>
        <span className="absolute inset-0 bg-[#faeade] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        <span className="relative">BMI Calculator</span>
      </Link>

       <Link to="/dosha" className="relative block px-4 py-2.5 text-sm text-gray-700 hover:text-[#d4956c] overflow-hidden group"
        onClick={() => { setIsServicesOpen(false); window.scrollTo({ top:0, behavior:'instant' }); }}>
        <span className="absolute inset-0 bg-[#faeade] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        <span className="relative">Dosha Test</span>
      </Link>

      {/* Submenu wrapper handles hover, not the button */}
      <div
        className="relative group/submenu"
        onMouseEnter={() => setIsTherapyOpen(true)}
        onMouseLeave={() => setIsTherapyOpen(false)}
      >
        <button className="relative w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 hover:text-[#d4956c] overflow-hidden group">
          <span className="absolute inset-0 bg-[#faeade] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
          <span className="relative">Therapy Services</span>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="size-4 relative">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.17 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>

        {isTherapyOpen && (
          <div className="absolute left-full top-0 ml-2 w-56 rounded-2xl bg-white shadow-2xl py-2 border border-[#faeade] z-[60]">
            <Link to="/service/nutrient" className="relative block px-4 py-2.5 text-sm text-gray-700 hover:text-[#d4956c] overflow-hidden group"
              onClick={() => { setIsServicesOpen(false); setIsTherapyOpen(false); window.scrollTo({ top:0, behavior:'instant' }); }}>
              <span className="absolute inset-0 bg-[#faeade] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              <span className="relative">न्यूट्रीशंट</span>
            </Link>
            <Link to="/service/remedios" className="relative block px-4 py-2.5 text-sm text-gray-700 hover:text-[#d4956c] overflow-hidden group"
              onClick={() => { setIsServicesOpen(false); setIsTherapyOpen(false); window.scrollTo({ top:0, behavior:'instant' }); }}>
              <span className="absolute inset-0 bg-[#faeade] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              <span className="relative">प्राकृतिक चिकित्सा</span>
            </Link>
            <Link to="/service/therapy" className="relative block px-4 py-2.5 text-sm text-gray-700 hover:text-[#d4956c] overflow-hidden group"
              onClick={() => { setIsServicesOpen(false); setIsTherapyOpen(false); window.scrollTo({ top:0, behavior:'instant' }); }}>
              <span className="absolute inset-0 bg-[#faeade] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
              <span className="relative">Tailor-Made Ayurvedic Therapy</span>
            </Link>
          </div>
        )}
      </div>

      <Link to="/panchkarma" className="relative block px-4 py-2.5 text-sm text-gray-700 hover:text-[#d4956c] overflow-hidden group"
        onClick={() => { setIsServicesOpen(false); window.scrollTo({ top:0, behavior:'instant' }); }}>
        <span className="absolute inset-0 bg-[#faeade] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        <span className="relative">पंचकर्म</span>
      </Link>

      <Link to="/naadi" className="relative block px-4 py-2.5 text-sm text-gray-700 hover:text-[#d4956c] overflow-hidden group"
        onClick={() => { setIsServicesOpen(false); window.scrollTo({ top:0, behavior:'instant' }); }}>
        <span className="absolute inset-0 bg-[#faeade] -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
        <span className="relative">नाड़ी परीक्षण</span>
      </Link>
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
    <div className="absolute right-0 mt-2 w-96 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
      <div className="relative">
        <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          type="text"
          placeholder="Search for products..."
          className="w-full pl-12 pr-4 py-4 text-gray-700 placeholder-gray-400 focus:outline-none border-b border-gray-100"
          autoFocus
        />
      </div>
      <div className="p-3 bg-gray-50">
        <p className="text-xs text-gray-500 mb-2">Popular searches</p>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors">
            Energy
          </button>
          <button className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors">
            Pain Relief
          </button>
          <button className="px-3 py-1 text-sm bg-white border border-gray-200 rounded-full hover:border-blue-500 hover:text-blue-600 transition-colors">
            Weight Management
          </button>
        </div>
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
                <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => {setIsServicesOpen(false),window.scrollTo({top:0,behavior:'instant'})}}>Login</Link>
                <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => {setIsServicesOpen(false),window.scrollTo({top:0,behavior:'instant'})}}>Register</Link>
                <a href="#profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => {setIsServicesOpen(false),window.scrollTo({top:0,behavior:'instant'})}}>My Profile</a>
                <a href="#orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => {setIsServicesOpen(false),window.scrollTo({top:0,behavior:'instant'})}}>My Orders</a>
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
      {/* ----------  links  ---------- */}
      {[
        { to: '/', label: 'HOME' },
        { to: '/wishlist', label: 'WISHLIST' },
        { to: '/about', label: 'ABOUT US' },
        { to: '/shop', label: 'SHOP NOW' },
      ].map(l => (
        <Link
          key={l.to}
          to={l.to}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            setIsMobileMenuOpen(false); // ← close menu
          }}
          className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
        >
          {l.label}
        </Link>
      ))}

      {/* services accordion */}
      <div className="pt-2">
        <button
          type="button"
          className="w-full flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
          onClick={() => setIsMobileServicesOpen(v => !v)}
        >
          <span>SERVICES</span>
          <svg className={`size-4 transition-transform ${isMobileServicesOpen ? 'rotate-180' : 'rotate-0'}`} />
        </button>
        {isMobileServicesOpen && (
          <div className="mt-1 ml-3 space-y-1">
            {[
              { to: '/opd', label: 'ओ.पी.डी. सेवाएं' },
              { to: '/bmi', label: 'BMI Calculator' },
              { to: '#dosha', label: 'Dosha Test' },
              { to: '/service/nutrient', label: 'न्यूट्रीशंट' },
              { to: '/service/remedios', label: 'प्राकृतिक चिकित्सा' },
              { to: '/service/therapy', label: 'Tailor-Made Ayurvedic Therapy' },
              { to: '/panchakarma', label: 'पंचकर्म' },
              { to: '/naadi', label: 'नाड़ी परीक्षण' },
            ].map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'instant' });
                  setIsMobileMenuOpen(false); // ← close menu
                  setIsMobileServicesOpen(false);
                }}
                className="block px-2 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* cart */}
      <Link
        to="/cart"
        onClick={() => setIsMobileMenuOpen(false)} // ← close menu
        className="mt-2 flex items-center justify-between px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50 border-t border-gray-200"
      >
        <span>Cart</span>
        <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1 rounded-full bg-yellow-500 text-white text-xs">
          {cartCount}
        </span>
      </Link>

      {/* profile links */}
      <div className="pt-3 border-t border-gray-200">
        {[
          { to: '/login', label: 'Login' },
          { to: '#register', label: 'Register' },
          { to: '#profile', label: 'My Profile' },
          { to: '#orders', label: 'My Orders' },
        ].map(l => (
          <Link
            key={l.to}
            to={l.to}
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
              setIsMobileMenuOpen(false); // ← close menu
            }}
            className="block px-2 py-2 rounded-lg text-gray-800 hover:bg-gray-50"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  </div>
)}
    </nav>
  );
}
