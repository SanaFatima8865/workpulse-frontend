import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Layers, HardHat } from 'lucide-react';

import { useTitle }       from '@/hooks';
import { Button }         from '@/components/ui/Button';
import { Card }           from '@/components/ui/Card';
import { Skeleton }       from '@/components/ui/Spinner';
import { EmptyState }     from '@/components/ui/EmptyState';
import { useProjects }    from '@/features/projects';
import { useBoardsByProject } from '@/features/boards';
import { useAppSelector } from '@/store';
import { selectActiveWorkspace } from '@/store/workspaceSlice';

const BoardsListPage: React.FC = () => {
  useTitle('Boards');
  const navigate = useNavigate();
  const ws = useAppSelector(selectActiveWorkspace);
  const { data: projects = [], isLoading: projectsLoading } = useProjects();

  // Only show projects that have at least started
  const activeProjects = projects.filter(p =>
    ['awarded','pre_construction','construction','closeout'].includes(p.phase)
  );

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <motion.div className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)] flex items-center gap-2">
            <Layers size={24} className="text-brand-600" />Project Boards
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">Kanban boards for active construction projects</p>
        </div>
      </motion.div>

      {projectsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} height={120} className="rounded-xl" />)}
        </div>
      ) : activeProjects.length === 0 ? (
        <EmptyState
          icon={<Layers size={28} />}
          title="No active projects"
          description="Boards are created automatically for awarded/active construction projects"
          action={{ label: 'View Projects', onClick: () => navigate('/projects') }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeProjects.map((project, i) => (
            <motion.div key={project._id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}>
              <Card hover padding="md" className="cursor-pointer"
                onClick={() => navigate(`/boards/${project._id}`)}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    style={{ backgroundColor: project.coverColor }}>
                    <HardHat size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--color-text)] truncate">{project.name}</p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {project.jobNumber} · {project.phase.replace('_',' ')}
                    </p>
                    <p className="text-xs text-brand-600 mt-1.5 font-medium">View Board →</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardsListPage;
