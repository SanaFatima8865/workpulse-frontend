import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Clock, Briefcase } from 'lucide-react';

import { Avatar }  from '@/components/ui/Avatar';
import { Badge }   from '@/components/ui/Badge';
import { Card }    from '@/components/ui/Card';
import { cn }      from '@/lib/cn';
import { formatRelative } from '@/lib/utils';
import type { WorkspaceUserPublic } from '../api/teamApi';

const ROLE_VARIANT: Record<string, 'warning' | 'primary' | 'secondary'> = {
  owner: 'warning', admin: 'primary', member: 'secondary', guest: 'secondary',
};

interface UserCardProps {
  user: WorkspaceUserPublic;
  index?: number;
}

export const UserCard: React.FC<UserCardProps> = ({ user, index = 0 }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
    >
      <Card
        hover padding="md"
        className="cursor-pointer"
        onClick={() => navigate(`/members/${user._id}`)}
      >
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            <Avatar
              name={`${user.firstName} ${user.lastName}`}
              src={user.avatar}
              size="lg"
            />
            <span className={cn(
              'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-surface-dark-secondary',
              user.status === 'active' ? 'bg-emerald-400' : 'bg-gray-300'
            )} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-bold text-[var(--color-text)] truncate leading-none">
                {user.firstName} {user.lastName}
              </p>
              <Badge variant={ROLE_VARIANT[user.workspaceRole] ?? 'secondary'} size="sm">
                {user.workspaceRole}
              </Badge>
            </div>

            {user.jobTitle && (
              <div className="flex items-center gap-1 mt-1.5">
                <Briefcase size={11} className="text-[var(--color-text-muted)] shrink-0" />
                <p className="text-xs text-[var(--color-text-muted)] truncate">{user.jobTitle}</p>
              </div>
            )}

            <div className="flex items-center gap-1 mt-1">
              <Mail size={11} className="text-[var(--color-text-muted)] shrink-0" />
              <p className="text-xs text-[var(--color-text-muted)] truncate">{user.email}</p>
            </div>

            {user.joinedAt && (
              <div className="flex items-center gap-1 mt-1">
                <Clock size={11} className="text-[var(--color-text-muted)] shrink-0" />
                <p className="text-xs text-[var(--color-text-muted)]">
                  Joined {formatRelative(user.joinedAt)}
                </p>
              </div>
            )}
          </div>
        </div>

        {user.bio && (
          <p className="text-xs text-[var(--color-text-muted)] mt-3 line-clamp-2 border-t border-surface-border dark:border-surface-dark-border pt-3">
            {user.bio}
          </p>
        )}
      </Card>
    </motion.div>
  );
};
