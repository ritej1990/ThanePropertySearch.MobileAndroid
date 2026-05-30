import type { createApiClient } from './client';
import type { UserProfile } from './userTypes';

export type UpdateProfileBody = {
  fullName: string;
  phoneNumber: string;
  marketIntent?: string | null;
  gstNumber?: string | null;
};

export function createUsersApi(client: ReturnType<typeof createApiClient>) {
  return {
    getMe() {
      return client.get<UserProfile>('/api/users/me');
    },

    updateMe(body: UpdateProfileBody) {
      return client.put<UserProfile>('/api/users/me', body);
    },
  };
}
