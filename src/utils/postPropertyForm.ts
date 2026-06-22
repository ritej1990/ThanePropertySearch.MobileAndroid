import { hasGoogleMapsKey, THANE_MAP_CENTER } from '../config/env';
import { isWithinThaneBounds } from './mapHelpers';
import type { CreatePropertyRequest } from '../api/createPropertyTypes';
import type { AgentListingDetails, CreateAgentListingRequest } from '../api/agentTypes';
import type { SelectedPlace } from '../services/googlePlaces';
import type { PropertyAiListingDraftResponse } from '../api/aiTypes';

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
  metaTenantPreference: string;
  metaPossessionStatus: string;
  metaReraStatus: string;
  metaCarpetSqft: string;
  metaConfiguration: string;
  metaFloorInfo: string;
  metaFacing: string;
  metaOverlooking: string;
  metaPropertyAge: string;
  metaTransactionType: string;
  metaOwnership: string;
  metaFurnishingStatus: string;
  metaHighlights: string;
  metaFurnishingIncluded: string;
  metaFurnishingExcluded: string;
  metaFeatures: string;
  societyName: string;
  metaFlooring: string;
  metaParking: string;
  metaPowerBackup: string;
  metaWaterSource: string;
  placesNearbyLines: string;
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
  metaTenantPreference: '',
  metaPossessionStatus: '',
  metaReraStatus: '',
  metaCarpetSqft: '',
  metaConfiguration: '',
  metaFloorInfo: '',
  metaFacing: '',
  metaOverlooking: '',
  metaPropertyAge: '',
  metaTransactionType: '',
  metaOwnership: '',
  metaFurnishingStatus: '',
  metaHighlights: '',
  metaFurnishingIncluded: '',
  metaFurnishingExcluded: '',
  metaFeatures: '',
  societyName: '',
  metaFlooring: '',
  metaParking: '',
  metaPowerBackup: '',
  metaWaterSource: '',
  placesNearbyLines: '',
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
  { key: 'details', title: 'Extended details', icon: 'list-outline' as const },
  { key: 'location', title: 'Location', icon: 'location-outline' as const },
  { key: 'photos', title: 'Photos', icon: 'images-outline' as const },
] as const;

export type PostPropertyStepIndex = 0 | 1 | 2 | 3 | 4;

export function listingCategoryToFlags(category: string): Pick<
  PostPropertyFormState,
  'isForRent' | 'isForSale' | 'isForPg'
> {
  const c = category.trim().toLowerCase();
  if (c === 'pg') {
    return { isForRent: true, isForSale: false, isForPg: true };
  }
  if (c === 'sale') {
    return { isForRent: false, isForSale: true, isForPg: false };
  }
  return { isForRent: true, isForSale: false, isForPg: false };
}

/** Reads back the richMetadataJson produced by buildRichMetadataJson() into form fields (edit mode). */
function extendedFieldsFromRichMetadataJson(json: string | null | undefined): Partial<PostPropertyFormState> {
  if (!json?.trim()) return {};
  try {
    const meta = JSON.parse(json) as RichMetadataPayload;
    return {
      metaTenantPreference: meta.tenantPreference ?? '',
      metaPossessionStatus: meta.possessionStatus ?? '',
      metaReraStatus: meta.reraStatus ?? '',
      metaCarpetSqft: meta.carpetSqft != null ? String(meta.carpetSqft) : '',
      metaConfiguration: meta.configuration ?? '',
      metaFloorInfo: meta.floorInfo ?? '',
      metaFacing: meta.facing ?? '',
      metaOverlooking: meta.overlooking ?? '',
      metaPropertyAge: meta.propertyAge ?? '',
      metaTransactionType: meta.transactionType ?? '',
      metaOwnership: meta.ownership ?? '',
      metaFurnishingStatus: meta.furnishingStatus ?? '',
      metaHighlights: meta.highlights?.join(', ') ?? '',
      metaFurnishingIncluded: meta.furnishingIncluded?.join(', ') ?? '',
      metaFurnishingExcluded: meta.furnishingExcluded?.join(', ') ?? '',
      metaFeatures: meta.features?.join(', ') ?? '',
      societyName: meta.society?.name ?? '',
      metaFlooring: meta.flooring ?? '',
      metaParking: meta.parking ?? '',
      metaPowerBackup: meta.powerBackup ?? '',
      metaWaterSource: meta.waterSource ?? '',
      placesNearbyLines:
        meta.placesNearby?.map((p) => (p.iconHint ? `${p.label}|${p.iconHint}` : p.label)).join('\n') ?? '',
    };
  } catch {
    return {};
  }
}

export function agentListingFormFromDetail(
  listing: AgentListingDetails
): PostPropertyFormState {
  const flags = listingCategoryToFlags(listing.listingCategory);
  const availableFrom =
    listing.availableFrom && listing.availableFrom.length >= 10
      ? listing.availableFrom.slice(0, 10)
      : '';

  return {
    ...initialPostPropertyForm(),
    title: listing.title ?? '',
    description: listing.description ?? '',
    areaName: listing.areaName ?? '',
    pincode: '',
    address: listing.address ?? '',
    bhkConfiguration: listing.bhkConfiguration ?? '',
    rentAmount: String(listing.rentAmount ?? ''),
    sellPrice: listing.sellPrice != null ? String(listing.sellPrice) : '',
    depositAmount: String(listing.depositAmount ?? ''),
    builtupSqft: String(listing.builtupSqft ?? ''),
    ...flags,
    availableFrom,
    locationQuery: listing.areaName || listing.address,
    selectedPlace: {
      placeId: `listing-${listing.id}`,
      label: listing.areaName || listing.address,
      address: listing.address,
      areaName: listing.areaName,
      pincode: '',
      latitude: listing.latitude,
      longitude: listing.longitude,
    },
    ...extendedFieldsFromRichMetadataJson(listing.richMetadataJson),
  };
}

/** Merges an AI-generated draft (from /api/ai/property/listing-draft) into the form state. */
export function applyAiListingDraft(
  form: PostPropertyFormState,
  draft: PropertyAiListingDraftResponse
): PostPropertyFormState {
  const label = `${draft.address}, ${draft.areaName}`;
  const selectedPlace: SelectedPlace = {
    placeId: 'ai-draft',
    label,
    address: draft.address,
    areaName: draft.areaName,
    pincode: draft.pincode,
    latitude: draft.latitude,
    longitude: draft.longitude,
  };

  return {
    ...form,
    // Description, rent, and deposit are sensitive/user-owned figures — the AI draft only
    // suggests them (shown in the preview); they're never auto-written into the form.
    title: draft.title,
    areaName: draft.areaName,
    pincode: draft.pincode,
    address: draft.address,
    bhkConfiguration: draft.bhkConfiguration,
    builtupSqft: draft.builtupSqft ? String(draft.builtupSqft) : form.builtupSqft,
    isForRent: draft.isForRent,
    isForSale: draft.isForSale,
    isForPg: draft.isForPg,
    locationQuery: label,
    selectedPlace,
    metaTenantPreference: draft.metaTenantPreference ?? form.metaTenantPreference,
    metaPossessionStatus: draft.metaPossessionStatus ?? form.metaPossessionStatus,
    metaReraStatus: draft.metaReraStatus ?? form.metaReraStatus,
    metaCarpetSqft: draft.metaCarpetSqft != null ? String(draft.metaCarpetSqft) : form.metaCarpetSqft,
    metaConfiguration: draft.metaConfiguration ?? form.metaConfiguration,
    metaFloorInfo: draft.metaFloorInfo ?? form.metaFloorInfo,
    metaFacing: draft.metaFacing ?? form.metaFacing,
    metaOverlooking: draft.metaOverlooking ?? form.metaOverlooking,
    metaPropertyAge: draft.metaPropertyAge ?? form.metaPropertyAge,
    metaTransactionType: draft.metaTransactionType ?? form.metaTransactionType,
    metaOwnership: draft.metaOwnership ?? form.metaOwnership,
    metaFurnishingStatus: draft.metaFurnishingStatus ?? form.metaFurnishingStatus,
    metaHighlights: draft.metaHighlights ?? form.metaHighlights,
    metaFurnishingIncluded: draft.metaFurnishingIncluded ?? form.metaFurnishingIncluded,
    metaFurnishingExcluded: draft.metaFurnishingExcluded ?? form.metaFurnishingExcluded,
    metaFeatures: draft.metaFeatures ?? form.metaFeatures,
    societyName: draft.societyName ?? form.societyName,
    metaFlooring: draft.metaFlooring ?? form.metaFlooring,
    metaParking: draft.metaParking ?? form.metaParking,
    metaPowerBackup: draft.metaPowerBackup ?? form.metaPowerBackup,
    metaWaterSource: draft.metaWaterSource ?? form.metaWaterSource,
    placesNearbyLines: draft.placesNearbyLines ?? form.placesNearbyLines,
  };
}

type RichMetadataPlaceNearby = { label: string; iconHint?: string };

type RichMetadataPayload = {
  tenantPreference?: string;
  possessionStatus?: string;
  reraStatus?: string;
  carpetSqft?: number;
  configuration?: string;
  floorInfo?: string;
  facing?: string;
  overlooking?: string;
  propertyAge?: string;
  transactionType?: string;
  ownership?: string;
  furnishingStatus?: string;
  highlights?: string[];
  furnishingIncluded?: string[];
  furnishingExcluded?: string[];
  features?: string[];
  flooring?: string;
  parking?: string;
  waterSource?: string;
  powerBackup?: string;
  placesNearby?: RichMetadataPlaceNearby[];
  society?: { name?: string };
  pricePerSqftNote?: string;
};

function splitCommaList(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function parsePlacesNearbyLines(lines: string): RichMetadataPlaceNearby[] {
  return lines
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line): RichMetadataPlaceNearby[] => {
      const [label, iconHint] = line.split('|').map((p) => p.trim());
      return label ? [{ label, iconHint: iconHint || undefined }] : [];
    });
}

/** Serializes the form's extended-details fields into the richMetadataJson carried on create requests
 *  — same shape ThanePropertySearch.Web.Infrastructure.PropertyRichMetadataBuilder produces. */
export function buildRichMetadataJson(form: PostPropertyFormState): string | null {
  const highlights = splitCommaList(form.metaHighlights);
  const furnishingIncluded = splitCommaList(form.metaFurnishingIncluded);
  const furnishingExcluded = splitCommaList(form.metaFurnishingExcluded);
  const features = splitCommaList(form.metaFeatures);
  const placesNearby = parsePlacesNearbyLines(form.placesNearbyLines);
  const carpetSqft = parseDecimal(form.metaCarpetSqft);

  const meta: RichMetadataPayload = {
    tenantPreference: form.metaTenantPreference.trim() || undefined,
    possessionStatus: form.metaPossessionStatus.trim() || undefined,
    reraStatus: form.metaReraStatus.trim() || undefined,
    carpetSqft: carpetSqft != null ? carpetSqft : undefined,
    configuration: form.metaConfiguration.trim() || undefined,
    floorInfo: form.metaFloorInfo.trim() || undefined,
    facing: form.metaFacing.trim() || undefined,
    overlooking: form.metaOverlooking.trim() || undefined,
    propertyAge: form.metaPropertyAge.trim() || undefined,
    transactionType: form.metaTransactionType.trim() || undefined,
    ownership: form.metaOwnership.trim() || undefined,
    furnishingStatus: form.metaFurnishingStatus.trim() || undefined,
    highlights: highlights.length > 0 ? highlights : undefined,
    furnishingIncluded: furnishingIncluded.length > 0 ? furnishingIncluded : undefined,
    furnishingExcluded: furnishingExcluded.length > 0 ? furnishingExcluded : undefined,
    features: features.length > 0 ? features : undefined,
    flooring: form.metaFlooring.trim() || undefined,
    parking: form.metaParking.trim() || undefined,
    waterSource: form.metaWaterSource.trim() || undefined,
    powerBackup: form.metaPowerBackup.trim() || undefined,
    placesNearby: placesNearby.length > 0 ? placesNearby : undefined,
    society: form.societyName.trim() ? { name: form.societyName.trim() } : undefined,
  };

  const sellPrice = parseDecimal(form.sellPrice);
  const sqft = parseDecimal(form.builtupSqft);
  if (form.isForSale && sellPrice != null && sqft != null && sqft > 0) {
    const perSqft = sellPrice / sqft;
    meta.pricePerSqftNote = `₹ ${Math.round(perSqft).toLocaleString('en-IN')} per sq.ft. (built-up, indicative)`;
  }

  const hasAny = Object.values(meta).some((v) => v !== undefined);
  return hasAny ? JSON.stringify(meta) : null;
}

export function validatePostPropertyStep(
  step: PostPropertyStepIndex,
  form: PostPropertyFormState,
  options?: { editMode?: boolean }
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
    return null;
  }

  if (step === 3) {
    if (hasGoogleMapsKey() && !form.selectedPlace) {
      return 'Search and pick your property on Google Maps (Thane only).';
    }
    if (
      form.selectedPlace &&
      !isWithinThaneBounds(
        form.selectedPlace.latitude,
        form.selectedPlace.longitude
      )
    ) {
      return 'Property location must be within Thane district.';
    }
    if (!form.address.trim()) return 'Address is required.';
    if (!form.areaName.trim()) return 'Enter the area name (e.g. Thane West).';
    if (
      !options?.editMode &&
      !/^\d{6}$/.test(form.pincode.trim())
    ) {
      return 'Enter a valid 6-digit pincode.';
    }
    if (
      options?.editMode &&
      form.pincode.trim() &&
      !/^\d{6}$/.test(form.pincode.trim())
    ) {
      return 'Enter a valid 6-digit pincode.';
    }
    return null;
  }

  return null;
}

export function validatePostPropertyForm(
  form: PostPropertyFormState,
  options?: { editMode?: boolean }
): string | null {
  for (let i = 0; i < 4; i++) {
    const err = validatePostPropertyStep(
      i as PostPropertyStepIndex,
      form,
      options
    );
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

export function deriveListingCategory(form: PostPropertyFormState): string {
  if (form.isForPg) return 'PG';
  if (form.isForSale && !form.isForRent) return 'Sale';
  return 'Rent';
}

/** Maps agent publish tier codes (A30, A60, A90) to duration days. */
export function listingDurationFromTier(tierCode: string | null | undefined): number {
  const code = (tierCode ?? '').toUpperCase();
  if (code.includes('90')) return 90;
  if (code.includes('60')) return 60;
  return 30;
}

export function buildCreateAgentListingRequest(
  form: PostPropertyFormState,
  imageUrls: string[],
  listingDurationDays = 30,
  overrides?: Partial<Pick<CreateAgentListingRequest, 'isPublished' | 'isNegotiable'>>
): CreateAgentListingRequest {
  const rent = parseDecimal(form.rentAmount)!;
  const deposit = parseDecimal(form.depositAmount)!;
  const sqft = parseDecimal(form.builtupSqft)!;
  const sellRaw = parseDecimal(form.sellPrice);
  const sellPrice = form.isForSale && sellRaw != null ? sellRaw : null;

  const lat = form.selectedPlace?.latitude ?? THANE_MAP_CENTER.latitude;
  const lng = form.selectedPlace?.longitude ?? THANE_MAP_CENTER.longitude;

  const deduped = [...new Set(imageUrls.filter(Boolean))];
  const cover = deduped[0] ?? null;
  const gallery = cover ? deduped.filter((u) => u !== cover) : deduped;

  const availableFrom =
    (form.isForRent || form.isForPg) && form.availableFrom.trim()
      ? form.availableFrom.trim()
      : null;

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    listingCategory: deriveListingCategory(form),
    rentAmount: rent,
    sellPrice,
    depositAmount: deposit,
    builtupSqft: sqft,
    bhkConfiguration: form.bhkConfiguration,
    address: form.address.trim(),
    areaName: form.areaName.trim(),
    pincode: form.pincode.trim() || null,
    latitude: lat,
    longitude: lng,
    coverImageUrl: cover,
    imageUrls: gallery.length > 0 ? gallery : null,
    isPublished: overrides?.isPublished ?? true,
    listingDurationDays,
    isNegotiable: overrides?.isNegotiable ?? false,
    availableFrom,
    richMetadataJson: buildRichMetadataJson(form),
  };
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
    pincode: form.pincode.trim() || null,
    latitude: lat,
    longitude: lng,
    isForRent: form.isForRent,
    isForSale: form.isForSale,
    isForPg: form.isForPg,
    imageUrls: deduped.length > 0 ? deduped : null,
    availableFrom,
    richMetadataJson: buildRichMetadataJson(form),
  };
}
