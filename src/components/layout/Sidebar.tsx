import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, BarChart3,
  Bell, Settings, ChevronLeft, ChevronRight, HardHat,
  Building2, Users, Layers, MessageSquare, Sparkles,
} from 'lucide-react';

import { cn }               from '@/lib/cn';
import { useAppDispatch, useAppSelector } from '@/store';
import { toggleSidebar, selectSidebarCollapsed } from '@/store/uiSlice';
import { selectCurrentUser } from '@/store/authSlice';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { Avatar }           from '@/components/ui/Avatar';
import { Badge }            from '@/components/ui/Badge';
import { WorkspaceSwitcher } from '@/features/workspaces';

interface NavItem { label: string; to: string; icon: React.ReactNode; badge?: string | number; badgeVariant?: 'primary' | 'danger' | 'warning' }
interface NavSection { label?: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  { items: [
    { label: 'Dashboard', to: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'My Tasks',  to: '/my-tasks',  icon: <CheckSquare size={18} />, badge: 12 },
    { label: 'Inbox',     to: '/inbox',      icon: <MessageSquare size={18} />, badge: 3, badgeVariant: 'danger' },
  ]},
  { label: 'Construction', items: [
    { label: 'Projects',     to: '/projects',      icon: <HardHat size={18} /> },
    { label: 'Clients',      to: '/clients',       icon: <Building2 size={18} /> },
    { label: 'Boards',       to: '/boards',        icon: <Layers size={18} /> },
    { label: 'Workflows',    to: '/construction',  icon: <MessageSquare size={18} /> },
    //{ label: 'My Tasks',     to: '/my-tasks',      icon: <CheckSquare size={18} /> },
  ]},
  { label: 'Analytics', items: [
    { label: 'Analytics', to: '/analytics',  icon: <BarChart3 size={18} /> },
    { label: 'AI Features', to: '/ai',         icon: <Sparkles size={18} /> },
  ]},
  { label: 'People', items: [
    { label: 'Teams',     to: '/teams',      icon: <Users size={18} /> },
    { label: 'Members',   to: '/members',    icon: <Users size={18} /> },
    { label: 'Notifications', to: '/notifications', icon: <Bell size={18} /> },
  ]},
];

export const Sidebar: React.FC = () => {
  const dispatch   = useAppDispatch();
  const collapsed  = useAppSelector(selectSidebarCollapsed);
  const user       = useAppSelector(selectCurrentUser);
  const workspace  = useAppSelector(selectActiveWorkspace);
  const location   = useLocation();
  const settingsTo = workspace ? `/workspaces/${workspace._id}/settings` : '/workspaces/new';

  return (
    <motion.aside
      className="h-full flex flex-col bg-white dark:bg-surface-dark-secondary border-r border-surface-border dark:border-surface-dark-border overflow-hidden relative"
      animate={{ width: collapsed ? 68 : 260 }}
      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
    >
      {/* Workspace switcher */}
      <div className="shrink-0 border-b border-surface-border dark:border-surface-dark-border">
        <WorkspaceSwitcher collapsed={collapsed} />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4 no-scrollbar">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si}>
            {section.label && !collapsed && (
              <p className="px-3 mb-1.5 text-2xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">{section.label}</p>
            )}
            {section.label && collapsed && <div className="h-px bg-surface-border dark:bg-surface-dark-border mx-2 mb-2" />}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = item.to === '/dashboard' ? location.pathname === item.to : location.pathname.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <NavLink to={item.to} className={cn(
                      'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 group relative',
                      isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300' : 'text-[var(--color-text-secondary)] hover:bg-surface-secondary hover:text-[var(--color-text)] dark:hover:bg-surface-dark-tertiary'
                    )}>
                      <span className={cn('shrink-0', isActive && 'text-brand-600 dark:text-brand-400')}>{item.icon}</span>
                      <AnimatePresence mode="wait">
                        {!collapsed && (
                          <motion.span className="flex-1 flex items-center justify-between min-w-0"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                            <span className="truncate">{item.label}</span>
                            {item.badge !== undefined && <Badge variant={item.badgeVariant ?? 'primary'} size="sm" className="ml-1">{item.badge}</Badge>}
                          </motion.span>
                        )}
                      </AnimatePresence>
                      {collapsed && (
                        <div className="absolute left-full ml-2 px-2 py-1 rounded-md text-xs font-medium bg-gray-900 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                          {item.label}
                        </div>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className="shrink-0 border-t border-surface-border dark:border-surface-dark-border p-2">
        <NavLink to={settingsTo} className={({ isActive }) => cn(
          'flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-all mb-1',
          isActive ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300' : 'text-[var(--color-text-secondary)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary'
        )}>
          <Settings size={18} className="shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>Settings</motion.span>}
          </AnimatePresence>
        </NavLink>
        {user && (
          <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary cursor-pointer transition-colors">
            <Avatar name={`${user.firstName} ${user.lastName}`} src={user.avatar} size="sm" online />
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.div className="flex-1 min-w-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.1 }}>
                  <p className="text-xs font-semibold text-[var(--color-text)] truncate leading-none">{user.firstName} {user.lastName}</p>
                  <p className="text-2xs text-[var(--color-text-muted)] truncate mt-0.5 capitalize">{user.role}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button onClick={() => dispatch(toggleSidebar())}
        className="absolute -right-3 top-[72px] z-10 w-6 h-6 rounded-full flex items-center justify-center bg-white dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border shadow-card text-[var(--color-text-muted)] hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200 transition-all">
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  );
};
