import type { AgentListingDetails } from '../api/agentTypes';
import type { PropertyResponse } from '../api/types';
import { normalizeProperty } from '../api/normalizeProperty';

function categoryFlags(category: string) {
  const c = category.trim().toLowerCase();
  return {
    isForRent: c === 'rent' || c === 'commercial',
    isForSale: c === 'sale',
    isForPg: c === 'pg',
  };
}

/** Maps agent listing API payload to the shared property detail shape. */
export function normalizeAgentListing(detail: AgentListingDetails): PropertyResponse {
  const flags = categoryFlags(detail.listingCategory);
  const imageUrls =
    detail.imageUrls?.length > 0
      ? detail.imageUrls
      : detail.coverImageUrl
        ? [detail.coverImageUrl]
        : [];

  return normalizeProperty({
    id: detail.id,
    title: detail.title,
    description: detail.description,
    rentAmount: Number(detail.rentAmount),
    sellPrice: detail.sellPrice != null ? Number(detail.sellPrice) : null,
    depositAmount: Number(detail.depositAmount),
    builtupSqft: Number(detail.builtupSqft),
    bhkConfiguration: detail.bhkConfiguration,
    imageUrl: imageUrls[0] ?? detail.coverImageUrl ?? '',
    address: detail.address,
    areaName: detail.areaName,
    latitude: detail.latitude,
    longitude: detail.longitude,
    ...flags,
    reviewStatus: detail.reviewStatus,
    ownerName: 'Licensed agent',
    averageRating: 0,
    ratingCount: 0,
    imageUrls,
    createdAtUtc: detail.createdAtUtc,
    richMetadataJson: detail.richMetadataJson,
    availableFrom: detail.availableFrom,
    isFeaturedInSearch: false,
    listingPeriodEndUtc: detail.listingPeriodEndUtc,
    ownerId: null,
    isNegotiable: detail.isNegotiable,
    isPostedByAgent: true,
    reraNumber: detail.agentReraNumber ?? null,
  });
}
