import React from 'react';

// ─── Brand color palette for charts ──────────────────────────────────────────

export const CHART_COLORS = [
  '#6453f8', // brand
  '#14b8a6', // teal
  '#f97316', // orange
  '#3b82f6', // blue
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#84cc16', // lime
];

export const HEALTH_COLORS = {
  critical: '#EF4444',
  atRisk:   '#F97316',
  fair:     '#F59E0B',
  healthy:  '#10B981',
};

// ─── Currency formatter ───────────────────────────────────────────────────────

export const formatChartCurrency = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
};

export const formatChartNumber = (value: number): string => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000)     return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
};

// ─── Custom tooltip wrapper ───────────────────────────────────────────────────

interface TooltipProps {
  active?:  boolean;
  payload?: Array<{ name: string; value: number; color: string; dataKey: string }>;
  label?:   string;
  formatter?: (value: number, name: string) => string;
}

export const ChartTooltip: React.FC<TooltipProps> = ({ active, payload, label, formatter }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-surface-dark-secondary border border-surface-border dark:border-surface-dark-border rounded-xl shadow-modal px-3.5 py-3 text-xs min-w-[140px]">
      {label && <p className="font-semibold text-[var(--color-text)] mb-2 pb-1.5 border-b border-surface-border dark:border-surface-dark-border">{label}</p>}
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--color-text-secondary)] capitalize">{entry.name}</span>
          </div>
          <span className="font-bold text-[var(--color-text)]">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Chart card wrapper ───────────────────────────────────────────────────────

interface ChartCardProps {
  title:    string;
  subtitle?: string;
  action?:  React.ReactNode;
  children: React.ReactNode;
  className?: string;
  minHeight?: number;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, subtitle, action, children, className = '', minHeight = 280 }) => (
  <div className={`bg-white dark:bg-surface-dark-secondary rounded-2xl border border-surface-border dark:border-surface-dark-border shadow-card p-5 ${className}`}>
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="text-sm font-bold text-[var(--color-text)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
    <div style={{ minHeight }}>{children}</div>
  </div>
);
