/** Format helpers aligned with thaneflats.com property UI */

export function formatInr(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function formatListingDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export type PropertyRichMetadata = {
  societyName?: string;
  societyBlock?: string;
  amenities?: string[];
  furnished?: boolean;
  highlights?: string[];
};

export function parseRichMetadata(json: string | null | undefined): PropertyRichMetadata {
  if (!json?.trim()) return {};
  try {
    const data = JSON.parse(json) as Record<string, unknown>;
    const amenities = data.amenities;
    const highlights = data.highlights;
    return {
      societyName:
        typeof data.societyName === 'string' ? data.societyName : undefined,
      societyBlock:
        typeof data.societyBlock === 'string' ? data.societyBlock : undefined,
      furnished: typeof data.furnished === 'boolean' ? data.furnished : undefined,
      amenities: Array.isArray(amenities)
        ? amenities.filter((a): a is string => typeof a === 'string')
        : undefined,
      highlights: Array.isArray(highlights)
        ? highlights.filter((h): h is string => typeof h === 'string')
        : undefined,
    };
  } catch {
    return {};
  }
}

export function listingTypeChips(item: {
  isForRent: boolean;
  isForSale: boolean;
  isForPg: boolean;
}): Array<{ label: string; tone: 'rent' | 'sale' | 'pg' }> {
  const chips: Array<{ label: string; tone: 'rent' | 'sale' | 'pg' }> = [];
  if (item.isForRent) chips.push({ label: 'Rent', tone: 'rent' });
  if (item.isForSale) chips.push({ label: 'Sale', tone: 'sale' });
  if (item.isForPg) chips.push({ label: 'PG', tone: 'pg' });
  return chips;
}
