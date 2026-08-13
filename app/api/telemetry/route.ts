import { NextResponse } from 'next/server';
import { notImplementedResponse } from '@/lib/api/errors';

/**
 * POST /api/telemetry
 *
 * Telemetry ingestion endpoint.
 * Accepts batched telemetry events from the edge device or simulator.
 *
 * Request body: TelemetrySubmission (see types/telemetry.ts)
 * Response: TelemetrySubmissionResponse
 *
 * Phase 2+: Will validate, process, and store telemetry events.
 */
export async function POST() {
  return notImplementedResponse('Telemetry ingestion');
}

/**
 * GET /api/telemetry
 *
 * Query telemetry history.
 * Phase 2+: Will return paginated telemetry events with filtering.
 */
export async function GET() {
  return NextResponse.json(
    { message: 'Telemetry query endpoint. Not yet implemented.', data: [] },
    { status: 501 }
  );
}
