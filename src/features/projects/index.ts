export { projectApi, clientApi } from './api/projectApi';
export type { CreateProjectPayload, CreateClientPayload } from './api/projectApi';

export {
  useProjects, useProject, useProjectDashboard,
  useCreateProject, useUpdateProject, useDeleteProject,
  useAddProjectMember, useToggleMilestone, useAddMilestone,
  useClients, useClient, useClientStats,
  useCreateClient, useUpdateClient, useDeleteClient,
} from './hooks/useProjects';

export { ProjectCard, PhaseBadge, HealthBadge, PHASE_CONFIG, TYPE_LABELS } from './components/ProjectCard';
export { CreateProjectModal } from './components/CreateProjectModal';
