import React from 'react';
import { Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn }              from '@/lib/cn';
import { Avatar }          from '@/components/ui/Avatar';
import { Spinner }         from '@/components/ui/Spinner';
import { useUserSearch }   from '@/features/users/hooks/useUsers';
import type { UserSearchResult } from '@/features/users/api/usersApi';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserSearchInputProps {
  workspaceId:  string;
  onSelect:     (user: UserSearchResult) => void;
  placeholder?: string;
  excludeIds?:  string[];
  className?:   string;
  disabled?:    boolean;
  autoFocus?:   boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const UserSearchInput: React.FC<UserSearchInputProps> = ({
  workspaceId,
  onSelect,
  placeholder = 'Search team members...',
  excludeIds  = [],
  className,
  disabled,
  autoFocus,
}) => {
  const [query, setQuery]   = React.useState('');
  const [open, setOpen]     = React.useState(false);
  const ref                 = React.useRef<HTMLDivElement>(null);

  const { data: results = [], isLoading } = useUserSearch(workspaceId, query);

  const filtered = results.filter((u) => !excludeIds.includes(u._id));

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (user: UserSearchResult) => {
    onSelect(user);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Input */}
      <div className={cn(
        'flex items-center gap-2 h-10 px-3 rounded-xl border transition-all duration-150',
        'bg-white dark:bg-surface-dark-secondary text-sm',
        open
          ? 'border-brand-400 ring-2 ring-brand-500/20'
          : 'border-surface-border dark:border-surface-dark-border hover:border-surface-border-strong',
        disabled && 'opacity-50 pointer-events-none'
      )}>
        {isLoading && query.length >= 2
          ? <Spinner size="xs" className="shrink-0" />
          : <Search size={14} className="text-[var(--color-text-muted)] shrink-0" />
        }
        <input
          type="text"
          value={query}
          autoFocus={autoFocus}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown results */}
      <AnimatePresence>
        {open && query.length >= 2 && (
          <motion.div
            className={cn(
              'absolute top-full mt-1 w-full z-50 rounded-xl py-1',
              'bg-white dark:bg-surface-dark-secondary',
              'border border-surface-border dark:border-surface-dark-border',
              'shadow-modal overflow-hidden max-h-60 overflow-y-auto'
            )}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Spinner size="sm" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                No members found for "{query}"
              </p>
            ) : (
              filtered.map((user) => (
                <button
                  key={user._id}
                  onClick={() => handleSelect(user)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors"
                >
                  <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                      {user.jobTitle ?? user.email}
                    </p>
                  </div>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
