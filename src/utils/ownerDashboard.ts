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
