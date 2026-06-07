import React from 'react';
import { Eye, EyeOff, X } from 'lucide-react';

import { cn } from '@/lib/cn';
import type { InputSize } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: InputSize;
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  fullWidth?: boolean;
}

// ─── Size Maps ────────────────────────────────────────────────────────────────

const sizeStyles: Record<InputSize, { input: string; icon: string }> = {
  sm: { input: 'h-8 px-3 text-sm', icon: 'text-xs' },
  md: { input: 'h-10 px-3.5 text-sm', icon: 'text-sm' },
  lg: { input: 'h-12 px-4 text-base', icon: 'text-base' },
};

// ─── Component ────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'md',
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      clearable,
      onClear,
      fullWidth = true,
      type = 'text',
      className,
      id,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const inputId = id ?? React.useId();
    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasValue = clearable && value !== undefined && value !== '';

    const hasLeftPadding = !!leftIcon;
    const hasRightContent = !!rightIcon || type === 'password' || hasValue;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-[var(--color-text)] leading-none"
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative flex items-center">
          {/* Left icon */}
          {leftIcon && (
            <span className="absolute left-3 flex items-center text-[var(--color-text-muted)] pointer-events-none">
              {leftIcon}
            </span>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            disabled={disabled}
            value={value}
            className={cn(
              // Base
              'w-full rounded-lg border font-sans transition-all duration-150',
              'bg-white text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]',
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
              // Border
              error
                ? 'border-red-400 focus:ring-red-500 focus:border-red-500'
                : 'border-surface-border hover:border-surface-border-strong',
              // Dark mode
              'dark:bg-surface-dark-secondary dark:border-surface-dark-border',
              'dark:hover:border-surface-dark-border-strong dark:text-surface-secondary',
              // Size
              sizeStyles[size].input,
              // Padding adjustments for icons
              hasLeftPadding && 'pl-9',
              hasRightContent && 'pr-9',
              // Disabled
              disabled && 'opacity-50 cursor-not-allowed bg-surface-secondary',
              className
            )}
            {...props}
          />

          {/* Right: clear / password toggle / custom icon */}
          <span className="absolute right-3 flex items-center gap-1">
            {hasValue && clearable && (
              <button
                type="button"
                onClick={onClear}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                tabIndex={-1}
              >
                <X size={14} />
              </button>
            )}

            {type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            )}

            {!hasValue && type !== 'password' && rightIcon && (
              <span className="text-[var(--color-text-muted)]">{rightIcon}</span>
            )}
          </span>
        </div>

        {/* Error / Hint */}
        {error ? (
          <p className="text-xs text-red-500 leading-tight">{error}</p>
        ) : hint ? (
          <p className="text-xs text-[var(--color-text-muted)] leading-tight">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
