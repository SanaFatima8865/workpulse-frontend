import type { ApiResponse } from '@workpulse/shared';

import { apiClient } from '@/lib/apiClient';
import type { PublicWorkspace } from '@workpulse/shared';

// ─── Local types (not in shared yet) ─────────────────────────────────────────

export interface WorkspaceMemberPublic {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
  joinedAt: string;
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    jobTitle?: string;
  };
}

export interface PublicInvitation {
  _id: string;
  workspaceId: string;
  email: string;
  role: 'admin' | 'member' | 'guest';
  invitedBy: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  createdAt: string;
}

export interface CreateWorkspacePayload {
  name: string;
  description?: string;
  slug?: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
  description?: string;
  logo?: string;
  coverColor?: string;
  settings?: {
    defaultProjectView?: 'board' | 'list' | 'table' | 'timeline';
    allowGuestAccess?: boolean;
    requireApprovalForMaterialRequests?: boolean;
    timezone?: string;
    dateFormat?: string;
    currency?: string;
  };
}

export interface InviteMemberPayload {
  email: string;
  role?: 'admin' | 'member' | 'guest';
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const workspaceApi = {
  // ── CRUD ───────────────────────────────────────────────────────────────────

  create: (data: CreateWorkspacePayload) =>
    apiClient
      .post<ApiResponse<PublicWorkspace>>('/workspaces', data)
      .then((r) => r.data),

  getAll: () =>
    apiClient
      .get<ApiResponse<PublicWorkspace[]>>('/workspaces')
      .then((r) => r.data),

  getById: (id: string) =>
    apiClient
      .get<ApiResponse<PublicWorkspace>>(`/workspaces/${id}`)
      .then((r) => r.data),

  update: (id: string, data: UpdateWorkspacePayload) =>
    apiClient
      .patch<ApiResponse<PublicWorkspace>>(`/workspaces/${id}`, data)
      .then((r) => r.data),

  delete: (id: string) =>
    apiClient
      .delete<ApiResponse<null>>(`/workspaces/${id}`)
      .then((r) => r.data),

  // ── Members ────────────────────────────────────────────────────────────────

  getMembers: (id: string) =>
    apiClient
      .get<ApiResponse<WorkspaceMemberPublic[]>>(`/workspaces/${id}/members`)
      .then((r) => r.data),

  updateMemberRole: (workspaceId: string, userId: string, role: string) =>
    apiClient
      .patch<ApiResponse<PublicWorkspace>>(`/workspaces/${workspaceId}/members/${userId}`, { role })
      .then((r) => r.data),

  removeMember: (workspaceId: string, userId: string) =>
    apiClient
      .delete<ApiResponse<null>>(`/workspaces/${workspaceId}/members/${userId}`)
      .then((r) => r.data),

  // ── Invitations ────────────────────────────────────────────────────────────

  invite: (workspaceId: string, data: InviteMemberPayload) =>
    apiClient
      .post<ApiResponse<PublicInvitation>>(`/workspaces/${workspaceId}/invitations`, data)
      .then((r) => r.data),

  getInvitations: (workspaceId: string) =>
    apiClient
      .get<ApiResponse<PublicInvitation[]>>(`/workspaces/${workspaceId}/invitations`)
      .then((r) => r.data),

  revokeInvitation: (workspaceId: string, invitationId: string) =>
    apiClient
      .delete<ApiResponse<null>>(`/workspaces/${workspaceId}/invitations/${invitationId}`)
      .then((r) => r.data),

  acceptInvitation: (token: string) =>
    apiClient
      .post<ApiResponse<PublicWorkspace>>('/workspaces/invitations/accept', { token })
      .then((r) => r.data),

  // ── Ownership ──────────────────────────────────────────────────────────────

  transferOwnership: (workspaceId: string, newOwnerId: string) =>
    apiClient
      .post<ApiResponse<PublicWorkspace>>(`/workspaces/${workspaceId}/transfer`, { newOwnerId })
      .then((r) => r.data),
};
