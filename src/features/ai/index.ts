export {
  aiApi, useAIStatus, useProjectSummary, useRiskAnalysis, useHealthExplanation,
  useGenerateTasks, useSuggestMilestones, useBudgetForecast,
  usePortfolioInsights, useAIChat, useAISearch,
} from './api/aiApi';
export type { RiskItem, GeneratedTask, SuggestedMilestone, BudgetForecast, SearchResult, PortfolioInsights, ChatMessage } from './api/aiApi';

export { AIAssistantPanel }  from './components/AIAssistantPanel';
export { RiskAnalysisPanel } from './components/RiskAnalysisPanel';
export { TaskGeneratorModal } from './components/TaskGeneratorModal';
export { AISearchBar }       from './components/AISearchBar';
