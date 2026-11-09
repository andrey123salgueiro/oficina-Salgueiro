export interface PartItem {
  id: string;
  name: string;
  brand: string; // Marca da peça (obrigatório / requisito explícito)
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface LaborItem {
  id: string;
  description: string;
  price: number;
}

export type PaymentMethod = 
  | 'Pix' 
  | 'Dinheiro' 
  | 'Cartão de Débito' 
  | 'Cartão de Crédito' 
  | 'A Prazo / Fiado' 
  | 'Pendente';

export type ServiceStatus = 
  | 'Concluído' 
  | 'Entregue ao Cliente' 
  | 'Em Andamento' 
  | 'Aguardando Peça' 
  | 'Retorno / Garantia';

export interface ServiceOrder {
  id: string;
  orderNumber: number;
  licensePlate: string; // Placa da moto
  clientName: string;   // Nome do cliente
  clientPhone: string;  // Telefone / WhatsApp
  bikeModel: string;    // Modelo da moto (ex: CG 160, Fazer 250)
  bikeYear?: string;
  mileage?: number;     // KM no dia do serviço
  serviceDate: string;  // Data que foi feito o serviço (YYYY-MM-DD)
  parts: PartItem[];    // Peças usadas e marcas
  labor: LaborItem[];   // Serviços / Mão de obra
  partsTotal: number;
  laborTotal: number;
  discount: number;
  totalAmount: number;  // Valor total
  paymentMethod: PaymentMethod;
  status: ServiceStatus;
  mechanicNotes?: string;
  warrantyDays: number; // Dias de garantia (padrão 90 dias)
  createdAt: string;
  updatedAt: string;
}

export interface BikeHistorySummary {
  licensePlate: string;
  clientName: string;
  bikeModel: string;
  lastVisitDate: string;
  totalVisits: number;
  totalSpent: number;
  allPartsReplaced: {
    name: string;
    brand: string;
    date: string;
    orderNumber: number;
    mileage?: number;
  }[];
  orders: ServiceOrder[];
}
