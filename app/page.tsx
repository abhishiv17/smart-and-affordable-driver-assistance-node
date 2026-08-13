import { redirect } from 'next/navigation';

/**
 * Root page — redirects to dashboard.
 * Phase 2+: Will check authentication and redirect accordingly.
 */
export default function RootPage() {
  redirect('/dashboard');
}
