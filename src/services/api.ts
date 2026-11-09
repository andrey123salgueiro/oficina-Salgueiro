import { ServiceOrder } from '../types';

const API_BASE = '/api';

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchAllOrders(): Promise<ServiceOrder[]> {
  const res = await fetch(`${API_BASE}/orders`);
  if (!res.ok) {
    throw new Error(`Erro ao buscar ordens no backend: ${res.statusText}`);
  }
  return res.json();
}

export async function createBackendOrder(orderData: any): Promise<ServiceOrder> {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    throw new Error(`Erro ao criar ordem no backend: ${res.statusText}`);
  }
  return res.json();
}

export async function updateBackendOrder(id: string, orderData: any): Promise<ServiceOrder> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    throw new Error(`Erro ao atualizar ordem no backend: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteBackendOrder(id: string): Promise<boolean> {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Erro ao excluir ordem no backend: ${res.statusText}`);
  }
  return true;
}

export async function bulkSyncBackendOrders(orders: ServiceOrder[]): Promise<boolean> {
  const res = await fetch(`${API_BASE}/orders/bulk-sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orders }),
  });
  return res.ok;
}

export async function resetBackendOrders(): Promise<ServiceOrder[]> {
  const res = await fetch(`${API_BASE}/orders/reset`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error('Falha ao restaurar dados');
  }
  const data = await res.json();
  return data.orders;
}
