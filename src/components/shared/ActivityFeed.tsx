import React from 'react';
import {
  CheckCircle2, Plus, MessageSquare, Upload,
  FolderKanban, Users, Settings, Zap,
} from 'lucide-react';

import { Avatar }         from '@/components/ui/Avatar';
import { Skeleton }       from '@/components/ui/Spinner';
import { EmptyState }     from '@/components/ui/EmptyState';
import { cn }             from '@/lib/cn';
import { formatRelative } from '@/lib/utils';
import { useActivityFeed } from '@/features/users/hooks/useUsers';
import type { ActivityItem } from '@/features/users/api/usersApi';

// ─── Activity type → icon/color ───────────────────────────────────────────────

const ACTIVITY_META: Record<string, { icon: React.ReactNode; color: string }> = {
  task_created:      { icon: <Plus size={13} />,         color: 'bg-brand-100 text-brand-600' },
  task_completed:    { icon: <CheckCircle2 size={13} />, color: 'bg-emerald-100 text-emerald-600' },
  task_updated:      { icon: <Settings size={13} />,     color: 'bg-blue-100 text-blue-600' },
  task_assigned:     { icon: <Users size={13} />,        color: 'bg-purple-100 text-purple-600' },
  comment_added:     { icon: <MessageSquare size={13} />,color: 'bg-amber-100 text-amber-600' },
  file_uploaded:     { icon: <Upload size={13} />,       color: 'bg-teal-100 text-teal-600' },
  project_created:   { icon: <FolderKanban size={13} />, color: 'bg-brand-100 text-brand-600' },
  project_updated:   { icon: <Settings size={13} />,     color: 'bg-blue-100 text-blue-600' },
  member_joined:     { icon: <Users size={13} />,        color: 'bg-emerald-100 text-emerald-600' },
  team_created:      { icon: <Users size={13} />,        color: 'bg-brand-100 text-brand-600' },
  workspace_updated: { icon: <Settings size={13} />,     color: 'bg-gray-100 text-gray-600' },
};

const getActivityMeta = (type: string) =>
  ACTIVITY_META[type] ?? { icon: <Zap size={13} />, color: 'bg-gray-100 text-gray-600' };

// ─── Single Activity Item ─────────────────────────────────────────────────────

const ActivityRow: React.FC<{ activity: ActivityItem; isLast: boolean }> = ({
  activity, isLast,
}) => {
  const { icon, color } = getActivityMeta(activity.type);
  const user            = activity.user;
  const name            = user
    ? `${user.firstName} ${user.lastName}`
    : 'Unknown User';

  return (
    <div className="flex gap-3 group">
      {/* Timeline line */}
      <div className="flex flex-col items-center">
        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center shrink-0', color)}>
          {icon}
        </div>
        {!isLast && <div className="w-px flex-1 bg-surface-border dark:bg-surface-dark-border mt-1" />}
      </div>

      {/* Content */}
      <div className={cn('flex-1 min-w-0', !isLast && 'pb-4')}>
        <div className="flex items-start gap-2">
          {user && (
            <Avatar name={name} src={user.avatar} size="xs" className="shrink-0 mt-0.5" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[var(--color-text)] leading-snug">
              <span className="font-semibold">{name}</span>{' '}
              <span className="text-[var(--color-text-secondary)]">{activity.title}</span>
            </p>
            {activity.description && (
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5 leading-relaxed">
                {activity.description}
              </p>
            )}
            <p className="text-2xs text-[var(--color-text-muted)] mt-1">
              {formatRelative(activity.createdAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ActivityFeed ─────────────────────────────────────────────────────────────

interface ActivityFeedProps {
  workspaceId: string;
  userId?:     string;
  limit?:      number;
  className?:  string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  workspaceId,
  userId,
  limit = 20,
  className,
}) => {
  const { data, isLoading } = useActivityFeed(workspaceId, { limit, userId });
  const activities = (data as { data?: ActivityItem[] })?.data ?? [];

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton circle width={24} height={24} className="shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton height={14} width="70%" />
              <Skeleton height={12} width="40%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities.length) {
    return (
      <EmptyState
        title="No activity yet"
        description="Actions like creating tasks and updating projects will appear here"
        size="sm"
        className={className}
      />
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {activities.map((activity, i) => (
        <ActivityRow
          key={activity._id}
          activity={activity}
          isLast={i === activities.length - 1}
        />
      ))}
    </div>
  );
};
