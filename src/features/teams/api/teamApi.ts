import type { ApiResponse, PaginationMeta } from '@workpulse/shared';
import { apiClient } from '@/lib/apiClient';
import type { PublicTeam } from '@/store/teamSlice';

export interface TeamMemberPublic {
  userId: string; role: 'lead' | 'member'; joinedAt: string;
  user: { _id: string; firstName: string; lastName: string; email: string; avatar?: string; jobTitle?: string; status: string };
}

export interface WorkspaceUserPublic {
  _id: string; firstName: string; lastName: string; email: string; avatar?: string;
  jobTitle?: string; bio?: string; timezone?: string; status: string; createdAt: string;
  workspaceRole: 'owner' | 'admin' | 'member' | 'guest'; joinedAt?: string;
}

export interface UserProfilePublic extends WorkspaceUserPublic {
  sharedTeams: Array<{ _id: string; name: string; color: string; icon: string }>;
}

export interface CreateTeamPayload { name: string; description?: string; color?: string; icon?: string; memberIds?: string[] }
export interface UpdateTeamPayload { name?: string; description?: string; color?: string; icon?: string }
export interface UsersQueryParams  { search?: string; role?: string; teamId?: string; page?: number; limit?: number }

const withWs = (wsId: string) => ({ headers: { 'X-Workspace-ID': wsId } });

export const teamApi = {
  create:       (wsId: string, data: CreateTeamPayload) =>
    apiClient.post<ApiResponse<PublicTeam>>('/teams', data, withWs(wsId)).then(r => r.data),
  getAll:       (wsId: string) =>
    apiClient.get<ApiResponse<PublicTeam[]>>('/teams', withWs(wsId)).then(r => r.data),
  getById:      (teamId: string, wsId: string) =>
    apiClient.get<ApiResponse<PublicTeam>>(`/teams/${teamId}`, withWs(wsId)).then(r => r.data),
  update:       (teamId: string, data: UpdateTeamPayload, wsId: string) =>
    apiClient.patch<ApiResponse<PublicTeam>>(`/teams/${teamId}`, data, withWs(wsId)).then(r => r.data),
  delete:       (teamId: string, wsId: string) =>
    apiClient.delete<ApiResponse<null>>(`/teams/${teamId}`, withWs(wsId)).then(r => r.data),
  getMembers:   (teamId: string, wsId: string) =>
    apiClient.get<ApiResponse<TeamMemberPublic[]>>(`/teams/${teamId}/members`, withWs(wsId)).then(r => r.data),
  addMember:    (teamId: string, userId: string, role: 'lead'|'member', wsId: string) =>
    apiClient.post<ApiResponse<PublicTeam>>(`/teams/${teamId}/members`, { userId, role }, withWs(wsId)).then(r => r.data),
  updateRole:   (teamId: string, userId: string, role: 'lead'|'member', wsId: string) =>
    apiClient.patch<ApiResponse<PublicTeam>>(`/teams/${teamId}/members/${userId}`, { role }, withWs(wsId)).then(r => r.data),
  removeMember: (teamId: string, userId: string, wsId: string) =>
    apiClient.delete<ApiResponse<null>>(`/teams/${teamId}/members/${userId}`, withWs(wsId)).then(r => r.data),
  getUsers:     (wsId: string, params?: UsersQueryParams) =>
    apiClient.get<ApiResponse<WorkspaceUserPublic[]>>('/teams/users/directory', { ...withWs(wsId), params }).then(r => r.data),
  getUserProfile: (userId: string, wsId: string) =>
    apiClient.get<ApiResponse<UserProfilePublic>>(`/teams/users/${userId}`, withWs(wsId)).then(r => r.data),
};
