import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, MapPin, DollarSign, Calendar, Users } from 'lucide-react';

import { Modal }  from '@/components/ui/Modal';
import { Input }  from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateProject } from '../hooks/useProjects';
import { useClients } from '../hooks/useProjects';

const schema = z.object({
  name:                  z.string().min(2, 'Project name required').max(150),
  type:                  z.string().optional(),
  phase:                 z.string().optional(),
  priority:              z.string().optional(),
  description:           z.string().max(2000).optional(),
  'address.street':      z.string().optional(),
  'address.city':        z.string().optional(),
  'address.state':       z.string().optional(),
  'address.zip':         z.string().optional(),
  sqFootage:             z.coerce.number().min(0).optional(),
  buildingType:          z.string().optional(),
  clientId:              z.string().optional(),
  contractType:          z.string().optional(),
  originalContractValue: z.coerce.number().min(0).optional(),
  retainagePercent:      z.coerce.number().min(0).max(100).optional(),
  startDate:             z.string().optional(),
  plannedEndDate:        z.string().optional(),
  bidDueDate:            z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface CreateProjectModalProps { open: boolean; onClose: () => void }

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ open, onClose }) => {
  const create              = useCreateProject();
  const { data: clients = [] } = useClients();
  const [tab, setTab]       = React.useState<'basic'|'site'|'financial'|'team'>('basic');

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => {
    const { 'address.street': street, 'address.city': city, 'address.state': state, 'address.zip': zip,
      originalContractValue, retainagePercent, ...rest } = data;

    create.mutate({
      ...rest,
      address: { street, city, state, zip },
      budget:  { originalContractValue, retainagePercent },
      startDate:      data.startDate      ? new Date(data.startDate!).toISOString()      : undefined,
      plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate!).toISOString() : undefined,
      bidDueDate:     data.bidDueDate     ? new Date(data.bidDueDate!).toISOString()     : undefined,
    }, { onSuccess: () => { reset(); onClose(); setTab('basic'); } });
  };

  const TABS = [
    { id: 'basic',     label: 'Basic',     icon: <Building2 size={14} /> },
    { id: 'site',      label: 'Site',      icon: <MapPin size={14} /> },
    { id: 'financial', label: 'Financial', icon: <DollarSign size={14} /> },
  ] as const;

  return (
    <Modal open={open} onClose={onClose} title="New Construction Project" size="lg"
      footer={
        <div className="flex justify-between">
          <Button variant="secondary" size="md" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="md" loading={create.isPending} onClick={handleSubmit(onSubmit)}>
            Create Project
          </Button>
        </div>
      }
    >
      {/* Tab nav */}
      <div className="flex gap-1 mb-5 bg-surface-secondary dark:bg-surface-dark-tertiary rounded-lg p-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t.id ? 'bg-white dark:bg-surface-dark-secondary text-brand-600 shadow-card' : 'text-[var(--color-text-secondary)]'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* ── Basic ─────────────────────────────── */}
        {tab === 'basic' && (
          <div className="space-y-4">
            <Input {...register('name')} label="Project Name *" placeholder="Downtown Office Tower" error={errors.name?.message} autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Project Type</label>
                <select {...register('type')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">Select type</option>
                  {['commercial','residential','industrial','infrastructure','renovation','interior','civil','mixed_use','other'].map(t => <option key={t} value={t}>{t.replace('_',' ')}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Phase</label>
                <select {...register('phase')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="pre_bid">Pre-Bid</option>
                  <option value="bidding">Bidding</option>
                  <option value="awarded">Awarded</option>
                  <option value="pre_construction">Pre-Construction</option>
                  <option value="construction">Construction</option>
                  <option value="closeout">Close-Out</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Priority</label>
                <select {...register('priority')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Client / Owner</label>
                <select {...register('clientId')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="">No client assigned</option>
                  {clients.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Description</label>
              <textarea {...register('description')} rows={3} placeholder="Brief project description..."
                className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
            </div>
          </div>
        )}

        {/* ── Site ──────────────────────────────── */}
        {tab === 'site' && (
          <div className="space-y-4">
            <Input {...register('address.street')} label="Street Address" placeholder="123 Main St" />
            <div className="grid grid-cols-2 gap-3">
              <Input {...register('address.city')} label="City" placeholder="Chicago" />
              <Input {...register('address.state')} label="State" placeholder="IL" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input {...register('address.zip')} label="ZIP Code" placeholder="60601" />
              <Input {...register('buildingType')} label="Building Type" placeholder="Office, Warehouse..." />
            </div>
            <Input {...register('sqFootage')} label="Square Footage" type="number" placeholder="50000" />
          </div>
        )}

        {/* ── Financial ─────────────────────────── */}
        {tab === 'financial' && (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Contract Type</label>
              <select {...register('contractType')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="lump_sum">Lump Sum</option>
                <option value="cost_plus">Cost Plus</option>
                <option value="guaranteed_max">Guaranteed Max Price</option>
                <option value="unit_price">Unit Price</option>
                <option value="time_and_material">Time & Material</option>
              </select>
            </div>
            <Input {...register('originalContractValue')} label="Original Contract Value ($)" type="number" placeholder="5000000" leftIcon={<DollarSign size={15} />} />
            <Input {...register('retainagePercent')} label="Retainage %" type="number" placeholder="10" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Start Date</label>
                <input {...register('startDate')} type="date" className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Planned End Date</label>
                <input {...register('plannedEndDate')} type="date" className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Bid Due Date</label>
              <input {...register('bidDueDate')} type="date" className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
