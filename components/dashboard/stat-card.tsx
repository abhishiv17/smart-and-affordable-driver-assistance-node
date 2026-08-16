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
  /** Optional className */
  className?: string;
}

/**
 * KPI metric card for fleet summary statistics.
 * Compact, dark-themed, designed for operations dashboards.
 */
export function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  accentColor = 'text-muted-foreground',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
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
            <div className={cn('rounded-md bg-muted p-2', accentColor)}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
