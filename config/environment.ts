// =============================================================================
// Environment Configuration — Typed & Validated
// =============================================================================
// Validates required environment variables at runtime with clear error
// messages. Separates public (browser-safe) from server-only variables.
// =============================================================================

import { z } from 'zod';

/**
 * Public environment variables — safe to expose to the browser.
 * These are prefixed with NEXT_PUBLIC_.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  NEXT_PUBLIC_MAP_STYLE_URL: z.string().url('NEXT_PUBLIC_MAP_STYLE_URL must be a valid URL').optional(),
});

/**
 * Server-only environment variables — NEVER expose to client-side code.
 */
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),
  GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
});

/**
 * Combined environment schema.
 */
const envSchema = publicEnvSchema.merge(serverEnvSchema);

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = z.infer<typeof envSchema>;

/**
 * Get validated public environment variables.
 * Safe to call from both client and server code.
 *
 * Phase 1: Returns values without validation since env vars are not yet configured.
 */
export function getPublicEnv(): Partial<PublicEnv> {
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_MAP_STYLE_URL: process.env.NEXT_PUBLIC_MAP_STYLE_URL,
  };
}

/**
 * Get validated server-only environment variables.
 * MUST only be called from server-side code (Route Handlers, Server Components, etc.)
 *
 * Phase 1: Returns values without validation since env vars are not yet configured.
 */
export function getServerEnv(): Partial<ServerEnv> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'getServerEnv() was called from client-side code. ' +
      'Server environment variables must never be exposed to the browser.'
    );
  }
  return {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY,
  };
}

/**
 * Validate all environment variables. Call during server startup
 * to fail fast if configuration is missing.
 *
 * Phase 2+: Enable strict validation once env vars are configured.
 */
export function validateEnv(): { success: boolean; errors: string[] } {
  const result = envSchema.safeParse(process.env);
  if (result.success) {
    return { success: true, errors: [] };
  }
  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')}: ${issue.message}`
  );
  return { success: false, errors };
}
