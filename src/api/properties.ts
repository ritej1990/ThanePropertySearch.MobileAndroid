import type { createApiClient } from './client';
import type { PropertyResponse } from './types';

/** Routes: ThanePropertySearch.Api.Controllers.PropertiesController */
export function createPropertiesApi(client: ReturnType<typeof createApiClient>) {
  return {
    /** GET /api/properties — optional geo filter */
    list(params?: { latitude?: number; longitude?: number; radiusKm?: number }) {
      const q = new URLSearchParams();
      if (params?.latitude != null) q.set('latitude', String(params.latitude));
      if (params?.longitude != null) q.set('longitude', String(params.longitude));
      if (params?.radiusKm != null) q.set('radiusKm', String(params.radiusKm));
      const qs = q.toString();
      return client.get<PropertyResponse[]>(
        `/api/properties${qs ? `?${qs}` : ''}`,
        { auth: true }
      );
    },

    /** Anonymous browse works if API allows; your controller filters by role — send token when logged in */
    listPublic(params?: { latitude?: number; longitude?: number; radiusKm?: number }) {
      const q = new URLSearchParams();
      if (params?.latitude != null) q.set('latitude', String(params.latitude));
      if (params?.longitude != null) q.set('longitude', String(params.longitude));
      if (params?.radiusKm != null) q.set('radiusKm', String(params.radiusKm));
      const qs = q.toString();
      return client.get<PropertyResponse[]>(
        `/api/properties${qs ? `?${qs}` : ''}`,
        { auth: false }
      );
    },

    getById(id: number) {
      return client.get<PropertyResponse>(`/api/properties/${id}`, { auth: true });
    },

    /** Owner dashboard summary — GET /api/properties/owner-dashboard */
    ownerDashboard() {
      return client.get<
        Array<{
          id: number;
          title: string;
          areaName: string;
          reviewStatus: string;
          ownerListingTier: string | null;
          listingDurationDays: number;
          listingPeriodEndUtc: string | null;
          isFeaturedInSearch: boolean;
          daysRemaining: number | null;
          totalRequests: number;
          pendingRequests: number;
        }>
      >('/api/properties/owner-dashboard');
    },
  };
}
