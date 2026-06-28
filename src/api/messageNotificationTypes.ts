/** Payload from SignalR `NewMessageAlert` and unread preview items. */
export type MessageAlertType =
  | 'inquiry'
  | 'inquiry_new'
  | 'inquiry_reply'
  | 'inquiry_approved'
  | 'support'
  | 'agent_lead';

export type MessageAlertPayload = {
  type?: MessageAlertType | string;
  messageId?: number;
  inquiryId?: number;
  propertyId?: number;
  propertyTitle?: string;
  ticketId?: number;
  leadId?: number;
  agentListingId?: number;
  subject?: string;
  sender?: string;
  senderRole?: string;
  message?: string;
  sentAtUtc?: string;
};

export type UnreadPreviewResponse = {
  count: number;
  items: MessageAlertPayload[];
};
