import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MessageSquare, Paperclip, Clock, AlertCircle } from 'lucide-react';
import type { DraggableAttributes } from '@dnd-kit/core';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';

import { Avatar, AvatarGroup } from '@/components/ui/Avatar';
import { Badge }    from '@/components/ui/Badge';
import { cn }       from '@/lib/cn';
import { formatDate } from '@/lib/utils';
import type { PublicTask, TaskPriority } from '@/store/boardSlice';
import { useAppDispatch } from '@/store';
import { setActiveTask }  from '@/store/boardSlice';

// ─── Priority config ──────────────────────────────────────────────────────────

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  critical: { label: 'Critical', color: 'text-red-500',    icon: '🔴' },
  high:     { label: 'High',     color: 'text-orange-500', icon: '🟠' },
  medium:   { label: 'Medium',   color: 'text-amber-500',  icon: '🟡' },
  low:      { label: 'Low',      color: 'text-blue-400',   icon: '🔵' },
  none:     { label: 'None',     color: 'text-gray-300',   icon: '⚪' },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface TaskCardProps {
  task: PublicTask;
  isDragging?: boolean;
  dragAttributes?: DraggableAttributes;
  dragListeners?: SyntheticListenerMap;
  style?: React.CSSProperties;
  overlay?: boolean;
}

export const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  ({ task, isDragging, dragAttributes, dragListeners, style, overlay = false }, ref) => {
    const dispatch  = useAppDispatch();
    const priority  = PRIORITY_CONFIG[task.priority];
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

    // Mock user data (Module 7 will hydrate from real API)
    const mockUsers = task.assigneeIds.map(id => ({ name: id.slice(-4).toUpperCase(), _id: id }));

    return (
      <div
        ref={ref}
        style={style}
        className={cn(
          'bg-white dark:bg-surface-dark-secondary rounded-xl border select-none',
          'transition-all duration-150 group',
          isDragging || overlay
            ? 'shadow-modal border-brand-300 opacity-90 rotate-[1deg] scale-[1.02]'
            : 'shadow-card border-surface-border dark:border-surface-dark-border hover:shadow-card-hover hover:border-brand-200 dark:hover:border-brand-800 cursor-pointer'
        )}
        onClick={() => !isDragging && dispatch(setActiveTask(task))}
        {...dragAttributes}
        {...dragListeners}
      >
        {/* Priority stripe */}
        {task.priority !== 'none' && (
          <div className={cn(
            'h-0.5 rounded-t-xl',
            task.priority === 'critical' ? 'bg-red-500' :
            task.priority === 'high'     ? 'bg-orange-500' :
            task.priority === 'medium'   ? 'bg-amber-400' : 'bg-blue-400'
          )} />
        )}

        <div className="p-3">
          {/* Tags */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.labels.slice(0, 3).map(label => (
                <span key={label} className="text-2xs font-medium px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <p className={cn(
            'text-sm font-medium text-[var(--color-text)] leading-snug mb-2',
            task.status === 'done' && 'line-through text-[var(--color-text-muted)]'
          )}>
            {task.title}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 mt-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Priority */}
              <span className={cn('text-xs', priority.color)} title={priority.label}>
                {priority.icon}
              </span>

              {/* Due date */}
              {task.dueDate && (
                <div className={cn(
                  'flex items-center gap-0.5 text-2xs font-medium',
                  isOverdue ? 'text-red-500' : 'text-[var(--color-text-muted)]'
                )}>
                  {isOverdue && <AlertCircle size={10} />}
                  <Calendar size={10} />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              )}

              {/* Meta icons */}
              <div className="flex items-center gap-1.5">
                {task.commentCount > 0 && (
                  <span className="flex items-center gap-0.5 text-2xs text-[var(--color-text-muted)]">
                    <MessageSquare size={10} />{task.commentCount}
                  </span>
                )}
                {task.attachmentCount > 0 && (
                  <span className="flex items-center gap-0.5 text-2xs text-[var(--color-text-muted)]">
                    <Paperclip size={10} />{task.attachmentCount}
                  </span>
                )}
                {(task.estimatedHours || task.loggedHours > 0) && (
                  <span className="flex items-center gap-0.5 text-2xs text-[var(--color-text-muted)]">
                    <Clock size={10} />
                    {task.loggedHours > 0 ? `${task.loggedHours}h` : `~${task.estimatedHours}h`}
                  </span>
                )}
              </div>
            </div>

            {/* Assignees */}
            {mockUsers.length > 0 && (
              <AvatarGroup users={mockUsers} max={2} size="xs" />
            )}
          </div>
        </div>
      </div>
    );
  }
);

TaskCard.displayName = 'TaskCard';
