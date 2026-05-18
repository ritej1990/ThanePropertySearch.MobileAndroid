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
};
