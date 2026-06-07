import { useQuery } from '@tanstack/react-query';
import { useAppSelector } from '@/store';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { analyticsApi } from '../api/analyticsApi';

const useWsId = () => useAppSelector(selectActiveWorkspace)?._id ?? '';

export const useDashboard = () => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['analytics', wsId, 'dashboard'],
    queryFn:  () => analyticsApi.getDashboard(wsId).then(r => r.data!),
    enabled:  !!wsId,
    staleTime: 60 * 1000,           // 1 min
    refetchInterval: 5 * 60 * 1000, // auto-refresh every 5 min
  });
};

export const useVelocity = (days = 14) => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['analytics', wsId, 'velocity', days],
    queryFn:  () => analyticsApi.getVelocity(wsId, days).then(r => r.data!),
    enabled:  !!wsId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useWorkload = () => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['analytics', wsId, 'workload'],
    queryFn:  () => analyticsApi.getWorkload(wsId).then(r => r.data!),
    enabled:  !!wsId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useHealthBreakdown = () => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['analytics', wsId, 'health'],
    queryFn:  () => analyticsApi.getHealth(wsId).then(r => r.data!),
    enabled:  !!wsId,
    staleTime: 2 * 60 * 1000,
  });
};

export const useCrmFunnel = () => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['analytics', wsId, 'crm-funnel'],
    queryFn:  () => analyticsApi.getCrmFunnel(wsId).then(r => r.data!),
    enabled:  !!wsId,
  });
};

export const useAiInsights = () => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['analytics', wsId, 'insights'],
    queryFn:  () => analyticsApi.getInsights(wsId).then(r => r.data!),
    enabled:  !!wsId,
    staleTime: 3 * 60 * 1000,
  });
};
