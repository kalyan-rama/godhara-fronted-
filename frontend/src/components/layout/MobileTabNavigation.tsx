import React from 'react';
import { Home, ShoppingBag, ShoppingCart, User, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface MobileTabNavigationProps {
  currentView: string;
  setView: (view: string) => void;
}

export default function MobileTabNavigation({ currentView, setView }: MobileTabNavigationProps) {
  const { isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();

  const handleTabClick = (view: string) => {
    setView(view);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const getAccountView = () => {
    return isAuthenticated ? 'orders' : 'login';
  };

  const isAccountActive = currentView === 'orders' || currentView === 'login' || currentView === 'register';

  return (
    <div 
      id="gdh-mobile-tab-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-stone-900/95 backdrop-blur-md border-t border-[#D4B896]/25 pb-safe"
    >
      <div className="grid grid-cols-5 h-16 items-center justify-around max-w-md mx-auto px-2">
        
        {/* Tab 1: Home */}
        <button
          onClick={() => handleTabClick('home')}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-center focus:outline-none cursor-pointer"
        >
          <div className="relative p-1">
            <Home 
              size={20} 
              className={`transition-all duration-200 ${
                currentView === 'home' 
                  ? 'text-[#E8820C] scale-110 drop-shadow-[0_0_8px_rgba(232,130,12,0.4)]' 
                  : 'text-stone-400 hover:text-white'
              }`} 
            />
          </div>
          <span 
            className={`text-[10px] font-medium tracking-wide transition-all ${
              currentView === 'home' ? 'text-[#E8820C] font-semibold' : 'text-stone-400'
            }`}
          >
            Home
          </span>
        </button>

        {/* Tab 2: Shop / All Products */}
        <button
          onClick={() => handleTabClick('products')}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-center focus:outline-none cursor-pointer"
        >
          <div className="relative p-1">
            <ShoppingBag 
              size={20} 
              className={`transition-all duration-200 ${
                currentView === 'products' 
                  ? 'text-[#E8820C] scale-110 drop-shadow-[0_0_8px_rgba(232,130,12,0.4)]' 
                  : 'text-stone-400 hover:text-white'
              }`} 
            />
          </div>
          <span 
            className={`text-[10px] font-medium tracking-wide transition-all ${
              currentView === 'products' ? 'text-[#E8820C] font-semibold' : 'text-stone-400'
            }`}
          >
            Shop
          </span>
        </button>

        {/* Tab 3: Persistent Mini Cart */}
        <button
          onClick={() => handleTabClick('cart')}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-center focus:outline-none cursor-pointer"
        >
          <div className="relative p-1">
            <ShoppingCart 
              size={20} 
              className={`transition-all duration-200 ${
                currentView === 'cart' 
                  ? 'text-[#E8820C] scale-110 drop-shadow-[0_0_8px_rgba(232,130,12,0.4)]' 
                  : 'text-stone-400 hover:text-white'
              }`} 
            />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#E8820C] text-white font-sans text-[9px] font-extrabold h-4.5 w-4.5 rounded-full flex items-center justify-center border-2 border-stone-950 shadow-md">
                {cartCount}
              </span>
            )}
          </div>
          <span 
            className={`text-[10px] font-medium tracking-wide transition-all ${
              currentView === 'cart' ? 'text-[#E8820C] font-semibold' : 'text-stone-400'
            }`}
          >
            Cart
          </span>
        </button>

        {/* Tab 4: Account / My Orders */}
        <button
          onClick={() => handleTabClick(getAccountView())}
          className="flex flex-col items-center justify-center gap-1 w-full h-full text-center focus:outline-none cursor-pointer"
        >
          <div className="relative p-1">
            <User 
              size={20} 
              className={`transition-all duration-200 ${
                isAccountActive 
                  ? 'text-[#E8820C] scale-110 drop-shadow-[0_0_8px_rgba(232,130,12,0.4)]' 
                  : 'text-stone-400 hover:text-white'
              }`} 
            />
          </div>
          <span 
            className={`text-[10px] font-medium tracking-wide transition-all ${
              isAccountActive ? 'text-[#E8820C] font-semibold' : 'text-stone-400'
            }`}
          >
            {isAuthenticated ? 'Orders' : 'Account'}
          </span>
        </button>

        {/* Tab 5: Admin Panel (if applicable) or a special "Organic Care" Vedic info tab */}
        {isAuthenticated && user && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'VIEWER'].includes(user.role) ? (
          <button
            onClick={() => handleTabClick('admin')}
            className="flex flex-col items-center justify-center gap-1 w-full h-full text-center focus:outline-none cursor-pointer text-amber-500 animate-pulse"
          >
            <div className="relative p-1">
              <ShieldAlert 
                size={20} 
                className={`transition-all duration-200 ${
                  currentView === 'admin' 
                    ? 'text-amber-400 scale-110' 
                    : 'text-amber-500'
                }`} 
              />
            </div>
            <span 
              className={`text-[10px] font-medium tracking-wide transition-all ${
                currentView === 'admin' ? 'text-amber-400 font-semibold' : 'text-amber-500'
              }`}
            >
              Admin
            </span>
          </button>
        ) : (
          <a
            href="https://wa.me/918978038932"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 w-full h-full text-center focus:outline-none cursor-pointer"
          >
            <div className="relative p-1">
              <span className="text-emerald-500 text-lg font-bold">WA</span>
            </div>
            <span className="text-[10px] font-medium text-stone-400 tracking-wide">
              Support
            </span>
          </a>
        )}

      </div>
    </div>
  );
}
