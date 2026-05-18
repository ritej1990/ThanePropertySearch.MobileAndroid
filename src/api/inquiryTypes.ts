export type OwnerContact = {
  ownerName: string;
  email: string;
  phoneNumber: string;
};

export type ContactCreditsError = {
  error: string;
  remaining: number;
  packPriceInr: number;
  packCredits: number;
};

export type PropertyInquirySummary = {
  id: number;
  status: string;
  createdAtUtc: string;
  requestBy: string;
};

export type MyChatThread = {
  id: number;
  propertyId: number;
  propertyTitle: string;
  createdAtUtc: string;
  isOwner: boolean;
};

export type InquiryMessage = {
  id: number;
  sender: string;
  message: string;
  offerAmount: number | null;
  sentAtUtc: string;
};

export type InquiryThread = {
  id: number;
  propertyId: number;
  propertyTitle: string;
  createdAtUtc: string;
  isOwner: boolean;
};
