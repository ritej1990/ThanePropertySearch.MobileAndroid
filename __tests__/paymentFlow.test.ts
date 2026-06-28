import {
  isPaymentIncompleteMessage,
  paymentIncompleteAlert,
  routeForPaymentProduct,
} from '../src/utils/paymentFlow';

describe('paymentFlow', () => {
  it('routes products back to the correct screen', () => {
    expect(routeForPaymentProduct('essential')).toBe('EssentialService');
    expect(routeForPaymentProduct('agent_publish')).toBe('AgentPayments');
    expect(routeForPaymentProduct('contact_pack')).toBe('ContactPackPurchase');
  });

  it('detects incomplete payment messages', () => {
    expect(isPaymentIncompleteMessage('Cashfree order is not paid yet.')).toBe(true);
    expect(isPaymentIncompleteMessage('Payment cancelled.')).toBe(true);
    expect(isPaymentIncompleteMessage('Invalid pack')).toBe(false);
  });

  it('uses friendly copy for abandoned checkout', () => {
    const alert = paymentIncompleteAlert('Cashfree order is not paid yet.');
    expect(alert.title).toBe('Payment not completed');
    expect(alert.body).toMatch(/left checkout/i);
  });
});
