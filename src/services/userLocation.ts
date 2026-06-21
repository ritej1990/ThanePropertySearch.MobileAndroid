import * as Location from 'expo-location';
import { THANE_MAP_CENTER } from '../config/env';
import { isWithinThaneBounds } from '../utils/mapHelpers';

export type UserGeoPoint = {
  latitude: number;
  longitude: number;
  label: string;
  source: 'gps' | 'fallback';
};

function thaneFallback(): UserGeoPoint {
  return {
    latitude: THANE_MAP_CENTER.latitude,
    longitude: THANE_MAP_CENTER.longitude,
    label: 'Thane',
    source: 'fallback',
  };
}

/** Foreground GPS — falls back to Thane center when permission or fix is unavailable. */
export async function resolveUserGeoPoint(): Promise<UserGeoPoint> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return thaneFallback();
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== Location.PermissionStatus.GRANTED) {
      return thaneFallback();
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = position.coords;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return thaneFallback();
    }

    if (!isWithinThaneBounds(latitude, longitude)) {
      return thaneFallback();
    }

    return {
      latitude,
      longitude,
      label: 'Your location',
      source: 'gps',
    };
  } catch {
    return thaneFallback();
  }
}
