import React, { useState, useRef } from 'react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { ShoppingCart, ArrowLeft, ShieldCheck, Heart, Leaf, HelpCircle, Check, Loader2 } from 'lucide-react';

interface ProductDetailProps {
  product: Product;
  setView: (v: string) => void;
}

export default function ProductDetail({ product, setView }: ProductDetailProps) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [btnState, setBtnState] = useState<'idle' | 'adding' | 'added'>('idle');
  const isProcessing = useRef(false);

  const finalPrice = product.discountPrice ?? product.price;
  const hasDiscount = !!product.discountPrice;

  const handleAddToCart = async () => {
    // Prevent duplicate clicks
    if (isProcessing.current || btnState !== 'idle') return;
    isProcessing.current = true;
    setBtnState('adding');

    // 1. Optimistic update — addToCart applies instantly to cart state
    const addPromise = addToCart(product, qty);

    // 2. Redirect immediately (<200ms), don't wait for API
    //    Using a short timeout so the "Adding..." state flashes visibly, then navigate
    setTimeout(() => {
      setView('cart');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 120);

    // 3. Let the API call complete in background
    addPromise
      .catch(() => {})
      .finally(() => {
        isProcessing.current = false;
      });
  };

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-10 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Back navigation button */}
        <button
          onClick={() => setView('home')}
          className="mb-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6B2D0E] hover:text-[#E8820C] transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Storefront
        </button>

        <div className="bg-white rounded-2xl border border-[#D4B896]/50 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-10">
          
          {/* LEFT COLUMN: PRODUCT IMAGES */}
          <div className="flex flex-col gap-4">
            <div className="aspect-square bg-stone-50 rounded-xl overflow-hidden border border-stone-100 relative shadow-inner">
              <img
                src={product.images?.[0] || '/logo.png'}
                alt={product.name}
                className="w-full h-full object-cover pointer-events-none select-none"
              />
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-[#E8820C] text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded shadow-sm">
                  Save ₹{Math.round(product.price - product.discountPrice!)}
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {product.images.map((img, i) => (
                <div key={i} className="aspect-square bg-stone-50 rounded-lg overflow-hidden border border-stone-100 cursor-pointer hover:border-[#6B2D0E] transition-all">
                  <img src={img} alt={`${product.name} alt-${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAIL DESCRIPTIONS */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-[#E8820C] uppercase tracking-widest bg-[#F5EFE6] px-2.5 py-1.5 rounded-sm inline-block">
                {product.category}
              </span>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#6B2D0E] leading-tight mt-4">
                {product.name}
              </h1>

              {/* Price bracket cards */}
              <div className="my-6 p-4 bg-[#F5EFE6]/60 rounded-xl border border-[#D4B896]/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider leading-none">Vedic Retail price</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    {hasDiscount ? (
                      <>
                        <span className="text-3xl font-black text-[#6B2D0E]">₹{product.discountPrice}</span>
                        <span className="text-sm text-stone-400 line-through">₹{product.price}</span>
                      </>
                    ) : (
                      <span className="text-3xl font-black text-[#6B2D0E]">₹{product.price}</span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Weight content</p>
                  <p className="text-sm font-bold text-[#2C1810]/80 mt-1">{product.weight} grams Net</p>
                </div>
              </div>

              {/* Stock Status Banner */}
              <div className="flex items-center gap-2 mb-6 text-sm font-medium">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-1.5 text-green-700">
                    <span className="h-2.5 w-2.5 rounded-full bg-green-500 inline-block" />
                    <span>In Stock: Ready for Dispatch</span>
                    {product.stock < 10 && (
                      <span className="text-red-600 bg-red-50 text-[10px] uppercase font-bold px-2 py-0.5 rounded leading-none border border-red-200 ml-1.5">
                        Only {product.stock} units left!
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-red-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-500 inline-block" />
                    <span>Sold Out / Compiling at Gaushala</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-stone-600 text-sm leading-relaxed mb-6 font-sans">
                {product.description}
              </p>

              {/* Traditional attributes benefits bullet points */}
              <div className="border-t border-b border-stone-100 py-4 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-stone-600 select-none">
                <div className="flex items-center gap-2.5">
                  <Leaf className="text-[#E8820C] h-4.5 w-4.5" />
                  <span>100% Organic, Earthy & Non-toxic</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="text-[#E8820C] h-4.5 w-4.5" />
                  <span>Gaushala-Sourced & Cruelty-Free</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Heart className="text-[#E8820C] h-4.5 w-4.5" />
                  <span>Handcrafted in traditional Indian loops</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="text-[#E8820C] h-4.5 w-4.5" />
                  <span>Aids Vedic lifestyle choices</span>
                </div>
              </div>

            </div>

            {/* ACTION FOOTER */}
            {product.stock > 0 ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center border-2 border-[#D4B896] rounded-full h-11 bg-stone-50 overflow-hidden font-bold">
                  <button
                    onClick={() => setQty(prev => Math.max(1, prev - 1))}
                    disabled={btnState !== 'idle'}
                    className="px-4 text-stone-600 hover:bg-stone-100 h-full cursor-pointer disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-3 bg-white w-10 text-center text-sm">{qty}</span>
                  <button
                    onClick={() => setQty(prev => Math.min(product.stock, prev + 1))}
                    disabled={btnState !== 'idle'}
                    className="px-4 text-stone-600 hover:bg-stone-100 h-full cursor-pointer disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={btnState !== 'idle'}
                  aria-busy={btnState === 'adding'}
                  className={`flex-1 text-white font-bold h-11 px-8 rounded-full flex items-center justify-center gap-2.5 shadow hover:shadow-md transition-all cursor-pointer select-none
                    ${btnState === 'idle' ? 'bg-[#6B2D0E] hover:bg-[#E8820C]' : ''}
                    ${btnState === 'adding' ? 'bg-[#E8820C] cursor-not-allowed opacity-90' : ''}
                    ${btnState === 'added' ? 'bg-green-700 cursor-not-allowed' : ''}
                    disabled:cursor-not-allowed
                  `}
                >
                  {btnState === 'adding' && (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Adding...
                    </>
                  )}
                  {btnState === 'added' && (
                    <>
                      <Check size={18} strokeWidth={2.5} />
                      Added {qty} to Cart!
                    </>
                  )}
                  {btnState === 'idle' && (
                    <>
                      <ShoppingCart size={18} />
                      Add to Cart (₹{(finalPrice * qty).toLocaleString()})
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-red-50 text-red-700 text-center font-bold p-3 rounded-lg border border-red-200">
                Currently Out of Stock. Join our Mailing List!
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
