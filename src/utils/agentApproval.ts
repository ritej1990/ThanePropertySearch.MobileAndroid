/** Mirrors ListingReviewStatuses on the API — only these two count as "live approved". */
export function isAgentProfileApproved(status: string | null | undefined): boolean {
  return status === 'Approved' || status === 'AutoApproved';
}

export function isAgentProfileRejected(status: string | null | undefined): boolean {
  return status === 'Rejected';
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
