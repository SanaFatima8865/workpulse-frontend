import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';
import type { ApiResponse } from '@workpulse/shared';
import { useAppDispatch, useAppSelector } from '@/store';
import { setBoards, setActiveBoard, updateBoard, selectBoards, selectActiveBoard } from '@/store/boardSlice';
import { setTasksByGroup, addTask, updateTask, removeTask, moveTaskLocal, setActiveTask, selectTasksByGroup } from '@/store/boardSlice';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { boardApi, taskApi } from '../api/boardApi';
import type { CreateTaskPayload, UpdateTaskPayload } from '../api/boardApi';

const errMsg = (e: unknown) => { const ax = e as AxiosError<ApiResponse>; return ax.response?.data?.message ?? 'Something went wrong'; };
const useWsId = () => useAppSelector(selectActiveWorkspace)?._id ?? '';

// ─── Boards ──────────────────────────────────────────────────────────────────

export const useBoardsByProject = (projectId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useQuery({
    queryKey: ['boards', wsId, projectId],
    queryFn: async () => { const r = await boardApi.getByProject(projectId, wsId); dispatch(setBoards(r.data ?? [])); return r.data ?? []; },
    enabled: !!wsId && !!projectId,
  });
};

export const useDefaultBoard = (projectId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useQuery({
    queryKey: ['boards', wsId, projectId, 'default'],
    queryFn: async () => { const r = await boardApi.getDefaultForProject(projectId, wsId); dispatch(setActiveBoard(r.data!)); return r.data!; },
    enabled: !!wsId && !!projectId,
  });
};

export const useAddBoardGroup = (boardId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color?: string }) => boardApi.addGroup(boardId, wsId, data),
    onSuccess: (r) => { dispatch(updateBoard(r.data!)); toast.success('Group added'); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useUpdateBoardGroup = (boardId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useMutation({
    mutationFn: ({ groupId, ...data }: { groupId: string; name?: string; color?: string; isCollapsed?: boolean }) =>
      boardApi.updateGroup(boardId, groupId, wsId, data),
    onSuccess: (r) => { dispatch(updateBoard(r.data!)); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useDeleteBoardGroup = (boardId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useMutation({
    mutationFn: (groupId: string) => boardApi.deleteGroup(boardId, groupId, wsId),
    onSuccess: async () => {
      const r = await boardApi.getById(boardId, wsId);
      dispatch(updateBoard(r.data!));
      toast.success('Group deleted');
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const useTasksByBoard = (boardId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useQuery({
    queryKey: ['tasks', wsId, boardId],
    queryFn: async () => { const r = await taskApi.getByBoard(boardId, wsId); dispatch(setTasksByGroup(r.data ?? {})); return r.data ?? {}; },
    enabled: !!wsId && !!boardId,
    staleTime: 30 * 1000,
  });
};

export const useMyTasks = (params?: { status?: string; dueDate?: string }) => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['tasks', wsId, 'my', params],
    queryFn: async () => { const r = await taskApi.getMyTasks(wsId, params); return r.data ?? []; },
    enabled: !!wsId,
  });
};

export const useCreateTask = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId(); const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTaskPayload) => taskApi.create(wsId, data),
    onSuccess: (r) => {
      dispatch(addTask(r.data!));
      qc.invalidateQueries({ queryKey: ['tasks', wsId, r.data!.boardId] });
      toast.success('Task created');
    },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useUpdateTask = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useMutation({
    mutationFn: ({ taskId, ...data }: UpdateTaskPayload & { taskId: string }) =>
      taskApi.update(taskId, wsId, data),
    onSuccess: (r) => { dispatch(updateTask(r.data!)); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useMoveTask = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useMutation({
    mutationFn: (data: { taskId: string; targetGroupId: string; targetPosition: number; sourceGroupId: string }) =>
      taskApi.move(data.taskId, wsId, { targetGroupId: data.targetGroupId, targetPosition: data.targetPosition, sourceGroupId: data.sourceGroupId }),
    onMutate: (data) => {
      // Optimistic update
      dispatch(moveTaskLocal({ taskId: data.taskId, fromGroup: data.sourceGroupId, toGroup: data.targetGroupId, position: data.targetPosition }));
    },
    onSuccess: (r) => { dispatch(updateTask(r.data!)); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useDeleteTask = () => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useMutation({
    mutationFn: (taskId: string) => taskApi.delete(taskId, wsId),
    onSuccess: (_, taskId) => { dispatch(removeTask(taskId)); toast.success('Task deleted'); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useAddComment = (taskId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useMutation({
    mutationFn: (content: string) => taskApi.addComment(taskId, wsId, content),
    onSuccess: (r) => { dispatch(updateTask(r.data!)); dispatch(setActiveTask(r.data!)); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useDeleteComment = (taskId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useMutation({
    mutationFn: (commentId: string) => taskApi.deleteComment(taskId, commentId, wsId),
    onSuccess: (r) => { dispatch(updateTask(r.data!)); dispatch(setActiveTask(r.data!)); },
    onError: (e) => toast.error(errMsg(e)),
  });
};

export const useLogTime = (taskId: string) => {
  const dispatch = useAppDispatch(); const wsId = useWsId();
  return useMutation({
    mutationFn: (data: { hours: number; description?: string; date: string }) => taskApi.logTime(taskId, wsId, data),
    onSuccess: (r) => { dispatch(updateTask(r.data!)); dispatch(setActiveTask(r.data!)); toast.success('Time logged'); },
    onError: (e) => toast.error(errMsg(e)),
  });
};
