import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { ServiceOrderList } from './components/ServiceOrderList';
import { WorkshopStats } from './components/WorkshopStats';
import { ServiceOrderModal } from './components/ServiceOrderModal';
import { HistoryDetailModal } from './components/HistoryDetailModal';
import { PrintReceipt } from './components/PrintReceipt';
import { ConfirmModal } from './components/ConfirmModal';
import { ServiceOrder } from './types';
import { INITIAL_SERVICE_ORDERS } from './data/initialData';
import { cleanPlate, checkWarranty } from './utils/formatters';
import { CheckCircle, AlertTriangle, Info, Server, RefreshCw } from 'lucide-react';
import * as api from './services/api';
import * as firestoreService from './services/firestoreService';

const STORAGE_KEY = 'salgueiro_motos_orders_v1';

export default function App() {
  // Main state with localStorage persistence as initial cache
  const [orders, setOrders] = useState<ServiceOrder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Falha ao ler localStorage:', e);
    }
    return INITIAL_SERVICE_ORDERS;
  });

  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [warrantyFilter, setWarrantyFilter] = useState<'all' | 'warranty-only' | 'expired-only'>('all');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToEdit, setOrderToEdit] = useState<ServiceOrder | null>(null);
  const [initialPlateForModal, setInitialPlateForModal] = useState('');
  
  // History / Complaint verification modal
  const [historyOrder, setHistoryOrder] = useState<ServiceOrder | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Printing state
  const [orderToPrint, setOrderToPrint] = useState<ServiceOrder | null>(null);

  // Confirmation modals state (replaces restricted window.confirm in iframe)
  const [orderToDelete, setOrderToDelete] = useState<{
    id: string;
    orderNumber: number;
    plate: string;
    clientName: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  }, []);

  // Real-time Firestore sync & initial load (syncs mobile and desktop instantaneously)
  useEffect(() => {
    let isSubscribed = true;
    setIsLoading(true);

    // Initial check to seed demo orders if cloud is completely empty
    firestoreService.seedInitialFirestoreData(INITIAL_SERVICE_ORDERS)
      .catch((err) => console.warn('Aviso ao inicializar dados no Firestore:', err));

    // Real-time listener: any change saved on phone immediately updates PC
    const unsubscribe = firestoreService.subscribeToOrders(
      (cloudOrders) => {
        if (!isSubscribed) return;
        if (Array.isArray(cloudOrders) && cloudOrders.length > 0) {
          setOrders(cloudOrders);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudOrders));
          } catch (e) {
            console.error('Erro ao salvar no localStorage:', e);
          }
        }
        setIsCloudSynced(true);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Conexão em tempo real do Firestore indisponível, usando backend local:', err);
        setIsCloudSynced(false);
        setIsLoading(false);
      }
    );

    // Also check backend API health
    api.fetchAllOrders().then((backendOrders) => {
      if (Array.isArray(backendOrders) && backendOrders.length > 0) {
        setIsBackendOnline(true);
      }
    }).catch(() => {
      setIsBackendOnline(false);
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, []);

  // Synchronize localStorage cache whenever orders change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Erro ao salvar no localStorage:', e);
    }
  }, [orders]);

  // Calculate Next Order Number
  const nextOrderNumber = useMemo(() => {
    if (orders.length === 0) return 1001;
    const maxNum = Math.max(...orders.map(o => o.orderNumber || 1000));
    return maxNum + 1;
  }, [orders]);

  // Handle Save / Update Order (Both Cloud Firestore and Local Backend)
  const handleSaveOrder = async (
    orderData: Omit<ServiceOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    const now = new Date().toISOString();

    if (editId) {
      // Update existing
      const existingOrder = orders.find(ord => ord.id === editId);
      const updatedOrder: ServiceOrder = {
        ...existingOrder,
        ...orderData,
        id: editId,
        orderNumber: existingOrder?.orderNumber || orderToEdit?.orderNumber || 1001,
        createdAt: existingOrder?.createdAt || orderToEdit?.createdAt || now,
        updatedAt: now,
      } as ServiceOrder;

      // 1. Cloud Firestore update
      try {
        await firestoreService.saveOrderToFirestore(updatedOrder);
        setIsCloudSynced(true);
      } catch (err) {
        console.warn('Erro ao atualizar no Firestore:', err);
      }

      // 2. Local Backend update
      try {
        await api.updateBackendOrder(editId, orderData);
        setIsBackendOnline(true);
      } catch (err) {
        console.warn('Backend update fallback:', err);
      }

      setOrders(prev =>
        prev.map(ord => (ord.id === editId ? updatedOrder : ord))
      );
      showToast(`Ordem de serviço #${updatedOrder.orderNumber} salva e sincronizada na nuvem!`, 'success');
    } else {
      // Create new
      let createdOrder: ServiceOrder = {
        ...orderData,
        id: 'os-' + Date.now(),
        orderNumber: nextOrderNumber,
        createdAt: now,
        updatedAt: now,
      };

      // 1. Cloud Firestore create
      try {
        await firestoreService.saveOrderToFirestore(createdOrder);
        setIsCloudSynced(true);
      } catch (err) {
        console.warn('Erro ao salvar no Firestore:', err);
      }

      // 2. Local Backend create
      try {
        const savedInBackend = await api.createBackendOrder(createdOrder);
        if (savedInBackend) {
          createdOrder = savedInBackend;
        }
        setIsBackendOnline(true);
      } catch (err) {
        console.warn('Backend create fallback:', err);
      }

      setOrders(prev => [createdOrder, ...prev.filter(o => o.id !== createdOrder.id)]);
      showToast(`O.S. #${createdOrder.orderNumber} salva na nuvem para a placa ${orderData.licensePlate}!`, 'success');
    }

    setIsModalOpen(false);
    setOrderToEdit(null);
    setInitialPlateForModal('');
  };

  // Handle Delete - triggers in-app ConfirmModal
  const handleDeleteOrder = (id: string, orderNumber: number) => {
    const targetOrder = orders.find(o => o.id === id || o.orderNumber === orderNumber);
    setOrderToDelete({
      id,
      orderNumber,
      plate: targetOrder?.licensePlate || '',
      clientName: targetOrder?.clientName || 'Cliente não identificado',
    });
  };

  // Execute confirmed deletion
  const executeDeleteOrder = async () => {
    if (!orderToDelete) return;
    setIsDeleting(true);
    const { id, orderNumber } = orderToDelete;

    // 1. Delete from Cloud Firestore
    try {
      await firestoreService.deleteOrderFromFirestore(id);
      setIsCloudSynced(true);
    } catch (err) {
      console.warn('Erro ao excluir no Firestore:', err);
    }

    // 2. Delete from Backend
    try {
      await api.deleteBackendOrder(id);
      setIsBackendOnline(true);
    } catch (err) {
      console.warn('Falha ao excluir no backend, removendo localmente:', err);
    }

    setOrders(prev => prev.filter(o => o.id !== id && o.orderNumber !== orderNumber));
    if (historyOrder?.id === id || historyOrder?.orderNumber === orderNumber) {
      setIsHistoryModalOpen(false);
      setHistoryOrder(null);
    }
    showToast(`O.S. #${orderNumber} removida da nuvem e do banco de dados!`, 'info');
    setIsDeleting(false);
    setOrderToDelete(null);
  };

  // Open New Order Modal
  const handleOpenNewOrder = (plate = '', clientName = '', bikeModel = '', clientPhone = '') => {
    setOrderToEdit(null);
    setInitialPlateForModal(plate);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleEditOrder = (order: ServiceOrder) => {
    setOrderToEdit(order);
    setIsModalOpen(true);
  };

  // Open History / Complaint Check
  const handleSelectOrder = (order: ServiceOrder) => {
    setHistoryOrder(order);
    setIsHistoryModalOpen(true);
  };

  // Print Order
  const handlePrintOrder = (order: ServiceOrder) => {
    setOrderToPrint(order);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Export Data (Backup)
  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(orders, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `oficina_salgueiro_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup da Oficina Salgueiro exportado com sucesso!', 'success');
  };

  // Import Data (Restore)
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
          // Sync restored orders to cloud Firestore
          try {
            for (const item of parsed) {
              await firestoreService.saveOrderToFirestore(item);
            }
            setIsCloudSynced(true);
          } catch (err) {
            console.warn('Erro ao sincronizar restore com Firestore:', err);
          }
          try {
            await api.bulkSyncBackendOrders(parsed);
            setIsBackendOnline(true);
          } catch (err) {
            console.warn('Erro ao sincronizar restore com backend:', err);
          }
          showToast(`${parsed.length} ordens de serviço sincronizadas na nuvem e no servidor!`, 'success');
        } else {
          showToast('Arquivo JSON com formato inválido.', 'error');
        }
      } catch (err) {
        showToast('Erro ao ler arquivo de backup.', 'error');
      }
    };
    reader.readAsText(file);
  };

  // Reset to demo data
  const handleResetData = () => {
    setIsResetConfirmOpen(true);
  };

  const executeResetData = async () => {
    try {
      // Re-seed demo orders to Firestore
      for (const ord of INITIAL_SERVICE_ORDERS) {
        await firestoreService.saveOrderToFirestore(ord);
      }
      setIsCloudSynced(true);
      const resetOrders = await api.resetBackendOrders();
      setOrders(resetOrders);
      setIsBackendOnline(true);
    } catch (err) {
      setOrders(INITIAL_SERVICE_ORDERS);
    }
    setIsResetConfirmOpen(false);
    showToast('Dados restaurados para o padrão de demonstração na nuvem!', 'info');
  };

  // Filtered Orders logic
  const filteredOrders = useMemo(() => {
    const term = cleanPlate(searchTerm);
    const rawTerm = searchTerm.toLowerCase().trim();

    return orders.filter(order => {
      // Search matching: Plate (exact or partial), Client name, Phone, Bike model, Part name, or Brand!
      if (rawTerm) {
        const matchPlate = cleanPlate(order.licensePlate).includes(term);
        const matchClient = order.clientName.toLowerCase().includes(rawTerm);
        const matchPhone = (order.clientPhone || '').includes(rawTerm);
        const matchBike = order.bikeModel.toLowerCase().includes(rawTerm);
        const matchNotes = (order.mechanicNotes || '').toLowerCase().includes(rawTerm);
        const matchParts = order.parts.some(
          p => p.name.toLowerCase().includes(rawTerm) || p.brand.toLowerCase().includes(rawTerm)
        );

        if (!matchPlate && !matchClient && !matchPhone && !matchBike && !matchNotes && !matchParts) {
          return false;
        }
      }

      // Warranty Filter
      if (warrantyFilter === 'warranty-only') {
        const w = checkWarranty(order.serviceDate, order.warrantyDays);
        if (!w.isWithinWarranty) return false;
      } else if (warrantyFilter === 'expired-only') {
        const w = checkWarranty(order.serviceDate, order.warrantyDays);
        if (w.isWithinWarranty) return false;
      }

      return true;
    });
  }, [orders, searchTerm, warrantyFilter]);

  // Recent plates for quick chips
  const recentPlates = useMemo(() => {
    const set = new Set<string>();
    orders.forEach(o => {
      if (o.licensePlate) set.add(o.licensePlate);
    });
    return Array.from(set);
  }, [orders]);

  // All orders for the active history modal's plate
  const allOrdersForCurrentPlate = useMemo(() => {
    if (!historyOrder) return [];
    const cleanHistPlate = cleanPlate(historyOrder.licensePlate);
    return orders.filter(o => cleanPlate(o.licensePlate) === cleanHistPlate);
  }, [orders, historyOrder]);

  const totalRevenue = useMemo(() => {
    return orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  }, [orders]);

  const totalBikes = useMemo(() => {
    return new Set(orders.map(o => cleanPlate(o.licensePlate))).size;
  }, [orders]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-zinc-950 bg-carbon-mesh relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce no-print">
          <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-sm font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-emerald-200 border-emerald-700'
              : toastMessage.type === 'error'
              ? 'bg-red-950 text-red-200 border-red-700'
              : 'bg-zinc-900 text-zinc-100 border-zinc-700'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main App Header */}
      <Header
        onNewOrder={() => handleOpenNewOrder()}
        totalOrders={orders.length}
        totalRevenue={totalRevenue}
        totalBikes={totalBikes}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onResetData={handleResetData}
        isBackendOnline={isBackendOnline}
        isCloudSynced={isCloudSynced}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* High-Impact Workshop Hero Section with generated authentic workshop photo */}
        <div className="relative rounded-3xl overflow-hidden border border-zinc-800/80 shadow-2xl shadow-black/80 bg-zinc-950 no-print">
          <div className="absolute inset-0 z-0">
            <img
              src="/src/assets/images/salgueiro_motos_banner_1793973102947.jpg"
              alt="Oficina Mecânica Salgueiro Motos"
              className="w-full h-full object-cover opacity-35 filter brightness-75 contrast-125"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40"></div>
          </div>

          <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-bold font-chakra uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                Oficina Mecânica Especializada em Motos
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-chakra uppercase tracking-tight leading-none drop-shadow-md">
                SISTEMA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500">SALGUEIRO</span> MOTOS
              </h2>
              <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed drop-shadow-sm">
                Registro rápido por <strong className="text-white">Placa</strong>, identificação do <strong className="text-white">Cliente</strong>, rastreabilidade de <strong className="text-amber-400">Peças Trocadas (Marca)</strong> e respaldo legal em garantia de 90 dias.
              </p>
            </div>

            {/* Quick action hero cards */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
              <button
                onClick={() => handleOpenNewOrder()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <span>Concluir Serviço & Nova O.S.</span>
              </button>
              <button
                onClick={() => setSearchTerm('BRA2E19')}
                className="px-5 py-3 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700/80 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                <span>Simular Reclamação: Placa BRA2E19</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Cockpit Gauges */}
        <WorkshopStats orders={orders} />

        {/* Search & Filters */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          warrantyFilter={warrantyFilter}
          onWarrantyFilterChange={setWarrantyFilter}
          recentPlates={recentPlates}
          onSelectQuickPlate={(plate) => setSearchTerm(plate)}
        />

        {/* Services List */}
        <ServiceOrderList
          orders={filteredOrders}
          onSelectOrder={handleSelectOrder}
          onEditOrder={handleEditOrder}
          onDeleteOrder={handleDeleteOrder}
          onPrintOrder={handlePrintOrder}
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm('')}
        />
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900/50 border-t border-zinc-900 py-6 text-center text-xs text-zinc-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} <strong>Oficina Salgueiro Motos</strong> • Gestão Mecânica & Histórico de Peças
          </span>
          <span className="text-zinc-600">
            Registro seguro por Placa, Cliente, Peças, Marcas e Termo de Garantia CDC (90 dias)
          </span>
        </div>
      </footer>

      {/* New / Edit Service Order Modal */}
      <ServiceOrderModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setOrderToEdit(null);
          setInitialPlateForModal('');
        }}
        onSave={handleSaveOrder}
        orderToEdit={orderToEdit}
        initialPlate={initialPlateForModal}
        nextOrderNumber={nextOrderNumber}
      />

      {/* History & Complaint Dossier Modal */}
      <HistoryDetailModal
        order={historyOrder}
        allOrdersForPlate={allOrdersForCurrentPlate}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setHistoryOrder(null);
        }}
        onPrint={handlePrintOrder}
        onEdit={(ord) => {
          setIsHistoryModalOpen(false);
          handleEditOrder(ord);
        }}
        onDeleteOrder={(id, orderNumber) => {
          handleDeleteOrder(id, orderNumber);
        }}
        onNewOrderForPlate={(plate, clientName, bikeModel, clientPhone) => {
          handleOpenNewOrder(plate, clientName, bikeModel, clientPhone);
        }}
        onSelectSpecificOrder={(ord) => setHistoryOrder(ord)}
      />

      {/* Delete Confirmation Modal (In-App dialog replacing blocked window.confirm) */}
      <ConfirmModal
        isOpen={!!orderToDelete}
        title="Excluir Ordem de Serviço"
        description="Tem certeza que deseja excluir esta ordem de serviço? Esta ação removerá permanentemente o histórico e as peças trocadas do banco de dados da oficina."
        highlightInfo={orderToDelete ? [
          { label: 'Número da O.S.', value: `#${orderToDelete.orderNumber}` },
          { label: 'Placa da Moto', value: orderToDelete.plate },
          { label: 'Cliente', value: orderToDelete.clientName },
        ] : []}
        confirmText="Sim, Excluir Registro"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={executeDeleteOrder}
        onClose={() => setOrderToDelete(null)}
      />

      {/* Reset Confirmation Modal */}
      <ConfirmModal
        isOpen={isResetConfirmOpen}
        title="Restaurar Demonstração"
        description="Deseja recarregar o banco de dados com os registros de exemplo originais da Oficina Salgueiro? Todas as alterações manuais serão resetadas."
        confirmText="Restaurar Dados"
        cancelText="Voltar"
        isDestructive={false}
        onConfirm={executeResetData}
        onClose={() => setIsResetConfirmOpen(false)}
      />

      {/* Printable Receipt Layout (triggers on window.print()) */}
      <PrintReceipt order={orderToPrint || historyOrder} />
    </div>
  );
}
