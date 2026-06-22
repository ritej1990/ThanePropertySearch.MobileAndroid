import { useEffect, useState } from 'react';
import { favoritesApi } from '../api/singleton';
import type { FavoriteResourceType } from '../api/favoriteTypes';

type FavoriteState = { isFavorite: boolean; favoriteCount: number };

function keyOf(resourceType: FavoriteResourceType, resourceId: number) {
  return `${resourceType}:${resourceId}`;
}

/** Module-level store so a toggle on a list card stays in sync with the details screen. */
const cache = new Map<string, FavoriteState>();
const listeners = new Map<string, Set<() => void>>();
const inFlight = new Map<string, Promise<FavoriteState>>();

function notify(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

function loadStatus(
  resourceType: FavoriteResourceType,
  resourceId: number
): Promise<FavoriteState> {
  const key = keyOf(resourceType, resourceId);
  if (cache.has(key)) return Promise.resolve(cache.get(key)!);
  const existing = inFlight.get(key);
  if (existing) return existing;

  const p = favoritesApi
    .status(resourceType, resourceId)
    .then((res) => {
      const state: FavoriteState = { isFavorite: res.isFavorite, favoriteCount: res.favoriteCount };
      cache.set(key, state);
      notify(key);
      return state;
    })
    .catch(() => {
      const state: FavoriteState = { isFavorite: false, favoriteCount: 0 };
      cache.set(key, state);
      return state;
    })
    .finally(() => {
      inFlight.delete(key);
    });
  inFlight.set(key, p);
  return p;
}

export async function toggleFavorite(
  resourceType: FavoriteResourceType,
  resourceId: number
): Promise<FavoriteState> {
  const key = keyOf(resourceType, resourceId);
  const prev = cache.get(key) ?? { isFavorite: false, favoriteCount: 0 };

  // Optimistic update — mirrors the web's instant icon swap before the server confirms.
  const optimistic: FavoriteState = {
    isFavorite: !prev.isFavorite,
    favoriteCount: prev.favoriteCount + (prev.isFavorite ? -1 : 1),
  };
  cache.set(key, optimistic);
  notify(key);

  try {
    const res = await favoritesApi.toggle(resourceType, resourceId);
    const next: FavoriteState = { isFavorite: res.isFavorite, favoriteCount: res.favoriteCount };
    cache.set(key, next);
    notify(key);
    return next;
  } catch (e) {
    cache.set(key, prev);
    notify(key);
    throw e;
  }
}

/** Tracks favorite status + count for one resource, syncing across every component using it. */
export function useFavoriteStatus(resourceType: FavoriteResourceType, resourceId: number) {
  const key = keyOf(resourceType, resourceId);
  const [state, setState] = useState<FavoriteState | null>(cache.get(key) ?? null);

  useEffect(() => {
    const handler = () => setState(cache.get(key) ?? null);
    if (!listeners.has(key)) listeners.set(key, new Set());
    listeners.get(key)!.add(handler);

    if (cache.has(key)) {
      setState(cache.get(key)!);
    } else {
      loadStatus(resourceType, resourceId).then(setState);
    }

    return () => {
      listeners.get(key)?.delete(handler);
    };
  }, [key, resourceType, resourceId]);

  return state;
}
