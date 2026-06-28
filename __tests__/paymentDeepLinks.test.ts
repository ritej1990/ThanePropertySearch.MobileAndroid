import { isPaymentAppDeepLink } from '../src/utils/paymentDeepLinks';

describe('paymentDeepLinks', () => {
  it('detects common UPI and wallet schemes', () => {
    expect(isPaymentAppDeepLink('upi://pay?pa=test@upi&am=1')).toBe(true);
    expect(isPaymentAppDeepLink('tez://upi/pay?pa=test@upi')).toBe(true);
    expect(isPaymentAppDeepLink('gpay://upi/pay?pa=test@upi')).toBe(true);
    expect(isPaymentAppDeepLink('paytmmp://pay?pa=test@upi')).toBe(true);
    expect(isPaymentAppDeepLink('phonepe://pay?pa=test@upi')).toBe(true);
    expect(isPaymentAppDeepLink('bhim://pay?pa=test@upi')).toBe(true);
    expect(isPaymentAppDeepLink('intent://pay#Intent;scheme=upi;end')).toBe(true);
  });

  it('ignores https and app return URLs', () => {
    expect(isPaymentAppDeepLink('https://payments.cashfree.com/order')).toBe(false);
    expect(isPaymentAppDeepLink('thaneproperty://payment-return')).toBe(false);
    expect(isPaymentAppDeepLink('')).toBe(false);
    expect(isPaymentAppDeepLink(null)).toBe(false);
  });
});
