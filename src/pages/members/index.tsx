import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Users } from 'lucide-react';

import { useTitle }  from '@/hooks';
import { Input }     from '@/components/ui/Input';
import { Badge }     from '@/components/ui/Badge';
import { Skeleton }  from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWorkspaceUsers } from '@/features/teams/hooks/useTeams';
import { UserCard }  from '@/features/users/components/UserCard';
import { useDebounce } from '@/hooks';

const ROLE_FILTERS = ['all', 'owner', 'admin', 'member', 'guest'] as const;
type RoleFilter = (typeof ROLE_FILTERS)[number];

const MembersPage: React.FC = () => {
  useTitle('Team Members');
  const [search,     setSearch]     = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<RoleFilter>('all');
  const debouncedSearch = useDebounce(search, 300);

  const { data: users = [], isLoading } = useWorkspaceUsers({
    search: debouncedSearch || undefined,
    role:   roleFilter !== 'all' ? roleFilter : undefined,
  });

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">Team Members</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
          Everyone in your workspace
        </p>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Input
          placeholder="Search by name, email, or job title..."
          leftIcon={<Search size={15} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          clearable
          onClear={() => setSearch('')}
          className="max-w-sm"
        />

        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter size={14} className="text-[var(--color-text-muted)]" />
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize ${
                roleFilter === role
                  ? 'bg-brand-600 text-white shadow-brand'
                  : 'bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text-secondary)] hover:bg-surface-tertiary'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-[var(--color-text-muted)] mb-4">
          {users.length} member{users.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map((i) => <Skeleton key={i} height={140} className="rounded-xl" />)}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title="No members found"
          description="Try adjusting your search or filter"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((user, i) => (
            <UserCard key={user._id} user={user} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersPage;
