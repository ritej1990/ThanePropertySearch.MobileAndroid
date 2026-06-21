import type { SelectedPlace } from '../services/googlePlaces';
import type { UserGeoPoint } from '../services/userLocation';
import { DEFAULT_SEARCH_RADIUS_KM, THANE_MAP_CENTER } from '../config/env';

export type ListingGeoAnchor = {
  latitude: number;
  longitude: number;
  label: string;
  kind: 'place' | 'gps' | 'fallback';
};

export function resolveListingGeoAnchor(
  selectedPlace: SelectedPlace | null,
  userLocation: UserGeoPoint | null
): ListingGeoAnchor {
  if (selectedPlace) {
    return {
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      label: selectedPlace.label,
      kind: 'place',
    };
  }

  if (userLocation) {
    return {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      label: userLocation.label,
      kind: userLocation.source === 'gps' ? 'gps' : 'fallback',
    };
  }

  return {
    latitude: THANE_MAP_CENTER.latitude,
    longitude: THANE_MAP_CENTER.longitude,
    label: 'Thane',
    kind: 'fallback',
  };
}

export function listingGeoQuery(anchor: ListingGeoAnchor) {
  return {
    latitude: anchor.latitude,
    longitude: anchor.longitude,
    radiusKm: DEFAULT_SEARCH_RADIUS_KM,
  };
}

export function listingGeoBannerText(anchor: ListingGeoAnchor): string {
  return `Within ${DEFAULT_SEARCH_RADIUS_KM} km of ${anchor.label}`;
}
