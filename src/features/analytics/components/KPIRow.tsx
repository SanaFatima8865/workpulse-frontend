import React from 'react';
import { motion } from 'framer-motion';
import {
  HardHat, DollarSign, CheckSquare, Users, AlertTriangle,
  TrendingUp, Building2, Clock,
} from 'lucide-react';

import { formatCurrency } from '@/lib/utils';
import { cn }             from '@/lib/cn';
import type { WorkspaceSummary } from '../api/analyticsApi';

interface KPICardProps {
  label:     string;
  value:     string | number;
  sub?:      string;
  icon:      React.ReactNode;
  iconBg:    string;
  trend?:    { value: number; label: string };
  highlight?: boolean;
  index:     number;
}

const KPICard: React.FC<KPICardProps> = ({ label, value, sub, icon, iconBg, trend, highlight, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.3 }}
    className={cn(
      'bg-white dark:bg-surface-dark-secondary rounded-2xl border shadow-card p-5',
      highlight
        ? 'border-brand-200 dark:border-brand-800'
        : 'border-surface-border dark:border-surface-dark-border'
    )}
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">{label}</p>
        <p className="text-2xl font-display font-bold text-[var(--color-text)] leading-none">{value}</p>
        {sub && <p className="text-xs text-[var(--color-text-muted)] mt-1">{sub}</p>}
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium mt-2',
            trend.value >= 0 ? 'text-emerald-600' : 'text-red-500'
          )}>
            <TrendingUp size={11} />
            <span>{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}</span>
          </div>
        )}
      </div>
      <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
        {icon}
      </div>
    </div>
  </motion.div>
);

interface KPIRowProps {
  summary: WorkspaceSummary;
}

export const KPIRow: React.FC<KPIRowProps> = ({ summary }) => {
  const billingRate = summary.totalContractValue > 0
    ? ((summary.billedToDate / summary.totalContractValue) * 100).toFixed(1)
    : '0';

  const cards: KPICardProps[] = [
    {
      label:   'Active Projects',
      value:   summary.activeProjects,
      sub:     `${summary.totalProjects} total · ${summary.completedProjects} completed`,
      icon:    <HardHat size={20} className="text-brand-600" />,
      iconBg:  'bg-brand-100 dark:bg-brand-950/40',
      index:   0,
    },
    {
      label:   'Contract Portfolio',
      value:   formatCurrency(summary.totalContractValue),
      sub:     `${billingRate}% billed · ${formatCurrency(summary.billedToDate)} invoiced`,
      icon:    <DollarSign size={20} className="text-teal-600" />,
      iconBg:  'bg-teal-100 dark:bg-teal-950/40',
      index:   1,
    },
    {
      label:   'Tasks Completed',
      value:   summary.completedTasks,
      sub:     `${summary.totalTasks} total · ${summary.overdueTasks} overdue`,
      icon:    <CheckSquare size={20} className="text-emerald-600" />,
      iconBg:  'bg-emerald-100 dark:bg-emerald-950/40',
      highlight: summary.overdueTasks > 0,
      index:   2,
    },
    {
      label:   'Avg Health Score',
      value:   `${summary.avgHealthScore}/100`,
      sub:     `${summary.atRiskProjects} project${summary.atRiskProjects !== 1 ? 's' : ''} at risk`,
      icon:    summary.atRiskProjects > 0
        ? <AlertTriangle size={20} className="text-amber-600" />
        : <TrendingUp size={20} className="text-emerald-600" />,
      iconBg:  summary.atRiskProjects > 0
        ? 'bg-amber-100 dark:bg-amber-950/40'
        : 'bg-emerald-100 dark:bg-emerald-950/40',
      index:   3,
    },
    {
      label:   'Active Clients',
      value:   summary.activeClients,
      sub:     `${summary.totalClients} total in CRM`,
      icon:    <Building2 size={20} className="text-indigo-600" />,
      iconBg:  'bg-indigo-100 dark:bg-indigo-950/40',
      index:   4,
    },
    {
      label:   'Overdue Tasks',
      value:   summary.overdueTasks,
      sub:     summary.overdueTasks === 0 ? 'All tasks on track 🎉' : 'Needs immediate attention',
      icon:    <Clock size={20} className={summary.overdueTasks > 0 ? 'text-red-600' : 'text-emerald-600'} />,
      iconBg:  summary.overdueTasks > 0 ? 'bg-red-100 dark:bg-red-950/40' : 'bg-emerald-100 dark:bg-emerald-950/40',
      highlight: summary.overdueTasks > 0,
      index:   5,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => <KPICard key={card.label} {...card} />)}
    </div>
  );
};
