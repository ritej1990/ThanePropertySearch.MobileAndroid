import type { createApiClient } from './client';
import { ApiError } from './client';
import type {
  AgentListingDetails,
  AgentListingSummary,
  CreateAgentListingRequest,
} from './agentTypes';

export function createAgentListingsApi(client: ReturnType<typeof createApiClient>) {
  return {
    listMine() {
      return client.get<AgentListingSummary[]>('/api/agent-listings/mine');
    },

    create(body: CreateAgentListingRequest) {
      return client.post<AgentListingDetails>('/api/agent-listings', body);
    },

    /** Agent owner / admin — includes pending & unpublished listings. */
    getById(id: number) {
      return client.get<AgentListingDetails>(`/api/agent-listings/${id}`);
    },

    /** Public approved listings only. */
    getPublicById(id: number) {
      return client.get<AgentListingDetails>(`/api/agent-listings/public/${id}`, {
        auth: false,
      });
    },

    /** Authenticated first, then public fallback for search / shared links. */
    async resolveById(id: number) {
      try {
        return await client.get<AgentListingDetails>(`/api/agent-listings/${id}`);
      } catch (e) {
        if (e instanceof ApiError && (e.status === 401 || e.status === 403 || e.status === 404)) {
          return client.get<AgentListingDetails>(`/api/agent-listings/public/${id}`, {
            auth: false,
          });
        }
        throw e;
      }
    },
  };
}
