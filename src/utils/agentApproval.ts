/** Mirrors ListingReviewStatuses on the API — only these two count as "live approved". */
export function isAgentProfileApproved(status: string | null | undefined): boolean {
  return status === 'Approved' || status === 'AutoApproved';
}

export function isAgentProfileRejected(status: string | null | undefined): boolean {
  return status === 'Rejected';
}

/**
 * Profile is awaiting the agent's own input ("Pending with you" on web).
 * Mirrors `ListingReviewStatuses.AwaitingRequester`.
 */
export function agentProfileNeedsClarification(
  status: string | null | undefined
): boolean {
  return status === 'AwaitingRequester';
}

/**
 * Whether the agent can edit and resubmit the profile for another review.
 * Matches web `PendingApproval` — needs-clarification or rejected profiles.
 */
export function canResubmitAgentProfile(
  status: string | null | undefined
): boolean {
  return agentProfileNeedsClarification(status) || isAgentProfileRejected(status);
}

export function agentApprovalStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'InProgress':
      return 'In progress';
    case 'AwaitingRequester':
      return 'Pending with you';
    case 'SystemApproved':
      return 'Under admin review';
    case 'Approved':
      return 'Approved';
    case 'AutoApproved':
      return 'Auto approved';
    case 'Rejected':
      return 'Rejected';
    case 'Expired':
      return 'Expired';
    default:
      return 'Pending review';
  }
}
