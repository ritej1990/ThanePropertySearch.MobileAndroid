import type { PropertyResponse } from '../api/types';

export type ListingTypeFilter = 'all' | 'rent' | 'sale' | 'pg';

export type SortOption = 'newest' | 'price_asc' | 'price_desc';

export type RentPresetKey = 'any' | 'under15' | '15to25' | '25to40' | 'above40';

export const BHK_FILTER_OPTIONS = ['1 RK', '1 BHK', '2 BHK', '3 BHK'] as const;

export const RENT_PRESETS: {
  key: RentPresetKey;
  label: string;
  min: number | null;
  max: number | null;
}[] = [
  { key: 'any', label: 'Any budget', min: null, max: null },
  { key: 'under15', label: 'Under ₹15k', min: null, max: 15000 },
  { key: '15to25', label: '₹15k–25k', min: 15000, max: 25000 },
  { key: '25to40', label: '₹25k–40k', min: 25000, max: 40000 },
  { key: 'above40', label: '₹40k+', min: 40000, max: null },
];

export type PropertySearchFilters = {
  listingType: ListingTypeFilter;
  bhk: string[];
  rentPreset: RentPresetKey;
  featuredOnly: boolean;
  sort: SortOption;
};

export const defaultSearchFilters = (): PropertySearchFilters => ({
  listingType: 'all',
  bhk: [],
  rentPreset: 'any',
  featuredOnly: false,
  sort: 'newest',
});

function monthlyPrice(item: PropertyResponse): number {
  if (item.isForPg || item.isForRent) return item.rentAmount;
  if (item.isForSale && item.sellPrice != null) return item.sellPrice;
  return item.rentAmount;
}

function matchesListingType(item: PropertyResponse, type: ListingTypeFilter): boolean {
  if (type === 'all') return true;
  if (type === 'rent') return item.isForRent && !item.isForPg;
  if (type === 'sale') return item.isForSale;
  return item.isForPg;
}

function matchesBhk(item: PropertyResponse, bhk: string[]): boolean {
  if (bhk.length === 0) return true;
  const config = item.bhkConfiguration?.trim() ?? '';
  return bhk.some((b) => config.toLowerCase() === b.toLowerCase());
}

function matchesRentPreset(
  item: PropertyResponse,
  preset: RentPresetKey,
  listingType: ListingTypeFilter
): boolean {
  if (preset === 'any') return true;
  if (listingType === 'sale') return true;

  const p = RENT_PRESETS.find((r) => r.key === preset);
  if (!p) return true;

  const amount =
    item.isForSale && item.sellPrice != null ? item.sellPrice : item.rentAmount;

  if (p.min != null && amount < p.min) return false;
  if (p.max != null && amount > p.max) return false;
  return true;
}

function matchesText(item: PropertyResponse, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    item.title.toLowerCase().includes(q) ||
    item.areaName.toLowerCase().includes(q) ||
    (item.address?.toLowerCase().includes(q) ?? false) ||
    (item.bhkConfiguration?.toLowerCase().includes(q) ?? false)
  );
}

export function countActiveFilters(filters: PropertySearchFilters): number {
  let n = 0;
  if (filters.listingType !== 'all') n += 1;
  if (filters.bhk.length > 0) n += 1;
  if (filters.rentPreset !== 'any') n += 1;
  if (filters.featuredOnly) n += 1;
  if (filters.sort !== 'newest') n += 1;
  return n;
}

export function applyPropertySearch(
  items: PropertyResponse[],
  filters: PropertySearchFilters,
  searchText: string
): PropertyResponse[] {
  let list = items.filter(
    (item) =>
      matchesListingType(item, filters.listingType) &&
      matchesBhk(item, filters.bhk) &&
      matchesRentPreset(item, filters.rentPreset, filters.listingType) &&
      matchesText(item, searchText) &&
      (!filters.featuredOnly || item.isFeaturedInSearch)
  );

  list = [...list].sort((a, b) => {
    if (filters.sort === 'newest') {
      return (
        new Date(b.createdAtUtc).getTime() - new Date(a.createdAtUtc).getTime()
      );
    }
    const pa = monthlyPrice(a);
    const pb = monthlyPrice(b);
    return filters.sort === 'price_asc' ? pa - pb : pb - pa;
  });

  return list;
}

export function sortLabel(sort: SortOption): string {
  switch (sort) {
    case 'price_asc':
      return 'Price ↑';
    case 'price_desc':
      return 'Price ↓';
    default:
      return 'Newest';
  }
}

export function nextSortOption(current: SortOption): SortOption {
  if (current === 'newest') return 'price_asc';
  if (current === 'price_asc') return 'price_desc';
  return 'newest';
}
