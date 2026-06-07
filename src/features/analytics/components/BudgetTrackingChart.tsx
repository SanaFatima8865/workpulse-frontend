import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend, Cell,
} from 'recharts';

import { ChartCard, ChartTooltip, formatChartCurrency } from './ChartUtils';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Spinner';
import { cn }       from '@/lib/cn';
import type { BudgetOverview } from '../api/analyticsApi';

const PHASE_SHORT: Record<string, string> = {
  pre_bid: 'Pre-Bid', bidding: 'Bid', awarded: 'Award',
  pre_construction: 'Pre-Con', construction: 'Active',
  closeout: 'Close', warranty: 'WR', completed: 'Done',
};

interface BudgetTrackingChartProps {
  data?: BudgetOverview;
  isLoading?: boolean;
}

export const BudgetTrackingChart: React.FC<BudgetTrackingChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <ChartCard title="Budget Overview"><Skeleton height={320} /></ChartCard>;

  const topProjects = (data?.topProjects ?? []).slice(0, 6);

  return (
    <ChartCard title="Budget Overview" subtitle="Top projects by contract value">
      {topProjects.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-sm text-[var(--color-text-muted)]">
          No budget data yet — add contract values to projects
        </div>
      ) : (
        <div className="space-y-3">
          {topProjects.map((proj) => (
            <div key={proj._id} className="group">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: proj.coverColor }} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--color-text)] truncate leading-none">{proj.name}</p>
                    <p className="text-2xs text-[var(--color-text-muted)] mt-0.5">
                      {proj.jobNumber} · {PHASE_SHORT[proj.phase] ?? proj.phase}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-[var(--color-text)]">{formatChartCurrency(proj.contractValue)}</p>
                  <p className="text-2xs text-[var(--color-text-muted)]">{proj.billedPct}% billed</p>
                </div>
              </div>
              <Progress
                value={proj.billedPct}
                size="xs"
                color={proj.billedPct >= 80 ? 'success' : proj.billedPct >= 50 ? 'brand' : 'warning'}
              />
            </div>
          ))}
        </div>
      )}
    </ChartCard>
  );
};
