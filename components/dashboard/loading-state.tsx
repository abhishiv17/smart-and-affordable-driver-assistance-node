import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingStateProps {
  /** Type of content being loaded */
  variant?: 'cards' | 'table' | 'detail' | 'chart';
  /** Number of skeleton items to show */
  count?: number;
  /** Additional class */
  className?: string;
}

/**
 * Skeleton loading patterns for different content types.
 * Provides visual consistency during data fetches.
 */
export function LoadingState({
  variant = 'cards',
  count = 4,
  className,
}: LoadingStateProps) {
  switch (variant) {
    case 'cards':
      return (
        <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-4', className)}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <Skeleton className="h-3 w-20 mb-3" />
              <Skeleton className="h-7 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>
      );

    case 'table':
      return (
        <div className={cn('rounded-lg border border-border', className)}>
          {/* Header */}
          <div className="flex gap-4 border-b border-border bg-muted/30 px-4 py-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-3 w-20" />
            ))}
          </div>
          {/* Rows */}
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex gap-4 border-b border-border/50 px-4 py-3 last:border-b-0">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-20" />
              ))}
            </div>
          ))}
        </div>
      );

    case 'detail':
      return (
        <div className={cn('space-y-6', className)}>
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <Skeleton className="h-3 w-16 mb-2" />
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        </div>
      );

    case 'chart':
      return (
        <div className={cn('rounded-lg border border-border p-4', className)}>
          <Skeleton className="h-4 w-32 mb-4" />
          <div className="flex items-end gap-2 h-32">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="flex-1"
                style={{ height: `${30 + Math.random() * 70}%` }}
              />
            ))}
          </div>
        </div>
      );
  }
}
