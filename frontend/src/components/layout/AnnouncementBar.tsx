import React from 'react';

export default function AnnouncementBar() {
  return (
    <div
      id="announcement-bar-gdh"
      className="bg-[#E8820C] text-white text-xs sm:text-sm py-1.5 px-4 font-medium text-center tracking-wide shadow-sm"
    >
      Shop <span className="font-extrabold">₹1,000</span> or more to Get{' '}
      <span className="bg-white text-[#E8820C] px-1.5 py-0.5 rounded font-bold text-[11px] uppercase tracking-wider ml-1">
        Free Shipping
      </span>
    </div>
  );
}
