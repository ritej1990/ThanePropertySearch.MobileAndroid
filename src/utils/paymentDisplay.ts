import type { PaymentTransaction } from '../api/paymentHistoryTypes';

const PRODUCT_LABELS: Record<string, string> = {
  UserEssential: 'Essential plan',
  UserContactPack: 'Contact reveal pack',
  OwnerListing: 'Owner listing',
  BuilderProjectUpload: 'Builder project upload',
  BuilderLeadCredits: 'Builder lead credits',
};

export function paymentProductLabel(productType: string): string {
  return PRODUCT_LABELS[productType] ?? productType.replace(/([A-Z])/g, ' $1').trim();
}

export function formatPaymentAmount(amount: number, currency: string): string {
  if (currency === 'INR' || !currency) {
    return `₹${amount.toLocaleString('en-IN')}`;
  }
  return `${currency} ${amount}`;
}

export function formatPaymentDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function paymentStatusTone(
  status: string
): 'success' | 'pending' | 'failed' | 'neutral' {
  const s = status.toLowerCase();
  if (s.includes('complete') || s.includes('success') || s === 'paid') {
    return 'success';
  }
  if (s.includes('pending') || s.includes('process')) {
    return 'pending';
  }
  if (s.includes('fail') || s.includes('cancel')) {
    return 'failed';
  }
  return 'neutral';
}

export function filterEssentialPayments(rows: PaymentTransaction[]): PaymentTransaction[] {
  return rows.filter(
    (r) => r.productType?.toLowerCase() === 'useressential'
  );
}
