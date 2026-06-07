import React from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  setWorkspaceUsers, userCameOnline, userWentOffline, userStatusChanged,
  setBoardViewers, addBoardViewer, removeBoardViewer,
  userStartedTyping, userStoppedTyping,
  userStartedDragging, userStoppedDragging,
  addLiveNotification,
} from '@/store/presenceSlice';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { selectCurrentUser }     from '@/store/authSlice';
import { useSocket, useSocketEvent, useSocketEmit } from './useSocket';
import type { OnlineUser, BoardViewer, LiveNotification } from '@/store/presenceSlice';

// ─── useWorkspacePresence ─────────────────────────────────────────────────────

/**
 * Joins the workspace room and syncs presence state.
 * Call at app layout level once per workspace change.
 */
export const useWorkspacePresence = (): void => {
  const dispatch   = useAppDispatch();
  const socket     = useSocket();
  const workspace  = useAppSelector(selectActiveWorkspace);
  const emit       = useSocketEmit();

  React.useEffect(() => {
    if (!workspace || !socket.connected) return;

    emit('presence:join_workspace', workspace._id);
    return () => {
      // Leave is handled on disconnect; no explicit leave needed
    };
  }, [workspace?._id, socket.connected]);

  // Workspace presence events
  useSocketEvent<OnlineUser[]>('presence:workspace_users', (users) => {
    dispatch(setWorkspaceUsers(users));
  });

  useSocketEvent<OnlineUser>('presence:user_online', (user) => {
    dispatch(userCameOnline(user));
  });

  useSocketEvent<{ userId: string; workspaceId: string }>('presence:user_offline', ({ userId }) => {
    dispatch(userWentOffline(userId));
  });

  useSocketEvent<{ userId: string; status: OnlineUser['status'] }>('presence:status_changed', (data) => {
    dispatch(userStatusChanged(data));
  });
};

// ─── useBoardPresence ─────────────────────────────────────────────────────────

/**
 * Joins a board room and tracks who else is viewing.
 * Call on the board page.
 */
export const useBoardPresence = (boardId: string): void => {
  const dispatch = useAppDispatch();
  const emit     = useSocketEmit();
  const socket   = useSocket();

  React.useEffect(() => {
    if (!boardId || !socket.connected) return;

    emit('presence:join_board', boardId);

    return () => {
      emit('presence:leave_board', boardId);
    };
  }, [boardId, socket.connected]);

  // Board viewer events
  useSocketEvent<{ boardId: string; viewers: BoardViewer[] }>('presence:board_viewers', (data) => {
    dispatch(setBoardViewers(data));
  }, [boardId]);

  useSocketEvent<BoardViewer>('presence:board_joined', (viewer) => {
    if (viewer.boardId === boardId) dispatch(addBoardViewer(viewer));
  }, [boardId]);

  useSocketEvent<{ userId: string; boardId: string }>('presence:board_left', (data) => {
    if (data.boardId === boardId) dispatch(removeBoardViewer(data));
  }, [boardId]);

  // Drag indicators from other users
  useSocketEvent<{ userId: string; firstName: string; taskId: string; boardId: string }>('board:task_drag_start', (data) => {
    if (data.boardId === boardId) dispatch(userStartedDragging(data));
  }, [boardId]);

  useSocketEvent<{ userId: string; boardId: string }>('board:task_drag_end', (data) => {
    if (data.boardId === boardId) dispatch(userStoppedDragging({ userId: data.userId }));
  }, [boardId]);
};

// ─── useTypingIndicator ───────────────────────────────────────────────────────

/**
 * For the comment input in TaskDetailPanel.
 * Sends typing start/stop events with debounce.
 */
export const useTypingIndicator = (taskId: string): {
  startTyping: () => void;
  stopTyping:  () => void;
} => {
  const dispatch = useAppDispatch();
  const emit     = useSocketEmit();
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Subscribe to others' typing
  useSocketEvent<{ userId: string; firstName: string; taskId: string; context: 'comment' | 'description' }>(
    'typing:user_started', (data) => {
      if (data.taskId === taskId) dispatch(userStartedTyping(data));
    }, [taskId]
  );

  useSocketEvent<{ userId: string; taskId: string }>(
    'typing:user_stopped', (data) => {
      if (data.taskId === taskId) dispatch(userStoppedTyping(data));
    }, [taskId]
  );

  const startTyping = React.useCallback(() => {
    emit('typing:start', { taskId, context: 'comment' });
    // Auto-stop after 3s of no input
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      emit('typing:stop', { taskId });
    }, 3000);
  }, [taskId, emit]);

  const stopTyping = React.useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    emit('typing:stop', { taskId });
    dispatch(userStoppedTyping({ userId: 'self', taskId }));
  }, [taskId, emit]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      emit('task:unwatch', taskId);
    };
  }, [taskId]);

  return { startTyping, stopTyping };
};

// ─── useLiveNotifications ─────────────────────────────────────────────────────

/**
 * Listens for real-time notifications pushed from server.
 */
export const useLiveNotifications = (): void => {
  const dispatch = useAppDispatch();

  useSocketEvent<LiveNotification>('notification:new', (notification) => {
    dispatch(addLiveNotification(notification));
  });
};
