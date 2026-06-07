import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { PublicWorkspace } from '@workpulse/shared';

import type { LoadingState } from '@/types';

// ─── State ────────────────────────────────────────────────────────────────────

export interface WorkspaceState {
  workspaces: PublicWorkspace[];
  activeWorkspace: PublicWorkspace | null;
  status: LoadingState;
  error: string | null;
}

const getStoredWorkspaceId = (): string | null => {
  try {
    return localStorage.getItem('wp_active_workspace');
  } catch {
    return null;
  }
};

const initialState: WorkspaceState = {
  workspaces:      [],
  activeWorkspace: null,
  status:          'idle',
  error:           null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    setWorkspaces: (state, action: PayloadAction<PublicWorkspace[]>) => {
      state.workspaces = action.payload;
      state.status     = 'succeeded';
      state.error      = null;

      // Restore or pick first workspace
      if (!state.activeWorkspace && action.payload.length > 0) {
        const storedId    = getStoredWorkspaceId();
        const remembered  = storedId
          ? action.payload.find((w) => w._id === storedId)
          : null;
        const workspace   = remembered ?? action.payload[0];
        state.activeWorkspace = workspace;
        try { localStorage.setItem('wp_active_workspace', workspace._id); } catch { /* ignore */ }
      }
    },

    setActiveWorkspace: (state, action: PayloadAction<PublicWorkspace>) => {
      state.activeWorkspace = action.payload;
      try { localStorage.setItem('wp_active_workspace', action.payload._id); } catch { /* ignore */ }
    },

    addWorkspace: (state, action: PayloadAction<PublicWorkspace>) => {
      state.workspaces.unshift(action.payload);
      state.activeWorkspace = action.payload;
      try { localStorage.setItem('wp_active_workspace', action.payload._id); } catch { /* ignore */ }
    },

    updateWorkspaceInList: (state, action: PayloadAction<PublicWorkspace>) => {
      const idx = state.workspaces.findIndex((w) => w._id === action.payload._id);
      if (idx !== -1) state.workspaces[idx] = action.payload;
      if (state.activeWorkspace?._id === action.payload._id) {
        state.activeWorkspace = action.payload;
      }
    },

    removeWorkspace: (state, action: PayloadAction<string>) => {
      state.workspaces = state.workspaces.filter((w) => w._id !== action.payload);
      if (state.activeWorkspace?._id === action.payload) {
        state.activeWorkspace = state.workspaces[0] ?? null;
      }
    },

    setWorkspaceStatus: (state, action: PayloadAction<LoadingState>) => {
      state.status = action.payload;
    },

    setWorkspaceError: (state, action: PayloadAction<string | null>) => {
      state.error  = action.payload;
      state.status = 'failed';
    },

    clearWorkspaces: (state) => {
      state.workspaces      = [];
      state.activeWorkspace = null;
      state.status          = 'idle';
      state.error           = null;
    },
  },
});

export const {
  setWorkspaces,
  setActiveWorkspace,
  addWorkspace,
  updateWorkspaceInList,
  removeWorkspace,
  setWorkspaceStatus,
  setWorkspaceError,
  clearWorkspaces,
} = workspaceSlice.actions;

export const workspaceReducer = workspaceSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectWorkspaces        = (s: { workspaces: WorkspaceState }) => s.workspaces.workspaces;
export const selectActiveWorkspace   = (s: { workspaces: WorkspaceState }) => s.workspaces.activeWorkspace;
export const selectWorkspaceStatus   = (s: { workspaces: WorkspaceState }) => s.workspaces.status;
export const selectWorkspaceError    = (s: { workspaces: WorkspaceState }) => s.workspaces.error;
