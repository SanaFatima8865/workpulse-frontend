import React from 'react';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  closestCorners, useDroppable, useDraggable,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, MoreHorizontal, GripVertical, ChevronDown, Trash2, Edit2,
} from 'lucide-react';

import { Button }   from '@/components/ui/Button';
import { Input }    from '@/components/ui/Input';
import { Dropdown } from '@/components/ui/Dropdown';
import { Skeleton } from '@/components/ui/Spinner';
import { cn }       from '@/lib/cn';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectTasksByGroup, selectActiveBoard } from '@/store/boardSlice';
import type { PublicTask, BoardGroup } from '@/store/boardSlice';
import {
  useTasksByBoard, useCreateTask, useMoveTask,
  useAddBoardGroup, useUpdateBoardGroup, useDeleteBoardGroup,
} from '../hooks/useBoards';
import { TaskCard }       from './TaskCard';
import { TaskDetailPanel } from './TaskDetailPanel';

// ─── Column Colors ────────────────────────────────────────────────────────────

const DEFAULT_COLORS = [
  '#9CA3AF','#6453f8','#F59E0B','#10B981','#EF4444',
  '#8B5CF6','#14B8A6','#F97316','#3B82F6','#EC4899',
];

// ─── SortableTaskCard ─────────────────────────────────────────────────────────

const SortableTaskCard: React.FC<{ task: PublicTask }> = ({ task }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 999 : undefined };
  return (
    <TaskCard
      ref={setNodeRef}
      task={task}
      isDragging={isDragging}
      dragAttributes={attributes}
      dragListeners={listeners}
      style={style}
    />
  );
};

// ─── Column ───────────────────────────────────────────────────────────────────

interface ColumnProps {
  group: BoardGroup;
  tasks: PublicTask[];
  boardId: string;
  projectId: string;
  onAddTask: (groupId: string, title: string) => void;
  isAddingTask: boolean;
}

const Column: React.FC<ColumnProps> = ({ group, tasks, boardId, projectId, onAddTask, isAddingTask }) => {
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [showAddTask,  setShowAddTask]  = React.useState(false);
  const [editingName,  setEditingName]  = React.useState(false);
  const [groupName,    setGroupName]    = React.useState(group.name);

  const updateGroup = useUpdateBoardGroup(boardId);
  const deleteGroup = useDeleteBoardGroup(boardId);

  const { setNodeRef } = useDroppable({ id: group._id });

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    onAddTask(group._id, newTaskTitle.trim());
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center gap-2 px-1 pb-2 mb-2 shrink-0">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: group.color }} />

        {editingName ? (
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onBlur={() => { updateGroup.mutate({ groupId: group._id, name: groupName }); setEditingName(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { updateGroup.mutate({ groupId: group._id, name: groupName }); setEditingName(false); } }}
            className="flex-1 text-sm font-bold bg-surface-secondary dark:bg-surface-dark-tertiary rounded px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-brand-500"
            autoFocus
          />
        ) : (
          <span className="flex-1 text-sm font-bold text-[var(--color-text)]">{group.name}</span>
        )}

        <span className="text-xs text-[var(--color-text-muted)] bg-surface-secondary dark:bg-surface-dark-tertiary px-1.5 py-0.5 rounded-full font-medium">
          {tasks.length}
        </span>

        <Dropdown
          trigger={<Button variant="ghost" size="xs"><MoreHorizontal size={14} /></Button>}
          items={[
            { label: 'Rename', icon: <Edit2 size={13} />, onClick: () => setEditingName(true) },
            { label: '', onClick: undefined, divider: true },
            { label: 'Delete Column', icon: <Trash2 size={13} />, danger: true,
              onClick: () => { if (confirm(`Delete column "${group.name}"?`)) deleteGroup.mutate(group._id); } },
          ]}
          align="right" width={160}
        />
      </div>

      {/* Tasks + Add button (scrollable together) */}
      <div
        ref={setNodeRef}
        className={cn(
          'rounded-xl p-2 min-h-[100px] max-h-[calc(100vh-220px)] overflow-y-auto transition-colors',
          'bg-surface-secondary/60 dark:bg-surface-dark-tertiary/40',
          tasks.length === 0 && !showAddTask && 'border-2 border-dashed border-surface-border dark:border-surface-dark-border'
        )}
      >
        <SortableContext items={tasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map(task => <SortableTaskCard key={task._id} task={task} />)}
          </div>
        </SortableContext>

        {/* Add task inline form */}
        <AnimatePresence>
          {showAddTask && (
            <motion.div
              className="mt-2"
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -4, height: 0 }}
            >
              <div className="bg-white dark:bg-surface-dark-secondary rounded-xl border border-brand-300 shadow-card p-2 space-y-2">
                <textarea
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddTask(); } if (e.key === 'Escape') { setShowAddTask(false); setNewTaskTitle(''); } }}
                  placeholder="Task title... (Enter to add)"
                  rows={2}
                  className="w-full text-sm bg-transparent text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none resize-none leading-snug"
                  autoFocus
                />
                <div className="flex gap-1.5">
                  <Button variant="primary" size="xs" onClick={handleAddTask} loading={isAddingTask}>Add Task</Button>
                  <Button variant="ghost" size="xs" onClick={() => { setShowAddTask(false); setNewTaskTitle(''); }}>Cancel</Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Add task button — inside scroll area so it's always reachable */}
        {!showAddTask && (
          <button
            onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1.5 mt-2 px-2 py-1.5 rounded-lg text-xs text-[var(--color-text-muted)] hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary hover:text-[var(--color-text)] transition-colors w-full"
          >
            <Plus size={13} />
            Add task
          </button>
        )}
      </div>
    </div>
  );
};

// ─── KanbanBoard ──────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  boardId: string;
  projectId: string;
  workspaceId: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardId, projectId, workspaceId }) => {
  const dispatch     = useAppDispatch();
  const board        = useAppSelector(selectActiveBoard);
  const tasksByGroup = useAppSelector(selectTasksByGroup);
  const currentUser  = useAppSelector((s) => s.auth.user);
  const moveTask     = useMoveTask();
  const createTask   = useCreateTask();
  const addGroup     = useAddBoardGroup(boardId);

  const { isLoading } = useTasksByBoard(boardId);

  const [activeId,    setActiveId]    = React.useState<string | null>(null);
  const [newColName,  setNewColName]  = React.useState('');
  const [addingCol,   setAddingCol]   = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  if (isLoading) {
    return (
      <div className="flex gap-4 p-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="w-72 shrink-0 space-y-2">
            <Skeleton height={28} width={120} />
            {[1,2,3].map(j => <Skeleton key={j} height={90} className="rounded-xl" />)}
          </div>
        ))}
      </div>
    );
  }

  if (!board) return null;

  const groups = [...board.groups].sort((a, b) => a.position - b.position);

  const findGroupForTask = (taskId: string): string | undefined => {
    return Object.keys(tasksByGroup).find(gid => tasksByGroup[gid]?.some(t => t._id === taskId));
  };

  const activeTask = activeId ? Object.values(tasksByGroup).flat().find(t => t._id === activeId) : null;

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);
  const handleDragEnd   = (e: DragEndEvent) => {
    const { active, over } = e;
    setActiveId(null);
    if (!over) return;

    const taskId      = active.id as string;
    const sourceGroup = findGroupForTask(taskId);
    if (!sourceGroup) return;

    // Determine target group
    let targetGroup = over.id as string;
    if (!groups.find(g => g._id === targetGroup)) {
      // Dropped on a task - find its group
      targetGroup = findGroupForTask(targetGroup) ?? sourceGroup;
    }

    const targetTasks = tasksByGroup[targetGroup] ?? [];
    const targetPos   = targetTasks.length > 0 ? (targetTasks[targetTasks.length - 1].position + 1000) : 1000;

    if (sourceGroup !== targetGroup || active.id !== over.id) {
      moveTask.mutate({
        taskId,
        targetGroupId:  targetGroup,
        targetPosition: targetPos,
        sourceGroupId:  sourceGroup,
      });
    }
  };

  const handleAddTask = (groupId: string, title: string) => {
    createTask.mutate({
      title, boardId, groupId, projectId,
      assigneeIds: currentUser ? [currentUser._id] : [],
    });
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    addGroup.mutate({ name: newColName.trim() }, {
      onSuccess: () => { setNewColName(''); setAddingCol(false); }
    });
  };

  return (
    <div className="relative h-full flex flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Board */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <div className="flex gap-4 p-4 items-start min-w-max">
            {groups.map(group => (
              <Column
                key={group._id}
                group={group}
                tasks={tasksByGroup[group._id] ?? []}
                boardId={boardId}
                projectId={projectId}
                onAddTask={handleAddTask}
                isAddingTask={createTask.isPending}
              />
            ))}

            {/* Add column */}
            <div className="w-72 shrink-0">
              {addingCol ? (
                <div className="bg-white dark:bg-surface-dark-secondary rounded-xl border border-brand-300 p-3 space-y-2 shadow-card">
                  <Input
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddColumn(); if (e.key === 'Escape') { setAddingCol(false); setNewColName(''); } }}
                    placeholder="Column name..."
                    size="sm"
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    <Button variant="primary" size="xs" onClick={handleAddColumn} loading={addGroup.isPending}>Add Column</Button>
                    <Button variant="ghost" size="xs" onClick={() => { setAddingCol(false); setNewColName(''); }}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingCol(true)}
                  className="flex items-center gap-2 w-full px-4 py-3 rounded-xl border-2 border-dashed border-surface-border dark:border-surface-dark-border text-sm text-[var(--color-text-muted)] hover:border-brand-300 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/20 transition-all"
                >
                  <Plus size={16} />
                  Add Column
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeTask && <TaskCard task={activeTask} overlay />}
        </DragOverlay>
      </DndContext>

      {/* Task detail panel */}
      <TaskDetailPanel />
    </div>
  );
};
