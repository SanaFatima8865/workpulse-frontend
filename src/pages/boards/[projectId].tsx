import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, HardHat, Plus, X } from 'lucide-react';

import { useTitle }      from '@/hooks';
import { PageLoader }    from '@/components/ui/Spinner';
import { Button }        from '@/components/ui/Button';
import { useProject }    from '@/features/projects';
import { useDefaultBoard, KanbanBoard, useCreateTask } from '@/features/boards';
import { useBoardSync, useBoardPresence, BoardPresenceBar } from '@/features/realtime';
import { useAppSelector } from '@/store';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { selectActiveBoard, selectTasksByGroup } from '@/store/boardSlice';
import { selectCurrentUser } from '@/store/authSlice';
import { PhaseBadge }    from '@/features/projects/components/ProjectCard';

// ─── Inner component (has board ID) ──────────────────────────────────────────

const BoardSync: React.FC<{ boardId: string; currentUserId: string }> = ({ boardId, currentUserId }) => {
  useBoardPresence(boardId);
  useBoardSync(boardId, currentUserId);
  return null;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const BoardPage: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate      = useNavigate();
  const ws            = useAppSelector(selectActiveWorkspace);
  const board         = useAppSelector(selectActiveBoard);
  const tasksByGroup  = useAppSelector(selectTasksByGroup);
  const currentUser   = useAppSelector(selectCurrentUser);

  const wsId = ws?._id ?? '';
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { isLoading: boardLoading }                  = useDefaultBoard(projectId);
  const createTask = useCreateTask();

  const [quickTitle,   setQuickTitle]   = React.useState('');
  const [quickOpen,    setQuickOpen]    = React.useState(false);
  const quickInputRef = React.useRef<HTMLInputElement>(null);

  useTitle(project?.name ? `${project.name} Board` : 'Board');

  const allTasks     = Object.values(tasksByGroup).flat();
  const doneTasks    = allTasks.filter(t => t.status === 'done').length;
  const totalTasks   = allTasks.length;
  const overdueCount = allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;

  const handleQuickCreate = () => {
    if (!quickTitle.trim() || !board) return;
    const firstGroup = [...board.groups].sort((a, b) => a.position - b.position)[0];
    if (!firstGroup) return;
    createTask.mutate(
      {
        title: quickTitle.trim(),
        boardId: board._id,
        groupId: firstGroup._id,
        projectId,
        assigneeIds: currentUser ? [currentUser._id] : [],
      },
      { onSuccess: () => { setQuickTitle(''); setQuickOpen(false); } }
    );
  };

  React.useEffect(() => {
    if (quickOpen) setTimeout(() => quickInputRef.current?.focus(), 50);
  }, [quickOpen]);

  if (projectLoading || boardLoading) return <PageLoader message="Loading board..." />;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Wire real-time sync once board ID is known */}
      {board && currentUser && (
        <BoardSync boardId={board._id} currentUserId={currentUser._id} />
      )}

      {/* Board header */}
      <div className="shrink-0 px-5 py-3 border-b border-surface-border dark:border-surface-dark-border bg-white dark:bg-surface-dark-secondary flex items-center gap-4">
        <button onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
          <ArrowLeft size={15} />
        </button>

        {project && (
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: project.coverColor }}>
              <HardHat size={14} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-[var(--color-text)] truncate">{project.name}</p>
                <PhaseBadge phase={project.phase} />
              </div>
              <p className="text-2xs text-[var(--color-text-muted)]">{project.jobNumber}</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          <div className="text-center"><p className="font-bold text-[var(--color-text)]">{totalTasks}</p><p className="text-[var(--color-text-muted)]">tasks</p></div>
          <div className="text-center"><p className="font-bold text-emerald-600">{doneTasks}</p><p className="text-[var(--color-text-muted)]">done</p></div>
          {overdueCount > 0 && <div className="text-center"><p className="font-bold text-red-500">{overdueCount}</p><p className="text-[var(--color-text-muted)]">overdue</p></div>}
        </div>

        {/* Live presence bar */}
        {board && <BoardPresenceBar boardId={board._id} />}

        {/* Quick create task */}
        {quickOpen ? (
          <div className="flex items-center gap-1.5">
            <input
              ref={quickInputRef}
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickCreate();
                if (e.key === 'Escape') { setQuickOpen(false); setQuickTitle(''); }
              }}
              placeholder="Task title..."
              className="h-8 px-3 text-sm rounded-lg border border-brand-300 bg-white dark:bg-surface-dark-tertiary text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-brand-500 w-48"
            />
            <Button variant="primary" size="xs" onClick={handleQuickCreate} loading={createTask.isPending}>Add</Button>
            <button onClick={() => { setQuickOpen(false); setQuickTitle(''); }} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors">
              <X size={14} />
            </button>
          </div>
        ) : (
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setQuickOpen(true)}>
            New Task
          </Button>
        )}
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-hidden">
        {board && wsId && (
          <KanbanBoard boardId={board._id} projectId={projectId} workspaceId={wsId} />
        )}
      </div>
    </div>
  );
};

export default BoardPage;
