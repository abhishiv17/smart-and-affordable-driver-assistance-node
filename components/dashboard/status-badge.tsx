import { cn } from '@/lib/utils';
import type { VehicleStatus } from '@/types/vehicle';
import type { DriverStatus } from '@/types/driver';
import type { DeviceStatus } from '@/types/device';
import type { AlertSeverity } from '@/types/alert';
import { formatVehicleStatus, formatDriverStatus, formatDeviceStatus, formatSeverity } from '@/lib/utils/formatters';

// =============================================================================
// Color Maps
// =============================================================================

const VEHICLE_STATUS_STYLES: Record<VehicleStatus, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  IDLE: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  OFFLINE: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  MAINTENANCE: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
};

const DRIVER_STATUS_STYLES: Record<DriverStatus, string> = {
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  INACTIVE: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  SUSPENDED: 'bg-red-500/15 text-red-400 border-red-500/25',
};

const DEVICE_STATUS_STYLES: Record<DeviceStatus, string> = {
  ONLINE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  OFFLINE: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
  ERROR: 'bg-red-500/15 text-red-400 border-red-500/25',
  PROVISIONING: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
};

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  INFO: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  WARNING: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/25',
};

// =============================================================================
// Component Variants
// =============================================================================

interface StatusBadgeBaseProps {
  className?: string;
  /** Show a pulsing dot indicator */
  dot?: boolean;
}

interface VehicleStatusBadgeProps extends StatusBadgeBaseProps {
  variant: 'vehicle';
  status: VehicleStatus;
}

interface DriverStatusBadgeProps extends StatusBadgeBaseProps {
  variant: 'driver';
  status: DriverStatus;
}

interface DeviceStatusBadgeProps extends StatusBadgeBaseProps {
  variant: 'device';
  status: DeviceStatus;
}

interface SeverityBadgeProps extends StatusBadgeBaseProps {
  variant: 'severity';
  status: AlertSeverity;
}

type StatusBadgeProps =
  | VehicleStatusBadgeProps
  | DriverStatusBadgeProps
  | DeviceStatusBadgeProps
  | SeverityBadgeProps;

/**
 * Semantic status badge for vehicle, driver, device, and alert severity states.
 * Renders a pill with domain-appropriate color and optional dot indicator.
 */
export function StatusBadge({ variant, status, className, dot = false }: StatusBadgeProps) {
  let styles: string;
  let label: string;

  switch (variant) {
    case 'vehicle':
      styles = VEHICLE_STATUS_STYLES[status as VehicleStatus];
      label = formatVehicleStatus(status as VehicleStatus);
      break;
    case 'driver':
      styles = DRIVER_STATUS_STYLES[status as DriverStatus];
      label = formatDriverStatus(status as DriverStatus);
      break;
    case 'device':
      styles = DEVICE_STATUS_STYLES[status as DeviceStatus];
      label = formatDeviceStatus(status as DeviceStatus);
      break;
    case 'severity':
      styles = SEVERITY_STYLES[status as AlertSeverity];
      label = formatSeverity(status as AlertSeverity);
      break;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider',
        styles,
        className
      )}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-40" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      )}
      {label}
    </span>
  );
}
