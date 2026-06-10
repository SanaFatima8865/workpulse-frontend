import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, CheckCircle2, Circle, AlertCircle, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useTitle }   from '@/hooks';
import { Card }       from '@/components/ui/Card';
import { Button }     from '@/components/ui/Button';
import { Input }      from '@/components/ui/Input';
import { Modal }      from '@/components/ui/Modal';
import { Skeleton }   from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Progress }   from '@/components/ui/Progress';
import { cn }         from '@/lib/cn';
import { usePunchItems, useCreatePunchItem, useUpdatePunchItem, usePunchStats } from '@/features/construction/api/constructionApi';
import type { PublicPunchItem } from '@/features/construction/api/constructionApi';
import { useProject } from '@/features/projects';

const STATUS_ICON: Record<string, React.ReactNode> = {
  open:                  <Circle size={16} className="text-gray-400" />,
  in_progress:           <Circle size={16} className="text-blue-500 fill-blue-200" />,
  ready_for_inspection:  <AlertCircle size={16} className="text-amber-500" />,
  resolved:              <CheckCircle2 size={16} className="text-emerald-500" />,
  void:                  <Circle size={16} className="text-gray-300" />,
};

const PRIORITY_COLORS: Record<string,string> = {
  critical:'text-red-500', high:'text-orange-500', medium:'text-amber-500', low:'text-blue-400',
};

const PunchListPage: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project } = useProject(projectId);
  useTitle('Punch List');

  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [tradeFilter,  setTradeFilter]  = React.useState<string>('all');
  const [createOpen,   setCreateOpen]   = React.useState(false);

  const params = { ...(statusFilter !== 'all' ? { status: statusFilter } : {}), ...(tradeFilter !== 'all' ? { trade: tradeFilter } : {}) };
  const { data: items = [], isLoading } = usePunchItems(projectId, params);
  const { data: stats } = usePunchStats(projectId) as { data?: { byStatus: Array<{_id:string;count:number}>; byTrade: Array<{_id:string;count:number}> } };
  const createItem = useCreatePunchItem(projectId);
  const updateItem = useUpdatePunchItem(projectId);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Partial<PublicPunchItem>>();

  const totalItems    = stats?.byStatus?.reduce((s,r) => s + r.count, 0) ?? 0;
  const resolvedItems = stats?.byStatus?.find(s => s._id === 'resolved')?.count ?? 0;
  const trades        = [...new Set(items.map(i => i.trade).filter(Boolean))];

  const onSubmit = (data: Partial<PublicPunchItem>) => {
    createItem.mutate(data, { onSuccess: () => { reset(); setCreateOpen(false); } });
  };

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(`/construction/${projectId}`)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary transition-colors"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-[var(--color-text)]">Punch List</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{project?.name} · {project?.jobNumber}</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>Add Item</Button>
      </div>

      {/* Progress bar */}
      {totalItems > 0 && (
        <div className="mb-5 bg-white dark:bg-surface-dark-secondary rounded-2xl border border-surface-border shadow-card p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-[var(--color-text)]">Punch List Completion</p>
            <p className="text-sm font-bold text-emerald-600">{resolvedItems}/{totalItems} resolved</p>
          </div>
          <Progress value={totalItems > 0 ? (resolvedItems / totalItems) * 100 : 0} size="md" color="auto" showLabel />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['all','open','in_progress','ready_for_inspection','resolved'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn('px-2.5 py-1 rounded-full text-xs font-medium transition-all capitalize', statusFilter === s ? 'bg-brand-600 text-white' : 'bg-surface-secondary text-[var(--color-text-secondary)] hover:bg-surface-tertiary')}>
            {s.replace(/_/g,' ')}
          </button>
        ))}
        {trades.length > 0 && (
          <>
            <span className="text-[var(--color-text-muted)]">|</span>
            {['all', ...trades].map(t => (
              <button key={t} onClick={() => setTradeFilter(t as string)}
                className={cn('px-2.5 py-1 rounded-full text-xs font-medium transition-all capitalize', tradeFilter === t ? 'bg-teal-600 text-white' : 'bg-surface-secondary text-[var(--color-text-secondary)] hover:bg-surface-tertiary')}>
                {t}
              </button>
            ))}
          </>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} height={60} className="rounded-xl" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title="No punch items" description="Start documenting closeout items" action={{ label: 'Add Item', onClick: () => setCreateOpen(true) }} />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
            {items.map((item) => (
              <div key={item._id} className="flex items-center gap-3 px-5 py-3 group">
                <button
                  onClick={() => {
                    const next = item.status === 'open' ? 'in_progress' : item.status === 'in_progress' ? 'ready_for_inspection' : item.status === 'ready_for_inspection' ? 'resolved' : 'open';
                    updateItem.mutate({ id: item._id, data: { status: next as PublicPunchItem['status'] } });
                  }}
                  className="shrink-0">
                  {STATUS_ICON[item.status] ?? <Circle size={16} className="text-gray-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium text-[var(--color-text)] truncate', item.status === 'resolved' && 'line-through text-[var(--color-text-muted)]')}>
                    {item.description}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {item.trade}{item.location ? ` · ${item.location}` : ''}{item.room ? ` · ${item.room}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-mono text-[var(--color-text-muted)]">{item.itemNumber}</span>
                  <span className={cn('text-xs', PRIORITY_COLORS[item.priority])}>●</span>
                  <span className="text-2xs text-[var(--color-text-muted)] capitalize">{item.status.replace(/_/g,' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Punch Item" size="md"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" size="md" onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="primary" size="md" loading={createItem.isPending} onClick={handleSubmit(onSubmit)}>Add Item</Button></div>}>
        <form className="space-y-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Description *</label>
            <textarea {...register('description', { required: 'Description required' })} rows={3} placeholder="Describe the deficiency or incomplete item..."
              className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input {...register('trade')} label="Trade" placeholder="Electrical, Plumbing..." />
            <Input {...register('location')} label="Location" placeholder="Floor 3, Zone B..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input {...register('room')} label="Room / Area" placeholder="Conference Room 301..." />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Priority</label>
              <select {...register('priority')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option><option value="low">Low</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PunchListPage;
