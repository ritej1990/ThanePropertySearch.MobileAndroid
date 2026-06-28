import { Linking, Platform } from 'react-native';

/** Schemes Cashfree checkout may redirect to for UPI / wallet apps. */
const PAYMENT_APP_SCHEMES = [
  'upi',
  'tez',
  'gpay',
  'paytmmp',
  'phonepe',
  'bhim',
  'credpay',
  'amazonpay',
] as const;

function schemeOf(url: string): string | null {
  const match = /^([a-z][a-z0-9+.-]*):/i.exec(url.trim());
  return match ? match[1].toLowerCase() : null;
}

/** True when the URL should open in GPay / PhonePe / Paytm / BHIM etc., not in the WebView. */
export function isPaymentAppDeepLink(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  if (trimmed.toLowerCase().startsWith('intent://')) {
    return true;
  }

  const scheme = schemeOf(trimmed);
  if (!scheme) return false;
  return (PAYMENT_APP_SCHEMES as readonly string[]).includes(scheme);
}

/** Hand off to the installed UPI / wallet app. Returns false when open failed. */
export async function openPaymentAppDeepLink(url: string): Promise<boolean> {
  try {
    if (Platform.OS === 'ios') {
      const supported = await Linking.canOpenURL(url);
      if (!supported) return false;
    }
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
