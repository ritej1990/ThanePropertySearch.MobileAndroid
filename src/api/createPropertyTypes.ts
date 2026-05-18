/** Matches ThanePropertySearch.Api.Contracts.CreatePropertyRequest (camelCase JSON). */
export type CreatePropertyRequest = {
  title: string;
  description: string;
  rentAmount: number;
  sellPrice?: number | null;
  depositAmount: number;
  builtupSqft: number;
  bhkConfiguration: string;
  imageUrl?: string | null;
  address: string;
  areaName: string;
  latitude: number;
  longitude: number;
  isForRent: boolean;
  isForSale: boolean;
  isForPg: boolean;
  imageUrls?: string[] | null;
  richMetadataJson?: string | null;
  availableFrom?: string | null;
};

export type UploadImageResponse = {
  imageUrl: string;
  fileName: string;
};

export type UploadImagesResponse = {
  imageUrls: string[];
  files: Array<{ imageUrl: string; fileName: string }>;
};
