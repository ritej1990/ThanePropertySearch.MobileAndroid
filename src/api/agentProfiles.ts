import type { createApiClient } from './client';
import type { AgentProfile } from './agentTypes';

export function createAgentProfilesApi(client: ReturnType<typeof createApiClient>) {
  return {
    getMe() {
      return client.get<AgentProfile>('/api/agent-profiles/me');
    },
  };
}
