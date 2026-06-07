import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';

import { ChartCard, ChartTooltip } from './ChartUtils';
import { Skeleton } from '@/components/ui/Spinner';
import type { VelocityPoint } from '../api/analyticsApi';

interface TaskVelocityChartProps {
  data?: VelocityPoint[];
  isLoading?: boolean;
}

export const TaskVelocityChart: React.FC<TaskVelocityChartProps> = ({ data, isLoading }) => {
  if (isLoading) return <ChartCard title="Task Velocity"><Skeleton height={260} /></ChartCard>;

  const chartData = (data ?? []).map(d => ({
    ...d,
    label: format(parseISO(d.date), 'MMM d'),
  }));

  const total    = chartData.reduce((s, d) => s + d.completed, 0);
  const avgDaily = chartData.length ? (total / chartData.length).toFixed(1) : '0';

  return (
    <ChartCard
      title="Task Velocity"
      subtitle={`Last ${chartData.length} days · avg ${avgDaily} completed/day`}
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradCreated" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6453f8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#6453f8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border, #e4e3ff)" strokeOpacity={0.5} vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--color-text-muted, #9491b4)' }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fontSize: 10, fill: 'var(--color-text-muted, #9491b4)' }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Area
            type="monotone" dataKey="created" name="Created"
            stroke="#6453f8" strokeWidth={2}
            fill="url(#gradCreated)" dot={false}
          />
          <Area
            type="monotone" dataKey="completed" name="Completed"
            stroke="#10B981" strokeWidth={2.5}
            fill="url(#gradCompleted)" dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
