import type { PolicyKind } from '../content/policies';
import type { PaymentProduct } from '../services/paymentActivation';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Policy: { kind: PolicyKind };
  Home: undefined;
  OwnerDashboard: undefined;
  PostProperty: { listingId?: number } | undefined;
  BuilderProjectForm: { projectId?: number } | undefined;
  PropertyDetails: {
    propertyId: number;
    title?: string;
    /** When set to `agent`, loads `/api/agent-listings/{id}` instead of owner property. */
    listingSource?: 'property' | 'agent';
  };
  EssentialService: { returnPropertyId?: number } | undefined;
  ContactPackPurchase: { returnPropertyId?: number } | undefined;
  CashfreeCheckout: {
    product: 'essential' | 'contact_pack' | 'agent_publish' | 'builder_upload' | 'builder_leads' | 'agent_leads';
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
    product?: PaymentProduct;
    tierCode?: string;
    amountInr?: number;
    returnPropertyId?: number;
  };
  MyChats: undefined;
  SupportTickets: undefined;
  SupportTicketDetails: { ticketId: number; subject?: string };
  BuilderProjects: undefined;
  BuilderProjectDetails: { projectId: number; title?: string; manage?: boolean };
  BuilderDashboard: undefined;
  MyPayments: { essentialOnly?: boolean } | undefined;
  VisitRequests: { propertyId: number; title?: string };
  Profile: undefined;
  BuilderLeads: { projectId: number; projectName?: string };
  AgentDashboard: undefined;
  AgentPendingApproval: undefined;
  AgentPayments: undefined;
  BuilderPayments: undefined;
  InvoiceViewer: { paymentTransactionId: number; invoiceNumber?: string };
};
