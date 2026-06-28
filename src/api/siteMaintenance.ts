import type { createApiClient } from './client';

export type SiteMaintenanceStatus = {
  enabled: boolean;
  message: string;
  updatedAtUtc?: string;
};

export function createSiteMaintenanceApi(client: ReturnType<typeof createApiClient>) {
  return {
    getStatus() {
      return client.get<SiteMaintenanceStatus>('/api/site-maintenance', { auth: false });
    },
  };
}
