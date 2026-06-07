import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Hash } from 'lucide-react';

import { Modal }   from '@/components/ui/Modal';
import { Button }  from '@/components/ui/Button';
import { Input }   from '@/components/ui/Input';
import { cn }      from '@/lib/cn';
import { useCreateWorkspace } from '../hooks/useWorkspaces';

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z
    .string({ required_error: 'Workspace name is required' })
    .min(2, 'Must be at least 2 characters')
    .max(60, 'Must be under 60 characters'),
  description: z.string().max(500).optional(),
  slug: z
    .string()
    .min(2)
    .max(40)
    .regex(/^[a-z0-9-]*$/, 'Lowercase letters, numbers, and hyphens only')
    .optional()
    .or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const COLORS = [
  '#6453f8', '#14b8a6', '#f97316', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16',
];

// ─── Component ────────────────────────────────────────────────────────────────

interface CreateWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ open, onClose }) => {
  const createWorkspace         = useCreateWorkspace();
  const [selectedColor, setSelectedColor] = React.useState(COLORS[0]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const name = watch('name', '');
  const preview = name[0]?.toUpperCase() ?? 'W';

  const onSubmit = (data: FormData) => {
    createWorkspace.mutate(
      { ...data, slug: data.slug || undefined },
      {
        onSuccess: () => {
          reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Workspace"
      description="Workspaces are shared environments where teams collaborate on projects."
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose} disabled={createWorkspace.isPending}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={createWorkspace.isPending}
            onClick={handleSubmit(onSubmit)}
          >
            Create Workspace
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Preview + Color picker */}
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-brand shrink-0 transition-colors duration-200"
            style={{ backgroundColor: selectedColor }}
          >
            {preview}
          </div>

          <div className="flex-1">
            <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
              Workspace color
            </p>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={cn(
                    'w-6 h-6 rounded-full transition-all duration-150',
                    selectedColor === color
                      ? 'ring-2 ring-offset-2 ring-brand-500 scale-110'
                      : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Name */}
        <Input
          {...register('name')}
          label="Workspace name"
          placeholder="Acme Corp, My Team, Side Project..."
          leftIcon={<Building2 size={15} />}
          error={errors.name?.message}
          disabled={createWorkspace.isPending}
          autoFocus
        />

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)] leading-none">
            Description <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
          </label>
          <textarea
            {...register('description')}
            placeholder="What does this workspace do?"
            rows={2}
            disabled={createWorkspace.isPending}
            className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-150 resize-none"
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Slug */}
        <Input
          {...register('slug')}
          label="URL slug"
          placeholder="acme-corp"
          leftIcon={<Hash size={15} />}
          hint="Lowercase letters, numbers, and hyphens only. Leave blank to auto-generate."
          error={errors.slug?.message}
          disabled={createWorkspace.isPending}
        />
      </form>
    </Modal>
  );
};
