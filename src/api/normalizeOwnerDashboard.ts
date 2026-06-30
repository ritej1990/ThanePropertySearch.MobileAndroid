import type { OwnerDashboardItem } from './ownerTypes';

function readString(raw: Record<string, unknown>, camel: string, pascal: string): string {
  const v = raw[camel] ?? raw[pascal];
  return v == null ? '' : String(v);
}

function readNullableString(
  raw: Record<string, unknown>,
  camel: string,
  pascal: string
): string | null {
  const v = raw[camel] ?? raw[pascal];
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

function readBool(raw: Record<string, unknown>, camel: string, pascal: string): boolean {
  const v = raw[camel] ?? raw[pascal];
  return v === true;
}

function readNumber(raw: Record<string, unknown>, camel: string, pascal: string): number {
  const v = raw[camel] ?? raw[pascal];
  return typeof v === 'number' ? v : Number(v) || 0;
}

function readNullableNumber(
  raw: Record<string, unknown>,
  camel: string,
  pascal: string
): number | null {
  const v = raw[camel] ?? raw[pascal];
  if (v == null) return null;
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Maps owner-dashboard API rows (camelCase or PascalCase) to app types. */
export function normalizeOwnerDashboardItem(raw: unknown): OwnerDashboardItem {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    id: readNumber(r, 'id', 'Id'),
    title: readString(r, 'title', 'Title'),
    areaName: readString(r, 'areaName', 'AreaName'),
    reviewStatus: readString(r, 'reviewStatus', 'ReviewStatus'),
    ownerListingTier: readNullableString(r, 'ownerListingTier', 'OwnerListingTier'),
    listingDurationDays: readNumber(r, 'listingDurationDays', 'ListingDurationDays'),
    listingPeriodEndUtc: readNullableString(r, 'listingPeriodEndUtc', 'ListingPeriodEndUtc'),
    isFeaturedInSearch: readBool(r, 'isFeaturedInSearch', 'IsFeaturedInSearch'),
    isForRent: readBool(r, 'isForRent', 'IsForRent'),
    isForSale: readBool(r, 'isForSale', 'IsForSale'),
    isForPg: readBool(r, 'isForPg', 'IsForPg'),
    isHiddenFromSearch: readBool(r, 'isHiddenFromSearch', 'IsHiddenFromSearch'),
    availabilityVerificationStatus: readString(
      r,
      'availabilityVerificationStatus',
      'AvailabilityVerificationStatus'
    ) || 'VERIFIED',
    lastVerifiedAtUtc: readNullableString(r, 'lastVerifiedAtUtc', 'LastVerifiedAtUtc'),
    verificationEmailSentAtUtc: readNullableString(
      r,
      'verificationEmailSentAtUtc',
      'VerificationEmailSentAtUtc'
    ),
    verificationCount: readNumber(r, 'verificationCount', 'VerificationCount'),
    autoHidden: readBool(r, 'autoHidden', 'AutoHidden'),
    hiddenReason: readNullableString(r, 'hiddenReason', 'HiddenReason'),
    ownerAvailabilityOutcome: readNullableString(
      r,
      'ownerAvailabilityOutcome',
      'OwnerAvailabilityOutcome'
    ),
    daysRemaining: readNullableNumber(r, 'daysRemaining', 'DaysRemaining'),
    totalRequests: readNumber(r, 'totalRequests', 'TotalRequests'),
    pendingRequests: readNumber(r, 'pendingRequests', 'PendingRequests'),
    viewCount: readNullableNumber(r, 'viewCount', 'ViewCount') ?? undefined,
    favoriteCount: readNullableNumber(r, 'favoriteCount', 'FavoriteCount') ?? undefined,
    verificationDetail: readNullableString(r, 'verificationDetail', 'VerificationDetail'),
    reviewClarificationTicketId: readNullableNumber(
      r,
      'reviewClarificationTicketId',
      'ReviewClarificationTicketId'
    ),
  };
}

export function normalizeOwnerDashboard(list: unknown[]): OwnerDashboardItem[] {
  return list.map(normalizeOwnerDashboardItem);
}

export function readApiMessage(raw: unknown): string {
  const r = (raw ?? {}) as Record<string, unknown>;
  const msg = r.message ?? r.Message;
  return msg == null ? '' : String(msg);
}

export function readApiOutcome(raw: unknown): string | null {
  const r = (raw ?? {}) as Record<string, unknown>;
  const v = r.outcome ?? r.Outcome;
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

export function readApiHidden(raw: unknown): boolean {
  const r = (raw ?? {}) as Record<string, unknown>;
  return r.hidden === true || r.Hidden === true;
}
