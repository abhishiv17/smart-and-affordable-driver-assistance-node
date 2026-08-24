import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  /** Label above the metric value */
  label: string;
  /** Primary metric value */
  value: string | number;
  /** Optional trend or secondary info */
  subtitle?: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Optional color accent class */
  accentColor?: string;
  /** Optional CSS color for the top gradient strip */
  accentCssColor?: string;
  /** Show pulsing animation on the icon (for critical states) */
  pulse?: boolean;
  /** Optional className */
  className?: string;
}

/**
 * KPI metric card for fleet summary statistics.
 * Compact, dark-themed, designed for safety operations dashboards.
 * Features a gradient accent strip at the top and optional pulse animation.
 */
export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'text-muted-foreground',
  accentCssColor,
  pulse = false,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      {/* Gradient accent strip */}
      {accentCssColor && (
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background: `linear-gradient(90deg, ${accentCssColor}, transparent)`,
          }}
        />
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div className={cn('relative rounded-md bg-muted p-2', accentColor)}>
              <Icon className="h-4 w-4" />
              {/* Pulse ring for critical attention */}
              {pulse && (
                <span className="absolute inset-0 rounded-md animate-ping bg-current opacity-10" />
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
