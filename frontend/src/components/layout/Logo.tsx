import React from 'react';
import API_URL from '../../api';

interface LogoProps {
  className?: string;
  size?: number; // width/height in px
  tinted?: boolean; // white-tinted footer layout fallback option
}

export default function Logo({ className = '', size = 52, tinted = false }: LogoProps) {
  const [customLogo, setCustomLogo] = React.useState<string>('/assets/logo.png');

  React.useEffect(() => {
    try {
      // Check local storage setting first for instant local preview feedback
      const stored = localStorage.getItem('gdh_brand_logo');
      if (stored) {
        setCustomLogo(stored);
      } else {
        // Also check if custom settings with custom logo exits
        fetch(`${API_URL}/api/settings`)
          .then(res => res.json())
          .then(data => {
            if (data && data.logoUrl) {
              setCustomLogo(data.logoUrl);
            }
          })
          .catch(err => console.error('Logo settings fetch error:', err));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Listen for storage events to update immediately of settings saved
  React.useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('gdh_brand_logo') || '/assets/logo.png';
      setCustomLogo(stored);
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('gdh_logo_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('gdh_logo_updated', handleStorageChange);
    };
  }, []);

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={customLogo}
        alt="Godhara Logo"
        width={size}
        height={size}
        className={`w-full h-full object-contain ${
          tinted 
            ? 'filter brightness-110 drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]' 
            : 'drop-shadow-[0_1px_3px_rgba(107,45,14,0.2)]'
        }`}
        referrerPolicy="no-referrer"
        onError={() => {
          // If the customLogo fails to load, gracefully fallback to default /assets/logo.png
          if (customLogo !== '/assets/logo.png') {
            setCustomLogo('/assets/logo.png');
          }
        }}
      />
    </div>
  );
}
