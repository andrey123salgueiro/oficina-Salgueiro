import React from 'react';
import { DollarSign, Wrench, Bike, ShieldCheck, Tag } from 'lucide-react';
import { ServiceOrder } from '../types';
import { formatCurrency, checkWarranty } from '../utils/formatters';

interface WorkshopStatsProps {
  orders: ServiceOrder[];
}

export const WorkshopStats: React.FC<WorkshopStatsProps> = ({ orders }) => {
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;

  // Unique plates
  const uniquePlates = new Set(orders.map(o => o.licensePlate)).size;

  // Orders in active warranty
  const inWarranty = orders.filter(o => checkWarranty(o.serviceDate, o.warrantyDays).isWithinWarranty).length;

  // Count top brands used in the workshop
  const brandCounts: { [brand: string]: number } = {};
  orders.forEach(o => {
    o.parts.forEach(p => {
      const b = p.brand.trim();
      if (b) {
        brandCounts[b] = (brandCounts[b] || 0) + 1;
      }
    });
  });

  const topBrands = Object.entries(brandCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 no-print">
      {/* Metric 1: Total Faturado - Golden Neon Gauge */}
      <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-amber-500/50 transition-all duration-300 shadow-lg shadow-black/50 hover:shadow-amber-500/10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-all"></div>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-chakra flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Faturamento Total
          </span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-inner">
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
          </div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-400 font-chakra tracking-tight tabular-nums">
          {formatCurrency(totalRevenue)}
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Serviços concluídos</span>
          <span className="text-zinc-400 font-mono font-medium">100% Salgueiro</span>
        </div>
      </div>

      {/* Metric 2: Atendimentos Realizados */}
      <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-lg shadow-black/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-chakra flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
            Ordens de Serviço
          </span>
          <div className="p-2 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/60 shadow-inner">
            <Wrench className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-chakra tracking-tight tabular-nums flex items-baseline gap-1.5">
          {totalOrders}
          <span className="text-xs text-zinc-400 font-normal font-sans">registros</span>
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Atendimentos na base</span>
          <span className="text-zinc-400 font-mono">O.S. ativas</span>
        </div>
      </div>

      {/* Metric 3: Motos Cadastradas */}
      <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-950 p-4 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 shadow-lg shadow-black/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-chakra flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Motos Registradas
          </span>
          <div className="p-2 rounded-lg bg-zinc-800 text-amber-400 border border-zinc-700/60 shadow-inner">
            <Bike className="w-4 h-4 stroke-[2.2]" />
          </div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-black text-white font-chakra tracking-tight tabular-nums flex items-baseline gap-1.5">
          {uniquePlates}
          <span className="text-xs text-zinc-400 font-normal font-sans">placas únicas</span>
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span>Histórico individual</span>
          <span className="text-amber-400/90 font-mono">Dossiê ativo</span>
        </div>
      </div>

      {/* Metric 4: Em Garantia Ativa */}
      <div className="relative group overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-emerald-950/20 p-4 rounded-xl border border-zinc-800 hover:border-emerald-500/40 transition-all duration-300 shadow-lg shadow-black/50">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-chakra flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Garantia Ativa (CDC)
          </span>
          <div className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-inner">
            <ShieldCheck className="w-4 h-4 stroke-[2.4]" />
          </div>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-400 font-chakra tracking-tight tabular-nums flex items-baseline gap-1.5">
          {inWarranty}
          <span className="text-xs text-zinc-400 font-normal font-sans">motos em prazo</span>
        </div>
        <div className="mt-2 pt-2 border-t border-zinc-800/80 flex items-center gap-1.5 text-[11px] text-zinc-400 overflow-hidden text-ellipsis whitespace-nowrap">
          <Tag className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">Top marcas: <strong className="text-zinc-200">{topBrands.map(b => b[0]).join(', ') || 'Peças cadastradas'}</strong></span>
        </div>
      </div>
    </div>
  );
};
