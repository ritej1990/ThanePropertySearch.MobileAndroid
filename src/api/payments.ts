import type { createApiClient } from './client';
import type { AgentPaymentSummaryResponse } from './agentTypes';
import type { PaymentTransaction } from './paymentHistoryTypes';
import type { OwnerListingSummary } from './ownerTypes';
import type {
  ActivateContactPackResponse,
  ActivateEssentialResponse,
  CashfreeOrderResponse,
  ContactCredits,
  EssentialStatus,
  PricingCatalog,
} from './paymentTypes';
import {
  agentLeadCreditsReturnUrl,
  agentListingPublishReturnUrl,
  builderLeadCreditsReturnUrl,
  builderProjectUploadReturnUrl,
  contactPackReturnUrl,
  essentialReturnUrl,
} from './paymentReturnUrls';

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

    getOwnerListingSummary() {
      return client.get<OwnerListingSummary>('/api/payments/owner-listing/summary');
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

    getBuilderSummary() {
      return client.get<Record<string, unknown>>('/api/payments/builder/summary');
    },

    getAgentSummary() {
      return client.get<AgentPaymentSummaryResponse>('/api/payments/agent/summary');
    },

    createBuilderProjectUploadOrder(tierCode: string) {
      return client.post<CashfreeOrderResponse>(
        '/api/payments/cashfree/create-builder-project-upload-order',
        { tierCode, returnUrl: builderProjectUploadReturnUrl(tierCode) }
      );
    },

    createBuilderLeadCreditsOrder(packageCode: string) {
      return client.post<CashfreeOrderResponse>(
        '/api/payments/cashfree/create-builder-lead-credits-order',
        { packageCode, returnUrl: builderLeadCreditsReturnUrl(packageCode) }
      );
    },

    /**
     * Quantity-based agent listing publish order (bundles properties + days + leads).
     * The API computes the price/tier and returns `amountInr`. The custom tier code
     * (CUSTOM-{p}-{d}-L{l}) is used for the return URL and post-payment activation.
     */
    createAgentListingPublishOrder(input: {
      propertyCount: number;
      durationDays: number;
      leadCount: number;
    }) {
      const tierCode = `CUSTOM-${input.propertyCount}-${input.durationDays}-L${input.leadCount}`;
      return client.post<CashfreeOrderResponse>(
        '/api/payments/cashfree/create-agent-listing-publish-order',
        {
          propertyCount: input.propertyCount,
          durationDays: input.durationDays,
          leadCount: input.leadCount,
          returnUrl: agentListingPublishReturnUrl(tierCode),
        }
      );
    },

    createAgentLeadCreditsOrder(packageCode: string) {
      return client.post<CashfreeOrderResponse>(
        '/api/payments/cashfree/create-agent-lead-credits-order',
        { packageCode, returnUrl: agentLeadCreditsReturnUrl(packageCode) }
      );
    },

    activateBuilderProjectUpload(tierCode: string, orderId: string, amountInr: number) {
      return client.post<{ message: string }>(
        '/api/payments/builder-project-upload/purchase',
        {
          tierCode,
          paymentMethod: 'Cashfree',
          paymentReference: orderId,
          paymentAmountDeclared: amountInr,
        }
      );
    },

    activateBuilderLeadCredits(packageCode: string, orderId: string, amountInr: number) {
      return client.post<{ message: string }>(
        '/api/payments/builder-lead-credits/purchase',
        {
          packageCode,
          paymentMethod: 'Cashfree',
          paymentReference: orderId,
          paymentAmountDeclared: amountInr,
        }
      );
    },

    activateAgentListingPublish(tierCode: string, orderId: string, amountInr: number) {
      return client.post<{ message: string }>(
        '/api/payments/agent-listing-publish/purchase',
        {
          tierCode,
          paymentMethod: 'Cashfree',
          paymentReference: orderId,
          paymentAmountDeclared: amountInr,
        }
      );
    },

    activateAgentLeadCredits(packageCode: string, orderId: string, amountInr: number) {
      return client.post<{ message: string }>(
        '/api/payments/agent-lead-credits/purchase',
        {
          packageCode,
          paymentMethod: 'Cashfree',
          paymentReference: orderId,
          paymentAmountDeclared: amountInr,
        }
      );
    },
  };
}
