import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, Clock, Tag, MessageSquare, Paperclip,
  ChevronDown, Send, User, AlertCircle, CheckCircle2,
  Trash2, Edit2, Timer,
} from 'lucide-react';

import { Button }   from '@/components/ui/Button';
import { Input }    from '@/components/ui/Input';
import { Badge }    from '@/components/ui/Badge';
import { Avatar }   from '@/components/ui/Avatar';
import { Progress } from '@/components/ui/Progress';
import { cn }       from '@/lib/cn';
import { formatRelative, formatDate } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectActiveTask, setActiveTask } from '@/store/boardSlice';
import { selectCurrentUser } from '@/store/authSlice';
import { useUpdateTask, useAddComment, useDeleteComment, useLogTime, useDeleteTask } from '../hooks/useBoards';
import { TypingIndicator }    from '@/features/realtime/components/TypingIndicator';
import { useTypingIndicator } from '@/features/realtime/hooks/usePresence';
import { PRIORITY_CONFIG } from './TaskCard';

const STATUS_OPTIONS = [
  { value: 'todo',        label: 'To Do',       color: 'bg-gray-400' },
  { value: 'in_progress', label: 'In Progress',  color: 'bg-blue-500' },
  { value: 'in_review',   label: 'In Review',    color: 'bg-amber-500' },
  { value: 'blocked',     label: 'Blocked',      color: 'bg-red-500' },
  { value: 'done',        label: 'Done',         color: 'bg-emerald-500' },
  { value: 'cancelled',   label: 'Cancelled',    color: 'bg-gray-300' },
];

export const TaskDetailPanel: React.FC = () => {
  const dispatch    = useAppDispatch();
  const task        = useAppSelector(selectActiveTask);
  const currentUser = useAppSelector(selectCurrentUser);
  const isOpen      = !!task;

  const updateTask   = useUpdateTask();
  const addComment   = useAddComment(task?._id ?? '');
  const deleteComment = useDeleteComment(task?._id ?? '');
  const logTime      = useLogTime(task?._id ?? '');
  const deleteTask   = useDeleteTask();

  const [commentText, setCommentText] = React.useState('');
  const [editingTitle, setEditingTitle] = React.useState(false);
  const [titleValue, setTitleValue] = React.useState('');
  const [editingDesc, setEditingDesc] = React.useState(false);
  const [descValue, setDescValue] = React.useState('');
  const [logHours, setLogHours] = React.useState('');
  const [showTimeLog, setShowTimeLog] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'comments'|'time'|'detail'>('comments');
  const { startTyping, stopTyping } = useTypingIndicator(task?._id ?? '');

  React.useEffect(() => {
    if (task) {
      setTitleValue(task.title);
      setDescValue(task.description ?? '');
    }
  }, [task?._id]);

  if (!task) return null;

  const priority = PRIORITY_CONFIG[task.priority];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';

  const handleClose = () => dispatch(setActiveTask(null));

  const handleTitleSave = () => {
    if (titleValue.trim() && titleValue !== task.title) {
      updateTask.mutate({ taskId: task._id, title: titleValue.trim() });
    }
    setEditingTitle(false);
  };

  const handleDescSave = () => {
    if (descValue !== task.description) {
      updateTask.mutate({ taskId: task._id, description: descValue });
    }
    setEditingDesc(false);
  };

  const handleStatusChange = (status: string) => {
    updateTask.mutate({ taskId: task._id, status: status as never });
  };

  const handlePriorityChange = (priority: string) => {
    updateTask.mutate({ taskId: task._id, priority: priority as never });
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    addComment.mutate(commentText.trim(), { onSuccess: () => setCommentText('') });
  };

  const handleLogTime = () => {
    const h = parseFloat(logHours);
    if (isNaN(h) || h <= 0) return;
    logTime.mutate({ hours: h, date: new Date().toISOString() }, { onSuccess: () => { setLogHours(''); setShowTimeLog(false); } });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (mobile) */}
          <motion.div
            className="fixed inset-0 z-30 bg-black/20 lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              'fixed right-0 top-0 bottom-0 z-40 w-full max-w-[480px]',
              'bg-white dark:bg-surface-dark-secondary shadow-modal',
              'border-l border-surface-border dark:border-surface-dark-border',
              'flex flex-col overflow-hidden'
            )}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-surface-border dark:border-surface-dark-border shrink-0">
              <div className="flex-1 min-w-0">
                {editingTitle ? (
                  <input
                    value={titleValue}
                    onChange={(e) => setTitleValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                    className="w-full text-base font-bold bg-surface-secondary dark:bg-surface-dark-tertiary rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 text-[var(--color-text)]"
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-base font-bold text-[var(--color-text)] leading-snug cursor-pointer hover:text-brand-600 transition-colors"
                    onClick={() => setEditingTitle(true)}
                  >
                    {task.title}
                  </h2>
                )}
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Status */}
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="text-xs font-medium h-6 px-2 rounded-full border-0 bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>

                  {/* Priority */}
                  <select
                    value={task.priority}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                    className="text-xs font-medium h-6 px-2 rounded-full border-0 bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>

                  {isOverdue && (
                    <span className="text-2xs font-medium text-red-500 flex items-center gap-0.5">
                      <AlertCircle size={10} />Overdue
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => { deleteTask.mutate(task._id); handleClose(); }}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Delete task"
                >
                  <Trash2 size={15} />
                </button>
                <button onClick={handleClose} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3 px-5 py-3 bg-surface-secondary dark:bg-surface-dark-tertiary border-b border-surface-border dark:border-surface-dark-border text-xs shrink-0">
              {/* Due date */}
              <div className="flex flex-col gap-0.5">
                <label className="text-2xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">Due Date</label>
                <div className="flex items-center gap-1">
                  <Calendar size={12} className={isOverdue ? 'text-red-400' : 'text-[var(--color-text-muted)]'} />
                  <input
                    type="date"
                    value={task.dueDate ? task.dueDate.split('T')[0] : ''}
                    onChange={(e) => updateTask.mutate({ taskId: task._id, dueDate: e.target.value || null })}
                    className="text-xs bg-transparent text-[var(--color-text)] focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Time */}
              <div className="flex flex-col gap-0.5">
                <label className="text-2xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">Time</label>
                <div className="flex items-center gap-1">
                  <Clock size={12} className="text-[var(--color-text-muted)]" />
                  <span className="text-[var(--color-text)]">
                    {task.loggedHours > 0 ? `${task.loggedHours}h logged` : 'Not tracked'}
                    {task.estimatedHours ? ` / ${task.estimatedHours}h est` : ''}
                  </span>
                </div>
              </div>

              {/* Labels */}
              {task.labels.length > 0 && (
                <div className="col-span-2 flex flex-wrap gap-1">
                  {task.labels.map(l => (
                    <span key={l} className="text-2xs font-medium px-1.5 py-0.5 rounded bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400">
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="px-5 py-3 border-b border-surface-border dark:border-surface-dark-border shrink-0">
              {editingDesc ? (
                <div className="space-y-2">
                  <textarea
                    value={descValue}
                    onChange={(e) => setDescValue(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-brand-400 bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                    placeholder="Add a description..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button variant="primary" size="xs" onClick={handleDescSave} loading={updateTask.isPending}>Save</Button>
                    <Button variant="ghost" size="xs" onClick={() => { setEditingDesc(false); setDescValue(task.description ?? ''); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="min-h-[40px] text-sm text-[var(--color-text)] cursor-text hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary rounded-lg p-2 -mx-2 transition-colors"
                >
                  {task.description || <span className="text-[var(--color-text-muted)]">Add description... (click to edit)</span>}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-0 px-5 border-b border-surface-border dark:border-surface-dark-border shrink-0">
              {(['comments', 'time', 'detail'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn('px-3 py-2.5 text-xs font-medium capitalize transition-colors border-b-2 -mb-px',
                    activeTab === tab ? 'border-brand-600 text-brand-600' : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]')}>
                  {tab === 'comments' ? `Comments (${task.commentCount})` :
                   tab === 'time'     ? `Time (${task.loggedHours}h)` :
                                         'Details'}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto">

              {/* ── COMMENTS ──────────────────────────────────────────── */}
              {activeTab === 'comments' && (
                <div className="p-5 space-y-4">
                  {task.comments.length === 0 ? (
                    <p className="text-sm text-[var(--color-text-muted)] text-center py-4">No comments yet</p>
                  ) : (
                    task.comments.map(comment => {
                      const isMine = comment.userId === currentUser?._id;
                      return (
                        <div key={comment._id} className="flex items-start gap-2.5 group">
                          <Avatar name={comment.userId.slice(-4)} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-xs font-semibold text-[var(--color-text)]">{comment.userId.slice(-8)}</p>
                              <p className="text-2xs text-[var(--color-text-muted)]">{formatRelative(comment.createdAt)}</p>
                              {comment.isEdited && <span className="text-2xs text-[var(--color-text-muted)]">(edited)</span>}
                            </div>
                            <p className="text-sm text-[var(--color-text)] whitespace-pre-wrap leading-relaxed">{comment.content}</p>
                          </div>
                          {isMine && (
                            <button onClick={() => deleteComment.mutate(comment._id)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-[var(--color-text-muted)] hover:text-red-500 transition-all">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* ── TIME TRACKING ─────────────────────────────────────── */}
              {activeTab === 'time' && (
                <div className="p-5">
                  <div className="mb-4">
                    {task.estimatedHours && (
                      <Progress
                        value={Math.min(100, (task.loggedHours / task.estimatedHours) * 100)}
                        size="sm" color="brand"
                        label={`${task.loggedHours}h logged / ${task.estimatedHours}h estimated`}
                        showLabel
                      />
                    )}
                  </div>

                  <Button variant="secondary" size="sm" leftIcon={<Timer size={14} />} onClick={() => setShowTimeLog(!showTimeLog)} fullWidth>
                    Log Time
                  </Button>

                  {showTimeLog && (
                    <div className="mt-3 flex gap-2">
                      <Input type="number" placeholder="Hours (e.g. 2.5)" value={logHours}
                        onChange={(e) => setLogHours(e.target.value)} size="sm" className="flex-1" />
                      <Button variant="primary" size="sm" loading={logTime.isPending} onClick={handleLogTime}>Log</Button>
                    </div>
                  )}

                  {task.timeEntries.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Time Log</p>
                      {task.timeEntries.map(e => (
                        <div key={e._id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-surface-secondary dark:bg-surface-dark-tertiary">
                          <span className="text-[var(--color-text-muted)]">{formatDate(e.date)}{e.description ? ` · ${e.description}` : ''}</span>
                          <span className="font-bold text-[var(--color-text)]">{e.hours}h</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── DETAILS ───────────────────────────────────────────── */}
              {activeTab === 'detail' && (
                <div className="p-5 space-y-3 text-sm">
                  {[
                    { label: 'Created',   value: formatRelative(task.createdAt) },
                    { label: 'Updated',   value: formatRelative(task.updatedAt) },
                    { label: 'Completed', value: task.completedAt ? formatDate(task.completedAt) : undefined },
                    { label: 'Tags',      value: task.tags.length > 0 ? task.tags.join(', ') : undefined },
                  ].filter(d => d.value).map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span className="text-[var(--color-text-muted)]">{label}</span>
                      <span className="text-[var(--color-text)] font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Typing indicator */}
            {activeTab === 'comments' && task && <TypingIndicator taskId={task._id} />}

            {/* Comment input */}
            {activeTab === 'comments' && (
              <div className="shrink-0 px-5 py-3 border-t border-surface-border dark:border-surface-dark-border bg-surface-secondary/50 dark:bg-surface-dark-tertiary/30">
                <div className="flex items-end gap-2">
                  <Avatar name={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'U'} size="xs" />
                  <div className="flex-1 flex items-end gap-2 bg-white dark:bg-surface-dark-secondary rounded-xl border border-surface-border dark:border-surface-dark-border px-3 py-2">
                    <textarea
                      value={commentText}
                      onChange={(e) => { setCommentText(e.target.value); startTyping(); }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                      placeholder="Add a comment... (Enter to send)"
                      rows={1}
                      className="flex-1 text-sm bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none resize-none leading-snug"
                      style={{ maxHeight: '80px', overflowY: 'auto' }}
                    />
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim() || addComment.isPending}
                      className="text-brand-600 disabled:opacity-30 hover:text-brand-700 transition-colors shrink-0"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
