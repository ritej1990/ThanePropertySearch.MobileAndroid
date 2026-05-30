import { formatInr } from './propertyFormat';

export function formatBuilderPrice(amount: number | null | undefined): string {
  if (amount == null || Number.isNaN(amount) || amount <= 0) return '—';
  return formatInr(amount);
}

export function formatPossessionDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatSqft(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toLocaleString('en-IN')} sq.ft.`;
}

export function parseAmenities(raw: string | null | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export const RERA_VERIFY_URL =
  'https://maharerait.mahaonline.gov.in/SearchList/Search';

export function shouldShowBuilderRera(reraNumber: string | null | undefined): boolean {
  const rera = reraNumber?.trim();
  return Boolean(rera && rera.toUpperCase() !== 'PENDING');
}
