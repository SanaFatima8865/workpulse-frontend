import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/usersApi';
import { useDebounce } from '@/hooks';

const USER_KEYS = {
  list:     (wsId: string, params?: object) => ['users', wsId, params] as const,
  profile:  (wsId: string, uid: string)     => ['users', wsId, uid] as const,
  search:   (wsId: string, q: string)       => ['users', wsId, 'search', q] as const,
  activity: (wsId: string, params?: object) => ['activity', wsId, params] as const,
};

export const useWorkspaceUsers = (
  workspaceId: string,
  params?: { search?: string; page?: number; limit?: number }
) =>
  useQuery({
    queryKey: USER_KEYS.list(workspaceId, params),
    queryFn:  () => usersApi.getWorkspaceUsers(workspaceId, params).then(r => r),
    enabled:  !!workspaceId,
    staleTime: 2 * 60 * 1000,
  });

export const useUserProfile = (workspaceId: string, userId: string) =>
  useQuery({
    queryKey: USER_KEYS.profile(workspaceId, userId),
    queryFn:  () => usersApi.getUserProfile(workspaceId, userId).then(r => r.data!),
    enabled:  !!(workspaceId && userId),
  });

export const useUserSearch = (workspaceId: string, query: string) => {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: USER_KEYS.search(workspaceId, debouncedQuery),
    queryFn:  () => usersApi.searchUsers(workspaceId, debouncedQuery).then(r => r.data ?? []),
    enabled:  !!(workspaceId && debouncedQuery.length >= 2),
    staleTime: 30 * 1000,
  });
};

export const useActivityFeed = (
  workspaceId: string,
  params?: { page?: number; limit?: number; userId?: string }
) =>
  useQuery({
    queryKey: USER_KEYS.activity(workspaceId, params),
    queryFn:  () => usersApi.getActivityFeed(workspaceId, params).then(r => r),
    enabled:  !!workspaceId,
    refetchInterval: 30 * 1000, // Refresh every 30s
  });
