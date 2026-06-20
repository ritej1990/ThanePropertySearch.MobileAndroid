import type { PropertyResponse } from '../api/types';
import { formatInr, formatListingDate, parseRichMetadata } from './propertyFormat';

export type PropertyListMetaItem = {
  key: string;
  label: string;
  value: string;
  icon:
    | 'bed-outline'
    | 'resize-outline'
    | 'cube-outline'
    | 'business-outline'
    | 'calendar-outline'
    | 'time-outline'
    | 'wallet-outline'
    | 'today-outline'
    | 'shield-checkmark-outline'
    | 'pricetag-outline'
    | 'key-outline'
    | 'person-outline';
};

export type PropertyListPriceMeta = {
  key: string;
  label: string;
  value: string;
};

export type PropertyListCardMeta = {
  specs: PropertyListMetaItem[];
  prices: PropertyListPriceMeta[];
  amenities: string[];
  amenityOverflow: number;
  highlights: string[];
};

const MAX_AMENITIES = 6;
const MAX_HIGHLIGHTS = 3;

/** Compact metadata for property list cards — mirrors details-page fields where possible. */
export function buildPropertyListCardMeta(item: PropertyResponse): PropertyListCardMeta {
  const rich = parseRichMetadata(item.richMetadataJson);
  const specs: PropertyListMetaItem[] = [];

  if (item.builtupSqft > 0) {
    specs.push({
      key: 'sqft',
      label: 'Built-up',
      value: `${item.builtupSqft.toLocaleString('en-IN')} sq.ft`,
      icon: 'resize-outline',
    });
  }

  if (rich.furnished !== undefined) {
    specs.push({
      key: 'furnished',
      label: 'Furnishing',
      value: rich.furnished ? 'Furnished' : 'Unfurnished',
      icon: 'cube-outline',
    });
  }

  const societyLabel = [rich.societyName, rich.societyBlock].filter(Boolean).join(' · ');
  if (societyLabel) {
    specs.push({
      key: 'society',
      label: 'Society',
      value: societyLabel,
      icon: 'business-outline',
    });
  }

  const possession =
    rich.possessionStatus?.trim() || rich.society?.possessionDetail?.trim() || null;
  if (possession) {
    specs.push({
      key: 'possession',
      label: 'Possession',
      value: possession,
      icon: 'calendar-outline',
    });
  }

  if (item.availableFrom) {
    specs.push({
      key: 'available',
      label: 'Available from',
      value: formatListingDate(item.availableFrom),
      icon: 'time-outline',
    });
  }

  if ((item.isForRent || item.isForPg) && item.depositAmount > 0) {
    specs.push({
      key: 'deposit',
      label: 'Deposit',
      value: formatInr(item.depositAmount),
      icon: 'wallet-outline',
    });
  }

  if (item.createdAtUtc) {
    specs.push({
      key: 'listed',
      label: 'Listed on',
      value: formatListingDate(item.createdAtUtc),
      icon: 'today-outline',
    });
  }

  if (rich.reraStatus?.trim()) {
    specs.push({
      key: 'rera-status',
      label: 'RERA status',
      value: rich.reraStatus.trim(),
      icon: 'shield-checkmark-outline',
    });
  }

  if (item.ownerName?.trim() && !item.isPostedByAgent) {
    specs.push({
      key: 'owner',
      label: 'Posted by',
      value: item.ownerName.trim(),
      icon: 'person-outline',
    });
  }

  const prices: PropertyListPriceMeta[] = [];
  const showRent = item.isForRent || item.isForPg;
  const showSale = item.isForSale && item.sellPrice != null;

  if (showRent && showSale) {
    prices.push({
      key: 'rent',
      label: item.isForPg ? 'PG rent' : 'Rent',
      value: `${formatInr(item.rentAmount)} / mo`,
    });
    prices.push({
      key: 'sale',
      label: 'Sale price',
      value: formatInr(item.sellPrice),
    });
  } else if (showSale && item.sellPrice != null) {
    prices.push({
      key: 'sale',
      label: 'Sale price',
      value: formatInr(item.sellPrice),
    });
  }

  const amenities = rich.amenities ?? [];
  const highlights = (rich.highlights ?? [])
    .map((h) => h.trim())
    .filter(Boolean)
    .slice(0, MAX_HIGHLIGHTS);

  return {
    specs,
    prices,
    amenities: amenities.slice(0, MAX_AMENITIES),
    amenityOverflow: Math.max(0, amenities.length - MAX_AMENITIES),
    highlights,
  };
}
