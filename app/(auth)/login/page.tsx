import type { Metadata } from 'next';
import { Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to DriverGuard fleet safety platform.',
};

/**
 * Login page.
 * Phase 2+: Will implement Supabase Auth with email/password and OAuth.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              DriverGuard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Fleet Safety Intelligence Platform
            </p>
          </div>
        </div>

        {/* Login form placeholder */}
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Authentication will be implemented with Supabase Auth in a future phase.
          </p>
          <p className="mt-3 rounded-md bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            Coming in Phase 2
          </p>
        </div>
      </div>
    </div>
  );
}
