export type PaymentTransaction = {
  id: number;
  amount: number;
  currency: string;
  paymentMethod: string;
  productType: string;
  status: string;
  tierCode: string;
  propertyListingId: number | null;
  payerReferenceNote: string | null;
  createdAtUtc: string;
  completedAtUtc: string | null;
};
