/** Matches ThanePropertySearch.Api.Contracts.AuthResponse (camelCase JSON) */
export type AuthResponse = {
  token: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  userId: string;
  emailConfirmed: boolean;
};

/** Matches LoginRequest */
export type LoginBody = {
  username: string;
  password: string;
};

export type LoginOtpSendBody = {
  phoneNumber: string;
};

export type LoginOtpVerifyBody = {
  phoneNumber: string;
  otpCode: string;
};

export type LoginOtpSendResponse = {
  message: string;
  channel?: string;
  retryAfterSeconds?: number;
};

export type UsernameCheckResponse = {
  exists: boolean;
  message: string;
  suggestions?: string[];
};

export type EmailCheckResponse = {
  exists: boolean;
  message: string;
};

/** Matches RegisterRequest */
export type RegisterBody = {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: string;
  marketIntent: string | null;
  gstNumber?: string | null;
  companyName?: string | null;
  reraNumber?: string | null;
  whatsAppNumber?: string | null;
  operatingLocalities?: string | null;
  profilePhotoUrl?: string | null;
};

/** Matches PropertyResponse (subset used by lists — extend as needed) */
export type PropertyResponse = {
  id: number;
  title: string;
  description: string;
  rentAmount: number;
  sellPrice: number | null;
  depositAmount: number;
  builtupSqft: number;
  bhkConfiguration: string;
  imageUrl: string;
  address: string;
  areaName: string;
  latitude: number;
  longitude: number;
  isForRent: boolean;
  isForSale: boolean;
  isForPg: boolean;
  reviewStatus: string;
  ownerName: string;
  averageRating: number;
  ratingCount: number;
  imageUrls: string[];
  createdAtUtc: string;
  richMetadataJson: string | null;
  availableFrom: string | null;
  isFeaturedInSearch: boolean;
  listingPeriodEndUtc: string | null;
  ownerId: string | null;
  isNegotiable?: boolean;
  isPostedByAgent?: boolean;
  /** Hidden from public search while still approved — show as Inactive in owner UI. */
  isHiddenFromSearch?: boolean;
  availabilityVerificationStatus?: string;
  lastVerifiedAtUtc?: string | null;
  verificationEmailSentAtUtc?: string | null;
  verificationCount?: number;
  autoHidden?: boolean;
  hiddenReason?: string | null;
  /** MahaRERA registration (agent listings, builder projects). */
  reraNumber?: string | null;
};
