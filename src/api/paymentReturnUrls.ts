import { WEB_BASE_URL } from '../config/env';

const ORDER_ID_PLACEHOLDER = '{order_id}';

/** HTTPS return URLs accepted by the API (custom schemes are rejected). */
export function essentialReturnUrl(tierCode: string): string {
  const base = WEB_BASE_URL.replace(/\/+$/, '');
  const tier = encodeURIComponent(tierCode.trim());
  return `${base}/Property/EssentialServiceReturn?tierCode=${tier}&order_id=${ORDER_ID_PLACEHOLDER}`;
}

export function contactPackReturnUrl(): string {
  const base = WEB_BASE_URL.replace(/\/+$/, '');
  return `${base}/Property/ContactPackPurchase?cf=contactpack&order_id=${ORDER_ID_PLACEHOLDER}`;
}

export function resolveReturnUrl(template: string, orderId: string): string {
  return template.replace(ORDER_ID_PLACEHOLDER, encodeURIComponent(orderId));
}

function isThaneflatsHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === 'thaneflats.com' || h.endsWith('.thaneflats.com')) return true;
  try {
    const webHost = new URL(WEB_BASE_URL).hostname.toLowerCase();
    return h === webHost;
  } catch {
    return false;
  }
}

/** Cashfree redirects here after pay — intercept in WebView; do not render web MVC pages. */
export function isCashfreeReturnNavigation(url: string): boolean {
  if (!url || url === 'about:blank') return false;

  if (url.startsWith('thaneproperty://payment-return')) return true;

  const lower = url.toLowerCase();

  if (
    lower.includes('essentialservicereturn') ||
    lower.includes('essentialservicesuccess')
  ) {
    return true;
  }

  if (lower.includes('contactpackpurchase')) {
    return (
      lower.includes('order_id=') ||
      lower.includes('orderid=') ||
      lower.includes('cf=contactpack')
    );
  }

  try {
    const u = new URL(url);
    if (!isThaneflatsHost(u.hostname)) return false;
    const path = u.pathname.toLowerCase();
    if (path.includes('essentialservicereturn') || path.includes('essentialservicesuccess')) {
      return true;
    }
    if (path.includes('contactpackpurchase')) {
      return (
        u.searchParams.has('order_id') ||
        u.searchParams.has('orderId') ||
        u.searchParams.get('cf') === 'contactpack'
      );
    }
  } catch {
    /* relative or malformed — fall through */
  }

  return false;
}

export type ParsedCashfreeReturn = {
  orderId?: string;
  tierCode?: string;
  product?: 'essential' | 'contact_pack';
};

/** Extract order / product hints from HTTPS return URL. */
export function parseCashfreeReturnUrl(url: string): ParsedCashfreeReturn | null {
  if (!isCashfreeReturnNavigation(url)) return null;

  if (url.startsWith('thaneproperty://')) {
    try {
      const u = new URL(url);
      return {
        orderId:
          u.searchParams.get('order_id') ??
          u.searchParams.get('orderId') ??
          undefined,
      };
    } catch {
      return {};
    }
  }

  try {
    const u = new URL(url);
    const path = u.pathname.toLowerCase();
    const orderId =
      u.searchParams.get('order_id') ?? u.searchParams.get('orderId') ?? undefined;
    const tierCode = u.searchParams.get('tierCode') ?? undefined;

    let product: ParsedCashfreeReturn['product'];
    if (
      path.includes('essentialservicereturn') ||
      path.includes('essentialservicesuccess')
    ) {
      product = 'essential';
    } else if (
      path.includes('contactpackpurchase') ||
      u.searchParams.get('cf') === 'contactpack'
    ) {
      product = 'contact_pack';
    }

    return { orderId: orderId ?? undefined, tierCode: tierCode ?? undefined, product };
  } catch {
    return {};
  }
}
