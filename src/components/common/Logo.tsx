import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  const titleSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Insignia: Heraldic Eagle + Golden Scales of Justice */}
      <div className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-[#0B192C] via-[#0E223D] to-[#060D17] border border-[#C5A059]/40 flex items-center justify-center shadow-lg shadow-[#0B192C]/80 shrink-0 group`}>
        <div className="absolute inset-0 rounded-xl bg-[#C5A059]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
        >
          {/* Eagle Wings stylized upward arc */}
          <path
            d="M6 24C10 16 18 10 24 10C30 10 38 16 42 24C36 21 30 20 24 21C18 20 12 21 6 24Z"
            fill="url(#goldGradient)"
            opacity="0.95"
          />
          {/* Eagle Crest / Crown */}
          <path
            d="M24 6L26.5 11.5L24 13L21.5 11.5L24 6Z"
            fill="#F5E8C2"
          />
          {/* Scales of Justice Central Pillar */}
          <line
            x1="24"
            y1="12"
            x2="24"
            y2="38"
            stroke="#C5A059"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Scales Beam */}
          <line
            x1="12"
            y1="18"
            x2="36"
            y2="18"
            stroke="#E4C47C"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Left Pan strings & Pan */}
          <line x1="13" y1="18" x2="9" y2="28" stroke="#A68239" strokeWidth="1.2" />
          <line x1="17" y1="18" x2="21" y2="28" stroke="#A68239" strokeWidth="1.2" />
          <path
            d="M8 28C8 31.5 22 31.5 22 28Z"
            fill="url(#panGradient)"
            stroke="#C5A059"
            strokeWidth="1.2"
          />
          {/* Right Pan strings & Pan */}
          <line x1="31" y1="18" x2="27" y2="28" stroke="#A68239" strokeWidth="1.2" />
          <line x1="35" y1="18" x2="39" y2="28" stroke="#A68239" strokeWidth="1.2" />
          <path
            d="M26 28C26 31.5 40 31.5 40 28Z"
            fill="url(#panGradient)"
            stroke="#C5A059"
            strokeWidth="1.2"
          />
          {/* Base Stand */}
          <path
            d="M17 38H31"
            stroke="#C5A059"
            strokeWidth="3"
            strokeLinecap="round"
          />

          <defs>
            <linearGradient id="goldGradient" x1="6" y1="10" x2="42" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFF0CA" />
              <stop offset="0.5" stopColor="#D4AF37" />
              <stop offset="1" stopColor="#99752D" />
            </linearGradient>
            <linearGradient id="panGradient" x1="8" y1="28" x2="22" y2="31" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F5E8C2" />
              <stop offset="1" stopColor="#A68239" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-serif font-bold ${titleSize} tracking-tight text-white`}>
            Law<span className="gold-gradient-text">Eagle</span>
          </span>
          <span className="text-[10px] tracking-wider text-[#C5A059] uppercase font-sans font-semibold border border-[#C5A059]/40 px-1 py-0.2 rounded">
            NG
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] text-slate-400 font-sans tracking-tight mt-0.5">
            Where Lawyers Meet, Learn &amp; Win
          </span>
        )}
      </div>
    </div>
  );
};
