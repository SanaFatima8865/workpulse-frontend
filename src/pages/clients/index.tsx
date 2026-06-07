import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Search, Building2, Mail, Phone, Star,
  MoreHorizontal, Trash2, Edit2, Users, HardHat, Filter,
} from 'lucide-react';

import { useTitle }    from '@/hooks';
import { Button }      from '@/components/ui/Button';
import { Input }       from '@/components/ui/Input';
import { Card }        from '@/components/ui/Card';
import { Badge }       from '@/components/ui/Badge';
import { Modal }       from '@/components/ui/Modal';
import { Dropdown }    from '@/components/ui/Dropdown';
import { Skeleton }    from '@/components/ui/Spinner';
import { EmptyState }  from '@/components/ui/EmptyState';
import { useClients, useCreateClient, useDeleteClient } from '@/features/projects';
import type { PublicClient, ClientType, ClientStatus } from '@/store/clientSlice';
import { useDebounce } from '@/hooks';
import { formatRelative } from '@/lib/utils';
import { cn }          from '@/lib/cn';

const TYPE_COLORS: Record<ClientType, string> = {
  owner:              'bg-brand-100 text-brand-700',
  general_contractor: 'bg-indigo-100 text-indigo-700',
  subcontractor:      'bg-teal-100 text-teal-700',
  architect:          'bg-purple-100 text-purple-700',
  engineer:           'bg-blue-100 text-blue-700',
  supplier:           'bg-orange-100 text-orange-700',
  government:         'bg-gray-100 text-gray-700',
  other:              'bg-gray-100 text-gray-600',
};

const TYPE_LABELS: Record<ClientType, string> = {
  owner:              'Owner/Developer',
  general_contractor: 'General Contractor',
  subcontractor:      'Subcontractor',
  architect:          'Architect',
  engineer:           'Engineer',
  supplier:           'Supplier',
  government:         'Government',
  other:              'Other',
};

const STATUS_COLORS: Record<ClientStatus, string> = {
  active:   'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-600',
  prospect: 'bg-amber-100 text-amber-700',
  archived: 'bg-red-100 text-red-600',
};

// ─── Create Client Schema ─────────────────────────────────────────────────────

const createSchema = z.object({
  name:    z.string().min(1, 'Company name required').max(120),
  type:    z.string().optional(),
  status:  z.string().optional(),
  email:   z.string().email().optional().or(z.literal('')),
  phone:   z.string().max(20).optional(),
  website: z.string().url().optional().or(z.literal('')),
  'address.city':  z.string().optional(),
  'address.state': z.string().optional(),
  notes:   z.string().max(2000).optional(),
  // Primary contact
  'contact.firstName': z.string().optional(),
  'contact.lastName':  z.string().optional(),
  'contact.title':     z.string().optional(),
  'contact.email':     z.string().email().optional().or(z.literal('')),
  'contact.phone':     z.string().optional(),
});
type FormData = z.infer<typeof createSchema>;

// ─── ClientCard ───────────────────────────────────────────────────────────────

const ClientCard: React.FC<{ client: PublicClient; index: number }> = ({ client, index }) => {
  const navigate      = useNavigate();
  const deleteClient  = useDeleteClient();
  const primaryContact = client.contacts.find(c => c.isPrimary) ?? client.contacts[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card hover padding="md" className="cursor-pointer group overflow-visible"
        onClick={() => navigate(`/clients/${client._id}`)}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center text-brand-600 font-bold text-lg shrink-0">
              {client.name[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-[var(--color-text)] truncate leading-none">{client.name}</p>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <span className={cn('text-2xs font-medium px-1.5 py-0.5 rounded', TYPE_COLORS[client.type])}>
                  {TYPE_LABELS[client.type]}
                </span>
                <span className={cn('text-2xs font-medium px-1.5 py-0.5 rounded capitalize', STATUS_COLORS[client.status])}>
                  {client.status}
                </span>
              </div>
            </div>
          </div>

          <Dropdown
            trigger={<Button variant="ghost" size="xs" onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100"><MoreHorizontal size={14} /></Button>}
            items={[
              { label: 'View Client', icon: <Building2 size={14} />, onClick: () => navigate(`/clients/${client._id}`) },
              { label: '', onClick: undefined, divider: true },
              { label: 'Delete', icon: <Trash2 size={14} />, danger: true,
                onClick: () => { if (confirm(`Delete "${client.name}"?`)) deleteClient.mutate(client._id); } },
            ]}
            align="right" width={160}
          />
        </div>

        <div className="space-y-1.5">
          {client.email && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <Mail size={11} className="shrink-0" />
              <span className="truncate">{client.email}</span>
            </div>
          )}
          {client.phone && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <Phone size={11} className="shrink-0" />
              <span>{client.phone}</span>
            </div>
          )}
          {(client.address?.city || client.address?.state) && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
              <Building2 size={11} className="shrink-0" />
              <span>{[client.address.city, client.address.state].filter(Boolean).join(', ')}</span>
            </div>
          )}
        </div>

        {primaryContact && (
          <div className="mt-3 pt-3 border-t border-surface-border dark:border-surface-dark-border">
            <p className="text-2xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Primary Contact</p>
            <p className="text-xs font-semibold text-[var(--color-text)]">{primaryContact.firstName} {primaryContact.lastName}</p>
            {primaryContact.title && <p className="text-2xs text-[var(--color-text-muted)]">{primaryContact.title}</p>}
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-surface-border dark:border-surface-dark-border">
          <div className="flex items-center gap-1 text-xs text-[var(--color-text-muted)]">
            <HardHat size={12} />
            <span>{client.projectCount} project{client.projectCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={10} className={i <= client.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
            ))}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const TYPE_FILTERS: Array<ClientType | 'all'> = ['all','owner','general_contractor','subcontractor','architect','engineer','supplier'];

const ClientsPage: React.FC = () => {
  useTitle('Clients & CRM');
  const [search,     setSearch]     = React.useState('');
  const [typeFilter, setTypeFilter] = React.useState<ClientType | 'all'>('all');
  const [createOpen, setCreateOpen] = React.useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const params = { search: debouncedSearch || undefined, type: typeFilter !== 'all' ? typeFilter : undefined };
  const { data: clients = [], isLoading } = useClients(params);
  const create      = useCreateClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(createSchema) });

  const onSubmit = (data: FormData) => {
    const contacts = data['contact.firstName'] ? [{
      firstName: data['contact.firstName']!,
      lastName:  data['contact.lastName'] ?? '',
      title:     data['contact.title'],
      email:     data['contact.email'] || undefined,
      phone:     data['contact.phone'],
      isPrimary: true,
    }] : [];

    create.mutate({
      name:    data.name,
      type:    data.type as never,
      status:  data.status as never ?? 'prospect',
      email:   data.email || undefined,
      phone:   data.phone,
      website: data.website || undefined,
      address: { city: data['address.city'], state: data['address.state'] },
      notes:   data.notes,
      contacts,
    }, { onSuccess: () => { reset(); setCreateOpen(false); } });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div className="flex items-center justify-between gap-4 mb-6" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)] flex items-center gap-2">
            <Building2 size={24} className="text-brand-600" />
            Clients & CRM
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {clients.length} client{clients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          Add Client
        </Button>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input placeholder="Search companies, contacts..." leftIcon={<Search size={15} />}
          value={search} onChange={(e) => setSearch(e.target.value)} clearable onClear={() => setSearch('')} className="max-w-sm" />

        <div className="flex items-center gap-1.5 flex-wrap">
          {TYPE_FILTERS.map((t) => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize',
                typeFilter === t ? 'bg-brand-600 text-white shadow-brand' : 'bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text-secondary)] hover:bg-surface-tertiary')}>
              {t === 'all' ? 'All' : TYPE_LABELS[t]?.split(' ').slice(0,2).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} height={200} className="rounded-xl" />)}
        </div>
      ) : clients.length === 0 ? (
        <EmptyState icon={<Building2 size={28} />} title="No clients yet" description="Add your first client to start managing your CRM"
          action={{ label: 'Add Client', onClick: () => setCreateOpen(true) }} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {clients.map((c, i) => <ClientCard key={c._id} client={c} index={i} />)}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add New Client" size="md"
        footer={<div className="flex justify-end gap-3"><Button variant="secondary" size="md" onClick={() => setCreateOpen(false)}>Cancel</Button><Button variant="primary" size="md" loading={create.isPending} onClick={handleSubmit(onSubmit)}>Add Client</Button></div>}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input {...register('name')} label="Company Name *" placeholder="Acme Construction LLC" error={errors.name?.message} autoFocus />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Type</label>
              <select {...register('type')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                {Object.entries(TYPE_LABELS).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[var(--color-text)]">Status</label>
              <select {...register('status')} className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <Input {...register('email')} label="Email" type="email" placeholder="info@company.com" leftIcon={<Mail size={15} />} />
          <Input {...register('phone')} label="Phone" type="tel" placeholder="+1 (555) 000-0000" leftIcon={<Phone size={15} />} />
          <div className="grid grid-cols-2 gap-3">
            <Input {...register('address.city')} label="City" placeholder="Chicago" />
            <Input {...register('address.state')} label="State" placeholder="IL" />
          </div>
          <div className="pt-2 border-t border-surface-border dark:border-surface-dark-border">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">Primary Contact (optional)</p>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input {...register('contact.firstName')} label="First Name" placeholder="John" />
              <Input {...register('contact.lastName')} label="Last Name" placeholder="Smith" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input {...register('contact.title')} label="Title" placeholder="Project Manager" />
              <Input {...register('contact.email')} label="Email" type="email" placeholder="john@company.com" />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClientsPage;
