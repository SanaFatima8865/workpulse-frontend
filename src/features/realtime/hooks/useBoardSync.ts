import React from 'react';

import { useAppDispatch } from '@/store';
import { addTask, updateTask, removeTask, updateBoard } from '@/store/boardSlice';
import type { PublicTask, PublicBoard } from '@/store/boardSlice';
import { useSocketEvent } from './useSocket';
import toast from 'react-hot-toast';

// ─── useBoardSync ─────────────────────────────────────────────────────────────

/**
 * Subscribes to all board-level real-time events for a specific board.
 * Syncs changes made by OTHER users into the local Redux store.
 *
 * Call this inside the Board page component.
 */
export const useBoardSync = (boardId: string, currentUserId: string): void => {
  const dispatch = useAppDispatch();

  // ─── Task Created ─────────────────────────────────────────────────────────

  useSocketEvent<{ task: PublicTask; addedBy: string }>(
    'task:created',
    ({ task, addedBy }) => {
      if (task.boardId !== boardId) return;
      if (addedBy === currentUserId) return; // Already handled optimistically
      dispatch(addTask(task));
      toast(`${task.title} added`, { icon: '✅', duration: 2000 });
    },
    [boardId, currentUserId]
  );

  // ─── Task Updated ─────────────────────────────────────────────────────────

  useSocketEvent<{ task: PublicTask; updatedBy: string }>(
    'task:updated',
    ({ task, updatedBy }) => {
      if (task.boardId !== boardId) return;
      if (updatedBy === currentUserId) return;
      dispatch(updateTask(task));
    },
    [boardId, currentUserId]
  );

  // ─── Task Moved ───────────────────────────────────────────────────────────

  useSocketEvent<{ task: PublicTask; movedBy: string }>(
    'task:moved',
    ({ task, movedBy }) => {
      if (task.boardId !== boardId) return;
      if (movedBy === currentUserId) return;
      dispatch(updateTask(task));
    },
    [boardId, currentUserId]
  );

  // ─── Task Deleted ─────────────────────────────────────────────────────────

  useSocketEvent<{ taskId: string; boardId: string; deletedBy: string }>(
    'task:deleted',
    ({ taskId, boardId: bid, deletedBy }) => {
      if (bid !== boardId) return;
      if (deletedBy === currentUserId) return;
      dispatch(removeTask(taskId));
    },
    [boardId, currentUserId]
  );

  // ─── Comment Added ────────────────────────────────────────────────────────

  useSocketEvent<{ task: PublicTask; addedBy: string }>(
    'task:comment_added',
    ({ task, addedBy }) => {
      if (task.boardId !== boardId) return;
      if (addedBy === currentUserId) return;
      dispatch(updateTask(task));
    },
    [boardId, currentUserId]
  );

  // ─── Comment Deleted ──────────────────────────────────────────────────────

  useSocketEvent<{ taskId: string; commentId: string }>(
    'task:comment_deleted',
    () => {
      // Refetch is handled by query invalidation from useDeleteComment hook
    },
    [boardId]
  );

  // ─── Board Column Changes ─────────────────────────────────────────────────

  useSocketEvent<{ board: PublicBoard }>(
    'board:group_added',
    ({ board }) => {
      if (board._id !== boardId) return;
      dispatch(updateBoard(board));
    },
    [boardId]
  );

  useSocketEvent<{ board: PublicBoard }>(
    'board:group_updated',
    ({ board }) => {
      if (board._id !== boardId) return;
      dispatch(updateBoard(board));
    },
    [boardId]
  );

  useSocketEvent<{ boardId: string; groupId: string }>(
    'board:group_deleted',
    ({ boardId: bid }) => {
      if (bid !== boardId) return;
      // Full board refetch handled by query invalidation
    },
    [boardId]
  );

  useSocketEvent<{ board: PublicBoard }>(
    'board:group_reordered',
    ({ board }) => {
      if (board._id !== boardId) return;
      dispatch(updateBoard(board));
    },
    [boardId]
  );
};
