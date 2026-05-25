/** Public builder project card — GET /api/builder-projects */
export type BuilderProjectSummary = {
  id: number;
  projectName: string;
  builderName: string;
  description: string;
  address: string;
  areaName: string;
  latitude: number;
  longitude: number;
  towerCount: number;
  totalUnits: number;
  projectStatus: string;
  possessionDate: string;
  reraNumber: string;
  coverImageUrl: string;
  isPublished: boolean;
  reviewStatus: string;
  updatedAtUtc: string;
  availableUnits: number;
  leadCount: number;
  startingPrice: number;
  averageRating: number;
  ratingCount: number;
};

export type BuilderProjectMedia = {
  id: number;
  mediaType: string;
  url: string;
  caption: string;
  reviewStatus: string;
  createdAtUtc: string;
};

export type BuilderUnit = {
  id: number;
  towerName: string;
  unitNumber: string;
  configuration: string;
  carpetSqft: number;
  builtupSqft: number;
  price: number;
  availabilityStatus: string;
  floorPlanUrl: string;
  updatedAtUtc: string;
};

export type BuilderProjectDetail = BuilderProjectSummary & {
  loanFinanceAvailable: boolean;
  apfNumberAvailable: boolean;
  apfNumber: string;
  preferredBank: string;
  amenities: string;
  createdAtUtc: string;
  media: BuilderProjectMedia[];
  units: BuilderUnit[];
  constructionUpdates: unknown[];
};

export type BuilderLeadBody = {
  name: string;
  email: string;
  phone: string;
  message: string;
  unitId?: number | null;
};

export type BuilderLead = {
  id: number;
  projectId: number;
  unitId?: number | null;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAtUtc: string;
};
