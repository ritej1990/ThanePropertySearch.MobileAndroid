import { useEffect, useState } from 'react';
import { aiApi } from '../api/singleton';
import type { PropertyCardIntelligence } from '../api/aiTypes';

const cache = new Map<number, PropertyCardIntelligence | null>();
const inFlight = new Map<number, Promise<PropertyCardIntelligence | null>>();

export function getCachedCardIntelligence(
  listingId: number
): PropertyCardIntelligence | null | undefined {
  if (!cache.has(listingId)) return undefined;
  return cache.get(listingId) ?? null;
}

export function primeCardIntelligenceCache(
  items: { listingId: number; card: PropertyCardIntelligence }[]
): void {
  items.forEach(({ listingId, card }) => {
    cache.set(listingId, card);
  });
}

function loadCardIntelligence(listingId: number): Promise<PropertyCardIntelligence | null> {
  if (cache.has(listingId)) return Promise.resolve(cache.get(listingId) ?? null);
  const existing = inFlight.get(listingId);
  if (existing) return existing;

  const p = aiApi
    .cardIntelligenceFor(listingId)
    .then((card) => {
      cache.set(listingId, card);
      return card;
    })
    .catch(() => {
      cache.set(listingId, null);
      return null;
    })
    .finally(() => {
      inFlight.delete(listingId);
    });
  inFlight.set(listingId, p);
  return p;
}

/** Lazy card intelligence — shared cache across list cards and AI sort. */
export function useListingCardIntelligence(listingId: number) {
  const [data, setData] = useState<PropertyCardIntelligence | null | undefined>(
    getCachedCardIntelligence(listingId)
  );

  useEffect(() => {
    if (cache.has(listingId)) {
      setData(cache.get(listingId) ?? null);
      return;
    }
    let active = true;
    loadCardIntelligence(listingId).then((card) => {
      if (active) setData(card);
    });
    return () => {
      active = false;
    };
  }, [listingId]);

  return data;
}
