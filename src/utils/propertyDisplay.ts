import type { PropertyResponse } from '../api/types';
import { formatInr } from './propertyFormat';

export function getPrimaryPrice(item: PropertyResponse): {
  label: string;
  amount: string;
  suffix: string;
  isRent: boolean;
} {
  const isRent = item.isForRent || item.isForPg;
  if (item.isForSale && !isRent && item.sellPrice != null) {
    return {
      label: 'Sale price',
      amount: formatInr(item.sellPrice),
      suffix: '',
      isRent: false,
    };
  }
  return {
    label: item.isForPg ? 'PG rent' : 'Monthly rent',
    amount: formatInr(item.rentAmount),
    suffix: '/ mo',
    isRent: true,
  };
}

export function formatRating(item: PropertyResponse): string {
  if (item.ratingCount <= 0) return 'New listing';
  return `${item.averageRating.toFixed(1)} ★ (${item.ratingCount})`;
}
