import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell, AlertCircle, CheckSquare, Calendar,
  CheckCheck, Settings, ChevronRight, Clock,
} from 'lucide-react';

import { useTitle }    from '@/hooks';
import { Button }      from '@/components/ui/Button';
import { Card }        from '@/components/ui/Card';
import { Skeleton }    from '@/components/ui/Spinner';
import { EmptyState }  from '@/components/ui/EmptyState';
import { useMyTasks }  from '@/features/boards';
import { useAppDispatch, useAppSelector } from '@/store';
import { setActiveTask } from '@/store/boardSlice';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { formatDate }  from '@/lib/utils';
import { cn }          from '@/lib/cn';

type NotifType = 'overdue' | 'blocked' | 'due_today' | 'due_soon' | 'assigned';

interface Notification {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  taskId?: string;
  projectId?: string;
  time?: string;
}

const TYPE_STYLES: Record<NotifType, { icon: React.ReactNode; bg: string; text: string }> = {
  overdue:   { icon: <AlertCircle size={15} />, bg: 'bg-red-100 dark:bg-red-950/40',    text: 'text-red-600 dark:text-red-400' },
  blocked:   { icon: <AlertCircle size={15} />, bg: 'bg-amber-100 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400' },
  due_today: { icon: <Calendar size={15} />,    bg: 'bg-blue-100 dark:bg-blue-950/40',   text: 'text-blue-600 dark:text-blue-400' },
  due_soon:  { icon: <Clock size={15} />,       bg: 'bg-indigo-100 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400' },
  assigned:  { icon: <CheckSquare size={15} />, bg: 'bg-emerald-100 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400' },
};

const NotificationsPage: React.FC = () => {
  useTitle('Notifications');
  const navigate   = useNavigate();
  const dispatch   = useAppDispatch();
  const workspace  = useAppSelector(selectActiveWorkspace);
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());

  const { data: allTasks = [], isLoading } = useMyTasks();

  const now     = new Date();
  const todayStr = now.toDateString();
  const in3Days  = new Date(now); in3Days.setDate(in3Days.getDate() + 3);

  const notifications: Notification[] = React.useMemo(() => {
    const notifs: Notification[] = [];

    allTasks.forEach(task => {
      if (task.status === 'done' || task.status === 'cancelled') return;

      if (task.status === 'blocked') {
        notifs.push({ id: `blocked-${task._id}`, type: 'blocked', title: 'Blocked task', body: task.title, taskId: task._id, projectId: task.projectId, time: task.updatedAt });
      }
      if (task.dueDate) {
        const due = new Date(task.dueDate);
        if (due < now) {
          notifs.push({ id: `overdue-${task._id}`, type: 'overdue', title: 'Overdue', body: `"${task.title}" was due ${formatDate(task.dueDate)}`, taskId: task._id, projectId: task.projectId, time: task.dueDate });
        } else if (due.toDateString() === todayStr) {
          notifs.push({ id: `today-${task._id}`, type: 'due_today', title: 'Due today', body: task.title, taskId: task._id, projectId: task.projectId, time: task.dueDate });
        } else if (due <= in3Days) {
          notifs.push({ id: `soon-${task._id}`, type: 'due_soon', title: 'Due soon', body: `"${task.title}" due ${formatDate(task.dueDate)}`, taskId: task._id, projectId: task.projectId, time: task.dueDate });
        }
      }
    });

    // Sort: overdue first, then by time
    const order: NotifType[] = ['overdue', 'blocked', 'due_today', 'due_soon', 'assigned'];
    return notifs.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTasks]);

  const unread = notifications.filter(n => !readIds.has(n.id)).length;

  const handleClick = (notif: Notification) => {
    setReadIds(prev => new Set([...prev, notif.id]));
    if (notif.taskId) {
      const task = allTasks.find(t => t._id === notif.taskId);
      if (task) dispatch(setActiveTask(task));
    }
    if (notif.projectId) navigate(`/boards/${notif.projectId}`);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)] flex items-center gap-2">
            <Bell size={24} className="text-brand-600" />
            Notifications
            {unread > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Task alerts and deadline reminders
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <Button
              variant="secondary" size="sm"
              leftIcon={<CheckCheck size={14} />}
              onClick={() => setReadIds(new Set(notifications.map(n => n.id)))}
            >
              Mark all read
            </Button>
          )}
          {workspace && (
            <Button
              variant="ghost" size="sm"
              leftIcon={<Settings size={14} />}
              onClick={() => navigate(`/workspaces/${workspace._id}/settings`)}
            >
              Settings
            </Button>
          )}
        </div>
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <Skeleton key={i} height={76} className="rounded-xl" />)}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} />}
          title="You're all caught up"
          description="No overdue, blocked, or upcoming deadline tasks assigned to you"
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const style   = TYPE_STYLES[notif.type];
            const isUnread = !readIds.has(notif.id);

            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  hover
                  padding="none"
                  className={cn(
                    'cursor-pointer',
                    isUnread && 'border-l-2 border-l-brand-500'
                  )}
                  onClick={() => handleClick(notif)}
                >
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', style.bg, style.text)}>
                      {style.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {isUnread && <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />}
                        <span className={cn('text-xs font-bold uppercase tracking-wider', style.text)}>
                          {notif.title}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--color-text)] truncate">{notif.body}</p>
                    </div>

                    <ChevronRight size={14} className="text-[var(--color-text-muted)] shrink-0" />
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {notifications.length > 0 && (
        <motion.p
          className="text-center text-xs text-[var(--color-text-muted)] mt-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          Showing task-based alerts. Full notification history coming soon.
        </motion.p>
      )}
    </div>
  );
};

export default NotificationsPage;
