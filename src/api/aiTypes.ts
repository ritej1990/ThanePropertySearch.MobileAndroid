/** Matches ThanePropertySearch.Api.Contracts.Ai.* (camelCase JSON) */

export type PriceVerdictInsight = {
  askingPrice: number | null;
  fairMarketPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  verdict: string;
  deltaPercent: number;
  confidenceScore: number;
  summary: string;
};

export type RentVerdictInsight = {
  askingRent: number;
  estimatedMarketRent: number | null;
  verdict: string;
  summary: string;
};

export type FitVerdictInsight = {
  recommendation: string;
  score: number;
  summary: string;
};

export type CommutePreviewItem = {
  office: string;
  carMinutes: number;
  peakCarMinutes: number;
  metroMinutes: number;
  commuteScore: number;
};

export type AffordabilityInsight = {
  budget: number;
  listingPrice: number | null;
  verdict: string;
  summary: string;
};

export type PropertyDetailInsightsResponse = {
  listingId: number;
  title: string;
  areaName: string;
  listingType: string;
  priceVerdict: PriceVerdictInsight | null;
  rentVerdict: RentVerdictInsight | null;
  fitVerdict: FitVerdictInsight;
  questionsToAsk: string[];
  commutePreview: CommutePreviewItem[];
  localityInsight: string;
  highlights: string[];
  affordability: AffordabilityInsight | null;
  modelVersion: string;
};

export type PropertyCardScoreChip = {
  label: string;
  score: number;
};

export type PropertyCardIntelligence = {
  investmentScore: number;
  insightTag: string;
  shortSummary: string;
  scoreChips: PropertyCardScoreChip[];
};

export type PropertyCardIntelligenceItem = {
  listingId: number;
  card: PropertyCardIntelligence;
};

export type BatchCardIntelligenceResponse = {
  items: PropertyCardIntelligenceItem[];
};

export type AiSearchParseResponse = {
  rawQuery: string;
  location: string | null;
  bhk: string | null;
  listingType: string | null;
  saleBudgetMax: number | null;
  rentBudgetMax: number | null;
  furnishing: string | null;
  displayLines: string[];
};

export type PriceRecommendationRequest = {
  propertyType: string;
  bhk: string;
  carpetSqft?: number | null;
  builtupSqft: number;
  societyName?: string | null;
  locality: string;
  propertyAge?: string | null;
  furnishing?: string | null;
  parking?: string | null;
  floorNumber?: number | null;
  amenities?: string[] | null;
  listingId?: number | null;
};

export type PriceRecommendationResponse = {
  id: number;
  fairMarketPrice: number;
  quickSalePrice: number;
  premiumSalePrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
  confidenceScore: number;
  summary: string;
  factors: string[];
  modelVersion: string;
};

export type AdvisorStartResponse = {
  conversationId: number;
};

export type AdvisorMessageResponse = {
  messageId: number;
  reply: string;
  scores?: Record<string, number> | null;
  sources?: string[] | null;
};

export type NegotiationAnalyzeRequest = {
  listingId: number;
  askingPrice: number;
  buyerBudget: number;
  marketTrend?: string;
};

export type NegotiationMessagesResponse = {
  whatsApp: string[];
  emailSubject: string;
  emailBody: string;
};

export type NegotiationAnalyzeResponse = {
  sessionId: number;
  recommendedFirstOffer: number;
  recommendedFinalOffer: number;
  negotiationStrength: string;
  successProbability: number;
  strategySummary: string;
  messages: NegotiationMessagesResponse;
};

export type HomeLoanAdvisorRequest = {
  monthlyIncome: number;
  existingEmi: number;
  downPayment: number;
};

export type HomeLoanAdvisorResponse = {
  eligibleLoanAmount: number;
  recommendedBudgetAmount: number;
  safeEmiAmount: number;
  eligibleLoanLabel: string;
  recommendedBudgetLabel: string;
  safeEmiLabel: string;
  assumedInterestRatePercent: number;
  assumedTenureYears: number;
  summary: string;
  tips: string[];
  modelVersion: string;
};

export type AreaExplorerRequest = {
  locationQuery?: string | null;
  listingType?: string | null;
  listingLimit?: number;
};

export type AreaExplorerScores = {
  connectivity: number;
  growth: number;
  affordability: number;
  liveability: number;
};

export type AreaMarketSnapshot = {
  avgSalePerSqft: number | null;
  avgRentPerSqft: number | null;
  rentalYieldPct: number | null;
  appreciationYoYPct: number | null;
  priceBandLabel: string;
};

export type AreaConnectivityItem = {
  mode: string;
  name: string;
  detail: string;
  distanceLabel: string | null;
};

export type AreaNearbyLocality = {
  name: string;
  relationship: string;
  highlight: string;
};

export type AreaExplorerListingCard = {
  id: number;
  source: string;
  title: string;
  areaName: string;
  bhk: string;
  listingType: string;
  rentAmount: number | null;
  salePrice: number | null;
  imageUrl: string | null;
  detailPath: string;
};

export type AreaExplorerResponse = {
  query: string;
  resolvedArea: string;
  parentRegion: string | null;
  zoneLabel: string;
  headline: string;
  overview: string;
  scores: AreaExplorerScores;
  market: AreaMarketSnapshot;
  connectivity: AreaConnectivityItem[];
  nearbyAreas: AreaNearbyLocality[];
  listings: AreaExplorerListingCard[];
  buyerTips: string[];
  rentVsBuyNotes: string[];
  searchUrl: string | null;
  totalListingsFound: number;
  modelVersion: string;
};

export type LeadQualificationRequest = {
  listingId?: number | null;
  budget?: number | null;
  intent?: string | null;
  loanStatus?: string | null;
  purchaseTimeline?: string | null;
  occupation?: string | null;
  familySize?: number | null;
  preferredLocality?: string | null;
};

export type LeadQualificationResponse = {
  id: number;
  leadScore: number;
  leadType: string;
  conversionProbability: number;
  buyerReadiness: string;
  budgetAuthenticity: string;
  qualificationSummary: string;
};

export type FraudRiskReason = {
  code: string;
  severity: string;
  detail: string;
};

export type FraudAssessmentResponse = {
  id: number;
  fraudScore: number;
  riskLevel: string;
  suggestedAction: string;
  riskReasons: FraudRiskReason[];
  aiReasoning: string | null;
};

export type NearbyPlaceItem = {
  name: string;
  distanceKm: number;
  distanceLabel: string;
  driveMinutes: number;
  autoFareLabel: string;
  tag: string | null;
  isFromListing: boolean;
};

export type NearbyPlaceCategory = {
  key: string;
  title: string;
  icon: string;
  items: NearbyPlaceItem[];
};

/** GET /api/ai/property/{id}/location-intelligence */
export type LocationIntelligenceResponse = {
  areaLabel: string;
  propertyLabel: string;
  locationSummary: string;
  categories: NearbyPlaceCategory[];
  autoFareDisclaimer: string;
};

/** GET /api/ai/property/{id}/intelligence */
export type PropertyIntelligenceReportResponse = {
  propertyLabel: string;
  areaLabel: string;
  investmentScore: number;
  rentalYieldScore: number;
  futureGrowthScore: number;
  connectivityScore: number;
  familyFriendlyScore: number;
  locationGrowthScore: number;
  rentalDemandScore: number;
  amenitiesScore: number;
  futureAppreciationScore: number;
  summary: string;
  insightBullets: string[];
  generatedLabel: string;
};

export type AdvisorStartRequest = {
  title?: string | null;
  listingId?: number | null;
};
