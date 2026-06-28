export type PropertyRatingItem = {
  id: number;
  stars: number;
  review: string;
  createdAtUtc: string;
  userName: string;
};

/** Whether the signed-in user may review a property (completed-visit gate). */
export type RatingEligibility = {
  canReview: boolean;
  hasReviewed: boolean;
  reason: string | null;
};
