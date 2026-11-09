import React from 'react';
import { Search, X, ShieldAlert, Sparkles, Filter } from 'lucide-react';
import { cleanPlate } from '../utils/formatters';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  warrantyFilter: 'all' | 'warranty-only' | 'expired-only';
  onWarrantyFilterChange: (filter: 'all' | 'warranty-only' | 'expired-only') => void;
  recentPlates: string[];
  onSelectQuickPlate: (plate: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  warrantyFilter,
  onWarrantyFilterChange,
  recentPlates,
  onSelectQuickPlate,
}) => {
  return (
    <div className="relative bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-2xl shadow-black/80 space-y-4 no-print overflow-hidden">
      {/* Decorative motorsport carbon edge */}
      <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-amber-400 to-transparent"></div>
      
      {/* Main Search Plate Radar Input */}
      <div>
        <label htmlFor="input-search-records" className="block text-[11px] font-bold text-amber-400 uppercase tracking-widest font-chakra mb-1.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            Localizador Rápido de Moto & Dossiê
          </span>
          <span className="text-zinc-500 font-mono text-[10px] normal-case">
            Ex: Placa (BRA2E19), Nome do Cliente, ou Marca da Peça
          </span>
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-amber-400">
            <Search className="w-5 h-5 stroke-[2.5]" />
          </div>
          <input
            id="input-search-records"
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Digite a PLACA da moto, nome do cliente, serviço ou peça trocada..."
            className="w-full pl-12 pr-12 py-3.5 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-white placeholder-zinc-500 text-sm sm:text-base font-medium focus:outline-hidden focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-inner"
          />
          {searchTerm && (
            <button
              id="btn-clear-search"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-zinc-400 hover:text-amber-400 transition-colors cursor-pointer"
              title="Limpar busca"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Access Badges & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-zinc-800/80">
        {/* Quick Plates Suggestions (Motorcycle miniature plates) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1 uppercase tracking-wider font-chakra">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Placas na oficina:
          </span>
          {recentPlates.slice(0, 5).map((plate) => (
            <button
              key={plate}
              type="button"
              id={`quick-plate-${cleanPlate(plate)}`}
              onClick={() => onSelectQuickPlate(plate)}
              className="px-2.5 py-1 text-xs font-mono font-bold bg-zinc-950 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 border border-zinc-700 hover:border-amber-400 rounded-md transition-all shadow-xs transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              {plate}
            </button>
          ))}
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs shadow-inner">
          <button
            id="filter-warranty-all"
            type="button"
            onClick={() => onWarrantyFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs tracking-wide transition-all cursor-pointer ${
              warrantyFilter === 'all'
                ? 'bg-amber-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Todos
          </button>
          <button
            id="filter-warranty-valid"
            type="button"
            onClick={() => onWarrantyFilterChange('warranty-only')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              warrantyFilter === 'warranty-only'
                ? 'bg-emerald-500 text-zinc-950 shadow-md'
                : 'text-zinc-400 hover:text-emerald-300'
            }`}
            title="Filtrar serviços feitos há menos de 90 dias"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${warrantyFilter === 'warranty-only' ? 'bg-zinc-950' : 'bg-emerald-400'}`}></span>
            Em Garantia (≤90d)
          </button>
          <button
            id="filter-warranty-expired"
            type="button"
            onClick={() => onWarrantyFilterChange('expired-only')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs tracking-wide transition-all cursor-pointer flex items-center gap-1.5 ${
              warrantyFilter === 'expired-only'
                ? 'bg-zinc-700 text-white shadow-md'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Filtrar serviços com mais de 90 dias"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            Expiradas
          </button>
        </div>
      </div>
    </div>
  );
};
