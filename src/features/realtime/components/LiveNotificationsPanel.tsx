import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  selectLiveNotifications,
  selectUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/store/presenceSlice';
import { Avatar }       from '@/components/ui/Avatar';
import { Button }       from '@/components/ui/Button';
import { cn }           from '@/lib/cn';
import { formatRelative } from '@/lib/utils';

// ─── Notification Bell Button ─────────────────────────────────────────────────

interface NotificationBellProps {
  onClick: () => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
  const unreadCount = useAppSelector(selectUnreadCount);
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary hover:text-[var(--color-text)] transition-colors"
      aria-label="Notifications"
    >
      <Bell size={18} />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.span
            className="absolute top-1 right-1 min-w-[16px] h-4 bg-red-500 rounded-full flex items-center justify-center text-2xs font-bold text-white px-0.5"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

// ─── Notification Panel ───────────────────────────────────────────────────────

interface LiveNotificationsPanelProps {
  open:    boolean;
  onClose: () => void;
}

const TYPE_ICONS: Record<string, string> = {
  task_assigned:    '✅',
  comment_mention:  '💬',
  task_due_soon:    '⏰',
  task_updated:     '✏️',
  project_update:   '📋',
  system:           '🔔',
};

export const LiveNotificationsPanel: React.FC<LiveNotificationsPanelProps> = ({ open, onClose }) => {
  const dispatch      = useAppDispatch();
  const navigate      = useNavigate();
  const notifications = useAppSelector(selectLiveNotifications);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'fixed right-2 top-14 z-50 w-80 max-h-[520px]',
              'bg-white dark:bg-surface-dark-secondary rounded-2xl',
              'border border-surface-border dark:border-surface-dark-border shadow-modal',
              'flex flex-col overflow-hidden'
            )}
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border dark:border-surface-dark-border shrink-0">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-brand-600" />
                <span className="text-sm font-bold text-[var(--color-text)]">Notifications</span>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="text-2xs font-bold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                    {notifications.filter(n => !n.isRead).length} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {notifications.some(n => !n.isRead) && (
                  <button
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary text-xs flex items-center gap-1 transition-colors"
                    title="Mark all read"
                  >
                    <CheckCheck size={14} />
                  </button>
                )}
                <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                  <Bell size={28} className="text-[var(--color-text-muted)]" />
                  <p className="text-sm font-medium text-[var(--color-text)]">All caught up!</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Real-time notifications appear here</p>
                </div>
              ) : (
                <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
                  {notifications.map((notif) => (
                    <motion.div
                      key={notif.id}
                      layout
                      className={cn(
                        'flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors',
                        'hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary',
                        !notif.isRead && 'bg-brand-50/50 dark:bg-brand-950/20'
                      )}
                      onClick={() => {
                        dispatch(markNotificationRead(notif.id));
                        if (notif.actionUrl) {
                          navigate(notif.actionUrl);
                          onClose();
                        }
                      }}
                    >
                      {/* Icon */}
                      <div className="w-8 h-8 rounded-full bg-surface-secondary dark:bg-surface-dark-tertiary flex items-center justify-center text-sm shrink-0">
                        {TYPE_ICONS[notif.type] ?? '🔔'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-xs font-semibold text-[var(--color-text)] leading-tight">{notif.title}</p>
                          {!notif.isRead && (
                            <span className="w-2 h-2 bg-brand-500 rounded-full shrink-0 mt-0.5" />
                          )}
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-snug line-clamp-2">{notif.message}</p>
                        <p className="text-2xs text-[var(--color-text-muted)] mt-1">{formatRelative(notif.createdAt)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
