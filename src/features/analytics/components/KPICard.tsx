import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatCurrency, formatNumber } from '@/lib/utils';

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  label:       string;
  value:       string | number;
  subValue?:   string;
  icon:        React.ReactNode;
  iconBg:      string;
  trend?:      number;          // percent change
  trendLabel?: string;
  format?:     'number' | 'currency' | 'percent' | 'raw';
  highlight?:  'success' | 'warning' | 'danger' | 'brand';
  index?:      number;
  onClick?:    () => void;
}

const HIGHLIGHT_STYLES = {
  success: 'ring-1 ring-emerald-200 dark:ring-emerald-900',
  warning: 'ring-1 ring-amber-200 dark:ring-amber-900',
  danger:  'ring-1 ring-red-200 dark:ring-red-900',
  brand:   'ring-1 ring-brand-200 dark:ring-brand-900',
};

export const KPICard: React.FC<KPICardProps> = ({
  label, value, subValue, icon, iconBg, trend, trendLabel,
  format = 'raw', highlight, index = 0, onClick,
}) => {
  const formatValue = (v: string | number) => {
    if (typeof v === 'string') return v;
    switch (format) {
      case 'currency': return formatCurrency(v);
      case 'number':   return formatNumber(v);
      case 'percent':  return `${v}%`;
      default:         return String(v);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn(
        'bg-white dark:bg-surface-dark-secondary rounded-2xl p-5',
        'border border-surface-border dark:border-surface-dark-border shadow-card',
        highlight && HIGHLIGHT_STYLES[highlight],
        onClick && 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200'
      )}
      onClick={onClick}
      whileHover={onClick ? { scale: 1.01 } : {}}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
            {label}
          </p>
          <p className="text-2xl font-bold text-[var(--color-text)] leading-none">
            {formatValue(value)}
          </p>
          {subValue && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1">{subValue}</p>
          )}
          {trend !== undefined && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-xs font-medium',
              trend > 0  ? 'text-emerald-600' :
              trend < 0  ? 'text-red-500' : 'text-[var(--color-text-muted)]'
            )}>
              {trend > 0  ? <TrendingUp size={12} /> :
               trend < 0  ? <TrendingDown size={12} /> :
                             <Minus size={12} />}
              <span>{Math.abs(trend)}%</span>
              {trendLabel && <span className="text-[var(--color-text-muted)] font-normal">{trendLabel}</span>}
            </div>
          )}
        </div>
        <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center shrink-0', iconBg)}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

// ─── Health Score Ring ────────────────────────────────────────────────────────

interface HealthRingProps {
  score:    number;
  size?:    number;
  label?:   string;
}

export const HealthRing: React.FC<HealthRingProps> = ({ score, size = 80, label }) => {
  const radius      = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset      = circumference - (score / 100) * circumference;
  const color       = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';
  const textColor   = score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-500';
  const status      = score >= 80 ? 'Healthy' : score >= 60 ? 'At Risk' : 'Critical';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor"
            className="text-surface-border dark:text-surface-dark-border" strokeWidth={6} />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
            strokeWidth={6} strokeDasharray={circumference} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn('text-lg font-bold leading-none', textColor)}>{score}</span>
        </div>
      </div>
      {label && <span className="text-xs text-[var(--color-text-muted)]">{label}</span>}
      <span className={cn('text-2xs font-semibold', textColor)}>{status}</span>
    </div>
  );
};
