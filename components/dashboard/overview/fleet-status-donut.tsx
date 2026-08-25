'use client';

// =============================================================================
// Fleet Status Donut — Vehicle Status Composition + Device Status
// =============================================================================

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface FleetStatusDonutProps {
  active: number;
  idle: number;
  maintenance: number;
  offline: number;
  devicesOnline: number;
  devicesTotal: number;
}

const STATUS_COLORS: Record<string, string> = {
  Active: 'var(--color-status-active)',
  Idle: 'var(--color-status-idle)',
  Maintenance: 'var(--color-status-maintenance)',
  Offline: 'var(--color-status-offline)',
};

/**
 * Donut chart showing fleet composition by vehicle status.
 * Center shows active/total count. Below shows device connectivity.
 */
export function FleetStatusDonut({
  active,
  idle,
  maintenance,
  offline,
  devicesOnline,
  devicesTotal,
}: FleetStatusDonutProps) {
  const total = active + idle + maintenance + offline;

  const data = [
    { name: 'Active', value: active },
    { name: 'Idle', value: idle },
    { name: 'Maintenance', value: maintenance },
    { name: 'Offline', value: offline },
  ].filter((d) => d.value > 0);

  return (
    <div className="sadan-section">
      <p className="sadan-label mb-4">Fleet Status</p>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="relative shrink-0" style={{ width: 120, height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={55}
                dataKey="value"
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name] ?? 'var(--border)'}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="sadan-metric text-2xl">{active}</span>
            <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
              / {total}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 flex-1">
          {[
            { label: 'Active', value: active, color: STATUS_COLORS.Active },
            { label: 'Idle', value: idle, color: STATUS_COLORS.Idle },
            { label: 'Maintenance', value: maintenance, color: STATUS_COLORS.Maintenance },
            { label: 'Offline', value: offline, color: STATUS_COLORS.Offline },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <span
                className="sadan-status-dot shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs">{item.label}</span>
              <span className="font-mono font-semibold ml-auto text-xs">
                {item.value}
              </span>
            </div>
          ))}

          {/* Divider + Devices */}
          <hr className="sadan-divider !my-2" />
          <div className="flex items-center gap-2 text-xs">
            <span className="sadan-status-dot sadan-status-dot--online" />
            <span className="text-muted-foreground">Devices</span>
            <span className="font-mono font-semibold ml-auto">
              {devicesOnline}/{devicesTotal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
