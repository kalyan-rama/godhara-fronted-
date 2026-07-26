import React, { useEffect, useMemo, useState } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { Search, ShoppingCart, SlidersHorizontal, ChevronLeft, ChevronRight, X, PackageSearch } from 'lucide-react';

interface HomeProps {
  products: Product[];
  categories: string[];
  productsLoading: boolean;
  setView: (v: string) => void;
  setSelectedProduct: React.Dispatch<React.SetStateAction<Product | null>>;
  initialCategory: string;
  initialSearchQuery: string;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

const PAGE_SIZE = 12;

export default function Home({
  products,
  categories,
  productsLoading,
  setView,
  setSelectedProduct,
  initialCategory,
  initialSearchQuery,
}: HomeProps) {
  const { addToCart } = useCart();

  const [search, setSearch] = useState(initialSearchQuery || '');
  const [category, setCategory] = useState(initialCategory || 'All');
  const [sort, setSort] = useState<SortOption>('featured');
  const [page, setPage] = useState(1);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Sync filters when navigated in from the navbar search / footer category links
  useEffect(() => {
    setSearch(initialSearchQuery || '');
  }, [initialSearchQuery]);

  useEffect(() => {
    setCategory(initialCategory || 'All');
  }, [initialCategory]);

  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.isActive !== false);

    if (category && category !== 'All') {
      list = list.filter((p) => p.category === category);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description || '').toLowerCase().includes(q)
      );
    }

    switch (sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
        break;
      case 'name-asc':
        list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'featured':
      default:
        list = [...list].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
        break;
    }

    return list;
  }, [products, category, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openProduct = (p: Product) => {
    setSelectedProduct(p);
    setView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickAdd = (e: React.MouseEvent, p: Product) => {
    e.stopPropagation();
    addToCart(p, 1);
    setAddedId(p.id);
    setTimeout(() => setAddedId((cur) => (cur === p.id ? null : cur)), 1200);
  };

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-b from-[#6B2D0E] to-[#52220A] text-white py-10 sm:py-14 px-4 text-center">
        <span className="text-xs font-bold text-[#F5CBA7] uppercase tracking-widest bg-white/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Traditional Panchagavya & Gaushala Products
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">The Godhara Shop</h1>
        <p className="text-white/70 text-sm mt-2 max-w-lg mx-auto">
          Pure, traditional, and handcrafted essentials for your home, health, and daily rituals.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-[#D4B896]/50 shadow-sm p-4 sm:p-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-stone-50 border border-[#D4B896]/60 rounded-full py-2.5 pl-10 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#E8820C]/40"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-[#6B2D0E] cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-stone-50 border border-[#D4B896]/60 rounded-full px-3.5">
              <SlidersHorizontal size={14} className="text-stone-400 shrink-0" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-transparent py-2.5 text-sm focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
              </select>
            </div>
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategory('All')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                category === 'All'
                  ? 'bg-[#6B2D0E] text-white shadow'
                  : 'bg-stone-50 text-stone-600 border border-[#D4B896]/50 hover:border-[#E8820C]'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all cursor-pointer ${
                  category === c
                    ? 'bg-[#6B2D0E] text-white shadow'
                    : 'bg-stone-50 text-stone-600 border border-[#D4B896]/50 hover:border-[#E8820C]'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mt-6 mb-3 px-1">
          <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
            {productsLoading ? 'Loading products…' : `${filtered.length} product${filtered.length === 1 ? '' : 's'} found`}
          </p>
        </div>

        {/* Product grid */}
        {productsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#D4B896]/30 overflow-hidden animate-pulse">
                <div className="aspect-square bg-stone-100" />
                <div className="p-3.5 space-y-2">
                  <div className="h-3 bg-stone-100 rounded w-3/4" />
                  <div className="h-3 bg-stone-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : pageItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-[#D4B896] p-14 text-center">
            <PackageSearch className="mx-auto text-stone-300 mb-3" size={40} />
            <p className="text-stone-500 font-medium text-sm">No products match your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {pageItems.map((p) => {
              const finalPrice = p.discountPrice ?? p.price;
              const hasDiscount = !!p.discountPrice && p.discountPrice < p.price;
              return (
                <div
                  key={p.id}
                  onClick={() => openProduct(p)}
                  className="bg-white rounded-2xl border border-[#D4B896]/40 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
                >
                  <div className="aspect-square bg-stone-50 relative overflow-hidden">
                    <img
                      src={p.images?.[0] || '/logo.png'}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 left-2 bg-[#E8820C] text-white text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm">
                        Save ₹{Math.round(p.price - p.discountPrice!)}
                      </span>
                    )}
                    {p.stock <= 0 && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                        <span className="text-red-700 font-black text-[10px] uppercase bg-white px-2.5 py-1 rounded border border-red-200">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 flex flex-col gap-1 flex-1">
                    <span className="text-[9px] font-bold text-[#E8820C] uppercase tracking-widest">{p.category}</span>
                    <h3 className="text-xs sm:text-sm font-bold text-[#2C1810] leading-snug line-clamp-2 min-h-[2.2em]">
                      {p.name}
                    </h3>
                    {p.packageSize && (
                      <span className="text-[10px] text-stone-400">{p.packageSize}</span>
                    )}

                    <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-black text-[#6B2D0E]">₹{finalPrice}</span>
                        {hasDiscount && (
                          <span className="text-[10px] text-stone-400 line-through">₹{p.price}</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => quickAdd(e, p)}
                        disabled={p.stock <= 0}
                        className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                          addedId === p.id ? 'bg-green-600 text-white' : 'bg-[#6B2D0E] hover:bg-[#E8820C] text-white'
                        }`}
                        aria-label={`Add ${p.name} to cart`}
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!productsLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-9 w-9 rounded-full bg-white border border-[#D4B896]/60 flex items-center justify-center text-[#6B2D0E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:border-[#E8820C]"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-9 w-9 rounded-full bg-white border border-[#D4B896]/60 flex items-center justify-center text-[#6B2D0E] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:border-[#E8820C]"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
