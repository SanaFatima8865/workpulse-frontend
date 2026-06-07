import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

import type { UIState, ToastNotification } from '@/types/ui';
import type { Theme } from '@/types/index';

const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('workpulse-theme') as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return 'system';
};

const getInitialSidebarState = (): boolean => {
  try {
    return localStorage.getItem('workpulse-sidebar-collapsed') === 'true';
  } catch {
    return false;
  }
};

const initialState: UIState = {
  theme: getInitialTheme(),
  sidebarCollapsed: getInitialSidebarState(),
  sidebarMobileOpen: false,
  activeWorkspaceId: null,
  notifications: [],
  modals: {},
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // ─── Theme ──────────────────────────────────────────────────────────────
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      try {
        localStorage.setItem('workpulse-theme', action.payload);
      } catch {
        // ignore
      }
    },
    toggleTheme: (state) => {
      const next = state.theme === 'light' ? 'dark' : 'light';
      state.theme = next;
      try {
        localStorage.setItem('workpulse-theme', next);
      } catch {
        // ignore
      }
    },

    // ─── Sidebar ────────────────────────────────────────────────────────────
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
      try {
        localStorage.setItem('workpulse-sidebar-collapsed', String(action.payload));
      } catch {
        // ignore
      }
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      try {
        localStorage.setItem('workpulse-sidebar-collapsed', String(state.sidebarCollapsed));
      } catch {
        // ignore
      }
    },
    setSidebarMobileOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarMobileOpen = action.payload;
    },
    toggleSidebarMobile: (state) => {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },

    // ─── Workspace ──────────────────────────────────────────────────────────
    setActiveWorkspace: (state, action: PayloadAction<string | null>) => {
      state.activeWorkspaceId = action.payload;
    },

    // ─── Toast Notifications ────────────────────────────────────────────────
    addToast: (state, action: PayloadAction<Omit<ToastNotification, 'id'>>) => {
      const id = crypto.randomUUID();
      state.notifications.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter((n) => n.id !== action.payload);
    },
    clearToasts: (state) => {
      state.notifications = [];
    },

    // ─── Modals ─────────────────────────────────────────────────────────────
    openModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = false;
    },
    toggleModal: (state, action: PayloadAction<string>) => {
      state.modals[action.payload] = !state.modals[action.payload];
    },
  },
});

export const {
  setTheme,
  toggleTheme,
  setSidebarCollapsed,
  toggleSidebar,
  setSidebarMobileOpen,
  toggleSidebarMobile,
  setActiveWorkspace,
  addToast,
  removeToast,
  clearToasts,
  openModal,
  closeModal,
  toggleModal,
} = uiSlice.actions;

export const uiReducer = uiSlice.reducer;

// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed;
export const selectSidebarMobileOpen = (state: { ui: UIState }) => state.ui.sidebarMobileOpen;
export const selectActiveWorkspaceId = (state: { ui: UIState }) => state.ui.activeWorkspaceId;
export const selectToasts = (state: { ui: UIState }) => state.ui.notifications;
export const selectModal = (key: string) => (state: { ui: UIState }) =>
  state.ui.modals[key] ?? false;
