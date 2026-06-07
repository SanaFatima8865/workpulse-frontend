import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';

import { Modal }   from '@/components/ui/Modal';
import { Input }   from '@/components/ui/Input';
import { Button }  from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectModal, closeModal } from '@/store/uiSlice';
import { selectCurrentUser } from '@/store/authSlice';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { useProjects } from '@/features/projects';
import { boardApi, taskApi } from '@/features/boards';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  title:     z.string().min(1, 'Title is required').max(500),
  projectId: z.string().min(1, 'Select a project'),
  priority:  z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  dueDate:   z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const PRIORITY_OPTIONS = [
  { value: 'critical', label: '🔴 Critical' },
  { value: 'high',     label: '🟠 High' },
  { value: 'medium',   label: '🟡 Medium' },
  { value: 'low',      label: '🔵 Low' },
];

// ─── CreateTaskModal ──────────────────────────────────────────────────────────

export const CreateTaskModal: React.FC = () => {
  const dispatch   = useAppDispatch();
  const isOpen     = useAppSelector(selectModal('createTask'));
  const user       = useAppSelector(selectCurrentUser);
  const workspace  = useAppSelector(selectActiveWorkspace);
  const wsId       = workspace?._id ?? '';

  const [submitting, setSubmitting] = React.useState(false);

  const { data: projects = [] } = useProjects(undefined);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'medium' },
  });

  const onClose = () => {
    reset();
    dispatch(closeModal('createTask'));
  };

  const onSubmit = async (data: FormData) => {
    if (!wsId) { toast.error('No active workspace'); return; }
    setSubmitting(true);
    try {
      // Fetch default board for the selected project
      const boardRes = await boardApi.getDefaultForProject(data.projectId, wsId);
      const board = boardRes.data;
      if (!board) { toast.error('No board found for this project'); return; }

      const firstGroup = [...board.groups].sort((a, b) => a.position - b.position)[0];
      if (!firstGroup) { toast.error('Project board has no columns'); return; }

      await taskApi.create(wsId, {
        title:       data.title,
        boardId:     board._id,
        groupId:     firstGroup._id,
        projectId:   data.projectId,
        priority:    data.priority,
        dueDate:     data.dueDate || undefined,
        assigneeIds: user ? [user._id] : [],
      });

      toast.success('Task created');
      onClose();
    } catch {
      toast.error('Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Create New Task"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={submitting} onClick={handleSubmit(onSubmit)}>
            Create Task
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          {...register('title')}
          label="Task Title *"
          placeholder="What needs to be done?"
          error={errors.title?.message}
          autoFocus
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Project *</label>
          <select
            {...register('projectId')}
            className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-[var(--color-text)]"
          >
            <option value="">Select a project...</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name} — {p.jobNumber}</option>
            ))}
          </select>
          {errors.projectId && <p className="text-xs text-red-500">{errors.projectId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Priority</label>
            <select
              {...register('priority')}
              className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-[var(--color-text)]"
            >
              {PRIORITY_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <Input
            {...register('dueDate')}
            label="Due Date (optional)"
            type="date"
          />
        </div>

        <p className="text-xs text-[var(--color-text-muted)]">
          Task will be created in the first column of the selected project's board and assigned to you.
        </p>
      </form>
    </Modal>
  );
};
