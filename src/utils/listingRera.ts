import type { PropertyResponse } from '../api/types';
import { parseRichMetadata } from './propertyFormat';

export const NEW_LISTING_DAYS = 5;
const NEW_LISTING_MS = NEW_LISTING_DAYS * 24 * 60 * 60 * 1000;

export function isNewListing(createdAtUtc: string | null | undefined): boolean {
  if (!createdAtUtc) return false;
  return Date.now() - new Date(createdAtUtc).getTime() <= NEW_LISTING_MS;
}

/** Resolves MahaRERA id from listing field or rich metadata note. */
export function resolveListingRera(item: {
  reraNumber?: string | null;
  richMetadataJson?: string | null;
}): string | null {
  const direct = item.reraNumber?.trim();
  if (direct && direct.toUpperCase() !== 'PENDING') return direct;

  const rich = parseRichMetadata(item.richMetadataJson);
  const note = rich.reraStatus?.trim();
  if (note) return note;

  return null;
}

/** Show RERA on resale / new / agent / builder sale listings. */
export function shouldShowListingRera(item: PropertyResponse): boolean {
  const rera = resolveListingRera(item);
  if (!rera) return false;
  return Boolean(
    item.isForSale ||
    item.isPostedByAgent ||
    isNewListing(item.createdAtUtc)
  );
}

export function shouldShowBuilderRera(reraNumber: string | null | undefined): boolean {
  const rera = reraNumber?.trim();
  return Boolean(rera && rera.toUpperCase() !== 'PENDING');
}
