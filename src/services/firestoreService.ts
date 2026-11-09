import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ServiceOrder } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const ORDERS_COLLECTION = 'service_orders';

/**
 * Real-time listener for all service orders, ordered by orderNumber descending
 * Changes made on mobile appear instantly on computer and vice-versa!
 */
export function subscribeToOrders(
  onSuccess: (orders: ServiceOrder[]) => void,
  onError?: (error: Error) => void
): () => void {
  const q = query(collection(db, ORDERS_COLLECTION));

  return onSnapshot(
    q,
    (snapshot) => {
      const orders: ServiceOrder[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as ServiceOrder;
        orders.push({
          ...data,
          id: docSnap.id,
        });
      });

      // Sort by orderNumber descending (newest first)
      orders.sort((a, b) => (b.orderNumber || 0) - (a.orderNumber || 0));
      onSuccess(orders);
    },
    (error) => {
      console.error('Erro na escuta em tempo real do Firestore:', error);
      if (onError) {
        onError(error);
      }
      handleFirestoreError(error, OperationType.GET, ORDERS_COLLECTION);
    }
  );
}

/**
 * Fetch all orders once
 */
export async function getOrdersFromFirestore(): Promise<ServiceOrder[]> {
  try {
    const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    const orders: ServiceOrder[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as ServiceOrder;
      orders.push({
        ...data,
        id: docSnap.id,
      });
    });
    orders.sort((a, b) => (b.orderNumber || 0) - (a.orderNumber || 0));
    return orders;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, ORDERS_COLLECTION);
  }
}

/**
 * Save or update a service order in Firestore
 */
export async function saveOrderToFirestore(order: ServiceOrder): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, order.id);
  try {
    // Sanitize order payload
    const payload: ServiceOrder = {
      ...order,
      orderNumber: Number(order.orderNumber),
      mileage: Number(order.mileage || 0),
      partsTotal: Number(order.partsTotal || 0),
      laborTotal: Number(order.laborTotal || 0),
      discount: Number(order.discount || 0),
      totalAmount: Number(order.totalAmount || 0),
      warrantyDays: Number(order.warrantyDays || 90),
      parts: (order.parts || []).map(p => ({
        ...p,
        quantity: Number(p.quantity || 1),
        unitPrice: Number(p.unitPrice || 0),
        subtotal: Number(p.subtotal || 0),
      })),
      labor: (order.labor || []).map(l => ({
        ...l,
        price: Number(l.price || 0),
      })),
      updatedAt: new Date().toISOString(),
    };
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ORDERS_COLLECTION}/${order.id}`);
  }
}

/**
 * Delete a service order from Firestore
 */
export async function deleteOrderFromFirestore(orderId: string): Promise<void> {
  const docRef = doc(db, ORDERS_COLLECTION, orderId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ORDERS_COLLECTION}/${orderId}`);
  }
}

/**
 * Seed initial data if Firestore collection is empty on first run
 */
export async function seedInitialFirestoreData(initialOrders: ServiceOrder[]): Promise<boolean> {
  try {
    const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    if (snapshot.empty && initialOrders.length > 0) {
      console.log('Populando Firestore com ordens de serviço iniciais da Oficina Salgueiro...');
      const batch = writeBatch(db);
      for (const ord of initialOrders) {
        const ref = doc(db, ORDERS_COLLECTION, ord.id);
        batch.set(ref, ord);
      }
      await batch.commit();
      console.log('Firestore populado com sucesso.');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('Não foi possível verificar ou popular Firestore inicialmente:', error);
    return false;
  }
}
