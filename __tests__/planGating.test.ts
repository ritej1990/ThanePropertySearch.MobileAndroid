import {
  normalizeEssentialUsage,
  getEssentialStatusLabel,
  hasActiveEssentialPlan,
} from '../src/utils/planDisplay';
import {
  hasActivePlanCredits,
  canRevealOwnerContact,
  formatPlanUsedPercent,
  resolveEssentialCreditsLevel,
} from '../src/utils/planUsage';
import type { EssentialStatus } from '../src/api/paymentTypes';

function status(over: Partial<EssentialStatus>): EssentialStatus {
  return {
    active: true,
    endsAtUtc: null,
    tier: 'ESS30',
    usageMax: 30,
    usageUsed: 0,
    usageLeft: 30,
    ...over,
  };
}

describe('Essential usage normalization', () => {
  it('uses effectiveUsageLeft once inactive (lapsed credits ignored)', () => {
    const n = normalizeEssentialUsage(
      status({ active: false, usageUsed: 10, usageLeft: 20, effectiveUsageLeft: 0 })
    );
    expect(n.usageLeft).toBe(0);
    expect(n.usageUsed).toBe(30);
  });

  it('keeps consistent used/left for an active plan', () => {
    const n = normalizeEssentialUsage(status({ usageUsed: 12, usageLeft: 18 }));
    expect(n).toEqual({ usageMax: 30, usageUsed: 12, usageLeft: 18 });
  });
});

describe('Essential plan status label', () => {
  it('credits-exhausted shows "Credits used"', () => {
    expect(getEssentialStatusLabel(status({ expiredReason: 'credits' })).label).toBe('Credits used');
  });
  it('inactive shows Expired', () => {
    expect(getEssentialStatusLabel(status({ active: false, effectiveUsageLeft: 0 })).tone).toBe('expired');
  });
  it('low usage warns', () => {
    expect(getEssentialStatusLabel(status({ usageLeft: 3 })).label).toBe('Low usage');
  });
  it('healthy plan is active', () => {
    expect(getEssentialStatusLabel(status({ usageLeft: 25 })).label).toBe('Active');
  });
  it('null status is inactive', () => {
    expect(getEssentialStatusLabel(null).tone).toBe('expired');
  });
});

describe('Owner-contact reveal gating (the reveal button)', () => {
  it('allowed with active plan credits', () => {
    expect(canRevealOwnerContact(status({ usageLeft: 5 }))).toBe(true);
    expect(hasActivePlanCredits(status({ usageLeft: 5 }))).toBe(true);
  });

  it('allowed via contact-pack even when plan inactive/exhausted', () => {
    expect(
      canRevealOwnerContact(
        status({ active: false, effectiveUsageLeft: 0, contactRevealCreditsRemaining: 2 })
      )
    ).toBe(true);
  });

  it('blocked with no plan credits and no contact pack', () => {
    expect(
      canRevealOwnerContact(status({ active: false, effectiveUsageLeft: 0 }))
    ).toBe(false);
    expect(canRevealOwnerContact(null)).toBe(false);
  });
});

describe('Plan used %', () => {
  it('inactive is 100%', () => {
    expect(formatPlanUsedPercent(status({ active: false, effectiveUsageLeft: 0 }))).toBe(100);
  });
  it('half-consumed is ~50%', () => {
    expect(formatPlanUsedPercent(status({ usageUsed: 15, usageLeft: 15 }))).toBe(50);
  });
});

describe('Essential credit level hints', () => {
  it('no credits left is critical', () => {
    expect(resolveEssentialCreditsLevel(0, 30, null).level).toBe('critical');
  });
  it('expiring tomorrow is critical', () => {
    const tomorrow = new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString();
    const r = resolveEssentialCreditsLevel(20, 30, tomorrow);
    expect(r.level).toBe('critical');
    expect(r.hint).toMatch(/tomorrow/i);
  });
  it('plenty of credits and time is ok', () => {
    const far = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    expect(resolveEssentialCreditsLevel(28, 30, far).level).toBe('ok');
  });
});

describe('Can buy another essential plan?', () => {
  it('active plan blocks repurchase', () => {
    expect(hasActiveEssentialPlan(status({ active: true }))).toBe(true);
  });
  it('inactive with leftover credits but valid end date still counts as active', () => {
    const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    expect(hasActiveEssentialPlan(status({ active: false, usageLeft: 4, endsAtUtc: future }))).toBe(true);
  });
  it('fully lapsed plan allows repurchase', () => {
    expect(hasActiveEssentialPlan(status({ active: false, usageLeft: 0, endsAtUtc: null }))).toBe(false);
  });
});
