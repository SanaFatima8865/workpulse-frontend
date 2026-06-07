import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, LayoutGrid, List, Filter, HardHat } from 'lucide-react';

import { useTitle }         from '@/hooks';
import { Button }           from '@/components/ui/Button';
import { Input }            from '@/components/ui/Input';
import { Skeleton }         from '@/components/ui/Spinner';
import { EmptyState }       from '@/components/ui/EmptyState';
import { StatCard }         from '@/components/ui/Card';
import { useProjects, useProjectDashboard, CreateProjectModal, ProjectCard, PHASE_CONFIG } from '@/features/projects';
import { useDebounce }      from '@/hooks';
import type { ProjectPhase, ProjectType } from '@/store/projectSlice';
import { formatCurrency }   from '@/lib/utils';

const PHASE_FILTERS: Array<{ id: ProjectPhase | 'all'; label: string }> = [
  { id: 'all',             label: 'All' },
  { id: 'pre_bid',         label: 'Pre-Bid' },
  { id: 'bidding',         label: 'Bidding' },
  { id: 'pre_construction',label: 'Pre-Con' },
  { id: 'construction',    label: 'Construction' },
  { id: 'closeout',        label: 'Close-Out' },
  { id: 'completed',       label: 'Completed' },
];

const ProjectsPage: React.FC = () => {
  useTitle('Projects');

  const [search,      setSearch]      = React.useState('');
  const [phaseFilter, setPhaseFilter] = React.useState<ProjectPhase | 'all'>('all');
  const [createOpen,  setCreateOpen]  = React.useState(false);
  const [viewMode,    setViewMode]    = React.useState<'grid' | 'list'>('grid');
  const debouncedSearch = useDebounce(search, 300);

  const params = {
    search: debouncedSearch || undefined,
    phase:  phaseFilter !== 'all' ? phaseFilter : undefined,
  };

  const { data: projects = [], isLoading } = useProjects(params);
  const { data: dashboard } = useProjectDashboard();

  const overview = dashboard?.overview as Record<string, number> | undefined;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)] flex items-center gap-2">
            <HardHat size={24} className="text-brand-600" />
            Construction Projects
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {overview?.total ?? 0} total · {overview?.activeProjects ?? 0} active · {overview?.atRisk ?? 0} at risk
          </p>
        </div>
        <Button variant="primary" size="md" leftIcon={<Plus size={16} />} onClick={() => setCreateOpen(true)}>
          New Project
        </Button>
      </motion.div>

      {/* Dashboard stats */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Projects',     value: overview.total ?? 0,              icon: <HardHat size={18} />,     iconColor: 'bg-brand-100 text-brand-600' },
            { label: 'Active on Site',     value: overview.activeProjects ?? 0,     icon: <HardHat size={18} />,     iconColor: 'bg-emerald-100 text-emerald-600' },
            { label: 'Total Contract Value', value: formatCurrency(overview.totalValue ?? 0), icon: <span className="font-bold text-sm">$</span>, iconColor: 'bg-teal-100 text-teal-600' },
            { label: 'Avg Health Score',   value: `${Math.round(overview.avgHealth ?? 0)}%`, icon: <span className="font-bold text-sm">♥</span>, iconColor: 'bg-amber-100 text-amber-600' },
          ].map((s) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <StatCard label={s.label} value={s.value} icon={s.icon} iconColor={s.iconColor} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <Input
          placeholder="Search projects, job number, city..."
          leftIcon={<Search size={15} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          clearable onClear={() => setSearch('')}
          className="max-w-sm"
        />

        <div className="flex items-center gap-1.5 flex-wrap">
          {PHASE_FILTERS.map((f) => (
            <button key={f.id} onClick={() => setPhaseFilter(f.id as ProjectPhase | 'all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize
                ${phaseFilter === f.id
                  ? 'bg-brand-600 text-white shadow-brand'
                  : 'bg-surface-secondary dark:bg-surface-dark-tertiary text-[var(--color-text-secondary)] hover:bg-surface-tertiary'}`}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex gap-1">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-brand-50 text-brand-600' : 'text-[var(--color-text-muted)] hover:bg-surface-secondary'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-brand-50 text-brand-600' : 'text-[var(--color-text-muted)] hover:bg-surface-secondary'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        {projects.length} project{projects.length !== 1 ? 's' : ''} found
      </p>

      {/* Grid / List */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} height={220} className="rounded-xl" />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<HardHat size={28} />}
          title={search ? 'No projects match your search' : 'No projects yet'}
          description={search ? 'Try a different search term or filter' : 'Create your first construction project to get started'}
          action={!search ? { label: 'New Project', onClick: () => setCreateOpen(true) } : undefined}
        />
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
          : 'flex flex-col gap-3'}>
          {projects.map((project, i) => (
            <ProjectCard key={project._id} project={project} index={i} />
          ))}
        </div>
      )}

      <CreateProjectModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
};

export default ProjectsPage;
