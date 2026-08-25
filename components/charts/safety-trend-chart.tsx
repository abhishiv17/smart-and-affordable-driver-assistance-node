'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface TelemetryPoint {
  timestamp: string;
  drowsiness_score: number;
}

export function SafetyTrendChart({ data }: { data: TelemetryPoint[] }) {
  const chartData = data.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    safetyScore: Math.round((1 - point.drowsiness_score) * 100),
  }));

  if (chartData.length === 0) {
    return <p className="text-xs text-muted-foreground">No telemetry data yet.</p>;
  }

  return (
    <div className="w-full h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
          <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 100]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="safetyScore"
            stroke="var(--color-sadan-success)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}