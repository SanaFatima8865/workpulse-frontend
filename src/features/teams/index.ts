export { teamApi }         from './api/teamApi';
export type { TeamMemberPublic, WorkspaceUserPublic, UserProfilePublic, CreateTeamPayload, UpdateTeamPayload, UsersQueryParams } from './api/teamApi';

export {
  useTeams, useTeam, useCreateTeam, useUpdateTeam, useDeleteTeam,
  useTeamMembers, useAddTeamMember, useUpdateTeamMemberRole, useRemoveTeamMember,
  useWorkspaceUsers, useUserProfile,
} from './hooks/useTeams';

export { TeamCard }          from './components/TeamCard';
export { CreateTeamModal }   from './components/CreateTeamModal';
