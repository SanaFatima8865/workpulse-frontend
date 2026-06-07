import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckSquare, Calendar, AlertCircle, Clock, Plus } from 'lucide-react';

import { useTitle }  from '@/hooks';
import { Card }      from '@/components/ui/Card';
import { Badge }     from '@/components/ui/Badge';
import { Button }    from '@/components/ui/Button';
import { Skeleton }  from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useMyTasks } from '@/features/boards';
import { useAppDispatch } from '@/store';
import { setActiveTask } from '@/store/boardSlice';
import { PRIORITY_CONFIG } from '@/features/boards/components/TaskCard';
import { formatDate }  from '@/lib/utils';
import { cn }          from '@/lib/cn';

const STATUS_COLORS: Record<string, string> = {
  todo:        'bg-gray-100 text-gray-600',
  in_progress: 'bg-blue-100 text-blue-700',
  in_review:   'bg-amber-100 text-amber-700',
  blocked:     'bg-red-100 text-red-700',
  done:        'bg-emerald-100 text-emerald-700',
  cancelled:   'bg-gray-100 text-gray-400',
};

const MyTasksPage: React.FC = () => {
  useTitle('My Tasks');
  const dispatch  = useAppDispatch();
  const navigate  = useNavigate();
  const [filter, setFilter] = React.useState<'all'|'overdue'|'today'>('all');

  const params = filter === 'overdue' ? { dueDate: 'overdue' } : undefined;
  const { data: tasks = [], isLoading } = useMyTasks(params);

  const filtered = filter === 'today'
    ? tasks.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString())
    : tasks;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)] flex items-center gap-2">
            <CheckSquare size={24} className="text-brand-600" />My Tasks
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Tasks assigned to you across all projects</p>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={() => navigate('/boards')}>
          New Task
        </Button>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(['all','overdue','today'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn('px-4 py-1.5 rounded-full text-sm font-medium transition-all capitalize',
              filter === f ? 'bg-brand-600 text-white shadow-brand' : 'bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text-secondary)] hover:bg-surface-tertiary')}>
            {f === 'overdue' ? '🔴 Overdue' : f === 'today' ? '📅 Due Today' : 'All Tasks'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} height={72} className="rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CheckSquare size={28} />}
          title={filter === 'overdue' ? 'No overdue tasks 🎉' : filter === 'today' ? 'Nothing due today' : 'No tasks assigned to you'}
          description={filter === 'all' ? 'Tasks assigned to you will appear here' : ''} />
      ) : (
        <div className="space-y-2">
          {filtered.map((task, i) => {
            const priority = PRIORITY_CONFIG[task.priority];
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
            return (
              <motion.div key={task._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div
                  onClick={() => { dispatch(setActiveTask(task)); navigate(`/boards/${task.projectId}`); }}
                  className="flex items-center gap-3 p-4 bg-white dark:bg-surface-dark-secondary rounded-xl border border-surface-border dark:border-surface-dark-border hover:shadow-card-hover hover:border-brand-200 transition-all cursor-pointer"
                >
                  {/* Priority indicator */}
                  <span className={cn('text-base shrink-0', priority.color)}>{priority.icon}</span>

                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium text-[var(--color-text)] truncate', task.status === 'done' && 'line-through text-[var(--color-text-muted)]')}>
                      {task.title}
                    </p>
                    {task.labels.length > 0 && (
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {task.labels.slice(0,3).map(l => (
                          <span key={l} className="text-2xs font-medium px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/30 text-brand-600">{l}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-2xs font-medium px-2 py-0.5 rounded-full capitalize', STATUS_COLORS[task.status] ?? '')}>
                      {task.status.replace('_',' ')}
                    </span>
                    {task.dueDate && (
                      <div className={cn('flex items-center gap-1 text-xs', isOverdue ? 'text-red-500 font-semibold' : 'text-[var(--color-text-muted)]')}>
                        {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                        {formatDate(task.dueDate)}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
