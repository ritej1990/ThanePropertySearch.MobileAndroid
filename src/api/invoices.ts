import type { createApiClient } from './client';

export function createInvoicesApi(client: ReturnType<typeof createApiClient>) {
  return {
    /** HTML invoice — same format as web `Property/DownloadInvoice`. */
    getMyInvoiceHtml(paymentTransactionId: number) {
      return client.get<string>(`/api/invoices/my/${paymentTransactionId}`);
    },
  };
}
