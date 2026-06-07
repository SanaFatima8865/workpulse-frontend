import type { ApiResponse } from '@workpulse/shared';
import { apiClient } from '@/lib/apiClient';
import { useQuery }  from '@tanstack/react-query';
import { useAppSelector } from '@/store';
import { selectActiveWorkspace } from '@/store/workspaceSlice';

export interface PortfolioMetrics {
  totalProjects: number; activeProjects: number; completedProjects: number;
  atRiskProjects: number; criticalProjects: number; onHoldProjects: number;
  avgHealthScore: number; totalContractValue: number; totalBilled: number;
  totalCollected: number; totalPendingCOs: number; totalApprovedCOs: number;
}
export interface PhaseBreakdown   { phase: string; count: number; totalValue: number; avgHealth: number }
export interface HealthDistribution { healthy: number; atRisk: number; critical: number }
export interface BudgetByProject  { projectId: string; name: string; jobNumber: string; contractValue: number; billed: number; collected: number; pendingCOs: number; coverColor: string; healthScore: number }
export interface TaskTrend        { date: string; created: number; completed: number; overdue: number }
export interface TeamWorkload     { userId: string; taskCount: number; doneCount: number; overdueCount: number }
export interface UpcomingMilestone { projectId: string; projectName: string; jobNumber: string; coverColor: string; milestoneId: string; name: string; dueDate: string; daysUntilDue: number; isOverdue: boolean }
export interface ClientPortfolio  { clientId: string; name: string; type: string; projects: number; totalValue: number; avgHealth: number }
export interface WorkspaceAnalytics {
  portfolio: PortfolioMetrics; phaseBreakdown: PhaseBreakdown[]; healthDistribution: HealthDistribution;
  budgetByProject: BudgetByProject[]; taskTrend: TaskTrend[]; teamWorkload: TeamWorkload[];
  upcomingMilestones: UpcomingMilestone[]; clientPortfolio: ClientPortfolio[];
  taskStats: { total: number; done: number; inProgress: number; blocked: number; overdue: number };
}

const withWs = (wsId: string) => ({ headers: { 'X-Workspace-ID': wsId } });

export const analyticsApi = {
  getWorkspace: (wsId: string) =>
    apiClient.get<ApiResponse<WorkspaceAnalytics>>('/analytics/workspace', withWs(wsId)).then(r => r.data),
  getProject: (projectId: string, wsId: string) =>
    apiClient.get<ApiResponse<Record<string,unknown>>>(`/analytics/project/${projectId}`, withWs(wsId)).then(r => r.data),
};

const useWsId = () => useAppSelector(selectActiveWorkspace)?._id ?? '';

export const useWorkspaceAnalytics = () => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['analytics', wsId, 'workspace'],
    queryFn:  async () => { const r = await analyticsApi.getWorkspace(wsId); return r.data!; },
    enabled:  !!wsId, staleTime: 2 * 60 * 1000, refetchInterval: 5 * 60 * 1000,
  });
};

export const useProjectAnalytics = (projectId: string) => {
  const wsId = useWsId();
  return useQuery({
    queryKey: ['analytics', wsId, 'project', projectId],
    queryFn:  async () => { const r = await analyticsApi.getProject(projectId, wsId); return r.data!; },
    enabled:  !!wsId && !!projectId, staleTime: 3 * 60 * 1000,
  });
};
