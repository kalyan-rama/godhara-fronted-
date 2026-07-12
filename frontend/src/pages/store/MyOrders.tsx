import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types';
import { ClipboardList, Download, Calendar, Truck, Package, ShoppingBag } from 'lucide-react';
import API_URL from '../../api';

interface MyOrdersProps {
  setView: (v: string) => void;
}

export default function MyOrders({ setView }: MyOrdersProps) {
  const { isAuthenticated, apiFetch } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMyOrders() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiFetch(`/api/orders/my`);
        if (res.ok) {
          const list = await res.json();
          list.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(list);
        }
      } catch (err) {
        console.error('Failed fetching user orders:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMyOrders();
  }, [isAuthenticated]);

  const handleDownloadInvoice = (orderId: string) => {
    window.open(`${API_URL}/api/orders/${orderId}/invoice`, '_blank');
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
    SHIPPED: 'bg-purple-100 text-purple-800 border-purple-200',
    DELIVERED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  };

  // --- NOT AUTHENTICATED ---
  if (!isAuthenticated) {
    return (
      <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-16 flex items-center justify-center select-none">
        <div className="max-w-md w-full mx-4 text-center bg-white border border-[#D4B896] p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-serif font-semibold text-[#6B2D0E]">Sign In to View Orders</h2>
          <p className="text-stone-500 text-xs mt-2">You must log in to explore your customized purchasing history!</p>
          <button
            onClick={() => setView('login')}
            className="w-full bg-[#6B2D0E] text-white py-3 rounded-full font-bold shadow-md mt-6"
          >
            Authenticate Session
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-10 select-none">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#6B2D0E] border-b border-[#D4B896] pb-4 mb-8 flex items-center gap-2">
          <ClipboardList size={22} className="text-[#E8820C]" />
          My Ancient Seva Orders
        </h1>

        {/* --- LOADING STATE --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[55vh]">
            <div className="relative">
              <div className="w-14 h-14 rounded-full border-4 border-[#D4B896]/40 border-t-[#6B2D0E] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <ClipboardList size={18} className="text-[#E8820C]" />
              </div>
            </div>
            <p className="mt-4 text-[#6B2D0E] font-semibold text-sm tracking-wide animate-pulse">
              Loading your orders...
            </p>
          </div>

        /* --- EMPTY STATE --- */
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-[#D4B896]/50 rounded-2xl p-6 shadow-sm">
            <div className="h-16 w-16 mx-auto bg-stone-50 text-stone-300 rounded-full flex items-center justify-center mb-4">
              <Package size={28} />
            </div>
            <h3 className="text-lg font-serif font-semibold text-stone-600">No Orders Logged Yet</h3>
            <p className="text-stone-500 text-xs mt-1 max-w-sm mx-auto">
              Every creation supports the sanctuary and provides high nutritious purity. Let us start your spiritual journey today.
            </p>
            <button
              onClick={() => setView('home')}
              className="mt-6 inline-flex items-center gap-2 bg-[#E8820C] text-white text-xs font-bold py-2.5 px-6 rounded-full hover:bg-[#6B2D0E]"
            >
              <ShoppingBag size={14} />
              Browse Traditional Items
            </button>
          </div>

        /* --- ORDERS LIST --- */
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-[#D4B896]/50 p-5 sm:p-6 shadow-sm flex flex-col gap-4 font-sans justify-between"
              >
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-100 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="font-serif font-bold text-sm bg-[#F5EFE6] px-3 py-1 text-[#6B2D0E] rounded border border-[#D4B896]/50">
                      {order.id}
                    </span>
                    <span className="text-xs text-stone-400 flex items-center gap-1">
                      <Calendar size={13} />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border ${statusColors[order.status] || 'bg-stone-100'}`}>
                      {order.status}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border bg-green-50 text-green-700 border-green-200">
                      Paid
                    </span>
                  </div>
                </div>

                {/* Items detail list */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-8 flex flex-col gap-2">
                    {order.items.map((item, i) => (
                      <div key={i} className="text-xs text-[#2C1810] flex items-center justify-between gap-4 max-w-md">
                        <span className="font-semibold text-stone-600 line-clamp-1">
                          {item.name}
                          {item.packageSize && <span className="text-stone-400 font-normal"> ({item.packageSize})</span>}
                          {' '}<span className="text-[#E8820C]">x {item.qty}</span>
                        </span>
                        <span className="font-bold text-[#6B2D0E]">₹{(item.qty * item.unitPrice).toLocaleString()}</span>
                      </div>
                    ))}
                    
                    {order.trackingNumber && (
                      <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#E8820C] font-semibold bg-[#F5EFE6]/50 border border-[#D4B896]/30 py-1.5 px-3 rounded-lg w-fit">
                        <Truck size={13} />
                        Gaushala Tracking No: <span className="font-black text-[#2C1810] uppercase pr-1">{order.trackingNumber}</span>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-4 self-stretch border-t sm:border-t-0 md:border-t-0 border-stone-100 pt-4 sm:pt-0">
                    <div className="text-left sm:text-right md:text-right flex flex-col">
                      <span className="text-[10px] text-stone-400 font-semibold uppercase leading-none">Net Charged</span>
                      <span className="text-lg font-black text-[#6B2D0E] mt-1">₹{order.total.toLocaleString()}</span>
                    </div>

                    <button
                      onClick={() => handleDownloadInvoice(order.id)}
                      className="bg-[#6B2D0E] hover:bg-[#E8820C] text-white text-xs font-bold py-2.5 px-4 rounded-full flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer select-none"
                    >
                      <Download size={13} />
                      Download Receipt PDF
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
