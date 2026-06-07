import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@workpulse/shared';
import { useAppDispatch, useAppSelector } from '@/store';
import { setTeams, addTeam, updateTeamInList, removeTeam, selectTeams } from '@/store/teamSlice';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { teamApi } from '../api/teamApi';
import type { CreateTeamPayload, UpdateTeamPayload, UsersQueryParams } from '../api/teamApi';

const errMsg = (e: unknown) => { const ax = e as AxiosError<ApiResponse>; return ax.response?.data?.message ?? 'Something went wrong'; };
const useWsId = () => useAppSelector(selectActiveWorkspace)?._id ?? '';

export const useTeams = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const cached = useAppSelector(selectTeams);
  return useQuery({ queryKey: ['teams', wsId], queryFn: async () => { if (!wsId) return []; const res = await teamApi.getAll(wsId); const list = res.data ?? []; dispatch(setTeams(list)); return list; }, enabled: !!wsId, staleTime: 5*60*1000, initialData: cached.length > 0 ? cached : undefined });
};

export const useTeam = (teamId: string) => {
  const wsId = useWsId();
  return useQuery({ queryKey: ['teams', wsId, teamId], queryFn: async () => { const res = await teamApi.getById(teamId, wsId); return res.data!; }, enabled: !!wsId && !!teamId });
};

export const useCreateTeam = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({ mutationFn: (data: CreateTeamPayload) => teamApi.create(wsId, data), onSuccess: (res) => { dispatch(addTeam(res.data!)); qc.invalidateQueries({ queryKey: ['teams', wsId] }); toast.success(`Team "${res.data!.name}" created`); }, onError: (e) => toast.error(errMsg(e)) });
};

export const useUpdateTeam = (teamId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({ mutationFn: (data: UpdateTeamPayload) => teamApi.update(teamId, data, wsId), onSuccess: (res) => { dispatch(updateTeamInList(res.data!)); qc.setQueryData(['teams', wsId, teamId], res.data); toast.success('Team updated'); }, onError: (e) => toast.error(errMsg(e)) });
};

export const useDeleteTeam = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => teamApi.delete(id, wsId), onSuccess: (_, id) => { dispatch(removeTeam(id)); qc.invalidateQueries({ queryKey: ['teams', wsId] }); toast.success('Team deleted'); }, onError: (e) => toast.error(errMsg(e)) });
};

export const useTeamMembers = (teamId: string) => {
  const wsId = useWsId();
  return useQuery({ queryKey: ['teams', wsId, teamId, 'members'], queryFn: async () => { const res = await teamApi.getMembers(teamId, wsId); return res.data ?? []; }, enabled: !!wsId && !!teamId });
};

export const useAddTeamMember = (teamId: string) => {
  const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({ mutationFn: ({ userId, role }: { userId: string; role: 'lead'|'member' }) => teamApi.addMember(teamId, userId, role, wsId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams', wsId, teamId, 'members'] }); toast.success('Member added'); }, onError: (e) => toast.error(errMsg(e)) });
};

export const useUpdateTeamMemberRole = (teamId: string) => {
  const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({ mutationFn: ({ userId, role }: { userId: string; role: 'lead'|'member' }) => teamApi.updateRole(teamId, userId, role, wsId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams', wsId, teamId, 'members'] }); toast.success('Role updated'); }, onError: (e) => toast.error(errMsg(e)) });
};

export const useRemoveTeamMember = (teamId: string) => {
  const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({ mutationFn: (userId: string) => teamApi.removeMember(teamId, userId, wsId), onSuccess: () => { qc.invalidateQueries({ queryKey: ['teams', wsId, teamId, 'members'] }); toast.success('Member removed'); }, onError: (e) => toast.error(errMsg(e)) });
};

export const useWorkspaceUsers = (params?: UsersQueryParams) => {
  const wsId = useWsId();
  return useQuery({ queryKey: ['users', wsId, params], queryFn: async () => { const res = await teamApi.getUsers(wsId, params); return res.data ?? []; }, enabled: !!wsId, staleTime: 3*60*1000 });
};

export const useUserProfile = (userId: string) => {
  const wsId = useWsId();
  return useQuery({ queryKey: ['users', wsId, userId, 'profile'], queryFn: async () => { const res = await teamApi.getUserProfile(userId, wsId); return res.data!; }, enabled: !!wsId && !!userId });
};
