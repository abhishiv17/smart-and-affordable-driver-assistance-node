// =============================================================================
// POST /api/demo/reset — Reset Database for Demo
// =============================================================================
// Clears all dynamic data (telemetry, alerts, trips, AI reports) and
// resets vehicles and devices back to their default state.
//
// Designed to be followed by POST /api/demo/seed for a complete reset cycle.
// =============================================================================

import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST() {
  try {
    const supabase = createAdminClient();
    const counts = {
      telemetry: 0,
      alerts: 0,
      trips: 0,
      aiReports: 0,
    };

    // 1. Delete telemetry
    const { data: telData, error: telError } = await supabase
      .from('telemetry')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');
    if (telError) throw new Error(`Telemetry reset failed: ${telError.message}`);
    counts.telemetry = telData?.length ?? 0;

    // 2. Delete alerts
    const { data: alertData, error: alertError } = await supabase
      .from('alerts')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');
    if (alertError) throw new Error(`Alert reset failed: ${alertError.message}`);
    counts.alerts = alertData?.length ?? 0;

    // 3. Delete trips
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');
    if (tripError) throw new Error(`Trip reset failed: ${tripError.message}`);
    counts.trips = tripData?.length ?? 0;

    // 4. Delete AI reports
    const { data: aiData, error: aiError } = await supabase
      .from('ai_reports')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');
    if (aiError) throw new Error(`AI report reset failed: ${aiError.message}`);
    counts.aiReports = aiData?.length ?? 0;

    // 5. Reset vehicles to idle state with full safety score
    const { error: vError } = await supabase
      .from('vehicles')
      .update({
        status: 'IDLE',
        safety_score: 100,
        last_seen: null,
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (vError) throw new Error(`Vehicle reset failed: ${vError.message}`);

    // 6. Reset device connectivity to ONLINE and clear last_seen
    const { error: dError } = await supabase
      .from('devices')
      .update({
        connectivity_status: 'ONLINE',
        last_seen: new Date().toISOString(),
      })
      .neq('id', '00000000-0000-0000-0000-000000000000');
    if (dError) throw new Error(`Device reset failed: ${dError.message}`);

    return NextResponse.json({
      success: true,
      message: 'Database reset successfully',
      deleted: counts,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[demo/reset] Failed to reset database:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
