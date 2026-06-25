import type { createApiClient } from './client';
import type { AgentLead } from './agentTypes';

export function createAgentLeadsApi(client: ReturnType<typeof createApiClient>) {
  return {
    listMine() {
      return client.get<AgentLead[]>('/api/agent-listings/leads');
    },
  };
}
