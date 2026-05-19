import type { PropertyResponse } from './types';
import { resolvePropertyImages } from '../utils/imageUrl';

export function normalizeProperty(p: PropertyResponse): PropertyResponse {
  const images = resolvePropertyImages(p);
  return {
    ...p,
    imageUrl: images.imageUrl,
    imageUrls: images.imageUrls,
  };
}

export function normalizeProperties(list: PropertyResponse[]): PropertyResponse[] {
  return list.map(normalizeProperty);
}
