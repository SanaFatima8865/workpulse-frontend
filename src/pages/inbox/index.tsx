import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Inbox, AlertCircle, Calendar, Clock, CheckSquare,
  ChevronRight, CheckCheck, Bell, Filter,
} from 'lucide-react';

import { useTitle }    from '@/hooks';
import { Card }        from '@/components/ui/Card';
import { Badge }       from '@/components/ui/Badge';
import { Button }      from '@/components/ui/Button';
import { Skeleton }    from '@/components/ui/Spinner';
import { EmptyState }  from '@/components/ui/EmptyState';
import { useMyTasks }  from '@/features/boards';
import { useAppDispatch } from '@/store';
import { setActiveTask } from '@/store/boardSlice';
import { PRIORITY_CONFIG } from '@/features/boards/components/TaskCard';
import { formatDate }  from '@/lib/utils';
import { cn }          from '@/lib/cn';

// ─── Types ─────────────────────────────────────────────────────────────────────

type InboxFilter = 'all' | 'overdue' | 'today' | 'upcoming' | 'blocked';

const FILTER_CONFIG: Record<InboxFilter, { label: string; icon: React.ReactNode }> = {
  all:      { label: 'All',      icon: <Inbox size={14} /> },
  overdue:  { label: 'Overdue',  icon: <AlertCircle size={14} /> },
  today:    { label: 'Today',    icon: <Calendar size={14} /> },
  upcoming: { label: 'Upcoming', icon: <Clock size={14} /> },
  blocked:  { label: 'Blocked',  icon: <Bell size={14} /> },
};

const STATUS_STYLES: Record<string, string> = {
  todo:        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  in_review:   'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  blocked:     'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  done:        'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  cancelled:   'bg-gray-100 text-gray-400 dark:bg-gray-800',
};

// ─── InboxPage ─────────────────────────────────────────────────────────────────

const InboxPage: React.FC = () => {
  useTitle('Inbox');
  const navigate  = useNavigate();
  const dispatch  = useAppDispatch();
  const [filter, setFilter] = React.useState<InboxFilter>('all');
  const [readIds, setReadIds] = React.useState<Set<string>>(new Set());

  const { data: allTasks = [], isLoading } = useMyTasks();
  const { data: overdueTasks = [] }        = useMyTasks({ dueDate: 'overdue' });

  const now = new Date();
  const todayStr = now.toDateString();
  const in7Days  = new Date(now); in7Days.setDate(in7Days.getDate() + 7);

  const filtered = React.useMemo(() => {
    switch (filter) {
      case 'overdue':
        return allTasks.filter(t =>
          t.dueDate && new Date(t.dueDate) < now && t.status !== 'done' && t.status !== 'cancelled'
        );
      case 'today':
        return allTasks.filter(t =>
          t.dueDate && new Date(t.dueDate).toDateString() === todayStr
        );
      case 'upcoming':
        return allTasks.filter(t =>
          t.dueDate && new Date(t.dueDate) > now && new Date(t.dueDate) <= in7Days && t.status !== 'done'
        );
      case 'blocked':
        return allTasks.filter(t => t.status === 'blocked');
      default:
        return allTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTasks, filter]);

  const overdueCount  = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done' && t.status !== 'cancelled').length;
  const blockedCount  = allTasks.filter(t => t.status === 'blocked').length;
  const todayCount    = allTasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === todayStr).length;
  const upcomingCount = allTasks.filter(t => t.dueDate && new Date(t.dueDate) > now && new Date(t.dueDate) <= in7Days && t.status !== 'done').length;
  const unread        = filtered.filter(t => !readIds.has(t._id)).length;

  const markAllRead = () => setReadIds(new Set(filtered.map(t => t._id)));

  const counts: Record<InboxFilter, number> = {
    all:      allTasks.filter(t => t.status !== 'done' && t.status !== 'cancelled').length,
    overdue:  overdueCount,
    today:    todayCount,
    upcoming: upcomingCount,
    blocked:  blockedCount,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)] flex items-center gap-2">
            <Inbox size={24} className="text-brand-600" />
            Inbox
            {unread > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Tasks and updates that need your attention
          </p>
        </div>
        {unread > 0 && (
          <Button variant="secondary" size="sm" leftIcon={<CheckCheck size={15} />} onClick={markAllRead}>
            Mark all read
          </Button>
        )}
      </motion.div>

      {/* Summary chips */}
      {!isLoading && (overdueCount > 0 || blockedCount > 0) && (
        <motion.div
          className="flex flex-wrap gap-2 mb-5"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        >
          {overdueCount > 0 && (
            <button
              onClick={() => setFilter('overdue')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors"
            >
              <AlertCircle size={12} />
              {overdueCount} overdue task{overdueCount !== 1 ? 's' : ''}
            </button>
          )}
          {blockedCount > 0 && (
            <button
              onClick={() => setFilter('blocked')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-600 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition-colors"
            >
              <Bell size={12} />
              {blockedCount} blocked task{blockedCount !== 1 ? 's' : ''}
            </button>
          )}
        </motion.div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5 flex-wrap">
        {(Object.keys(FILTER_CONFIG) as InboxFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              filter === f
                ? 'bg-brand-600 text-white shadow-brand'
                : 'bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text-secondary)] hover:bg-surface-tertiary'
            )}
          >
            {FILTER_CONFIG[f].icon}
            {FILTER_CONFIG[f].label}
            {counts[f] > 0 && (
              <span className={cn(
                'ml-0.5 px-1.5 py-0 rounded-full text-2xs font-bold',
                filter === f ? 'bg-white/20 text-white' : 'bg-surface-border dark:bg-surface-dark-border text-[var(--color-text-muted)]'
              )}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <Skeleton key={i} height={80} className="rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={32} />}
          title={
            filter === 'overdue' ? 'No overdue tasks — great work!' :
            filter === 'today'   ? 'Nothing due today' :
            filter === 'upcoming'? 'No upcoming deadlines this week' :
            filter === 'blocked' ? 'No blocked tasks' :
            'Your inbox is clear'
          }
          description={filter === 'all' ? 'Active tasks assigned to you will appear here' : ''}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => {
            const priority  = PRIORITY_CONFIG[task.priority] ?? PRIORITY_CONFIG.medium;
            const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'done';
            const isDueToday = task.dueDate && new Date(task.dueDate).toDateString() === todayStr;
            const isUnread  = !readIds.has(task._id);

            return (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  hover
                  padding="none"
                  className={cn(
                    'cursor-pointer transition-all',
                    isUnread && 'border-l-2 border-l-brand-500'
                  )}
                  onClick={() => {
                    setReadIds(prev => new Set([...prev, task._id]));
                    dispatch(setActiveTask(task));
                    navigate(`/boards/${task.projectId}`);
                  }}
                >
                  <div className="flex items-center gap-3 px-4 py-3.5">
                    {/* Priority */}
                    <span className={cn('text-base shrink-0', priority.color)}>{priority.icon}</span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        {isUnread && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                        )}
                        <p className={cn(
                          'text-sm font-medium text-[var(--color-text)] truncate',
                          task.status === 'done' && 'line-through text-[var(--color-text-muted)]'
                        )}>
                          {task.title}
                        </p>
                      </div>
                      {task.labels.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {task.labels.slice(0, 3).map(l => (
                            <span key={l} className="text-2xs px-1.5 py-0 rounded bg-brand-50 dark:bg-brand-950/30 text-brand-600">
                              {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn('text-2xs font-medium px-2 py-0.5 rounded-full capitalize', STATUS_STYLES[task.status] ?? '')}>
                        {task.status.replace('_', ' ')}
                      </span>

                      {task.dueDate && (
                        <div className={cn(
                          'flex items-center gap-1 text-xs font-medium',
                          isOverdue  ? 'text-red-500' :
                          isDueToday ? 'text-amber-500' :
                          'text-[var(--color-text-muted)]'
                        )}>
                          {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                          {formatDate(task.dueDate)}
                        </div>
                      )}

                      <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Completion section */}
      {!isLoading && allTasks.filter(t => t.status === 'done').length > 0 && filter === 'all' && (
        <motion.div
          className="mt-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            Recently Completed
          </p>
          <div className="space-y-1">
            {allTasks.filter(t => t.status === 'done').slice(0, 5).map(task => (
              <div
                key={task._id}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-surface-secondary/50 dark:bg-surface-dark-tertiary/30 cursor-pointer hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors"
                onClick={() => { dispatch(setActiveTask(task)); navigate(`/boards/${task.projectId}`); }}
              >
                <CheckSquare size={14} className="text-emerald-500 shrink-0" />
                <p className="text-sm text-[var(--color-text-muted)] line-through truncate flex-1">{task.title}</p>
                {task.dueDate && <span className="text-xs text-[var(--color-text-muted)]">{formatDate(task.dueDate)}</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default InboxPage;
