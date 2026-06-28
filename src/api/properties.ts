import type { createApiClient } from './client';
import type {
  CreatePropertyRequest,
  UploadImageResponse,
  UploadImagesResponse,
} from './createPropertyTypes';
import type {
  InquiryMessage,
  MyChatThread,
  OwnerContact,
  PropertyInquirySummary,
} from './inquiryTypes';
import type { UnreadPreviewResponse } from './messageNotificationTypes';
import type { PropertyRatingItem, RatingEligibility } from './ratingTypes';
import type { VisitRequest } from './visitTypes';
import type { PropertyResponse } from './types';
import { normalizeOwnerDashboard } from './normalizeOwnerDashboard';
import { normalizeProperties, normalizeProperty } from './normalizeProperty';

type LocalImage = {
  uri: string;
  fileName?: string;
  mimeType?: string;
};

function appendFile(
  form: FormData,
  field: string,
  image: LocalImage
) {
  const name = image.fileName ?? `photo-${Date.now()}.jpg`;
  const type = image.mimeType ?? 'image/jpeg';
  form.append(field, { uri: image.uri, name, type } as unknown as Blob);
}

/** Routes: ThanePropertySearch.Api.Controllers.PropertiesController */
export function createPropertiesApi(client: ReturnType<typeof createApiClient>) {
  return {
    /** GET /api/properties — optional geo filter */
    async list(params?: { latitude?: number; longitude?: number; radiusKm?: number }) {
      const q = new URLSearchParams();
      if (params?.latitude != null) q.set('latitude', String(params.latitude));
      if (params?.longitude != null) q.set('longitude', String(params.longitude));
      if (params?.radiusKm != null) q.set('radiusKm', String(params.radiusKm));
      const qs = q.toString();
      const data = await client.get<PropertyResponse[]>(
        `/api/properties${qs ? `?${qs}` : ''}`,
        { auth: true }
      );
      return normalizeProperties(data);
    },

    async listPublic(params?: {
      latitude?: number;
      longitude?: number;
      radiusKm?: number;
    }) {
      const q = new URLSearchParams();
      if (params?.latitude != null) q.set('latitude', String(params.latitude));
      if (params?.longitude != null) q.set('longitude', String(params.longitude));
      if (params?.radiusKm != null) q.set('radiusKm', String(params.radiusKm));
      const qs = q.toString();
      const data = await client.get<PropertyResponse[]>(
        `/api/properties${qs ? `?${qs}` : ''}`,
        { auth: false }
      );
      return normalizeProperties(data);
    },

    async getById(id: number) {
      const data = await client.get<PropertyResponse>(`/api/properties/${id}`, {
        auth: true,
      });
      return normalizeProperty(data);
    },

    /** Owner dashboard summary — GET /api/properties/owner-dashboard */
    async ownerDashboard() {
      const data = await client.get<unknown[]>('/api/properties/owner-dashboard');
      return normalizeOwnerDashboard(Array.isArray(data) ? data : []);
    },

    /** POST /api/properties — owner create listing */
    create(body: CreatePropertyRequest) {
      return client.post<PropertyResponse>('/api/properties', body);
    },

    /** POST /api/properties/upload-image — single cover image */
    uploadImage(image: LocalImage) {
      const form = new FormData();
      appendFile(form, 'file', image);
      return client.post<UploadImageResponse>('/api/properties/upload-image', form);
    },

    /** POST /api/properties/upload-images — gallery */
    uploadImages(images: LocalImage[]) {
      const form = new FormData();
      for (const img of images) {
        appendFile(form, 'files', img);
      }
      return client.post<UploadImagesResponse>('/api/properties/upload-images', form);
    },

    getOwnerContact(propertyId: number) {
      return client.get<OwnerContact>(`/api/properties/${propertyId}/owner-contact`);
    },

    scheduleVisit(propertyId: number, visitAtLocal: string, message: string) {
      return client.post<{ message: string }>(
        `/api/properties/${propertyId}/visit-request`,
        { visitAtLocal, message }
      );
    },

    createInquiry(propertyId: number, message: string, offerAmount?: number | null) {
      return client.post<{ inquiryId: number; message: string }>(
        `/api/properties/${propertyId}/inquiries`,
        { message, offerAmount: offerAmount ?? null }
      );
    },

    getPropertyInquiries(propertyId: number) {
      return client.get<PropertyInquirySummary[]>(
        `/api/properties/${propertyId}/inquiries`
      );
    },

    getInquiryMessages(inquiryId: number) {
      return client.get<InquiryMessage[]>(
        `/api/properties/inquiries/${inquiryId}/messages`
      );
    },

    sendInquiryMessage(
      inquiryId: number,
      message: string,
      offerAmount?: number | null
    ) {
      return client.post<{ message: string }>(
        `/api/properties/inquiries/${inquiryId}/messages`,
        { message, offerAmount: offerAmount ?? null }
      );
    },

    rateProperty(propertyId: number, stars: number, review: string) {
      return client.post<{ message: string }>(`/api/properties/${propertyId}/ratings`, {
        stars,
        review,
      });
    },

    /** GET /api/properties/{id}/ratings — public review list (web ratings modal). */
    getPropertyRatings(propertyId: number) {
      return client.get<PropertyRatingItem[]>(
        `/api/properties/${propertyId}/ratings`,
        { auth: false }
      );
    },

    /** GET /api/properties/{id}/ratings/eligibility — can the user write a review (completed-visit gate). */
    getRatingEligibility(propertyId: number) {
      return client.get<RatingEligibility>(
        `/api/properties/${propertyId}/ratings/eligibility`
      );
    },

    getMyMessageCount() {
      return client.get<{ count: number }>('/api/properties/inquiries/my-message-count');
    },

    getMyUnreadPreview() {
      return client.get<UnreadPreviewResponse>(
        '/api/properties/inquiries/my-unread-preview'
      );
    },

    getMyThreads() {
      return client.get<MyChatThread[]>('/api/properties/inquiries/my-threads');
    },

    getVisitRequests(propertyId: number) {
      return client.get<VisitRequest[]>(
        `/api/properties/${propertyId}/visit-requests`
      );
    },

    updateVisitRequestStatus(
      propertyId: number,
      visitId: number,
      status: 'Approved' | 'Declined'
    ) {
      return client.post<{ message: string; status: string }>(
        `/api/properties/${propertyId}/visit-requests/${visitId}/status`,
        { status }
      );
    },

    updateInquiryStatus(inquiryId: number, status: 'Approved' | 'Rejected') {
      return client.post<{ message: string }>(
        `/api/properties/inquiries/${inquiryId}/status`,
        { status }
      );
    },

    setOwnerAvailabilityOutcome(propertyId: number, outcome: string | null) {
      return client.post<{ message: string; outcome: string | null }>(
        `/api/properties/${propertyId}/owner-availability`,
        { outcome: outcome ?? '' }
      );
    },

    setOwnerHideFromSearch(propertyId: number, hidden: boolean) {
      return client.post<{ message: string; hidden: boolean }>(
        `/api/properties/${propertyId}/owner-hide-from-search`,
        { hidden }
      );
    },

    deleteOwnerListing(propertyId: number) {
      return client.delete<{ message: string }>(
        `/api/properties/${propertyId}/owner-listing`
      );
    },

    resubmitForReview(propertyId: number) {
      return client.post<{ message: string; reviewStatus: string }>(
        `/api/properties/${propertyId}/resubmit-for-review`
      );
    },
  };
}
