export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  // If format is YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateString;
}

export function formatMileage(km?: number): string {
  if (km === undefined || km === null || isNaN(km)) return 'Não informado';
  return `${km.toLocaleString('pt-BR')} km`;
}

export function cleanPlate(plate: string): string {
  return (plate || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function formatPlateDisplay(plate: string): string {
  const clean = cleanPlate(plate);
  if (clean.length === 7) {
    // Check if it's Mercosul (letter at index 4) or old standard (number at index 4)
    const isMercosul = isNaN(Number(clean[4]));
    if (isMercosul) {
      return `${clean.substring(0, 3)} ${clean.substring(3)}`;
    } else {
      return `${clean.substring(0, 3)}-${clean.substring(3)}`;
    }
  }
  return clean || plate;
}

export function isMercosulPlate(plate: string): boolean {
  const clean = cleanPlate(plate);
  if (clean.length !== 7) return false;
  // Mercosul: LLLNLNN -> 4th char (index 4) is a letter
  return isNaN(Number(clean[4]));
}

export interface WarrantyStatus {
  isWithinWarranty: boolean;
  daysPassed: number;
  daysRemaining: number;
  message: string;
  statusType: 'valid' | 'expiring-soon' | 'expired';
}

export function checkWarranty(serviceDateStr: string, warrantyDays: number = 90): WarrantyStatus {
  if (!serviceDateStr) {
    return {
      isWithinWarranty: false,
      daysPassed: 0,
      daysRemaining: 0,
      message: 'Data não informada',
      statusType: 'expired',
    };
  }

  const [year, month, day] = serviceDateStr.split('-').map(Number);
  const serviceDate = new Date(year, month - 1, day);
  const today = new Date();
  
  // Reset hours to compare purely days
  serviceDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - serviceDate.getTime();
  const daysPassed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const daysRemaining = warrantyDays - daysPassed;

  if (daysPassed < 0) {
    return {
      isWithinWarranty: true,
      daysPassed: 0,
      daysRemaining: warrantyDays,
      message: 'Serviço agendado / hoje',
      statusType: 'valid',
    };
  }

  if (daysRemaining >= 0) {
    if (daysRemaining <= 10) {
      return {
        isWithinWarranty: true,
        daysPassed,
        daysRemaining,
        message: `Dentro da garantia legal (restam ${daysRemaining} dias)`,
        statusType: 'expiring-soon',
      };
    }
    return {
      isWithinWarranty: true,
      daysPassed,
      daysRemaining,
      message: `Em garantia (feito há ${daysPassed} dias / restam ${daysRemaining} dias)`,
      statusType: 'valid',
    };
  } else {
    const expiredDaysAgo = Math.abs(daysRemaining);
    return {
      isWithinWarranty: false,
      daysPassed,
      daysRemaining,
      message: `Garantia encerrada há ${expiredDaysAgo} dias (serviço há ${daysPassed} dias)`,
      statusType: 'expired',
    };
  }
}

export function generateWhatsAppReceiptLink(
  phone: string,
  clientName: string,
  plate: string,
  bikeModel: string,
  orderNumber: number,
  total: number,
  partsSummary: string
): string {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  if (!cleanPhone) return '';

  const text = `Olá, *${clientName}*! Tudo bem?\nAqui é da *Oficina Salgueiro Motos* 🏍️🔧\n\nSegue o comprovante da sua O.S. #${orderNumber}:\n🏍️ *Moto:* ${bikeModel} (Placa: *${formatPlateDisplay(plate)}*)\n🛠️ *Peças trocadas & Marcas:*\n${partsSummary}\n💰 *Valor Total:* ${formatCurrency(total)}\n🛡️ *Garantia:* 90 dias com apresentação deste registro.\n\nQualquer dúvida ou revisão estamos à sua disposição na Oficina Salgueiro!`;

  return `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(text)}`;
}
