import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import type { AxiosError } from 'axios';

import type { ApiResponse } from '@workpulse/shared';
import { useAppSelector } from '@/store';
import { selectActiveWorkspace } from '@/store/workspaceSlice';
import { aiApi }  from '../api/aiApi';
import type { ChatMessage, AIInsightData } from '../api/aiApi';

const errMsg = (e: unknown) => {
  const ax = e as AxiosError<ApiResponse>;
  return ax.response?.data?.message ?? 'AI request failed';
};

const useWsId = () => useAppSelector(selectActiveWorkspace)?._id ?? '';

// ─── Project Summary ──────────────────────────────────────────────────────────

export const useProjectSummary = (projectId: string, enabled = true) => {
  const wsId = useWsId();
  return useQuery({
    queryKey:  ['ai', wsId, projectId, 'summary'],
    queryFn:   () => aiApi.getProjectSummary(projectId, wsId).then(r => r.data!),
    enabled:   !!wsId && !!projectId && enabled,
    staleTime: 60 * 60 * 1000,
    retry:     1,
  });
};

// ─── Risk Analysis ────────────────────────────────────────────────────────────

export const useRiskAnalysis = (projectId: string, enabled = true) => {
  const wsId  = useWsId();
  const qc    = useQueryClient();
  const query = useQuery({
    queryKey:  ['ai', wsId, projectId, 'risks'],
    queryFn:   () => aiApi.getRisks(projectId, wsId).then(r => r.data!),
    enabled:   !!wsId && !!projectId && enabled,
    staleTime: 30 * 60 * 1000,
    retry:     1,
  });

  const refresh = useMutation({
    mutationFn: () => aiApi.getRisks(projectId, wsId, true).then(r => r.data!),
    onSuccess:  (data) => {
      qc.setQueryData(['ai', wsId, projectId, 'risks'], data);
      toast.success('Risk analysis refreshed');
    },
    onError: (e) => toast.error(errMsg(e)),
  });

  return { ...query, refresh };
};

// ─── Health Explanation ───────────────────────────────────────────────────────

export const useHealthExplanation = (projectId: string, enabled = true) => {
  const wsId = useWsId();
  return useQuery({
    queryKey:  ['ai', wsId, projectId, 'health'],
    queryFn:   () => aiApi.getHealthExplanation(projectId, wsId).then(r => r.data!),
    enabled:   !!wsId && !!projectId && enabled,
    staleTime: 2 * 60 * 60 * 1000,
    retry:     1,
  });
};

// ─── Budget Forecast ──────────────────────────────────────────────────────────

export const useBudgetForecast = (projectId: string, enabled = true) => {
  const wsId = useWsId();
  return useQuery({
    queryKey:  ['ai', wsId, projectId, 'budget'],
    queryFn:   () => aiApi.getBudgetForecast(projectId, wsId).then(r => r.data!),
    enabled:   !!wsId && !!projectId && enabled,
    staleTime: 60 * 60 * 1000,
    retry:     1,
  });
};

// ─── Task Generator ───────────────────────────────────────────────────────────

export const useGenerateTasks = (projectId: string) => {
  const wsId = useWsId();
  return useMutation({
    mutationFn: (opts: { phase?: string; category?: string; count?: number }) =>
      aiApi.generateTasks(projectId, wsId, opts).then(r => r.data!),
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── Milestone Suggester ──────────────────────────────────────────────────────

export const useSuggestMilestones = (projectId: string) => {
  const wsId = useWsId();
  return useMutation({
    mutationFn: () => aiApi.suggestMilestones(projectId, wsId).then(r => r.data!),
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── Portfolio Insights ───────────────────────────────────────────────────────

export const usePortfolioInsights = (enabled = true) => {
  const wsId = useWsId();
  return useQuery({
    queryKey:  ['ai', wsId, 'portfolio'],
    queryFn:   () => aiApi.getPortfolioInsights(wsId).then(r => r.data!),
    enabled:   !!wsId && enabled,
    staleTime: 30 * 60 * 1000,
    retry:     1,
  });
};

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export const useAIChat = (projectId?: string) => {
  const wsId = useWsId();
  return useMutation({
    mutationFn: (messages: ChatMessage[]) =>
      aiApi.chat(wsId, messages, projectId).then(r => r.data!),
    onError: (e) => toast.error(errMsg(e)),
  });
};

// ─── AI Search ────────────────────────────────────────────────────────────────

export const useAISearch = () => {
  const wsId = useWsId();
  return useMutation({
    mutationFn: (query: string) => aiApi.search(wsId, query).then(r => r.data!),
    onError: (e) => toast.error(errMsg(e)),
  });
};
