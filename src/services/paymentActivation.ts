import { ApiError } from '../api/client';
import { paymentsApi } from '../api/singleton';

export type PaymentProduct =
  | 'essential'
  | 'contact_pack'
  | 'agent_publish'
  | 'builder_upload'
  | 'builder_leads'
  | 'agent_leads';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function activateCashfreeOrder(
  product: PaymentProduct,
  orderId: string,
  tierCode: string | undefined,
  amountInr: number,
  maxAttempts = 8
): Promise<string> {
  let lastError = 'Payment verification failed.';

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      if (product === 'essential') {
        if (!tierCode) throw new Error('Plan tier is missing.');
        const res = await paymentsApi.activateEssential(tierCode, orderId, amountInr);
        return res.message;
      }
      if (product === 'contact_pack') {
        const res = await paymentsApi.activateContactPack(orderId, amountInr);
        return res.message;
      }
      if (product === 'builder_upload') {
        if (!tierCode) throw new Error('Plan tier is missing.');
        const res = await paymentsApi.activateBuilderProjectUpload(
          tierCode,
          orderId,
          amountInr
        );
        return res.message;
      }
      if (product === 'builder_leads') {
        if (!tierCode) throw new Error('Lead pack is missing.');
        const res = await paymentsApi.activateBuilderLeadCredits(
          tierCode,
          orderId,
          amountInr
        );
        return res.message;
      }
      if (product === 'agent_publish') {
        if (!tierCode) throw new Error('Plan tier is missing.');
        const res = await paymentsApi.activateAgentListingPublish(
          tierCode,
          orderId,
          amountInr
        );
        return res.message;
      }
      if (product === 'agent_leads') {
        if (!tierCode) throw new Error('Lead pack is missing.');
        const res = await paymentsApi.activateAgentLeadCredits(
          tierCode,
          orderId,
          amountInr
        );
        return res.message;
      }
      throw new Error('This payment type is not activated on mobile yet.');
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : e instanceof Error ? e.message : lastError;
      lastError = msg;
      const retryable =
        msg.toLowerCase().includes('not paid') ||
        msg.toLowerCase().includes('not found');
      if (!retryable || attempt === maxAttempts - 1) {
        throw new Error(msg);
      }
      await sleep(2000);
    }
  }

  throw new Error(lastError);
}
