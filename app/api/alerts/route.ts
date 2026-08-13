import { notImplementedResponse } from '@/lib/api/errors';

/**
 * GET /api/alerts
 *
 * List safety alerts for the fleet.
 *
 * Query params (Phase 2+):
 * - severity: AlertSeverity filter
 * - status: AlertStatus filter
 * - page: pagination
 * - limit: page size
 *
 * Response: { data: SafetyAlert[], total: number }
 *
 * Phase 2+: Will query Supabase for alert data.
 */
export async function GET() {
  return notImplementedResponse('Alert listing');
}
