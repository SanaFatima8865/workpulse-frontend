import type { ApiResponse } from '@workpulse/shared';
import { apiClient }  from '@/lib/apiClient';
import { useMutation, useQuery } from '@tanstack/react-query';
import toast           from 'react-hot-toast';
import { useAppSelector } from '@/store';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import type { AxiosError } from 'axios';

export interface RiskItem        { level: 'high'|'medium'|'low'; category: string; impact: string; recommendation: string; score: number }
export interface GeneratedTask   { title: string; priority: string; estimatedHours: number; labels: string[] }
export interface SuggestedMilestone { name: string; daysFromStart: number; category: string }
export interface BudgetForecast  { trend: 'on_track'|'over_budget'|'under_budget'; projectedFinalCost: number|null; confidence: number; analysis: string; recommendations: string[] }
export interface SearchResult    { type: 'project'|'task'|'client'; id: string; title: string; subtitle: string; url: string; meta: Record<string,unknown> }
export interface PortfolioInsights { overallHealth: 'excellent'|'good'|'fair'|'poor'; topRisks: Array<{projectCount:number;risk:string;urgency:string}>; opportunities: string[]; summary: string }
export interface ChatMessage     { role: 'user'|'assistant'; content: string; timestamp?: string }

const withWs = (wsId: string) => ({ headers: { 'X-Workspace-ID': wsId } });
const errMsg = (e: unknown) => { const ax = e as AxiosError<ApiResponse>; return ax.response?.data?.message ?? 'AI request failed'; };
const useWsId = () => useAppSelector(selectActiveWorkspace)?._id ?? '';

export const aiApi = {
  getStatus:           (wsId: string) => apiClient.get<ApiResponse<{provider:string;isReal:boolean;message:string}>>('/ai/status', withWs(wsId)).then(r => r.data),
  getSummary:          (pId: string, wsId: string) => apiClient.get<ApiResponse<{summary:string;provider:string}>>(`/ai/project/${pId}/summary`, withWs(wsId)).then(r => r.data),
  getRisks:            (pId: string, wsId: string) => apiClient.get<ApiResponse<{risks:RiskItem[];provider:string}>>(`/ai/project/${pId}/risks`, withWs(wsId)).then(r => r.data),
  getHealth:           (pId: string, wsId: string) => apiClient.get<ApiResponse<{explanation:string;provider:string}>>(`/ai/project/${pId}/health`, withWs(wsId)).then(r => r.data),
  generateTasks:       (pId: string, wsId: string) => apiClient.post<ApiResponse<{tasks:GeneratedTask[];provider:string}>>(`/ai/project/${pId}/tasks`, {}, withWs(wsId)).then(r => r.data),
  suggestMilestones:   (pId: string, wsId: string) => apiClient.post<ApiResponse<{milestones:SuggestedMilestone[];provider:string}>>(`/ai/project/${pId}/milestones`, {}, withWs(wsId)).then(r => r.data),
  forecastBudget:      (pId: string, wsId: string) => apiClient.get<ApiResponse<{forecast:BudgetForecast;provider:string}>>(`/ai/project/${pId}/budget`, withWs(wsId)).then(r => r.data),
  getPortfolioInsights:(wsId: string) => apiClient.get<ApiResponse<{insights:PortfolioInsights;provider:string}>>('/ai/workspace/insights', withWs(wsId)).then(r => r.data),
  chat:                (wsId: string, messages: ChatMessage[], projectId?: string) => apiClient.post<ApiResponse<{reply:string;provider:string}>>('/ai/chat', { messages, projectId }, withWs(wsId)).then(r => r.data),
  search:              (wsId: string, q: string) => apiClient.get<ApiResponse<{results:SearchResult[];provider:string}>>(`/ai/search?q=${encodeURIComponent(q)}`, withWs(wsId)).then(r => r.data),
};

export const useAIStatus         = () => { const wsId = useWsId(); return useQuery({ queryKey: ['ai','status',wsId], queryFn: async () => (await aiApi.getStatus(wsId)).data!, enabled: !!wsId, staleTime: 10*60*1000 }); };
export const useProjectSummary   = (pId: string) => { const wsId = useWsId(); return useQuery({ queryKey: ['ai',wsId,pId,'summary'], queryFn: async () => (await aiApi.getSummary(pId,wsId)).data!, enabled: !!wsId&&!!pId, staleTime: 30*60*1000 }); };
export const useRiskAnalysis     = (pId: string) => { const wsId = useWsId(); return useQuery({ queryKey: ['ai',wsId,pId,'risks'], queryFn: async () => (await aiApi.getRisks(pId,wsId)).data!, enabled: !!wsId&&!!pId, staleTime: 15*60*1000 }); };
export const useHealthExplanation= (pId: string) => { const wsId = useWsId(); return useQuery({ queryKey: ['ai',wsId,pId,'health'], queryFn: async () => (await aiApi.getHealth(pId,wsId)).data!, enabled: !!wsId&&!!pId, staleTime: 60*60*1000 }); };
export const useBudgetForecast   = (pId: string) => { const wsId = useWsId(); return useQuery({ queryKey: ['ai',wsId,pId,'budget'], queryFn: async () => (await aiApi.forecastBudget(pId,wsId)).data!, enabled: !!wsId&&!!pId, staleTime: 30*60*1000 }); };
export const usePortfolioInsights= () => { const wsId = useWsId(); return useQuery({ queryKey: ['ai',wsId,'portfolio'], queryFn: async () => (await aiApi.getPortfolioInsights(wsId)).data!, enabled: !!wsId, staleTime: 15*60*1000 }); };
export const useGenerateTasks    = (pId: string) => { const wsId = useWsId(); return useMutation({ mutationFn: () => aiApi.generateTasks(pId,wsId), onSuccess: () => toast.success('Tasks generated by AI ✨'), onError: (e) => toast.error(errMsg(e)) }); };
export const useSuggestMilestones= (pId: string) => { const wsId = useWsId(); return useMutation({ mutationFn: () => aiApi.suggestMilestones(pId,wsId), onSuccess: () => toast.success('Milestones suggested by AI ✨'), onError: (e) => toast.error(errMsg(e)) }); };
export const useAIChat           = () => { const wsId = useWsId(); return useMutation({ mutationFn: ({ messages, projectId }: { messages: ChatMessage[]; projectId?: string }) => aiApi.chat(wsId, messages, projectId), onError: (e) => toast.error(errMsg(e)) }); };
export const useAISearch         = () => { const wsId = useWsId(); return useMutation({ mutationFn: (q: string) => aiApi.search(wsId, q), onError: (e) => toast.error(errMsg(e)) }); };
