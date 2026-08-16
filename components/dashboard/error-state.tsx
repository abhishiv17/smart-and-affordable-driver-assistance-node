import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  /** Error title */
  title?: string;
  /** Error description */
  message?: string;
  /** Retry handler */
  onRetry?: () => void;
  /** Additional class */
  className?: string;
}

/**
 * Error display with optional retry action.
 * For failed data fetches or unavailable services.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An error occurred while loading data. Please try again.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 px-6 py-12',
        className
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle className="h-5 w-5 text-red-400" />
      </div>
      <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-center text-xs text-muted-foreground">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-4">
          Try again
        </Button>
      )}
    </div>
  );
}
