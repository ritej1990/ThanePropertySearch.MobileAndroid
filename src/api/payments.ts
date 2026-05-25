import type { createApiClient } from './client';
import type { PaymentTransaction } from './paymentHistoryTypes';
import type {
  ActivateContactPackResponse,
  ActivateEssentialResponse,
  CashfreeOrderResponse,
  ContactCredits,
  EssentialStatus,
  PricingCatalog,
} from './paymentTypes';
import { contactPackReturnUrl, essentialReturnUrl } from './paymentReturnUrls';

export function createPaymentsApi(client: ReturnType<typeof createApiClient>) {
  return {
    getPricing() {
      return client.get<PricingCatalog>('/api/pricing', { auth: false });
    },

    getEssentialStatus() {
      return client.get<EssentialStatus>('/api/users/essential-status');
    },

    getContactCredits() {
      return client.get<ContactCredits>('/api/users/contact-credits');
    },

    createEssentialOrder(tierCode: string) {
      return client.post<CashfreeOrderResponse>(
        '/api/payments/cashfree/create-user-essential-order',
        { tierCode, returnUrl: essentialReturnUrl(tierCode) }
      );
    },

    createContactPackOrder() {
      return client.post<CashfreeOrderResponse>(
        '/api/payments/cashfree/create-user-contact-pack-order',
        { returnUrl: contactPackReturnUrl() }
      );
    },

    activateEssential(
      tierCode: string,
      orderId: string,
      amountInr: number
    ) {
      return client.post<ActivateEssentialResponse>('/api/payments/user-essential', {
        tierCode,
        paymentMethod: 'Cashfree',
        paymentReference: orderId,
        paymentAmountDeclared: amountInr,
      });
    },

    activateContactPack(orderId: string, amountInr: number) {
      return client.post<ActivateContactPackResponse>(
        '/api/payments/user-contact-pack',
        {
          paymentMethod: 'Cashfree',
          paymentReference: orderId,
          paymentAmountDeclared: amountInr,
        }
      );
    },

    getMyTransactions() {
      return client.get<PaymentTransaction[]>('/api/payments/my');
    },
  };
}
