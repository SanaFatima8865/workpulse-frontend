import React from 'react';

import { cn } from '@/lib/cn';
import type { BadgeVariant, BadgeSize } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  primary: 'bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300',
  secondary: 'bg-surface-secondary text-[var(--color-text-secondary)] border border-surface-border',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
};

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-2xs px-1.5 py-0.5 gap-1 rounded',
  md: 'text-xs px-2 py-0.5 gap-1.5 rounded-md',
  lg: 'text-xs px-2.5 py-1 gap-1.5 rounded-md',
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  primary: 'bg-brand-500',
  secondary: 'bg-gray-400',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  info: 'bg-blue-500',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  children,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium shrink-0',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'inline-block rounded-full shrink-0',
            size === 'sm' ? 'w-1 h-1' : 'w-1.5 h-1.5',
            dotStyles[variant]
          )}
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity leading-none"
          aria-label="Remove"
        >
          ×
        </button>
      )}
    </span>
  );
};

// ─── Task Status Badge ────────────────────────────────────────────────────────

import type { TaskStatus, TaskPriority } from '@workpulse/shared';
import { TASK_STATUS_COLORS, TASK_PRIORITY_COLORS } from '@workpulse/shared';
import { titleCase } from '@/lib/utils';

export const TaskStatusBadge: React.FC<{ status: TaskStatus; size?: BadgeSize }> = ({
  status,
  size = 'md',
}) => {
  const statusToVariant: Record<TaskStatus, BadgeVariant> = {
    todo: 'default',
    in_progress: 'info',
    in_review: 'warning',
    blocked: 'danger',
    done: 'success',
    cancelled: 'default',
  };

  return (
    <Badge variant={statusToVariant[status]} size={size} dot>
      {titleCase(status)}
    </Badge>
  );
};

export const TaskPriorityBadge: React.FC<{ priority: TaskPriority; size?: BadgeSize }> = ({
  priority,
  size = 'md',
}) => {
  const priorityToVariant: Record<TaskPriority, BadgeVariant> = {
    critical: 'danger',
    high: 'warning',
    medium: 'info',
    low: 'default',
  };

  return (
    <Badge variant={priorityToVariant[priority]} size={size}>
      {titleCase(priority)}
    </Badge>
  );
};
