export type PricingPlan = {
  code: string;
  priceInr: number;
  durationDays: number;
  maxUsage?: number;
  displayLabel: string;
};

export type PricingCatalog = {
  userEssentialPlans: PricingPlan[];
  userContactPack: {
    code: string;
    priceInr: number;
    credits: number;
    displayLabel: string;
  };
  paymentMethods: string[];
};

export type EssentialStatus = {
  active: boolean;
  /** True once the plan is unusable (date passed or credits exhausted) — matches Web's `expired`. */
  expired?: boolean;
  expiredReason?: 'date' | 'credits' | null;
  endsAtUtc: string | null;
  tier: string | null;
  usageMax: number;
  usageUsed: number;
  /** Raw remaining count — can stay >0 after expiry; prefer effectiveUsageLeft for display. */
  usageLeft: number;
  /** 0 once the plan is inactive, even if usageLeft is still >0. Matches Web's `effectiveUsageLeft`. */
  effectiveUsageLeft?: number;
  /** Separate contact-pack top-up — usable for revealing owner contact only. */
  contactRevealCreditsRemaining?: number;
};

export type ContactCredits = {
  remaining: number;
  usedInCurrentPack: number;
  packSize: number;
};

export type CashfreeOrderResponse = {
  paymentSessionId: string;
  orderId: string;
  environment: 'sandbox' | 'production';
};

export type ActivateEssentialResponse = {
  message: string;
  essentialEndsAtUtc: string;
  tier: string;
  displayLabel: string;
  amountPaid: number;
  durationDays: number;
  usageMax: number;
  usageUsed: number;
  usageLeft: number;
  paymentReference: string;
};

export type ActivateContactPackResponse = {
  message: string;
  contactCreditsRemaining: number;
  creditsAdded: number;
};
