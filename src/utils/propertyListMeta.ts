import type { PropertyResponse } from '../api/types';
import type { Ionicons } from '@expo/vector-icons';
import { formatInr, formatListingDate, parseRichMetadata } from './propertyFormat';

export type CompactCardIcon = keyof typeof Ionicons.glyphMap;

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

export type CompactCardFact = {
  key: string;
  icon: CompactCardIcon;
  value: string;
};

const MAX_COMPACT_FACTS = 5;
const MAX_BODY_FACTS = 8;

function collectListCardFacts(item: PropertyResponse): CompactCardFact[] {
  const rich = parseRichMetadata(item.richMetadataJson);
  const facts: CompactCardFact[] = [];

  if (item.bhkConfiguration?.trim()) {
    facts.push({
      key: 'bhk',
      icon: 'bed-outline',
      value: item.bhkConfiguration.trim(),
    });
  }

  if (item.builtupSqft > 0) {
    facts.push({
      key: 'sqft',
      icon: 'resize-outline',
      value: `${item.builtupSqft.toLocaleString('en-IN')} sq.ft`,
    });
  }

  if ((item.isForRent || item.isForPg) && item.depositAmount > 0) {
    facts.push({
      key: 'deposit',
      icon: 'wallet-outline',
      value: `Dep ${formatInr(item.depositAmount)}`,
    });
  }

  if (item.isForSale && item.sellPrice != null) {
    facts.push({
      key: 'sale',
      icon: 'pricetag-outline',
      value: formatInr(item.sellPrice),
    });
  }

  if (rich.furnished !== undefined) {
    facts.push({
      key: 'furnished',
      icon: 'cube-outline',
      value: rich.furnished ? 'Furnished' : 'Unfurnished',
    });
  }

  const possession =
    rich.possessionStatus?.trim() || rich.society?.possessionDetail?.trim();
  if (possession) {
    facts.push({
      key: 'possession',
      icon: 'calendar-outline',
      value: possession.length > 24 ? `${possession.slice(0, 23)}…` : possession,
    });
  } else if (item.availableFrom) {
    facts.push({
      key: 'available',
      icon: 'time-outline',
      value: formatListingDate(item.availableFrom),
    });
  }

  const society = [rich.societyName, rich.societyBlock].filter(Boolean).join(' · ');
  if (society) {
    facts.push({
      key: 'society',
      icon: 'business-outline',
      value: society.length > 24 ? `${society.slice(0, 23)}…` : society,
    });
  }

  if (item.ratingCount > 0 && item.averageRating > 0) {
    facts.push({
      key: 'rating',
      icon: 'star',
      value: `${item.averageRating.toFixed(1)} ★ (${item.ratingCount})`,
    });
  }

  if (item.isNegotiable) {
    facts.push({
      key: 'negotiable',
      icon: 'pricetag-outline',
      value: 'Negotiable',
    });
  }

  if (item.isFeaturedInSearch) {
    facts.push({
      key: 'featured',
      icon: 'shield-checkmark-outline',
      value: 'Featured',
    });
  }

  if (item.createdAtUtc) {
    facts.push({
      key: 'listed',
      icon: 'today-outline',
      value: `Listed ${formatListingDate(item.createdAtUtc)}`,
    });
  }

  if (item.reraNumber?.trim()) {
    const rera = item.reraNumber.trim();
    facts.push({
      key: 'rera',
      icon: 'shield-checkmark-outline',
      value: rera.length > 22 ? `${rera.slice(0, 21)}…` : rera,
    });
  }

  if (item.ownerName?.trim() && !item.isPostedByAgent) {
    const owner = item.ownerName.trim();
    facts.push({
      key: 'owner',
      icon: 'person-outline',
      value: owner.length > 22 ? `${owner.slice(0, 21)}…` : owner,
    });
  }

  return facts;
}

type BalancedMetaRow =
  | { kind: 'fact'; fact: CompactCardFact; weight: number }
  | { kind: 'tag'; value: string; weight: number }
  | { kind: 'note'; value: string; weight: number };

const FACT_WEIGHT = 1;
const TAG_WEIGHT = 0.85;
const NOTE_WEIGHT = 2;
const HIGHLIGHT_WEIGHT = 1.25;
const MAX_BODY_TAGS = 6;
const MAX_BODY_NOTES = 3;

function truncateMetaText(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function balanceMetaRows(rows: BalancedMetaRow[]): { left: BalancedMetaRow[]; right: BalancedMetaRow[] } {
  const left: BalancedMetaRow[] = [];
  const right: BalancedMetaRow[] = [];
  let leftWeight = 0;
  let rightWeight = 0;

  for (const row of rows) {
    if (leftWeight <= rightWeight) {
      left.push(row);
      leftWeight += row.weight;
    } else {
      right.push(row);
      rightWeight += row.weight;
    }
  }

  if (right.length === 0 && left.length >= 2) {
    const moved = left.pop()!;
    right.push(moved);
    leftWeight -= moved.weight;
    rightWeight += moved.weight;
  }

  return { left, right };
}

function columnFromRows(rows: BalancedMetaRow[]): {
  facts: CompactCardFact[];
  tags: string[];
  notes: string[];
} {
  return {
    facts: rows.filter((r): r is Extract<BalancedMetaRow, { kind: 'fact' }> => r.kind === 'fact').map((r) => r.fact),
    tags: rows.filter((r): r is Extract<BalancedMetaRow, { kind: 'tag' }> => r.kind === 'tag').map((r) => r.value),
    notes: rows.filter((r): r is Extract<BalancedMetaRow, { kind: 'note' }> => r.kind === 'note').map((r) => r.value),
  };
}

export type ListCardBodyMeta = {
  leftFacts: CompactCardFact[];
  rightFacts: CompactCardFact[];
  leftTags: string[];
  rightTags: string[];
  leftNotes: string[];
  rightNotes: string[];
};

/** Balance facts, highlights, and amenity tags across both columns so neither side is empty. */
export function buildListCardBodyMeta(item: PropertyResponse): ListCardBodyMeta {
  const rich = parseRichMetadata(item.richMetadataJson);
  const rows: BalancedMetaRow[] = [];

  for (const fact of collectListCardFacts(item).slice(0, MAX_BODY_FACTS)) {
    rows.push({ kind: 'fact', fact, weight: FACT_WEIGHT });
  }

  const desc = item.description?.trim();
  if (desc) {
    rows.push({
      kind: 'note',
      value: truncateMetaText(desc, 90),
      weight: NOTE_WEIGHT,
    });
  }

  (rich.highlights ?? [])
    .map((h) => h.trim())
    .filter(Boolean)
    .slice(0, MAX_BODY_NOTES)
    .forEach((highlight) => {
      rows.push({
        kind: 'note',
        value: truncateMetaText(highlight, 72),
        weight: HIGHLIGHT_WEIGHT,
      });
    });

  (rich.amenities ?? [])
    .map((a) => a.trim())
    .filter(Boolean)
    .slice(0, MAX_BODY_TAGS)
    .forEach((amenity) => {
      rows.push({
        kind: 'tag',
        value: truncateMetaText(amenity, 18),
        weight: TAG_WEIGHT,
      });
    });

  const { left, right } = balanceMetaRows(rows);
  const leftCol = columnFromRows(left);
  const rightCol = columnFromRows(right);

  return {
    leftFacts: leftCol.facts,
    rightFacts: rightCol.facts,
    leftTags: leftCol.tags,
    rightTags: rightCol.tags,
    leftNotes: leftCol.notes,
    rightNotes: rightCol.notes,
  };
}

/** Top facts for compact card strips. */
export function buildCompactListCardMeta(
  item: PropertyResponse,
  maxFacts = MAX_COMPACT_FACTS
): CompactCardFact[] {
  return collectListCardFacts(item).slice(0, maxFacts);
}

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
