import type { ApiResponse } from '@workpulse/shared';
import { apiClient } from '@/lib/apiClient';
import type { PublicBoard } from '@/store/boardSlice';
import type { PublicTask } from '@/store/boardSlice';

const withWs = (wsId: string) => ({ headers: { 'X-Workspace-ID': wsId } });

// ─── Board API ────────────────────────────────────────────────────────────────

export const boardApi = {
  create: (wsId: string, data: { name: string; projectId: string }) =>
    apiClient.post<ApiResponse<PublicBoard>>('/boards', data, withWs(wsId)).then(r => r.data),

  getByProject: (projectId: string, wsId: string) =>
    apiClient.get<ApiResponse<PublicBoard[]>>(`/boards/project/${projectId}`, withWs(wsId)).then(r => r.data),

  getDefaultForProject: (projectId: string, wsId: string) =>
    apiClient.get<ApiResponse<PublicBoard>>(`/boards/project/${projectId}/default`, withWs(wsId)).then(r => r.data),

  getById: (boardId: string, wsId: string) =>
    apiClient.get<ApiResponse<PublicBoard>>(`/boards/${boardId}`, withWs(wsId)).then(r => r.data),

  update: (boardId: string, wsId: string, data: Partial<PublicBoard>) =>
    apiClient.patch<ApiResponse<PublicBoard>>(`/boards/${boardId}`, data, withWs(wsId)).then(r => r.data),

  addGroup: (boardId: string, wsId: string, data: { name: string; color?: string }) =>
    apiClient.post<ApiResponse<PublicBoard>>(`/boards/${boardId}/groups`, data, withWs(wsId)).then(r => r.data),

  updateGroup: (boardId: string, groupId: string, wsId: string, data: { name?: string; color?: string; isCollapsed?: boolean }) =>
    apiClient.patch<ApiResponse<PublicBoard>>(`/boards/${boardId}/groups/${groupId}`, data, withWs(wsId)).then(r => r.data),

  deleteGroup: (boardId: string, groupId: string, wsId: string) =>
    apiClient.delete<ApiResponse<null>>(`/boards/${boardId}/groups/${groupId}`, withWs(wsId)).then(r => r.data),
};

// ─── Task API ─────────────────────────────────────────────────────────────────

export interface CreateTaskPayload {
  title: string; boardId: string; groupId: string; projectId: string;
  description?: string; priority?: string; assigneeIds?: string[];
  dueDate?: string; estimatedHours?: number; tags?: string[]; labels?: string[];
}

export interface UpdateTaskPayload {
  title?: string; description?: string; priority?: string; status?: string;
  groupId?: string; assigneeIds?: string[];
  dueDate?: string | null; startDate?: string | null;
  estimatedHours?: number; tags?: string[]; position?: number;
  customFieldValues?: Array<{ fieldId: string; value: unknown }>;
}

export const taskApi = {
  create: (wsId: string, data: CreateTaskPayload) =>
    apiClient.post<ApiResponse<PublicTask>>('/boards/tasks', data, withWs(wsId)).then(r => r.data),

  getByBoard: (boardId: string, wsId: string) =>
    apiClient.get<ApiResponse<Record<string, PublicTask[]>>>(`/boards/tasks/board/${boardId}`, withWs(wsId)).then(r => r.data),

  getById: (taskId: string, wsId: string) =>
    apiClient.get<ApiResponse<PublicTask>>(`/boards/tasks/${taskId}`, withWs(wsId)).then(r => r.data),

  getMyTasks: (wsId: string, params?: { status?: string; dueDate?: string }) =>
    apiClient.get<ApiResponse<PublicTask[]>>('/boards/tasks/my', { ...withWs(wsId), params }).then(r => r.data),

  update: (taskId: string, wsId: string, data: UpdateTaskPayload) =>
    apiClient.patch<ApiResponse<PublicTask>>(`/boards/tasks/${taskId}`, data, withWs(wsId)).then(r => r.data),

  move: (taskId: string, wsId: string, data: { targetGroupId: string; targetPosition: number; sourceGroupId?: string }) =>
    apiClient.post<ApiResponse<PublicTask>>(`/boards/tasks/${taskId}/move`, data, withWs(wsId)).then(r => r.data),

  delete: (taskId: string, wsId: string) =>
    apiClient.delete<ApiResponse<null>>(`/boards/tasks/${taskId}`, withWs(wsId)).then(r => r.data),

  addComment: (taskId: string, wsId: string, content: string) =>
    apiClient.post<ApiResponse<PublicTask>>(`/boards/tasks/${taskId}/comments`, { content }, withWs(wsId)).then(r => r.data),

  updateComment: (taskId: string, commentId: string, wsId: string, content: string) =>
    apiClient.patch<ApiResponse<PublicTask>>(`/boards/tasks/${taskId}/comments/${commentId}`, { content }, withWs(wsId)).then(r => r.data),

  deleteComment: (taskId: string, commentId: string, wsId: string) =>
    apiClient.delete<ApiResponse<PublicTask>>(`/boards/tasks/${taskId}/comments/${commentId}`, withWs(wsId)).then(r => r.data),

  logTime: (taskId: string, wsId: string, data: { hours: number; description?: string; date: string }) =>
    apiClient.post<ApiResponse<PublicTask>>(`/boards/tasks/${taskId}/time`, data, withWs(wsId)).then(r => r.data),

  getStats: (projectId: string, wsId: string) =>
    apiClient.get<ApiResponse<Record<string, unknown>>>(`/boards/tasks/stats/${projectId}`, withWs(wsId)).then(r => r.data),
};
