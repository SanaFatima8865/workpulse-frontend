import React from 'react';
import { MoreHorizontal, Crown, Shield, UserMinus, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Avatar }          from '@/components/ui/Avatar';
import { Badge }           from '@/components/ui/Badge';
import { Button }          from '@/components/ui/Button';
import { Dropdown }        from '@/components/ui/Dropdown';
import { Skeleton }        from '@/components/ui/Spinner';
import { EmptyState }      from '@/components/ui/EmptyState';
import { cn }              from '@/lib/cn';
import { useAppSelector }  from '@/store';
import { selectCurrentUser } from '@/store/authSlice';
import { useWorkspaceMembers, useUpdateMemberRole, useRemoveMember } from '../hooks/useWorkspaces';
import type { WorkspaceMemberPublic } from '../api/workspaceApi';

const ROLE_BADGE_VARIANTS: Record<string, 'warning' | 'primary' | 'secondary' | 'danger'> = {
  owner:  'warning',
  admin:  'primary',
  member: 'secondary',
  guest:  'secondary',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner:  <Crown   size={12} className="text-amber-500" />,
  admin:  <Shield  size={12} className="text-brand-500" />,
  member: <UserCheck size={12} className="text-gray-500" />,
  guest:  <UserCheck size={12} className="text-gray-400" />,
};

interface MemberListProps {
  workspaceId: string;
  myRole?: string;
}

export const MemberList: React.FC<MemberListProps> = ({ workspaceId, myRole }) => {
  const currentUser   = useAppSelector(selectCurrentUser);
  const { data: members = [], isLoading } = useWorkspaceMembers(workspaceId);
  const updateRole    = useUpdateMemberRole(workspaceId);
  const removeMember  = useRemoveMember(workspaceId);

  const canManage = myRole === 'owner' || myRole === 'admin';

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3">
            <Skeleton circle height={36} width={36} />
            <div className="flex-1 space-y-1.5">
              <Skeleton height={14} width="40%" />
              <Skeleton height={12} width="25%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!members.length) {
    return (
      <EmptyState
        title="No members yet"
        description="Invite people to collaborate in this workspace"
        size="sm"
      />
    );
  }

  return (
    <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
      <AnimatePresence initial={false}>
        {members.map((member: WorkspaceMemberPublic, i) => {
          const isSelf   = member.userId === currentUser?._id;
          const isOwner  = member.role === 'owner';
          const showMenu = canManage && !isOwner;

          const roleActions = showMenu
            ? [
                ...(member.role !== 'admin'
                  ? [{ label: 'Make Admin',  icon: <Shield size={14} />,    onClick: () => updateRole.mutate({ userId: member.userId, role: 'admin' }) }]
                  : []),
                ...(member.role !== 'member'
                  ? [{ label: 'Make Member', icon: <UserCheck size={14} />, onClick: () => updateRole.mutate({ userId: member.userId, role: 'member' }) }]
                  : []),
                ...(member.role !== 'guest'
                  ? [{ label: 'Make Guest',  icon: <UserCheck size={14} />, onClick: () => updateRole.mutate({ userId: member.userId, role: 'guest' }) }]
                  : []),
                { label: '', onClick: undefined, divider: true },
                {
                  label: isSelf ? 'Leave workspace' : 'Remove member',
                  icon: <UserMinus size={14} />,
                  danger: true,
                  onClick: () => removeMember.mutate(member.userId),
                },
              ]
            : [];

          return (
            <motion.div
              key={member.userId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ delay: i * 0.04, duration: 0.2 }}
              className="flex items-center gap-3 py-3 px-1 group"
            >
              <Avatar
                name={`${member.user.firstName} ${member.user.lastName}`}
                src={member.user.avatar}
                size="sm"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[var(--color-text)] leading-none truncate">
                    {member.user.firstName} {member.user.lastName}
                    {isSelf && (
                      <span className="ml-1.5 text-2xs text-[var(--color-text-muted)] font-normal">(you)</span>
                    )}
                  </p>
                  <span className="shrink-0">{ROLE_ICONS[member.role]}</span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5 truncate">
                  {member.user.email}
                  {member.user.jobTitle && ` · ${member.user.jobTitle}`}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={ROLE_BADGE_VARIANTS[member.role] ?? 'secondary'} size="sm">
                  {member.role}
                </Badge>

                {showMenu && roleActions.length > 0 && (
                  <Dropdown
                    trigger={
                      <Button
                        variant="ghost"
                        size="xs"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal size={15} />
                      </Button>
                    }
                    items={roleActions}
                    align="right"
                    width={180}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
