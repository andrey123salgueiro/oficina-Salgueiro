import React from 'react';
import { ServiceOrder } from '../types';
import { formatCurrency, formatDate, formatMileage, formatPlateDisplay } from '../utils/formatters';

interface PrintReceiptProps {
  order: ServiceOrder | null;
}

export const PrintReceipt: React.FC<PrintReceiptProps> = ({ order }) => {
  if (!order) return null;

  return (
    <div className="print-only p-8 max-w-2xl mx-auto bg-white text-black font-sans text-xs">
      {/* Workshop Header */}
      <div className="border-b-2 border-black pb-4 mb-4 text-center">
        <div className="flex justify-center mb-2">
          <img
            src="/assets/aistudio/Oficina_Salgueiro_Motos_em_Alta_Velocidade_be3762f3.png"
            alt="Oficina Salgueiro Motos"
            className="h-16 w-auto object-contain filter invert-0"
          />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider">
          OFICINA MECÂNICA SALGUEIRO • SALGUEIRO MOTOS
        </h1>
        <p className="text-[11px] text-gray-700">
          Especializada em Manutenção, Revisão Geral e Peças para Motocicletas
        </p>
        <p className="text-[10px] text-gray-600 mt-1">
          Atendimento Técnico • Comprovante de Serviço e Certificado de Garantia
        </p>
      </div>

      {/* Order Info & Identification */}
      <div className="border border-black p-3 mb-4 rounded-xs">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="font-bold">ORDEM DE SERVIÇO:</span> #{order.orderNumber}
          </div>
          <div className="text-right">
            <span className="font-bold">DATA DO SERVIÇO:</span> {formatDate(order.serviceDate)}
          </div>
          <div>
            <span className="font-bold">PLACA DA MOTO:</span>{' '}
            <span className="font-mono font-bold text-sm bg-gray-100 px-1.5 py-0.5 border border-gray-400">
              {formatPlateDisplay(order.licensePlate)}
            </span>
          </div>
          <div className="text-right">
            <span className="font-bold">QUILOMETRAGEM (KM):</span> {formatMileage(order.mileage)}
          </div>
          <div>
            <span className="font-bold">CLIENTE:</span> {order.clientName}
          </div>
          <div className="text-right">
            <span className="font-bold">TELEFONE:</span> {order.clientPhone || 'Não informado'}
          </div>
          <div className="col-span-2">
            <span className="font-bold">MODELO DA MOTO:</span> {order.bikeModel} {order.bikeYear ? `(${order.bikeYear})` : ''}
          </div>
        </div>
      </div>

      {/* Parts Replaced and Brands */}
      <div className="mb-4">
        <h2 className="font-bold uppercase border-b border-black pb-1 mb-2 text-xs">
          1. PEÇAS TROCADAS E MARCAS APLICADAS
        </h2>
        {order.parts.length === 0 ? (
          <p className="italic text-gray-500 py-1">Nenhuma peça física trocada.</p>
        ) : (
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-gray-400 font-bold">
                <th className="py-1">Item / Peça</th>
                <th className="py-1">Marca da Peça</th>
                <th className="py-1 text-center">Qtd</th>
                <th className="py-1 text-right">Unitário</th>
                <th className="py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.parts.map((p, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-1 font-medium">{p.name}</td>
                  <td className="py-1 font-bold text-gray-800">{p.brand}</td>
                  <td className="py-1 text-center">{p.quantity}</td>
                  <td className="py-1 text-right">{formatCurrency(p.unitPrice)}</td>
                  <td className="py-1 text-right font-medium">{formatCurrency(p.subtotal)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t border-black">
                <td colSpan={4} className="py-1 text-right">Subtotal Peças:</td>
                <td className="py-1 text-right">{formatCurrency(order.partsTotal)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Labor / Services Executed */}
      <div className="mb-4">
        <h2 className="font-bold uppercase border-b border-black pb-1 mb-2 text-xs">
          2. SERVIÇOS DE MÃO DE OBRA
        </h2>
        {order.labor.length === 0 ? (
          <p className="italic text-gray-500 py-1">Mão de obra inclusa no valor geral.</p>
        ) : (
          <table className="w-full text-left text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-gray-400 font-bold">
                <th className="py-1">Descrição do Serviço</th>
                <th className="py-1 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {order.labor.map((l, i) => (
                <tr key={i} className="border-b border-gray-200">
                  <td className="py-1">{l.description}</td>
                  <td className="py-1 text-right font-medium">{formatCurrency(l.price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t border-black">
                <td className="py-1 text-right">Subtotal Mão de Obra:</td>
                <td className="py-1 text-right">{formatCurrency(order.laborTotal)}</td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>

      {/* Notes */}
      {order.mechanicNotes && (
        <div className="mb-4 border border-gray-300 p-2 text-[10px]">
          <span className="font-bold block mb-0.5">OBSERVAÇÕES TÉCNICAS DO MECÂNICO:</span>
          <p className="text-gray-700 italic">{order.mechanicNotes}</p>
        </div>
      )}

      {/* Total Amount Box */}
      <div className="border-2 border-black p-3 mb-6 bg-gray-50 flex justify-between items-center text-xs">
        <div>
          <div><span className="font-bold">FORMA DE PAGAMENTO:</span> {order.paymentMethod}</div>
          <div><span className="font-bold">STATUS:</span> {order.status}</div>
          {order.discount > 0 && <div><span className="font-bold">DESCONTO:</span> {formatCurrency(order.discount)}</div>}
        </div>
        <div className="text-right">
          <div className="text-xs uppercase text-gray-600 font-bold">VALOR TOTAL DO SERVIÇO:</div>
          <div className="text-lg font-bold text-black">{formatCurrency(order.totalAmount)}</div>
        </div>
      </div>

      {/* Warranty Terms */}
      <div className="border border-gray-400 p-3 mb-8 text-[9px] text-gray-700 leading-tight">
        <p className="font-bold mb-1 text-[10px] text-black uppercase">
          TERMO DE GARANTIA DA OFICINA SALGUEIRO ({order.warrantyDays || 90} DIAS)
        </p>
        <p>
          As peças substituídas e os serviços prestados possuem garantia legal de {order.warrantyDays || 90} dias contados da data de conclusão do serviço ({formatDate(order.serviceDate)}), referente a defeitos de fabricação das peças citadas e montagem mecânica, mediante a apresentação deste comprovante e constatação na loja física.
          A garantia perde a validade em caso de acidentes, intervenção de terceiros, falta de óleo/lubrificação periódica ou uso em desacordo com o manual da motocicleta.
        </p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-8 pt-6 text-center text-[10px]">
        <div>
          <div className="border-t border-black pt-1 font-bold">OFICINA SALGUEIRO MOTOS</div>
          <div className="text-gray-500">Mecânico Responsável</div>
        </div>
        <div>
          <div className="border-t border-black pt-1 font-bold">{order.clientName}</div>
          <div className="text-gray-500">Assinatura do Cliente</div>
        </div>
      </div>
    </div>
  );
};
