import { Shield } from 'lucide-react';

/**
 * Global loading state shown during navigation.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-muted border-t-emerald-500" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="h-5 w-5 text-emerald-500" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
