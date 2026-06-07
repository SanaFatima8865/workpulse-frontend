import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Plus, Loader2, AlertCircle, Clock } from 'lucide-react';

import { Modal }   from '@/components/ui/Modal';
import { Button }  from '@/components/ui/Button';
import { Badge }   from '@/components/ui/Badge';
import { cn }      from '@/lib/cn';
import { useGenerateTasks } from '../api/aiApi';
import { useCreateTask }    from '@/features/boards';
import type { GeneratedTask } from '../api/aiApi';

const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high:     'bg-orange-100 text-orange-700',
  medium:   'bg-amber-100 text-amber-700',
  low:      'bg-blue-100 text-blue-700',
};

interface TaskGeneratorModalProps {
  open:      boolean;
  onClose:   () => void;
  projectId: string;
  boardId:   string;
  groupId:   string;
}

export const TaskGeneratorModal: React.FC<TaskGeneratorModalProps> = ({
  open, onClose, projectId, boardId, groupId,
}) => {
  const generate   = useGenerateTasks(projectId);
  const createTask = useCreateTask();

  const [tasks,    setTasks]    = React.useState<GeneratedTask[]>([]);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [creating, setCreating] = React.useState(false);
  const [created,  setCreated]  = React.useState(0);
  const [step,     setStep]     = React.useState<'idle' | 'generated' | 'done'>('idle');

  const handleGenerate = async () => {
    const res = await generate.mutateAsync();
    const generated = res.data?.tasks ?? [];
    setTasks(generated);
    setSelected(new Set(generated.map((_, i) => i)));
    setStep('generated');
  };

  const toggleSelect = (i: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleCreateSelected = async () => {
    setCreating(true);
    const toCreate = tasks.filter((_, i) => selected.has(i));
    let count = 0;
    for (const task of toCreate) {
      await createTask.mutateAsync({
        title:          task.title,
        boardId,
        groupId,
        projectId,
        priority:       task.priority as never,
        estimatedHours: task.estimatedHours,
        labels:         task.labels,
      });
      count++;
      setCreated(count);
    }
    setStep('done');
    setCreating(false);
  };

  const handleClose = () => {
    setTasks([]); setSelected(new Set()); setStep('idle'); setCreated(0);
    onClose();
  };

  return (
    <Modal
      open={open} onClose={handleClose}
      title={
        <span className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          AI Task Generator
        </span>
      }
      description="Generate phase-appropriate tasks for your project using AI."
      size="lg"
      footer={
        step === 'generated' ? (
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-[var(--color-text-muted)]">{selected.size} of {tasks.length} tasks selected</p>
            <div className="flex gap-3">
              <Button variant="secondary" size="md" onClick={() => setStep('idle')}>Regenerate</Button>
              <Button variant="primary" size="md" loading={creating} disabled={selected.size === 0 || creating}
                onClick={handleCreateSelected}>
                Create {selected.size} Task{selected.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        ) : step === 'done' ? (
          <div className="flex justify-end w-full">
            <Button variant="primary" size="md" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <div className="flex justify-end gap-3 w-full">
            <Button variant="secondary" size="md" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" size="md" loading={generate.isPending}
              leftIcon={<Sparkles size={15} />} onClick={handleGenerate}>
              Generate Tasks
            </Button>
          </div>
        )
      }
    >
      <div className="min-h-[300px]">
        {/* IDLE */}
        {step === 'idle' && !generate.isPending && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
            <div className="w-14 h-14 bg-gradient-brand rounded-2xl flex items-center justify-center">
              <Sparkles size={26} className="text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--color-text)]">Generate Smart Tasks</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1 max-w-xs">
                AI analyzes your project's phase, type, and context to generate 10 relevant, actionable tasks.
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {['Phase-aware','Prioritized','Estimated'].map(tag => (
                <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 border border-brand-100 dark:border-brand-900">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {/* LOADING */}
        {generate.isPending && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 size={32} className="text-brand-600 animate-spin" />
            <p className="text-sm text-[var(--color-text-muted)]">AI is analyzing your project...</p>
          </div>
        )}

        {/* GENERATED */}
        {step === 'generated' && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setSelected(new Set(tasks.map((_,i) => i)))} className="text-xs text-brand-600 hover:underline font-medium">Select all</button>
              <span className="text-[var(--color-text-muted)]">·</span>
              <button onClick={() => setSelected(new Set())} className="text-xs text-[var(--color-text-muted)] hover:underline">Deselect all</button>
            </div>
            {tasks.map((task, i) => (
              <motion.div
                key={i}
                className={cn(
                  'flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all',
                  selected.has(i)
                    ? 'bg-brand-50 dark:bg-brand-950/20 border-brand-200 dark:border-brand-800'
                    : 'bg-white dark:bg-surface-dark-secondary border-surface-border dark:border-surface-dark-border hover:border-brand-200'
                )}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}
                onClick={() => toggleSelect(i)}
              >
                {/* Checkbox */}
                <div className={cn(
                  'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
                  selected.has(i) ? 'bg-brand-600 border-brand-600' : 'border-surface-border-strong dark:border-surface-dark-border'
                )}>
                  {selected.has(i) && <Check size={11} className="text-white" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--color-text)] leading-snug">{task.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className={cn('text-2xs font-bold px-1.5 py-0.5 rounded capitalize', PRIORITY_COLORS[task.priority] ?? 'bg-gray-100 text-gray-700')}>
                      {task.priority}
                    </span>
                    <span className="flex items-center gap-0.5 text-2xs text-[var(--color-text-muted)]">
                      <Clock size={10} />{task.estimatedHours}h
                    </span>
                    {task.labels.map(l => (
                      <span key={l} className="text-2xs font-medium px-1.5 py-0.5 rounded bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text-muted)]">{l}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* DONE */}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center">
              <Check size={26} className="text-emerald-600" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[var(--color-text)]">{created} Tasks Created!</h3>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">Tasks have been added to your board.</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
