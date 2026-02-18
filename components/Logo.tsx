
import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => {
  return (
    <div className={`${className} flex flex-col items-center justify-center select-none`}>
      <svg viewBox="0 0 300 150" className="w-full max-w-[300px] h-auto drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="50%" y="80" textAnchor="middle" fill="white" className="font-black" style={{ fontSize: '72px', letterSpacing: '-0.05em' }}>
          A RIALA
        </text>
        <rect x="70" y="90" width="160" height="2" fill="#4a5d23" opacity="0.8" />
        <text x="50%" y="130" textAnchor="middle" fill="#4a5d23" className="font-light" style={{ fontSize: '24px', letterSpacing: '0.6em' }}>
          TABERNA
        </text>
      </svg>
    </div>
  );
};

export default Logo;
