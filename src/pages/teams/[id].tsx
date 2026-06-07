import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, UserPlus, MoreHorizontal, Crown, Users, Shield, UserMinus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useTitle }    from '@/hooks';
import { Button }      from '@/components/ui/Button';
import { Input }       from '@/components/ui/Input';
import { Badge }       from '@/components/ui/Badge';
import { Avatar }      from '@/components/ui/Avatar';
import { Card, CardHeader } from '@/components/ui/Card';
import { Dropdown }    from '@/components/ui/Dropdown';
import { Skeleton }    from '@/components/ui/Spinner';
import { EmptyState }  from '@/components/ui/EmptyState';
import { Modal }       from '@/components/ui/Modal';
import { useAppSelector } from '@/store';
import { selectCurrentUser }  from '@/store/authSlice';
import {
  useTeam, useTeamMembers, useAddTeamMember,
  useUpdateTeamMemberRole, useRemoveTeamMember, useWorkspaceUsers,
} from '@/features/teams/hooks/useTeams';
import { cn } from '@/lib/cn';

const TeamDetailPage: React.FC = () => {
  const { teamId = '' } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const currentUser = useAppSelector(selectCurrentUser);

  const { data: team,    isLoading: teamLoading }    = useTeam(teamId);
  const { data: members, isLoading: membersLoading } = useTeamMembers(teamId);
  useTitle(team?.name ?? 'Team');

  const addMember        = useAddTeamMember(teamId);
  const updateRole       = useUpdateTeamMemberRole(teamId);
  const removeMember     = useRemoveTeamMember(teamId);

  const [addOpen, setAddOpen] = React.useState(false);
  const [search,  setSearch]  = React.useState('');

  const { data: wsUsers = [] } = useWorkspaceUsers({ search: search || undefined });

  const myRole  = team?.myRole;
  const canEdit = myRole === 'lead';
  const memberIds = new Set(members?.map((m) => m.userId) ?? []);

  if (teamLoading) return (
    <div className="p-6 space-y-4">
      <Skeleton height={48} width={300} /> <Skeleton height={200} />
    </div>
  );
  if (!team) return (
    <div className="p-6"><p className="text-[var(--color-text-muted)]">Team not found.</p></div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Back + Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/teams')}
          className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] mb-4 transition-colors">
          <ArrowLeft size={15} /> All Teams
        </button>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-brand"
            style={{ backgroundColor: team.color }}>
            <Users size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">{team.name}</h1>
              {team.isDefault && <Badge variant="secondary" size="md">Default</Badge>}
              {myRole && <Badge variant={myRole === 'lead' ? 'primary' : 'secondary'} size="md">{myRole}</Badge>}
            </div>
            {team.description && (
              <p className="text-sm text-[var(--color-text-muted)] mt-0.5">{team.description}</p>
            )}
          </div>
          {canEdit && (
            <Button variant="primary" size="sm" leftIcon={<UserPlus size={14} />} onClick={() => setAddOpen(true)}>
              Add Member
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Members', value: team.memberCount },
          { label: 'Leads',   value: members?.filter((m) => m.role === 'lead').length ?? 0 },
          { label: 'Status',  value: 'Active' },
        ].map(({ label, value }) => (
          <Card key={label} padding="md">
            <p className="text-xs uppercase tracking-wider text-[var(--color-text-muted)] font-semibold">{label}</p>
            <p className="text-2xl font-bold text-[var(--color-text)] mt-1">{value}</p>
          </Card>
        ))}
      </div>

      {/* Members list */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
          <CardHeader title="Team Members" subtitle={`${team.memberCount} member${team.memberCount !== 1 ? 's' : ''}`}
            action={canEdit ? <Button variant="primary" size="sm" leftIcon={<UserPlus size={14} />} onClick={() => setAddOpen(true)}>Add</Button> : undefined} />
        </div>

        {membersLoading ? (
          <div className="p-5 space-y-3">{[1,2,3].map(i => <Skeleton key={i} height={56} />)}</div>
        ) : !members?.length ? (
          <EmptyState title="No members yet" description="Add team members to get started" size="sm" />
        ) : (
          <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
            <AnimatePresence initial={false}>
              {members.map((member, i) => {
                const isSelf    = member.userId === currentUser?._id;
                const showMenu  = canEdit || isSelf;
                return (
                  <motion.div key={member.userId}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 px-5 py-3.5 group"
                  >
                    <Avatar name={`${member.user.firstName} ${member.user.lastName}`} src={member.user.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate leading-none">
                          {member.user.firstName} {member.user.lastName}
                          {isSelf && <span className="ml-1 text-2xs font-normal text-[var(--color-text-muted)]">(you)</span>}
                        </p>
                        {member.role === 'lead' && <Crown size={12} className="text-amber-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                        {member.user.email}{member.user.jobTitle ? ` · ${member.user.jobTitle}` : ''}
                      </p>
                    </div>
                    <Badge variant={member.role === 'lead' ? 'warning' : 'secondary'} size="sm">{member.role}</Badge>
                    {showMenu && (
                      <Dropdown
                        trigger={<Button variant="ghost" size="xs" className="opacity-0 group-hover:opacity-100"><MoreHorizontal size={15} /></Button>}
                        items={[
                          ...(canEdit && member.role !== 'lead'
                            ? [{ label: 'Make Lead', icon: <Crown size={14} />, onClick: () => updateRole.mutate({ userId: member.userId, role: 'lead' }) }]
                            : []),
                          ...(canEdit && member.role !== 'member'
                            ? [{ label: 'Make Member', icon: <Shield size={14} />, onClick: () => updateRole.mutate({ userId: member.userId, role: 'member' }) }]
                            : []),
                          { label: '', onClick: undefined, divider: true },
                          { label: isSelf ? 'Leave team' : 'Remove', icon: <UserMinus size={14} />, danger: true,
                            onClick: () => removeMember.mutate(member.userId) },
                        ]}
                        align="right" width={160}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Add member modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Team Member" size="sm">
        <div className="space-y-3">
          <Input placeholder="Search workspace members..." leftIcon={<Users size={15} />}
            value={search} onChange={(e) => setSearch(e.target.value)} autoFocus />
          <div className="max-h-64 overflow-y-auto space-y-1">
            {wsUsers.filter((u) => !memberIds.has(u._id)).slice(0, 10).map((u) => (
              <button key={u._id} onClick={() => { addMember.mutate({ userId: u._id, role: 'member' }); setAddOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-secondary dark:hover:bg-surface-dark-tertiary transition-colors text-left">
                <Avatar name={`${u.firstName} ${u.lastName}`} src={u.avatar} size="sm" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text)] truncate">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{u.email}</p>
                </div>
              </button>
            ))}
            {wsUsers.filter((u) => !memberIds.has(u._id)).length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)] text-center py-4">
                {search ? 'No users found' : 'All workspace members are already in this team'}
              </p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamDetailPage;
