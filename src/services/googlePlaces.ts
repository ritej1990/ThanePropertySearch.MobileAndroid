import {
  GOOGLE_MAPS_API_KEY,
  THANE_MAP_BOUNDS,
  THANE_MAP_CENTER,
  hasGoogleMapsKey,
} from '../config/env';
import { isWithinThaneBounds } from '../utils/mapHelpers';

const THANE_AUTOCOMPLETE_BOUNDS = `${THANE_MAP_BOUNDS.minLatitude},${THANE_MAP_BOUNDS.minLongitude}|${THANE_MAP_BOUNDS.maxLatitude},${THANE_MAP_BOUNDS.maxLongitude}`;

export type PlacePrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

export type SelectedPlace = {
  placeId: string;
  /** Display label (formatted address). */
  label: string;
  /** Full street address from Google (same as web Address field). */
  address: string;
  areaName: string;
  pincode: string;
  latitude: number;
  longitude: number;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type AutocompleteResponse = {
  status: string;
  predictions?: Array<{
    place_id: string;
    description: string;
    structured_formatting?: {
      main_text?: string;
      secondary_text?: string;
    };
  }>;
  error_message?: string;
};

type DetailsResponse = {
  status: string;
  result?: {
    formatted_address?: string;
    name?: string;
    address_components?: AddressComponent[];
    geometry?: { location?: { lat?: number; lng?: number } };
  };
  error_message?: string;
};

/** Matches thaneflats.com Create.cshtml extractArea / extractPincode. */
export function extractAreaFromComponents(components: AddressComponent[]): string {
  const order = [
    'sublocality_level_1',
    'locality',
    'neighborhood',
    'administrative_area_level_3',
    'administrative_area_level_2',
  ];
  for (const type of order) {
    const match = components.find((c) => c.types.includes(type));
    if (match) return match.long_name;
  }
  return '';
}

export function extractPincodeFromComponents(components: AddressComponent[]): string {
  const pin = components.find((c) => c.types.includes('postal_code'));
  return pin?.long_name ?? '';
}

function mapsError(status: string, message?: string): Error {
  if (status === 'REQUEST_DENIED') {
    return new Error(
      message ??
        'Google Maps API key was denied. Enable Places API and check key restrictions.'
    );
  }
  return new Error(message ?? `Google Places error: ${status}`);
}

/** Places Autocomplete — biased to Thane, India (same idea as web search). */
export async function fetchPlacePredictions(
  input: string
): Promise<PlacePrediction[]> {
  if (!hasGoogleMapsKey()) return [];
  const trimmed = input.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    input: trimmed,
    key: GOOGLE_MAPS_API_KEY,
    components: 'country:in',
    location: `${THANE_MAP_CENTER.latitude},${THANE_MAP_CENTER.longitude}`,
    radius: '25000',
    bounds: THANE_AUTOCOMPLETE_BOUNDS,
    strictbounds: 'true',
    types: 'geocode',
    language: 'en',
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
  );
  const data = (await res.json()) as AutocompleteResponse;

  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw mapsError(data.status, data.error_message);
  }

  return (data.predictions ?? [])
    .filter((p) => {
      const text = (p.description ?? '').toLowerCase();
      return text.includes('thane') || text.includes('ठाणे');
    })
    .map((p) => ({
      placeId: p.place_id,
      description: p.description,
      mainText: p.structured_formatting?.main_text ?? p.description,
      secondaryText: p.structured_formatting?.secondary_text ?? '',
    }));
}

export async function fetchPlaceDetails(placeId: string): Promise<SelectedPlace> {
  if (!hasGoogleMapsKey()) {
    throw new Error('Google Maps API key is not configured.');
  }

  const params = new URLSearchParams({
    place_id: placeId,
    key: GOOGLE_MAPS_API_KEY,
    fields: 'geometry,formatted_address,name,address_components',
    language: 'en',
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  const data = (await res.json()) as DetailsResponse;

  if (data.status !== 'OK' || !data.result?.geometry?.location) {
    throw mapsError(data.status, data.error_message);
  }

  const { lat, lng } = data.result.geometry.location;
  if (lat == null || lng == null) {
    throw new Error('Place has no coordinates.');
  }
  if (!isWithinThaneBounds(lat, lng)) {
    throw new Error(
      'Please choose a location within Thane district only.'
    );
  }

  const components = data.result.address_components ?? [];
  const address =
    data.result.formatted_address ?? data.result.name ?? 'Selected location';
  const areaName = extractAreaFromComponents(components);
  const pincode = extractPincodeFromComponents(components);

  return {
    placeId,
    label: address,
    address,
    areaName,
    pincode,
    latitude: lat,
    longitude: lng,
  };
}
