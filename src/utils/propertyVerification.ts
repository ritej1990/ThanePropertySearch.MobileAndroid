import type { PropertyResponse } from '../api/types';
import type { OwnerDashboardItem } from '../api/ownerTypes';

export type VerificationBadgeTone = 'verified' | 'pending' | 'hidden' | 'sold' | 'rented' | 'neutral';

export function verificationBadgeForListing(item: {
  availabilityVerificationStatus?: string | null;
  lastVerifiedAtUtc?: string | null;
  autoHidden?: boolean;
  isHiddenFromSearch?: boolean;
}): { label: string; tone: VerificationBadgeTone } | null {
  const status = (item.availabilityVerificationStatus ?? 'VERIFIED').trim().toUpperCase();

  if (status === 'SOLD') {
    return { label: 'Sold', tone: 'sold' };
  }
  if (status === 'RENTED') {
    return { label: 'Rented', tone: 'rented' };
  }
  if (item.autoHidden || status === 'EXPIRED' || item.isHiddenFromSearch) {
    return { label: 'Listing hidden', tone: 'hidden' };
  }
  if (status === 'PENDING') {
    return { label: 'Verification pending', tone: 'pending' };
  }

  if (item.lastVerifiedAtUtc) {
    const days = Math.max(
      0,
      Math.floor((Date.now() - Date.parse(item.lastVerifiedAtUtc)) / 86_400_000)
    );
    if (days === 0) {
      return { label: 'Verified today', tone: 'verified' };
    }
    return { label: `Verified ${days} day${days === 1 ? '' : 's'} ago`, tone: 'verified' };
  }

  return { label: 'Verified', tone: 'verified' };
}

export function ownerVerificationStatusLabel(item: OwnerDashboardItem): string {
  return verificationBadgeForListing(item)?.label ?? 'Verified';
}

export function propertyVerificationBadge(item: PropertyResponse) {
  return verificationBadgeForListing(item);
}
