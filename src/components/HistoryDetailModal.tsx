import React from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Calendar, 
  Gauge, 
  User, 
  Phone, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Wrench, 
  Package, 
  FileText, 
  Plus, 
  Edit3,
  ExternalLink,
  Info,
  Trash2
} from 'lucide-react';
import { ServiceOrder } from '../types';
import { PlateBadge } from './PlateBadge';
import { 
  formatCurrency, 
  formatDate, 
  formatMileage, 
  checkWarranty, 
  generateWhatsAppReceiptLink,
  cleanPlate 
} from '../utils/formatters';

interface HistoryDetailModalProps {
  order: ServiceOrder | null;
  allOrdersForPlate: ServiceOrder[];
  isOpen: boolean;
  onClose: () => void;
  onPrint: (order: ServiceOrder) => void;
  onEdit: (order: ServiceOrder) => void;
  onDeleteOrder?: (id: string, orderNumber: number) => void;
  onNewOrderForPlate: (plate: string, clientName: string, bikeModel: string, clientPhone: string) => void;
  onSelectSpecificOrder: (order: ServiceOrder) => void;
}

export const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
  order,
  allOrdersForPlate,
  isOpen,
  onClose,
  onPrint,
  onEdit,
  onDeleteOrder,
  onNewOrderForPlate,
  onSelectSpecificOrder,
}) => {
  if (!isOpen || !order) return null;

  const warranty = checkWarranty(order.serviceDate, order.warrantyDays);
  
  // Create summary of parts for WhatsApp share
  const partsSummary = order.parts.length > 0
    ? order.parts.map(p => `• ${p.name} (Marca: *${p.brand}*) - ${formatCurrency(p.subtotal)}`).join('\n')
    : '• Nenhum material listado';

  const whatsappLink = generateWhatsAppReceiptLink(
    order.clientPhone,
    order.clientName,
    order.licensePlate,
    order.bikeModel,
    order.orderNumber,
    order.totalAmount,
    partsSummary
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-gradient-to-b from-zinc-900 via-zinc-950 to-zinc-950 border-2 border-zinc-700/80 rounded-3xl w-full max-w-4xl shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-amber-500/20">
        {/* Header with Plate & Customer */}
        <div className="p-5 sm:p-6 bg-zinc-950 border-b border-zinc-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"></div>
          
          <div className="flex items-center gap-4">
            <PlateBadge plate={order.licensePlate} size="lg" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-black text-amber-400 font-chakra uppercase bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
                  O.S. #{order.orderNumber}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white font-chakra uppercase">
                  Dossiê da Moto
                </h2>
                <span className={`px-2.5 py-0.5 rounded-md text-xs font-black tracking-wider uppercase ${
                  order.status === 'Concluído' || order.status === 'Entregue ao Cliente'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/70'
                    : 'bg-amber-950 text-amber-300 border border-amber-700/70'
                }`}>
                  {order.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mt-1">
                <span className="text-white">{order.bikeModel} {order.bikeYear ? `(${order.bikeYear})` : ''}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-amber-400 font-bold font-chakra">Cliente: {order.clientName}</span>
              </p>
            </div>
          </div>

          {/* Quick Header Action Buttons */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              id="btn-modal-print"
              onClick={() => onPrint(order)}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Imprimir comprovante / termo de garantia"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Imprimir</span>
            </button>

            <button
              id="btn-modal-whatsapp"
              onClick={() => {
                if (whatsappLink) {
                  window.open(whatsappLink, '_blank', 'noopener,noreferrer');
                } else {
                  // Universal WhatsApp share without phone requirement
                  const text = `*Oficina Salgueiro Motos*\nComprovante O.S. #${order.orderNumber}\n🏍️ Moto: ${order.bikeModel} (${order.licensePlate})\n👤 Cliente: ${order.clientName}\n💰 Total: ${formatCurrency(order.totalAmount)}\n🛡️ Garantia: ${order.warrantyDays} dias\n\nPeças:\n${partsSummary}`;
                  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                }
              }}
              className="px-3 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Enviar histórico e garantia no WhatsApp"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            <button
              id="btn-modal-edit"
              onClick={() => onEdit(order)}
              className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/80 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar</span>
            </button>

            {onDeleteOrder && (
              <button
                id="btn-modal-delete"
                onClick={() => onDeleteOrder(order.id, order.orderNumber)}
                className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/50 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                title="Excluir O.S."
              >
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="hidden sm:inline">Excluir</span>
              </button>
            )}

            <button
              id="btn-modal-close"
              onClick={onClose}
              className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* SPECIAL COMPLAINT RESOLUTION BOX: Prova de Garantia & Histórico */}
          <div className={`p-4 rounded-xl border ${
            warranty.statusType === 'valid'
              ? 'bg-emerald-950/30 border-emerald-700/50'
              : warranty.statusType === 'expiring-soon'
              ? 'bg-amber-950/30 border-amber-600/60'
              : 'bg-zinc-950 border-zinc-800'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                warranty.statusType === 'valid'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : warranty.statusType === 'expiring-soon'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-zinc-800 text-zinc-400'
              }`}>
                {warranty.isWithinWarranty ? (
                  <ShieldCheck className="w-5 h-5" />
                ) : (
                  <ShieldAlert className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>STATUS DE RECLAMAÇÃO & GARANTIA OFICINA SALGUEIRO</span>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                      warranty.isWithinWarranty
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {warranty.isWithinWarranty ? 'DENTRO DA GARANTIA' : 'GARANTIA EXPIRADA'}
                    </span>
                  </h3>
                  <span className="text-xs text-zinc-400">
                    Prazo concedido: <strong>{order.warrantyDays} dias</strong>
                  </span>
                </div>
                <p className={`text-xs mt-1 font-medium ${
                  warranty.statusType === 'valid'
                    ? 'text-emerald-300'
                    : warranty.statusType === 'expiring-soon'
                    ? 'text-amber-300'
                    : 'text-zinc-400'
                }`}>
                  {warranty.message}
                </p>
                <div className="text-[11px] text-zinc-400 mt-2 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>Se o cliente veio questionar um barulho ou defeito:</strong> verifique abaixo se a peça reclamada foi realmente trocada por nós, qual a <strong>marca instalada</strong> e a quilometragem registrada na época.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Details Bar (Date, KM, Phone, Payment) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 p-3.5 rounded-xl border border-zinc-800 text-xs">
            <div>
              <span className="text-zinc-500 block mb-0.5 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" />
                Data do Serviço:
              </span>
              <strong className="text-zinc-200 text-sm">{formatDate(order.serviceDate)}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5 flex items-center gap-1">
                <Gauge className="w-3 h-3 text-amber-400" />
                Quilometragem (KM):
              </span>
              <strong className="text-zinc-200 text-sm">{formatMileage(order.mileage)}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5 flex items-center gap-1">
                <Phone className="w-3 h-3 text-amber-400" />
                Telefone / WhatsApp:
              </span>
              <strong className="text-zinc-200 text-sm">{order.clientPhone || 'Não informado'}</strong>
            </div>
            <div>
              <span className="text-zinc-500 block mb-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" />
                Forma de Pagamento:
              </span>
              <strong className="text-zinc-200 text-sm">{order.paymentMethod}</strong>
            </div>
          </div>

          {/* PEÇAS TROCADAS E MARCAS (Core Feature Section) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Peças Substituídas na Moto e Respectivas Marcas
              </h3>
              <span className="text-xs text-zinc-400">
                Total de peças: <strong className="text-white">{order.parts.length}</strong>
              </span>
            </div>

            {order.parts.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                Nenhuma peça física foi trocada nesta ordem (apenas serviço de mão de obra / revisão).
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
                    <tr>
                      <th className="py-2.5 px-3">Peça Trocada</th>
                      <th className="py-2.5 px-3">Marca da Peça</th>
                      <th className="py-2.5 px-3 text-center">Qtd</th>
                      <th className="py-2.5 px-3 text-right">Valor Unit.</th>
                      <th className="py-2.5 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {order.parts.map((part) => (
                      <tr key={part.id} className="hover:bg-zinc-900/50 transition-colors">
                        <td className="py-2.5 px-3 font-medium text-white">
                          {part.name}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[11px]">
                            {part.brand || 'Marca não especificada'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-zinc-300 font-mono">
                          {part.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right text-zinc-300 font-mono">
                          {formatCurrency(part.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-zinc-100 font-mono">
                          {formatCurrency(part.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-zinc-900/60 border-t border-zinc-800 text-xs">
                    <tr>
                      <td colSpan={4} className="py-2 px-3 text-right text-zinc-400 font-medium">
                        Subtotal Peças:
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-white">
                        {formatCurrency(order.partsTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* SERVIÇOS E MÃO DE OBRA */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Mão de Obra e Serviços Executados
            </h3>

            {order.labor.length === 0 ? (
              <p className="text-xs text-zinc-500 italic p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                Nenhum valor de mão de obra registrado separadamente.
              </p>
            ) : (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden divide-y divide-zinc-800/60 text-xs">
                {order.labor.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between hover:bg-zinc-900/40">
                    <span className="text-zinc-200 font-medium">{item.description}</span>
                    <span className="font-semibold text-zinc-100 font-mono">{formatCurrency(item.price)}</span>
                  </div>
                ))}
                <div className="p-2.5 bg-zinc-900/60 flex items-center justify-between text-xs">
                  <span className="text-zinc-400 font-medium">Subtotal Mão de Obra:</span>
                  <span className="font-bold text-white font-mono">{formatCurrency(order.laborTotal)}</span>
                </div>
              </div>
            )}
          </div>

          {/* OBSERVAÇÕES DO MECÂNICO */}
          {order.mechanicNotes && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Laudo do Mecânico / Observações Registradas na Entrada
              </h3>
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed italic">
                "{order.mechanicNotes}"
              </div>
            </div>
          )}

          {/* FINANCIAL TOTAL BAR */}
          <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-zinc-400">
              Peças: <strong className="text-white">{formatCurrency(order.partsTotal)}</strong> • Mão de Obra: <strong className="text-white">{formatCurrency(order.laborTotal)}</strong>
              {order.discount > 0 && <span className="text-amber-400 ml-2">(Desconto: -{formatCurrency(order.discount)})</span>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold text-zinc-400">Valor Total Pago:</span>
              <span className="text-2xl font-bold text-amber-400 font-chakra">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>

          {/* HISTÓRICO COMPLETO DA MOTO (TODAS AS PASSAGENS NA OFICINA SALGUEIRO) */}
          <div className="pt-2 border-t border-zinc-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Histórico Completo desta Moto ({cleanPlate(order.licensePlate)})
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Esta moto já passou <strong className="text-white">{allOrdersForPlate.length} vez(es)</strong> na Oficina Salgueiro.
                </p>
              </div>

              <button
                type="button"
                id="btn-new-visit-same-bike"
                onClick={() => {
                  onNewOrderForPlate(
                    order.licensePlate,
                    order.clientName,
                    order.bikeModel,
                    order.clientPhone
                  );
                  onClose();
                }}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Nova Visita Desta Moto
              </button>
            </div>

            <div className="space-y-2">
              {allOrdersForPlate.map((histOrder) => {
                const isCurrent = histOrder.id === order.id;
                const histWarranty = checkWarranty(histOrder.serviceDate, histOrder.warrantyDays);

                return (
                  <div
                    key={histOrder.id}
                    onClick={() => {
                      if (!isCurrent) onSelectSpecificOrder(histOrder);
                    }}
                    className={`p-3 rounded-xl border transition-all text-xs ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/50 ring-1 ring-amber-500/30'
                        : 'bg-zinc-950 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white font-chakra">
                          O.S. #{histOrder.orderNumber}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-300 font-medium">
                          {formatDate(histOrder.serviceDate)}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400">
                          {formatMileage(histOrder.mileage)}
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500 text-zinc-950 font-bold">
                            Visualizando
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          histWarranty.isWithinWarranty
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-zinc-900 text-zinc-500'
                        }`}>
                          {histWarranty.isWithinWarranty ? 'Garantia ativa' : 'Garantia expirada'}
                        </span>
                        <span className="font-bold text-amber-400 font-mono">
                          {formatCurrency(histOrder.totalAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Summary of parts in this visit */}
                    <div className="mt-2 text-[11px] text-zinc-400 flex flex-wrap gap-1.5 items-center">
                      <span className="text-zinc-500">Peças:</span>
                      {histOrder.parts.length > 0 ? (
                        histOrder.parts.map((p, idx) => (
                          <span
                            key={idx}
                            className="bg-zinc-900 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-800"
                          >
                            {p.name} <strong className="text-amber-300">({p.brand})</strong>
                          </span>
                        ))
                      ) : (
                        <span className="italic text-zinc-500">Apenas mão de obra</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-xs text-zinc-500">
            Oficina Mecânica Salgueiro • Sistema de Consulta e Garantia
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
