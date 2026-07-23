import React from 'react';
import { Wrench, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Home() {
  return (
    <div className="bg-[#F5EFE6] text-[#2C1810] font-sans min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      
      {/* Decorative Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E8820C]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full bg-white/80 backdrop-blur-sm border border-[#D4B896] rounded-2xl p-8 sm:p-12 text-center shadow-lg relative z-10"
      >
        {/* Animated Maintenance Badge */}
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto w-20 h-20 rounded-full bg-[#6B2D0E]/10 border border-[#D4B896] flex items-center justify-center text-[#6B2D0E] mb-6 shadow-sm"
        >
          <Wrench size={38} strokeWidth={1.75} className="animate-pulse" />
        </motion.div>

        {/* Brand Tagline & Title */}
        <span className="text-xs font-bold text-[#E8820C] uppercase tracking-widest bg-[#E8820C]/10 px-3.5 py-1.5 rounded-full inline-block mb-3">
          Enhancing Your Sacred Experience
        </span>
        
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#6B2D0E] tracking-tight leading-tight">
          We’ll Be Back Soon!
        </h1>

        <p className="text-stone-600 font-sans text-sm sm:text-base leading-relaxed mt-4 max-w-lg mx-auto">
          Godhara is currently undergoing scheduled maintenance to improve our store and bring you a better experience. We appreciate your patience and look forward to serving you again shortly.
        </p>

        {/* Key Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 pt-8 border-t border-[#D4B896]/50">
          <div className="flex items-center gap-3 bg-[#F5EFE6]/60 p-3.5 rounded-xl border border-[#D4B896]/40 text-left">
            <Clock size={22} className="text-[#6B2D0E] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#2C1810]">Estimated Time</h4>
              <p className="text-[11px] text-stone-500">Back online within a few hours</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#F5EFE6]/60 p-3.5 rounded-xl border border-[#D4B896]/40 text-left">
            <ShieldCheck size={22} className="text-[#6B2D0E] shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-[#2C1810]">Existing Orders</h4>
              <p className="text-[11px] text-stone-500">All placed orders are processing as normal</p>
            </div>
          </div>
        </div>

        {/* Direct Contact / Support Option */}
        <div className="mt-8">
          <p className="text-xs text-stone-500 font-medium">
            Have an urgent query regarding an existing order?
          </p>
          <a
            href="https://wa.me/918978038932"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-xs font-bold text-white bg-[#25D366] hover:bg-[#128C7E] px-5 py-2.5 rounded-full shadow-md transition-all duration-200"
          >
            Reach Us on WhatsApp
          </a>
        </div>
      </motion.div>
    </div>
  );
}
