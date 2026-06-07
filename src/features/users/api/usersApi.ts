import type { ApiResponse, UserProfile, PaginationMeta } from '@workpulse/shared';
import { apiClient } from '@/lib/apiClient';

export interface UserSearchResult {
  _id:       string;
  firstName: string;
  lastName:  string;
  email:     string;
  avatar?:   string;
  jobTitle?: string;
  role:      string;
}

export interface ActivityItem {
  _id:         string;
  workspaceId: string;
  userId:      string;
  type:        string;
  title:       string;
  description?: string;
  entityId?:   string;
  entityType?: string;
  createdAt:   string;
  user?: {
    _id:       string;
    firstName: string;
    lastName:  string;
    avatar?:   string;
  };
}

export const usersApi = {
  getWorkspaceUsers: (workspaceId: string, params?: { search?: string; page?: number; limit?: number }) =>
    apiClient.get<ApiResponse<UserProfile[]> & { meta: PaginationMeta }>(
      `/workspaces/${workspaceId}/users`, { params }
    ).then(r => r.data),

  getUserProfile: (workspaceId: string, userId: string) =>
    apiClient.get<ApiResponse<UserProfile>>(`/workspaces/${workspaceId}/users/${userId}`).then(r => r.data),

  searchUsers: (workspaceId: string, q: string, limit = 10) =>
    apiClient.get<ApiResponse<UserSearchResult[]>>(
      `/workspaces/${workspaceId}/users/search`, { params: { q, limit } }
    ).then(r => r.data),

  getActivityFeed: (workspaceId: string, params?: { page?: number; limit?: number; userId?: string }) =>
    apiClient.get<ApiResponse<ActivityItem[]> & { meta: PaginationMeta }>(
      `/workspaces/${workspaceId}/activity`, { params }
    ).then(r => r.data),
};
