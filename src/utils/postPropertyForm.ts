import { hasGoogleMapsKey, THANE_MAP_CENTER } from '../config/env';
import type { CreatePropertyRequest } from '../api/createPropertyTypes';
import type { SelectedPlace } from '../services/googlePlaces';

export const BHK_OPTIONS = ['1 RK', '1 BHK', '2 BHK', '3 BHK'] as const;

export type PostPropertyFormState = {
  title: string;
  description: string;
  areaName: string;
  pincode: string;
  address: string;
  bhkConfiguration: string;
  rentAmount: string;
  sellPrice: string;
  depositAmount: string;
  builtupSqft: string;
  isForRent: boolean;
  isForSale: boolean;
  isForPg: boolean;
  availableFrom: string;
  locationQuery: string;
  selectedPlace: SelectedPlace | null;
};

export const initialPostPropertyForm = (): PostPropertyFormState => ({
  title: '',
  description: '',
  areaName: '',
  pincode: '',
  address: '',
  bhkConfiguration: '',
  rentAmount: '',
  sellPrice: '',
  depositAmount: '',
  builtupSqft: '',
  isForRent: true,
  isForSale: false,
  isForPg: false,
  availableFrom: '',
  locationQuery: '',
  selectedPlace: null,
});

function parseDecimal(value: string): number | null {
  const trimmed = value.trim().replace(/,/g, '');
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export const POST_PROPERTY_STEPS = [
  { key: 'basics', title: 'Basics', icon: 'home-outline' as const },
  { key: 'pricing', title: 'Pricing', icon: 'wallet-outline' as const },
  { key: 'location', title: 'Location', icon: 'location-outline' as const },
  { key: 'photos', title: 'Photos', icon: 'images-outline' as const },
] as const;

export type PostPropertyStepIndex = 0 | 1 | 2 | 3;

export function validatePostPropertyStep(
  step: PostPropertyStepIndex,
  form: PostPropertyFormState
): string | null {
  if (step === 0) {
    if (!form.title.trim()) return 'Enter a catchy listing title.';
    if (!form.bhkConfiguration) return 'Select your flat configuration (BHK).';
    if (!form.description.trim()) return 'Add a short description for renters.';
    return null;
  }

  if (step === 1) {
    if (!form.isForRent && !form.isForSale && !form.isForPg) {
      return 'Choose at least one listing type: rent, sale, or PG.';
    }
    const rent = parseDecimal(form.rentAmount);
    const deposit = parseDecimal(form.depositAmount);
    const sqft = parseDecimal(form.builtupSqft);
    if (rent == null || rent < 0) return 'Enter a valid monthly rent (INR).';
    if (deposit == null || deposit < 0) return 'Enter a valid security deposit (INR).';
    if (sqft == null || sqft <= 0) return 'Enter built-up area in sq.ft.';
    if (form.isForSale) {
      const sale = parseDecimal(form.sellPrice);
      if (sale == null || sale <= 0) return 'Enter a sale price for sale listings.';
    }
    if ((form.isForRent || form.isForPg) && form.availableFrom.trim()) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(form.availableFrom.trim())) {
        return 'Available-from date must be YYYY-MM-DD.';
      }
    }
    return null;
  }

  if (step === 2) {
    if (hasGoogleMapsKey() && !form.selectedPlace) {
      return 'Search and pick your property on Google Maps.';
    }
    if (!form.address.trim()) return 'Address is required.';
    if (!form.areaName.trim()) return 'Enter the area name (e.g. Thane West).';
    if (!/^\d{6}$/.test(form.pincode.trim())) return 'Enter a valid 6-digit pincode.';
    return null;
  }

  return null;
}

export function validatePostPropertyForm(
  form: PostPropertyFormState
): string | null {
  for (let i = 0; i < 3; i++) {
    const err = validatePostPropertyStep(i as PostPropertyStepIndex, form);
    if (err) return err;
  }
  return null;
}

export function formatInr(amount: string): string {
  const n = parseDecimal(amount);
  if (n == null) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n);
}

export function listingTypeSummary(form: PostPropertyFormState): string {
  const parts: string[] = [];
  if (form.isForRent) parts.push('Rent');
  if (form.isForSale) parts.push('Sale');
  if (form.isForPg) parts.push('PG');
  return parts.join(' · ') || '—';
}

export function buildCreatePropertyRequest(
  form: PostPropertyFormState,
  imageUrls: string[]
): CreatePropertyRequest {
  const rent = parseDecimal(form.rentAmount)!;
  const deposit = parseDecimal(form.depositAmount)!;
  const sqft = parseDecimal(form.builtupSqft)!;
  const sellRaw = parseDecimal(form.sellPrice);
  const sellPrice = form.isForSale && sellRaw != null ? sellRaw : null;

  const lat = form.selectedPlace?.latitude ?? THANE_MAP_CENTER.latitude;
  const lng = form.selectedPlace?.longitude ?? THANE_MAP_CENTER.longitude;

  const deduped = [...new Set(imageUrls.filter(Boolean))];
  const primary = deduped[0] ?? null;

  const availableFrom =
    (form.isForRent || form.isForPg) && form.availableFrom.trim()
      ? form.availableFrom.trim()
      : null;

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    rentAmount: rent,
    sellPrice,
    depositAmount: deposit,
    builtupSqft: sqft,
    bhkConfiguration: form.bhkConfiguration,
    imageUrl: primary,
    address: form.address.trim(),
    areaName: form.areaName.trim(),
    latitude: lat,
    longitude: lng,
    isForRent: form.isForRent,
    isForSale: form.isForSale,
    isForPg: form.isForPg,
    imageUrls: deduped.length > 0 ? deduped : null,
    availableFrom,
  };
}
