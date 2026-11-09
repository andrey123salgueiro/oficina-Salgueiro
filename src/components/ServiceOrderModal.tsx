import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Shield, Wrench, CheckCircle2, PackagePlus, AlertCircle } from 'lucide-react';
import { ServiceOrder, PartItem, LaborItem, PaymentMethod, ServiceStatus } from '../types';
import { cleanPlate, formatCurrency } from '../utils/formatters';
import { POPULAR_PARTS_CATALOG } from '../data/initialData';

interface ServiceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (order: Omit<ServiceOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  orderToEdit?: ServiceOrder | null;
  initialPlate?: string;
  nextOrderNumber: number;
}

export const ServiceOrderModal: React.FC<ServiceOrderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  orderToEdit,
  initialPlate = '',
  nextOrderNumber,
}) => {
  const [licensePlate, setLicensePlate] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [bikeModel, setBikeModel] = useState('');
  const [bikeYear, setBikeYear] = useState('');
  const [mileage, setMileage] = useState<string>('');
  const [serviceDate, setServiceDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Pix');
  const [status, setStatus] = useState<ServiceStatus>('Concluído');
  const [mechanicNotes, setMechanicNotes] = useState('');
  const [warrantyDays, setWarrantyDays] = useState<number>(90);
  const [discount, setDiscount] = useState<number>(0);

  // Dynamic lists
  const [parts, setParts] = useState<PartItem[]>([]);
  const [labor, setLabor] = useState<LaborItem[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (orderToEdit) {
      setLicensePlate(orderToEdit.licensePlate);
      setClientName(orderToEdit.clientName);
      setClientPhone(orderToEdit.clientPhone || '');
      setBikeModel(orderToEdit.bikeModel || '');
      setBikeYear(orderToEdit.bikeYear || '');
      setMileage(orderToEdit.mileage ? String(orderToEdit.mileage) : '');
      setServiceDate(orderToEdit.serviceDate);
      setPaymentMethod(orderToEdit.paymentMethod);
      setStatus(orderToEdit.status);
      setMechanicNotes(orderToEdit.mechanicNotes || '');
      setWarrantyDays(orderToEdit.warrantyDays || 90);
      setDiscount(orderToEdit.discount || 0);
      setParts(orderToEdit.parts || []);
      setLabor(orderToEdit.labor || []);
    } else {
      // Default new order
      const today = new Date().toISOString().split('T')[0];
      setLicensePlate(initialPlate ? cleanPlate(initialPlate) : '');
      setClientName('');
      setClientPhone('');
      setBikeModel('');
      setBikeYear('');
      setMileage('');
      setServiceDate(today);
      setPaymentMethod('Pix');
      setStatus('Concluído');
      setMechanicNotes('');
      setWarrantyDays(90);
      setDiscount(0);
      // Preload 1 empty part and 1 empty labor row for convenience
      setParts([
        {
          id: 'part-' + Date.now(),
          name: '',
          brand: '',
          quantity: 1,
          unitPrice: 0,
          subtotal: 0,
        },
      ]);
      setLabor([
        {
          id: 'labor-' + Date.now(),
          description: 'Mão de obra / Serviço mecânico',
          price: 50,
        },
      ]);
    }
    setErrors({});
  }, [orderToEdit, initialPlate, isOpen]);

  if (!isOpen) return null;

  // Parts handlers
  const handleAddPart = () => {
    setParts([
      ...parts,
      {
        id: 'part-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        name: '',
        brand: '',
        quantity: 1,
        unitPrice: 0,
        subtotal: 0,
      },
    ]);
  };

  const handleUpdatePart = (index: number, field: keyof PartItem, value: any) => {
    const updated = [...parts];
    const item = { ...updated[index], [field]: value };

    if (field === 'quantity' || field === 'unitPrice') {
      const q = field === 'quantity' ? Number(value) : item.quantity;
      const p = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.subtotal = (q || 0) * (p || 0);
    }
    updated[index] = item;
    setParts(updated);
  };

  const handleRemovePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  // Labor handlers
  const handleAddLabor = () => {
    setLabor([
      ...labor,
      {
        id: 'labor-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        description: '',
        price: 0,
      },
    ]);
  };

  const handleUpdateLabor = (index: number, field: keyof LaborItem, value: any) => {
    const updated = [...labor];
    updated[index] = { ...updated[index], [field]: field === 'price' ? Number(value) : value };
    setLabor(updated);
  };

  const handleRemoveLabor = (index: number) => {
    setLabor(labor.filter((_, i) => i !== index));
  };

  // Totals calculations
  const partsTotal = parts.reduce((acc, p) => acc + (p.subtotal || 0), 0);
  const laborTotal = labor.reduce((acc, l) => acc + (l.price || 0), 0);
  const subtotal = partsTotal + laborTotal;
  const totalAmount = Math.max(0, subtotal - (Number(discount) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const clean = cleanPlate(licensePlate);
    if (!clean) {
      newErrors.licensePlate = 'A placa da moto é obrigatória.';
    }

    if (!clientName.trim()) {
      newErrors.clientName = 'O nome do cliente é obrigatório.';
    }

    if (!serviceDate) {
      newErrors.serviceDate = 'A data do serviço é obrigatória.';
    }

    // Filter valid items: only items that actually have content
    const validParts = parts
      .filter(p => p.name.trim() !== '')
      .map(p => ({
        ...p,
        brand: p.brand.trim() || 'Genuína / Original',
      }));

    const validLabor = labor.filter(l => l.description.trim() !== '' || l.price > 0);

    // If both are completely empty, alert gently
    if (validParts.length === 0 && validLabor.length === 0) {
      newErrors.items = 'Por favor, adicione ao menos uma peça ou serviço realizado na moto.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(
      {
        licensePlate: clean,
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        bikeModel: bikeModel.trim() || 'Moto não especificada',
        bikeYear: bikeYear.trim(),
        mileage: mileage ? Number(mileage) : undefined,
        serviceDate,
        parts: validParts,
        labor: validLabor,
        partsTotal,
        laborTotal,
        discount: Number(discount) || 0,
        totalAmount,
        paymentMethod,
        status,
        mechanicNotes: mechanicNotes.trim(),
        warrantyDays: Number(warrantyDays) || 90,
      },
      orderToEdit ? orderToEdit.id : undefined
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-zinc-700/80 rounded-3xl w-full max-w-4xl shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-amber-500/20">
        {/* Modal Header with mechanical top accent */}
        <div className="relative px-6 py-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500"></div>
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/Oficina_Salgueiro_Motos_em_Alta_Velocidade_be3762f3.png"
              alt="Oficina Salgueiro Motos"
              className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white font-chakra uppercase tracking-wide">
                  {orderToEdit ? `Atualizar O.S. #${orderToEdit.orderNumber}` : `Concluir Serviço & Gerar O.S. #${nextOrderNumber}`}
                </h2>
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                  Oficina Salgueiro
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Registro fiel de Placa, Cliente, Peças Trocadas (Marca) e Valores para Garantia
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Customer & Bike Identification */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Identificação do Cliente e da Moto
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Placa */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Placa da Moto <span className="text-amber-400">*</span>
                </label>
                <input
                  id="input-license-plate"
                  type="text"
                  maxLength={8}
                  placeholder="Ex: BRA2E19 ou ABC1234"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 bg-zinc-950 border rounded-lg text-white font-mono uppercase tracking-wider text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    errors.licensePlate ? 'border-red-500' : 'border-zinc-700'
                  }`}
                />
                {errors.licensePlate && (
                  <p className="text-red-400 text-xs mt-1">{errors.licensePlate}</p>
                )}
              </div>

              {/* Nome do Cliente */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Cliente <span className="text-amber-400">*</span>
                </label>
                <input
                  id="input-client-name"
                  type="text"
                  placeholder="Ex: João da Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className={`w-full px-3 py-2 bg-zinc-950 border rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    errors.clientName ? 'border-red-500' : 'border-zinc-700'
                  }`}
                />
                {errors.clientName && (
                  <p className="text-red-400 text-xs mt-1">{errors.clientName}</p>
                )}
              </div>

              {/* WhatsApp / Telefone */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  WhatsApp / Telefone
                </label>
                <input
                  id="input-client-phone"
                  type="text"
                  placeholder="Ex: (11) 98765-4321"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Data do Serviço */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Data do Serviço <span className="text-amber-400">*</span>
                </label>
                <input
                  id="input-service-date"
                  type="date"
                  value={serviceDate}
                  onChange={(e) => setServiceDate(e.target.value)}
                  className={`w-full px-3 py-2 bg-zinc-950 border rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden ${
                    errors.serviceDate ? 'border-red-500' : 'border-zinc-700'
                  }`}
                />
                {errors.serviceDate && (
                  <p className="text-red-400 text-xs mt-1">{errors.serviceDate}</p>
                )}
              </div>

              {/* Modelo da Moto */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Modelo da Moto
                </label>
                <input
                  id="input-bike-model"
                  type="text"
                  placeholder="Ex: Honda CG 160 Titan, Yamaha Fazer 250, Biz 125..."
                  value={bikeModel}
                  onChange={(e) => setBikeModel(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* Ano */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Ano Fab./Mod.
                </label>
                <input
                  id="input-bike-year"
                  type="text"
                  placeholder="Ex: 2022"
                  value={bikeYear}
                  onChange={(e) => setBikeYear(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              {/* KM Atual */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Quilometragem (KM)
                </label>
                <input
                  id="input-mileage"
                  type="number"
                  placeholder="Ex: 28450"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <span className="text-[10px] text-zinc-500">Crucial para comprovar garantia</span>
              </div>
            </div>
          </div>

          {/* Section 2: Replaced Parts and BRANDS (Core user requirement!) */}
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <PackagePlus className="w-4 h-4 text-amber-400" />
                  Peças Trocadas e Marcas Utilizadas
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Registre a peça e a <strong className="text-amber-300">Marca da Peça</strong> (ex: Riffel, Cobreq, Vipal, Motul, Mobil) para consulta no histórico.
                </p>
              </div>
              <button
                type="button"
                id="btn-add-part"
                onClick={handleAddPart}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Peça
              </button>
            </div>

            {/* Quick Suggestions for Popular Motorcycle Parts */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-zinc-400 font-semibold uppercase font-chakra">
                Sugestões rápidas:
              </span>
              {[
                { name: 'Kit Relação Completo', brand: 'Riffel', price: 220 },
                { name: 'Óleo Motor 10W-30 (1L)', brand: 'Mobil Super', price: 42 },
                { name: 'Pastilha de Freio Diant.', brand: 'Cobreq', price: 55 },
                { name: 'Pneu Traseiro 90/90-18', brand: 'Pirelli', price: 260 },
                { name: 'Vela de Ignição', brand: 'NGK', price: 45 },
              ].map((quick, qIdx) => (
                <button
                  key={qIdx}
                  type="button"
                  onClick={() => {
                    setParts(prev => [
                      ...prev.filter(p => p.name.trim() !== ''),
                      {
                        id: 'part-' + Date.now() + '-' + qIdx,
                        name: quick.name,
                        brand: quick.brand,
                        quantity: 1,
                        unitPrice: quick.price,
                        subtotal: quick.price,
                      },
                    ]);
                  }}
                  className="px-2 py-0.5 rounded bg-zinc-900 hover:bg-amber-400 hover:text-zinc-950 text-zinc-300 border border-zinc-700 text-[10px] font-medium transition-all cursor-pointer"
                >
                  + {quick.name} ({quick.brand})
                </button>
              ))}
            </div>

            {errors.partBrand && (
              <div className="p-2.5 bg-red-950/50 border border-red-800/80 rounded-lg text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errors.partBrand}</span>
              </div>
            )}

            {parts.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2">Nenhuma peça trocada adicionada.</p>
            ) : (
              <div className="space-y-2">
                {parts.map((part, index) => (
                  <div
                    key={part.id}
                    className="grid grid-cols-12 gap-2 items-center bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800"
                  >
                    {/* Part Name */}
                    <div className="col-span-12 sm:col-span-4">
                      <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">
                        Nome da Peça
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Pastilha de Freio"
                        value={part.name}
                        onChange={(e) => handleUpdatePart(index, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-white text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Part Brand (HIGHLIGHTED) */}
                    <div className="col-span-12 sm:col-span-3">
                      <label className="block text-[10px] text-amber-400 uppercase font-semibold mb-0.5">
                        Marca da Peça *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Cobreq, Riffel..."
                        value={part.brand}
                        onChange={(e) => handleUpdatePart(index, 'brand', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-amber-500/40 rounded text-amber-200 text-xs font-medium focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Qty */}
                    <div className="col-span-4 sm:col-span-1">
                      <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">
                        Qtd
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={part.quantity}
                        onChange={(e) => handleUpdatePart(index, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-white text-xs text-center"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">
                        Valor Unit. (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={part.unitPrice || ''}
                        onChange={(e) => handleUpdatePart(index, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-white text-xs"
                      />
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="col-span-4 sm:col-span-2 flex items-center justify-between gap-1 pt-3 sm:pt-0">
                      <div className="text-right flex-1">
                        <span className="text-[10px] text-zinc-500 block sm:hidden">Subtotal:</span>
                        <span className="text-xs font-semibold text-zinc-200">
                          {formatCurrency(part.subtotal)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePart(index)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                        title="Remover peça"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end text-xs text-zinc-400 pt-1">
              Subtotal Peças: <strong className="text-white ml-1.5">{formatCurrency(partsTotal)}</strong>
            </div>
          </div>

          {/* Section 3: Labor / Services */}
          <div className="p-4 bg-zinc-950/60 rounded-xl border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-amber-400" />
                  Mão de Obra e Serviços Executados
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Descreva o que foi feito na oficina (regulagens, revisões, montagem, etc.).
                </p>
              </div>
              <button
                type="button"
                id="btn-add-labor"
                onClick={handleAddLabor}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 hover:text-amber-200 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Serviço
              </button>
            </div>

            {labor.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2">Nenhum serviço de mão de obra registrado.</p>
            ) : (
              <div className="space-y-2">
                {labor.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-800"
                  >
                    <div className="col-span-12 sm:col-span-8">
                      <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">
                        Descrição do Serviço Realizado
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Troca de pastilhas, sangria de freio e regulagem"
                        value={item.description}
                        onChange={(e) => handleUpdateLabor(index, 'description', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-white text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                    <div className="col-span-8 sm:col-span-3">
                      <label className="block text-[10px] text-zinc-400 uppercase font-semibold mb-0.5">
                        Valor Mão de Obra (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.price || ''}
                        onChange={(e) => handleUpdateLabor(index, 'price', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-zinc-950 border border-zinc-700 rounded text-white text-xs"
                      />
                    </div>
                    <div className="col-span-4 sm:col-span-1 flex justify-end pt-3 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleRemoveLabor(index)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                        title="Remover serviço"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end text-xs text-zinc-400 pt-1">
              Subtotal Mão de Obra: <strong className="text-white ml-1.5">{formatCurrency(laborTotal)}</strong>
            </div>
          </div>

          {errors.items && (
            <div className="p-3 bg-red-950/60 border border-red-800 rounded-lg text-red-300 text-xs">
              {errors.items}
            </div>
          )}

          {/* Section 4: Totals, Payment & Warranty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-zinc-950/90 rounded-xl border border-zinc-800">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Status da Ordem
              </label>
              <select
                id="select-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as ServiceStatus)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs font-medium focus:ring-1 focus:ring-amber-500"
              >
                <option value="Concluído">Concluído</option>
                <option value="Entregue ao Cliente">Entregue ao Cliente</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Aguardando Peça">Aguardando Peça</option>
                <option value="Retorno / Garantia">Retorno / Garantia</option>
              </select>
            </div>

            {/* Forma de Pagamento */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Forma de Pagamento
              </label>
              <select
                id="select-payment"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs font-medium focus:ring-1 focus:ring-amber-500"
              >
                <option value="Pix">Pix</option>
                <option value="Dinheiro">Dinheiro</option>
                <option value="Cartão de Débito">Cartão de Débito</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="A Prazo / Fiado">A Prazo / Fiado</option>
                <option value="Pendente">Pendente</option>
              </select>
            </div>

            {/* Dias de Garantia */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Garantia (dias)
              </label>
              <input
                id="input-warranty-days"
                type="number"
                min="0"
                value={warrantyDays}
                onChange={(e) => setWarrantyDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-[10px] text-zinc-500">Padrão CDC: 90 dias</span>
            </div>

            {/* Desconto */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Desconto (R$)
              </label>
              <input
                id="input-discount"
                type="number"
                step="0.01"
                min="0"
                value={discount || ''}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-white text-xs focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Section 5: Mechanic Notes for future complaints proof */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Observações do Mecânico / Laudo Técnico
            </label>
            <textarea
              id="textarea-notes"
              rows={3}
              placeholder="Ex: Estado que a moto chegou, peças desgastadas mostradas ao cliente, recomendações técnicas (ex: calibragem semanal, lubrificação da corrente a cada 500km)..."
              value={mechanicNotes}
              onChange={(e) => setMechanicNotes(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-white text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-zinc-400 mt-1">
              Este histórico fica gravado no sistema da Oficina Salgueiro. Se o cliente voltar reclamando, você terá a comprovação exata do que foi feito e do combinado.
            </p>
          </div>

          {/* Total Summary Footer Box */}
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-zinc-300 space-y-0.5 text-center sm:text-left">
              <div>Peças: <strong className="text-white">{formatCurrency(partsTotal)}</strong> | Mão de obra: <strong className="text-white">{formatCurrency(laborTotal)}</strong></div>
              {discount > 0 && <div className="text-amber-400">Desconto aplicado: -{formatCurrency(discount)}</div>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm uppercase font-bold text-zinc-300 font-chakra">Valor Total:</span>
              <span className="text-2xl font-bold text-amber-400 font-chakra">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* Modal Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              id="btn-cancel-modal"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-order"
              className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
              <span>{orderToEdit ? 'Atualizar Ordem de Serviço' : 'Salvar e Concluir no Sistema'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
