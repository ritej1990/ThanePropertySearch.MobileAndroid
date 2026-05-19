import type { PropertyResponse } from '../api/types';
import { THANE_MAP_CENTER } from '../config/env';
import type { SelectedPlace } from '../services/googlePlaces';

export function hasValidPropertyCoordinates(item: PropertyResponse): boolean {
  const { latitude, longitude } = item;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (latitude === 0 && longitude === 0) return false;
  return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
}

export function propertiesWithCoordinates(items: PropertyResponse[]): PropertyResponse[] {
  return items.filter(hasValidPropertyCoordinates);
}

export function getMapInitialRegion(
  items: PropertyResponse[],
  selectedPlace: SelectedPlace | null
) {
  if (selectedPlace) {
    return {
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      latitudeDelta: 0.12,
      longitudeDelta: 0.12,
    };
  }

  const mapped = propertiesWithCoordinates(items);
  if (mapped.length > 0) {
    const lats = mapped.map((p) => p.latitude);
    const lngs = mapped.map((p) => p.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const pad = 0.02;
    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat + pad, 0.08),
      longitudeDelta: Math.max(maxLng - minLng + pad, 0.08),
    };
  }

  return {
    latitude: THANE_MAP_CENTER.latitude,
    longitude: THANE_MAP_CENTER.longitude,
    latitudeDelta: 0.14,
    longitudeDelta: 0.14,
  };
}

export function mapFitCoordinates(
  items: PropertyResponse[],
  selectedPlace: SelectedPlace | null
): Array<{ latitude: number; longitude: number }> {
  const coords = propertiesWithCoordinates(items).map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));
  if (selectedPlace) {
    coords.push({
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
    });
  }
  return coords;
}
