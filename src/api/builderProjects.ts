import type { createApiClient } from './client';
import type {
  BuilderDashboardStats,
  BuilderLead,
  BuilderLeadBody,
  BuilderProjectDetail,
  BuilderProjectSummary,
  PagedResult,
  UpsertBuilderProjectRequest,
} from './builderTypes';
import {
  enrichBuilderProject,
  enrichBuilderProjectDetail,
} from '../utils/builderProject';

export type BuilderProjectListParams = {
  search?: string;
  page?: number;
  pageSize?: number;
};

function queryString(params?: BuilderProjectListParams): string {
  if (!params) return '';
  const q = new URLSearchParams();
  if (params.search?.trim()) q.set('search', params.search.trim());
  if (params.page != null) q.set('page', String(params.page));
  if (params.pageSize != null) q.set('pageSize', String(params.pageSize));
  const s = q.toString();
  return s ? `?${s}` : '';
}

function mapPagedItems(data: PagedResult<BuilderProjectSummary> | BuilderProjectSummary[]) {
  const items = Array.isArray(data) ? data : (data.items ?? []);
  return items.map((p) => enrichBuilderProject(p));
}

export function createBuilderProjectsApi(client: ReturnType<typeof createApiClient>) {
  return {
    async list(params?: BuilderProjectListParams) {
      const data = await client.get<PagedResult<BuilderProjectSummary>>(
        `/api/builder-projects${queryString(params)}`,
        { auth: false }
      );
      return mapPagedItems(data);
    },

    /** Builder-owned projects — GET /api/builder-projects/mine */
    async listMine(params?: Pick<BuilderProjectListParams, 'search' | 'page'>) {
      const q = new URLSearchParams();
      if (params?.search?.trim()) q.set('search', params.search.trim());
      if (params?.page != null) q.set('page', String(params.page));
      const qs = q.toString();
      const data = await client.get<PagedResult<BuilderProjectSummary>>(
        `/api/builder-projects/mine${qs ? `?${qs}` : ''}`
      );
      return mapPagedItems(data);
    },

    getMineStats() {
      return client.get<BuilderDashboardStats>('/api/builder-projects/mine/stats');
    },

    async getById(id: number) {
      const detail = await client.get<BuilderProjectDetail>(
        `/api/builder-projects/${id}`,
        { auth: true }
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

    create(body: UpsertBuilderProjectRequest) {
      return client.post<BuilderProjectDetail>('/api/builder-projects', body);
    },

    update(id: number, body: UpsertBuilderProjectRequest) {
      return client.put<BuilderProjectDetail>(`/api/builder-projects/${id}`, body);
    },
  };
}
