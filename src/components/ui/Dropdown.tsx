import React from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown } from 'lucide-react';
import { Fragment } from 'react';

import { cn } from '@/lib/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  danger?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  width?: number | string;
  className?: string;
  showChevron?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'left',
  width = 200,
  className,
  showChevron = false,
}) => {
  return (
    <Menu as="div" className={cn('relative inline-flex', className)}>
      {/* Trigger */}
      <Menu.Button as={Fragment}>
        <span className="inline-flex items-center gap-1 cursor-pointer">
          {trigger}
          {showChevron && (
            <ChevronDown
              size={14}
              className="text-[var(--color-text-muted)] ui-open:rotate-180 transition-transform duration-150"
            />
          )}
        </span>
      </Menu.Button>

      {/* Panel */}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={cn(
            'absolute z-50 mt-1 py-1 rounded-xl overflow-hidden',
            'bg-white dark:bg-surface-dark-secondary',
            'border border-surface-border dark:border-surface-dark-border',
            'shadow-modal focus:outline-none',
            align === 'right' ? 'right-0' : 'left-0',
            'top-full'
          )}
          style={{ width: typeof width === 'number' ? `${width}px` : width }}
        >
          {items.map((item, i) => (
            <Fragment key={i}>
              {item.divider && i > 0 && (
                <div className="my-1 h-px bg-surface-border dark:bg-surface-dark-border" />
              )}
              <Menu.Item disabled={item.disabled}>
                {({ active, disabled }) => (
                  <button
                    onClick={item.onClick}
                    disabled={disabled}
                    className={cn(
                      'flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors',
                      'text-left leading-none',
                      item.danger
                        ? [
                            'text-red-600 dark:text-red-400',
                            active && 'bg-red-50 dark:bg-red-950/50',
                          ]
                        : [
                            'text-[var(--color-text)]',
                            active &&
                              'bg-surface-secondary dark:bg-surface-dark-tertiary text-brand-600',
                          ],
                      disabled && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    {item.icon && (
                      <span className="shrink-0 w-4 h-4 flex items-center justify-center">
                        {item.icon}
                      </span>
                    )}
                    <span>{item.label}</span>
                  </button>
                )}
              </Menu.Item>
            </Fragment>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
