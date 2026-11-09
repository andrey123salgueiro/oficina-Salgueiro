import React from 'react';
import { 
  Printer, 
  Trash2, 
  Edit3, 
  Clock, 
  Search, 
  Calendar, 
  Gauge, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  ChevronRight,
  Package,
  Wrench
} from 'lucide-react';
import { ServiceOrder } from '../types';
import { PlateBadge } from './PlateBadge';
import { formatCurrency, formatDate, formatMileage, checkWarranty } from '../utils/formatters';

interface ServiceOrderListProps {
  orders: ServiceOrder[];
  onSelectOrder: (order: ServiceOrder) => void;
  onEditOrder: (order: ServiceOrder) => void;
  onDeleteOrder: (id: string, orderNumber: number) => void;
  onPrintOrder: (order: ServiceOrder) => void;
  searchTerm: string;
  onClearSearch: () => void;
}

export const ServiceOrderList: React.FC<ServiceOrderListProps> = ({
  orders,
  onSelectOrder,
  onEditOrder,
  onDeleteOrder,
  onPrintOrder,
  searchTerm,
  onClearSearch,
}) => {
  if (orders.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center no-print">
        <div className="w-16 h-16 bg-zinc-800/80 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-500">
          <Search className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white font-chakra">
          {searchTerm ? 'Nenhuma Ordem ou Placa Encontrada' : 'Nenhum Serviço Registrado'}
        </h3>
        <p className="text-sm text-zinc-400 mt-1 max-w-md mx-auto">
          {searchTerm
            ? `Não encontramos registros para "${searchTerm}". Verifique se digitou a placa correta (ex: BRA2E19) ou nome do cliente.`
            : 'Clique em "Nova O.S." para registrar a conclusão do primeiro serviço nesta oficina.'}
        </p>
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            Limpar Busca
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3 no-print">
      <div className="flex items-center justify-between text-xs text-zinc-400 px-1">
        <span>
          Exibindo <strong className="text-white">{orders.length}</strong> ordens de serviço
        </span>
        <span className="hidden sm:inline text-zinc-500">
          Clique no card para abrir o histórico e conferir peças e garantia
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3.5">
        {orders.map((order) => {
          const warranty = checkWarranty(order.serviceDate, order.warrantyDays);

          return (
            <div
              key={order.id}
              id={`order-card-${order.orderNumber}`}
              className="group relative bg-gradient-to-r from-zinc-900/95 via-zinc-900/90 to-zinc-950/95 hover:to-zinc-900 border border-zinc-800/90 hover:border-amber-500/60 rounded-2xl p-4 sm:p-5 transition-all duration-300 shadow-xl shadow-black/60 hover:shadow-amber-500/10 overflow-hidden"
            >
              {/* Dynamic status colored edge line */}
              <div className={`absolute top-0 left-0 bottom-0 w-1.5 transition-colors ${
                warranty.isWithinWarranty 
                  ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' 
                  : 'bg-gradient-to-b from-zinc-600 to-zinc-800'
              }`}></div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pl-2">
                {/* Left Column: Plate Badge, Customer & Bike info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className="shrink-0 pt-1 sm:pt-0 transform transition-transform group-hover:scale-105">
                    <PlateBadge plate={order.licensePlate} size="md" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="text-xs font-black text-amber-400 font-chakra tracking-wider uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        O.S. #{order.orderNumber}
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
                        {order.clientName}
                      </h4>
                      {order.clientPhone && (
                        <span className="text-xs text-zinc-400 font-mono bg-zinc-950/70 px-2 py-0.5 rounded border border-zinc-800">
                          {order.clientPhone}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-300 flex-wrap">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Wrench className="w-3.5 h-3.5 text-amber-400" />
                        {order.bikeModel} {order.bikeYear ? `(${order.bikeYear})` : ''}
                      </span>
                      <span className="text-zinc-700">|</span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-medium text-zinc-300">{formatDate(order.serviceDate)}</span>
                      </span>
                      <span className="text-zinc-700">|</span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Gauge className="w-3.5 h-3.5 text-zinc-500" />
                        <span className="font-mono text-zinc-300 font-semibold">{formatMileage(order.mileage)}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Center Column: Replaced Parts & Brands summary (The vital core feature!) */}
                <div className="lg:max-w-md xl:max-w-lg w-full bg-zinc-950/90 p-3 rounded-xl border border-zinc-800/90 shadow-inner">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-chakra mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <Package className="w-3.5 h-3.5" />
                      Peças ({order.parts.length}) & Marcas Instaladas:
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-black tracking-wider uppercase flex items-center gap-1 ${
                      warranty.isWithinWarranty
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60'
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}>
                      {warranty.isWithinWarranty ? (
                        <>
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Garantia ({warranty.daysRemaining}d)
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="w-3 h-3 text-zinc-500" />
                          Expirada
                        </>
                      )}
                    </span>
                  </div>

                  {order.parts.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {order.parts.map((part) => (
                        <span
                          key={part.id}
                          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-900/90 text-zinc-200 text-xs border border-zinc-800 hover:border-amber-500/40 transition-colors"
                        >
                          <span className="text-zinc-300 font-medium">{part.name}</span>
                          <span className="text-amber-400 font-black text-[11px] bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/30">
                            {part.brand}
                          </span>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-500 italic flex items-center gap-1.5 py-0.5">
                      <Wrench className="w-3.5 h-3.5 text-amber-500/60" />
                      Apenas Mão de obra / Revisão técnica (sem troca de peças)
                    </div>
                  )}
                </div>

                {/* Right Column: Total Amount & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-zinc-800/80">
                  <div className="text-left lg:text-right">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-chakra font-bold block">
                      Total O.S.
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-amber-400 font-chakra tabular-nums tracking-tight">
                      {formatCurrency(order.totalAmount)}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-medium block">
                      {order.paymentMethod}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      id={`btn-view-${order.orderNumber}`}
                      onClick={() => onSelectOrder(order)}
                      className="px-3.5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer transform hover:scale-[1.02] active:scale-95"
                      title="Ver dossiê completo de histórico e garantia"
                    >
                      <Eye className="w-4 h-4 stroke-[2.5]" />
                      <span>Dossiê</span>
                      <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    {order.clientPhone && (
                      <button
                        id={`btn-card-whatsapp-${order.orderNumber}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          const partsSummary = order.parts.length > 0
                            ? order.parts.map(p => `• ${p.name} (${p.brand})`).join('\n')
                            : '• Mão de obra / Revisão';
                          const clean = order.clientPhone.replace(/\D/g, '');
                          const text = `Olá, *${order.clientName}*! Tudo bem?\nAqui é da *Oficina Salgueiro Motos* 🏍️🔧\n\nSegue comprovante O.S. #${order.orderNumber}:\n🏍️ *Moto:* ${order.bikeModel} (Placa: *${order.licensePlate}*)\n🛠️ *Peças & Marcas:*\n${partsSummary}\n💰 *Total:* ${formatCurrency(order.totalAmount)}\n🛡️ *Garantia:* 90 dias.`;
                          window.open(`https://wa.me/55${clean}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                        }}
                        className="p-2.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-400 hover:text-emerald-300 border border-emerald-800/60 transition-colors cursor-pointer"
                        title="Enviar comprovante direto pelo WhatsApp"
                      >
                        <span className="text-xs font-bold leading-none">WA</span>
                      </button>
                    )}

                    <button
                      id={`btn-print-${order.orderNumber}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrintOrder(order);
                      }}
                      className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                      title="Imprimir comprovante e garantia"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-edit-${order.orderNumber}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditOrder(order);
                      }}
                      className="p-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
                      title="Editar ordem de serviço"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      id={`btn-delete-${order.orderNumber}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteOrder(order.id, order.orderNumber);
                      }}
                      className="p-2.5 rounded-lg bg-zinc-950 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800/60 transition-colors cursor-pointer"
                      title="Excluir O.S."
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
