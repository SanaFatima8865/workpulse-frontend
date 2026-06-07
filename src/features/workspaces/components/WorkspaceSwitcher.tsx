import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { cn }                  from '@/lib/cn';
import { useAppSelector }      from '@/store';
import { selectWorkspaces, selectActiveWorkspace } from '@/store/workspaceSlice';
import { useWorkspaces, useSwitchWorkspace }        from '../hooks/useWorkspaces';
import { Spinner }             from '@/components/ui/Spinner';
import { Badge }               from '@/components/ui/Badge';

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ collapsed = false }) => {
  const navigate        = useNavigate();
  const workspaces      = useAppSelector(selectWorkspaces);
  const activeWorkspace = useAppSelector(selectActiveWorkspace);
  const switchWorkspace = useSwitchWorkspace();
  const [open, setOpen] = React.useState(false);
  const ref             = React.useRef<HTMLDivElement>(null);

  // Load workspaces on mount
  const { isLoading } = useWorkspaces();

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const planColors: Record<string, string> = {
    free:         'bg-gray-400',
    starter:      'bg-blue-500',
    professional: 'bg-brand-500',
    enterprise:   'bg-amber-500',
  };

  return (
    <div ref={ref} className="relative px-2 py-2">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl',
          'bg-surface-secondary dark:bg-surface-dark-tertiary',
          'border border-surface-border dark:border-surface-dark-border',
          'hover:border-brand-300 dark:hover:border-brand-700',
          'transition-all duration-150 group',
          open && 'border-brand-400 ring-2 ring-brand-500/20'
        )}
      >
        {isLoading ? (
          <Spinner size="sm" className="shrink-0" />
        ) : (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
            style={{ backgroundColor: activeWorkspace?.coverColor ?? '#6453f8' }}
          >
            {activeWorkspace?.name?.[0]?.toUpperCase() ?? 'W'}
          </div>
        )}

        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              className="flex-1 min-w-0 flex items-center justify-between"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)] truncate leading-none">
                  {activeWorkspace?.name ?? 'Select workspace'}
                </p>
                <p className="text-2xs text-[var(--color-text-muted)] capitalize mt-0.5">
                  {activeWorkspace?.plan ?? 'Free'} plan · {activeWorkspace?.memberCount ?? 0} members
                </p>
              </div>
              <ChevronDown
                size={14}
                className={cn(
                  'text-[var(--color-text-muted)] transition-transform duration-200 shrink-0',
                  open && 'rotate-180'
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            className={cn(
              'absolute z-50 mt-1.5 w-64 py-1.5 rounded-xl',
              'bg-white dark:bg-surface-dark-secondary',
              'border border-surface-border dark:border-surface-dark-border',
              'shadow-modal',
              collapsed ? 'left-full ml-2 top-0' : 'left-2 right-2 w-auto'
            )}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
          >
            <p className="px-3 py-1.5 text-2xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              Your Workspaces
            </p>

            <div className="max-h-52 overflow-y-auto">
              {workspaces.map((ws) => (
                <button
                  key={ws._id}
                  onClick={() => {
                    switchWorkspace(ws._id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors',
                    'hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary',
                    activeWorkspace?._id === ws._id && 'bg-brand-50 dark:bg-brand-950/30'
                  )}
                >
                  {/* Color swatch */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                    style={{ backgroundColor: ws.coverColor }}
                  >
                    {ws.name[0]?.toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate leading-none">
                      {ws.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span
                        className={cn('w-1.5 h-1.5 rounded-full', planColors[ws.plan] ?? 'bg-gray-400')}
                      />
                      <p className="text-2xs text-[var(--color-text-muted)] capitalize">
                        {ws.plan} · {ws.memberCount} members
                      </p>
                    </div>
                  </div>

                  {activeWorkspace?._id === ws._id && (
                    <Check size={14} className="text-brand-600 shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-surface-border dark:border-surface-dark-border mt-1 pt-1">
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/workspaces/new');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-colors"
              >
                <Plus size={15} />
                Create new workspace
              </button>
              {activeWorkspace && (
                <button
                  onClick={() => {
                    setOpen(false);
                    navigate(`/workspaces/${activeWorkspace._id}/settings`);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors"
                >
                  <Settings size={15} />
                  Workspace settings
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
