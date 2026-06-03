import React, { useState } from 'react';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, Search, User, LogOut, ChevronDown, LayoutDashboard, Menu, X, PhoneCall, Gift, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setView: (v: string) => void;
  onSearch: (query: string) => void;
}

export default function Navbar({ currentView, setView, onSearch }: NavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const [searchVal, setSearchVal] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
    setView('products');
    setMobileSearchOpen(false);
  };

  const handleMobileSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
    setView('products');
    setMobileSearchOpen(false);
  };

  const handleLinkClick = (view: string) => {
    setView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#6B2D0E] text-white shadow-md select-none transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Mobile Hamburger Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-1.5 sm:p-2 rounded-lg bg-[#53220A]/40 border border-[#7C3E1F] hover:bg-[#52220A] text-[#D4B896] hover:text-white transition-colors duration-150 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
            aria-label="Toggle navigation drawer"
          >
            <Menu size={18} className="sm:size-5 stroke-[2.5]" />
          </button>

          {/* Logo & Brand Identity */}
          <div
            id="gdh-branding-anchor"
            className="flex items-center gap-1.5 sm:gap-3 cursor-pointer group shrink-0"
            onClick={() => handleLinkClick('home')}
          >
            <Logo size={36} className="sm:size-[48px] transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col leading-tight">
              <span className="font-serif text-lg sm:text-2xl font-bold tracking-normal text-white">
                Godhara
              </span>
              <span className="hidden min-[380px]:inline-block font-sans text-[8px] sm:text-[10px] text-[#D4B896] tracking-wider uppercase font-semibold leading-none mt-0.5 sm:mt-1">
                Ayurvedic Products
              </span>
            </div>
          </div>

          {/* Central Section - Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <button
               onClick={() => handleLinkClick('home')}
              className={`hover:text-[#E8820C] transition-colors py-1 border-b-2 ${
                currentView === 'home' ? 'text-[#E8820C] border-[#E8820C]' : 'border-transparent text-gray-200'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => {
                onSearch('');
                setSearchVal('');
                handleLinkClick('products');
              }}
              className={`hover:text-[#E8820C] transition-colors py-1 border-b-2 ${
                currentView === 'products' ? 'text-[#E8820C] border-[#E8820C]' : 'border-transparent text-gray-200'
              }`}
            >
              All Products
            </button>
            <a
              href="#categories-section-anchor"
              onClick={(e) => {
                e.preventDefault();
                if (currentView !== 'home') {
                  setView('home');
                  setTimeout(() => {
                    document.getElementById('categories-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
                  }, 200);
                } else {
                  document.getElementById('categories-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-gray-200 hover:text-[#E8820C] transition-colors"
            >
              Categories
            </a>
          </nav>

          {/* Right Commands - Search Bar & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-3 md:gap-6">
            
            {/* Desktop Search Bar Block */}
            <form onSubmit={handleSearchSubmit} className="relative hidden sm:block max-w-xs">
              <input
                type="text"
                placeholder="Search pure products..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-40 md:w-56 bg-[#52220A] text-white placeholder-amber-200/50 text-xs rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-[#E8820C] border border-[#7C3E1F] focus:w-48 md:focus:w-64 transition-all duration-300"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-amber-200/75 hover:text-white">
                <Search size={14} />
              </button>
            </form>

            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                setMobileMenuOpen(false);
              }}
              className="sm:hidden text-[#D4B896] hover:text-white p-1.5 rounded-full bg-[#52220A] border border-[#7C3E1F] flex items-center justify-center"
              aria-label="Toggle mobile search bar"
            >
              <Search size={16} />
            </button>

            {/* Cart Icon trigger */}
            <button
              id="gdh-cart-trigger-btn"
              onClick={() => handleLinkClick('cart')}
              className="relative p-1.5 sm:p-2.5 rounded-full bg-[#52220A] border border-[#7C3E1F] hover:bg-[#52220aa7] hover:border-[#E8820C] text-white transition-all duration-150 flex items-center justify-center cursor-pointer"
            >
              <ShoppingCart size={16} className="sm:size-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#E8820C] text-white font-sans text-[9px] sm:text-[10px] font-bold h-4 sm:h-5 w-4 sm:w-5 rounded-full flex items-center justify-center border border-[#6B2D0E] shadow-sm animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Authenticated user menu dropdown */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 rounded-full bg-[#52220A] hover:bg-[#5a270f] border border-[#7C3E1F] text-xs font-semibold cursor-pointer max-w-[120px] sm:max-w-[150px]"
                  >
                    <User size={12} className="text-[#D4B896] shrink-0" />
                    <span className="truncate max-w-[50px] sm:max-w-[80px] text-gray-100 text-[11px] sm:text-xs">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={10} className="opacity-70 shrink-0" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 top-11 sm:top-12 w-48 bg-white border border-[#D4B896] text-[#2C1810] rounded-lg shadow-xl overflow-hidden py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-[10px] font-bold text-[#E8820C] tracking-wide uppercase">Account Node</p>
                        <p className="text-xs font-semibold truncate text-[#2C1810]">{user?.email}</p>
                      </div>

                      {user?.role === 'ADMIN' && (
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLinkClick('admin');
                          }}
                          className="w-full text-left px-4 py-2 text-xs font-medium text-[#6B2D0E] hover:bg-[#F5EFE6] transition-colors flex items-center gap-2"
                        >
                          <LayoutDashboard size={13} />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          handleLinkClick('orders');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium hover:bg-[#F5EFE6] transition-colors flex items-center gap-2"
                      >
                        <User size={13} />
                        My Orders
                      </button>

                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                          handleLinkClick('home');
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-100"
                      >
                        <LogOut size={13} />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleLinkClick('login')}
                  className="flex items-center gap-1.5 text-xs font-bold leading-none bg-[#E8820C] hover:bg-[#ff9a1e] text-white py-1.5 sm:py-2.5 px-3 sm:px-5 rounded-full shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer text-center"
                >
                  <User size={14} className="shrink-0" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Mobile Search Bar Dropdown Overlay */}
      {mobileSearchOpen && (
        <div className="md:hidden bg-[#53220A] border-t border-[#7C3E1F] py-2 px-3 shadow-inner flex items-center gap-2 animate-fade-in">
          <form onSubmit={handleMobileSearchSubmit} className="relative flex-grow">
            <input
              type="text"
              placeholder="Search pure Ayurvedic products..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-[#3D1806] text-white placeholder-amber-200/50 text-xs rounded-full py-2 pl-3 pr-10 focus:outline-none focus:ring-1 focus:ring-[#E8820C] border border-[#6B2D0E]"
              autoFocus
            />
            <button type="submit" className="absolute right-3 top-2 text-amber-200/75 hover:text-white">
              <Search size={14} />
            </button>
          </form>
          <button 
            onClick={() => {
              setSearchVal('');
              onSearch('');
              setMobileSearchOpen(false);
            }}
            className="text-amber-200 hover:text-white text-xs font-semibold px-2 py-1.5 hover:bg-white/5 rounded"
          >
            Clear
          </button>
        </div>
      )}

      {/* Mobile Drawer Slide-out Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden animate-fade-in" id="gdh-mobile-drawer">
          {/* Backdrop screen mask */}
          <div 
            className="fixed inset-0 bg-stone-950/75 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Main vertical drawer body panel */}
          <div className="relative flex flex-col w-[290px] max-w-[85vw] h-full bg-[#F5EFE6] text-[#2C1810] shadow-2xl p-5 transition-transform duration-300 ease-out z-50">
            
            {/* Close action on the top right */}
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-[#6B2D0E]/5 text-[#6B2D0E] transition-colors focus:ring-1 focus:ring-[#E8820C]"
              aria-label="Close menu"
            >
              <X size={20} className="stroke-[2.5]" />
            </button>

            {/* Micro compact brand headers */}
            <div className="flex items-center gap-3 pb-4 border-b border-[#D4B896]/50 mt-2 shrink-0">
              <Logo size={40} />
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold tracking-tight text-[#6B2D0E] leading-tight">
                  Godhara
                </span>
                <span className="text-[9px] uppercase tracking-wider text-[#E8820C] font-semibold leading-none mt-0.5">
                  Traditional Purities & Gau Seva
                </span>
              </div>
            </div>

            {/* Vertical high-contrast link items */}
            <nav className="flex-grow flex flex-col gap-3 py-6 overflow-y-auto">
              {/* Main Directory Title */}
              <span className="text-[10px] uppercase font-black tracking-widest text-[#6B2D0E]/70 px-2">Vedic Sanctuary Navigation</span>
              
              <button
                onClick={() => handleLinkClick('home')}
                className={`text-left text-xs font-bold py-2.5 px-3 rounded-lg transition-all flex items-center gap-2.5 ${
                  currentView === 'home' 
                    ? 'bg-[#6B2D0E] text-white shadow-sm' 
                    : 'hover:bg-[#E8820C]/10 text-[#2C1810]'
                }`}
              >
                <Gift size={14} className="shrink-0 text-[#E8820C]" />
                Home Dashboard
              </button>
              
              <button
                onClick={() => {
                  onSearch('');
                  setSearchVal('');
                  handleLinkClick('products');
                }}
                className={`text-left text-xs font-bold py-2.5 px-3 rounded-lg transition-all flex items-center gap-2.5 ${
                  currentView === 'products' 
                    ? 'bg-[#6B2D0E] text-white shadow-sm' 
                    : 'hover:bg-[#E8820C]/10 text-[#2C1810]'
                }`}
              >
                <div className="w-3.5 h-3.5 rounded bg-amber-500 flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
                Organic Store
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentView !== 'home') {
                    setView('home');
                    setTimeout(() => {
                      document.getElementById('categories-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
                    }, 250);
                  } else {
                    document.getElementById('categories-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-left text-xs font-bold py-2.5 px-3 rounded-lg hover:bg-[#E8820C]/10 text-[#2C1810] transition-all flex items-center gap-2.5"
              >
                <BookOpen size={14} className="shrink-0 text-emerald-600" />
                Browse Categories
              </button>

              {/* Support info block inside menu */}
              <a
                href="https://wa.me/918978038932"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="text-left text-xs font-bold py-2 px-3 rounded-lg hover:bg-emerald-50 text-emerald-800 transition-colors flex items-center gap-2 ml-1 mt-1 border border-emerald-200/50"
              >
                <PhoneCall size={14} className="text-emerald-600 animate-bounce" />
                WhatsApp Support
              </a>

              {/* Conditional accounts section inside slide-out navigation */}
              <div className="pt-6 border-t border-[#D4B896]/40 mt-auto shrink-0">
                {isAuthenticated ? (
                  <div className="flex flex-col gap-2.5">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest px-2">Session Identity</p>
                    <div className="flex items-center gap-2.5 p-2 bg-[#D4B896]/20 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-[#6B2D0E] text-white flex items-center justify-center font-bold text-xs">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-bold truncate text-[#2C1810]">{user?.name}</span>
                        <span className="text-[9px] text-stone-500 truncate">{user?.email}</span>
                      </div>
                    </div>

                    {user?.role === 'ADMIN' && (
                      <button
                        onClick={() => handleLinkClick('admin')}
                        className="text-left text-xs font-extrabold text-amber-800 flex items-center gap-2 hover:bg-[#E8820C]/5 py-2 px-2.5 rounded-lg w-full"
                      >
                        <LayoutDashboard size={14} className="text-amber-700" />
                        Admin Panel
                      </button>
                    )}

                    <button
                      onClick={() => handleLinkClick('orders')}
                      className="text-left text-xs font-bold text-[#6B2D0E] flex items-center gap-2 hover:bg-[#E8820C]/5 py-2 px-2.5 rounded-lg w-full"
                    >
                      <User size={14} className="text-[#6B2D0E]" />
                      My Order Records
                    </button>

                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                        handleLinkClick('home');
                      }}
                      className="w-full text-center text-xs font-bold bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg mt-2 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <LogOut size={13} />
                      Sign Out Account
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleLinkClick('login')}
                    className="w-full text-center text-xs font-bold bg-[#E8820C] hover:bg-[#ff9a1e] text-white py-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <User size={14} />
                    Login / Sign Up
                  </button>
                )}
              </div>

            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
