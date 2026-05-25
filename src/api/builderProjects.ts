import type { createApiClient } from './client';
import type {
  BuilderLead,
  BuilderLeadBody,
  BuilderProjectDetail,
  BuilderProjectSummary,
} from './builderTypes';
import {
  enrichBuilderProject,
  enrichBuilderProjectDetail,
} from '../utils/builderProject';

export type BuilderProjectListParams = {
  search?: string;
  area?: string;
};

function queryString(params?: BuilderProjectListParams): string {
  if (!params) return '';
  const q = new URLSearchParams();
  if (params.search?.trim()) q.set('search', params.search.trim());
  if (params.area?.trim()) q.set('area', params.area.trim());
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function createBuilderProjectsApi(client: ReturnType<typeof createApiClient>) {
  return {
    async list(params?: BuilderProjectListParams) {
      const data = await client.get<BuilderProjectSummary[]>(
        `/api/builder-projects${queryString(params)}`,
        { auth: false }
      );
      return data.map((p) => enrichBuilderProject(p));
    },

    /** Builder-owned projects (requires Builder role JWT). */
    async listMine() {
      const data = await client.get<BuilderProjectSummary[]>(
        '/api/builder-projects?mine=true'
      );
      return data.map((p) => enrichBuilderProject(p));
    },

    async getById(id: number) {
      const detail = await client.get<BuilderProjectDetail>(
        `/api/builder-projects/${id}`,
        { auth: false }
      );
      return enrichBuilderProjectDetail(detail);
    },

    submitLead(projectId: number, body: BuilderLeadBody) {
      return client.post<{ message: string }>(
        `/api/builder-projects/${projectId}/leads`,
        body,
        { auth: false }
      );
    },

    getLeads(projectId: number) {
      return client.get<BuilderLead[]>(`/api/builder-projects/${projectId}/leads`);
    },
  };
}
