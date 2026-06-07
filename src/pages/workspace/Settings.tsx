import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import {
  Settings, Users, Trash2, UserPlus, AlertTriangle,
  Globe, Building2,
} from 'lucide-react';

import { useTitle }              from '@/hooks';
import { useAppSelector }        from '@/store';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { selectCurrentUser }     from '@/store/authSlice';
import { Card, CardHeader }      from '@/components/ui/Card';
import { Button }                from '@/components/ui/Button';
import { Input }                 from '@/components/ui/Input';
import { Badge }                 from '@/components/ui/Badge';
import { Progress }              from '@/components/ui/Progress';
import { PageLoader }            from '@/components/ui/Spinner';
import { cn }                    from '@/lib/cn';
import {
  useWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
  MemberList,
  InviteMemberModal,
} from '@/features/workspaces';
import { PLAN_LIMITS }           from '@workpulse/shared';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'general' | 'members' | 'billing' | 'danger';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'general', label: 'General',     icon: <Settings size={15} /> },
  { id: 'members', label: 'Members',     icon: <Users size={15} /> },
  { id: 'billing', label: 'Plan',        icon: <Globe size={15} /> },
  { id: 'danger',  label: 'Danger Zone', icon: <Trash2 size={15} /> },
];

// ─── General Settings Form Schema ─────────────────────────────────────────────

const schema = z.object({
  name:        z.string().min(2).max(60).trim(),
  description: z.string().max(500).optional(),
  settings: z.object({
    defaultProjectView:                 z.enum(['board', 'list', 'table', 'timeline']),
    allowGuestAccess:                   z.boolean(),
    requireApprovalForMaterialRequests: z.boolean(),
    timezone:                           z.string(),
    currency:                           z.string().max(3),
  }),
});

type FormData = z.infer<typeof schema>;

// ─── Page ─────────────────────────────────────────────────────────────────────

const WorkspaceSettingsPage: React.FC = () => {
  useTitle('Workspace Settings');
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate        = useNavigate();
  const currentUser     = useAppSelector(selectCurrentUser);
  const activeWorkspace = useAppSelector(selectActiveWorkspace);

  const id = workspaceId ?? activeWorkspace?._id ?? '';

  const [activeTab, setActiveTab]   = React.useState<Tab>('general');
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState('');

  const { data: workspace, isLoading } = useWorkspace(id);
  const updateWorkspace = useUpdateWorkspace(id);
  const deleteWorkspace = useDeleteWorkspace();

  const myRole = workspace?.myRole;
  const canEdit = myRole === 'owner' || myRole === 'admin';

  const { register, handleSubmit, formState: { errors, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: workspace
      ? {
          name:        workspace.name,
          description: workspace.description ?? '',
          settings: {
            defaultProjectView:                 workspace.settings.defaultProjectView ?? 'board',
            allowGuestAccess:                   workspace.settings.allowGuestAccess ?? false,
            requireApprovalForMaterialRequests: workspace.settings.requireApprovalForMaterialRequests ?? true,
            timezone:                           workspace.settings.timezone ?? 'UTC',
            currency:                           workspace.settings.currency ?? 'USD',
          },
        }
      : undefined,
  });

  if (isLoading) return <PageLoader message="Loading workspace settings..." />;
  if (!workspace) return (
    <div className="flex items-center justify-center h-full">
      <p className="text-[var(--color-text-muted)]">Workspace not found</p>
    </div>
  );

  const planLimits = PLAN_LIMITS[workspace.plan];

  const onSubmit = (data: FormData) => updateWorkspace.mutate(data);

  const handleDelete = () => {
    if (deleteConfirm === workspace.name) {
      deleteWorkspace.mutate(id, { onSuccess: () => navigate('/dashboard') });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-brand"
            style={{ backgroundColor: workspace.coverColor }}
          >
            {workspace.name[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">
              {workspace.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="primary" size="sm">{workspace.plan} plan</Badge>
              <span className="text-xs text-[var(--color-text-muted)]">
                {workspace.memberCount} members · /{workspace.slug}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-secondary dark:bg-surface-dark-tertiary rounded-xl p-1.5 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
              activeTab === tab.id
                ? 'bg-white dark:bg-surface-dark-secondary text-brand-700 dark:text-brand-300 shadow-card'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]',
              tab.id === 'danger' && activeTab === 'danger' && 'text-red-600 dark:text-red-400'
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── GENERAL TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'general' && (
        <motion.div
          key="general"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          <Card padding="lg">
            <CardHeader
              title={<span className="flex items-center gap-2"><Building2 size={17} className="text-brand-600" />General Information</span>}
              divider
            />
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
              <Input
                {...register('name')}
                label="Workspace name"
                error={errors.name?.message}
                disabled={!canEdit || updateWorkspace.isPending}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--color-text)]">Description</label>
                <textarea
                  {...register('description')}
                  rows={2}
                  disabled={!canEdit || updateWorkspace.isPending}
                  className="w-full rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              {/* Settings grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Default project view</label>
                  <select
                    {...register('settings.defaultProjectView')}
                    disabled={!canEdit}
                    className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="board">Board</option>
                    <option value="list">List</option>
                    <option value="table">Table</option>
                    <option value="timeline">Timeline</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-[var(--color-text)]">Currency</label>
                  <select
                    {...register('settings.currency')}
                    disabled={!canEdit}
                    className="h-10 px-3 rounded-lg border border-surface-border bg-white dark:bg-surface-dark-secondary text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Toggles */}
              {[
                { field: 'settings.allowGuestAccess' as const,                   label: 'Allow guest access',                     desc: 'Guests can view projects without editing' },
                { field: 'settings.requireApprovalForMaterialRequests' as const, label: 'Require approval for material requests', desc: 'Admin must approve all material requests' },
              ].map(({ field, label, desc }) => (
                <label key={field} className="flex items-start justify-between gap-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{desc}</p>
                  </div>
                  <input
                    {...register(field)}
                    type="checkbox"
                    disabled={!canEdit}
                    className="w-4 h-4 rounded border-surface-border text-brand-600 focus:ring-brand-500 mt-0.5"
                  />
                </label>
              ))}

              {canEdit && (
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    loading={updateWorkspace.isPending}
                    disabled={!isDirty}
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </Card>
        </motion.div>
      )}

      {/* ── MEMBERS TAB ─────────────────────────────────────────────────── */}
      {activeTab === 'members' && (
        <motion.div
          key="members"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        >
          <Card padding="none">
            <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
              <div>
                <h2 className="text-base font-semibold text-[var(--color-text)]">
                  Team Members
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  {workspace.memberCount} member{workspace.memberCount !== 1 ? 's' : ''}
                  {planLimits.members !== -1 && ` of ${planLimits.members} allowed on ${workspace.plan} plan`}
                </p>
              </div>
              {canEdit && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<UserPlus size={14} />}
                  onClick={() => setInviteOpen(true)}
                >
                  Invite
                </Button>
              )}
            </div>

            {planLimits.members !== -1 && (
              <div className="px-5 py-3 border-b border-surface-border dark:border-surface-dark-border">
                <Progress
                  value={(workspace.memberCount / planLimits.members) * 100}
                  size="xs"
                  color="auto"
                  label={`${workspace.memberCount} / ${planLimits.members} members`}
                  showLabel
                />
              </div>
            )}

            <div className="px-5 py-2">
              <MemberList workspaceId={id} myRole={myRole} />
            </div>
          </Card>

          <InviteMemberModal
            open={inviteOpen}
            onClose={() => setInviteOpen(false)}
            workspaceId={id}
          />
        </motion.div>
      )}

      {/* ── BILLING / PLAN TAB ───────────────────────────────────────────── */}
      {activeTab === 'billing' && (
        <motion.div
          key="billing"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        >
          <Card padding="lg">
            <CardHeader title={<span className="flex items-center gap-2"><Globe size={17} className="text-brand-600"/>Current Plan</span>} divider />
            <div className="mt-4 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-brand-50 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-900">
                <div>
                  <p className="font-semibold text-brand-700 capitalize">{workspace.plan} Plan</p>
                  <p className="text-xs text-brand-500 mt-0.5">
                    {planLimits.members === -1 ? 'Unlimited' : planLimits.members} members ·{' '}
                    {planLimits.projects === -1 ? 'Unlimited' : planLimits.projects} projects ·{' '}
                    {planLimits.aiCredits === -1 ? 'Unlimited' : planLimits.aiCredits} AI credits
                  </p>
                </div>
                <Badge variant="primary" size="lg">{workspace.plan}</Badge>
              </div>

              <p className="text-sm text-[var(--color-text-muted)]">
                Billing management will be available in a future update.
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── DANGER ZONE ─────────────────────────────────────────────────── */}
      {activeTab === 'danger' && (
        <motion.div
          key="danger"
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        >
          {myRole === 'owner' ? (
            <Card padding="lg" className="border-red-200 dark:border-red-900">
              <CardHeader
                title={<span className="flex items-center gap-2 text-red-600"><AlertTriangle size={17} />Danger Zone</span>}
                subtitle="These actions are irreversible. Please be careful."
                divider
              />
              <div className="mt-4 space-y-4">
                <p className="text-sm text-[var(--color-text)]">
                  Deleting <strong>"{workspace.name}"</strong> will permanently remove all projects,
                  tasks, and data. Type the workspace name to confirm.
                </p>
                <Input
                  label={`Type "${workspace.name}" to confirm`}
                  placeholder={workspace.name}
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  error={deleteConfirm && deleteConfirm !== workspace.name ? 'Name does not match' : undefined}
                />
                <Button
                  variant="danger"
                  size="md"
                  disabled={deleteConfirm !== workspace.name}
                  loading={deleteWorkspace.isPending}
                  onClick={handleDelete}
                  leftIcon={<Trash2 size={15} />}
                >
                  Permanently Delete Workspace
                </Button>
              </div>
            </Card>
          ) : (
            <Card padding="lg">
              <p className="text-sm text-[var(--color-text-muted)]">
                Only the workspace owner can access the danger zone.
              </p>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default WorkspaceSettingsPage;
