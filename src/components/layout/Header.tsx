import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sun, Moon, Menu, Plus, HelpCircle, ChevronDown } from 'lucide-react';

import { cn }           from '@/lib/cn';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleTheme, toggleSidebarMobile, selectTheme, openModal } from '@/store/uiSlice';
import { selectCurrentUser } from '@/store/authSlice';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { Avatar }       from '@/components/ui/Avatar';
import { Button }       from '@/components/ui/Button';
import { Dropdown }     from '@/components/ui/Dropdown';
import type { DropdownItem } from '@/components/ui/Dropdown';
import { HelpModal }    from '@/components/modals/HelpModal';
import { useLogout }    from '@/features/auth';
import { NotificationBell, LiveNotificationsPanel, ConnectionDot } from '@/features/realtime';

export const Header: React.FC = () => {
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const theme     = useAppSelector(selectTheme);
  const user      = useAppSelector(selectCurrentUser);
  const workspace = useAppSelector(selectActiveWorkspace);
  const logout    = useLogout();
  const [searchFocused,  setSearchFocused]  = React.useState(false);
  const [notifOpen,      setNotifOpen]      = React.useState(false);
  const [helpOpen,       setHelpOpen]       = React.useState(false);

  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const userMenuItems: DropdownItem[] = [
    { label: 'Profile & Settings', onClick: () => navigate('/profile') },
    { label: 'Workspace Settings', onClick: () => navigate(workspace ? `/workspaces/${workspace._id}/settings` : '/workspaces/new') },
    { divider: true, label: '', onClick: undefined },
    { label: logout.isPending ? 'Signing out...' : 'Sign out', danger: true, onClick: () => logout.mutate() },
  ];

  return (
    <header className={cn('h-[60px] flex items-center gap-3 px-4 shrink-0 bg-white dark:bg-surface-dark-secondary border-b border-surface-border dark:border-surface-dark-border z-30')}>
      <button className="lg:hidden p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary transition-colors" onClick={() => dispatch(toggleSidebarMobile())}>
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className={cn('flex-1 max-w-lg relative flex items-center rounded-xl border transition-all duration-200',
        searchFocused ? 'border-brand-400 bg-white dark:bg-surface-dark-secondary ring-2 ring-brand-500/20' : 'border-surface-border bg-surface-secondary dark:bg-surface-dark-tertiary dark:border-surface-dark-border')}>
        <Search size={15} className={cn('absolute left-3 transition-colors', searchFocused ? 'text-brand-500' : 'text-[var(--color-text-muted)]')} />
        <input type="text" placeholder="Search tasks, projects, people..."
          onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
          className="w-full bg-transparent pl-9 pr-3 py-2 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none" />
        <kbd className="absolute right-3 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-surface-border text-2xs font-mono text-[var(--color-text-muted)]"><span>⌘</span><span>K</span></kbd>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button variant="primary" size="sm" leftIcon={<Plus size={15} />} onClick={() => dispatch(openModal('createTask'))} className="hidden sm:inline-flex">New</Button>

        <button onClick={() => setHelpOpen(true)} className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors hidden md:flex" aria-label="Help">
          <HelpCircle size={18} />
        </button>

        {/* Connection dot */}
        <div className="hidden sm:flex items-center px-1">
          <ConnectionDot />
        </div>

        <button onClick={() => dispatch(toggleTheme())} className="p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Real-time notification bell */}
        <NotificationBell onClick={() => setNotifOpen(o => !o)} />

        {user && (
          <Dropdown
            trigger={
              <button className="flex items-center gap-1.5 p-1 pl-1.5 rounded-xl hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors">
                <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} size="sm" online />
                <ChevronDown size={14} className="text-[var(--color-text-muted)] hidden sm:block" />
              </button>
            }
            items={userMenuItems} align="right" width={210}
          />
        )}
      </div>

      {/* Notification panel */}
      <LiveNotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Help / shortcuts modal */}
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  );
};
