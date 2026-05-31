import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Product } from './types';
import API_URL from './api';

// Layout Elements

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
  const [currentView, setView] = useState<string>('home');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  // Navigation states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load database catalogues
  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/products`);
      if (res.ok) {
        const list = await res.json();
        setProducts(list);
        
        // Extract distinct lists of active categories
        const uniqCats = Array.from(new Set(list.map((item: Product) => item.category))) as string[];
        setCategories(uniqCats);
      }
    } catch (err) {
      console.error('Failed downloading Gau seed collections:', err);
    } finally {
      setLoading(false);
    }
  };

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

  // Skip headers/footers in Admin view layout
  const isAdminView = currentView === 'admin';

  return (
    <div className={`flex flex-col min-h-screen bg-[#F5EFE6] select-none text-[#2C1810] ${!isAdminView ? 'pb-16 md:pb-0' : ''}`}>
      
      {/* 1. Header layouts */}
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

      {/* 2. Primary dynamic viewport router */}
      <main className="flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] font-serif py-20">
            <span className="text-[#6B2D0E] font-bold text-lg animate-pulse tracking-widest">
              Connecting Vedic Sanctuary Channels...
            </span>
          </div>
        ) : (
          (() => {
            switch (currentView) {
              case 'home':
                return (
                  <Home 
                    products={products}
                    categories={categories}
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
          })()
        )}
      </main>

      {/* 3. Footer layout */}
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
    <AuthProvider>
      <CartProvider>
        <StorefrontApp />
      </CartProvider>
    </AuthProvider>
  );
}
