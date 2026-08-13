// =============================================================================
// Supabase Client — Browser
// =============================================================================
// Creates a Supabase client for use in Client Components.
// Uses the anon key (safe for browser exposure).
//
// Phase 2+: Will be fully functional once env vars are configured.
// =============================================================================

import { createBrowserClient } from '@supabase/ssr';

/**
 * Creates a Supabase client for browser-side usage.
 * Call this in Client Components or custom hooks.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
