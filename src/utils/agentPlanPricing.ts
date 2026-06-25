import type { AgentListingUnitPricing } from '../api/agentTypes';

/** Fallback bounds — mirrors PricingCatalog.DefaultAgentListingUnitPricing on the API. */
export const DEFAULT_AGENT_UNIT_PRICING: AgentListingUnitPricing = {
  pricePerPropertyInr: 399,
  minPropertyCount: 1,
  maxPropertyCount: 50,
  minDurationDays: 7,
  maxDurationDays: 365,
  billingReferenceDays: 7,
  pricePerLeadInr: 25,
  minLeadCount: 0,
  maxLeadCount: 200,
};

export function clampToStep(value: number, min: number, max: number, step = 1): number {
  const stepped = Math.round((value - min) / step) * step + min;
  return Math.min(max, Math.max(min, stepped));
}

/**
 * Listing subtotal = properties × days × (pricePerProperty ÷ referenceDays).
 * Matches AgentListingPublishPricing.ComputeListingSubtotalInr (round half away from zero;
 * for positive values this equals JS Math.round).
 */
export function computeListingSubtotal(
  unit: AgentListingUnitPricing,
  propertyCount: number,
  durationDays: number
): number {
  const ref = unit.billingReferenceDays > 0 ? unit.billingReferenceDays : 7;
  return Math.round(propertyCount * durationDays * (unit.pricePerPropertyInr / ref));
}

/** Lead subtotal = leads × pricePerLead. */
export function computeLeadSubtotal(
  unit: AgentListingUnitPricing,
  leadCount: number
): number {
  if (leadCount <= 0) return 0;
  const perLead = unit.pricePerLeadInr > 0 ? unit.pricePerLeadInr : 25;
  return Math.round(leadCount * perLead);
}
