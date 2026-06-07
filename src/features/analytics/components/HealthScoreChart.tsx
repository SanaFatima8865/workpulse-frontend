import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

import { ChartCard, ChartTooltip } from './ChartUtils';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Spinner';
import { cn }       from '@/lib/cn';
import type { HealthBreakdown } from '../api/analyticsApi';

interface HealthScoreChartProps {
  data?: HealthBreakdown;
  isLoading?: boolean;
}

export const HealthScoreChart: React.FC<HealthScoreChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <ChartCard title="Project Health"><Skeleton height={300} /></ChartCard>;

  const dist = (data?.distribution ?? []).filter(d => d.count > 0);
  const projects = data?.projects ?? [];

  if (projects.length === 0) {
    return (
      <ChartCard title="Project Health" subtitle="Active project health scores">
        <div className="flex items-center justify-center h-48 text-sm text-[var(--color-text-muted)]">
          No active projects with health scores yet
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Project Health" subtitle="Active construction projects">
      <div className="grid grid-cols-1 gap-4">
        {/* Pie chart */}
        {dist.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dist}
                  dataKey="count"
                  nameKey="range"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={3}
                >
                  {dist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Project list */}
        <div className="space-y-2">
          {projects.slice(0, 6).map((p) => (
            <div key={p._id} className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.coverColor }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-xs font-medium text-[var(--color-text)] truncate">{p.name}</p>
                  <span className={cn(
                    'text-xs font-bold shrink-0 ml-2',
                    p.healthScore >= 80 ? 'text-emerald-600' :
                    p.healthScore >= 60 ? 'text-amber-500' : 'text-red-500'
                  )}>
                    {p.healthScore}
                  </span>
                </div>
                <Progress value={p.healthScore} size="xs" color="auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartCard>
  );
};
