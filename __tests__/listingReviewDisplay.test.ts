import type { OwnerDashboardItem } from '../src/api/ownerTypes';
import {
  getOwnerListingDisplayStatus,
  getPropertyListingDisplayStatus,
  shouldShowListingAsInactive,
} from '../src/utils/ownerDashboard';

function ownerItem(over: Partial<OwnerDashboardItem>): OwnerDashboardItem {
  return {
    id: 24,
    title: 'Test',
    areaName: 'Thane',
    reviewStatus: 'Approved',
    pendingRequests: 0,
    totalRequests: 0,
    isForRent: true,
    isForSale: false,
    isForPg: false,
    isFeaturedInSearch: false,
    listingDurationDays: 30,
    daysRemaining: 10,
    ownerListingTier: null,
    listingPeriodEndUtc: null,
    ownerAvailabilityOutcome: null,
    verificationDetail: null,
    isHiddenFromSearch: false,
    ...over,
  };
}

describe('listing review display', () => {
  it('shows Inactive when approved listing is hidden from search', () => {
    expect(
      shouldShowListingAsInactive('Approved', true)
    ).toBe(true);
    expect(
      getOwnerListingDisplayStatus(ownerItem({ isHiddenFromSearch: true }))
    ).toBe('Inactive');
    expect(
      getPropertyListingDisplayStatus({
        reviewStatus: 'Approved',
        isHiddenFromSearch: true,
        listingPeriodEndUtc: '2030-01-01T00:00:00Z',
      })
    ).toBe('Inactive');
  });

  it('keeps Approved when listing is visible', () => {
    expect(
      getOwnerListingDisplayStatus(ownerItem({ isHiddenFromSearch: false }))
    ).toBe('Approved');
  });
});
