import React from 'react';
import { Check, Download, ShoppingBag, Send, Phone } from 'lucide-react';
import API_URL from '../../api';

interface OrderConfirmProps {
  order: any;
  setView: (v: string) => void;
}

export default function OrderConfirm({ order, setView }: OrderConfirmProps) {
  if (!order) {
    return (
      <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-16 flex items-center justify-center">
        <div className="max-w-md w-full mx-4 text-center bg-white border border-[#D4B896] p-8 rounded-2xl shadow-sm">
          <p className="font-serif text-[#6B2D0E] font-bold text-lg">No active order checkout context found</p>
          <button onClick={() => setView('home')} className="mt-6 bg-[#6B2D0E] text-white px-6 py-2.5 rounded-full">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadInvoice = () => {
    // Open in new tab which triggers streaming the PDF content
    window.open(`${API_URL}/api/orders/${order.id}/invoice`, '_blank');
  };

  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-screen py-16 select-none">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        <div className="bg-white rounded-2xl border border-[#D4B896]/60 p-6 sm:p-10 shadow-sm text-center flex flex-col items-center">
          
          {/* Animated check green bubble */}
          <div className="h-16 w-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mb-6 border border-green-200 shadow-inner">
            <Check size={32} strokeWidth={3} className="animate-bounce" />
          </div>

          <p className="text-[#E8820C] text-xs font-bold uppercase tracking-widest font-sans">
            Jay Shree Krishna! Order Confirmed
          </p>
          
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-[#6B2D0E] mt-1 leading-tight">
            Thank You For Supporting !
          </h1>
          
          <p className="text-stone-500 text-xs mt-3 leading-relaxed max-w-md">
            Your e-commerce purchase has been logged. Stock has been atomically deducted, t. An email has been sent to you with your official attached receipt.
          </p>

          {/* Quick Invoice Details Box */}
          <div className="w-full bg-[#F5EFE6]/60 rounded-xl border border-[#D4B896]/30 p-5 my-8 text-left text-xs font-sans text-stone-700 flex flex-col gap-2.5">
            <div className="flex justify-between border-b border-[#D4B896]/20 pb-2">
              <span className="font-semibold uppercase tracking-wider text-[#6B2D0E]">Order Reference No:</span>
              <span className="font-black text-[#2C1810]">{order.id}</span>
            </div>
            
            <div className="flex justify-between border-b border-[#D4B896]/20 pb-2">
              <span className="font-semibold uppercase tracking-wider text-[#6B2D0E]">Payment Authorization:</span>
              <span className="font-bold text-green-700 uppercase">{order.paymentStatus || 'PAID'}</span>
            </div>

            <div className="flex justify-between border-b border-[#D4B896]/20 pb-2">
              <span className="font-semibold uppercase tracking-wider text-[#6B2D0E]">Billed Recipient:</span>
              <span className="font-bold text-[#2C1810]">{order.shippingAddress.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold uppercase tracking-wider text-[#6B2D0E]">Grand Total Charged:</span>
              <span className="font-black text-[#6B2D0E] text-sm">₹{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* ACTIONS AND EXTRAS */}
          <div className="w-full flex flex-col sm:flex-row gap-3.5 select-none font-sans">
            <button
              onClick={handleDownloadInvoice}
              className="flex-1 bg-[#6B2D0E] hover:bg-[#E8820C] text-white font-bold h-12 rounded-full flex items-center justify-center gap-2 shadow hover:shadow-md transition-all cursor-pointer text-xs uppercase tracking-wider"
              id="gdh-order-confirm-download-invoice-btn"
            >
              <Download size={15} />
              Download Invoice PDF
            </button>

            <button
              onClick={() => {
                setView('home');
                window.scrollTo({ top: 0 });
              }}
              className="flex-1 border-2 border-[#D4B896] hover:bg-[#F5EFE6] text-[#6B2D0E] font-bold h-12 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer text-xs uppercase tracking-wider"
            >
              <ShoppingBag size={15} />
              Continue Shopping
            </button>
          </div>

          <p className="text-[10px] text-stone-400 mt-8 flex items-center gap-1.5 justify-center leading-none">
            <Phone size={10} className="text-[#E8820C]" />
            Need instant pooja changes? Contact us on WhatsApp +91 8978038932.
          </p>

        </div>

      </div>
    </div>
  );
}
