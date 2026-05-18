import * as SecureStore from 'expo-secure-store';
import type { PaymentProduct } from '../services/paymentActivation';

const PENDING_PAYMENT_KEY = 'pending_cashfree_checkout';

export type PendingPayment = {
  product: PaymentProduct;
  orderId: string;
  tierCode?: string;
  amountInr: number;
  returnPropertyId?: number;
};

export async function savePendingPayment(pending: PendingPayment): Promise<void> {
  await SecureStore.setItemAsync(PENDING_PAYMENT_KEY, JSON.stringify(pending));
}

export async function loadPendingPayment(): Promise<PendingPayment | null> {
  try {
    const raw = await SecureStore.getItemAsync(PENDING_PAYMENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PendingPayment;
  } catch {
    return null;
  }
}

export async function clearPendingPayment(): Promise<void> {
  await SecureStore.deleteItemAsync(PENDING_PAYMENT_KEY);
}
