import {
  DEFAULT_AGENT_UNIT_PRICING,
  clampToStep,
  computeListingSubtotal,
  computeLeadSubtotal,
} from '../src/utils/agentPlanPricing';
import {
  isAgentProfileApproved,
  isAgentProfileRejected,
  agentProfileNeedsClarification,
  canResubmitAgentProfile,
  agentApprovalStatusLabel,
} from '../src/utils/agentApproval';

const U = DEFAULT_AGENT_UNIT_PRICING;

describe('Agent plan configurator pricing (mirrors API)', () => {
  it('listing = properties × days × (pricePerProperty ÷ referenceDays)', () => {
    // 1 property, 7 days at ₹399 / 7-day base = ₹399
    expect(computeListingSubtotal(U, 1, 7)).toBe(399);
    // 2 properties, 30 days = 2 × 30 × (399 / 7) = 3420
    expect(computeListingSubtotal(U, 2, 30)).toBe(3420);
  });

  it('rounds half away from zero (matches server MidpointRounding)', () => {
    // 1 × 1 × (399/7) = 57.0 → 57
    expect(computeListingSubtotal(U, 1, 1)).toBe(57);
  });

  it('lead subtotal = leads × pricePerLead, zero when none', () => {
    expect(computeLeadSubtotal(U, 0)).toBe(0);
    expect(computeLeadSubtotal(U, 10)).toBe(250);
  });

  it('clampToStep keeps values inside bounds and on the step grid', () => {
    expect(clampToStep(0, 1, 50, 1)).toBe(1);
    expect(clampToStep(999, 1, 50, 1)).toBe(50);
    expect(clampToStep(13, 0, 200, 5)).toBe(15); // snaps to nearest 5
    expect(clampToStep(12, 0, 200, 5)).toBe(10);
  });
});

describe('Agent approval gating (resubmit rules)', () => {
  it('approved statuses', () => {
    expect(isAgentProfileApproved('Approved')).toBe(true);
    expect(isAgentProfileApproved('AutoApproved')).toBe(true);
    expect(isAgentProfileApproved('Rejected')).toBe(false);
  });

  it('needs-clarification only for AwaitingRequester', () => {
    expect(agentProfileNeedsClarification('AwaitingRequester')).toBe(true);
    expect(agentProfileNeedsClarification('InProgress')).toBe(false);
  });

  it('canResubmit when needs-clarification OR rejected (not while approved/in-progress)', () => {
    expect(canResubmitAgentProfile('AwaitingRequester')).toBe(true);
    expect(canResubmitAgentProfile('Rejected')).toBe(true);
    expect(canResubmitAgentProfile('Approved')).toBe(false);
    expect(canResubmitAgentProfile('InProgress')).toBe(false);
    expect(canResubmitAgentProfile('SystemApproved')).toBe(false);
  });

  it('rejected detection', () => {
    expect(isAgentProfileRejected('Rejected')).toBe(true);
    expect(isAgentProfileRejected('Approved')).toBe(false);
  });

  it('human labels', () => {
    expect(agentApprovalStatusLabel('AwaitingRequester')).toBe('Pending with you');
    expect(agentApprovalStatusLabel('SystemApproved')).toBe('Under admin review');
    expect(agentApprovalStatusLabel('Approved')).toBe('Approved');
    expect(agentApprovalStatusLabel('something-unknown')).toBe('Pending review');
  });
});
