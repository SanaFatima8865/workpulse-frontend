import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines clsx and tailwind-merge.
 * - clsx handles conditional class strings
 * - twMerge resolves Tailwind conflicts (e.g., p-4 + p-2 → p-2)
 *
 * Usage:
 *   cn('px-4 py-2', isActive && 'bg-brand-500', className)
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
