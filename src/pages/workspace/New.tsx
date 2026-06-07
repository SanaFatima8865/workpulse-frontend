import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm }     from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z }           from 'zod';
import { motion }      from 'framer-motion';
import { Building2, Hash, ArrowLeft, Zap } from 'lucide-react';

import { useTitle }           from '@/hooks';
import { Button }             from '@/components/ui/Button';
import { Input }              from '@/components/ui/Input';
import { cn }                 from '@/lib/cn';
import { useCreateWorkspace } from '@/features/workspaces';

const schema = z.object({
  name:        z.string().min(2, 'At least 2 characters').max(60),
  description: z.string().max(500).optional(),
  slug:        z.string().min(2).max(40).regex(/^[a-z0-9-]*$/, 'Lowercase, numbers, hyphens only').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

const COLORS = [
  '#6453f8','#14b8a6','#f97316','#ef4444',
  '#8b5cf6','#ec4899','#06b6d4','#84cc16',
];

const NewWorkspacePage: React.FC = () => {
  useTitle('New Workspace');
  const navigate        = useNavigate();
  const createWorkspace = useCreateWorkspace();
  const [color, setColor] = React.useState(COLORS[0]);

  const { register, handleSubmit, watch, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const name    = watch('name', '');
  const preview = name[0]?.toUpperCase() ?? 'W';

  const onSubmit = (data: FormData) => {
    createWorkspace.mutate(
      { ...data, slug: data.slug || undefined },
      { onSuccess: () => navigate('/dashboard') }
    );
  };

  return (
    <div className="min-h-full flex items-center justify-center p-6 bg-gradient-brand-soft dark:bg-gradient-dark">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-6 transition-colors"
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div className="bg-white dark:bg-surface-dark-secondary rounded-2xl border border-surface-border dark:border-surface-dark-border shadow-modal p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-brand rounded-xl flex items-center justify-center shadow-brand">
              <Zap size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-[var(--color-text)]">
                New Workspace
              </h1>
              <p className="text-xs text-[var(--color-text-muted)]">
                Create a shared space for your team
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            {/* Color + preview */}
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-brand shrink-0 transition-colors duration-200"
                style={{ backgroundColor: color }}
              >
                {preview}
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                  Pick a color
                </p>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button
                      key={c} type="button" onClick={() => setColor(c)}
                      className={cn(
                        'w-6 h-6 rounded-full transition-all duration-150',
                        color === c ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'hover:scale-110'
                      )}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <Input
              {...register('name')}
              label="Workspace name"
              placeholder="My Team, Acme Corp..."
              leftIcon={<Building2 size={15} />}
              error={errors.name?.message}
              disabled={createWorkspace.isPending}
              autoFocus
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">
                Description <span className="text-[var(--color-text-muted)] font-normal">(optional)</span>
              </label>
              <textarea
                {...register('description')}
                placeholder="What does this workspace do?"
                rows={2}
                disabled={createWorkspace.isPending}
                className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              />
            </div>

            <Input
              {...register('slug')}
              label="URL slug (optional)"
              placeholder="my-team"
              leftIcon={<Hash size={15} />}
              hint="Auto-generated if left blank"
              error={errors.slug?.message}
              disabled={createWorkspace.isPending}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={createWorkspace.isPending}
            >
              Create Workspace
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default NewWorkspacePage;
