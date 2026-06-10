// Re-export all shared types for convenient use throughout the app
export * from '@workpulse/shared';
export * from './ui';

// ─── UI State Types ───────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

export interface AsyncState<T = null> {
  data: T;
  status: LoadingState;
  error: string | null;
}

// ─── Theme Types ──────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';

// ─── Component Variant Types ──────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type BadgeSize = 'sm' | 'md' | 'lg';

export type InputSize = 'sm' | 'md' | 'lg';

export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

// ─── Navigation Types ─────────────────────────────────────────────────────────

export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: NavItem[];
  requiredRole?: string[];
}

// ─── Table Types ──────────────────────────────────────────────────────────────

export interface Column<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T) => React.ReactNode;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// ─── Filter Types ─────────────────────────────────────────────────────────────

export interface FilterOption {
  label: string;
  value: string | number | boolean;
  count?: number;
}

// ─── Store Types ──────────────────────────────────────────────────────────────

export interface RootState {
  auth: import('./auth').AuthState;
  ui: import('./ui').UIState;
}

// (More slices added per module)
