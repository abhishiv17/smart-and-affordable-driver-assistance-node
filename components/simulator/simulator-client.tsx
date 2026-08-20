'use client';

// =============================================================================
// SimulatorClient — Digital Bauhaus Technical Interface
// =============================================================================

import { useState } from 'react';
import { useSimulator } from '@/hooks/use-simulator';
import { useDemoOrchestrator } from '@/hooks/use-demo-orchestrator';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { FleetMap } from '@/components/dashboard/fleet-map';
import { TelemetryGauges } from '@/components/simulator/telemetry-gauges';
import { SimulationTimeline } from '@/components/simulator/simulation-timeline';
import { DEMO_SCENARIOS, HERO_VEHICLE_ID } from '@/lib/demo/demo-scenarios';
import {
  Play,
  Square,
  AlertTriangle,
  WifiOff,
  Wifi,
  EyeOff,
  RefreshCw,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { DbVehicle } from '@/types/database';
import type { MapVehicleMarker } from '@/components/dashboard/fleet-map';

// =============================================================================
// Toast System
// =============================================================================

interface InlineToast {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'info';
}

function useInlineToasts() {
  const [toasts, setToasts] = useState<InlineToast[]>([]);

  function show(message: string, variant: InlineToast['variant'] = 'info') {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return { toasts, show, dismiss };
}

// =============================================================================
// Component
// =============================================================================

interface SimulatorClientProps {
  vehicles: DbVehicle[];
}

export function SimulatorClient({ vehicles }: SimulatorClientProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(HERO_VEHICLE_ID);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('hero-drowsy-driver');

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || null;
  const deviceId = selectedVehicle?.device_id || null;
  const activeScenario = DEMO_SCENARIOS[selectedScenarioId];

  // Hooks
  const simulator = useSimulator({ vehicle: selectedVehicle, deviceId });
  const demo = useDemoOrchestrator(selectedScenarioId);
  const { confirm, dialogProps } = useConfirmDialog();
  const toast = useInlineToasts();

  // =========================================================================
  // Handlers
  // =========================================================================

  const handleResetDatabase = async () => {
    const confirmed = await confirm({
      title: 'Reset Database?',
      description:
        'This will delete all telemetry, alerts, trips, and AI reports. ' +
        'Vehicles and drivers will be preserved but reset to idle state.',
      variant: 'destructive',
      confirmLabel: 'Reset Everything',
    });
    if (!confirmed) return;

    try {
      const res = await fetch('/api/demo/reset', { method: 'POST' });
      if (!res.ok) throw new Error('Reset request failed');
      toast.show('Database reset successfully', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch {
      toast.show('Failed to reset database', 'error');
    }
  };

  const handleStartDemo = () => {
    if (demo.isActive) return;
    setSelectedVehicleId(activeScenario.vehicleId);
    demo.start();
  };

  const handleStopDemo = () => {
    demo.stop();
    toast.show('Demo stopped', 'info');
  };

  // =========================================================================
  // Map State
  // =========================================================================

  let mapCenter: [number, number] | undefined = undefined;
  let mapMarkers: MapVehicleMarker[] = [];
  let displayPayload = simulator.lastPayload;
  
  if (demo.isActive && demo.phase === 'running') {
    const step = activeScenario.steps[demo.currentStep];
    if (step) {
      displayPayload = {
        deviceId: activeScenario.deviceId,
        submittedAt: new Date().toISOString(),
        events: [{
          id: 'demo',
          deviceId: activeScenario.deviceId,
          vehicleId: activeScenario.vehicleId,
          timestamp: new Date().toISOString(),
          latitude: step.latitude,
          longitude: step.longitude,
          speed: step.speed,
          gForce: step.gForce,
          drowsinessScore: step.drowsinessScore,
          eyeAspectRatio: step.eyeAspectRatio,
          eventType: step.eventType,
          networkStatus: step.networkStatus,
        }]
      };
    }
  }

  if (displayPayload?.events[0]) {
    const event = displayPayload.events[0];
    mapCenter = [event.longitude, event.latitude];
    mapMarkers = [{
      id: event.vehicleId,
      label: selectedVehicle?.vehicle_number || 'TRK',
      latitude: event.latitude,
      longitude: event.longitude,
      status: event.networkStatus === 'OFFLINE' ? 'OFFLINE' : 'ACTIVE'
    }];
  } else if (selectedVehicle) {
    mapCenter = selectedVehicle.longitude && selectedVehicle.latitude
      ? [selectedVehicle.longitude, selectedVehicle.latitude]
      : undefined;
    if (mapCenter) {
      mapMarkers = [{
        id: selectedVehicle.id,
        label: selectedVehicle.vehicle_number,
        latitude: mapCenter[1],
        longitude: mapCenter[0],
        status: selectedVehicle.status
      }];
    }
  }

  // =========================================================================
  // Render
  // =========================================================================

  return (
    <div className="flex flex-col gap-8">
      {/* ================================================================= */}
      {/* Scenario Selector + Controls */}
      {/* ================================================================= */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex-1 w-full md:max-w-md">
          <p className="sadan-label mb-2">Decision Scenario</p>
          <Select 
            value={selectedScenarioId} 
            onValueChange={(val) => { if (val) setSelectedScenarioId(val); }}
            disabled={demo.isActive}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select scenario..." />
            </SelectTrigger>
            <SelectContent>
              {Object.values(DEMO_SCENARIOS).map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeScenario && (
            <p className="text-xs text-muted-foreground mt-1">{activeScenario.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDatabase}
            disabled={demo.isActive}
            className="uppercase tracking-wider text-xs"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Reset
          </Button>
          
          {demo.isActive ? (
            <Button
              size="sm"
              onClick={handleStopDemo}
              className="uppercase tracking-wider text-xs"
              style={{ backgroundColor: 'var(--color-sadan-critical)' }}
            >
              <Square className="h-3.5 w-3.5 mr-1.5" /> Stop
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleStartDemo}
              disabled={demo.phase === 'complete'}
              className="uppercase tracking-wider text-xs"
            >
              <Play className="h-3.5 w-3.5 mr-1.5" /> Run Simulation
            </Button>
          )}
        </div>
      </div>

      <hr className="sadan-divider" />

      {/* ================================================================= */}
      {/* Main Layout: Controls | Map | Telemetry */}
      {/* ================================================================= */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left: Manual Controls */}
        <div className="lg:col-span-3 space-y-6">
          <div>
            <p className="sadan-label mb-2">Vehicle</p>
            <Select 
              value={selectedVehicleId} 
              onValueChange={(val) => val && setSelectedVehicleId(val)}
              disabled={demo.isActive}
            >
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Vehicle..." />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id} disabled={!v.device_id}>
                    {v.vehicle_number} {v.device_id ? '' : '(No Device)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <p className="sadan-label mb-2">Manual Override</p>
            {selectedVehicle && !simulator.isDriving ? (
              <Button
                className="w-full text-xs uppercase tracking-wider"
                size="sm"
                onClick={simulator.toggleDriving}
                disabled={!deviceId || demo.isActive}
              >
                <Play className="h-3 w-3 mr-1.5" /> Start Trip
              </Button>
            ) : (
              <Button
                className="w-full text-xs uppercase tracking-wider"
                variant="outline"
                size="sm"
                onClick={simulator.toggleDriving}
                disabled={demo.isActive}
              >
                <Square className="h-3 w-3 mr-1.5" /> End Trip
              </Button>
            )}
          </div>

          <hr className="sadan-divider" />

          <div>
            <p className="sadan-label mb-2">Trigger Incidents</p>
            <div className="space-y-1.5">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start uppercase tracking-wider"
                disabled={!selectedVehicle || !deviceId || demo.isActive}
                onClick={() => simulator.triggerIncident('DROWSINESS')}
              >
                <EyeOff className="h-3 w-3 mr-1.5" /> Drowsiness
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs justify-start uppercase tracking-wider"
                disabled={!selectedVehicle || !deviceId || demo.isActive}
                onClick={() => simulator.triggerIncident('HARSH_BRAKING')}
              >
                <AlertTriangle className="h-3 w-3 mr-1.5" /> Harsh Braking
              </Button>

              <hr className="sadan-divider my-1" />

              {simulator.networkStatus === 'ONLINE' ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start uppercase tracking-wider"
                  disabled={!selectedVehicle || !deviceId || demo.isActive}
                  onClick={() => simulator.triggerIncident('DEVICE_OFFLINE')}
                >
                  <WifiOff className="h-3 w-3 mr-1.5" /> Drop Network
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="w-full text-xs justify-start uppercase tracking-wider"
                  disabled={!selectedVehicle || !deviceId || demo.isActive}
                  onClick={() => simulator.triggerIncident('DEVICE_RECOVERED')}
                >
                  <Wifi className="h-3 w-3 mr-1.5" /> Restore Network
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Center: Map */}
        <div className="lg:col-span-5 h-[400px] lg:h-auto border border-border overflow-hidden relative bg-muted/10" style={{ borderRadius: 'var(--radius)' }}>
          <FleetMap 
            markers={mapMarkers}
            center={mapCenter}
            zoom={14}
            height="100%"
          />
          {/* Status Overlay */}
          <div className="absolute top-3 left-3 z-10 flex gap-2">
            <div
              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border bg-background/90 backdrop-blur-sm"
              style={{
                borderRadius: 'var(--radius)',
                borderColor: demo.isActive
                  ? 'var(--color-bauhaus-blue)'
                  : simulator.isDriving
                    ? 'var(--color-sadan-success)'
                    : 'var(--border)',
                color: demo.isActive
                  ? 'var(--color-bauhaus-blue)'
                  : simulator.isDriving
                    ? 'var(--color-sadan-success)'
                    : 'var(--muted-foreground)',
              }}
            >
              {demo.isActive ? 'SIMULATION RUNNING' : simulator.isDriving ? 'MANUAL TRIP' : 'IDLE'}
            </div>
            
            {(displayPayload?.events[0]?.networkStatus === 'OFFLINE' || simulator.networkStatus === 'OFFLINE') && (
              <div
                className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border bg-background/90 backdrop-blur-sm"
                style={{ borderRadius: 'var(--radius)', borderColor: 'var(--color-sadan-critical)', color: 'var(--color-sadan-critical)' }}
              >
                <WifiOff className="h-3 w-3" /> Offline
              </div>
            )}
          </div>
        </div>

        {/* Right: Telemetry */}
        <div className="lg:col-span-4 space-y-6">
          <TelemetryGauges payload={displayPayload} />
          
          {/* Raw JSON Feed */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="sadan-label">Raw Payload</p>
              {(simulator.isSending || (demo.isActive && demo.phase === 'running')) && (
                <span className="sadan-status-dot sadan-status-dot--online" />
              )}
            </div>
            <div
              className="bg-[var(--sidebar)] text-[var(--sidebar-foreground)] p-3 overflow-auto max-h-[280px] border border-border"
              style={{ borderRadius: 'var(--radius)' }}
            >
              <pre className="whitespace-pre-wrap text-[10px] font-mono leading-relaxed">
                {displayPayload ? JSON.stringify(displayPayload, null, 2) : '// Idle...'}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Timeline */}
      {/* ================================================================= */}
      <SimulationTimeline 
        scenario={activeScenario}
        currentStepIndex={demo.currentStep}
        isActive={demo.isActive}
      />

      {/* Confirmation Dialog & Toasts */}
      <AlertDialog {...dialogProps} />
      {toast.toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
          {toast.toasts.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 px-4 py-3 border bg-background shadow-sm"
              style={{
                borderRadius: 'var(--radius)',
                borderColor: t.variant === 'success'
                  ? 'var(--color-sadan-success)'
                  : t.variant === 'error'
                    ? 'var(--color-sadan-critical)'
                    : 'var(--color-bauhaus-blue)',
              }}
            >
              {t.variant === 'success' && <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: 'var(--color-sadan-success)' }} />}
              {t.variant === 'error' && <XCircle className="h-4 w-4 shrink-0" style={{ color: 'var(--color-sadan-critical)' }} />}
              <p className="text-sm">{t.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
