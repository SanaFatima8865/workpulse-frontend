import React from 'react';

import { cn } from '@/lib/cn';
import { getInitials, getAvatarColor } from '@/lib/utils';

// ─── Types ────────────────────────────────────────────────────────────────────

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
  showTooltip?: boolean;
  online?: boolean;
}

export interface AvatarGroupProps {
  users: Array<{ name: string; src?: string | null; _id?: string }>;
  max?: number;
  size?: AvatarSize;
  className?: string;
}

// ─── Size Maps ────────────────────────────────────────────────────────────────

const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs:  { container: 'w-5 h-5',   text: 'text-2xs', status: 'w-1.5 h-1.5 border' },
  sm:  { container: 'w-7 h-7',   text: 'text-xs',  status: 'w-2 h-2 border' },
  md:  { container: 'w-9 h-9',   text: 'text-sm',  status: 'w-2.5 h-2.5 border' },
  lg:  { container: 'w-11 h-11', text: 'text-base', status: 'w-3 h-3 border-2' },
  xl:  { container: 'w-14 h-14', text: 'text-lg',  status: 'w-3.5 h-3.5 border-2' },
  '2xl': { container: 'w-20 h-20', text: 'text-2xl', status: 'w-4 h-4 border-2' },
};

// ─── Avatar ───────────────────────────────────────────────────────────────────

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className,
  online,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const initials = getInitials(name, 2);
  const color = getAvatarColor(name);
  const { container, text, status } = sizeStyles[size];
  const showImage = src && !imgError;

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          container,
          'rounded-full overflow-hidden flex items-center justify-center',
          'ring-2 ring-white dark:ring-surface-dark-secondary',
          'select-none font-semibold',
          !showImage && 'text-white'
        )}
        style={!showImage ? { backgroundColor: color } : undefined}
        title={name}
      >
        {showImage ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className={text}>{initials}</span>
        )}
      </div>

      {/* Online indicator */}
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white dark:border-surface-dark',
            status,
            online ? 'bg-emerald-400' : 'bg-gray-300'
          )}
        />
      )}
    </div>
  );
};

// ─── Avatar Group ─────────────────────────────────────────────────────────────

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 4,
  size = 'sm',
  className,
}) => {
  const visible = users.slice(0, max);
  const overflow = users.length - max;
  const { container, text } = sizeStyles[size];
  const color = getAvatarColor('overflow');

  return (
    <div className={cn('flex items-center', className)}>
      {visible.map((user, i) => (
        <div
          key={user._id ?? i}
          className={cn('-ml-2 first:ml-0')}
          style={{ zIndex: visible.length - i }}
        >
          <Avatar name={user.name} src={user.src} size={size} />
        </div>
      ))}

      {overflow > 0 && (
        <div
          className={cn(
            container,
            '-ml-2 rounded-full flex items-center justify-center',
            'text-white font-semibold ring-2 ring-white dark:ring-surface-dark-secondary'
          )}
          style={{ backgroundColor: color }}
          title={`${overflow} more`}
        >
          <span className={text}>+{overflow}</span>
        </div>
      )}
    </div>
  );
};
