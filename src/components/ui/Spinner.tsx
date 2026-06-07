import React from 'react';

import { cn } from '@/lib/cn';

// ─── Spinner ──────────────────────────────────────────────────────────────────

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
  color?: 'brand' | 'white' | 'current';
}

const spinnerSizes: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
};

const spinnerColors: Record<NonNullable<SpinnerProps['color']>, string> = {
  brand: 'border-brand-200 border-t-brand-600',
  white: 'border-white/30 border-t-white',
  current: 'border-current/20 border-t-current',
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'brand',
  className,
}) => (
  <div
    className={cn(
      'rounded-full animate-spin',
      spinnerSizes[size],
      spinnerColors[color],
      className
    )}
    role="status"
    aria-label="Loading"
  />
);

// ─── Loading Overlay ──────────────────────────────────────────────────────────

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  className,
}) => (
  <div
    className={cn(
      'absolute inset-0 flex flex-col items-center justify-center gap-3',
      'bg-white/80 dark:bg-surface-dark/80 backdrop-blur-sm z-50 rounded-inherit',
      className
    )}
  >
    <Spinner size="lg" />
    {message && (
      <p className="text-sm text-[var(--color-text-secondary)] font-medium">{message}</p>
    )}
  </div>
);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  circle = false,
  lines,
  className,
  style,
  ...props
}) => {
  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            height={height ?? 16}
            width={i === lines - 1 ? '75%' : '100%'}
            className={className}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-surface-secondary dark:bg-surface-dark-tertiary',
        circle ? 'rounded-full' : 'rounded-lg',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height ?? '1rem',
        ...style,
      }}
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s linear infinite',
        }}
      />
    </div>
  );
};

// ─── Page Loader ──────────────────────────────────────────────────────────────

export const PageLoader: React.FC<{ message?: string }> = ({ message }) => (
  <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-bg)]">
    {/* Logo mark */}
    <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-brand">
      <span className="text-white font-display font-bold text-xl">W</span>
    </div>
    <Spinner size="lg" />
    {message && <p className="text-sm text-[var(--color-text-muted)]">{message}</p>}
  </div>
);
