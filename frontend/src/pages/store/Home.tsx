import React, { useState, useEffect } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import API_URL from '../../api';
import { 
  Wallet, 
  Award, 
  CheckCircle, 
  Truck, 
  ChevronLeft, 
  ChevronRight, 
  ShoppingCart, 
  Eye, 
  Plus, 
  Check, 
  SlidersHorizontal 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HomeProps {
  products: Product[];
  categories: string[];
  productsLoading?: boolean;
  setView: (v: string) => void;
  setSelectedProduct: (p: Product) => void;
  initialCategory?: string;
  initialSearchQuery?: string;
}

const HERO_SLIDES = [
  {
    image: 'https://res.cloudinary.com/dndugbffx/image/upload/v1780724225/godhara_products/fgs0kxssim6nq7s1dzbv.jpg',
    tagline: 'Panchagavya Dhoop Sticks',
    description: 'Made from desi cow dung & natural herbal ingredients.'
  },
  {
    image: 'https://res.cloudinary.com/dndugbffx/image/upload/v1780725533/WhatsApp_Image_2026-05-31_at_11.14.01_AM_iuxeid.jpg',
    tagline: 'Herbal Bath Powder',
    description: 'Made from a powerful blend of Multani Mitti, A2 Milk, Reetha, Nagarmotha, Sona Geru, Kapoor, Coconut Oil, Haldi, and Neem.'
  },
  {
    image: 'https://res.cloudinary.com/dndugbffx/image/upload/v1780724608/godhara_products/ljxmre0sq9nua1xecamf.jpg',
    tagline: 'Amruthadhara',
    description: 'Godhara Amruthadhara is a natural herbal formulation inspired by Panchagavya traditions, used for wellness and spiritual practices.'
  }
];


// ── Product Skeleton ────────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="bg-white border border-[#D4B896]/55 rounded-lg overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-square bg-stone-200" />
      <div className="p-2.5 sm:p-4 flex flex-col gap-2">
        <div className="h-2.5 bg-stone-200 rounded w-1/3" />
        <div className="h-3.5 bg-stone-200 rounded w-4/5" />
        <div className="h-3 bg-stone-100 rounded w-2/3" />
        <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between">
          <div className="h-4 bg-stone-200 rounded w-1/4" />
          <div className="h-7 w-7 rounded-full bg-stone-200" />
        </div>
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div className="min-w-[280px] sm:min-w-[320px] bg-white border border-[#D4B896]/70 rounded-lg overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-square bg-stone-200" />
      <div className="p-5 flex flex-col gap-3">
        <div className="h-2.5 bg-stone-200 rounded w-1/4" />
        <div className="h-4 bg-stone-200 rounded w-3/4" />
        <div className="h-3 bg-stone-100 rounded w-full" />
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between">
          <div className="h-5 bg-stone-200 rounded w-1/4" />
          <div className="h-8 bg-stone-200 rounded-full w-24" />
        </div>
      </div>
    </div>
  );
}

export default function Home({ products, categories, productsLoading = false, setView, setSelectedProduct, initialCategory = 'All', initialSearchQuery = '' }: HomeProps) {
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState('Newest');
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [addingId, setAddingId] = useState<string | null>(null);

  const [founderInfo, setFounderInfo] = useState({
    founderName: 'Ketan S., Founder of Godhara',
    founderQuote: 'Godhara was founded with a simple yet powerful vision — to bring back the purity, wisdom, and sustainability of our Indian traditions. Inspired by our cultural roots and deep respect for nature, the founders work closely with local artisans and Gaushalas to create natural, eco-friendly products made using time-honored practices.',
    founderImageUrl: 'https://res.cloudinary.com/dndugbffx/image/upload/v1780725088/founder_yhmvml.jpg'
  });

  useEffect(() => {
    // Check local storage setting first for instant local preview feedback
    const localImg = localStorage.getItem('gdh_founder_image');
    const localName = localStorage.getItem('gdh_founder_name');
    const localQuote = localStorage.getItem('gdh_founder_quote');
    if (localImg || localName || localQuote) {
      setFounderInfo(prev => ({
        founderImageUrl: localImg || prev.founderImageUrl,
        founderName: localName || prev.founderName,
        founderQuote: localQuote || prev.founderQuote
      }));
    }

    // Load custom configurations from database
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setFounderInfo({
            founderImageUrl: data.founderImageUrl || 'https://res.cloudinary.com/dndugbffx/image/upload/v1780725088/founder_yhmvml.jpg',
            founderName: data.founderName || ' ., Founder of Godhara',
            founderQuote: data.founderQuote || 'Godhara was founded with a simple yet powerful vision — to bring back the purity, wisdom, and sustainability of our Indian traditions. Inspired by our cultural roots and deep respect for nature, we work closely with local artisans and Gaushalas to create natural, eco-friendly products made using time-honored practices.'
          });
        }
      })
      .catch(err => console.error('Failed fetching founder settings:', err));
  }, []);

  // Sync state if navigation injects external category
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  // Autoplay Slider Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
  const prevSlide = () => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  // Filter & Sort Logic
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return p.isActive && matchCat && matchQuery;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const actualA = a.discountPrice ?? a.price;
    const actualB = b.discountPrice ?? b.price;

    if (sortOption === 'Price Low-High') {
      return actualA - actualB;
    } else if (sortOption === 'Price High-Low') {
      return actualB - actualA;
    }
    // Newest / Default: creation order
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const featuredList = products.filter(p => p.isActive && p.isFeatured);

  const handleAddToCartClick = async (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    setAddingId(product.id);
    await addToCart(product, 1);
    setTimeout(() => setAddingId(null), 1200);
  };

  const handleProductCardClick = (product: Product) => {
    setSelectedProduct(product);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen">
      
      {/* SECTION 1: HERO BANNER SLIDER */}
      <div className="relative h-[480px] sm:h-[520px] lg:h-[580px] w-full overflow-hidden bg-stone-900 border-b-4 border-[#6B2D0E]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Earthy Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent z-10" />
            <img
              src={HERO_SLIDES[currentSlide].image}
              alt="Godhara Traditional Pure Products"
              className="w-full h-full object-cover select-none pointer-events-none"
            />
            
            {/* Hero Overlay Taglines */}
            <div className="absolute inset-y-0 left-0 z-20 flex items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl text-white">
                <span className="inline-block bg-[#E8820C] text-xs font-bold font-sans uppercase tracking-widest px-3 py-1.5 rounded-sm mb-4">
                  Tradition & Gaushala Sourced
                </span>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-normal leading-tight drop-shadow-md">
                  {HERO_SLIDES[currentSlide].tagline}
                </h1>
                <p className="text-sm sm:text-base text-stone-200 mt-4 leading-relaxed max-w-lg drop-shadow">
                  {HERO_SLIDES[currentSlide].description}
                </p>
                <button
                  onClick={() => {
                    document.getElementById('all-products-section-anchor')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white text-[#6B2D0E] hover:bg-[#E8820C] hover:text-white transition-all duration-200 text-sm font-bold tracking-wider py-3.5 px-8 rounded-full shadow-lg mt-8 inline-block select-none cursor-pointer"
                >
                  Shop Pure Products Now
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Direction Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/30 hover:bg-[#6B2D0E]/80 text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <ChevronLeft size={20} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-10 w-10 rounded-full bg-black/30 hover:bg-[#6B2D0E]/80 text-white flex items-center justify-center transition-colors border border-white/10"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-35 flex items-center gap-2.5">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-2.5 rounded-full transition-all duration-200 ${
                currentSlide === i ? 'bg-[#E8820C] w-7' : 'bg-white/40 w-2.5'
              }`}
            />
          ))}
        </div>
      </div>

      {/* SECTION 2: TRUST BADGES BAR */}
      <div className="bg-[#F5EFE6] border-b border-[#D4B896] py-12 select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            
            {/* Badge 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-full bg-white border-2 border-[#D4B896] flex items-center justify-center text-stone-800 shadow-sm group-hover:bg-[#6B2D0E] group-hover:border-[#6B2D0E] group-hover:text-white transition-all duration-200 mb-3.5">
                <Wallet size={26} strokeWidth={1.8} />
              </div>
              <h4 className="text-sm font-semibold text-[#2C1810] tracking-wide">Secure Payments</h4>
              <p className="text-xs text-stone-500 mt-1">100% Protected Checkouts</p>
            </div>

            {/* Badge 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-full bg-white border-2 border-[#D4B896] flex items-center justify-center text-stone-800 shadow-sm group-hover:bg-[#6B2D0E] group-hover:border-[#6B2D0E] group-hover:text-white transition-all duration-200 mb-3.5">
                <Award size={26} strokeWidth={1.8} />
              </div>
              <h4 className="text-sm font-semibold text-[#2C1810] tracking-wide">Assured Quality</h4>
              <p className="text-xs text-stone-500 mt-1">Traditional Vedic Checking</p>
            </div>

            {/* Badge 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-full bg-white border-2 border-[#D4B896] flex items-center justify-center text-stone-800 shadow-sm group-hover:bg-[#6B2D0E] group-hover:border-[#6B2D0E] group-hover:text-white transition-all duration-200 mb-3.5">
                <CheckCircle size={26} strokeWidth={1.8} />
              </div>
              <h4 className="text-sm font-semibold text-[#2C1810] tracking-wide">Made In India</h4>
              <p className="text-xs text-stone-500 mt-1">Empowering Local Gaushalas</p>
            </div>

            {/* Badge 4 */}
            <div className="flex flex-col items-center text-center group">
              <div className="h-16 w-16 rounded-full bg-white border-2 border-[#D4B896] flex items-center justify-center text-stone-800 shadow-sm group-hover:bg-[#6B2D0E] group-hover:border-[#6B2D0E] group-hover:text-white transition-all duration-200 mb-3.5">
                <Truck size={26} strokeWidth={1.8} />
              </div>
              <h4 className="text-sm font-semibold text-[#2C1810] tracking-wide">Timely Delivery</h4>
              <p className="text-xs text-stone-500 mt-1">Dispatched within 24 Hours</p>
            </div>

          </div>
        </div>
      </div>

      {/* SECTION 3: FEATURED PRODUCTS HEADER & HORIZONTAL CARDS */}
      {(productsLoading || featuredList.length > 0) && (
        <section className="py-16 bg-white/40 border-b border-[#D4B896] select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="text-xs font-bold text-[#E8820C] uppercase tracking-widest">
                Our Top Recommendation
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#6B2D0E] mt-1">
                Featured Products
              </h2>
              <p className="text-stone-500 text-sm mt-1">
                Check out our newest addition to the store! Handmade with love and devotion.
              </p>
            </div>

            {/* Desktop grid, mobile horizontal scroll */}
            <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-amber-700 md:grid md:grid-cols-2 lg:grid-cols-3 md:overflow-x-visible md:pb-0">
              {productsLoading
                ? Array.from({ length: 3 }).map((_, i) => <FeaturedSkeleton key={i} />)
                : featuredList.map(product => {
                const finalPrice = product.discountPrice ?? product.price;
                const hasDiscount = !!product.discountPrice;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleProductCardClick(product)}
                    className="min-w-[280px] sm:min-w-[320px] bg-white border border-[#D4B896]/70 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer flex flex-col group justify-between"
                  >
                    <div className="relative aspect-square overflow-hidden bg-stone-100">
                      <img
                        src={product.images?.[0] || '/logo.png'}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                      />
                      {hasDiscount && (
                        <span className="absolute top-3 left-3 bg-[#E8820C] text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded">
                          Save ₹{Math.round(product.price - product.discountPrice!)}
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="absolute inset-0 bg-black/60 text-white font-bold flex items-center justify-center text-sm uppercase tracking-wider">
                          Sold Out
                        </span>
                      )}
                      {product.stock > 0 && product.stock < 10 && (
                        <span className="absolute bottom-3 right-3 bg-red-600 text-white text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded">
                          Only {product.stock} Left!
                        </span>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-[#E8820C] uppercase tracking-widest font-bold">
                          {product.category}
                        </span>
                        <h3 className="font-serif text-base font-bold text-[#2C1810] hover:text-[#6B2D0E] transition-colors mt-0.5 min-h-[48px] line-clamp-2 leading-tight">
                          {product.name}
                        </h3>
                        <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          {hasDiscount ? (
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-lg font-bold text-[#6B2D0E]">₹{product.discountPrice}</span>
                              <span className="text-xs text-stone-400 line-through">₹{product.price}</span>
                            </div>
                          ) : (
                            <span className="text-lg font-bold text-[#6B2D0E]">₹{product.price}</span>
                          )}
                          <span className="text-[9px] text-stone-400 font-sans tracking-tight mt-0.5">({product.weight}g Unit Net Content)</span>
                        </div>

                        {product.stock > 0 ? (
                          <button
                            onClick={(e) => handleAddToCartClick(e, product)}
                            disabled={addingId === product.id}
                            className="bg-[#6B2D0E] hover:bg-[#E8820C] disabled:bg-green-700 text-white text-xs font-bold py-2 px-3.5 rounded-full flex items-center gap-1.5 shadow transition-all duration-150 cursor-pointer"
                          >
                            {addingId === product.id ? (
                              <>
                                <Check size={13} strokeWidth={2.5} />
                                Added
                              </>
                            ) : (
                              <>
                                <ShoppingCart size={13} />
                                Add to Cart
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="text-xs text-red-500 font-bold">Out of Stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: ALL PRODUCTS GRID & CONTROLS */}
      <section id="all-products-section-anchor" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header content */}
        <div className="border-b border-[#D4B896] pb-6 mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-[#6B2D0E]">All Pure Offerings</h2>
            <p className="text-stone-500 text-sm mt-1">Browse our complete spectrum of Indian tradition products</p>
          </div>

          {/* Quick controls filter/sort bar */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-stone-500 font-bold uppercase tracking-wider">
              <SlidersHorizontal size={14} className="text-[#6B2D0E]" />
              Filters:
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="bg-white border border-[#D4B896] text-[#2C1810] text-xs font-semibold py-1.5 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#E8820C] cursor-pointer"
            >
              <option value="Newest">Sort: Newest First</option>
              <option value="Price Low-High">Price: Low to High</option>
              <option value="Price High-Low">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Dynamic Category Pill Filtering */}
        <div 
          id="categories-section-anchor" 
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 text-xs font-bold rounded-full border transition-all duration-150 shrink-0 cursor-pointer ${
              selectedCategory === 'All'
                ? 'bg-[#6B2D0E] border-[#6B2D0E] text-white shadow-sm'
                : 'bg-white border-[#D4B896] hover:bg-amber-50 text-[#2C1810]'
            }`}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 text-xs font-bold rounded-full border transition-all duration-150 shrink-0 cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? 'bg-[#6B2D0E] border-[#6B2D0E] text-white shadow-sm'
                  : 'bg-white border-[#D4B896] hover:bg-amber-50 text-[#2C1810]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Catalog grid renderer */}
        {productsLoading ? (
          /* Skeleton grid — shown immediately while /api/products is in-flight */
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/50 rounded-xl border border-dashed border-[#D4B896]">
            <p className="text-stone-400 font-serif text-lg">No pure creations found matching these criteria</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="mt-4 inline-block bg-[#E8820C] text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-[#6B2D0E]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {sortedProducts.map(product => {
              const finalPrice = product.discountPrice ?? product.price;
              const hasDiscount = !!product.discountPrice;

              return (
                <div
                  key={product.id}
                  onClick={() => handleProductCardClick(product)}
                  className="bg-white border border-[#D4B896]/55 rounded-lg overflow-hidden hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative aspect-square bg-stone-50 overflow-hidden">
                    <img
                      src={product.images?.[0] || '/logo.png'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 pointer-events-none"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-[#E8820C] text-white text-[8px] sm:text-[9px] font-black uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded shadow-sm">
                        Save ₹{Math.round(product.price - product.discountPrice!)}
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="absolute inset-0 bg-stone-900/60 text-white font-bold flex items-center justify-center text-xs uppercase tracking-wider">
                        Sold Out
                      </span>
                    )}
                    {product.stock > 0 && product.stock < 10 && (
                      <span className="absolute bottom-2 right-2 bg-red-600 text-white text-[7px] sm:text-[8px] font-bold uppercase tracking-wider px-1.5 sm:px-2 py-0.5 rounded shadow-sm">
                        Low Stock: {product.stock}
                      </span>
                    )}
                  </div>

                  <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] sm:text-[9px] text-stone-400 uppercase tracking-wider font-bold">
                        {product.category}
                      </span>
                      <h3 className="font-serif text-xs sm:text-sm font-semibold text-[#2C1810] leading-tight hover:text-[#E8820C] mt-0.5 min-h-[32px] sm:min-h-[40px] line-clamp-2">
                        {product.name}
                      </h3>
                    </div>

                    <div className="mt-2 sm:mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex flex-col">
                        {hasDiscount ? (
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm sm:text-base font-bold text-[#6B2D0E]">₹{product.discountPrice}</span>
                            <span className="text-[9px] sm:text-[10px] text-stone-400 line-through">₹{product.price}</span>
                          </div>
                        ) : (
                          <span className="text-sm sm:text-base font-bold text-[#6B2D0E]">₹{product.price}</span>
                        )}
                        <span className="text-[7px] sm:text-[8px] text-stone-400">({product.weight}g)</span>
                      </div>

                      {product.stock > 0 ? (
                        <button
                          onClick={(e) => handleAddToCartClick(e, product)}
                          disabled={addingId === product.id}
                          className="h-7 w-7 sm:h-8 sm:w-8 bg-[#6B2D0E] hover:bg-[#E8820C] text-white rounded-full flex items-center justify-center shadow-sm select-none transition-colors cursor-pointer shrink-0"
                        >
                          {addingId === product.id ? <Check size={12} className="text-green-400 animate-bounce" /> : <Plus size={12} />}
                        </button>
                      ) : (
                        <span className="text-[8px] sm:text-[10px] text-red-500 font-bold uppercase">No Stock</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 5: FROM OUR FOUNDER */}
      <section className="bg-white border-t border-b border-[#D4B896] select-none">
        <div className="grid grid-cols-1 md:grid-cols-10">
          
          <div className="md:col-span-6 bg-[#F5EFE6] p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
            <span className="text-xs font-bold text-[#E8820C] uppercase tracking-widest">A Sacred Legacy</span>
            <h2 className="font-serif font-black text-3xl sm:text-4xl text-[#6B2D0E] mt-1 mb-6 leading-tight">
              From our Founder
            </h2>
            <p className="text-[#2C1810]/95 text-sm sm:text-base leading-relaxed font-sans font-medium space-y-4 max-w-xl">
              {founderInfo.founderQuote}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <div className="h-0.5 w-12 bg-[#6B2D0E]" />
              <p className="font-serif font-bold text-sm text-[#6B2D0E]">{founderInfo.founderName}</p>
            </div>
          </div>

          <div className="md:col-span-4 max-h-[460px] md:max-h-none overflow-hidden bg-[#E8820C] relative">
            <img
              src={founderInfo.founderImageUrl}
              alt="Godhara Founder Image"
              className="w-full h-full object-cover filter sepia-[0.1] saturate-[1.1] hover:scale-105 transition-transform duration-700 pointer-events-none"
              referrerPolicy="no-referrer"
            />
            {/* Elegant overlay vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>

        </div>
      </section>

      {/* FLOATING WHATSAPP BUTTON (wa.me/918978038932) */}
      <a
        href="https://wa.me/918978038932"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce cursor-pointer group"
        title="Talk to us on WhatsApp!"
        id="gdh-whatsapp-floating-btn"
      >
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.1 1.45 4.8 1.45 5.58 0 10.12-4.51 10.13-10.05.004-3.524-1.872-6.521-4.757-8.484a10.023 10.023 0 00-6.757-2.31c-5.58 0-10.12 4.515-10.13 10.051-.001 2.01.52 3.98 1.503 5.71l-1.002 3.655 3.743-.982zM17.447 14.4c-.297-.15-1.758-.868-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.568-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        </svg>
        <span className="absolute right-14 bg-[#2C1810] text-white text-xs font-bold py-1 px-2.5 rounded shadow shadow-stone-800 whitespace-nowrap opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100 transition-all origin-right mr-1">
          Pooja / Gau Seva Help!
        </span>
      </a>

    </div>
  );
}
