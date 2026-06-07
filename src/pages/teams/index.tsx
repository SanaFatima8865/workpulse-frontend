import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Users } from 'lucide-react';

import { useTitle }        from '@/hooks';
import { Button }          from '@/components/ui/Button';
import { Input }           from '@/components/ui/Input';
import { Skeleton }        from '@/components/ui/Spinner';
import { EmptyState }      from '@/components/ui/EmptyState';
import { useTeams }        from '@/features/teams/hooks/useTeams';
import { TeamCard }        from '@/features/teams/components/TeamCard';
import { CreateTeamModal } from '@/features/teams/components/CreateTeamModal';

const TeamsPage: React.FC = () => {
  useTitle('Teams');
  const { data: teams = [], isLoading } = useTeams();
  const [search,     setSearch]     = React.useState('');
  const [createOpen, setCreateOpen] = React.useState(false);

  const filtered = search
    ? teams.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      )
    : teams;

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">Teams</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {teams.length} team{teams.length !== 1 ? 's' : ''} in this workspace
          </p>
        </div>
        <Button
          variant="primary" size="md"
          leftIcon={<Plus size={16} />}
          onClick={() => setCreateOpen(true)}
        >
          New Team
        </Button>
      </motion.div>

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search teams..."
          leftIcon={<Search size={15} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          clearable
          onClear={() => setSearch('')}
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map((i) => <Skeleton key={i} height={148} className="rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title={search ? 'No teams match your search' : 'No teams yet'}
          description={search ? 'Try a different search term' : 'Create your first team to organize your workspace members'}
          action={!search ? { label: 'Create Team', onClick: () => setCreateOpen(true) } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((team, i) => (
            <TeamCard key={team._id} team={team} index={i} />
          ))}
        </div>
      )}

      <CreateTeamModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
};

export default TeamsPage;
