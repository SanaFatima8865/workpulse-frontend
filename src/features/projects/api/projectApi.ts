import type { ApiResponse, PaginationMeta } from '@workpulse/shared';
import { apiClient } from '@/lib/apiClient';
import type { PublicProject } from '@/store/projectSlice';
import type { PublicClient } from '@/store/clientSlice';

const withWs = (wsId: string) => ({ headers: { 'X-Workspace-ID': wsId } });

// ─── Project API ──────────────────────────────────────────────────────────────

export interface CreateProjectPayload {
  name: string; type?: string; phase?: string; priority?: string; description?: string;
  address?: { street?: string; city?: string; state?: string; zip?: string };
  sqFootage?: number; buildingType?: string;
  clientId?: string; gcId?: string; architectId?: string;
  contractType?: string; deliveryMethod?: string;
  budget?: { originalContractValue?: number; contingency?: number; retainagePercent?: number };
  bidDueDate?: string; startDate?: string; plannedEndDate?: string;
  projectManagerId?: string; tags?: string[];
}

export interface ProjectsListResponse {
  data: PublicProject[]; meta: PaginationMeta; stats: Record<string, unknown>;
}

export const projectApi = {
  create:    (wsId: string, data: CreateProjectPayload) =>
    apiClient.post<ApiResponse<PublicProject>>('/projects', data, withWs(wsId)).then(r => r.data),
  getAll:    (wsId: string, params?: Record<string, unknown>) =>
    apiClient.get<ProjectsListResponse>('/projects', { ...withWs(wsId), params }).then(r => r.data),
  getById:   (projectId: string, wsId: string) =>
    apiClient.get<ApiResponse<PublicProject>>(`/projects/${projectId}`, withWs(wsId)).then(r => r.data),
  update:    (projectId: string, wsId: string, data: Partial<CreateProjectPayload> & Record<string, unknown>) =>
    apiClient.patch<ApiResponse<PublicProject>>(`/projects/${projectId}`, data, withWs(wsId)).then(r => r.data),
  delete:    (projectId: string, wsId: string) =>
    apiClient.delete<ApiResponse<null>>(`/projects/${projectId}`, withWs(wsId)).then(r => r.data),
  getDashboard: (wsId: string) =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/projects/dashboard', withWs(wsId)).then(r => r.data),
  addMember: (projectId: string, wsId: string, userId: string, role: string) =>
    apiClient.post<ApiResponse<PublicProject>>(`/projects/${projectId}/members`, { userId, role }, withWs(wsId)).then(r => r.data),
  removeMember: (projectId: string, userId: string, wsId: string) =>
    apiClient.delete<ApiResponse<null>>(`/projects/${projectId}/members/${userId}`, withWs(wsId)).then(r => r.data),
  addMilestone: (projectId: string, wsId: string, data: { name: string; dueDate: string; notes?: string }) =>
    apiClient.post<ApiResponse<PublicProject>>(`/projects/${projectId}/milestones`, data, withWs(wsId)).then(r => r.data),
  toggleMilestone: (projectId: string, milestoneId: string, wsId: string) =>
    apiClient.patch<ApiResponse<PublicProject>>(`/projects/${projectId}/milestones/${milestoneId}/toggle`, {}, withWs(wsId)).then(r => r.data),
};

// ─── Client API ───────────────────────────────────────────────────────────────

export interface CreateClientPayload {
  name: string; type?: string; status?: string; leadStatus?: string;
  taxId?: string; licenseNumber?: string; website?: string; email?: string; phone?: string;
  address?: { street?: string; city?: string; state?: string; zip?: string; country?: string };
  tags?: string[]; notes?: string; rating?: number;
  contacts?: Array<{ firstName: string; lastName: string; title?: string; email?: string; phone?: string; isPrimary?: boolean }>;
}

export const clientApi = {
  create:   (wsId: string, data: CreateClientPayload) =>
    apiClient.post<ApiResponse<PublicClient>>('/clients', data, withWs(wsId)).then(r => r.data),
  getAll:   (wsId: string, params?: Record<string, unknown>) =>
    apiClient.get<ApiResponse<PublicClient[]>>('/clients', { ...withWs(wsId), params }).then(r => r.data),
  getById:  (clientId: string, wsId: string) =>
    apiClient.get<ApiResponse<PublicClient>>(`/clients/${clientId}`, withWs(wsId)).then(r => r.data),
  update:   (clientId: string, wsId: string, data: Partial<CreateClientPayload>) =>
    apiClient.patch<ApiResponse<PublicClient>>(`/clients/${clientId}`, data, withWs(wsId)).then(r => r.data),
  delete:   (clientId: string, wsId: string) =>
    apiClient.delete<ApiResponse<null>>(`/clients/${clientId}`, withWs(wsId)).then(r => r.data),
  getStats: (wsId: string) =>
    apiClient.get<ApiResponse<Record<string, unknown>>>('/clients/stats', withWs(wsId)).then(r => r.data),
};
