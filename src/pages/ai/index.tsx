import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles, Bot, AlertTriangle, CheckSquare, TrendingUp,
  Search, ChevronRight, Zap, Activity, Shield,
} from 'lucide-react';

import { useTitle }            from '@/hooks';
import { Card }                from '@/components/ui/Card';
import { Button }              from '@/components/ui/Button';
import { Badge }               from '@/components/ui/Badge';
import { Skeleton }            from '@/components/ui/Spinner';
import { cn }                  from '@/lib/cn';
import { useAIStatus, usePortfolioInsights } from '@/features/ai';
import { useProjects }         from '@/features/projects';
import { AIAssistantPanel }    from '@/features/ai/components/AIAssistantPanel';
import { RiskAnalysisPanel }   from '@/features/ai/components/RiskAnalysisPanel';
import { AISearchBar }         from '@/features/ai/components/AISearchBar';

// ─── Feature cards ────────────────────────────────────────────────────────────

interface AIFeatureCardProps {
  icon:        React.ReactNode;
  iconBg:      string;
  title:       string;
  description: string;
  badge?:      string;
  onClick:     () => void;
  index:       number;
}

const AIFeatureCard: React.FC<AIFeatureCardProps> = ({ icon, iconBg, title, description, badge, onClick, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06 }}
    onClick={onClick}
    className="bg-white dark:bg-surface-dark-secondary rounded-2xl border border-surface-border dark:border-surface-dark-border shadow-card p-5 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 group"
  >
    <div className="flex items-start gap-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-bold text-[var(--color-text)]">{title}</h3>
          {badge && <Badge variant="primary" size="sm">{badge}</Badge>}
        </div>
        <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{description}</p>
      </div>
      <ChevronRight size={16} className="text-[var(--color-text-muted)] group-hover:text-brand-600 transition-colors shrink-0 mt-0.5" />
    </div>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const AIHubPage: React.FC = () => {
  useTitle('AI Features');
  const navigate   = useNavigate();
  const { data: status } = useAIStatus();
  const { data: portfolioData, isLoading: insightsLoading } = usePortfolioInsights();
  const { data: projects = [] } = useProjects();
  const activeProjects = projects.filter(p => ['construction','pre_construction','closeout'].includes(p.phase));

  const [chatOpen,    setChatOpen]    = React.useState(false);
  const [searchOpen,  setSearchOpen]  = React.useState(false);
  const [selectedProject, setSelectedProject] = React.useState<string>('');

  const insights = portfolioData?.insights;

  const HEALTH_STYLE = {
    excellent: { label: 'Excellent', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    good:      { label: 'Good',      color: 'text-teal-600',    bg: 'bg-teal-50 dark:bg-teal-950/20' },
    fair:      { label: 'Fair',      color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-950/20' },
    poor:      { label: 'Poor',      color: 'text-red-600',     bg: 'bg-red-50 dark:bg-red-950/20' },
  };
  const hs = insights?.overallHealth ? HEALTH_STYLE[insights.overallHealth] : null;

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-brand rounded-2xl flex items-center justify-center shadow-brand">
            <Sparkles size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">AI Features</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={cn('w-2 h-2 rounded-full', status?.isReal ? 'bg-emerald-400' : 'bg-amber-400')} />
              <p className="text-xs text-[var(--color-text-muted)]">
                {status?.isReal ? `Connected to ${status.provider}` : 'Demo mode — add API key for real AI'}
              </p>
            </div>
          </div>
        </div>
        <Button variant="primary" size="md" leftIcon={<Bot size={15} />} onClick={() => setChatOpen(true)}>
          Open AI Chat
        </Button>
      </motion.div>

      {/* API key notice if using mock */}
      {status && !status.isReal && (
        <motion.div
          className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 flex items-start gap-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Zap size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Running in Demo Mode</p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
              All AI features work with realistic mock responses. To use real AI, add{' '}
              <code className="font-mono bg-amber-100 dark:bg-amber-950/40 px-1 rounded">ANTHROPIC_API_KEY</code> or{' '}
              <code className="font-mono bg-amber-100 dark:bg-amber-950/40 px-1 rounded">OPENAI_API_KEY</code>{' '}
              to your <code className="font-mono bg-amber-100 dark:bg-amber-950/40 px-1 rounded">apps/server/.env</code> file.
            </p>
          </div>
        </motion.div>
      )}

      {/* Feature grid */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">AI Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { icon: <Search size={18} />,        iconBg: 'bg-brand-100 text-brand-600',   title: 'Smart Search',         description: 'Natural language search across projects, tasks, and clients', onClick: () => setSearchOpen(true),                                           index: 0 },
            { icon: <Bot size={18} />,            iconBg: 'bg-indigo-100 text-indigo-600', title: 'AI Chat Assistant',    description: 'Conversational AI with full project context and memory',        onClick: () => setChatOpen(true),                                             index: 1 },
            { icon: <AlertTriangle size={18} />,  iconBg: 'bg-amber-100 text-amber-600',   title: 'Risk Analysis',        description: 'AI identifies schedule, budget, and operational risks',          onClick: () => navigate('/projects'),                                         index: 2 },
            { icon: <CheckSquare size={18} />,    iconBg: 'bg-teal-100 text-teal-600',     title: 'Task Generator',       description: 'Generate phase-appropriate task lists with one click',           onClick: () => navigate('/projects'),                                         index: 3 },
            { icon: <TrendingUp size={18} />,     iconBg: 'bg-emerald-100 text-emerald-600',title:'Budget Forecasting',   description: 'Predict final costs and identify budget variance trends',         onClick: () => navigate('/analytics'),                                        index: 4 },
            { icon: <Activity size={18} />,       iconBg: 'bg-purple-100 text-purple-600', title: 'Portfolio Insights',   description: 'Portfolio-wide risk detection and opportunity identification',    onClick: () => window.scrollTo({ top: 9999, behavior: 'smooth' }),           index: 5 },
          ].map(feat => <AIFeatureCard key={feat.title} {...feat} />)}
        </div>
      </div>

      {/* Main two-col layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Portfolio Insights */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center">
              <Activity size={14} className="text-white" />
            </div>
            <h3 className="text-sm font-bold text-[var(--color-text)]">Portfolio AI Insights</h3>
            {portfolioData?.provider === 'mock' && <span className="text-2xs bg-surface-secondary text-[var(--color-text-muted)] px-1.5 py-0.5 rounded">Demo</span>}
          </div>

          {insightsLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} height={60} className="rounded-xl" />)}</div>
          ) : insights ? (
            <div className="space-y-4">
              {/* Health score */}
              {hs && (
                <div className={cn('flex items-center justify-between p-3 rounded-xl', hs.bg)}>
                  <span className="text-sm font-semibold text-[var(--color-text)]">Portfolio Health</span>
                  <span className={cn('text-sm font-bold capitalize', hs.color)}>{hs.label}</span>
                </div>
              )}

              {/* Summary */}
              <p className="text-sm text-[var(--color-text)] leading-relaxed">{insights.summary}</p>

              {/* Top risks */}
              {insights.topRisks?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Key Risks</p>
                  {insights.topRisks.map((risk, i) => (
                    <div key={i} className={cn('flex items-start gap-2.5 p-3 rounded-xl border text-xs',
                      risk.urgency === 'high' ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900' : 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900')}>
                      <AlertTriangle size={13} className={risk.urgency === 'high' ? 'text-red-500 shrink-0 mt-0.5' : 'text-amber-500 shrink-0 mt-0.5'} />
                      <p className="text-[var(--color-text)]">{risk.risk}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Opportunities */}
              {insights.opportunities?.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Opportunities</p>
                  {insights.opportunities.map((opp, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                      <p className="text-[var(--color-text)]">{opp}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-[var(--color-text-muted)] text-center py-6">Add projects to generate portfolio insights</p>
          )}
        </Card>

        {/* Risk Analysis for first active project */}
        <Card padding="lg">
          {activeProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <Shield size={28} className="text-[var(--color-text-muted)]" />
              <p className="text-sm font-medium text-[var(--color-text)]">No active projects</p>
              <p className="text-xs text-[var(--color-text-muted)]">Create projects in construction phase to see risk analysis</p>
              <Button variant="primary" size="sm" className="mt-2" onClick={() => navigate('/projects')}>Create Project</Button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4">
                <select
                  value={selectedProject || activeProjects[0]?._id}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="text-xs font-semibold bg-transparent text-[var(--color-text)] focus:outline-none cursor-pointer"
                >
                  {activeProjects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              <RiskAnalysisPanel projectId={selectedProject || activeProjects[0]?._id || ''} />
            </>
          )}
        </Card>
      </div>

      {/* Modals */}
      <AIAssistantPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      <AISearchBar open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
};

export default AIHubPage;
