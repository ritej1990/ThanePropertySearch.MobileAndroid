import type { TranslateFn } from '../i18n';
import type { PaymentProduct } from '../services/paymentActivation';

export function routeForPaymentProduct(product?: PaymentProduct) {
  switch (product) {
    case 'contact_pack':
      return 'ContactPackPurchase' as const;
    case 'builder_upload':
    case 'builder_leads':
      return 'BuilderPayments' as const;
    case 'agent_publish':
    case 'agent_leads':
      return 'AgentPayments' as const;
    default:
      return 'EssentialService' as const;
  }
}

/** API / Cashfree messages when checkout was abandoned or never paid. */
export function isPaymentIncompleteMessage(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes('not paid') ||
    m.includes('not completed') ||
    m.includes('cancel') ||
    m.includes('payment was returned')
  );
}

export function paymentIncompleteAlert(
  t: TranslateFn,
  message: string
): { title: string; body: string } {
  if (isPaymentIncompleteMessage(message)) {
    return {
      title: t('checkout.notCompleted'),
      body: t('checkout.leftEarly'),
    };
  }
  return {
    title: t('checkout.couldNotConfirm'),
    body: message,
  };
}
