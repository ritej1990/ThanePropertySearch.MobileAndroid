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
  endsAtUtc: string | null;
  tier: string | null;
  usageMax: number;
  usageUsed: number;
  usageLeft: number;
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
