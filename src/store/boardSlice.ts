import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { LoadingState } from '@/types';

// ─── Board types ──────────────────────────────────────────────────────────────

export interface BoardGroup {
  _id: string; name: string; color: string;
  position: number; isCollapsed: boolean; taskCount: number;
}

export interface CustomField {
  _id: string; name: string;
  type: 'text'|'number'|'date'|'select'|'multi_select'|'checkbox'|'url'|'email'|'phone';
  options?: string[]; required: boolean; position: number;
}

export interface PublicBoard {
  _id: string; workspaceId: string; projectId: string;
  name: string; description?: string; view: string;
  groups: BoardGroup[]; customFields: CustomField[];
  isDefault: boolean; createdBy: string; createdAt: string; updatedAt: string;
}

export interface BoardState {
  boards: PublicBoard[];
  activeBoard: PublicBoard | null;
  status: LoadingState;
}

const boardSlice = createSlice({
  name: 'boards',
  initialState: { boards: [], activeBoard: null, status: 'idle' } as BoardState,
  reducers: {
    setBoards:   (s, a: PayloadAction<PublicBoard[]>)     => { s.boards = a.payload; s.status = 'succeeded'; },
    setActiveBoard:(s, a: PayloadAction<PublicBoard|null>)=> { s.activeBoard = a.payload; },
    updateBoard: (s, a: PayloadAction<PublicBoard>)       => {
      const i = s.boards.findIndex(b => b._id === a.payload._id);
      if (i !== -1) s.boards[i] = a.payload;
      if (s.activeBoard?._id === a.payload._id) s.activeBoard = a.payload;
    },
    clearBoards: (s) => { s.boards = []; s.activeBoard = null; s.status = 'idle'; },
  },
});
export const { setBoards, setActiveBoard, updateBoard, clearBoards } = boardSlice.actions;
export const boardReducer = boardSlice.reducer;
export const selectBoards      = (s: { boards: BoardState }) => s.boards.boards;
export const selectActiveBoard = (s: { boards: BoardState }) => s.boards.activeBoard;

// ─── Task types ───────────────────────────────────────────────────────────────

export type TaskPriority = 'critical'|'high'|'medium'|'low'|'none';
export type TaskStatus   = 'todo'|'in_progress'|'in_review'|'blocked'|'done'|'cancelled';

export interface TaskComment {
  _id: string; userId: string; content: string;
  isEdited: boolean; createdAt: string; updatedAt: string;
}

export interface TimeEntry {
  _id: string; userId: string; hours: number;
  description?: string; date: string; loggedAt: string;
}

export interface PublicTask {
  _id: string; workspaceId: string; projectId: string;
  boardId: string; groupId: string;
  title: string; description?: string;
  status: TaskStatus; priority: TaskPriority; position: number;
  assigneeIds: string[]; reporterId: string; watcherIds: string[];
  dueDate?: string; startDate?: string;
  estimatedHours?: number; loggedHours: number;
  tags: string[]; labels: string[];
  parentTaskId?: string; subTaskIds: string[];
  commentCount: number; attachmentCount: number;
  comments: TaskComment[]; timeEntries: TimeEntry[];
  customFieldValues: Array<{ fieldId: string; value: unknown }>;
  completedAt?: string; isArchived: boolean;
  createdBy: string; createdAt: string; updatedAt: string;
}

export interface TaskState {
  tasksByGroup: Record<string, PublicTask[]>; // groupId → tasks
  activeTask: PublicTask | null;
  status: LoadingState;
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState: { tasksByGroup: {}, activeTask: null, status: 'idle' } as TaskState,
  reducers: {
    setTasksByGroup: (s, a: PayloadAction<Record<string, PublicTask[]>>) => {
      s.tasksByGroup = a.payload; s.status = 'succeeded';
    },
    addTask: (s, a: PayloadAction<PublicTask>) => {
      const gid = a.payload.groupId;
      if (!s.tasksByGroup[gid]) s.tasksByGroup[gid] = [];
      s.tasksByGroup[gid].push(a.payload);
      s.tasksByGroup[gid].sort((a, b) => a.position - b.position);
    },
    updateTask: (s, a: PayloadAction<PublicTask>) => {
      const t = a.payload;
      // Remove from old group
      Object.keys(s.tasksByGroup).forEach(gid => {
        s.tasksByGroup[gid] = s.tasksByGroup[gid].filter(task => task._id !== t._id);
      });
      // Add to new group
      if (!s.tasksByGroup[t.groupId]) s.tasksByGroup[t.groupId] = [];
      s.tasksByGroup[t.groupId].push(t);
      s.tasksByGroup[t.groupId].sort((a, b) => a.position - b.position);
      if (s.activeTask?._id === t._id) s.activeTask = t;
    },
    removeTask: (s, a: PayloadAction<string>) => {
      Object.keys(s.tasksByGroup).forEach(gid => {
        s.tasksByGroup[gid] = s.tasksByGroup[gid].filter(t => t._id !== a.payload);
      });
      if (s.activeTask?._id === a.payload) s.activeTask = null;
    },
    setActiveTask:  (s, a: PayloadAction<PublicTask|null>) => { s.activeTask = a.payload; },
    moveTaskLocal:  (s, a: PayloadAction<{ taskId: string; fromGroup: string; toGroup: string; position: number }>) => {
      const { taskId, fromGroup, toGroup, position } = a.payload;
      const task = s.tasksByGroup[fromGroup]?.find(t => t._id === taskId);
      if (!task) return;
      s.tasksByGroup[fromGroup] = (s.tasksByGroup[fromGroup] ?? []).filter(t => t._id !== taskId);
      if (!s.tasksByGroup[toGroup]) s.tasksByGroup[toGroup] = [];
      const updated = { ...task, groupId: toGroup, position };
      s.tasksByGroup[toGroup] = [...s.tasksByGroup[toGroup], updated].sort((a, b) => a.position - b.position);
    },
    clearTasks: (s) => { s.tasksByGroup = {}; s.activeTask = null; s.status = 'idle'; },
  },
});

export const { setTasksByGroup, addTask, updateTask, removeTask, setActiveTask, moveTaskLocal, clearTasks } = taskSlice.actions;
export const taskReducer = taskSlice.reducer;
export const selectTasksByGroup = (s: { tasks: TaskState }) => s.tasks.tasksByGroup;
export const selectActiveTask   = (s: { tasks: TaskState }) => s.tasks.activeTask;
