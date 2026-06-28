import {
  defaultSearchFilters,
  countActiveFilters,
  applyPropertySearch,
  nextSortOption,
  sortLabel,
  type PropertySearchFilters,
} from '../src/utils/propertySearchFilters';
import type { PropertyResponse } from '../src/api/types';

function prop(over: Partial<PropertyResponse>): PropertyResponse {
  return {
    id: 1,
    title: 'Flat',
    areaName: 'Thane West',
    address: 'Somewhere',
    bhkConfiguration: '2 BHK',
    isForRent: true,
    isForSale: false,
    isForPg: false,
    rentAmount: 20000,
    sellPrice: null,
    isFeaturedInSearch: false,
    createdAtUtc: '2026-06-01T00:00:00Z',
    ...over,
  } as unknown as PropertyResponse;
}

function filters(over: Partial<PropertySearchFilters> = {}): PropertySearchFilters {
  return { ...defaultSearchFilters(), ...over };
}

describe('Active filter count (filter chip badge)', () => {
  it('is 0 for defaults', () => {
    expect(countActiveFilters(defaultSearchFilters())).toBe(0);
  });
  it('counts each non-default dimension', () => {
    expect(
      countActiveFilters(
        filters({ listingType: 'rent', bhk: ['2 BHK'], rentPreset: 'under15', featuredOnly: true, sort: 'price_asc' })
      )
    ).toBe(5);
  });
});

describe('applyPropertySearch — filtering', () => {
  const items = [
    prop({ id: 1, isForRent: true, rentAmount: 12000, bhkConfiguration: '1 BHK', title: 'Cozy 1 BHK' }),
    prop({ id: 2, isForSale: true, isForRent: false, sellPrice: 8000000, bhkConfiguration: '2 BHK' }),
    prop({ id: 3, isForPg: true, isForRent: true, rentAmount: 9000, bhkConfiguration: '1 RK' }),
    prop({ id: 4, isForRent: true, rentAmount: 30000, bhkConfiguration: '3 BHK', isFeaturedInSearch: true }),
  ];

  it('filters by listing type (rent excludes PG)', () => {
    const out = applyPropertySearch(items, filters({ listingType: 'rent' }), '');
    expect(out.map((i) => i.id).sort()).toEqual([1, 4]);
  });

  it('filters by BHK', () => {
    const out = applyPropertySearch(items, filters({ bhk: ['1 BHK'] }), '');
    expect(out.map((i) => i.id)).toEqual([1]);
  });

  it('filters by rent preset (under ₹15k)', () => {
    const out = applyPropertySearch(items, filters({ listingType: 'rent', rentPreset: 'under15' }), '');
    expect(out.map((i) => i.id)).toEqual([1]);
  });

  it('filters by free-text query', () => {
    expect(applyPropertySearch(items, filters(), 'cozy').map((i) => i.id)).toEqual([1]);
  });

  it('filters featured only', () => {
    expect(applyPropertySearch(items, filters({ featuredOnly: true }), '').map((i) => i.id)).toEqual([4]);
  });
});

describe('applyPropertySearch — sorting (incl. AI match)', () => {
  const a = prop({ id: 1, rentAmount: 30000, createdAtUtc: '2026-06-01T00:00:00Z' });
  const b = prop({ id: 2, rentAmount: 10000, createdAtUtc: '2026-06-10T00:00:00Z' });
  const items = [a, b];

  it('newest first', () => {
    expect(applyPropertySearch(items, filters({ sort: 'newest' }), '').map((i) => i.id)).toEqual([2, 1]);
  });
  it('price ascending', () => {
    expect(applyPropertySearch(items, filters({ sort: 'price_asc' }), '').map((i) => i.id)).toEqual([2, 1]);
  });
  it('price descending', () => {
    expect(applyPropertySearch(items, filters({ sort: 'price_desc' }), '').map((i) => i.id)).toEqual([1, 2]);
  });
  it('AI match ranks by provided scores (highest first)', () => {
    const scores = new Map<number, number>([
      [1, 0.95],
      [2, 0.2],
    ]);
    const out = applyPropertySearch(items, filters({ sort: 'ai_match' }), '', scores);
    expect(out.map((i) => i.id)).toEqual([1, 2]);
  });
  it('AI match falls back to newest when scores tie/absent', () => {
    const out = applyPropertySearch(items, filters({ sort: 'ai_match' }), '');
    expect(out.map((i) => i.id)).toEqual([2, 1]);
  });
});

describe('favorites pinned to top', () => {
  const items = [
    prop({ id: 1, rentAmount: 30000, createdAtUtc: '2026-06-01T00:00:00Z' }),
    prop({ id: 2, rentAmount: 10000, createdAtUtc: '2026-06-10T00:00:00Z' }),
    prop({ id: 3, rentAmount: 20000, createdAtUtc: '2026-06-05T00:00:00Z' }),
  ];

  it('moves favorited listings first, keeping sort within groups', () => {
    const out = applyPropertySearch(items, filters({ sort: 'newest' }), '', undefined, new Set([1]));
    expect(out.map((i) => i.id)).toEqual([1, 2, 3]); // 1 pinned, then newest-first (2,3)
  });

  it('keeps multiple favorites grouped on top by the chosen sort', () => {
    const out = applyPropertySearch(items, filters({ sort: 'price_asc' }), '', undefined, new Set([1, 3]));
    // favorites first by price asc (3=20k,1=30k), then rest (2)
    expect(out.map((i) => i.id)).toEqual([3, 1, 2]);
  });

  it('no favorites set → unchanged order', () => {
    const out = applyPropertySearch(items, filters({ sort: 'newest' }), '');
    expect(out.map((i) => i.id)).toEqual([2, 3, 1]);
  });
});

describe('sort option cycling (sort toggle button)', () => {
  it('cycles newest → ai_match → price_asc → price_desc → newest', () => {
    expect(nextSortOption('newest')).toBe('ai_match');
    expect(nextSortOption('ai_match')).toBe('price_asc');
    expect(nextSortOption('price_asc')).toBe('price_desc');
    expect(nextSortOption('price_desc')).toBe('newest');
  });
  it('labels are human-friendly', () => {
    expect(sortLabel('ai_match')).toBe('AI match');
    expect(sortLabel('newest')).toBe('Newest');
  });
});
