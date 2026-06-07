import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3, Building2, DollarSign, HardHat, TrendingUp,
  AlertTriangle, CheckCircle2, Clock, Calendar, Users,
  RefreshCw, ChevronRight,
} from 'lucide-react';

import { useTitle }  from '@/hooks';
import { Button }    from '@/components/ui/Button';
import { Skeleton }  from '@/components/ui/Spinner';
import { Badge }     from '@/components/ui/Badge';
import { cn }        from '@/lib/cn';
import { formatCurrency, formatDate, formatRelative } from '@/lib/utils';

import {
  useWorkspaceAnalytics,
  KPICard, HealthRing,
  TaskTrendChart, PhaseDistributionChart,
  BudgetChart, HealthDistributionChart,
  FinancialSummaryChart, ClientPortfolioTable,
} from '@/features/analytics';

// ─── Skeleton layout ──────────────────────────────────────────────────────────

const AnalyticsSkeleton: React.FC = () => (
  <div className="p-6 max-w-[1600px] mx-auto space-y-6">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <Skeleton key={i} height={110} className="rounded-2xl" />)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
      {[1,2,3,4,5,6].map(i => <Skeleton key={i} height={260} className="rounded-2xl" />)}
    </div>
  </div>
);

// ─── Upcoming Milestones List ─────────────────────────────────────────────────

const MilestonesList: React.FC<{ milestones: ReturnType<typeof useWorkspaceAnalytics>['data'] extends undefined ? [] : NonNullable<ReturnType<typeof useWorkspaceAnalytics>['data']>['upcomingMilestones'] }> = ({ milestones }) => {
  const navigate = useNavigate();
  if (!milestones || milestones.length === 0) {
    return <p className="text-sm text-[var(--color-text-muted)] text-center py-6">No upcoming milestones in the next 30 days</p>;
  }
  return (
    <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
      {milestones.map((m) => (
        <div key={m.milestoneId}
          className="flex items-center gap-3 px-5 py-3 hover:bg-surface-secondary/50 cursor-pointer transition-colors"
          onClick={() => navigate(`/projects/${m.projectId}`)}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ backgroundColor: m.coverColor }}>
            {m.jobNumber.slice(-3)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">{m.name}</p>
            <p className="text-2xs text-[var(--color-text-muted)] truncate">{m.projectName}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={cn('text-xs font-bold', m.isOverdue ? 'text-red-500' : m.daysUntilDue <= 7 ? 'text-amber-600' : 'text-[var(--color-text-muted)]')}>
              {m.isOverdue ? `${Math.abs(m.daysUntilDue)}d overdue` : m.daysUntilDue === 0 ? 'Due today' : `${m.daysUntilDue}d left`}
            </p>
            <p className="text-2xs text-[var(--color-text-muted)]">{formatDate(m.dueDate)}</p>
          </div>
          {m.isOverdue && <AlertTriangle size={13} className="text-red-400 shrink-0" />}
        </div>
      ))}
    </div>
  );
};

// ─── AI Insight Cards (stub — Module 9 makes these real) ──────────────────────

interface AIInsight { type: 'warning' | 'info' | 'success'; text: string; action: string }

const generateInsights = (data: NonNullable<ReturnType<typeof useWorkspaceAnalytics>['data']>): AIInsight[] => {
  const insights: AIInsight[] = [];
  const { portfolio, taskStats, upcomingMilestones } = data;

  if (portfolio.criticalProjects > 0) {
    insights.push({ type: 'warning', text: `${portfolio.criticalProjects} project${portfolio.criticalProjects > 1 ? 's are' : ' is'} in critical health. Immediate attention required.`, action: 'View at-risk projects' });
  }
  if (taskStats.blocked > 0) {
    insights.push({ type: 'warning', text: `${taskStats.blocked} task${taskStats.blocked > 1 ? 's are' : ' is'} blocked across your projects. Resolve blockers to maintain velocity.`, action: 'View blocked tasks' });
  }
  if (portfolio.totalPendingCOs > portfolio.totalContractValue * 0.05) {
    insights.push({ type: 'info', text: `Pending change orders exceed 5% of total portfolio value (${formatCurrency(portfolio.totalPendingCOs)}). Consider expediting approvals.`, action: 'Review change orders' });
  }
  if (upcomingMilestones.filter(m => m.isOverdue).length > 0) {
    const count = upcomingMilestones.filter(m => m.isOverdue).length;
    insights.push({ type: 'warning', text: `${count} project milestone${count > 1 ? 's are' : ' is'} overdue. Review project schedules.`, action: 'View milestones' });
  }
  if (portfolio.avgHealthScore >= 85) {
    insights.push({ type: 'success', text: `Portfolio health score of ${portfolio.avgHealthScore}/100 is excellent. Projects are on track and within budget.`, action: 'View portfolio' });
  }
  if (taskStats.overdue === 0 && taskStats.total > 0) {
    insights.push({ type: 'success', text: 'No overdue tasks across the portfolio. Great job keeping everything on schedule!', action: 'View all tasks' });
  }
  if (insights.length === 0) {
    insights.push({ type: 'info', text: 'Add projects and tasks to start seeing AI-powered insights about your portfolio performance.', action: 'Create project' });
  }
  return insights.slice(0, 4);
};

const InsightCard: React.FC<{ insight: AIInsight; index: number }> = ({ insight, index }) => {
  const styles = {
    warning: { bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900', icon: <AlertTriangle size={14} className="text-amber-600 shrink-0" />, text: 'text-amber-700 dark:text-amber-400' },
    info:    { bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900',     icon: <BarChart3 size={14} className="text-blue-600 shrink-0" />,         text: 'text-blue-700 dark:text-blue-400' },
    success: { bg: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900', icon: <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />, text: 'text-emerald-700 dark:text-emerald-400' },
  }[insight.type];

  return (
    <motion.div
      className={cn('p-3.5 rounded-xl border', styles.bg)}
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}>
      <div className="flex items-start gap-2.5">
        {styles.icon}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--color-text)] leading-snug">{insight.text}</p>
          <button className={cn('text-2xs font-semibold mt-1.5 flex items-center gap-0.5 hover:underline', styles.text)}>
            {insight.action} <ChevronRight size={10} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Analytics Page ───────────────────────────────────────────────────────────

const AnalyticsPage: React.FC = () => {
  useTitle('Analytics');
  const navigate = useNavigate();
  const { data, isLoading, refetch, isFetching, dataUpdatedAt } = useWorkspaceAnalytics();

  if (isLoading) return <AnalyticsSkeleton />;
  if (!data) return (
    <div className="p-6 text-center text-[var(--color-text-muted)]">
      No analytics data available. Create projects to get started.
    </div>
  );

  const { portfolio, phaseBreakdown, healthDistribution, budgetByProject, taskTrend, upcomingMilestones, clientPortfolio, taskStats } = data;
  const insights = generateInsights(data);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-12">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)] flex items-center gap-2">
            <BarChart3 size={24} className="text-brand-600" />
            Construction Analytics
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Portfolio intelligence · {dataUpdatedAt ? `Updated ${formatRelative(new Date(dataUpdatedAt))}` : ''}
          </p>
        </div>
        <Button variant="secondary" size="sm" leftIcon={<RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />} onClick={() => refetch()}>
          Refresh
        </Button>
      </motion.div>

      {/* ── TOP KPI CARDS ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        <div className="xl:col-span-2">
          <KPICard label="Total Projects" value={portfolio.totalProjects} icon={<HardHat size={20} />} iconBg="bg-brand-100 text-brand-600" index={0}
            subValue={`${portfolio.activeProjects} active · ${portfolio.onHoldProjects} on hold`} />
        </div>
        <div className="xl:col-span-2">
          <KPICard label="Portfolio Value" value={portfolio.totalContractValue} format="currency" icon={<DollarSign size={20} />} iconBg="bg-teal-100 text-teal-600" index={1}
            subValue={`${formatCurrency(portfolio.totalBilled)} billed`} />
        </div>
        <div className="xl:col-span-2">
          <KPICard label="Avg Health Score" value={`${portfolio.avgHealthScore}/100`} icon={<TrendingUp size={20} />}
            iconBg={portfolio.avgHealthScore >= 80 ? 'bg-emerald-100 text-emerald-600' : portfolio.avgHealthScore >= 60 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}
            index={2} highlight={portfolio.criticalProjects > 0 ? 'warning' : undefined}
            subValue={`${portfolio.atRiskProjects} at risk · ${portfolio.criticalProjects} critical`} />
        </div>
        <div className="xl:col-span-2">
          <KPICard label="Total Tasks" value={taskStats.total} icon={<CheckCircle2 size={20} />} iconBg="bg-indigo-100 text-indigo-600" index={3}
            subValue={`${taskStats.done} done · ${taskStats.overdue} overdue`}
            highlight={taskStats.overdue > 0 ? 'danger' : undefined} />
        </div>
      </div>

      {/* ── SECOND ROW KPIs ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending COs',       value: portfolio.totalPendingCOs,   format: 'currency' as const, icon: <DollarSign size={18} />,   bg: 'bg-amber-100 text-amber-600', highlight: portfolio.totalPendingCOs > 0 ? 'warning' as const : undefined },
          { label: 'Approved COs',      value: portfolio.totalApprovedCOs,  format: 'currency' as const, icon: <CheckCircle2 size={18} />,  bg: 'bg-emerald-100 text-emerald-600' },
          { label: 'Collected to Date', value: portfolio.totalCollected,    format: 'currency' as const, icon: <TrendingUp size={18} />,    bg: 'bg-teal-100 text-teal-600' },
          { label: 'Blocked Tasks',     value: taskStats.blocked,           format: 'number'   as const, icon: <AlertTriangle size={18} />, bg: 'bg-red-100 text-red-600', highlight: taskStats.blocked > 0 ? 'danger' as const : undefined },
        ].map((kpi, i) => (
          <KPICard key={kpi.label} {...kpi} index={i + 4} />
        ))}
      </div>

      {/* ── MAIN CHARTS GRID ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Left: task trend + budget */}
        <div className="xl:col-span-2 space-y-5">
          <TaskTrendChart data={taskTrend} />
          <BudgetChart data={budgetByProject} />
        </div>

        {/* Right: AI insights + health + phases */}
        <div className="space-y-5">
          {/* AI Insights */}
          <motion.div className="bg-white dark:bg-surface-dark-secondary rounded-2xl border border-surface-border dark:border-surface-dark-border shadow-card p-5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-bold">AI</span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)]">Portfolio Insights</h3>
                <p className="text-2xs text-[var(--color-text-muted)]">AI-powered · Module 9 enhances these</p>
              </div>
            </div>
            <div className="space-y-2.5">
              {insights.map((ins, i) => <InsightCard key={i} insight={ins} index={i} />)}
            </div>
          </motion.div>

          <HealthDistributionChart data={healthDistribution} />
          <PhaseDistributionChart data={phaseBreakdown} />
        </div>
      </div>

      {/* ── BOTTOM ROW ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Upcoming Milestones */}
        <motion.div className="xl:col-span-2 bg-white dark:bg-surface-dark-secondary rounded-2xl border border-surface-border dark:border-surface-dark-border shadow-card overflow-hidden"
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
            <div>
              <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-2">
                <Calendar size={15} className="text-brand-600" />
                Upcoming Milestones
              </h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Next 30 days · {upcomingMilestones.length} milestone{upcomingMilestones.length !== 1 ? 's' : ''}</p>
            </div>
            {upcomingMilestones.filter(m => m.isOverdue).length > 0 && (
              <Badge variant="danger" size="sm" dot>{upcomingMilestones.filter(m => m.isOverdue).length} overdue</Badge>
            )}
          </div>
          <MilestonesList milestones={upcomingMilestones} />
        </motion.div>

        {/* Financial Summary */}
        <FinancialSummaryChart
          totalContract={portfolio.totalContractValue}
          totalBilled={portfolio.totalBilled}
          totalCollected={portfolio.totalCollected}
          totalPendingCOs={portfolio.totalPendingCOs}
        />
      </div>

      {/* Client Portfolio */}
      <ClientPortfolioTable data={clientPortfolio} />

    </div>
  );
};

export default AnalyticsPage;
