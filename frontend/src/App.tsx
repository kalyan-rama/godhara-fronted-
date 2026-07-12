import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Product } from './types';
import API_URL from './api';

// Layout Elements
import AnnouncementBar from './components/layout/AnnouncementBar';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Store Front Views
import Home from './pages/store/Home';
import ProductDetail from './pages/store/ProductDetail';
import Cart from './pages/store/Cart';
import Checkout from './pages/store/Checkout';
import OrderConfirm from './pages/store/OrderConfirm';
import MyOrders from './pages/store/MyOrders';
import Login from './pages/store/Login';
import Register from './pages/store/Register';

// Admin panel View
import AdminConsole from './pages/admin/AdminConsole';
import MobileTabNavigation from './components/layout/MobileTabNavigation';

function StorefrontApp() {
  const { user: authUser, isAdmin } = useAuth();
  
  const [currentView, setViewRaw] = useState<string>(() => {
    const saved = localStorage.getItem('gdh_current_view');
    return saved || 'home';
  });

  useEffect(() => {
    console.log('[DEBUG App Routing] Current View:', currentView, 'isAdmin:', isAdmin, 'authUser:', authUser ? { id: authUser.id, role: authUser.role, otpVerified: authUser.otpVerified } : 'null');
  }, [currentView, isAdmin, authUser]);

  const setView = (v: string) => {
    localStorage.setItem('gdh_current_view', v);
    setViewRaw(v);
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  // productsLoading: true only while the first fetch is in-flight
  // Does NOT block render — Home handles its own skeleton
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  
  // Navigation states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Security guard — only fires after products are known (non-blocking)
  useEffect(() => {
    if (currentView === 'admin' && !productsLoading) {
      const storedUser = localStorage.getItem('gdh_user');
      const storedToken = localStorage.getItem('gdh_token');
      let authedAdmin = false;
      if (storedUser && storedToken) {
        try {
          const parsed = JSON.parse(storedUser);
          if (parsed && ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'VIEWER'].includes(parsed.role) && parsed.otpVerified) {
            authedAdmin = true;
          }
        } catch (e) {}
      }
      if (!authedAdmin) {
        setView('home');
      }
    }
  }, [currentView, productsLoading]);

  // Load products IMMEDIATELY — completely independent of auth/cart
  const fetchInventory = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const list = await res.json();
        setProducts(list);
        const uniqCats = Array.from(new Set(list.map((item: Product) => item.category))) as string[];
        setCategories(uniqCats);
      }
    } catch (err) {
      console.error('Failed downloading product catalogue:', err);
    } finally {
      // Always clear loading so UI unblocks even on error
      setProductsLoading(false);
    }
  }, []);

  // Fire ONCE on mount — no auth dependency
  useEffect(() => {
    fetchInventory();
  }, []);

  const handleSearchAction = (query: string) => {
    setSearchQuery(query);
    setSelectedCategory('All');
    setView('products');
  };

  const handleCategoryNav = (cat: string) => {
    setSelectedCategory(cat);
    setSearchQuery('');
    setView('products');
  };

  const isAdminView = currentView === 'admin';

  return (
    <div className={`flex flex-col min-h-screen bg-[#F5EFE6] select-none text-[#2C1810] ${!isAdminView ? 'pb-16 md:pb-0' : ''}`}>
      
      {!isAdminView && (
        <>
          <AnnouncementBar />
          <Navbar 
            currentView={currentView} 
            setView={setView} 
            onSearch={handleSearchAction} 
          />
        </>
      )}

      {/* Render immediately — no global loading gate */}
      <main className="flex-grow">
        {(() => {
          switch (currentView) {
            case 'home':
              return (
                <Home 
                  products={products}
                  categories={categories}
                  productsLoading={productsLoading}
                  setView={setView}
                  setSelectedProduct={setSelectedProduct}
                  initialCategory="All"
                  initialSearchQuery=""
                />
              );
            case 'products':
              return (
                <Home 
                  products={products}
                  categories={categories}
                  productsLoading={productsLoading}
                  setView={setView}
                  setSelectedProduct={setSelectedProduct}
                  initialCategory={selectedCategory}
                  initialSearchQuery={searchQuery}
                />
              );
            case 'detail':
              return selectedProduct ? (
                <ProductDetail 
                  product={selectedProduct} 
                  setView={setView} 
                />
              ) : (
                <div className="py-20 text-center text-xs">No active product detail found.</div>
              );
            case 'cart':
              return <Cart setView={setView} />;
            case 'checkout':
              return (
                <Checkout 
                  setView={setView} 
                  setCompletedOrder={setCompletedOrder} 
                />
              );
            case 'orderConfirm':
              return (
                <OrderConfirm 
                  order={completedOrder} 
                  setView={setView} 
                />
              );
            case 'orders':
              return <MyOrders setView={setView} />;
            case 'login':
              return <Login setView={setView} />;
            case 'register':
              return <Register setView={setView} />;
            case 'admin':
              if (!isAdmin) {
                return <Login setView={setView} />;
              }
              return (
                <AdminConsole 
                  setView={setView} 
                  products={products} 
                  refreshProducts={fetchInventory} 
                />
              );
            default:
              return (
                <div className="py-20 text-center font-serif text-[#6B2D0E] font-bold">
                  View &quot;{currentView}&quot; is currently compiling.
                </div>
              );
          }
        })()}
      </main>

      {!isAdminView && (
        <>
          <Footer 
            setView={setView} 
            setCategory={handleCategoryNav} 
          />
          <MobileTabNavigation 
            currentView={currentView}
            setView={setView}
          />
        </>
      )}

    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 px-6">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-lg">
        <h1 className="text-4xl font-bold text-orange-600 mb-4">🚧 Website Under Maintenance</h1>

        <p className="text-gray-600 mb-6">
          We are currently updating our website.
          <br />
          Please wait for some time.
        </p>

        <a
          href="https://wa.me/917661055143?text=Hi%20Godhara,%20I%20need%20help."
          className="bg-green-600 text-white px-6 py-3 rounded-lg inline-block"
        >
          Contact on WhatsApp
        </a>
      </div>
    </div>
  );

}
