import {
  initialPostPropertyForm,
  listingCategoryToFlags,
  deriveListingCategory,
  listingDurationFromTier,
  listingTypeSummary,
  validatePostPropertyStep,
  validatePostPropertyForm,
  type PostPropertyFormState,
} from '../src/utils/postPropertyForm';

function validForm(over: Partial<PostPropertyFormState> = {}): PostPropertyFormState {
  return {
    ...initialPostPropertyForm(),
    title: 'Spacious 2 BHK near station',
    bhkConfiguration: '2 BHK',
    description: 'Bright, well ventilated flat.',
    isForRent: true,
    rentAmount: '25000',
    depositAmount: '100000',
    builtupSqft: '850',
    address: 'A-101, Green Residency',
    areaName: 'Thane West',
    pincode: '400601',
    ...over,
  };
}

describe('listing category <-> flags', () => {
  it('maps category strings to flags', () => {
    expect(listingCategoryToFlags('pg')).toEqual({ isForRent: true, isForSale: false, isForPg: true });
    expect(listingCategoryToFlags('Sale')).toEqual({ isForRent: false, isForSale: true, isForPg: false });
    expect(listingCategoryToFlags('rent')).toEqual({ isForRent: true, isForSale: false, isForPg: false });
  });

  it('derives a category label from flags', () => {
    expect(deriveListingCategory(validForm({ isForPg: true }))).toBe('PG');
    expect(deriveListingCategory(validForm({ isForRent: false, isForSale: true }))).toBe('Sale');
    expect(deriveListingCategory(validForm())).toBe('Rent');
  });

  it('summarizes listing types', () => {
    expect(listingTypeSummary(validForm({ isForRent: true, isForSale: true }))).toBe('Rent · Sale');
    expect(listingTypeSummary(validForm({ isForRent: false, isForSale: false, isForPg: false }))).toBe('—');
  });
});

describe('listing duration from tier', () => {
  it('maps tier codes to days', () => {
    expect(listingDurationFromTier('A90')).toBe(90);
    expect(listingDurationFromTier('A60')).toBe(60);
    expect(listingDurationFromTier('A30')).toBe(30);
    expect(listingDurationFromTier(null)).toBe(30);
  });
});

describe('post-property step validation (the form action gates)', () => {
  it('step 0 requires title, BHK, description', () => {
    expect(validatePostPropertyStep(0, validForm({ title: '' }))).toMatch(/title/i);
    expect(validatePostPropertyStep(0, validForm({ bhkConfiguration: '' }))).toMatch(/BHK/i);
    expect(validatePostPropertyStep(0, validForm({ description: '' }))).toMatch(/description/i);
    expect(validatePostPropertyStep(0, validForm())).toBeNull();
  });

  it('step 1 requires a listing type and valid money/area', () => {
    expect(
      validatePostPropertyStep(1, validForm({ isForRent: false, isForSale: false, isForPg: false }))
    ).toMatch(/listing type/i);
    expect(validatePostPropertyStep(1, validForm({ rentAmount: 'abc' }))).toMatch(/monthly rent/i);
    expect(validatePostPropertyStep(1, validForm({ builtupSqft: '0' }))).toMatch(/built-up/i);
    expect(validatePostPropertyStep(1, validForm())).toBeNull();
  });

  it('step 1 requires a sale price for sale listings', () => {
    expect(
      validatePostPropertyStep(1, validForm({ isForSale: true, sellPrice: '' }))
    ).toMatch(/sale price/i);
    expect(
      validatePostPropertyStep(1, validForm({ isForSale: true, sellPrice: '7500000' }))
    ).toBeNull();
  });

  it('step 1 enforces YYYY-MM-DD available-from when provided', () => {
    expect(validatePostPropertyStep(1, validForm({ availableFrom: '01/02/2026' }))).toMatch(/YYYY-MM-DD/);
    expect(validatePostPropertyStep(1, validForm({ availableFrom: '2026-02-01' }))).toBeNull();
  });

  it('step 3 requires address, area and a 6-digit pincode (create mode)', () => {
    expect(validatePostPropertyStep(3, validForm({ address: '' }))).toMatch(/address/i);
    expect(validatePostPropertyStep(3, validForm({ areaName: '' }))).toMatch(/area/i);
    expect(validatePostPropertyStep(3, validForm({ pincode: '12' }))).toMatch(/pincode/i);
    expect(validatePostPropertyStep(3, validForm())).toBeNull();
  });

  it('a fully valid form passes end-to-end validation', () => {
    expect(validatePostPropertyForm(validForm())).toBeNull();
  });
});
