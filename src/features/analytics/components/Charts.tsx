import React from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, LineChart, Line,
} from 'recharts';
import { motion } from 'framer-motion';

import { formatCurrency, formatNumber } from '@/lib/utils';
import { cn }                            from '@/lib/cn';
import type { TaskTrend, PhaseBreakdown, BudgetByProject, HealthDistribution, TeamWorkload, ClientPortfolio } from '../api/analyticsApi';

// ─── Shared Tooltip ───────────────────────────────────────────────────────────

const CustomTooltip: React.FC<{ active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string; format?: string }> = ({
  active, payload, label, format = 'number',
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-xl shadow-modal px-3 py-2.5 min-w-[140px]">
      {label && <p className="text-xs font-semibold text-[var(--color-text)] mb-1.5">{label}</p>}
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-[var(--color-text-muted)]">{p.name}</span>
          </div>
          <span className="font-bold text-[var(--color-text)]">
            {format === 'currency' ? formatCurrency(p.value) : formatNumber(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Task Trend Chart ─────────────────────────────────────────────────────────

interface TaskTrendChartProps { data: TaskTrend[]; className?: string }

export const TaskTrendChart: React.FC<TaskTrendChartProps> = ({ data, className }) => {
  // Show last 14 days only for readability
  const recent = data.slice(-14).map(d => ({
    ...d,
    date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }));

  return (
    <motion.div className={cn('bg-white dark:bg-surface-dark-secondary rounded-2xl p-5 border border-surface-border dark:border-surface-dark-border shadow-card', className)}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--color-text)]">Task Activity</h3>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Last 14 days</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={recent} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6453f8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6453f8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10B981" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--tw-border-opacity, rgba(228,227,255,0.5))" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9491B4' }} axisLine={false} tickLine={false} interval={2} />
          <YAxis tick={{ fontSize: 10, fill: '#9491B4' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="created"   name="Created"   stroke="#6453f8" strokeWidth={2} fill="url(#gradCreated)"   dot={false} />
          <Area type="monotone" dataKey="completed" name="Completed" stroke="#10B981" strokeWidth={2} fill="url(#gradCompleted)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ─── Phase Distribution Chart ─────────────────────────────────────────────────

const PHASE_COLORS: Record<string, string> = {
  pre_bid:          '#9CA3AF', bidding:          '#3B82F6',
  awarded:          '#14B8A6', pre_construction: '#6366F1',
  construction:     '#6453F8', closeout:         '#F59E0B',
  warranty:         '#F97316', completed:        '#10B981',
  cancelled:        '#EF4444', on_hold:          '#EAB308',
};

interface PhaseChartProps { data: PhaseBreakdown[]; className?: string }

export const PhaseDistributionChart: React.FC<PhaseChartProps> = ({ data, className }) => {
  const formatted = data.map(d => ({
    name:  d.phase.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase()),
    value: d.count,
    color: PHASE_COLORS[d.phase] ?? '#9CA3AF',
  }));

  const RADIAN = Math.PI / 180;
  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: Record<string,number>) => {
    if (percent < 0.08) return null;
    const r = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + r * Math.cos(-midAngle * RADIAN);
    const y = cy + r * Math.sin(-midAngle * RADIAN);
    return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>{`${(percent * 100).toFixed(0)}%`}</text>;
  };

  return (
    <motion.div className={cn('bg-white dark:bg-surface-dark-secondary rounded-2xl p-5 border border-surface-border dark:border-surface-dark-border shadow-card', className)}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[var(--color-text)]">Projects by Phase</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{data.reduce((s,d) => s + d.count, 0)} total projects</p>
      </div>
      <div className="flex items-center gap-4">
        <ResponsiveContainer width="50%" height={180}>
          <PieChart>
            <Pie data={formatted} cx="50%" cy="50%" outerRadius={75} dataKey="value" labelLine={false} label={renderLabel}>
              {formatted.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip formatter={(v) => [`${v} projects`]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex-1 space-y-2">
          {formatted.map((item) => (
            <div key={item.name} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-xs text-[var(--color-text-muted)] truncate">{item.name}</span>
              </div>
              <span className="text-xs font-bold text-[var(--color-text)] shrink-0">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Budget vs Billed Chart ───────────────────────────────────────────────────

interface BudgetChartProps { data: BudgetByProject[]; className?: string }

export const BudgetChart: React.FC<BudgetChartProps> = ({ data, className }) => {
  const formatted = data.slice(0, 8).map(p => ({
    name:     p.name.length > 18 ? p.name.slice(0, 16) + '…' : p.name,
    contract: Math.round(p.contractValue / 1000),
    billed:   Math.round(p.billed / 1000),
    collected:Math.round(p.collected / 1000),
  }));

  return (
    <motion.div className={cn('bg-white dark:bg-surface-dark-secondary rounded-2xl p-5 border border-surface-border dark:border-surface-dark-border shadow-card', className)}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[var(--color-text)]">Budget Overview</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Top projects · values in $000s</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(228,227,255,0.4)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#9491B4' }} angle={-35} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 10, fill: '#9491B4' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}k`} />
          <Tooltip content={<CustomTooltip format="number" />} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 11 }} />
          <Bar dataKey="contract"  name="Contract"  fill="#6453f8" radius={[3,3,0,0]} />
          <Bar dataKey="billed"    name="Billed"    fill="#14B8A6" radius={[3,3,0,0]} />
          <Bar dataKey="collected" name="Collected" fill="#10B981" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

// ─── Health Distribution Chart ────────────────────────────────────────────────

interface HealthChartProps { data: HealthDistribution; className?: string }

export const HealthDistributionChart: React.FC<HealthChartProps> = ({ data, className }) => {
  const pieData = [
    { name: 'Healthy',  value: data.healthy,  color: '#10B981' },
    { name: 'At Risk',  value: data.atRisk,   color: '#F59E0B' },
    { name: 'Critical', value: data.critical, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const total = data.healthy + data.atRisk + data.critical;

  return (
    <motion.div className={cn('bg-white dark:bg-surface-dark-secondary rounded-2xl p-5 border border-surface-border dark:border-surface-dark-border shadow-card', className)}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="mb-4">
        <h3 className="text-sm font-bold text-[var(--color-text)]">Portfolio Health</h3>
        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{total} active projects</p>
      </div>
      {total === 0 ? (
        <div className="flex items-center justify-center h-40 text-[var(--color-text-muted)] text-sm">No active projects</div>
      ) : (
        <div className="flex items-center gap-5">
          <ResponsiveContainer width="55%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v) => [`${v} projects`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-3">
            {[
              { label: 'Healthy',  count: data.healthy,  color: '#10B981', bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-400' },
              { label: 'At Risk',  count: data.atRisk,   color: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-950/30',   text: 'text-amber-700 dark:text-amber-400' },
              { label: 'Critical', count: data.critical, color: '#EF4444', bg: 'bg-red-50 dark:bg-red-950/30',       text: 'text-red-700 dark:text-red-400' },
            ].map(({ label, count, color, bg, text }) => (
              <div key={label} className={cn('flex items-center justify-between rounded-lg px-3 py-2', bg)}>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                  <span className={cn('text-xs font-semibold', text)}>{label}</span>
                </div>
                <div className="text-right">
                  <span className={cn('text-sm font-bold', text)}>{count}</span>
                  <span className="text-2xs text-[var(--color-text-muted)] ml-1">({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ─── Financial Summary Chart ──────────────────────────────────────────────────

interface FinancialSummaryProps {
  totalContract: number; totalBilled: number; totalCollected: number; totalPendingCOs: number;
  className?: string;
}

export const FinancialSummaryChart: React.FC<FinancialSummaryProps> = ({
  totalContract, totalBilled, totalCollected, totalPendingCOs, className,
}) => {
  const data = [
    { name: 'Contract',   value: totalContract,  fill: '#6453f8' },
    { name: 'Billed',     value: totalBilled,    fill: '#14B8A6' },
    { name: 'Collected',  value: totalCollected, fill: '#10B981' },
    { name: 'Pending COs',value: totalPendingCOs,fill: '#F59E0B' },
  ];

  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <motion.div className={cn('bg-white dark:bg-surface-dark-secondary rounded-2xl p-5 border border-surface-border dark:border-surface-dark-border shadow-card', className)}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-4">Financial Summary</h3>
      <div className="space-y-3">
        {data.map(({ name, value, fill }) => (
          <div key={name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: fill }} />
                <span className="text-xs text-[var(--color-text-muted)]">{name}</span>
              </div>
              <span className="text-sm font-bold text-[var(--color-text)]">{formatCurrency(value)}</span>
            </div>
            <div className="h-1.5 bg-surface-secondary dark:bg-surface-dark-tertiary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: fill }}
                initial={{ width: 0 }}
                animate={{ width: `${(value / maxVal) * 100}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Client Portfolio Table ───────────────────────────────────────────────────

interface ClientPortfolioTableProps { data: ClientPortfolio[]; className?: string }

export const ClientPortfolioTable: React.FC<ClientPortfolioTableProps> = ({ data, className }) => (
  <motion.div className={cn('bg-white dark:bg-surface-dark-secondary rounded-2xl border border-surface-border dark:border-surface-dark-border shadow-card overflow-hidden', className)}
    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
    <div className="px-5 py-4 border-b border-surface-border dark:border-surface-dark-border">
      <h3 className="text-sm font-bold text-[var(--color-text)]">Top Clients by Portfolio Value</h3>
    </div>
    <div className="divide-y divide-surface-border dark:divide-surface-dark-border">
      {data.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No client data yet</p>
      ) : (
        data.map((c, i) => (
          <div key={c.clientId} className="flex items-center gap-3 px-5 py-3 hover:bg-surface-secondary/50 dark:hover:bg-surface-dark-tertiary/30 transition-colors">
            <span className="text-xs font-bold text-[var(--color-text-muted)] w-5 shrink-0">{i + 1}</span>
            <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950/40 flex items-center justify-center text-brand-600 font-bold text-sm shrink-0">
              {c.name[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--color-text)] truncate">{c.name}</p>
              <p className="text-2xs text-[var(--color-text-muted)] capitalize">{c.type.replace('_',' ')} · {c.projects} project{c.projects !== 1 ? 's' : ''}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-bold text-[var(--color-text)]">{formatCurrency(c.totalValue)}</p>
              <p className={cn('text-2xs font-semibold', c.avgHealth >= 80 ? 'text-emerald-600' : c.avgHealth >= 60 ? 'text-amber-600' : 'text-red-500')}>
                {c.avgHealth} health
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  </motion.div>
);
