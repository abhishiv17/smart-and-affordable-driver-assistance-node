'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FleetMap } from '@/components/dashboard/fleet-map';
import type { DbTelemetry } from '@/types/database';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { formatRelativeTime } from '@/lib/utils/formatters';

interface IncidentReplayProps {
  telemetryWindow: DbTelemetry[];
  incidentTime: string;
}

export function IncidentReplay({ telemetryWindow, incidentTime }: IncidentReplayProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Process data for charts
  const chartData = useMemo(() => {
    const incidentMs = new Date(incidentTime).getTime();
    
    return telemetryWindow
      .slice()
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((t) => {
        const timeMs = new Date(t.timestamp).getTime();
        const diffSec = (timeMs - incidentMs) / 1000;
        return {
          ...t,
          timeLabel: diffSec === 0 ? 'T-0' : diffSec > 0 ? `T+${diffSec}s` : `T${diffSec}s`,
          speed: t.speed,
          drowsinessPercent: Math.round(t.drowsiness_score * 100),
          gForce: t.g_force,
        };
      });
  }, [telemetryWindow, incidentTime]);

  const activePoint = hoverIndex !== null && chartData[hoverIndex] ? chartData[hoverIndex] : chartData.find(d => d.timeLabel === 'T-0') || chartData[0];

  const mapCenter = activePoint ? [activePoint.longitude, activePoint.latitude] as [number, number] : undefined;
  
  const mapMarkers = activePoint ? [{
    id: activePoint.vehicle_id || 'unknown',
    label: activePoint.timeLabel,
    latitude: activePoint.latitude,
    longitude: activePoint.longitude,
    status: 'ACTIVE' as const,
  }] : [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Map Replay */}
      <Card className="overflow-hidden border-border/50">
        <div className="h-[300px] lg:h-[400px] w-full relative">
          <FleetMap 
            center={mapCenter}
            markers={mapMarkers}
            zoom={16}
            height="100%"
          />
          <div className="absolute top-4 left-4 bg-background/80 backdrop-blur text-xs px-2 py-1 rounded-md border shadow-sm z-10 pointer-events-none">
            {activePoint ? formatRelativeTime(activePoint.timestamp) : ''}
          </div>
        </div>
      </Card>

      {/* Synchronized Charts */}
      <Card className="p-4 border-border/50 bg-zinc-950 text-zinc-50 flex flex-col justify-center">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Telemetry Playback</h3>
        <div className="h-[250px] lg:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              onMouseMove={(e) => {
                if (e.activeTooltipIndex !== undefined) {
                  setHoverIndex(Number(e.activeTooltipIndex));
                }
              }}
              onMouseLeave={() => setHoverIndex(null)}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorDrowsiness" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis dataKey="timeLabel" stroke="#666" fontSize={10} tickLine={false} axisLine={false} />
              
              {/* Speed Axis */}
              <YAxis yAxisId="speed" orientation="left" stroke="#3b82f6" fontSize={10} tickLine={false} axisLine={false} domain={[0, 120]} />
              {/* Drowsiness Axis (0-100%) */}
              <YAxis yAxisId="risk" orientation="right" stroke="#ef4444" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} hide />
              
              <Tooltip 
                contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', fontSize: '12px' }}
                itemStyle={{ color: '#e4e4e7' }}
                labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
              />
              
              <ReferenceLine x="T-0" stroke="#ef4444" strokeDasharray="3 3" yAxisId="speed" />

              <Area yAxisId="risk" type="monotone" dataKey="drowsinessPercent" name="Drowsiness Risk %" stroke="#ef4444" fillOpacity={1} fill="url(#colorDrowsiness)" />
              <Line yAxisId="speed" type="monotone" dataKey="speed" name="Speed (km/h)" stroke="#3b82f6" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line yAxisId="risk" type="monotone" dataKey="gForce" name="G-Force (g)" stroke="#f59e0b" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div>Speed</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500/50 border border-red-500"></div>Drowsiness</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div>G-Force</div>
        </div>
      </Card>
    </div>
  );
}
