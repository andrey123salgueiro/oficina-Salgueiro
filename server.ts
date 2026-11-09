import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_FILE = path.join(__dirname, 'data_orders.json');

app.use(express.json({ limit: '10mb' }));

// Initial seed data if file doesn't exist yet
const INITIAL_SEED_ORDERS = [
  {
    id: 'os-1045',
    orderNumber: 1045,
    licensePlate: 'BRA2E19',
    clientName: 'Marcos Vinícius de Oliveira',
    clientPhone: '(11) 98542-1190',
    bikeModel: 'Honda CG 160 Titan ESD',
    bikeYear: '2022',
    mileage: 28450,
    serviceDate: '2026-09-10',
    parts: [
      {
        id: 'p-1',
        name: 'Kit Relação (Coroa, Pinhão e Corrente com Retentor)',
        brand: 'Riffel Titanium',
        quantity: 1,
        unitPrice: 220.0,
        subtotal: 220.0,
      },
      {
        id: 'p-2',
        name: 'Pastilha de Freio Dianteira',
        brand: 'Cobreq Racing',
        quantity: 1,
        unitPrice: 55.0,
        subtotal: 55.0,
      },
      {
        id: 'p-3',
        name: 'Óleo de Motor 10W-30 4T Semissintético (1L)',
        brand: 'Mobil Super Moto',
        quantity: 1,
        unitPrice: 42.0,
        subtotal: 42.0,
      },
    ],
    labor: [
      {
        id: 'l-1',
        description: 'Mão de obra: Troca do kit relação, lavagem de corrente e regulagem',
        price: 70.0,
      },
      {
        id: 'l-2',
        description: 'Mão de obra: Substituição de pastilhas dianteiras e sangria do freio',
        price: 40.0,
      },
    ],
    partsTotal: 317.0,
    laborTotal: 110.0,
    discount: 17.0,
    totalAmount: 410.0,
    paymentMethod: 'Pix',
    status: 'Concluído',
    mechanicNotes: 'Relação antiga estava com folga excessiva e dentes gastos. Instalado kit Riffel novo lubrificado. Freio dianteiro testado com eficiência excelente.',
    warrantyDays: 90,
    createdAt: '2026-09-10T14:30:00.000Z',
    updatedAt: '2026-09-10T16:00:00.000Z',
  },
  {
    id: 'os-1044',
    orderNumber: 1044,
    licensePlate: 'FXP8A42',
    clientName: 'Carlos Eduardo Salgueiro',
    clientPhone: '(11) 97123-4567',
    bikeModel: 'Yamaha Fazer FZ25 ABS',
    bikeYear: '2023',
    mileage: 19800,
    serviceDate: '2026-09-05',
    parts: [
      {
        id: 'p-4',
        name: 'Pneu Traseiro 140/70-17 Sem Câmara',
        brand: 'Pirelli Diablo Rosso II',
        quantity: 1,
        unitPrice: 490.0,
        subtotal: 490.0,
      },
      {
        id: 'p-5',
        name: 'Bico de Válvula de Alumínio 90º',
        brand: 'Allen Parts',
        quantity: 1,
        unitPrice: 25.0,
        subtotal: 25.0,
      },
      {
        id: 'p-6',
        name: 'Óleo de Motor 10W-40 Sintético (1.4L)',
        brand: 'Motul 7100',
        quantity: 2,
        unitPrice: 85.0,
        subtotal: 170.0,
      },
      {
        id: 'p-7',
        name: 'Filtro de Óleo Blindado',
        brand: 'Fram',
        quantity: 1,
        unitPrice: 38.0,
        subtotal: 38.0,
      },
    ],
    labor: [
      {
        id: 'l-3',
        description: 'Mão de obra: Montagem, balanceamento dinâmico de roda e troca de óleo/filtro',
        price: 95.0,
      },
    ],
    partsTotal: 723.0,
    laborTotal: 95.0,
    discount: 18.0,
    totalAmount: 800.0,
    paymentMethod: 'Cartão de Crédito',
    status: 'Entregue ao Cliente',
    mechanicNotes: 'Pneu antigo estava no TWI. Roda alinhada e balanceada com 10g. Óleo e filtro substituídos com anel o-ring novo.',
    warrantyDays: 90,
    createdAt: '2026-09-05T10:15:00.000Z',
    updatedAt: '2026-09-05T11:45:00.000Z',
  },
  {
    id: 'os-1043',
    orderNumber: 1043,
    licensePlate: 'KLI4820',
    clientName: 'Amanda Ferreira Lima',
    clientPhone: '(11) 96321-8899',
    bikeModel: 'Honda Biz 125 Flex',
    bikeYear: '2020',
    mileage: 34120,
    serviceDate: '2026-08-20',
    parts: [
      {
        id: 'p-8',
        name: 'Bateria Selada AGM 5Ah 12V',
        brand: 'Yuasa / Moura',
        quantity: 1,
        unitPrice: 240.0,
        subtotal: 240.0,
      },
      {
        id: 'p-9',
        name: 'Vela de Ignição Iridium CR8EIX',
        brand: 'NGK Original',
        quantity: 1,
        unitPrice: 68.0,
        subtotal: 68.0,
      },
    ],
    labor: [
      {
        id: 'l-4',
        description: 'Mão de obra: Teste de estator, regulador de voltagem e instalação da bateria',
        price: 50.0,
      },
    ],
    partsTotal: 308.0,
    laborTotal: 50.0,
    discount: 0,
    totalAmount: 358.0,
    paymentMethod: 'Pix',
    status: 'Concluído',
    mechanicNotes: 'Sistema de carga testado: gerando 14.2V em 3000 RPM (estator e retificador perfeitos). Bateria antiga não segurava partida a frio.',
    warrantyDays: 90,
    createdAt: '2026-08-20T09:00:00.000Z',
    updatedAt: '2026-08-20T10:20:00.000Z',
  },
  {
    id: 'os-1038',
    orderNumber: 1038,
    licensePlate: 'BRA2E19',
    clientName: 'Marcos Vinícius de Oliveira',
    clientPhone: '(11) 98542-1190',
    bikeModel: 'Honda CG 160 Titan ESD',
    bikeYear: '2022',
    mileage: 23100,
    serviceDate: '2026-05-15',
    parts: [
      {
        id: 'p-10',
        name: 'Pneu Traseiro 90/90-18 Mandrake',
        brand: 'Pirelli Mandrake Due',
        quantity: 1,
        unitPrice: 260.0,
        subtotal: 260.0,
      },
      {
        id: 'p-11',
        name: 'Câmara de Ar Traseira 18',
        brand: 'Vipal',
        quantity: 1,
        unitPrice: 45.0,
        subtotal: 45.0,
      },
      {
        id: 'p-12',
        name: 'Cabo de Embreagem Completo',
        brand: 'Soretto / Allen',
        quantity: 1,
        unitPrice: 35.0,
        subtotal: 35.0,
      },
    ],
    labor: [
      {
        id: 'l-5',
        description: 'Mão de obra: Troca de pneu, câmara e substituição e regulagem de cabo de embreagem',
        price: 60.0,
      },
    ],
    partsTotal: 340.0,
    laborTotal: 60.0,
    discount: 10.0,
    totalAmount: 390.0,
    paymentMethod: 'Dinheiro',
    status: 'Concluído',
    mechanicNotes: 'Cabo de embreagem antigo estava desfiando no manete. Pneu instalado com câmara nova Vipal.',
    warrantyDays: 90,
    createdAt: '2026-05-15T15:00:00.000Z',
    updatedAt: '2026-05-15T16:30:00.000Z',
  },
  {
    id: 'os-1042',
    orderNumber: 1042,
    licensePlate: 'SHR4C77',
    clientName: 'Lucas Gabriel dos Santos',
    clientPhone: '(11) 97788-2233',
    bikeModel: 'Yamaha XTZ 250 Lander',
    bikeYear: '2021',
    mileage: 41200,
    serviceDate: '2026-07-28',
    parts: [
      {
        id: 'p-13',
        name: 'Disco de Freio Traseiro Ventilado',
        brand: 'Cobreq',
        quantity: 1,
        unitPrice: 165.0,
        subtotal: 165.0,
      },
      {
        id: 'p-14',
        name: 'Pastilha de Freio Traseira Orgânica',
        brand: 'Cobreq',
        quantity: 1,
        unitPrice: 48.0,
        subtotal: 48.0,
      },
      {
        id: 'p-15',
        name: 'Fluído de Freio DOT 4 500ml',
        brand: 'Varga / Bosch',
        quantity: 1,
        unitPrice: 32.0,
        subtotal: 32.0,
      },
    ],
    labor: [
      {
        id: 'l-6',
        description: 'Mão de obra: Substituição do disco, pastilhas e sangria completa do sistema de freio',
        price: 80.0,
      },
    ],
    partsTotal: 245.0,
    laborTotal: 80.0,
    discount: 0,
    totalAmount: 325.0,
    paymentMethod: 'Cartão de Débito',
    status: 'Concluído',
    mechanicNotes: 'Disco antigo estava abaixo da espessura mínima de segurança (3.0mm). Instalado disco novo Cobreq.',
    warrantyDays: 90,
    createdAt: '2026-07-28T11:00:00.000Z',
    updatedAt: '2026-07-28T12:30:00.000Z',
  },
];

function readOrdersFromFile(): any[] {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_SEED_ORDERS, null, 2), 'utf-8');
      return INITIAL_SEED_ORDERS;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler arquivo de dados:', err);
    return INITIAL_SEED_ORDERS;
  }
}

function writeOrdersToFile(orders: any[]): boolean {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Erro ao salvar arquivo de dados:', err);
    return false;
  }
}

// Ensure database file is initialized on startup
readOrdersFromFile();

// ========================
// API ROUTES
// ========================

// GET /api/health - Check if backend is alive
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Oficina Salgueiro Motos API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// GET /api/orders - List all service orders (or search by plate, customer, query)
app.get('/api/orders', (req, res) => {
  try {
    const { plate, q, status } = req.query;
    let orders = readOrdersFromFile();

    if (plate) {
      const cleanPlateQuery = String(plate).toUpperCase().replace(/[^A-Z0-9]/g, '');
      orders = orders.filter((o) =>
        o.licensePlate.toUpperCase().replace(/[^A-Z0-9]/g, '').includes(cleanPlateQuery)
      );
    }

    if (q) {
      const query = String(q).toLowerCase().trim();
      orders = orders.filter((o) => {
        const matchPlate = o.licensePlate.toLowerCase().includes(query);
        const matchClient = o.clientName.toLowerCase().includes(query);
        const matchBike = (o.bikeModel || '').toLowerCase().includes(query);
        const matchPhone = (o.clientPhone || '').includes(query);
        const matchParts = (o.parts || []).some(
          (p: any) =>
            p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query)
        );
        return matchPlate || matchClient || matchBike || matchPhone || matchParts;
      });
    }

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status === status);
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Falha ao buscar ordens de serviço' });
  }
});

// GET /api/orders/:id - Get specific order by ID or orderNumber
app.get('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const orders = readOrdersFromFile();
    const order = orders.find(
      (o) => o.id === id || String(o.orderNumber) === id
    );

    if (!order) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Falha ao buscar ordem' });
  }
});

// POST /api/orders - Create new service order
app.post('/api/orders', (req, res) => {
  try {
    const newOrderData = req.body;
    if (!newOrderData.licensePlate || !newOrderData.clientName) {
      return res.status(400).json({ error: 'Placa da moto e Nome do Cliente são obrigatórios' });
    }

    const orders = readOrdersFromFile();
    const maxNum = orders.reduce((max, o) => Math.max(max, o.orderNumber || 1000), 1000);
    const now = new Date().toISOString();

    const createdOrder = {
      ...newOrderData,
      id: newOrderData.id || `os-${Date.now()}`,
      orderNumber: maxNum + 1,
      createdAt: newOrderData.createdAt || now,
      updatedAt: now,
    };

    orders.unshift(createdOrder);
    writeOrdersToFile(orders);

    res.status(201).json(createdOrder);
  } catch (err) {
    res.status(500).json({ error: 'Falha ao salvar nova ordem de serviço' });
  }
});

// PUT /api/orders/:id - Update existing service order
app.put('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const orders = readOrdersFromFile();

    const index = orders.findIndex(
      (o) => o.id === id || String(o.orderNumber) === id
    );
    if (index === -1) {
      return res.status(404).json({ error: 'Ordem de serviço não encontrada para atualização' });
    }

    const updatedOrder = {
      ...orders[index],
      ...updateData,
      id: orders[index].id,
      orderNumber: orders[index].orderNumber,
      updatedAt: new Date().toISOString(),
    };

    orders[index] = updatedOrder;
    writeOrdersToFile(orders);

    res.json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: 'Falha ao atualizar ordem de serviço' });
  }
});

// DELETE /api/orders/:id - Remove order
app.delete('/api/orders/:id', (req, res) => {
  try {
    const { id } = req.params;
    const orders = readOrdersFromFile();

    const filtered = orders.filter(
      (o) => o.id !== id && String(o.orderNumber) !== id
    );

    if (filtered.length === orders.length) {
      return res.status(404).json({ error: 'Ordem não encontrada para exclusão' });
    }

    writeOrdersToFile(filtered);
    res.json({ success: true, message: 'Ordem de serviço removida com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao remover ordem' });
  }
});

// POST /api/orders/bulk-sync - Synchronize multiple orders (backup / restore)
app.post('/api/orders/bulk-sync', (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'Array de ordens inválido' });
    }

    writeOrdersToFile(orders);
    res.json({ success: true, count: orders.length, message: 'Dados sincronizados com sucesso no servidor' });
  } catch (err) {
    res.status(500).json({ error: 'Falha na sincronização em massa' });
  }
});

// POST /api/orders/reset - Reset to demo data
app.post('/api/orders/reset', (req, res) => {
  try {
    writeOrdersToFile(INITIAL_SEED_ORDERS);
    res.json({ success: true, orders: INITIAL_SEED_ORDERS, message: 'Dados restaurados para o padrão original' });
  } catch (err) {
    res.status(500).json({ error: 'Falha ao restaurar dados' });
  }
});

// ========================
// VITE DEV SERVER / STATIC
// ========================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏍️ Oficina Salgueiro Motos - Servidor Backend rodando na porta ${PORT}`);
  });
}

startServer();
