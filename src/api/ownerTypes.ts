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
  daysRemaining: number | null;
  totalRequests: number;
  pendingRequests: number;
};
