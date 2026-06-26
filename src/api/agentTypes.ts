export type AgentProfile = {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string | null;
  profilePhotoUrl: string;
  companyName: string;
  whatsAppNumber: string;
  reraNumber: string;
  operatingLocalities: string;
  approvalStatus: string;
  verificationDetail: string | null;
  averageRating: number;
  ratingCount: number;
  emailConfirmed: boolean;
  reraCertificateUrl?: string | null;
};

/** Matches UpsertAgentProfileRequest — only usable once the profile is approved. */
export type UpdateAgentProfileBody = {
  profilePhotoUrl?: string | null;
  companyName: string;
  whatsAppNumber: string;
  reraNumber: string;
  operatingLocalities: string;
};

/** A picked local file (image) to upload as a RERA verification document. */
export type LocalUploadFile = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

/** Response from POST /api/agent-listings/upload-verification-document. */
export type UploadVerificationDocumentResponse = {
  documentUrl: string;
  fileName?: string | null;
};

/** Matches ResubmitAgentProfileRequest — reopens a pending/rejected profile for review. */
export type ResubmitAgentProfileBody = {
  reraNumber: string;
  reraCertificateUrl?: string | null;
  companyName?: string | null;
  whatsAppNumber?: string | null;
  operatingLocalities?: string | null;
};

export type AgentListingSummary = {
  id: number;
  title: string;
  areaName: string;
  reviewStatus: string;
  isForRent: boolean;
  isForSale: boolean;
  isForPg: boolean;
  rentAmount: number;
  sellPrice: number | null;
  createdAtUtc: string;
  imageUrl: string;
};

export type CreateAgentListingRequest = {
  title: string;
  description: string;
  listingCategory: string;
  rentAmount: number;
  sellPrice: number | null;
  depositAmount: number;
  builtupSqft: number;
  bhkConfiguration: string;
  address: string;
  areaName: string;
  pincode: string | null;
  latitude: number;
  longitude: number;
  coverImageUrl: string | null;
  imageUrls: string[] | null;
  isPublished: boolean;
  listingDurationDays: number;
  isNegotiable?: boolean;
  availableFrom?: string | null;
  richMetadataJson?: string | null;
};

export type AgentListingDetails = {
  id: number;
  title: string;
  description: string;
  listingCategory: string;
  rentAmount: number;
  sellPrice: number | null;
  depositAmount: number;
  builtupSqft: number;
  bhkConfiguration: string;
  address: string;
  areaName: string;
  latitude: number;
  longitude: number;
  coverImageUrl: string;
  isPublished: boolean;
  reviewStatus: string;
  verificationDetail?: string | null;
  listingDurationDays: number;
  listingPeriodEndUtc: string | null;
  viewCount: number;
  createdAtUtc: string;
  imageUrls: string[];
  richMetadataJson: string | null;
  isNegotiable: boolean;
  availableFrom: string | null;
  agentReraNumber?: string | null;
};

export type AgentPlanOption = {
  code: string;
  durationDays?: number;
  priceInr: number;
  maxPosts?: number;
  displayLabel: string;
  isLocked?: boolean;
  lockReason?: string | null;
  leadType?: string;
  leadCount?: number;
};

/** Slider bounds + unit prices for the agent listing-publish configurator. */
export type AgentListingUnitPricing = {
  pricePerPropertyInr: number;
  minPropertyCount: number;
  maxPropertyCount: number;
  minDurationDays: number;
  maxDurationDays: number;
  billingReferenceDays: number;
  pricePerLeadInr: number;
  minLeadCount: number;
  maxLeadCount: number;
};

export type AgentPaymentSummaryResponse = {
  publishCredits: number;
  leadCredits: number;
  publishPlanActive: boolean;
  activePublishTier: string | null;
  publishPlanStartUtc?: string | null;
  publishPlanEndsAtUtc: string | null;
  /** 0–100 plan consumption; -1/absent when the API can't compute it. */
  planUsagePercent?: number | null;
  publishSlotsMax?: number | null;
  availablePublishSlots?: number | null;
  reservedPublishSlots?: number | null;
  consumedPublishSlots?: number | null;
  leadPackageActive: boolean;
  activeLeadPackageTier: string | null;
  leadPackageEndsAtUtc: string | null;
  publishPlans: AgentPlanOption[];
  leadPackages: AgentPlanOption[];
  listingUnitPricing?: AgentListingUnitPricing | null;
};

export type AgentPaymentSummary = {
  publishCredits: number;
  publishPlanActive: boolean;
  publishTier: string | null;
  publishPlanEndsAtUtc: string | null;
  leadCredits: number;
  leadPackageActive: boolean;
  leadTier: string | null;
  leadPackageEndsAtUtc: string | null;
};

/** GET /api/agent-listings/leads — buyer enquiries unlocked with lead credits. */
export type AgentLead = {
  id: number;
  listingId: number;
  listingTitle: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAtUtc: string;
};
