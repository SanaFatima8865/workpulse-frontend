import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HardHat, DollarSign, TrendingUp, CheckCircle2,
  ArrowRight, AlertTriangle, Calendar, Users,
  BarChart3, Zap, ChevronRight,
} from 'lucide-react';

import { useTitle }         from '@/hooks';
import { useAppSelector }   from '@/store';
import { selectCurrentUser } from '@/store/authSlice';
import { Card, CardHeader } from '@/components/ui/Card';
import { Badge }            from '@/components/ui/Badge';
import { Button }           from '@/components/ui/Button';
import { Progress }         from '@/components/ui/Progress';
import { Skeleton }         from '@/components/ui/Spinner';
import { cn }               from '@/lib/cn';
import { formatCurrency, formatDate, formatRelative } from '@/lib/utils';
import { useWorkspaceAnalytics, KPICard, HealthRing, TaskTrendChart } from '@/features/analytics';
import { useProjects }      from '@/features/projects';
import { useMyTasks }       from '@/features/boards';
import { PRIORITY_CONFIG }  from '@/features/boards/components/TaskCard';
import { PhaseBadge }       from '@/features/projects/components/ProjectCard';

// ─── Container animation ──────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
const fadeUp  = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard: React.FC = () => {
  useTitle('Dashboard');
  const navigate  = useNavigate();
  const user      = useAppSelector(selectCurrentUser);

  const { data: analytics, isLoading: analyticsLoading } = useWorkspaceAnalytics();
  const { data: projects  = [], isLoading: projectsLoading } = useProjects();
  const { data: myTasks   = [] } = useMyTasks();

  const greeting = React.useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }, []);

  const activeProjects = projects.filter(p => ['construction','pre_construction','closeout'].includes(p.phase));
  const overdueMyTasks = myTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done');
  const portfolio      = analytics?.portfolio;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 pb-10">
      {/* ── Greeting ─────────────────────────────────────────────────────── */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        variants={stagger} initial="hidden" animate="visible">
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">
            {greeting}, <span className="text-brand-600">{user?.firstName ?? 'there'}</span> 👋
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center gap-2">
          {overdueMyTasks.length > 0 && (
            <button onClick={() => navigate('/my-tasks')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-xs font-semibold border border-red-200 dark:border-red-900 hover:bg-red-200 transition-colors">
              <AlertTriangle size={12} />
              {overdueMyTasks.length} overdue task{overdueMyTasks.length > 1 ? 's' : ''}
            </button>
          )}
          <Button variant="secondary" size="sm" rightIcon={<BarChart3 size={14} />} onClick={() => navigate('/analytics')}>
            Full Analytics
          </Button>
        </motion.div>
      </motion.div>

      {/* ── KPI Row ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsLoading ? (
          [1,2,3,4].map(i => <Skeleton key={i} height={110} className="rounded-2xl" />)
        ) : portfolio ? (
          <>
            <KPICard label="Active Projects"   value={portfolio.activeProjects}    icon={<HardHat size={18} />}     iconBg="bg-brand-100 text-brand-600"   index={0} onClick={() => navigate('/projects')} />
            <KPICard label="Portfolio Value"   value={portfolio.totalContractValue} format="currency" icon={<DollarSign size={18} />}   iconBg="bg-teal-100 text-teal-600"   index={1} onClick={() => navigate('/analytics')} />
            <KPICard label="Avg Health Score"  value={`${portfolio.avgHealthScore}/100`} icon={<TrendingUp size={18} />}  iconBg={portfolio.avgHealthScore >= 80 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'} index={2} highlight={portfolio.criticalProjects > 0 ? 'warning' : undefined} />
            <KPICard label="My Open Tasks"     value={myTasks.filter(t => t.status !== 'done').length} icon={<CheckCircle2 size={18} />} iconBg="bg-indigo-100 text-indigo-600" index={3} onClick={() => navigate('/my-tasks')} highlight={overdueMyTasks.length > 0 ? 'danger' : undefined} />
          </>
        ) : null}
      </div>

      {/* ── Main 2-col grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* LEFT: 2/3 width */}
        <div className="xl:col-span-2 space-y-5">

          {/* Task trend mini-chart */}
          {analytics?.taskTrend && <TaskTrendChart data={analytics.taskTrend} />}

          {/* Active Projects */}
          <Card padding="none">
            <div className="px-5 py-4 border-b border-surface-border dark:border-surface-dark-border flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[var(--color-text)]">Active Projects</h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''} on site</p>
              </div>
              <Button variant="ghost" size="sm" rightIcon={<ArrowRight size={14} />} onClick={() => navigate('/projects')}>
                View all
              </Button>
            </div>

            {projectsLoading ? (
              <div className="p-5 space-y-3">{[1,2,3].map(i => <Skeleton key={i} height={72} />)}</div>
            ) : activeProjects.length === 0 ? (
              <div className="p-8 text-center">
                <HardHat size={28} className="text-[var(--color-text-muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--color-text-muted)]">No active construction projects</p>
                <Button variant="primary" size="sm" className="mt-3" onClick={() => navigate('/projects')}>Create Project</Button>
              </div>
            ) : (
              <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
                {activeProjects.slice(0, 5).map((project) => (
                  <div key={project._id} onClick={() => navigate(`/projects/${project._id}`)}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-secondary/50 dark:hover:bg-surface-dark-tertiary/30 transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                      style={{ backgroundColor: project.coverColor }}>
                      {project.jobNumber.slice(-3)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{project.name}</p>
                        <PhaseBadge phase={project.phase} />
                      </div>
                      <Progress value={project.completionPercent} size="xs" color="auto" />
                    </div>
                    <div className="text-right shrink-0">
                      <p className={cn('text-sm font-bold', project.healthScore >= 80 ? 'text-emerald-600' : project.healthScore >= 60 ? 'text-amber-600' : 'text-red-500')}>
                        {project.healthScore}
                      </p>
                      <p className="text-2xs text-[var(--color-text-muted)]">health</p>
                    </div>
                    <ChevronRight size={14} className="text-[var(--color-text-muted)]" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: 1/3 width */}
        <div className="space-y-5">

          {/* AI Insights */}
          <motion.div className="bg-white dark:bg-surface-dark-secondary rounded-2xl border border-surface-border dark:border-surface-dark-border shadow-card p-5"
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-gradient-brand rounded-lg flex items-center justify-center shrink-0">
                <Zap size={14} className="text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[var(--color-text)]">AI Insights</h3>
                <p className="text-2xs text-[var(--color-text-muted)]">Powered by WorkPulse AI</p>
              </div>
            </div>
            {analytics ? (
              <div className="space-y-2.5">
                {portfolio && portfolio.criticalProjects > 0 && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                    <div className="flex items-start gap-2"><AlertTriangle size={13} className="text-red-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--color-text)]">{portfolio.criticalProjects} project{portfolio.criticalProjects > 1 ? 's are' : ' is'} in critical health — act now</p>
                    </div>
                  </div>
                )}
                {portfolio && portfolio.totalPendingCOs > 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                    <div className="flex items-start gap-2"><DollarSign size={13} className="text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--color-text)]">{formatCurrency(portfolio.totalPendingCOs)} in pending change orders awaiting approval</p>
                    </div>
                  </div>
                )}
                {analytics.taskStats.blocked > 0 && (
                  <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900">
                    <div className="flex items-start gap-2"><AlertTriangle size={13} className="text-orange-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--color-text)]">{analytics.taskStats.blocked} task{analytics.taskStats.blocked > 1 ? 's' : ''} blocked — resolve to maintain velocity</p>
                    </div>
                  </div>
                )}
                {portfolio && portfolio.avgHealthScore >= 85 && (
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900">
                    <div className="flex items-start gap-2"><CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--color-text)]">Portfolio health {portfolio.avgHealthScore}/100 — projects are on track!</p>
                    </div>
                  </div>
                )}
                {portfolio && portfolio.criticalProjects === 0 && portfolio.totalPendingCOs === 0 && analytics.taskStats.blocked === 0 && portfolio.avgHealthScore < 85 && (
                  <div className="p-3 rounded-xl bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900">
                    <div className="flex items-start gap-2"><Zap size={13} className="text-brand-600 mt-0.5 shrink-0" />
                      <p className="text-xs text-[var(--color-text)]">Portfolio looks good! Add more projects and tasks for deeper AI insights.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">{[1,2,3].map(i => <Skeleton key={i} height={52} className="rounded-xl" />)}</div>
            )}
          </motion.div>

          {/* My Tasks */}
          <Card padding="none">
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border dark:border-surface-dark-border">
              <h3 className="text-sm font-bold text-[var(--color-text)]">My Tasks</h3>
              <Button variant="ghost" size="xs" rightIcon={<ArrowRight size={12} />} onClick={() => navigate('/my-tasks')}>All</Button>
            </div>
            <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
              {myTasks.length === 0 ? (
                <p className="text-xs text-[var(--color-text-muted)] text-center py-5">No tasks assigned to you</p>
              ) : myTasks.slice(0, 5).map(task => {
                const p = PRIORITY_CONFIG[task.priority];
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
                return (
                  <div key={task._id} className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-surface-secondary/50 cursor-pointer transition-colors">
                    <span className="text-sm shrink-0">{p.icon}</span>
                    <p className={cn('text-xs font-medium text-[var(--color-text)] flex-1 min-w-0 truncate', task.status === 'done' && 'line-through text-[var(--color-text-muted)]')}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <span className={cn('text-2xs shrink-0 font-medium', isOverdue ? 'text-red-500' : 'text-[var(--color-text-muted)]')}>
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Milestones */}
          {analytics?.upcomingMilestones && analytics.upcomingMilestones.length > 0 && (
            <Card padding="none">
              <div className="flex items-center justify-between px-4 py-3 border-b border-surface-border dark:border-surface-dark-border">
                <h3 className="text-sm font-bold text-[var(--color-text)] flex items-center gap-1.5">
                  <Calendar size={14} className="text-brand-600" />Milestones
                </h3>
              </div>
              <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
                {analytics.upcomingMilestones.slice(0, 4).map(m => (
                  <div key={m.milestoneId} onClick={() => navigate(`/projects/${m.projectId}`)}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-secondary/50 cursor-pointer transition-colors">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-white text-2xs font-bold shrink-0"
                      style={{ backgroundColor: m.coverColor }}>
                      {m.jobNumber.slice(-2)}
                    </div>
                    <p className="text-xs text-[var(--color-text)] flex-1 truncate">{m.name}</p>
                    <span className={cn('text-2xs font-semibold shrink-0', m.isOverdue ? 'text-red-500' : m.daysUntilDue <= 7 ? 'text-amber-600' : 'text-[var(--color-text-muted)]')}>
                      {m.isOverdue ? 'Overdue' : `${m.daysUntilDue}d`}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
