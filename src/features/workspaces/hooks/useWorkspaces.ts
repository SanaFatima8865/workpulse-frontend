import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

import type { ApiResponse } from '@workpulse/shared';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  setWorkspaces,
  addWorkspace,
  setActiveWorkspace,
  updateWorkspaceInList,
  removeWorkspace,
  selectActiveWorkspace,
  selectWorkspaces,
} from '@/store/workspaceSlice';
import { setActiveWorkspace as setUiWorkspace } from '@/store/uiSlice';
import { queryKeys } from '@/lib/queryClient';
import { workspaceApi } from '../api/workspaceApi';
import type {
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  InviteMemberPayload,
} from '../api/workspaceApi';

// ─── Error helper ─────────────────────────────────────────────────────────────

const errMsg = (e: unknown) => {
  const ax = e as AxiosError<ApiResponse>;
  return ax.response?.data?.message ?? 'Something went wrong';
};

// ─── useWorkspaces ────────────────────────────────────────────────────────────

export const useWorkspaces = () => {
  const dispatch = useAppDispatch();
  const workspaces = useAppSelector(selectWorkspaces);

  return useQuery({
    queryKey: queryKeys.workspaces.list(),
    queryFn: async () => {
      const res = await workspaceApi.getAll();
      const list = res.data ?? [];
      dispatch(setWorkspaces(list));
      return list;
    },
    staleTime: 5 * 60 * 1000,
    initialData: workspaces.length > 0 ? workspaces : undefined,
  });
};

// ─── useWorkspace (single) ────────────────────────────────────────────────────

export const useWorkspace = (id: string) => {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(id),
    queryFn: async () => {
      const res = await workspaceApi.getById(id);
      return res.data!;
    },
    enabled: !!id,
  });
};

// ─── useCreateWorkspace ───────────────────────────────────────────────────────

export const useCreateWorkspace = () => {
  const dispatch    = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWorkspacePayload) => workspaceApi.create(data),
    onSuccess: (res) => {
      const workspace = res.data!;
      dispatch(addWorkspace(workspace));
      dispatch(setUiWorkspace(workspace._id));
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.list() });
      toast.success(`Workspace "${workspace.name}" created!`);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── useUpdateWorkspace ───────────────────────────────────────────────────────

export const useUpdateWorkspace = (workspaceId: string) => {
  const dispatch    = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWorkspacePayload) => workspaceApi.update(workspaceId, data),
    onSuccess: (res) => {
      const workspace = res.data!;
      dispatch(updateWorkspaceInList(workspace));
      queryClient.setQueryData(queryKeys.workspaces.detail(workspaceId), workspace);
      toast.success('Workspace settings saved');
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── useDeleteWorkspace ───────────────────────────────────────────────────────

export const useDeleteWorkspace = () => {
  const dispatch    = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => workspaceApi.delete(id),
    onSuccess: (_, id) => {
      dispatch(removeWorkspace(id));
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.list() });
      toast.success('Workspace deleted');
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── useSwitchWorkspace ───────────────────────────────────────────────────────

export const useSwitchWorkspace = () => {
  const dispatch  = useAppDispatch();
  const workspaces = useAppSelector(selectWorkspaces);

  return (workspaceId: string) => {
    const workspace = workspaces.find((w) => w._id === workspaceId);
    if (workspace) {
      dispatch(setActiveWorkspace(workspace));
      dispatch(setUiWorkspace(workspaceId));
    }
  };
};

// ─── useWorkspaceMembers ──────────────────────────────────────────────────────

export const useWorkspaceMembers = (workspaceId: string) => {
  return useQuery({
    queryKey: queryKeys.workspaces.members(workspaceId),
    queryFn: async () => {
      const res = await workspaceApi.getMembers(workspaceId);
      return res.data ?? [];
    },
    enabled: !!workspaceId,
  });
};

// ─── useUpdateMemberRole ──────────────────────────────────────────────────────

export const useUpdateMemberRole = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      workspaceApi.updateMemberRole(workspaceId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId) });
      toast.success('Member role updated');
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── useRemoveMember ─────────────────────────────────────────────────────────

export const useRemoveMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => workspaceApi.removeMember(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId) });
      toast.success('Member removed');
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── useInviteMember ──────────────────────────────────────────────────────────

export const useInviteMember = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: InviteMemberPayload) => workspaceApi.invite(workspaceId, data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId) });
      toast.success(`Invitation sent to ${res.data?.email}`);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── useWorkspaceInvitations ──────────────────────────────────────────────────

export const useWorkspaceInvitations = (workspaceId: string) => {
  return useQuery({
    queryKey: [...queryKeys.workspaces.members(workspaceId), 'invitations'],
    queryFn: async () => {
      const res = await workspaceApi.getInvitations(workspaceId);
      return res.data ?? [];
    },
    enabled: !!workspaceId,
  });
};

// ─── useRevokeInvitation ──────────────────────────────────────────────────────

export const useRevokeInvitation = (workspaceId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: string) =>
      workspaceApi.revokeInvitation(workspaceId, invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId) });
      toast.success('Invitation revoked');
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── useAcceptInvitation ──────────────────────────────────────────────────────

export const useAcceptInvitation = () => {
  const dispatch    = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => workspaceApi.acceptInvitation(token),
    onSuccess: (res) => {
      const workspace = res.data!;
      dispatch(addWorkspace(workspace));
      dispatch(setActiveWorkspace(workspace));
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.list() });
      toast.success(`You joined "${workspace.name}"!`);
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};
