import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Cell,
} from 'recharts';

import { ChartCard, ChartTooltip } from './ChartUtils';
import { Avatar }   from '@/components/ui/Avatar';
import { Badge }    from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Spinner';
import { cn }       from '@/lib/cn';
import type { WorkloadEntry } from '../api/analyticsApi';

interface TeamWorkloadChartProps {
  data?: WorkloadEntry[];
  isLoading?: boolean;
}

export const TeamWorkloadChart: React.FC<TeamWorkloadChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <ChartCard title="Team Workload"><Skeleton height={300} /></ChartCard>;

  const members = (data ?? []).slice(0, 8);
  if (members.length === 0) {
    return (
      <ChartCard title="Team Workload" subtitle="Tasks per team member">
        <div className="flex items-center justify-center h-48 text-sm text-[var(--color-text-muted)]">
          Assign tasks to team members to see workload
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Team Workload" subtitle="Open tasks per member">
      <div className="space-y-2.5">
        {members.map((m, i) => {
          const maxTasks = Math.max(...members.map(x => x.totalTasks), 1);
          const pct      = (m.totalTasks / maxTasks) * 100;
          const isHeavy  = m.totalTasks > 10 || m.overdueTasks > 2;

          return (
            <div key={m.userId} className="flex items-center gap-3">
              <Avatar name={`${m.firstName} ${m.lastName}`} src={m.avatar} size="xs" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-xs font-semibold text-[var(--color-text)] truncate leading-none">
                    {m.firstName} {m.lastName}
                  </p>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {m.overdueTasks > 0 && (
                      <span className="text-2xs font-bold text-red-500">{m.overdueTasks} overdue</span>
                    )}
                    <span className="text-xs font-bold text-[var(--color-text)]">{m.totalTasks}</span>
                  </div>
                </div>
                <div className="h-2 bg-surface-secondary dark:bg-surface-dark-tertiary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      isHeavy ? 'bg-amber-500' : 'bg-brand-500'
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ChartCard>
  );
};
