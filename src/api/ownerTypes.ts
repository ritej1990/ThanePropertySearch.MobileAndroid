/** GET /api/properties/owner-dashboard */
export type OwnerDashboardItem = {
  id: number;
  title: string;
  areaName: string;
  reviewStatus: string;
  ownerListingTier: string | null;
  listingDurationDays: number;
  listingPeriodEndUtc: string | null;
  isFeaturedInSearch: boolean;
  isForRent?: boolean;
  isForSale?: boolean;
  isForPg?: boolean;
  isHiddenFromSearch?: boolean;
  ownerAvailabilityOutcome?: string | null;
  daysRemaining: number | null;
  totalRequests: number;
  pendingRequests: number;
  viewCount?: number;
};

export type OwnerAvailabilityOutcome = '' | 'Rented' | 'Sold';
