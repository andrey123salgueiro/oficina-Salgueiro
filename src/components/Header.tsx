import React, { useRef } from 'react';
import { Wrench, Plus, Download, Upload, ShieldCheck, Bike, Database, Cloud } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface HeaderProps {
  onNewOrder: () => void;
  totalOrders: number;
  totalRevenue: number;
  totalBikes: number;
  onExportData: () => void;
  onImportData: (file: File) => void;
  onResetData: () => void;
  isBackendOnline?: boolean;
  isCloudSynced?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewOrder,
  totalOrders,
  totalRevenue,
  totalBikes,
  onExportData,
  onImportData,
  onResetData,
  isBackendOnline = true,
  isCloudSynced = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportData(file);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header className="bg-zinc-950/95 border-b border-zinc-800/80 backdrop-blur-md sticky top-0 z-30 no-print">
      {/* Top accent racing stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.5)]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Brand Identity with User's Official Logo */}
          <div className="flex items-center gap-3.5">
            <div className="relative group cursor-pointer">
              <img
                src="/assets/aistudio/Oficina_Salgueiro_Motos_em_Alta_Velocidade_be3762f3.png"
                alt="Oficina Salgueiro Motos Logo"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.35)] transform transition-transform group-hover:scale-105"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  Garantia & Peças
                </span>
                
                {/* Cloud Database Sync Status */}
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                  isCloudSynced
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/70 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                }`}>
                  <Cloud className={`w-3 h-3 ${isCloudSynced ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
                  <span>{isCloudSynced ? 'Banco em Nuvem Ativo (Celular & PC)' : 'Nuvem Conectando...'}</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 tracking-wide font-medium flex items-center gap-2 mt-0.5">
                <span>Gestão Mecânica</span>
                <span className="text-zinc-600">/</span>
                <span>Registro por Placa</span>
                <span className="text-zinc-600">/</span>
                <span>Histórico Técnico de Peças</span>
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center flex-wrap gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            <div className="hidden lg:flex items-center gap-3.5 px-3.5 py-1.5 rounded-lg bg-zinc-900/90 border border-zinc-800 text-xs shadow-inner">
              <div className="flex items-center gap-1.5 text-zinc-300">
                <Bike className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-zinc-400">Motos: <strong className="text-white font-mono">{totalBikes}</strong></span>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-400">
                <span>O.S.: <strong className="text-white font-mono">{totalOrders}</strong></span>
              </div>
              <span className="text-zinc-700">|</span>
              <div className="text-zinc-400">
                <span>Faturamento: <strong className="text-amber-400 font-mono font-bold">{formatCurrency(totalRevenue)}</strong></span>
              </div>
            </div>

            {/* Backup actions */}
            <div className="flex items-center gap-1.5">
              <button
                id="btn-export-backup"
                onClick={onExportData}
                title="Exportar backup dos dados da oficina (JSON)"
                className="px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline font-medium">Backup</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
                id="input-file-backup"
              />

              <button
                id="btn-import-backup"
                onClick={() => fileInputRef.current?.click()}
                title="Restaurar backup"
                className="px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-400" />
                <span className="hidden sm:inline font-medium">Restaurar</span>
              </button>

              <button
                id="btn-reset-demo"
                onClick={onResetData}
                title="Restaurar dados de teste / exemplo da oficina"
                className="px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-amber-400 border border-zinc-800 transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Database className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">Padrão</span>
              </button>
            </div>

            {/* Main Action: New Service Order */}
            <button
              id="btn-new-order"
              onClick={onNewOrder}
              className="relative group overflow-hidden px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <div className="absolute inset-0 w-1/2 h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-700 ease-out"></div>
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Nova O.S. (Concluir Serviço)</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
