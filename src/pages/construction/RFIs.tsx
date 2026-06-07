import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Plus, MessageSquare, Clock, AlertCircle, CheckCircle2, X, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useTitle }   from '@/hooks';
import { Card }       from '@/components/ui/Card';
import { Button }     from '@/components/ui/Button';
import { Input }      from '@/components/ui/Input';
import { Badge }      from '@/components/ui/Badge';
import { Modal }      from '@/components/ui/Modal';
import { Skeleton }   from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn }         from '@/lib/cn';
import { formatDate, formatRelative } from '@/lib/utils';
import { useRFIs, useCreateRFI, useUpdateRFI, useRespondRFI, useRFIStats } from '@/features/construction/api/constructionApi';
import type { PublicRFI } from '@/features/construction/api/constructionApi';
import { useProject }  from '@/features/projects';

const STATUS_COLORS: Record<string, string> = {
  draft:    'bg-gray-100 text-gray-600', open:     'bg-blue-100 text-blue-700',
  answered: 'bg-amber-100 text-amber-700', closed: 'bg-emerald-100 text-emerald-700',
  void:     'bg-red-100 text-red-600',
};
const PRIORITY_COLORS: Record<string, string> = {
  critical: 'bg-red-100 text-red-700', high: 'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-600', low: 'bg-blue-100 text-blue-700',
};

const RFIDetailPanel: React.FC<{ rfi: PublicRFI; onClose: () => void; projectId: string }> = ({ rfi, onClose, projectId }) => {
  const [responseText, setResponseText] = React.useState('');
  const respond   = useRespondRFI();
  const updateRFI = useUpdateRFI();

  const handleRespond = () => {
    if (!responseText.trim()) return;
    respond.mutate({ id: rfi._id, content: responseText }, { onSuccess: () => setResponseText('') });
  };

  return (
    <motion.div
      className="fixed right-0 top-0 bottom-0 z-40 w-full max-w-[480px] bg-white dark:bg-surface-dark-secondary shadow-modal border-l border-surface-border dark:border-surface-dark-border flex flex-col"
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-surface-border dark:border-surface-dark-border shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-[var(--color-text-muted)] bg-surface-secondary px-1.5 py-0.5 rounded">{rfi.rfiNumber}</span>
            <span className={cn('text-2xs font-medium px-1.5 py-0.5 rounded capitalize', STATUS_COLORS[rfi.status])}>{rfi.status}</span>
            <span className={cn('text-2xs font-medium px-1.5 py-0.5 rounded capitalize', PRIORITY_COLORS[rfi.priority])}>{rfi.priority}</span>
          </div>
          <h2 className="text-base font-bold text-[var(--color-text)] leading-snug">{rfi.subject}</h2>
          {rfi.discipline && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Discipline: {rfi.discipline}</p>}
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary transition-colors"><X size={18} /></button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">Description</p>
          <p className="text-sm text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">{rfi.description}</p>
        </div>

        {(rfi.impact !== 'none') && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
            <AlertCircle size={14} className="text-amber-600 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-amber-700 dark:text-amber-400 capitalize">Impact: {rfi.impact}</p>
              <p className="text-amber-600 mt-0.5">
                {rfi.costImpact && `Cost: $${rfi.costImpact.toLocaleString()}`}
                {rfi.schedImpact && `  Schedule: ${rfi.schedImpact} days`}
              </p>
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><p className="text-[var(--color-text-muted)]">Due Date</p><p className="font-medium text-[var(--color-text)]">{rfi.dueDate ? formatDate(rfi.dueDate) : '—'}</p></div>
          <div><p className="text-[var(--color-text-muted)]">Created</p><p className="font-medium text-[var(--color-text)]">{formatRelative(rfi.createdAt)}</p></div>
        </div>

        {/* Responses */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">Responses ({rfi.responses.length})</p>
          {rfi.responses.length === 0
            ? <p className="text-xs text-[var(--color-text-muted)] text-center py-3">No responses yet</p>
            : rfi.responses.map(resp => (
              <div key={resp._id} className="bg-surface-secondary dark:bg-surface-dark-tertiary rounded-xl p-3 mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-[var(--color-text)]">{resp.respondedBy.slice(-8)}</p>
                  <p className="text-2xs text-[var(--color-text-muted)]">{formatRelative(resp.respondedAt)}</p>
                </div>
                <p className="text-xs text-[var(--color-text)] leading-relaxed whitespace-pre-wrap">{resp.content}</p>
              </div>
            ))
          }
        </div>
      </div>

      {/* Actions */}
      <div className="shrink-0 px-5 py-4 border-t border-surface-border dark:border-surface-dark-border space-y-3">
        {rfi.status !== 'closed' && rfi.status !== 'void' && (
          <div className="flex items-end gap-2 bg-surface-secondary dark:bg-surface-dark-tertiary rounded-xl px-3 py-2">
            <textarea value={responseText} onChange={e => setResponseText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleRespond(); } }}
              placeholder="Add a response..." rows={2}
              className="flex-1 bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none resize-none" />
            <button onClick={handleRespond} disabled={!responseText.trim() || respond.isPending}
              className="text-brand-600 disabled:opacity-30 hover:text-brand-700 transition-colors mb-0.5"><Send size={15} /></button>
          </div>
        )}
        <div className="flex gap-2">
          {rfi.status === 'answered' && (
            <Button variant="primary" size="sm" fullWidth leftIcon={<CheckCircle2 size={14} />}
              onClick={() => updateRFI.mutate({ id: rfi._id, data: { status: 'closed' } })}>
              Close RFI
            </Button>
          )}
          {rfi.status === 'open' && (
            <Button variant="secondary" size="sm" fullWidth
              onClick={() => updateRFI.mutate({ id: rfi._id, data: { status: 'void' } })}>
              Void RFI
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const RFIPage: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project } = useProject(projectId);
  useTitle('RFI Log');

  const { data: rfis = [], isLoading } = useRFIs(projectId);
  const createRFI = useCreateRFI(projectId);
  const { data: stats = [] } = useRFIStats(projectId);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [selectedRFI, setSelectedRFI] = React.useState<PublicRFI | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<PublicRFI>>();

  const filtered = statusFilter === 'all' ? rfis : rfis.filter(r => r.status === statusFilter);

  const onSubmit = (data: Partial<PublicRFI>) => {
    createRFI.mutate(data, { onSuccess: () => { reset(); setCreateOpen(false); } });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/construction/${projectId}`)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary transition-colors"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-[var(--color-text)]">RFI Log</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{project?.name} · {project?.jobNumber}</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>New RFI</Button>
      </div>

      {/* Stats */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {(['all', 'open', 'answered', 'closed'] as const).map(s => {
          const count = s === 'all' ? rfis.length : (stats as Array<{_id:string;count:number}>).find(st => st._id === s)?.count ?? 0;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize', statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text-secondary)] hover:bg-surface-tertiary')}>
              {s} <span className={cn('font-bold', statusFilter === s ? 'text-white/80' : 'text-[var(--color-text-muted)]')}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4].map(i => <Skeleton key={i} height={64} className="rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No RFIs" description="Create your first Request for Information" action={{ label: 'New RFI', onClick: () => setCreateOpen(true) }} />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
            {filtered.map((rfi) => {
              const isOverdue = rfi.dueDate && new Date(rfi.dueDate) < new Date() && !['closed','void'].includes(rfi.status);
              return (
                <div key={rfi._id} onClick={() => setSelectedRFI(rfi)}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-secondary/50 transition-colors cursor-pointer">
                  <span className="text-xs font-mono text-[var(--color-text-muted)] w-24 shrink-0">{rfi.rfiNumber}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-text)] truncate">{rfi.subject}</p>
                    <p className="text-xs text-[var(--color-text-muted)]">{rfi.discipline} · {rfi.responses.length} response{rfi.responses.length !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {isOverdue && <AlertCircle size={13} className="text-red-500" />}
                    <span className={cn('text-2xs font-medium px-1.5 py-0.5 rounded capitalize', PRIORITY_COLORS[rfi.priority])}>{rfi.priority}</span>
                    <span className={cn('text-2xs font-medium px-1.5 py-0.5 rounded capitalize', STATUS_COLORS[rfi.status])}>{rfi.status}</span>
                    {rfi.dueDate && <span className={cn('text-2xs', isOverdue ? 'text-red-500 font-semibold' : 'text-[var(--color-text-muted)]')}>{formatDate(rfi.dueDate)}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New RFI" size="md"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" size="md" onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="primary" size="md" loading={createRFI.isPending} onClick={handleSubmit(onSubmit)}>Create RFI</Button></div>}>
        <form className="space-y-4" noValidate>
          <Input {...register('subject', { required: 'Subject required' })} label="Subject *" placeholder="Describe the information needed..." error={errors.subject?.message} autoFocus />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Description *</label>
            <textarea {...register('description')} rows={4} placeholder="Detailed description of the question or clarification needed..."
              className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Priority</label>
              <select {...register('priority')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option><option value="low">Low</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Impact</label>
              <select {...register('impact')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="none">None</option><option value="cost">Cost</option><option value="schedule">Schedule</option><option value="both">Both</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input {...register('discipline')} label="Discipline" placeholder="Architectural, MEP..." />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Due Date</label>
              <input {...register('dueDate')} type="date" className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
        </form>
      </Modal>

      {/* Detail Panel */}
      <AnimatePresence>
        {selectedRFI && (
          <>
            <motion.div className="fixed inset-0 z-30 bg-black/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRFI(null)} />
            <RFIDetailPanel rfi={selectedRFI} onClose={() => setSelectedRFI(null)} projectId={projectId} />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RFIPage;
