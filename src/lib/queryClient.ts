import { QueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { ApiResponse } from '@workpulse/shared';

// ─── Error handler for queries ────────────────────────────────────────────────

const handleQueryError = (error: unknown) => {
  const axiosError = error as AxiosError<ApiResponse>;
  const message = axiosError.response?.data?.message ?? 'An unexpected error occurred';
  return message;
};

// ─── Query Client ─────────────────────────────────────────────────────────────

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutes stale time - data is considered fresh for this long
      staleTime: 5 * 60 * 1000,
      // 10 minutes cache time - data stays in cache even when no component uses it
      gcTime: 10 * 60 * 1000,
      // Retry failed requests 2 times (not on 4xx errors)
      retry: (failureCount, error) => {
        const axiosError = error as AxiosError;
        const status = axiosError.response?.status;
        // Don't retry client errors
        if (status && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus in production only
      refetchOnWindowFocus: import.meta.env.PROD,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: false,
      onError: (error) => {
        const message = handleQueryError(error);
        console.warn('Mutation error:', message);
      },
    },
  },
});

// ─── Query Key Factory ────────────────────────────────────────────────────────
// Centralized query keys prevent typos and enable precise cache invalidation

export const queryKeys = {
  // Auth
  auth: {
    me: () => ['auth', 'me'] as const,
  },

  // Users
  users: {
    all: () => ['users'] as const,
    list: (params: Record<string, unknown>) => ['users', 'list', params] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },

  // Workspaces
  workspaces: {
    all: () => ['workspaces'] as const,
    list: () => ['workspaces', 'list'] as const,
    detail: (id: string) => ['workspaces', 'detail', id] as const,
    members: (id: string) => ['workspaces', 'detail', id, 'members'] as const,
  },

  // Projects
  projects: {
    all: () => ['projects'] as const,
    list: (workspaceId: string, params?: Record<string, unknown>) =>
      ['projects', 'list', workspaceId, params] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    members: (id: string) => ['projects', 'detail', id, 'members'] as const,
    stats: (id: string) => ['projects', 'detail', id, 'stats'] as const,
  },

  // Boards
  boards: {
    all: () => ['boards'] as const,
    list: (projectId: string) => ['boards', 'list', projectId] as const,
    detail: (id: string) => ['boards', 'detail', id] as const,
  },

  // Tasks
  tasks: {
    all: () => ['tasks'] as const,
    list: (boardId: string, params?: Record<string, unknown>) =>
      ['tasks', 'list', boardId, params] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    comments: (id: string) => ['tasks', 'detail', id, 'comments'] as const,
    attachments: (id: string) => ['tasks', 'detail', id, 'attachments'] as const,
  },

  // Notifications
  notifications: {
    all: () => ['notifications'] as const,
    list: (params?: Record<string, unknown>) => ['notifications', 'list', params] as const,
    unreadCount: () => ['notifications', 'unread-count'] as const,
  },

  // Dashboard / Analytics
  dashboard: {
    overview: (workspaceId: string) => ['dashboard', 'overview', workspaceId] as const,
    projectHealth: (projectId: string) => ['dashboard', 'health', projectId] as const,
  },
} as const;
