import type { Region } from 'react-native-maps';
import type { PropertyResponse } from '../api/types';
import {
  THANE_MAP_BOUNDS,
  THANE_MAP_CENTER,
  THANE_MAP_DEFAULT_DELTAS,
  THANE_MAP_MAX_LATITUDE_DELTA,
  THANE_MAP_MAX_LONGITUDE_DELTA,
} from '../config/env';
import type { SelectedPlace } from '../services/googlePlaces';

export function isWithinThaneBounds(latitude: number, longitude: number): boolean {
  return (
    latitude >= THANE_MAP_BOUNDS.minLatitude &&
    latitude <= THANE_MAP_BOUNDS.maxLatitude &&
    longitude >= THANE_MAP_BOUNDS.minLongitude &&
    longitude <= THANE_MAP_BOUNDS.maxLongitude
  );
}

export function clampCoordinate(latitude: number, longitude: number) {
  return {
    latitude: Math.min(
      THANE_MAP_BOUNDS.maxLatitude,
      Math.max(THANE_MAP_BOUNDS.minLatitude, latitude)
    ),
    longitude: Math.min(
      THANE_MAP_BOUNDS.maxLongitude,
      Math.max(THANE_MAP_BOUNDS.minLongitude, longitude)
    ),
  };
}

/** Keep map viewport inside Thane and limit how far users can zoom out. */
export function clampMapRegion(region: Region): Region {
  const halfLat = Math.min(
    region.latitudeDelta / 2,
    THANE_MAP_MAX_LATITUDE_DELTA / 2
  );
  const halfLng = Math.min(
    region.longitudeDelta / 2,
    THANE_MAP_MAX_LONGITUDE_DELTA / 2
  );

  let latDelta = Math.min(region.latitudeDelta, THANE_MAP_MAX_LATITUDE_DELTA);
  let lngDelta = Math.min(region.longitudeDelta, THANE_MAP_MAX_LONGITUDE_DELTA);

  let latitude = region.latitude;
  let longitude = region.longitude;

  const minCenterLat = THANE_MAP_BOUNDS.minLatitude + halfLat;
  const maxCenterLat = THANE_MAP_BOUNDS.maxLatitude - halfLat;
  const minCenterLng = THANE_MAP_BOUNDS.minLongitude + halfLng;
  const maxCenterLng = THANE_MAP_BOUNDS.maxLongitude - halfLng;

  if (minCenterLat <= maxCenterLat) {
    latitude = Math.min(maxCenterLat, Math.max(minCenterLat, latitude));
  } else {
    latitude = THANE_MAP_CENTER.latitude;
    latDelta = THANE_MAP_MAX_LATITUDE_DELTA;
  }

  if (minCenterLng <= maxCenterLng) {
    longitude = Math.min(maxCenterLng, Math.max(minCenterLng, longitude));
  } else {
    longitude = THANE_MAP_CENTER.longitude;
    lngDelta = THANE_MAP_MAX_LONGITUDE_DELTA;
  }

  return {
    latitude,
    longitude,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}

export function getThaneDefaultRegion(): Region {
  return {
    latitude: THANE_MAP_CENTER.latitude,
    longitude: THANE_MAP_CENTER.longitude,
    latitudeDelta: THANE_MAP_DEFAULT_DELTAS.latitudeDelta,
    longitudeDelta: THANE_MAP_DEFAULT_DELTAS.longitudeDelta,
  };
}

export function hasValidPropertyCoordinates(item: PropertyResponse): boolean {
  const { latitude, longitude } = item;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return false;
  if (latitude === 0 && longitude === 0) return false;
  if (!isWithinThaneBounds(latitude, longitude)) return false;
  return Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
}

export function propertiesWithCoordinates(items: PropertyResponse[]): PropertyResponse[] {
  return items.filter(hasValidPropertyCoordinates);
}

export function getMapInitialRegion(
  items: PropertyResponse[],
  selectedPlace: SelectedPlace | null
): Region {
  if (selectedPlace && isWithinThaneBounds(selectedPlace.latitude, selectedPlace.longitude)) {
    return clampMapRegion({
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    });
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
    return clampMapRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max(maxLat - minLat + pad, 0.08),
      longitudeDelta: Math.max(maxLng - minLng + pad, 0.08),
    });
  }

  return getThaneDefaultRegion();
}

export function mapFitCoordinates(
  items: PropertyResponse[],
  selectedPlace: SelectedPlace | null
): Array<{ latitude: number; longitude: number }> {
  const coords = propertiesWithCoordinates(items).map((p) => ({
    latitude: p.latitude,
    longitude: p.longitude,
  }));
  if (
    selectedPlace &&
    isWithinThaneBounds(selectedPlace.latitude, selectedPlace.longitude)
  ) {
    coords.push({
      latitude: selectedPlace.latitude,
      longitude: selectedPlace.longitude,
    });
  }
  if (coords.length === 0) {
    coords.push({
      latitude: THANE_MAP_CENTER.latitude,
      longitude: THANE_MAP_CENTER.longitude,
    });
  }
  return coords;
}

export function regionsDiffer(a: Region, b: Region, epsilon = 0.0008): boolean {
  return (
    Math.abs(a.latitude - b.latitude) > epsilon ||
    Math.abs(a.longitude - b.longitude) > epsilon ||
    Math.abs(a.latitudeDelta - b.latitudeDelta) > epsilon ||
    Math.abs(a.longitudeDelta - b.longitudeDelta) > epsilon
  );
}
