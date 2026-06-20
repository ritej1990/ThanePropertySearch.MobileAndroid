import type { createApiClient } from './client';
import type {
  AdvisorMessageResponse,
  AdvisorStartResponse,
  AiSearchParseResponse,
  BatchCardIntelligenceResponse,
  PropertyCardIntelligence,
  AreaExplorerRequest,
  AreaExplorerResponse,
  FraudAssessmentResponse,
  HomeLoanAdvisorRequest,
  HomeLoanAdvisorResponse,
  LeadQualificationRequest,
  LeadQualificationResponse,
  NegotiationAnalyzeRequest,
  NegotiationAnalyzeResponse,
  PriceRecommendationRequest,
  PriceRecommendationResponse,
  PropertyDetailInsightsResponse,
  LocationIntelligenceResponse,
  PropertyIntelligenceReportResponse,
  AdvisorStartRequest,
} from './aiTypes';

/** Routes: ThanePropertySearch.Api.Controllers.Ai.AiController — [Route("api/ai")] */
export function createAiApi(client: ReturnType<typeof createApiClient>) {
  return {
    getPropertyInsights(listingId: number, budget?: number) {
      const q = budget != null ? `?budget=${budget}` : '';
      return client.get<PropertyDetailInsightsResponse>(
        `/api/ai/property/${listingId}/insights${q}`,
        { auth: false }
      );
    },

    getLocationIntelligence(listingId: number) {
      return client.get<LocationIntelligenceResponse>(
        `/api/ai/property/${listingId}/location-intelligence`,
        { auth: false }
      );
    },

    getPropertyIntelligenceReport(listingId: number) {
      return client.get<PropertyIntelligenceReportResponse>(
        `/api/ai/property/${listingId}/intelligence`,
        { auth: false }
      );
    },

    /** Batch card intelligence for the given listing ids (used lazily per visible card). */
    async cardIntelligence(listingIds: number[]): Promise<BatchCardIntelligenceResponse> {
      return client.post<BatchCardIntelligenceResponse>(
        '/api/ai/property/intelligence/cards',
        { listingIds },
        { auth: false }
      );
    },

    async cardIntelligenceFor(listingId: number): Promise<PropertyCardIntelligence | null> {
      const res = await client.post<BatchCardIntelligenceResponse>(
        '/api/ai/property/intelligence/cards',
        { listingIds: [listingId] },
        { auth: false }
      );
      return res.items.find((i) => i.listingId === listingId)?.card ?? null;
    },

    parseSearch(query: string) {
      return client.post<AiSearchParseResponse>(
        '/api/ai/search/parse',
        { query },
        { auth: false }
      );
    },

    recommendPrice(body: PriceRecommendationRequest) {
      return client.post<PriceRecommendationResponse>('/api/ai/price/recommend', body);
    },

    startAdvisorConversation(title?: string, listingId?: number) {
      const body: AdvisorStartRequest = {};
      if (title) body.title = title;
      if (listingId != null) body.listingId = listingId;
      return client.post<AdvisorStartResponse>('/api/ai/advisor/conversations', body);
    },

    sendAdvisorMessage(conversationId: number, message: string) {
      return client.post<AdvisorMessageResponse>(
        `/api/ai/advisor/conversations/${conversationId}/messages`,
        { message }
      );
    },

    analyzeNegotiation(body: NegotiationAnalyzeRequest) {
      return client.post<NegotiationAnalyzeResponse>('/api/ai/negotiation/analyze', body);
    },

    adviseHomeLoan(body: HomeLoanAdvisorRequest) {
      return client.post<HomeLoanAdvisorResponse>('/api/ai/home-loan/advise', body, {
        auth: false,
      });
    },

    exploreArea(body: AreaExplorerRequest) {
      return client.post<AreaExplorerResponse>('/api/ai/area/explore', body, { auth: false });
    },

    areaSuggestions(query: string, limit = 8) {
      const q = encodeURIComponent(query.trim());
      return client.get<string[]>(`/api/ai/area/suggestions?q=${q}&limit=${limit}`, {
        auth: false,
      });
    },

    qualifyLead(body: LeadQualificationRequest) {
      return client.post<LeadQualificationResponse>('/api/ai/leads/qualify', body);
    },

    getLeadByInquiry(inquiryId: number) {
      return client.get<LeadQualificationResponse>(`/api/ai/leads/inquiry/${inquiryId}`);
    },

    getFraudAssessment(listingId: number) {
      return client.get<FraudAssessmentResponse>(`/api/ai/fraud/listing/${listingId}`);
    },
  };
}
