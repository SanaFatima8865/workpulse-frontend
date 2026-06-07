import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, DollarSign, Calendar, Users, CheckSquare,
  TrendingUp, AlertTriangle, Building2, Edit2, Plus, Check,
  HardHat, FileText, Percent,
} from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useTitle }          from '@/hooks';
import { Card, CardHeader, StatCard } from '@/components/ui/Card';
import { Badge }             from '@/components/ui/Badge';
import { Button }            from '@/components/ui/Button';
import { Progress }          from '@/components/ui/Progress';
import { Input }             from '@/components/ui/Input';
import { PageLoader }        from '@/components/ui/Spinner';
import { Modal }             from '@/components/ui/Modal';
import { EmptyState }        from '@/components/ui/EmptyState';
import { useProject, useUpdateProject, useToggleMilestone, useAddMilestone } from '@/features/projects';
import { PhaseBadge, HealthBadge, PHASE_CONFIG } from '@/features/projects/components/ProjectCard';
import { formatCurrency, formatDate, formatRelative } from '@/lib/utils';
import { cn } from '@/lib/cn';

const ProjectDetailPage: React.FC = () => {
  const { projectId = '' } = useParams<{ projectId: string }>();
  const navigate           = useNavigate();
  const { data: project, isLoading } = useProject(projectId);
  useTitle(project?.name ?? 'Project');

  const updateProject   = useUpdateProject(projectId);
  const toggleMilestone = useToggleMilestone(projectId);
  const addMilestone    = useAddMilestone(projectId);

  const [activeTab, setActiveTab] = React.useState<'overview'|'financial'|'milestones'|'team'>('overview');
  const [editPhase, setEditPhase] = React.useState(false);
  const [editProgress, setEditProgress] = React.useState(false);
  const [addMilestoneOpen, setAddMilestoneOpen] = React.useState(false);
  const [newMilestone, setNewMilestone] = React.useState({ name: '', dueDate: '' });

  const { register: registerProgress, handleSubmit: handleProgressSubmit } = useForm<{ completionPercent: number }>();

  if (isLoading) return <PageLoader message="Loading project..." />;
  if (!project)  return <EmptyState title="Project not found" description="This project may have been deleted." />;

  const hasBudget = project.budget.originalContractValue > 0;
  const billedPct = hasBudget ? (project.budget.billedToDate / project.budget.revisedContractValue) * 100 : 0;

  const TABS = [
    { id: 'overview',   label: 'Overview',   icon: <Building2 size={14} /> },
    { id: 'financial',  label: 'Financial',  icon: <DollarSign size={14} /> },
    { id: 'milestones', label: 'Milestones', icon: <CheckSquare size={14} /> },
    { id: 'team',       label: 'Team',       icon: <Users size={14} /> },
  ] as const;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-5">
      {/* Back */}
      <button onClick={() => navigate('/projects')}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
        <ArrowLeft size={15} /> All Projects
      </button>

      {/* Project header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card padding="lg">
          <div className="flex flex-col lg:flex-row lg:items-start gap-5">
            {/* Color indicator + title */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: project.coverColor }}>
                <HardHat size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-mono text-[var(--color-text-muted)] bg-surface-secondary px-2 py-0.5 rounded">
                    {project.jobNumber}
                  </span>
                  <PhaseBadge phase={project.phase} size="md" />
                  <HealthBadge score={project.healthScore} />
                  {project.priority === 'critical' && <Badge variant="danger" size="sm">CRITICAL</Badge>}
                </div>
                <h1 className="text-2xl font-display font-bold text-[var(--color-text)] leading-tight">
                  {project.name}
                </h1>
                {project.address?.city && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={13} className="text-[var(--color-text-muted)]" />
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {[project.address.street, project.address.city, project.address.state, project.address.zip].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
                {project.description && (
                  <p className="text-sm text-[var(--color-text-muted)] mt-1.5 leading-relaxed max-w-2xl">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            {/* Actions + progress */}
            <div className="flex flex-col gap-3 shrink-0 lg:w-64">
              {/* Phase selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Phase</label>
                <select
                  value={project.phase}
                  onChange={(e) => updateProject.mutate({ phase: e.target.value as never })}
                  className="h-9 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {Object.entries(PHASE_CONFIG).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>

              {/* Completion */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">Completion</label>
                  <button onClick={() => setEditProgress(!editProgress)} className="text-brand-600 hover:underline text-xs">Edit</button>
                </div>
                {editProgress ? (
                  <form onSubmit={handleProgressSubmit((d) => {
                    updateProject.mutate({ completionPercent: d.completionPercent });
                    setEditProgress(false);
                  })} className="flex gap-2">
                    <input {...registerProgress('completionPercent', { valueAsNumber: true, value: project.completionPercent })}
                      type="number" min={0} max={100}
                      className="h-8 w-20 px-2 rounded-lg border border-surface-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    <Button type="submit" variant="primary" size="xs">Set</Button>
                  </form>
                ) : (
                  <Progress value={project.completionPercent} size="md" color="auto" showLabel />
                )}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-secondary dark:bg-surface-dark-tertiary rounded-xl p-1.5 w-fit">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn('flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              activeTab === tab.id ? 'bg-white dark:bg-surface-dark-secondary text-brand-700 dark:text-brand-300 shadow-card' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]')}>
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Health Score"      value={`${project.healthScore}/100`}     icon={<TrendingUp size={18} />}   iconColor={project.healthScore >= 80 ? 'bg-emerald-100 text-emerald-600' : project.healthScore >= 60 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'} />
            <StatCard label="Completion"        value={`${project.completionPercent}%`}  icon={<Percent size={18} />}      iconColor="bg-brand-100 text-brand-600" />
            <StatCard label="Contract Value"    value={hasBudget ? formatCurrency(project.budget.revisedContractValue) : 'TBD'} icon={<DollarSign size={18} />} iconColor="bg-teal-100 text-teal-600" />
            <StatCard label="Team Members"      value={project.members.length}           icon={<Users size={18} />}        iconColor="bg-indigo-100 text-indigo-600" />
          </div>

          {/* Project info grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card padding="md">
              <CardHeader title="Project Details" divider />
              <dl className="space-y-3 mt-3">
                {[
                  { label: 'Type',           value: project.type?.replace('_',' ')    },
                  { label: 'Contract Type',  value: project.contractType?.replace('_',' ') },
                  { label: 'Delivery',       value: project.deliveryMethod?.replace('_',' ') },
                  { label: 'Building Type',  value: project.buildingType },
                  { label: 'Square Footage', value: project.sqFootage ? `${project.sqFootage.toLocaleString()} sq ft` : undefined },
                ].filter(d => d.value).map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <dt className="text-sm text-[var(--color-text-muted)]">{label}</dt>
                    <dd className="text-sm font-medium text-[var(--color-text)] text-right capitalize">{value}</dd>
                  </div>
                ))}
              </dl>
            </Card>

            <Card padding="md">
              <CardHeader title="Key Dates" divider />
              <dl className="space-y-3 mt-3">
                {[
                  { label: 'Bid Due',         value: project.bidDueDate,     warn: project.bidDueDate && new Date(project.bidDueDate) < new Date() },
                  { label: 'Award Date',      value: project.awardDate      },
                  { label: 'Start Date',      value: project.startDate      },
                  { label: 'Planned Finish',  value: project.plannedEndDate,  warn: project.plannedEndDate && new Date(project.plannedEndDate) < new Date() && project.completionPercent < 100 },
                  { label: 'Actual Finish',   value: project.actualEndDate  },
                  { label: 'Warranty Expiry', value: project.warrantyExpiry },
                ].filter(d => d.value).map(({ label, value, warn }) => (
                  <div key={label} className="flex items-start justify-between gap-3">
                    <dt className="text-sm text-[var(--color-text-muted)]">{label}</dt>
                    <dd className={cn('text-sm font-medium text-right', warn ? 'text-red-500' : 'text-[var(--color-text)]')}>
                      {value && formatDate(value as string)}
                      {warn && <span className="ml-1 text-2xs">⚠ Overdue</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </Card>
          </div>

          {/* Permit numbers */}
          {project.permitNumbers.length > 0 && (
            <Card padding="md">
              <CardHeader title={<span className="flex items-center gap-2"><FileText size={16} className="text-brand-600"/>Permit Numbers</span>} divider />
              <div className="flex flex-wrap gap-2 mt-3">
                {project.permitNumbers.map(p => (
                  <span key={p} className="text-xs font-mono bg-surface-secondary dark:bg-surface-dark-tertiary px-2.5 py-1 rounded-md border border-surface-border">{p}</span>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {/* ── FINANCIAL TAB ───────────────────────────────────────────────── */}
      {activeTab === 'financial' && (
        <motion.div key="financial" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {!hasBudget ? (
            <EmptyState icon={<DollarSign size={28} />} title="No budget set" description="Add a contract value in the Overview tab to track financials" size="md" />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Original Contract"   value={formatCurrency(project.budget.originalContractValue)}   icon={<DollarSign size={18} />} iconColor="bg-blue-100 text-blue-600" />
                <StatCard label="Revised Contract"    value={formatCurrency(project.budget.revisedContractValue)}    icon={<DollarSign size={18} />} iconColor="bg-brand-100 text-brand-600" />
                <StatCard label="Billed to Date"      value={formatCurrency(project.budget.billedToDate)}             icon={<TrendingUp size={18} />} iconColor="bg-teal-100 text-teal-600" />
                <StatCard label="Approved COs"        value={formatCurrency(project.budget.approvedChangeOrders)}     icon={<FileText size={18} />}   iconColor="bg-amber-100 text-amber-600" />
              </div>

              <Card padding="lg">
                <CardHeader title="Financial Summary" divider />
                <div className="space-y-4 mt-4">
                  <Progress value={billedPct} size="md" color="brand" label="Billed vs Contract" showLabel />
                  <Progress value={project.completionPercent} size="md" color="auto" label="Physical Completion" showLabel />

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {[
                      { label: 'Pending COs',     value: formatCurrency(project.budget.pendingChangeOrders), warn: project.budget.pendingChangeOrders > 0 },
                      { label: 'Paid to Date',    value: formatCurrency(project.budget.paidToDate) },
                      { label: 'Retainage %',     value: `${project.budget.retainagePercent}%` },
                      { label: 'Retainage Held',  value: formatCurrency(project.budget.retainageHeld) },
                      { label: 'Contingency',     value: formatCurrency(project.budget.contingency) },
                      ...(project.budget.projectedFinalCost ? [{ label: 'Projected Final', value: formatCurrency(project.budget.projectedFinalCost) }] : []),
                    ].map(({ label, value, warn }) => (
                      <div key={label} className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary dark:bg-surface-dark-tertiary">
                        <span className="text-sm text-[var(--color-text-muted)]">{label}</span>
                        <span className={cn('text-sm font-bold', warn ? 'text-amber-600' : 'text-[var(--color-text)]')}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </>
          )}
        </motion.div>
      )}

      {/* ── MILESTONES TAB ──────────────────────────────────────────────── */}
      {activeTab === 'milestones' && (
        <motion.div key="milestones" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
              <CardHeader
                title={<span className="flex items-center gap-2"><CheckSquare size={16} className="text-brand-600"/>Milestones</span>}
                subtitle={`${project.milestones.filter(m => m.isCompleted).length} of ${project.milestones.length} complete`}
              />
              <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setAddMilestoneOpen(true)}>
                Add
              </Button>
            </div>

            {project.milestones.length === 0 ? (
              <EmptyState title="No milestones" description="Add project milestones to track key dates" size="sm" action={{ label: 'Add Milestone', onClick: () => setAddMilestoneOpen(true) }} />
            ) : (
              <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
                {project.milestones.map((m) => {
                  const isOverdue = !m.isCompleted && new Date(m.dueDate) < new Date();
                  return (
                    <div key={m._id} className="flex items-center gap-3 px-5 py-3.5 group">
                      <button onClick={() => toggleMilestone.mutate(m._id)}
                        className={cn('w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
                          m.isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : isOverdue ? 'border-red-400 hover:bg-red-50' : 'border-surface-border-strong hover:border-brand-400')}>
                        {m.isCompleted && <Check size={11} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', m.isCompleted ? 'line-through text-[var(--color-text-muted)]' : 'text-[var(--color-text)]')}>
                          {m.name}
                        </p>
                        {m.notes && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{m.notes}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn('text-xs font-medium', m.isCompleted ? 'text-emerald-600' : isOverdue ? 'text-red-500' : 'text-[var(--color-text-muted)]')}>
                          {m.isCompleted && m.completedDate ? `Done ${formatDate(m.completedDate)}` : formatDate(m.dueDate)}
                        </p>
                        {isOverdue && <p className="text-2xs text-red-400">Overdue</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* ── TEAM TAB ────────────────────────────────────────────────────── */}
      {activeTab === 'team' && (
        <motion.div key="team" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Card padding="md">
            <CardHeader title="Project Team" subtitle={`${project.members.length} member${project.members.length !== 1 ? 's' : ''}`} divider />
            {project.members.length === 0 ? (
              <EmptyState title="No team members" description="Add team members to this project" size="sm" />
            ) : (
              <div className="space-y-2 mt-4">
                {project.members.map((m) => (
                  <div key={m.userId} className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary dark:bg-surface-dark-tertiary">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 text-xs font-bold">{m.userId.slice(-2).toUpperCase()}</div>
                      <div>
                        <p className="text-sm font-semibold text-[var(--color-text)]">{m.userId}</p>
                        <p className="text-xs text-[var(--color-text-muted)] capitalize">{m.role.replace('_',' ')}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" size="sm">{m.role.replace('_',' ')}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* Add Milestone Modal */}
      <Modal open={addMilestoneOpen} onClose={() => setAddMilestoneOpen(false)} title="Add Milestone" size="sm"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="md" onClick={() => setAddMilestoneOpen(false)}>Cancel</Button>
            <Button variant="primary" size="md" loading={addMilestone.isPending}
              disabled={!newMilestone.name || !newMilestone.dueDate}
              onClick={() => {
                addMilestone.mutate({ name: newMilestone.name, dueDate: new Date(newMilestone.dueDate).toISOString() },
                  { onSuccess: () => { setAddMilestoneOpen(false); setNewMilestone({ name: '', dueDate: '' }); } });
              }}>
              Add Milestone
            </Button>
          </div>
        }>
        <div className="space-y-4">
          <Input label="Milestone name" placeholder="Foundation complete, Steel erected..."
            value={newMilestone.name} onChange={(e) => setNewMilestone(p => ({ ...p, name: e.target.value }))} autoFocus />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-text)]">Due Date</label>
            <input type="date" value={newMilestone.dueDate} onChange={(e) => setNewMilestone(p => ({ ...p, dueDate: e.target.value }))}
              className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProjectDetailPage;
