import {
  paymentProductLabel,
  formatPaymentAmount,
  paymentStatusTone,
  paymentInvoiceEligible,
  showInvoiceDownload,
  filterAgentPayments,
  filterEssentialPayments,
} from '../src/utils/paymentDisplay';
import { formatInr } from '../src/utils/propertyFormat';
import type { PaymentTransaction } from '../src/api/paymentHistoryTypes';

function tx(over: Partial<PaymentTransaction>): PaymentTransaction {
  return {
    id: 1,
    amount: 100,
    currency: 'INR',
    paymentMethod: 'Cashfree',
    productType: 'AgentListingPublish',
    status: 'Completed',
    tierCode: 'CUSTOM-1-7-L0',
    propertyListingId: null,
    payerReferenceNote: null,
    createdAtUtc: '2026-06-01T10:00:00Z',
    completedAtUtc: '2026-06-01T10:01:00Z',
    ...over,
  };
}

describe('Payment display', () => {
  it('maps known product types to friendly labels', () => {
    expect(paymentProductLabel('AgentListingPublish')).toBe('Agent listing publish');
    expect(paymentProductLabel('UserEssential')).toBe('Essential plan');
  });

  it('falls back to spaced PascalCase for unknown products', () => {
    expect(paymentProductLabel('SomeNewProduct')).toBe('Some New Product');
  });

  it('formats amounts in INR', () => {
    expect(formatPaymentAmount(2499, 'INR')).toBe('₹2,499');
    expect(formatPaymentAmount(50, 'USD')).toBe('USD 50');
    expect(formatInr(1234567)).toBe('₹12,34,567'); // Indian grouping
    expect(formatInr(null)).toBe('—');
  });

  it('classifies status tone', () => {
    expect(paymentStatusTone('Completed')).toBe('success');
    expect(paymentStatusTone('paid')).toBe('success');
    expect(paymentStatusTone('Pending')).toBe('pending');
    expect(paymentStatusTone('Failed')).toBe('failed');
    expect(paymentStatusTone('Cancelled')).toBe('failed');
    expect(paymentStatusTone('weird')).toBe('neutral');
  });

  it('invoice eligibility requires eligible product AND success', () => {
    expect(paymentInvoiceEligible(tx({ productType: 'AgentListingPublish', status: 'Completed' }))).toBe(true);
    expect(paymentInvoiceEligible(tx({ productType: 'AgentListingPublish', status: 'Pending' }))).toBe(false);
    expect(paymentInvoiceEligible(tx({ productType: 'OwnerListing', status: 'Completed' }))).toBe(false);
  });

  it('showInvoiceDownload honors explicit flags', () => {
    expect(showInvoiceDownload(tx({ hasInvoice: true, status: 'Pending' }))).toBe(true);
    expect(showInvoiceDownload(tx({ canDownloadInvoice: true, status: 'Pending' }))).toBe(true);
  });

  it('filters agent vs essential payments', () => {
    const rows = [
      tx({ id: 1, productType: 'AgentListingPublish' }),
      tx({ id: 2, productType: 'AgentLeadCredits' }),
      tx({ id: 3, productType: 'UserEssential' }),
      tx({ id: 4, productType: 'OwnerListing' }),
    ];
    expect(filterAgentPayments(rows).map((r) => r.id)).toEqual([1, 2]);
    expect(filterEssentialPayments(rows).map((r) => r.id)).toEqual([3]);
  });
});
