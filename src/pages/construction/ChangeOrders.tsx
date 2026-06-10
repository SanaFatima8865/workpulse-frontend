import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, DollarSign, CheckCircle2, Clock, X, Trash2 } from 'lucide-react';
import { useForm, useFieldArray } from 'react-hook-form';

import { useTitle }   from '@/hooks';
import { Card }       from '@/components/ui/Card';
import { Button }     from '@/components/ui/Button';
import { Input }      from '@/components/ui/Input';
import { Badge }      from '@/components/ui/Badge';
import { Modal }      from '@/components/ui/Modal';
import { Skeleton }   from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn }         from '@/lib/cn';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useChangeOrders, useCreateCO, useApproveCO, useCOStats } from '@/features/construction/api/constructionApi';
import type { PublicChangeOrder, ICOLineItem } from '@/features/construction/api/constructionApi';
import { useProject } from '@/features/projects';

const CO_STATUS_COLORS: Record<string, string> = {
  draft:        'bg-gray-100 text-gray-600',
  pending_owner:'bg-amber-100 text-amber-700',
  pending_gc:   'bg-blue-100 text-blue-700',
  approved:     'bg-emerald-100 text-emerald-700',
  rejected:     'bg-red-100 text-red-600',
  void:         'bg-red-50 text-red-400',
};

interface COFormData {
  title:          string;
  description:    string;
  type:           string;
  scheduleImpact: number;
  justification:  string;
  lineItems: Array<{ description: string; quantity: number; unit: string; unitCost: number; category: string }>;
}

const ChangeOrdersPage: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project } = useProject(projectId);
  useTitle('Change Orders');

  const { data: cos = [], isLoading } = useChangeOrders(projectId);
  const createCO  = useCreateCO(projectId);
  const approveCO = useApproveCO(projectId);
  const { data: stats = [] } = useCOStats(projectId) as { data: Array<{_id:string;count:number;totalCost:number}> };

  const [createOpen, setCreateOpen] = React.useState(false);
  const [selectedCO, setSelectedCO] = React.useState<PublicChangeOrder | null>(null);

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<COFormData>({
    defaultValues: { lineItems: [{ description: '', quantity: 1, unit: 'LS', unitCost: 0, category: 'labor' }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'lineItems' });
  const lineItems = watch('lineItems');
  const totalCost = lineItems.reduce((s, li) => s + (Number(li.quantity) * Number(li.unitCost)), 0);

  const onSubmit = (data: COFormData) => {
    const withTotals = {
      ...data,
      lineItems: data.lineItems.map(li => ({ ...li, totalCost: Number(li.quantity) * Number(li.unitCost) })),
    };
    createCO.mutate(withTotals as Partial<PublicChangeOrder>, { onSuccess: () => { reset(); setCreateOpen(false); } });
  };

  const pendingTotal = stats.filter(s => s._id.includes('pending')).reduce((s,r) => s + r.totalCost, 0);
  const approvedTotal= stats.find(s => s._id === 'approved')?.totalCost ?? 0;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(`/construction/${projectId}`)} className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-surface-secondary transition-colors"><ArrowLeft size={18} /></button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold text-[var(--color-text)]">Change Orders</h1>
          <p className="text-xs text-[var(--color-text-muted)]">{project?.name} · {project?.jobNumber}</p>
        </div>
        <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setCreateOpen(true)}>New CO</Button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total COs', value: cos.length, icon: <DollarSign size={16} />, bg: 'bg-brand-100 text-brand-600' },
          { label: 'Approved', value: formatCurrency(approvedTotal), icon: <CheckCircle2 size={16} />, bg: 'bg-emerald-100 text-emerald-600' },
          { label: 'Pending Approval', value: formatCurrency(pendingTotal), icon: <Clock size={16} />, bg: 'bg-amber-100 text-amber-600' },
          { label: 'This Project Total', value: formatCurrency(approvedTotal + pendingTotal), icon: <DollarSign size={16} />, bg: 'bg-indigo-100 text-indigo-600' },
        ].map(({ label, value, icon, bg }, i) => (
          <motion.div key={label} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} transition={{ delay: i*0.05 }}
            className="bg-white dark:bg-surface-dark-secondary rounded-xl border border-surface-border shadow-card p-4">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2', bg)}>{icon}</div>
            <p className="text-lg font-bold text-[var(--color-text)]">{value}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* CO list */}
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} height={80} className="rounded-xl" />)}</div>
      ) : cos.length === 0 ? (
        <EmptyState title="No change orders" description="Create your first change order to track scope and cost changes" action={{ label: 'New Change Order', onClick: () => setCreateOpen(true) }} />
      ) : (
        <Card padding="none">
          <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
            {cos.map(co => (
              <div key={co._id} onClick={() => setSelectedCO(co)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-secondary/50 transition-colors cursor-pointer">
                <span className="text-xs font-mono text-[var(--color-text-muted)] w-20 shrink-0">{co.coNumber}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">{co.title}</p>
                  <p className="text-xs text-[var(--color-text-muted)] capitalize">{co.type.replace('_',' ')}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {co.scheduleDays !== 0 && <span className="text-xs text-[var(--color-text-muted)]">{co.scheduleDays > 0 ? '+':''}{co.scheduleDays}d</span>}
                  <span className="text-sm font-bold text-[var(--color-text)]">{formatCurrency(co.costImpact)}</span>
                  <span className={cn('text-2xs font-medium px-1.5 py-0.5 rounded capitalize', CO_STATUS_COLORS[co.status])}>{co.status.replace('_',' ')}</span>
                  {co.status !== 'approved' && co.status !== 'rejected' && co.status !== 'void' && (
                    <Button variant="primary" size="xs" onClick={(e) => { e.stopPropagation(); approveCO.mutate(co._id); }}>Approve</Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Change Order" size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <p className="text-sm font-bold text-[var(--color-text)]">Total: {formatCurrency(totalCost)}</p>
            <div className="flex gap-3">
              <Button variant="secondary" size="md" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button variant="primary" size="md" loading={createCO.isPending} onClick={handleSubmit(onSubmit)}>Create CO</Button>
            </div>
          </div>
        }>
        <form className="space-y-4" noValidate>
          <Input {...register('title', { required: 'Title required' })} label="Title *" placeholder="Change order description" error={errors.title?.message} autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Type</label>
              <select {...register('type')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                {['scope_addition','scope_reduction','unforeseen_conditions','design_change','owner_directive','value_engineering','other'].map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <Input {...register('scheduleImpact', { valueAsNumber: true })} label="Schedule Impact (days)" type="number" placeholder="0" />
          </div>

          {/* Line items */}
          <div>
            <p className="text-sm font-medium text-[var(--color-text)] mb-2">Line Items</p>
            <div className="space-y-2">
              {fields.map((field, i) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                  <div className="col-span-4"><Input {...register(`lineItems.${i}.description`)} placeholder="Description" size="sm" /></div>
                  <div className="col-span-2"><Input {...register(`lineItems.${i}.quantity`, { valueAsNumber: true })} placeholder="Qty" type="number" size="sm" /></div>
                  <div className="col-span-2"><Input {...register(`lineItems.${i}.unit`)} placeholder="Unit" size="sm" /></div>
                  <div className="col-span-2"><Input {...register(`lineItems.${i}.unitCost`, { valueAsNumber: true })} placeholder="Unit $" type="number" size="sm" /></div>
                  <div className="col-span-1 flex items-center justify-center pt-0.5 text-xs font-bold text-[var(--color-text)]">
                    ${((Number(lineItems[i]?.quantity)||0)*(Number(lineItems[i]?.unitCost)||0)).toLocaleString()}
                  </div>
                  <div className="col-span-1"><Button variant="ghost" size="xs" onClick={() => remove(i)}><Trash2 size={12} /></Button></div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="xs" leftIcon={<Plus size={12} />} onClick={() => append({ description:'', quantity:1, unit:'LS', unitCost:0, category:'labor' })} className="mt-2">
              Add Line Item
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Justification</label>
            <textarea {...register('justification')} rows={2} placeholder="Reason for this change..."
              className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
          </div>
        </form>
      </Modal>

      {/* CO Detail Modal */}
      {selectedCO && (
        <Modal open={!!selectedCO} onClose={() => setSelectedCO(null)} title={`${selectedCO.coNumber} — ${selectedCO.title}`} size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={cn('text-2xs font-medium px-1.5 py-0.5 rounded capitalize', CO_STATUS_COLORS[selectedCO.status])}>{selectedCO.status.replace('_',' ')}</span>
              <span className="text-2xs text-[var(--color-text-muted)] capitalize">{selectedCO.type.replace('_',' ')}</span>
              {!!selectedCO.scheduleDays && <span className="text-2xs font-medium text-amber-600">{selectedCO.scheduleDays > 0 ? '+':''}{selectedCO.scheduleDays} days</span>}
            </div>
            {selectedCO.description && <p className="text-sm text-[var(--color-text)]">{selectedCO.description}</p>}
            <div className="border border-surface-border rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-surface-secondary dark:bg-surface-dark-tertiary">
                  <tr><th className="text-left px-3 py-2">Description</th><th className="text-right px-3 py-2">Qty</th><th className="text-right px-3 py-2">Unit $</th><th className="text-right px-3 py-2">Total</th></tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {(selectedCO.lineItems ?? []).map((li, i) => (
                    <tr key={i}><td className="px-3 py-2">{li.description}</td><td className="text-right px-3 py-2">{li.quantity} {li.unit}</td><td className="text-right px-3 py-2">{formatCurrency(li.unitCost)}</td><td className="text-right px-3 py-2 font-bold">{formatCurrency(li.totalCost)}</td></tr>
                  ))}
                  <tr className="bg-surface-secondary dark:bg-surface-dark-tertiary font-bold">
                    <td colSpan={3} className="px-3 py-2 text-right">Total</td>
                    <td className="px-3 py-2 text-right">{formatCurrency(selectedCO.totalCost ?? selectedCO.costImpact)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {!selectedCO.isApproved && !['rejected','void'].includes(selectedCO.status) && (
              <Button variant="primary" size="md" fullWidth onClick={() => { approveCO.mutate(selectedCO._id); setSelectedCO(null); }}>
                Approve Change Order
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ChangeOrdersPage;
