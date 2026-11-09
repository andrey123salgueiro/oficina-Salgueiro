import React from 'react';
import { cleanPlate, isMercosulPlate } from '../utils/formatters';

interface PlateBadgeProps {
  plate: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PlateBadge: React.FC<PlateBadgeProps> = ({ plate, size = 'md', className = '' }) => {
  const clean = cleanPlate(plate);
  const mercosul = isMercosulPlate(clean);

  if (!clean) {
    return <span className="text-zinc-500 font-mono text-sm">SEM PLACA</span>;
  }

  // Format characters
  let formattedText = clean;
  if (clean.length === 7) {
    if (mercosul) {
      formattedText = `${clean.slice(0, 3)} ${clean.slice(3)}`;
    } else {
      formattedText = `${clean.slice(0, 3)}-${clean.slice(3)}`;
    }
  }

  if (mercosul) {
    // Mercosul Plate Style - realistic embossed motorcycle plate with mounting holes
    return (
      <div
        id={`plate-badge-${clean}`}
        className={`relative inline-flex flex-col items-center bg-gradient-to-b from-white via-zinc-50 to-zinc-200 border-2 border-zinc-400 rounded-md shadow-md shadow-black/40 overflow-hidden select-none ring-1 ring-zinc-800 ${
          size === 'sm' ? 'w-24' : size === 'lg' ? 'w-36' : 'w-28'
        } ${className}`}
      >
        {/* Mounting screw rivets */}
        <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-zinc-400 border border-zinc-600 shadow-inner z-10"></span>
        <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-400 border border-zinc-600 shadow-inner z-10"></span>

        {/* Mercosul Blue Top Bar */}
        <div className="w-full bg-[#003399] flex items-center justify-between px-2 py-0.5 text-white shadow-xs">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="text-[8px] font-extrabold tracking-widest leading-none font-mono">BRASIL</span>
          </div>
          <span className="text-[7px] leading-none opacity-90 drop-shadow-xs">🇧🇷</span>
        </div>
        {/* Embossed Characters */}
        <div className={`w-full text-center text-zinc-950 font-black font-mono-plate tracking-widest drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] ${
          size === 'sm' ? 'text-xs py-0.5' : size === 'lg' ? 'text-lg py-1' : 'text-sm py-0.5'
        }`}>
          {formattedText}
        </div>
      </div>
    );
  }

  // Traditional Brazilian Grey Plate Style
  return (
    <div
      id={`plate-badge-trad-${clean}`}
      className={`relative inline-flex flex-col items-center bg-gradient-to-b from-zinc-200 to-zinc-300 border-2 border-zinc-400 rounded-md shadow-md shadow-black/40 overflow-hidden select-none ring-1 ring-zinc-800 ${
        size === 'sm' ? 'w-24' : size === 'lg' ? 'w-36' : 'w-28'
      } ${className}`}
    >
      <span className="absolute top-1 left-1 w-1 h-1 rounded-full bg-zinc-400 border border-zinc-600 shadow-inner z-10"></span>
      <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-zinc-400 border border-zinc-600 shadow-inner z-10"></span>
      <div className="w-full bg-zinc-300 text-zinc-700 text-[8px] font-bold text-center py-0.5 border-b border-zinc-400 leading-none tracking-wider">
        BR - BRASIL
      </div>
      <div className={`w-full text-center text-zinc-900 font-black font-mono-plate tracking-wider drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)] ${
        size === 'sm' ? 'text-xs py-0.5' : size === 'lg' ? 'text-lg py-1' : 'text-sm py-0.5'
      }`}>
        {formattedText}
      </div>
    </div>
  );
};
