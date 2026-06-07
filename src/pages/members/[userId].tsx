import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Briefcase, Clock, Globe, Users } from 'lucide-react';

import { useTitle }    from '@/hooks';
import { Avatar }      from '@/components/ui/Avatar';
import { Badge }       from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { Skeleton, PageLoader } from '@/components/ui/Spinner';
import { EmptyState }  from '@/components/ui/EmptyState';
import { useUserProfile } from '@/features/teams/hooks/useTeams';
import { useAppSelector } from '@/store';
import { selectCurrentUser } from '@/store/authSlice';
import { formatRelative }  from '@/lib/utils';
import { cn }              from '@/lib/cn';

const MemberProfilePage: React.FC = () => {
  const { userId = '' } = useParams<{ userId: string }>();
  const navigate        = useNavigate();
  const currentUser     = useAppSelector(selectCurrentUser);
  const isSelf          = userId === currentUser?._id;

  const { data: profile, isLoading } = useUserProfile(userId);
  useTitle(profile ? `${profile.firstName} ${profile.lastName}` : 'Profile');

  if (isLoading) return <PageLoader message="Loading profile..." />;
  if (!profile) return (
    <div className="p-6 flex items-center justify-center h-full">
      <EmptyState title="Profile not found" description="This user may not exist or you don't have access." />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-5">
      {/* Back */}
      <button onClick={() => navigate('/members')}
        className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
        <ArrowLeft size={15} /> All Members
      </button>

      {/* Profile header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Card padding="lg">
          <div className="flex items-start gap-5">
            <div className="relative shrink-0">
              <Avatar name={`${profile.firstName} ${profile.lastName}`} src={profile.avatar} size="2xl" />
              <span className={cn(
                'absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-surface-dark-secondary',
                profile.status === 'active' ? 'bg-emerald-400' : 'bg-gray-300'
              )} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">
                  {profile.firstName} {profile.lastName}
                </h1>
                {isSelf && <Badge variant="primary" size="md">You</Badge>}
                <Badge variant={profile.workspaceRole === 'owner' ? 'warning' : profile.workspaceRole === 'admin' ? 'primary' : 'secondary'} size="md">
                  {profile.workspaceRole}
                </Badge>
              </div>

              <div className="mt-3 space-y-1.5">
                {profile.jobTitle && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Briefcase size={14} className="text-[var(--color-text-muted)]" />
                    {profile.jobTitle}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Mail size={14} className="text-[var(--color-text-muted)]" />
                  {profile.email}
                </div>
                {profile.timezone && (
                  <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                    <Globe size={14} className="text-[var(--color-text-muted)]" />
                    {profile.timezone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                  <Clock size={14} className="text-[var(--color-text-muted)]" />
                  Member since {formatRelative(profile.createdAt)}
                </div>
              </div>

              {isSelf && (
                <button
                  onClick={() => navigate('/profile')}
                  className="mt-4 text-xs text-brand-600 hover:underline font-medium"
                >
                  Edit your profile →
                </button>
              )}
            </div>
          </div>

          {profile.bio && (
            <div className="mt-5 pt-5 border-t border-surface-border dark:border-surface-dark-border">
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2">About</p>
              <p className="text-sm text-[var(--color-text)] leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Shared teams */}
      {profile.sharedTeams && profile.sharedTeams.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card padding="lg">
            <CardHeader
              title={<span className="flex items-center gap-2"><Users size={16} className="text-brand-600" />Shared Teams</span>}
              subtitle={isSelf ? 'Your teams' : `Teams you share with ${profile.firstName}`}
              divider
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              {profile.sharedTeams.map((team) => (
                <button
                  key={team._id}
                  onClick={() => navigate(`/teams/${team._id}`)}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-surface-border dark:border-surface-dark-border hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-950/30 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: team.color }}>
                    <Users size={14} />
                  </div>
                  <span className="text-sm font-semibold text-[var(--color-text)] truncate">{team.name}</span>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default MemberProfilePage;
