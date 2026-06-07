import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip,
} from 'recharts';

import { ChartCard, ChartTooltip, CHART_COLORS, formatChartCurrency } from './ChartUtils';
import { Skeleton } from '@/components/ui/Spinner';
import type { PipelineStage } from '../api/analyticsApi';

const PHASE_LABELS: Record<string, string> = {
  pre_bid:          'Pre-Bid',
  bidding:          'Bidding',
  awarded:          'Awarded',
  pre_construction: 'Pre-Con',
  construction:     'Active',
  closeout:         'Closeout',
  warranty:         'Warranty',
  completed:        'Completed',
  on_hold:          'On Hold',
  cancelled:        'Cancelled',
};

interface ProjectPipelineChartProps {
  data?: PipelineStage[];
  isLoading?: boolean;
}

export const ProjectPipelineChart: React.FC<ProjectPipelineChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <ChartCard title="Project Pipeline"><Skeleton height={280} /></ChartCard>;

  const chartData = (data ?? []).map((d, i) => ({
    phase:      PHASE_LABELS[d._id] ?? d._id,
    count:      d.count,
    totalValue: d.totalValue,
    avgHealth:  Math.round(d.avgHealth ?? 0),
    fill:       CHART_COLORS[i % CHART_COLORS.length],
  }));

  return (
    <ChartCard
      title="Project Pipeline"
      subtitle="Projects by construction phase"
    >
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-sm text-[var(--color-text-muted)]">
          No projects yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--color-border, #e4e3ff)" strokeOpacity={0.5} />
            <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9491b4)' }} axisLine={false} tickLine={false} />
            <YAxis
              type="category" dataKey="phase" width={80}
              tick={{ fontSize: 11, fill: 'var(--color-text-muted, #9491b4)' }}
              axisLine={false} tickLine={false}
            />
            <Tooltip
              content={<ChartTooltip formatter={(v, name) => name === 'totalValue' ? formatChartCurrency(v) : String(v)} />}
            />
            <Bar dataKey="count" name="Projects" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
};
