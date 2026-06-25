import type { createApiClient } from './client';
import { ApiError } from './client';
import type {
  AgentListingDetails,
  AgentListingSummary,
  CreateAgentListingRequest,
} from './agentTypes';

type AgentMinePayload =
  | AgentListingSummary[]
  | {
      items?: AgentListingSummary[] | null;
      listings?: AgentListingSummary[] | null;
      data?: AgentListingSummary[] | null;
      results?: AgentListingSummary[] | null;
    };

function toListings(payload: AgentMinePayload): AgentListingSummary[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.listings)) return payload.listings;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.results)) return payload.results;
  return [];
}

export function createAgentListingsApi(client: ReturnType<typeof createApiClient>) {
  return {
    async listMine() {
      // Web uses a richer listing source (all statuses incl. hidden/rejected).
      // Keep mobile in sync by trying the same route with common query variants.
      const candidates = [
        '/api/agent-listings/mine?includeHidden=true&includeAllStatuses=true',
        '/api/agent-listings/mine?includeAllStatuses=true',
        '/api/agent-listings/mine',
      ] as const;

      let lastError: unknown;
      for (const path of candidates) {
        try {
          const payload = await client.get<AgentMinePayload>(path);
          return toListings(payload);
        } catch (e) {
          lastError = e;
          // If query params are unsupported on older API, fall through.
          if (e instanceof ApiError && e.status === 404) {
            continue;
          }
          throw e;
        }
      }

      if (lastError) throw lastError;
      return [];
    },

    create(body: CreateAgentListingRequest) {
      return client.post<AgentListingDetails>('/api/agent-listings', body);
    },

    update(id: number, body: CreateAgentListingRequest) {
      return client.put<AgentListingDetails>(`/api/agent-listings/${id}`, body);
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
