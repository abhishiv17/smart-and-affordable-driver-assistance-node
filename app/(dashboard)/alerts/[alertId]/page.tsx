import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/dashboard/section';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EventIndicator } from '@/components/dashboard/event-indicator';
import { RiskBreakdown } from '@/components/incident/risk-breakdown';
import { IncidentReplay } from '@/components/incident/incident-replay';
import { analyzeIncident } from '@/lib/safety/incident-intelligence';
import { formatRelativeTime } from '@/lib/utils/formatters';
import Link from 'next/link';
import { ArrowLeft, Car, CalendarClock } from 'lucide-react';
import type { DbAlert, DbTelemetry, DbVehicle } from '@/types/database';

export const metadata: Metadata = {
  title: 'Incident Intelligence',
  description: 'Detailed breakdown and replay of safety incidents.',
};

export const dynamic = 'force-dynamic';

export default async function AlertDetailPage({
  params,
}: {
  params: Promise<{ alertId: string }>;
}) {
  const { alertId } = await params;
  const supabase = await createClient();

  // 1. Fetch Alert
  const { data: alertData, error: alertError } = await supabase
    .from('alerts')
    .select('*')
    .eq('id', alertId)
    .single();

  if (alertError || !alertData) {
    notFound();
  }

  const alert = alertData as DbAlert;

  // 2. Fetch Vehicle
  const { data: vehicleData } = await supabase
    .from('vehicles')
    .select('*, drivers(name)')
    .eq('id', alert.vehicle_id)
    .single();
    
  const vehicle = vehicleData as (DbVehicle & { drivers: { name: string } | null }) | null;

  // 3. Fetch Telemetry Window (-30s to +15s)
  const alertTime = new Date(alert.timestamp).getTime();
  const startTime = new Date(alertTime - 30 * 1000).toISOString();
  const endTime = new Date(alertTime + 15 * 1000).toISOString();

  const { data: telemetryData } = await supabase
    .from('telemetry')
    .select('*')
    .eq('vehicle_id', alert.vehicle_id)
    .gte('timestamp', startTime)
    .lte('timestamp', endTime)
    .order('timestamp', { ascending: true });

  const telemetryWindow = (telemetryData || []) as DbTelemetry[];

  // 4. Run Intelligence Engine
  const analysis = analyzeIncident(alert, telemetryWindow);

  return (
    <>
      {/* Back Navigation */}
      <div className="mb-4">
        <Link 
          href="/alerts" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Incidents
        </Link>
      </div>

      {/* Header */}
      <PageHeader
        title={analysis.summaryTitle}
        description={analysis.summaryDescription}
        actions={
          <div className="flex items-center gap-2">
            <EventIndicator type={alert.type} showLabel />
            <StatusBadge 
              variant="severity" 
              status={alert.severity as 'INFO' | 'WARNING' | 'CRITICAL'} 
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-12 mt-6">
        {/* Left Column: Context & Risk Breakdown */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Section title="Incident Context">
            <div className="grid gap-4 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <Car className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    <Link href={`/vehicles/${alert.vehicle_id}`} className="hover:underline">
                      {vehicle?.vehicle_number || 'Unknown Vehicle'}
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {vehicle?.drivers?.name || 'Unassigned Driver'}
                  </p>
                </div>
              </div>
              <div className="border-t border-border/50" />
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                  <CalendarClock className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Time of Event</p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(alert.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Why is this critical?">
            <RiskBreakdown analysis={analysis} />
          </Section>
        </div>

        {/* Right Column: Replay */}
        <div className="lg:col-span-8">
          <Section title="Incident Replay" subtitle="Synchronized telemetry mapping (-30s to +15s)">
            <IncidentReplay 
              telemetryWindow={telemetryWindow} 
              incidentTime={alert.timestamp} 
            />
          </Section>
        </div>
      </div>
    </>
  );
}
