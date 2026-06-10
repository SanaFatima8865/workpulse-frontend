import React from 'react';

import { cn } from '@/lib/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'flat' | 'outlined' | 'elevated';
}

interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  divider?: boolean;
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

const variantStyles: Record<NonNullable<CardProps['variant']>, string> = {
  default: [
    'bg-white border border-surface-border shadow-card',
    'dark:bg-surface-dark-secondary dark:border-surface-dark-border',
  ].join(' '),
  flat: [
    'bg-surface-secondary border border-surface-border',
    'dark:bg-surface-dark-tertiary dark:border-surface-dark-border',
  ].join(' '),
  outlined: [
    'bg-transparent border-2 border-surface-border-strong',
    'dark:border-surface-dark-border-strong',
  ].join(' '),
  elevated: [
    'bg-white border border-surface-border shadow-modal',
    'dark:bg-surface-dark-secondary dark:border-surface-dark-border',
  ].join(' '),
};

// ─── Card ─────────────────────────────────────────────────────────────────────

export const Card: React.FC<CardProps> = ({
  hover = false,
  padding = 'md',
  variant = 'default',
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'rounded-xl overflow-hidden',
      variantStyles[variant],
      paddingStyles[padding],
      hover && [
        'transition-all duration-200 cursor-pointer',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        'hover:border-brand-200 dark:hover:border-brand-800',
      ],
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// ─── Card Header ──────────────────────────────────────────────────────────────

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  action,
  divider = false,
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      'flex items-start justify-between gap-4',
      divider && 'pb-4 mb-4 border-b border-surface-border dark:border-surface-dark-border',
      className
    )}
    {...props}
  >
    {(title || subtitle) ? (
      <div className="flex-1 min-w-0">
        {title && (
          <h3 className="text-base font-semibold text-[var(--color-text)] leading-tight truncate">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5 leading-snug">{subtitle}</p>
        )}
      </div>
    ) : (
      <div className="flex-1 min-w-0">{children}</div>
    )}
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

// ─── Card Section (Divider) ───────────────────────────────────────────────────

export const CardSection: React.FC<CardSectionProps> = ({
  divider = true,
  className,
  children,
  ...props
}) => (
  <div
    className={cn(
      divider && 'border-t border-surface-border dark:border-surface-dark-border pt-4 mt-4',
      className
    )}
    {...props}
  >
    {children}
  </div>
);

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  change?: { value: number; label?: string };
  icon?: React.ReactNode;
  iconColor?: string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon,
  iconColor = 'bg-brand-100 text-brand-600',
  className,
}) => (
  <Card padding="md" hover className={className}>
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
          {label}
        </p>
        <p className="text-2xl font-bold text-[var(--color-text)] mt-1 leading-none">{value}</p>
        {change !== undefined && (
          <p
            className={cn(
              'text-xs font-medium mt-1.5 flex items-center gap-1',
              change.value >= 0 ? 'text-emerald-600' : 'text-red-500'
            )}
          >
            <span>{change.value >= 0 ? '↑' : '↓'}</span>
            <span>{Math.abs(change.value)}%</span>
            {change.label && <span className="text-[var(--color-text-muted)]">{change.label}</span>}
          </p>
        )}
      </div>
      {icon && (
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconColor)}>
          {icon}
        </div>
      )}
    </div>
  </Card>
);
