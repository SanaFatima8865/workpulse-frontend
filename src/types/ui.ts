import type { Theme } from './index';

export interface UIState {
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarMobileOpen: boolean;
  activeWorkspaceId: string | null;
  notifications: ToastNotification[];
  modals: Record<string, boolean>;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}
