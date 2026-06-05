import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { CreditCard, Truck, ClipboardList, CheckSquare, ShieldCheck, Square } from 'lucide-react';
import API_URL from '../../api';

interface CheckoutProps {
  setView: (v: string) => void;
  setCompletedOrder: (order: any) => void;
}

export default function Checkout({ setView, setCompletedOrder }: CheckoutProps) {
  const { user, isAuthenticated, apiFetch } = useAuth();
  const { cart, cartSubtotal, cartCount, clearCart } = useCart();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(user?.address?.street || '');
  const [city, setCity] = useState(user?.address?.city || '');
  const [state, setState] = useState(user?.address?.state || 'Telangana');
  const [pincode, setPincode] = useState(user?.address?.pincode || '');
  
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorVal, setErrorVal] = useState('');

  // Auto pre-fill if auth credentials resolve
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setStreet(user.address?.street || '');
      setCity(user.address?.city || '');
      setState(user.address?.state || 'Telangana');
      setPincode(user.address?.pincode || '');
    }
  }, [user]);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Razorpay Interactive Payment details
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  // Load shipping charge and threshold dynamically from DB settings
  const [freeThreshold, setFreeThreshold] = useState(1000);
  const [deliveryCharge, setDeliveryCharge] = useState(100);
  const [deliveryFreeReason, setDeliveryFreeReason] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data?.freeShippingThreshold !== undefined) setFreeThreshold(data.freeShippingThreshold);
      })
      .catch(() => {});
  }, []);

  // Recalculate delivery whenever pincode, state, or cart total changes
  useEffect(() => {
    if (cartSubtotal >= freeThreshold) {
      setDeliveryCharge(0);
      setDeliveryFreeReason('order_threshold');
      return;
    }
    fetch(`${API_URL}/api/delivery/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode, state })
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setDeliveryCharge(data.deliveryCharge);
          setDeliveryFreeReason(data.isFree ? data.reason : '');
        }
      })
      .catch(() => {});
  }, [pincode, state, cartSubtotal, freeThreshold]);

  // Discount computation
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'PERCENTAGE') {
      discountAmount = (cartSubtotal * appliedCoupon.value) / 100;
    } else {
      discountAmount = appliedCoupon.value;
    }
  }

  const totalPayable = Math.max(0, cartSubtotal + deliveryCharge - discountAmount);

  const handleValidateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode) return;

    setCouponLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, cartTotal: cartSubtotal })
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.message || 'Validation failed');
      }

      setAppliedCoupon(result.coupon);
      setCouponSuccess(`✓ Coupon "${result.coupon.code.toUpperCase()}" applied successfully!`);
    } catch (err: any) {
      setCouponError(err.message || 'Invalid discount coupon');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleConfirmPayment = async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string | null, isMock: boolean) => {
    setRazorpayModalOpen(false);
    setLoading(true);
    setErrorVal('');

    try {
      const payload = {
        razorpay_payment_id: razorpayPaymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: razorpaySignature,
        items: cart.map(item => ({
          productId: item.productId,
          name: item.product?.name || 'Sourced Product',
          qty: item.qty,
          unitPrice: item.product?.discountPrice ?? item.product?.price ?? 0,
          weight: item.product?.weight || 250
        })),
        subtotal: cartSubtotal,
        shippingCharge: deliveryCharge,
        total: totalPayable,
        couponId: appliedCoupon ? appliedCoupon.id : undefined,
        shippingAddress: {
          name,
          email,
          phone,
          street,
          city,
          state,
          pincode
        },
        isMockPay: isMock
      };

      const res = await apiFetch(`${API_URL}/api/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const orderResult = await res.json();

      if (!res.ok) {
        throw new Error(orderResult.message || 'Signature verification code mismatch or stock conflict');
      }

      await clearCart();
      setCompletedOrder(orderResult);
      setView('orderConfirm');
    } catch (err: any) {
      setErrorVal(err.message || 'Failed to complete traditional payment routing.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorVal('');

    if (!name || !email || !phone || !street || !city || !pincode) {
      setErrorVal('Please complete all required fields containing asterisk (*)');
      return;
    }

    if (!agreeTerms) {
      setErrorVal('You must accept the Vedic Store policies and terms before purchase');
      return;
    }

    if (!isAuthenticated) {
      setErrorVal('You must be Signed In to place orders and persist invoices! Please click "Sign In" at the top-right before checkout.');
      return;
    }

    setLoading(true);
    try {
      // 1. Backend creation for secure payload
      const createOrderRes = await apiFetch(`${API_URL}/api/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: totalPayable })
      });

      if (!createOrderRes.ok) {
        const errObj = await createOrderRes.json();
        throw new Error(errObj.message || 'Payment Order initialization refused by remote endpoint.');
      }

      const createOrderData = await createOrderRes.json();
      const { razoOrder, keyId, isMock } = createOrderData;

      // 2. Try client-side script
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded || isMock) {
        // Overlay beautiful secure checkout portal inside sandboxed frames
        setPaymentDetails({ orderId: razoOrder.id, amount: totalPayable });
        setRazorpayModalOpen(true);
        setLoading(false);
        return;
      }

      // 3. Mount and trigger Razorpay native dialog
      const options = {
        key: keyId,
        amount: razoOrder.amount,
        currency: razoOrder.currency,
        name: 'Godhara Traditional',
        description: 'Vedic Organic & Gau Seva Products',
        order_id: razoOrder.id,
        handler: function (response: any) {
          handleConfirmPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            false
          );
        },
        prefill: {
          name: name,
          email: email,
          contact: phone
        },
        notes: {
          address: `${street}, ${city}, ${state} - ${pincode}`
        },
        theme: {
          color: '#E8820C'
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp1 = new (window as any).Razorpay(options);
      rzp1.open();
    } catch (err: any) {
      setErrorVal(err.message || 'Failed to initialize payment gateway.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-10 select-none">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#6B2D0E] border-b border-[#D4B896] pb-4 mb-8 flex items-center gap-2">
          <ClipboardList size={22} className="text-[#E8820C]" />
          Checkout & Dispatch Info
        </h1>

        {/* Guest Warning */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3">
            <ShieldCheck size={20} className="text-[#E8820C] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Sign-in Session Required</h4>
              <p className="text-[11px] text-[#2C1810]/80 mt-1 leading-snug">
                To download beautiful PDF invoices, track order dispatches from associated Gaushalas, and map items dynamically to your profiles, you must have an active session. Please register or sign in using the button above.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: SHIPPING SHIELDS FORM */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-2xl border border-[#D4B896]/50 shadow-sm flex flex-col gap-6">
            <h3 className="font-serif text-lg font-bold text-[#6B2D0E] border-b border-stone-100 pb-2 mb-2 flex items-center gap-2">
              <Truck size={16} className="text-[#E8820C]" />
              Shipping Destination
            </h3>

            {errorVal && (
              <div className="bg-red-50 text-red-700 text-xs font-semibold p-3.5 rounded-lg border border-red-100 leading-snug">
                {errorVal}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase text-stone-500">Full Recipient Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Laxman Rao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/80 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C] uppercase tracking-wide"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-stone-500">Contact Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. laxman@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/80 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-stone-500">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/80 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                />
              </div>

              <div className="flex flex-col gap-1.5 col-span-1 sm:col-span-2">
                <label className="text-[11px] font-bold uppercase text-stone-500">Street Address with landmark *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Door No. 4-102, Temple Compound"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/80 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-stone-500">City / Village *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Banswada"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/80 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-stone-500">State *</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/80 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                >
                  <option value="Telangana">Telangana</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Kerala">Kerala</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold uppercase text-stone-500">Pincode (ZIP) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 503187"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="bg-stone-50 border border-[#D4B896]/80 text-[#2C1810] text-xs font-medium rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-[#E8820C] uppercase tracking-wider"
                />
              </div>
            </div>

            <div className="mt-4 border-t border-stone-100 pt-6">
              <div
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="flex items-start gap-2.5 text-xs text-stone-500 cursor-pointer select-none"
              >
                {agreeTerms ? (
                  <CheckSquare size={16} className="text-[#6B2D0E] shrink-0" />
                ) : (
                  <Square size={16} className="text-stone-300 shrink-0" />
                )}
                <span>I explicitly authorize the delivery teams and certify that my details match my authentic physical residential/commercial destination.</span>
              </div>
            </div>

          </div>

          {/* RIGHT: BILLS SUMMARY & SUBMITS */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-[#D4B896]/50 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-[#6B2D0E] border-b border-stone-100 pb-3 mb-4 flex items-center gap-1.5">
                <CreditCard size={16} className="text-[#E8820C]" />
                Billing Summary
              </h3>

              {/* Items overview scrollable list */}
              <div className="flex flex-col gap-3.5 max-h-48 overflow-y-auto mb-5 border-b border-dashed border-stone-100 pb-5">
                {cart.map(item => (
                  <div key={item.productId} className="flex justify-between items-start gap-4 text-xs">
                    <div className="flex-1">
                      <p className="font-semibold text-[#2C1810] line-clamp-1">{item.product?.name}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">₹{(item.product?.discountPrice ?? item.product?.price ?? 0).toLocaleString()} x {item.qty}</p>
                    </div>
                    <span className="font-bold text-[#6B2D0E] shrink-0">₹{(((item.product?.discountPrice ?? item.product?.price ?? 0)) * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 text-xs text-[#2C1810]/80">
                <div className="flex justify-between items-center text-sm">
                  <span>Goods Cost:</span>
                  <span className="font-bold">₹{cartSubtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center pb-2">
                  <span>Traditional Delivery Fee:
                    {deliveryCharge === 0 && deliveryFreeReason === 'store_service_area' && (
                      <span className="ml-1 text-[9px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded uppercase">Store Area</span>
                    )}
                    {deliveryCharge === 0 && deliveryFreeReason === 'free_delivery_pincode' && (
                      <span className="ml-1 text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded uppercase">Free Pincode</span>
                    )}
                  </span>
                  {deliveryCharge === 0 ? (
                    <span className="text-green-600 font-bold uppercase">FREE</span>
                  ) : (
                    <span className="font-bold">₹{deliveryCharge.toLocaleString()}</span>
                  )}
                </div>

                {/* Apply Coupon input box */}
                <div className="border-t border-b border-dashed border-stone-100 py-3 my-1">
                  <span className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide mb-1.5">Apply Sacred Coupon</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. GODHARA10"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-grow bg-stone-50 border border-[#D4B896]/70 text-[#2C1810] text-xs font-semibold rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-[#E8820C]"
                    />
                    <button
                      type="button"
                      disabled={couponLoading}
                      onClick={handleValidateCoupon}
                      className="bg-[#6B2D0E] text-white text-[10px] font-bold px-3 py-2 rounded-lg hover:bg-[#E8820C] duration-150 transition-all cursor-pointer uppercase"
                    >
                      {couponLoading ? 'Check...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-red-600 font-bold mt-1.5">{couponError}</p>}
                  {couponSuccess && <p className="text-[10px] text-green-600 font-bold mt-1.5">{couponSuccess}</p>}
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-xs text-green-600 font-bold border-b border-dashed border-stone-100 pb-2">
                    <span>Coupon Discount:</span>
                    <span>-₹{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-base py-2">
                  <span className="font-serif font-black text-[#6B2D0E]">Payable Total:</span>
                  <span className="text-xl font-black text-[#6B2D0E]">₹{totalPayable.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Info banner (Auto simulator cod / pre-paid for ease of exploration) */}
              <div className="mt-6 p-4 bg-[#F5EFE6] rounded-xl border border-[#D4B896]/40 text-xs">
                <p className="font-bold text-[#6B2D0E] flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#E8820C]" />
                  Secure Traditional Checkout Method
                </p>
                <p className="text-[10px] text-stone-500 mt-1 lines-relaxed leading-normal">
                  To provide absolute safety for our patrons, checkout processes are pre-paid through BHIM UPI, Card, NetBanking, or pay-on-delivery. Placing your order creates a live invoice and labels.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || cartCount === 0}
                className="w-full bg-[#E8820C] hover:bg-[#6B2D0E] disabled:bg-stone-300 text-white font-bold py-4 rounded-full shadow hover:shadow-md mt-6 select-none transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                {loading ? 'Processing Vedic Channels...' : `Place Order (₹${totalPayable.toLocaleString()})`}
              </button>
            </div>

          </div>

        </form>

        {/* ========================================== */}
        {/* RAZORPAY SECURE GATEWAY SIMULATOR MODAL     */}
        {/* ========================================== */}
        {razorpayModalOpen && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-200">
            <div className="bg-[#111116] text-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-stone-800 animate-in fade-in-50 zoom-in-95 duration-150">
              
              {/* Header bar mirroring Razorpay standard style */}
              <div className="bg-[#058CF5] px-6 py-5 flex justify-between items-center border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-black text-[#058CF5] text-sm shadow-md">
                    R
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-wider opacity-90 uppercase">Godhara Products</h4>
                    <p className="text-[10px] text-white/70 font-mono mt-0.5">Order Ref: {paymentDetails?.orderId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-white/80">Amount To Pay</p>
                  <p className="text-lg font-black text-white">₹{totalPayable.toLocaleString()}.00</p>
                </div>
              </div>

              {/* Client specifications panel */}
              <div className="p-6 flex flex-col gap-5 text-stone-300">
                
                <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="block text-[9px] text-stone-500 font-extrabold uppercase tracking-wide">Recipient Patron</span>
                    <span className="font-semibold text-stone-100 uppercase mt-0.5 block">{name}</span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-stone-500 font-extrabold uppercase tracking-wide">Contact Email</span>
                    <span className="font-medium text-stone-300 mt-0.5 block truncate">{email}</span>
                  </div>
                </div>

                {/* Gateway channels selection */}
                <div>
                  <span className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 text-center">
                    SELECT SANDBOX BILLING CHANNEL
                  </span>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-stone-950 border border-[#058CF5]/60 hover:border-[#058CF5] p-4 rounded-xl flex flex-col gap-1.5 items-center justify-center cursor-pointer hover:bg-stone-900/50 transition-all duration-150 group">
                      <span className="text-2xl group-hover:scale-110 transition-transform">💳</span>
                      <span className="text-xs font-bold text-[#058CF5]">Credit Card</span>
                      <span className="text-[8px] text-stone-500 font-semibold uppercase">Immediate verification</span>
                    </div>
                    <div className="bg-stone-950 border border-stone-800 hover:border-stone-700 p-4 rounded-xl flex flex-col gap-1.5 items-center justify-center cursor-pointer hover:bg-stone-900/50 transition-all duration-150 group">
                      <span className="text-2xl group-hover:scale-110 transition-transform">📱</span>
                      <span className="text-xs font-bold text-stone-300">UPI / QR Code</span>
                      <span className="text-[8px] text-stone-500 font-semibold uppercase">UPI Instant pay link</span>
                    </div>
                  </div>
                </div>

                {/* Trusted parameters banner */}
                <div className="bg-amber-950/20 rounded-lg p-3 border border-amber-500/20 text-[10px] text-stone-400 flex items-start gap-2 leading-relaxed">
                  <span className="text-xs">🛡️</span>
                  <span><strong>SECURE PREVIEW CHANNELS ACTIVE</strong><br />This dialog represents the official sandbox flow. Clicking "Authorize Securely" triggers backend verification and order processing.</span>
                </div>

                <div className="border-t border-dashed border-stone-800/80 pt-4 flex items-center justify-between text-[10px] text-stone-500 font-medium">
                  <span className="flex items-center gap-1">🔒 Razorpay PCI-DSS Compliant</span>
                  <span>Session Active: INR 🇮🇳</span>
                </div>

                {/* Submit buttons */}
                <div className="flex gap-3.5 mt-2">
                  <button
                    type="button"
                    onClick={() => setRazorpayModalOpen(false)}
                    className="flex-1 bg-stone-950 hover:bg-stone-900 text-stone-400 hover:text-white font-bold py-3 px-4 rounded-xl text-xs tracking-wider transition-all duration-150 cursor-pointer border border-stone-800"
                  >
                    ABORT PAYMENT
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => handleConfirmPayment(
                      paymentDetails?.orderId, 
                      `pay_GDH_${Date.now().toString().slice(-8)}`, 
                      `sig_GDH_${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 
                      true
                    )}
                    className="flex-1 bg-[#058CF5] hover:bg-[#0477cf] text-white font-black py-3 px-4 rounded-xl text-xs tracking-wider transition-all duration-150 cursor-pointer shadow-lg hover:shadow-[#058CF5]/10"
                  >
                    AUTHORIZE SECURELY
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

