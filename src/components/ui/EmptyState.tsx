import React from 'react';
import { Inbox } from 'lucide-react';

import { cn } from '@/lib/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}) => {
  const sizeMap = {
    sm: { container: 'py-8', icon: 'w-10 h-10', title: 'text-sm', desc: 'text-xs' },
    md: { container: 'py-12', icon: 'w-12 h-12', title: 'text-base', desc: 'text-sm' },
    lg: { container: 'py-20', icon: 'w-16 h-16', title: 'text-lg', desc: 'text-base' },
  };

  const s = sizeMap[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center gap-3',
        s.container,
        className
      )}
    >
      <div
        className={cn(
          s.icon,
          'rounded-2xl flex items-center justify-center',
          'bg-surface-secondary dark:bg-surface-dark-tertiary',
          'text-[var(--color-text-muted)]'
        )}
      >
        {icon ?? <Inbox size={size === 'lg' ? 28 : size === 'md' ? 24 : 18} />}
      </div>

      <div className="space-y-1 max-w-xs">
        <p className={cn('font-semibold text-[var(--color-text)]', s.title)}>{title}</p>
        {description && (
          <p className={cn('text-[var(--color-text-muted)] leading-relaxed', s.desc)}>
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-1">
          {secondaryAction && (
            <Button variant="secondary" size="sm" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button variant="primary" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
