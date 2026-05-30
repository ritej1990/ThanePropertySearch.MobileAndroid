import type { OwnerDashboardItem } from '../api/ownerTypes';

export type ReviewStatusTone = 'approved' | 'pending' | 'rejected' | 'neutral';

export function reviewStatusTone(status: string): ReviewStatusTone {
  const s = status.trim().toLowerCase();
  if (s.includes('approv')) return 'approved';
  if (s.includes('reject') || s.includes('declin')) return 'rejected';
  if (s.includes('pend') || s.includes('review')) return 'pending';
  return 'neutral';
}

export function formatDaysRemaining(days: number | null): string {
  if (days == null) return '—';
  if (days <= 0) return 'Expired';
  if (days === 1) return '1 day left';
  return `${days} days left`;
}

export function listingVisibilityProgress(
  item: OwnerDashboardItem
): { percent: number; label: string } {
  if (item.daysRemaining == null || item.listingDurationDays <= 0) {
    return { percent: 0, label: 'No expiry data' };
  }
  const pct = Math.min(
    100,
    Math.max(0, (item.daysRemaining / item.listingDurationDays) * 100)
  );
  return { percent: pct, label: formatDaysRemaining(item.daysRemaining) };
}

export type OwnerDashboardStats = {
  total: number;
  pendingRequests: number;
  approved: number;
  featured: number;
  withPendingInquiries: number;
};

export function computeOwnerStats(rows: OwnerDashboardItem[]): OwnerDashboardStats {
  return {
    total: rows.length,
    pendingRequests: rows.reduce((sum, r) => sum + r.pendingRequests, 0),
    approved: rows.filter((r) => reviewStatusTone(r.reviewStatus) === 'approved')
      .length,
    featured: rows.filter((r) => r.isFeaturedInSearch).length,
    withPendingInquiries: rows.filter((r) => r.pendingRequests > 0).length,
  };
}

export type OwnerListFilter =
  | 'all'
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'expired'
  | 'rented'
  | 'sold'
  | 'needs-reply';

export const OWNER_LIST_FILTERS: { key: OwnerListFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending' },
  { key: 'needs-reply', label: 'Needs reply' },
  { key: 'rented', label: 'Rented' },
  { key: 'sold', label: 'Sold' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'expired', label: 'Expired' },
];

export function isOwnerClosedOutcome(
  outcome: string | null | undefined
): boolean {
  const o = (outcome ?? '').trim().toLowerCase();
  return o === 'rented' || o === 'sold';
}

export function isOwnerListingExpired(item: OwnerDashboardItem): boolean {
  const status = item.reviewStatus?.trim() ?? '';
  if (status.toLowerCase() === 'expired') return true;
  return (
    status.toLowerCase() === 'approved' &&
    item.daysRemaining != null &&
    item.daysRemaining <= 0
  );
}

export function ownerListingFilterTags(item: OwnerDashboardItem): OwnerListFilter[] {
  const tags: OwnerListFilter[] = [];
  const review = (item.reviewStatus ?? '').trim().toLowerCase();

  if (review.includes('approv') && !isOwnerListingExpired(item)) {
    tags.push('approved');
  } else if (review.includes('pend') || review.includes('inprogress') || review.includes('awaiting')) {
    tags.push('pending');
  } else if (review.includes('reject') || review.includes('declin')) {
    tags.push('rejected');
  }

  if (isOwnerListingExpired(item)) {
    tags.push('expired');
  }

  const outcome = (item.ownerAvailabilityOutcome ?? '').trim().toLowerCase();
  if (outcome === 'rented') tags.push('rented');
  if (outcome === 'sold') tags.push('sold');
  if (item.pendingRequests > 0) tags.push('needs-reply');

  return tags;
}

export function filterOwnerListings(
  rows: OwnerDashboardItem[],
  filter: OwnerListFilter
): OwnerDashboardItem[] {
  if (filter === 'all') return rows;
  return rows.filter((item) => ownerListingFilterTags(item).includes(filter));
}

export function ownerOutcomeLabel(outcome: string | null | undefined): string {
  const o = (outcome ?? '').trim();
  if (!o) return 'On market';
  return o;
}
