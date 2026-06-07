import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@workpulse/shared';
import { useAppDispatch, useAppSelector } from '@/store';
import { setProjects, addProject, updateProject, removeProject, selectProjects } from '@/store/projectSlice';
import { setClients, addClient, updateClient, removeClient, selectClients } from '@/store/clientSlice';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { projectApi, clientApi } from '../api/projectApi';
import type { CreateProjectPayload, CreateClientPayload } from '../api/projectApi';

const errMsg = (e: unknown) => { const ax = e as AxiosError<ApiResponse>; return ax.response?.data?.message ?? 'Something went wrong'; };
const useWsId = () => useAppSelector(selectActiveWorkspace)?._id ?? '';

// ─── Projects ─────────────────────────────────────────────────────────────────

export const useProjects = (params?: Record<string, unknown>) => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const cached = useAppSelector(selectProjects);
  return useQuery({
    queryKey: ['projects', wsId, params],
    queryFn: async () => {
      if (!wsId) return [];
      const res = await projectApi.getAll(wsId, params);
      dispatch(setProjects(res.data ?? []));
      return res.data ?? [];
    },
    enabled: !!wsId, staleTime: 2 * 60 * 1000,
    initialData: cached.length > 0 && !params ? cached : undefined,
  });
};

export const useProject = (projectId: string) => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['projects', wsId, projectId],
    queryFn: async () => { const res = await projectApi.getById(projectId, wsId); return res.data!; },
    enabled: !!wsId && !!projectId,
  });
};

export const useProjectDashboard = () => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['projects', wsId, 'dashboard'],
    queryFn: async () => { const res = await projectApi.getDashboard(wsId); return res.data!; },
    enabled: !!wsId, staleTime: 60 * 1000,
  });
};

export const useCreateProject = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProjectPayload) => projectApi.create(wsId, data),
    onSuccess: (res) => {
      dispatch(addProject(res.data!));
      qc.invalidateQueries({ queryKey: ['projects', wsId] });
      toast.success(`Project "${res.data!.name}" created (${res.data!.jobNumber})`);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useUpdateProject = (projectId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateProjectPayload> & Record<string, unknown>) => projectApi.update(projectId, wsId, data),
    onSuccess: (res) => {
      dispatch(updateProject(res.data!));
      qc.setQueryData(['projects', wsId, projectId], res.data);
      toast.success('Project updated');
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useDeleteProject = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => projectApi.delete(id, wsId),
    onSuccess: (_, id) => { dispatch(removeProject(id)); qc.invalidateQueries({ queryKey: ['projects', wsId] }); toast.success('Project deleted'); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useAddProjectMember = (projectId: string) => {
  const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => projectApi.addMember(projectId, wsId, userId, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects', wsId, projectId] }); toast.success('Member added'); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useToggleMilestone = (projectId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (milestoneId: string) => projectApi.toggleMilestone(projectId, milestoneId, wsId),
    onSuccess: (res) => { dispatch(updateProject(res.data!)); qc.setQueryData(['projects', wsId, projectId], res.data); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useAddMilestone = (projectId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useMutation({
    mutationFn: (data: { name: string; dueDate: string; notes?: string }) => projectApi.addMilestone(projectId, wsId, data),
    onSuccess: (res) => { dispatch(updateProject(res.data!)); toast.success('Milestone added'); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── Clients ──────────────────────────────────────────────────────────────────

export const useClients = (params?: Record<string, unknown>) => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const cached = useAppSelector(selectClients);
  return useQuery({
    queryKey: ['clients', wsId, params],
    queryFn: async () => {
      if (!wsId) return [];
      const res = await clientApi.getAll(wsId, params);
      dispatch(setClients(res.data ?? []));
      return res.data ?? [];
    },
    enabled: !!wsId, staleTime: 5 * 60 * 1000,
    initialData: cached.length > 0 && !params ? cached : undefined,
  });
};

export const useClient = (clientId: string) => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['clients', wsId, clientId],
    queryFn: async () => { const res = await clientApi.getById(clientId, wsId); return res.data!; },
    enabled: !!wsId && !!clientId,
  });
};

export const useClientStats = () => {
  const wsId = useWsId();
  return useQuery({ queryKey: ['clients', wsId, 'stats'], queryFn: async () => { const res = await clientApi.getStats(wsId); return res.data!; }, enabled: !!wsId });
};

export const useCreateClient = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateClientPayload) => clientApi.create(wsId, data),
    onSuccess: (res) => { dispatch(addClient(res.data!)); qc.invalidateQueries({ queryKey: ['clients', wsId] }); toast.success(`Client "${res.data!.name}" added`); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useUpdateClient = (clientId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CreateClientPayload>) => clientApi.update(clientId, wsId, data),
    onSuccess: (res) => { dispatch(updateClient(res.data!)); qc.setQueryData(['clients', wsId, clientId], res.data); toast.success('Client updated'); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useDeleteClient = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientApi.delete(id, wsId),
    onSuccess: (_, id) => { dispatch(removeClient(id)); qc.invalidateQueries({ queryKey: ['clients', wsId] }); toast.success('Client removed'); },
    onError: (e) => toast.error(errMsg(e)),
  });
};
