// =============================================================================
// Supabase Admin Client — Service Role (Server-only)
// =============================================================================
// SECURITY: This client uses the service_role key which bypasses Row Level
// Security. It must ONLY be used in server-side code (Route Handlers,
// Server Actions). NEVER import this in client components.
//
// Usage: Telemetry ingestion, admin operations, seed data operations.
// =============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Creates a Supabase client with service_role privileges.
 * Bypasses RLS — use only for server-side operations.
 *
 * @throws Error if environment variables are not configured.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin environment variables. ' +
      'Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      // Disable auto-refresh and session persistence for service role
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
