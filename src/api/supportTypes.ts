export type SupportTicketSummary = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  createdBy: string;
};

export type SupportTicketMessage = {
  id: number;
  message: string;
  isFromAdmin: boolean;
  sentAtUtc: string;
  senderName: string;
};

export type SupportTicketDetail = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  status: string;
  createdAtUtc: string;
  updatedAtUtc: string | null;
  messages: SupportTicketMessage[];
};

export type CreateSupportTicketBody = {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
};
