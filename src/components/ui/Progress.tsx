import React from 'react';

import { cn } from '@/lib/cn';

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'brand' | 'success' | 'warning' | 'danger' | 'auto';
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

const sizeMap = { xs: 'h-1', sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

const getAutoColor = (value: number) => {
  if (value >= 80) return 'bg-emerald-500';
  if (value >= 50) return 'bg-brand-500';
  if (value >= 25) return 'bg-amber-500';
  return 'bg-red-500';
};

const colorMap = {
  brand: 'bg-brand-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  auto: '',
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  color = 'brand',
  showLabel = false,
  label,
  animated = true,
  className,
}) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color === 'auto' ? getAutoColor(pct) : colorMap[color];

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between gap-2">
          {label && (
            <span className="text-xs text-[var(--color-text-secondary)] font-medium truncate">
              {label}
            </span>
          )}
          {showLabel && (
            <span className="text-xs font-semibold text-[var(--color-text)] shrink-0">
              {Math.round(pct)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden bg-surface-border dark:bg-surface-dark-border',
          sizeMap[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            barColor,
            animated && 'relative overflow-hidden'
          )}
          style={{ width: `${pct}%` }}
        >
          {animated && pct > 0 && (
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 2s linear infinite',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
