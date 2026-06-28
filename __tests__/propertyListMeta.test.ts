import { buildCompactListCardMeta, buildListCardBodyMeta } from '../src/utils/propertyListMeta';
import type { PropertyResponse } from '../src/api/types';

function property(over: Partial<PropertyResponse>): PropertyResponse {
  return {
    id: 1,
    title: '2 BHK in Hiranandani',
    description: '',
    rentAmount: 25000,
    sellPrice: null,
    depositAmount: 100000,
    builtupSqft: 1050,
    bhkConfiguration: '2 BHK',
    imageUrl: '',
    address: '',
    areaName: 'Thane West',
    latitude: 0,
    longitude: 0,
    isForRent: true,
    isForSale: false,
    isForPg: false,
    reviewStatus: 'Approved',
    ownerName: 'Owner',
    averageRating: 4.2,
    ratingCount: 8,
    imageUrls: [],
    createdAtUtc: '2026-01-01T00:00:00Z',
    richMetadataJson: JSON.stringify({ furnished: true, possessionStatus: 'Ready' }),
    availableFrom: null,
    isFeaturedInSearch: false,
    listingPeriodEndUtc: null,
    ownerId: null,
    ...over,
  };
}

describe('buildCompactListCardMeta', () => {
  it('prioritizes bhk, sqft, deposit for rent listings', () => {
    const facts = buildCompactListCardMeta(property({}));
    expect(facts.map((f) => f.key)).toEqual(
      expect.arrayContaining(['bhk', 'sqft', 'deposit', 'furnished', 'possession'])
    );
    expect(facts.length).toBeLessThanOrEqual(5);
  });

  it('includes sale price when rent is not offered', () => {
    const facts = buildCompactListCardMeta(
      property({
        isForRent: false,
        isForPg: false,
        isForSale: true,
        sellPrice: 9500000,
        depositAmount: 0,
      })
    );
    expect(facts.some((f) => f.key === 'sale')).toBe(true);
    expect(facts.some((f) => f.key === 'deposit')).toBe(false);
  });
});

describe('buildListCardBodyMeta', () => {
  it('balances facts across left and right columns', () => {
    const body = buildListCardBodyMeta(property({}));
    expect(body.leftFacts.length).toBeGreaterThan(0);
    expect(body.rightFacts.length).toBeGreaterThan(0);
  });

  it('distributes description and amenity tags across both columns', () => {
    const body = buildListCardBodyMeta(
      property({
        description: 'Spacious flat with garden view and covered parking.',
        richMetadataJson: JSON.stringify({
          furnished: true,
          possessionStatus: 'Ready',
          amenities: ['Parking', 'Lift', 'Gym'],
        }),
      })
    );
    const allNotes = [...body.leftNotes, ...body.rightNotes].join(' ');
    const allTags = [...body.leftTags, ...body.rightTags];
    expect(allNotes).toMatch(/Spacious flat/);
    expect(allTags).toEqual(expect.arrayContaining(['Parking']));
    expect(body.leftTags.length + body.rightTags.length).toBeGreaterThan(0);
  });
});
