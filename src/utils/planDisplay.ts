import type { EssentialStatus } from '../api/paymentTypes';

export function normalizeEssentialUsage(status: EssentialStatus) {
  const usageMax = Math.max(0, status.usageMax);
  const apiUsed = Math.max(0, status.usageUsed);
  const apiLeft = Math.max(0, status.usageLeft);

  if (usageMax <= 0) {
    return { usageMax: 0, usageUsed: apiUsed, usageLeft: apiLeft };
  }

  if (apiUsed + apiLeft === usageMax) {
    return { usageMax, usageUsed: apiUsed, usageLeft: apiLeft };
  }

  if (apiLeft <= usageMax) {
    return {
      usageMax,
      usageUsed: Math.max(0, usageMax - apiLeft),
      usageLeft: apiLeft,
    };
  }

  const usageUsed = Math.min(usageMax, apiUsed);
  return {
    usageMax,
    usageUsed,
    usageLeft: Math.max(0, usageMax - usageUsed),
  };
}

export function formatPlanEndDate(endsAtUtc: string | null | undefined): string | null {
  if (!endsAtUtc) return null;
  const d = new Date(endsAtUtc);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getEssentialStatusLabel(status: EssentialStatus | null): {
  label: string;
  tone: 'active' | 'warn' | 'expired';
} {
  if (!status) return { label: 'Inactive', tone: 'expired' };

  const { usageLeft, usageMax } = normalizeEssentialUsage(status);

  const hasCreditsUsed =
    !status.active &&
    status.endsAtUtc &&
    new Date(status.endsAtUtc) > new Date() &&
    usageMax > 0 &&
    usageLeft <= 0;

  if (hasCreditsUsed) return { label: 'Credits used', tone: 'warn' };

  const expired = !status.active;
  if (expired) return { label: 'Expired', tone: 'expired' };

  if (usageLeft <= 5) return { label: 'Low usage', tone: 'warn' };

  return { label: 'Active', tone: 'active' };
}

/** True when user cannot buy/recharge another essential plan (matches web + Cashfree API). */
export function hasActiveEssentialPlan(status: EssentialStatus | null): boolean {
  if (!status) return false;
  if (status.active) return true;

  const usageLeft = status.usageLeft ?? 0;
  if (usageLeft <= 0) return false;

  const end = status.endsAtUtc ? new Date(status.endsAtUtc) : null;
  if (!end || Number.isNaN(end.getTime())) return false;

  return end.getTime() > Date.now();
}

export function canPurchaseEssentialPlan(status: EssentialStatus | null): boolean {
  return !hasActiveEssentialPlan(status);
}

export function findCurrentPlanCode(
  status: EssentialStatus | null,
  plans: { code: string }[]
): string | null {
  if (!status?.tier) return null;
  const tier = status.tier.trim().toLowerCase();
  const match = plans.find((p) => p.code.trim().toLowerCase() === tier);
  return match?.code ?? status.tier;
}
