import React from 'react';
import { useCart } from '../../context/CartContext';
import { ShoppingBag, Trash2, ArrowRight, ShieldAlert, Truck } from 'lucide-react';

interface CartProps {
  setView: (v: string) => void;
}

export default function Cart({ setView }: CartProps) {
  const { cart, cartSubtotal, cartCount, cartWeight, updateCartQty, removeFromCart } = useCart();
  const freeThreshold = 1000;
  const deliveryCharge = cartSubtotal >= freeThreshold ? 0 : 100;
  const grandTotal = cartSubtotal + deliveryCharge;

  const handleCheckoutNav = () => {
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (cart.length === 0) {
    return (
      <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-16 flex items-center justify-center select-none">
        <div className="max-w-md w-full mx-4 text-center bg-white border border-[#D4B896]/50 p-8 rounded-2xl shadow-sm">
          <div className="h-20 w-20 rounded-full bg-amber-50 mx-auto flex items-center justify-center text-[#E8820C] mb-6">
            <ShoppingBag size={38} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-serif font-semibold text-[#6B2D0E]">Your Cart is Empty</h2>
          <p className="text-stone-500 text-xs mt-2 leading-relaxed">
            Every product supports rural Indian Gaushalas, small artisans, and cow farmers. Explore our pure categories and heal your home!
          </p>
          <button
            onClick={() => setView('home')}
            className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white font-bold py-3.5 rounded-full shadow-md mt-8 select-none transition-colors cursor-pointer"
          >
            Explore Traditional Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-12 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#6B2D0E] border-b border-[#D4B896] pb-4 mb-8">
          Shopping Bag ({cartCount} {cartCount === 1 ? 'item' : 'items'})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: CART ITEMS ITEMS */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {cart.map(item => {
              if (!item.product) return null;
              const product = item.product;
              const finalPrice = product.discountPrice ?? product.price;

              return (
                <div
                  key={product.id}
                  className="bg-white border border-[#D4B896]/40 p-4 rounded-xl flex items-center gap-4 hover:shadow-sm transition-all"
                >
                  <div className="h-20 w-20 sm:h-24 sm:w-24 bg-stone-50 rounded-lg overflow-hidden border border-now-100 shrink-0">
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row justify-between h-full gap-4">
                    <div className="flex-1">
                      <p className="text-[10px] text-[#E8820C] uppercase tracking-wider font-extrabold">{product.category}</p>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-[#2C1810] leading-tight mt-0.5 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-xs text-stone-400 mt-1">({product.weight}g net weight)</p>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center border border-[#D4B896] rounded-full h-8 bg-stone-50 font-bold text-xs">
                          <button
                            onClick={() => updateCartQty(product.id, item.qty - 1)}
                            className="px-2.5 text-stone-600 hover:bg-stone-100 h-full cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-2 bg-white w-7 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateCartQty(product.id, item.qty + 1)}
                            className="px-2.5 text-stone-600 hover:bg-stone-100 h-full cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(product.id)}
                          className="text-stone-400 hover:text-red-600 transition-colors flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                        >
                          <Trash2 size={13} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col items-start sm:items-end justify-between self-stretch shrink-0 font-sans">
                      <div className="flex flex-col items-start sm:items-end">
                        <span className="text-base font-black text-[#6B2D0E]">₹{(finalPrice * item.qty).toLocaleString()}</span>
                        {item.qty > 1 && (
                          <span className="text-[10px] text-stone-400 font-semibold">(₹{finalPrice.toLocaleString()} each)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: PRICING SUMMARIES CARD */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            {/* Free Shipping Progress Alert */}
            <div className="bg-white border border-[#D4B896] rounded-xl p-5 shadow-sm overflow-hidden relative">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full shrink-0 ${cartSubtotal >= freeThreshold ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  <Truck size={20} />
                </div>
                <div>
                  {cartSubtotal >= freeThreshold ? (
                    <>
                      <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider">Free Shipping Unlocked!</h4>
                      <p className="text-[11px] text-stone-500 mt-1">Gau products are on their way to you with ₹0 shipping charge.</p>
                    </>
                  ) : (
                    <>
                      <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">Free Shipping Progress Bar</h4>
                      <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                        Add <span className="font-bold text-[#6B2D0E]">₹{(freeThreshold - cartSubtotal).toLocaleString()}</span> more to your cart to bypass standard ₹100 delivery!
                      </p>
                      
                      {/* Percent Slider indicator */}
                      <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
                        <div
                          className="bg-[#E8820C] h-full rounded-full transition-all duration-300"
                          style={{ width: `${(cartSubtotal / freeThreshold) * 100}%` }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Overview Card */}
            <div className="bg-white border border-[#D4B896] rounded-xl p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#6B2D0E] border-b border-stone-100 pb-3 mb-4">
                Order Invoice Summary
              </h3>

              <div className="flex flex-col gap-3 font-sans text-xs text-[#2C1810]/80 font-medium">
                <div className="flex items-center justify-between">
                  <span>Cart Items Count:</span>
                  <span className="font-bold text-stone-700">{cartCount} items</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Cart Gross Weight:</span>
                  <span className="font-bold text-stone-700">{(cartWeight / 1000).toFixed(2)} kg</span>
                </div>

                <div className="flex items-center justify-between text-sm py-1">
                  <span>Goods Subtotal:</span>
                  <span className="font-black text-[#6B2D0E] text-sm">₹{cartSubtotal.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between border-b border-dashed border-stone-100 pb-3">
                  <span>Shipping & Handling Charge:</span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600 font-bold uppercase">FREE</span>
                  ) : (
                    <span className="font-bold">₹{deliveryCharge.toFixed(2)}</span>
                  )}
                </div>

                <div className="flex items-center justify-between text-base py-3 leading-none">
                  <span className="font-serif font-black text-[#6B2D0E]">GRAND TOTAL:</span>
                  <span className="text-lg font-black text-[#6B2D0E]">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>

              {/* Secure Trust Badge */}
              <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-100 flex items-center gap-2.5 text-[10px] text-stone-500">
                <ShieldAlert size={16} className="text-[#E8820C]" />
                <span>GST 5% is fully included in the items listed above. Zero surprise margins!</span>
              </div>

              <button
                onClick={handleCheckoutNav}
                className="w-full bg-[#6B2D0E] hover:bg-[#E8820C] text-white font-bold py-3.5 rounded-full shadow hover:shadow-md mt-6 select-none transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight size={15} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
