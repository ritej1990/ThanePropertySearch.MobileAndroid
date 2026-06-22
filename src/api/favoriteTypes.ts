/** Matches ThanePropertySearch.Api.Services.FavoriteResourceTypes */
export type FavoriteResourceType = 'PropertyListing' | 'AgentListing' | 'BuilderProject';

/** Matches ToggleFavoriteRequest */
export type ToggleFavoriteBody = {
  resourceType: FavoriteResourceType;
  resourceId: number;
};

/** Matches ToggleFavoriteResponse */
export type ToggleFavoriteResponse = {
  isFavorite: boolean;
  favoriteCount: number;
};

/** Matches FavoriteStatusResponse */
export type FavoriteStatusResponse = {
  isFavorite: boolean;
  favoriteCount: number;
};

/** Matches FavoriteEntryResponse */
export type FavoriteEntryResponse = {
  resourceType: FavoriteResourceType;
  resourceId: number;
  createdAtUtc: string;
};
