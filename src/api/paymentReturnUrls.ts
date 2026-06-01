import { WEB_BASE_URL } from '../config/env';
import type { PaymentProduct } from '../services/paymentActivation';

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

export function builderProjectUploadReturnUrl(tierCode: string): string {
  const base = WEB_BASE_URL.replace(/\/+$/, '');
  const tier = encodeURIComponent(tierCode.trim());
  return `${base}/Builder/BuilderProjectUploadReturn?publishTier=${tier}&order_id=${ORDER_ID_PLACEHOLDER}`;
}

export function builderLeadCreditsReturnUrl(packageCode: string): string {
  const base = WEB_BASE_URL.replace(/\/+$/, '');
  const pkg = encodeURIComponent(packageCode.trim());
  return `${base}/Builder/BuilderLeadCreditsReturn?leadPackage=${pkg}&order_id=${ORDER_ID_PLACEHOLDER}`;
}

export function agentListingPublishReturnUrl(tierCode: string): string {
  const base = WEB_BASE_URL.replace(/\/+$/, '');
  const tier = encodeURIComponent(tierCode.trim());
  return `${base}/Agent/AgentListingPublishReturn?publishTier=${tier}&order_id=${ORDER_ID_PLACEHOLDER}`;
}

export function agentLeadCreditsReturnUrl(packageCode: string): string {
  const base = WEB_BASE_URL.replace(/\/+$/, '');
  const pkg = encodeURIComponent(packageCode.trim());
  return `${base}/Agent/AgentLeadCreditsReturn?leadPackage=${pkg}&order_id=${ORDER_ID_PLACEHOLDER}`;
}

/** Return URL template for Cashfree checkout (must be HTTPS on configured site host). */
export function cashfreeReturnUrlForProduct(
  product: PaymentProduct,
  tierCode?: string
): string {
  switch (product) {
    case 'essential':
      if (!tierCode) throw new Error('Plan tier is required for essential checkout.');
      return essentialReturnUrl(tierCode);
    case 'contact_pack':
      return contactPackReturnUrl();
    case 'builder_upload':
      return builderProjectUploadReturnUrl(tierCode ?? 'BUPLOAD1');
    case 'builder_leads':
      return builderLeadCreditsReturnUrl(tierCode ?? 'SOFT15');
    case 'agent_publish':
      return agentListingPublishReturnUrl(tierCode ?? 'B30');
    case 'agent_leads':
      return agentLeadCreditsReturnUrl(tierCode ?? 'SOFT15');
    default:
      return contactPackReturnUrl();
  }
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

  if (lower.includes('builderprojectuploadreturn')) {
    return lower.includes('order_id=') || lower.includes('orderid=');
  }

  if (lower.includes('builderleadcreditsreturn')) {
    return lower.includes('order_id=') || lower.includes('orderid=');
  }

  if (lower.includes('agentlistingpublishreturn')) {
    return lower.includes('order_id=') || lower.includes('orderid=');
  }

  if (lower.includes('agentleadcreditsreturn')) {
    return lower.includes('order_id=') || lower.includes('orderid=');
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
    if (
      path.includes('builderprojectuploadreturn') ||
      path.includes('builderleadcreditsreturn') ||
      path.includes('agentlistingpublishreturn') ||
      path.includes('agentleadcreditsreturn')
    ) {
      return u.searchParams.has('order_id') || u.searchParams.has('orderId');
    }
  } catch {
    /* relative or malformed — fall through */
  }

  return false;
}

export type ParsedCashfreeReturn = {
  orderId?: string;
  tierCode?: string;
  product?: PaymentProduct;
};

function tierFromQuery(u: URL): string | undefined {
  return (
    u.searchParams.get('tierCode') ??
    u.searchParams.get('publishTier') ??
    u.searchParams.get('leadPackage') ??
    undefined
  );
}

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
    const tierCode = tierFromQuery(u);

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
    } else if (path.includes('builderprojectuploadreturn')) {
      product = 'builder_upload';
    } else if (path.includes('builderleadcreditsreturn')) {
      product = 'builder_leads';
    } else if (path.includes('agentlistingpublishreturn')) {
      product = 'agent_publish';
    } else if (path.includes('agentleadcreditsreturn')) {
      product = 'agent_leads';
    }

    return { orderId: orderId ?? undefined, tierCode: tierCode ?? undefined, product };
  } catch {
    return {};
  }
}
