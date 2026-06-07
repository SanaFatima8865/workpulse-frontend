import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Code, Hammer, Pencil, BarChart2, Globe, Star, Zap, Shield, Heart } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { useCreateTeam } from '../hooks/useTeams';

const COLORS = ['#6453f8','#14b8a6','#f97316','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'];
const ICONS = [
  { id: 'users', icon: <Users size={16} /> }, { id: 'code', icon: <Code size={16} /> },
  { id: 'hammer', icon: <Hammer size={16} /> }, { id: 'pencil', icon: <Pencil size={16} /> },
  { id: 'chart', icon: <BarChart2 size={16} /> }, { id: 'globe', icon: <Globe size={16} /> },
  { id: 'star', icon: <Star size={16} /> }, { id: 'zap', icon: <Zap size={16} /> },
  { id: 'shield', icon: <Shield size={16} /> }, { id: 'heart', icon: <Heart size={16} /> },
];

const schema = z.object({ name: z.string().min(2).max(60), description: z.string().max(500).optional() });
type FormData = z.infer<typeof schema>;

export const CreateTeamModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const create = useCreateTeam();
  const [color, setColor] = React.useState(COLORS[0]);
  const [icon, setIcon] = React.useState('users');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });
  const onSubmit = (data: FormData) => create.mutate({ ...data, color, icon }, { onSuccess: () => { reset(); onClose(); } });
  return (
    <Modal open={open} onClose={onClose} title="Create Team" description="Organize your workspace members into focused teams." size="md"
      footer={<div className="flex justify-end gap-3"><Button variant="secondary" size="md" onClick={onClose}>Cancel</Button><Button variant="primary" size="md" loading={create.isPending} onClick={handleSubmit(onSubmit)}>Create Team</Button></div>}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-white shrink-0" style={{ backgroundColor: color }}>
            {ICONS.find(i => i.id === icon)?.icon ?? <Users size={20} />}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Color</p>
              <div className="flex flex-wrap gap-2">
                {COLORS.map(c => (<button key={c} type="button" onClick={() => setColor(c)} className={cn('w-6 h-6 rounded-full transition-all', color === c ? 'ring-2 ring-offset-2 ring-brand-500 scale-110' : 'hover:scale-110')} style={{ backgroundColor: c }} />))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">Icon</p>
              <div className="flex flex-wrap gap-2">
                {ICONS.map(({ id, icon: ic }) => (
                  <button key={id} type="button" onClick={() => setIcon(id)}
                    className={cn('w-8 h-8 rounded-lg flex items-center justify-center transition-all', icon === id ? 'text-white ring-2 ring-offset-1 ring-brand-500' : 'bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text-secondary)] hover:bg-surface-tertiary')}
                    style={icon === id ? { backgroundColor: color } : {}}>{ic}</button>))}
              </div>
            </div>
          </div>
        </div>
        <Input {...register('name')} label="Team name" placeholder="Engineering, Design..." error={errors.name?.message} disabled={create.isPending} autoFocus />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--color-text)]">Description <span className="text-[var(--color-text-muted)] font-normal">(optional)</span></label>
          <textarea {...register('description')} rows={2} disabled={create.isPending} placeholder="What does this team do?"
            className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
        </div>
      </form>
    </Modal>
  );
};
