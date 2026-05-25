import type { PolicyKind } from '../content/policies';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Policy: { kind: PolicyKind };
  Home: undefined;
  OwnerDashboard: undefined;
  PostProperty: undefined;
  PropertyDetails: { propertyId: number; title?: string };
  EssentialService: { returnPropertyId?: number } | undefined;
  ContactPackPurchase: { returnPropertyId?: number } | undefined;
  CashfreeCheckout: {
    product: 'essential' | 'contact_pack';
    paymentSessionId: string;
    orderId: string;
    environment: 'sandbox' | 'production';
    tierCode?: string;
    amountInr: number;
    returnPropertyId?: number;
  };
  PropertyChat: {
    propertyId: number;
    inquiryId: number;
    title?: string;
  };
  PropertyInquiries: {
    propertyId: number;
    title?: string;
  };
  PaymentReturn: {
    orderId?: string;
    order_id?: string;
    product?: 'essential' | 'contact_pack';
    tierCode?: string;
    amountInr?: number;
    returnPropertyId?: number;
  };
  MyChats: undefined;
  SupportTickets: undefined;
  SupportTicketDetails: { ticketId: number; subject?: string };
  BuilderProjects: undefined;
  BuilderProjectDetails: { projectId: number; title?: string };
  BuilderDashboard: undefined;
};
