import type { createApiClient } from './client';
import type { AgentProfile, ResubmitAgentProfileBody, UpdateAgentProfileBody } from './agentTypes';

export function createAgentProfilesApi(client: ReturnType<typeof createApiClient>) {
  return {
    getMe() {
      return client.get<AgentProfile>('/api/agent-profiles/me');
    },

    updateMe(body: UpdateAgentProfileBody) {
      return client.put<AgentProfile>('/api/agent-profiles/me', body);
    },

    resubmitMe(body: ResubmitAgentProfileBody) {
      return client.post<AgentProfile>('/api/agent-profiles/me/resubmit', body);
    },
  };
}
