import React, { useState, useEffect } from 'react';
import { COLORS } from '../constants';
import { Section } from '../types';

interface CookieBannerProps {
  onNavigate: (section: Section) => void;
}

const CookieBanner: React.FC<CookieBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('ariala_cookie_consent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ariala_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem('ariala_cookie_consent', 'rejected');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-[#1a1a1a] border-t border-gray-800 p-6 z-50 animate-in slide-in-from-bottom duration-500 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-gray-300 text-sm md:flex-1">
          <p className="mb-2">
            <strong>Uso de Cookies:</strong> Utilizamos cookies propias e de terceiros para mellorar a túa experiencia de navegación e analizar o uso da web.
          </p>
          <p className="text-xs text-gray-500">
            Podes obter máis información na nosa <button onClick={() => onNavigate(Section.COOKIES)} className="underline hover:text-white">Política de Cookies</button>.
          </p>
        </div>
        <div className="flex gap-4 flex-shrink-0">
          <button 
            onClick={handleReject}
            className="px-6 py-2 border border-gray-600 text-gray-300 text-xs font-bold uppercase tracking-widest hover:border-white hover:text-white transition-colors"
          >
            Rexeitar
          </button>
          <button 
            onClick={handleAccept}
            className="px-6 py-2 text-white text-xs font-bold uppercase tracking-widest transition-colors"
            style={{ backgroundColor: COLORS.mossGreen }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;