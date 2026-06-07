import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { ButtonVariant, ButtonSize } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  animate?: boolean;
}

// ─── Style Maps ───────────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-brand-600 text-white shadow-brand',
    'hover:bg-brand-700 hover:shadow-brand-lg',
    'active:bg-brand-800 active:scale-[0.98]',
    'disabled:bg-brand-300 disabled:shadow-none',
    'focus-visible:ring-brand-500',
  ].join(' '),

  secondary: [
    'bg-surface-secondary text-brand-700 border border-surface-border',
    'hover:bg-surface-tertiary hover:border-brand-200',
    'active:bg-surface-tertiary active:scale-[0.98]',
    'disabled:opacity-50',
    'dark:bg-surface-dark-secondary dark:text-brand-300 dark:border-surface-dark-border',
    'dark:hover:bg-surface-dark-tertiary',
    'focus-visible:ring-brand-500',
  ].join(' '),

  outline: [
    'bg-transparent text-brand-600 border-2 border-brand-300',
    'hover:bg-brand-50 hover:border-brand-500',
    'active:bg-brand-100 active:scale-[0.98]',
    'disabled:opacity-50',
    'dark:text-brand-400 dark:border-brand-700 dark:hover:bg-brand-950',
    'focus-visible:ring-brand-500',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--color-text-secondary)]',
    'hover:bg-surface-secondary hover:text-[var(--color-text)]',
    'active:bg-surface-tertiary active:scale-[0.98]',
    'disabled:opacity-50',
    'dark:hover:bg-surface-dark-secondary',
    'focus-visible:ring-brand-500',
  ].join(' '),

  danger: [
    'bg-red-600 text-white',
    'hover:bg-red-700',
    'active:bg-red-800 active:scale-[0.98]',
    'disabled:bg-red-300',
    'focus-visible:ring-red-500',
  ].join(' '),

  link: [
    'bg-transparent text-brand-600 underline-offset-4',
    'hover:underline hover:text-brand-700',
    'active:text-brand-800',
    'disabled:opacity-50',
    'p-0 h-auto',
    'focus-visible:ring-brand-500',
  ].join(' '),
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1.5 rounded-md',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-base gap-2 rounded-xl',
  xl: 'h-13 px-6 text-base gap-2.5 rounded-xl',
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      animate = true,
      disabled,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const baseStyles = [
      'inline-flex items-center justify-center font-medium',
      'transition-all duration-150 ease-smooth',
      'select-none cursor-pointer',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:cursor-not-allowed disabled:pointer-events-none',
    ].join(' ');

    const buttonEl = (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          variant !== 'link' && 'whitespace-nowrap',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin shrink-0" size={size === 'xs' || size === 'sm' ? 14 : 16} />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );

    if (animate && !isDisabled) {
      return (
        <motion.div
          whileTap={{ scale: 0.97 }}
          className={cn('inline-flex', fullWidth && 'w-full')}
        >
          {buttonEl}
        </motion.div>
      );
    }

    return buttonEl;
  }
);

Button.displayName = 'Button';
