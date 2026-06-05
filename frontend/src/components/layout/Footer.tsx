import React from 'react';
import Logo from './Logo';
import { MapPin, Phone, HelpCircle, ShoppingBag, Send } from 'lucide-react';

interface FooterProps {
  setView: (v: string) => void;
  setCategory?: (cat: string) => void;
}

export default function Footer({ setView, setCategory }: FooterProps) {
  const handleCategoryNav = (cat: string) => {
    if (setCategory) {
      setCategory(cat);
    }
    setView('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#6B2D0E] text-white pt-16 pb-8 select-none border-t border-[#7A3E1F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core footer layout elements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pb-12 border-b border-[#7C3E1F]">
          
          {/* LEFT COLUMN: BRAND & CONTACT */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <Logo size={56} tinted={true} />
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-wide">Godhara</span>
                <span className="text-[10px] text-amber-200/60 uppercase tracking-widest font-semibold mt-0.5">గోధార</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-200 font-sans leading-relaxed">
              Bringing back the purity, wisdom, and sustainability of our Indian traditions in partnership with local Gaushalas and artisans.
            </p>

            <div className="flex flex-col gap-3 font-sans text-sm text-gray-200 mt-2">
              <div className="flex items-start gap-3">
                <MapPin className="text-[#E8820C] h-5 w-5 shrink-0 mt-0.5" />
                <span>Pocharam Apartment, Banswada, Telangana, 503187</span>
              </div>
              
              <div className="flex items-center gap-3">
                <Phone className="text-[#E8820C] h-5 w-5 shrink-0" />
                <span>Talk to us: <span className="font-semibold">+91 8978038932</span></span>
              </div>
            </div>
          </div>

          {/* CENTER COLUMN: HELP */}
          <div className="flex flex-col gap-4 md:pl-8">
            <h3 className="font-serif text-lg font-bold text-white border-b border-[#7C3E1F] pb-2 flex items-center gap-2">
              <HelpCircle size={16} className="text-[#E8820C]" />
              Help & Resources
            </h3>
            <ul className="flex flex-col gap-3.5 text-sm text-gray-200 font-sans">
              <li>
                <button onClick={() => setView('home')} className="hover:text-[#E8820C] hover:underline transition-all duration-150">
                  Store Policies
                </button>
              </li>
              <li>
                <button onClick={() => setView('orders')} className="hover:text-[#E8820C] hover:underline transition-all duration-150">
                  Track your Order
                </button>
              </li>
              <li>
                <button onClick={() => setView('home')} className="hover:text-[#E8820C] hover:underline transition-all duration-150">
                  Return Policy
                </button>
              </li>
              <li>
                <button onClick={() => setView('home')} className="hover:text-[#E8820C] hover:underline transition-all duration-150">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* RIGHT COLUMN: SHOP CATEGORIES */}
          <div className="flex flex-col gap-4 md:pl-8">
            <h3 className="font-serif text-lg font-bold text-white border-b border-[#7C3E1F] pb-2 flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#E8820C]" />
              Shop Categories
            </h3>
            <ul className="flex flex-col gap-3.5 text-sm text-gray-200 font-sans">
              <li>
                <button onClick={() => handleCategoryNav('Spiritual')} className="hover:text-[#E8820C] hover:underline transition-all duration-150">
                  Spiritual
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('Dairy Products')} className="hover:text-[#E8820C] hover:underline transition-all duration-150">
                  Dairy / A2 Ghee
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('Personal Care')} className="hover:text-[#E8820C] hover:underline transition-all duration-150">
                  Personal Soap & Cleansing
                </button>
              </li>
              <li>
                <button onClick={() => handleCategoryNav('Ayurvedic Remedies')} className="hover:text-[#E8820C] hover:underline transition-all duration-150">
                  Ayurvedic Remedies
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* BOTTOM SECTION - PAYMENT RECURRENCES & CREDIT */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          
          {/* Payment gateway icons */}
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs text-amber-200/70 font-sans font-semibold uppercase tracking-wider">
              We accept
            </span>
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap bg-white/5 py-1.5 px-4 rounded-full border border-white/5 shadow-inner">
              {/* Visa Logo */}
<div className="font-extrabold italic text-white text-xl sm:text-2xl tracking-[-1px] opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-200 cursor-pointer">
  VISA
</div>

<div className="h-4 w-[1px] bg-white/10" />
                

              <div className="h-4 w-[1px] bg-white/10" />

              {/* Mastercard Logo */}
              <svg 
                className="h-5 sm:h-6 w-auto opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-200 cursor-pointer" 
                viewBox="0 0 32 20" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="10" cy="10" r="10" fill="#EB001B" />
                <circle cx="22" cy="10" r="10" fill="#F79E1B" />
                <path d="M16 10a9.98 9.98 0 0 1 3.2-7.38c-1.95-1.63-4.46-2.62-7.2-2.62a10 10 0 0 0 0 20c2.74 0 5.25-.99 7.2-2.62A9.98 9.98 0 0 1 16 10z" fill="#FF5F00" />
              </svg>

              <div className="h-4 w-[1px] bg-white/10" />

              {/* GPay Logo */}
              <svg 
                className="h-4 sm:h-5 w-auto opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-200 cursor-pointer" 
                viewBox="0 0 38 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="translate(0, 0.5)">
                  <path d="M6.5 2.8c1.1 0 2.1.4 2.9 1.1l2.2-2.1C10.2.7 8.5 0 6.5 0 4 0 1.8 1.4.7 3.5l2.5 1.9C3.8 3.8 5 2.8 6.5 2.8z" fill="#EA4335" />
                  <path d="M12.7 6.8c0-.5-.1-.9-.2-1.3H6.5v2.5h3.5c-.2.8-.7 1.5-1.3 1.9l2 1.6C11.9 10.4 12.7 8.8 12.7 6.8z" fill="#4285F4" />
                  <path d="M3.2 9.5c-.3-.9-.3-1.8 0-2.6l-2.5-1.9C-.2 6.8-.2 9.1.7 11.1l2.5-1.6z" fill="#FBBC05" />
                  <path d="M6.5 10.2c-1.5 0-2.7-1-3.3-2.6L.7 9.5C1.8 11.6 4 13 6.5 13c1.9 0 3.6-.6 4.8-1.8l-2-1.6c-.7.5-1.7.6-2.8.6z" fill="#34A853" />
                </g>
                <text x="14.5" y="11" fill="#FFFFFF" fontFamily="'Inter', system-ui, sans-serif" fontWeight="950" fontSize="10.5px" letterSpacing="-0.1px">Pay</text>
              </svg>

              <div className="h-4 w-[1px] bg-white/10" />

              {/* BHIM UPI Logo */}
              <svg 
                className="h-4 sm:h-5 w-auto opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-200 cursor-pointer" 
                viewBox="0 0 78 15" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <text x="0" y="11.5" fill="#FFFFFF" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontStyle="italic" fontSize="11px" letterSpacing="-0.3px">BHIM</text>
                <g transform="translate(32, 0.5) skewX(-12)">
                  <rect x="0" y="1" width="2" height="10" fill="#E8820C" rx="0.3" />
                  <path d="M3.5 1 L7 6 L3.5 11" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 1 L10.5 6 L7 11" stroke="#E8820C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <text x="49" y="11.5" fill="#FFFFFF" fontFamily="'Inter', system-ui, sans-serif" fontWeight="900" fontStyle="italic" fontSize="11px" letterSpacing="0.1px">UPI</text>
              </svg>

              <div className="h-4 w-[1px] bg-white/10" />

              {/* Net Banking Icon */}
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-200 cursor-pointer select-none">
                <svg 
                  className="h-4.5 sm:h-5 w-auto text-[#E8820C]" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2005/svg"
                >
                  <path d="M3 21h18M21 21v-8M21 10h-2M3 21v-8M3 10h2M5 21v-8M9 21v-8M13 21v-8M17 21v-8M10 21h4M2 10L12 3l10 7" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[7.5px] sm:text-[8px] text-white font-sans font-black uppercase tracking-wider">NET</span>
                  <span className="text-[6.5px] sm:text-[7px] text-amber-200/80 font-sans font-bold uppercase tracking-widest">BANKING</span>
                </div>
              </div>

              <div className="h-4 w-[1px] bg-white/10" />

              {/* Wallet Icon */}
              <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100 hover:scale-105 transition-all duration-200 cursor-pointer select-none">
                <svg 
                  className="h-4.5 sm:h-5 w-auto text-[#E8820C]" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h14v4" />
                  <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
                  <path d="M18 12a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h4v-6z" />
                </svg>
                <div className="flex flex-col text-left leading-none">
                  <span className="text-[7.5px] sm:text-[8px] text-white font-sans font-black uppercase tracking-wider">SECURE</span>
                  <span className="text-[6.5px] sm:text-[7px] text-amber-200/80 font-sans font-bold uppercase tracking-widest">WALLETS</span>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright & Technical Creator Credit Line */}
          <div className="text-center sm:text-right font-sans">
            <p className="text-xs text-amber-200/50">
              &copy; {new Date().getFullYear()} Godhara Store. All rights reserved.
            </p>
            <p className="text-xs text-amber-200/60 mt-1">
              Built by{' '}
              <a
                href="#nexkite-anchor"
                className="text-white hover:text-[#E8820C] font-bold inline-flex items-center gap-0.5 group transition-colors"
              >
                Nexkite
                <span className="text-[#E8820C] group-hover:scale-110 transition-transform inline-block">⚡</span>
              </a>
            </p>
          </div>

        </div>

      </div>
    </footer>
  );
}
