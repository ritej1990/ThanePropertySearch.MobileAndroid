import type { createApiClient } from './client';
import type {
  FavoriteEntryResponse,
  FavoriteResourceType,
  FavoriteStatusResponse,
  ToggleFavoriteResponse,
} from './favoriteTypes';

export function createFavoritesApi(client: ReturnType<typeof createApiClient>) {
  return {
    list() {
      return client.get<FavoriteEntryResponse[]>('/api/favorites');
    },

    status(resourceType: FavoriteResourceType, resourceId: number) {
      return client.get<FavoriteStatusResponse>(
        `/api/favorites/status?resourceType=${resourceType}&resourceId=${resourceId}`
      );
    },

    toggle(resourceType: FavoriteResourceType, resourceId: number) {
      return client.post<ToggleFavoriteResponse>('/api/favorites/toggle', {
        resourceType,
        resourceId,
      });
    },
  };
}
