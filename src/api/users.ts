import type { createApiClient } from './client';
import type { UserProfile } from './userTypes';

export function createUsersApi(client: ReturnType<typeof createApiClient>) {
  return {
    getMe() {
      return client.get<UserProfile>('/api/users/me');
    },
  };
}
