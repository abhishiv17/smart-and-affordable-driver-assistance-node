// =============================================================================
// POST /api/telemetry — Telemetry Ingestion
// GET  /api/telemetry — Telemetry Query
// =============================================================================

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateTelemetrySubmission } from '@/lib/telemetry/validation';
import { processTelemetryBatch } from '@/lib/telemetry/processor';
import { errorResponse, validationErrorResponse } from '@/lib/api/errors';
import type { TelemetrySubmissionResponse } from '@/types/telemetry';

/**
 * POST /api/telemetry
 *
 * Telemetry ingestion endpoint.
 * Accepts batched telemetry events from the edge device or simulator.
 *
 * Request body: TelemetrySubmission (see types/telemetry.ts)
 * Response: TelemetrySubmissionResponse
 *
 * Authentication: Uses service_role key server-side (bypasses RLS).
 * The edge device authenticates via device serial / API key (future phase).
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Parse JSON body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return errorResponse('Invalid JSON body', 'BAD_REQUEST', 400);
    }

    // 2. Validate with Zod schema
    const validation = validateTelemetrySubmission(body);
    if (!validation.success) {
      const errors = validation.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      );
      return validationErrorResponse(errors);
    }

    const submission = validation.data;

    // 3. Create admin Supabase client (bypasses RLS)
    const supabase = createAdminClient();

    // 4. Process the batch
    const result = await processTelemetryBatch(submission.events, supabase);

    // 5. Build response
    const response: TelemetrySubmissionResponse = {
      accepted: result.eventsErrored === 0,
      eventsIngested: result.eventsIngested,
      errors: result.results
        .filter(r => r.status === 'error')
        .map((r, idx) => ({
          eventIndex: idx,
          field: 'event',
          message: r.error ?? 'Unknown processing error',
        })),
    };

    // Include additional metadata
    const responseBody = {
      ...response,
      eventsDuplicated: result.eventsDuplicated,
      alertsCreated: result.alertsCreated,
    };

    return NextResponse.json(responseBody, {
      status: result.eventsErrored > 0 ? 207 : 200,
    });
  } catch (err) {
    console.error('[telemetry] Unhandled error:', err);
    return errorResponse(
      'Internal server error during telemetry processing',
      'INTERNAL_ERROR',
      500
    );
  }
}

/**
 * GET /api/telemetry
 *
 * Query telemetry history with optional filters.
 *
 * Query params:
 * - vehicleId: UUID — filter by vehicle
 * - deviceId: UUID — filter by device
 * - eventType: string — filter by event type
 * - limit: number — max results (default: 50, max: 200)
 * - offset: number — pagination offset
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const deviceId = searchParams.get('deviceId');
    const eventType = searchParams.get('eventType');
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? '50', 10) || 50,
      200
    );
    const offset = parseInt(searchParams.get('offset') ?? '0', 10) || 0;

    const supabase = createAdminClient();

    let query = supabase
      .from('telemetry')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId);
    }
    if (deviceId) {
      query = query.eq('device_id', deviceId);
    }
    if (eventType) {
      const validEventTypes = ['NORMAL', 'DROWSINESS', 'HARSH_BRAKING', 'HARSH_ACCELERATION', 'DEVICE_OFFLINE', 'DEVICE_RECOVERED'] as const;
      type EventTypeValue = typeof validEventTypes[number];
      if (validEventTypes.includes(eventType as EventTypeValue)) {
        query = query.eq('event_type', eventType as EventTypeValue);
      }
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[telemetry] Query error:', error.message);
      return errorResponse('Failed to query telemetry', 'INTERNAL_ERROR', 500);
    }

    return NextResponse.json({
      data: data ?? [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error('[telemetry] Unhandled query error:', err);
    return errorResponse(
      'Internal server error during telemetry query',
      'INTERNAL_ERROR',
      500
    );
  }
}
