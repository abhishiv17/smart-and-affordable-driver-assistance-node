'use client';

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { DbAlert } from '@/types/database';

const TYPE_LABELS: Record<string, string> = {
  DROWSINESS: 'Drowsiness',
  HARSH_BRAKING: 'Harsh Braking',
  HARSH_ACCELERATION: 'Harsh Accel.',
  DEVICE_OFFLINE: 'Device Offline',
  DEVICE_RECOVERED: 'Recovered',
};

export function AlertBreakdownChart({ alerts }: { alerts: DbAlert[] }) {
  const counts: Record<string, number> = {};
  for (const alert of alerts) {
    counts[alert.type] = (counts[alert.type] ?? 0) + 1;
  }

  const chartData = Object.entries(counts).map(([type, count]) => ({
    type: TYPE_LABELS[type] ?? type,
    count,
  }));

  if (chartData.length === 0) {
    return <p className="text-xs text-muted-foreground">No alerts recorded yet.</p>;
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis dataKey="type" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', fontSize: 12 }}
          />
          <Bar dataKey="count" fill="var(--color-sadan-warning)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}