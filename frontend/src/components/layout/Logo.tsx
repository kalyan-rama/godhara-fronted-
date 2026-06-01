import React from 'react';
import API_URL from '../../api';

interface LogoProps {
  className?: string;
  size?: number;
  tinted?: boolean;
}

export default function Logo({
  className = '',
  size = 52,
  tinted = false,
}: LogoProps) {
  const [customLogo, setCustomLogo] = React.useState<string>('/logo.png');

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem('gdh_brand_logo');

      if (stored) {
        setCustomLogo(stored);
      } else {
        fetch(`${API_URL}/api/settings`)
          .then(async (res) => {
            if (!res.ok) return null;
            return res.json();
          })
          .then((data) => {
            if (data?.logoUrl) {
              setCustomLogo(data.logoUrl);
            }
          })
          .catch((err) =>
            console.error('Logo settings fetch error:', err)
          );
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  React.useEffect(() => {
    const handleStorageChange = () => {
      const stored =
        localStorage.getItem('gdh_brand_logo') || '/logo.png';

      setCustomLogo(stored);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('gdh_logo_updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'gdh_logo_updated',
        handleStorageChange
      );
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
          if (customLogo !== '/logo.png') {
            setCustomLogo('/logo.png');
          }
        }}
      />
    </div>
  );
}
