import type { createApiClient } from './client';
import type {
  CreateSupportTicketBody,
  SupportTicketDetail,
  SupportTicketSummary,
} from './supportTypes';

export function createSupportApi(client: ReturnType<typeof createApiClient>) {
  return {
    listTickets() {
      return client.get<SupportTicketSummary[]>('/api/support-tickets');
    },

    getTicket(id: number) {
      return client.get<SupportTicketDetail>(`/api/support-tickets/${id}`);
    },

    createTicket(body: CreateSupportTicketBody) {
      return client.post<{ ticketId: number; message: string }>(
        '/api/support-tickets',
        body
      );
    },

    addMessage(ticketId: number, message: string) {
      return client.post<{ message: string }>(
        `/api/support-tickets/${ticketId}/messages`,
        { message }
      );
    },
  };
}
