'use client';

// =============================================================================
// SimulatorClient — Simulation 2.0
// =============================================================================
// Main client component for the simulator page. Phase 3 Redesign:
// - Top: Scenario Engine Selector
// - Main (3 cols): Manual Controls (Left), Live Map (Center), Telemetry (Right)
// - Bottom: Interactive Timeline
// =============================================================================

import { useState } from 'react';
import { useSimulator } from '@/hooks/use-simulator';
import { useDemoOrchestrator } from '@/hooks/use-demo-orchestrator';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  Radio,
  WifiOff,
  Wifi,
  EyeOff,
  Activity,
  RefreshCw,
  Clapperboard,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { DbVehicle } from '@/types/database';
import type { MapVehicleMarker } from '@/components/dashboard/fleet-map';

// =============================================================================
// Toast System (lightweight inline)
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
  // Use the hero vehicle by default for a better first-load experience
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
    // Make sure we have the correct vehicle selected for the scenario
    setSelectedVehicleId(activeScenario.vehicleId);
    demo.start();
  };

  const handleStopDemo = () => {
    demo.stop();
    toast.show('Demo stopped', 'info');
  };

  // =========================================================================
  // Derived State for Map
  // =========================================================================

  let mapCenter: [number, number] | undefined = undefined;
  let mapMarkers: MapVehicleMarker[] = [];

  // If demo is active, prefer demo's current step coordinates (we don't have them in state directly,
  // but simulator payload updates if we were running it through simulator.
  // Wait, the orchestrator sends raw fetch calls. It bypasses `simulator` hook.
  // We need to capture the orchestrated telemetry to show on gauges/map!
  
  // To solve this cleanly for Phase 3 without massive state lifting:
  // The simulator hook already listens to realtime updates via useRealtimeVehicles? No, it doesn't.
  // Let's use the activeScenario and demo.currentStep to mock the live feed if demo is running.
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
    // Fallback to vehicle's last known location
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
    <div className="flex flex-col gap-6">
      {/* =============================================================== */}
      {/* Top: Scenario Engine */}
      {/* =============================================================== */}
      <Card className="border-violet-500/20">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10">
              <Clapperboard className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">Scenario Engine</h2>
              <p className="text-xs text-muted-foreground">Select a demo sequence</p>
            </div>
          </div>
          
          <div className="flex-1 w-full md:max-w-md">
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
          </div>

          <div className="flex-1 text-xs text-muted-foreground hidden md:block">
            {activeScenario?.description}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <Button
              variant="outline"
              className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={handleResetDatabase}
              disabled={demo.isActive}
              title="Reset Database"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            
            {demo.isActive ? (
              <Button
                className="w-full md:w-32 bg-red-600 hover:bg-red-700"
                onClick={handleStopDemo}
              >
                <Square className="mr-2 h-4 w-4" /> Stop
              </Button>
            ) : (
              <Button
                className="w-full md:w-32 bg-violet-600 hover:bg-violet-700"
                onClick={handleStartDemo}
                disabled={demo.phase === 'complete'}
              >
                <Play className="mr-2 h-4 w-4" /> Run Demo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* =============================================================== */}
      {/* Main 3-Column Layout */}
      {/* =============================================================== */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left: Manual Controls (3 cols) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Manual Override</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground">Select Vehicle</label>
                <Select 
                  value={selectedVehicleId} 
                  onValueChange={(val) => val && setSelectedVehicleId(val)}
                  disabled={demo.isActive}
                >
                  <SelectTrigger className="h-8 text-xs">
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

              {selectedVehicle && !simulator.isDriving ? (
                <Button
                  className="w-full h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                  onClick={simulator.toggleDriving}
                  disabled={!deviceId || demo.isActive}
                >
                  <Play className="mr-2 h-3 w-3" /> Start Manual Trip
                </Button>
              ) : (
                <Button
                  className="w-full h-8 text-xs"
                  variant="destructive"
                  onClick={simulator.toggleDriving}
                  disabled={demo.isActive}
                >
                  <Square className="mr-2 h-3 w-3" /> End Manual Trip
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Trigger Incidents</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Button
                variant="outline"
                className="h-8 text-xs justify-start border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
                disabled={!selectedVehicle || !deviceId || demo.isActive}
                onClick={() => simulator.triggerIncident('DROWSINESS')}
              >
                <EyeOff className="mr-2 h-3 w-3" /> Drowsiness
              </Button>
              <Button
                variant="outline"
                className="h-8 text-xs justify-start border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500"
                disabled={!selectedVehicle || !deviceId || demo.isActive}
                onClick={() => simulator.triggerIncident('HARSH_BRAKING')}
              >
                <AlertTriangle className="mr-2 h-3 w-3" /> Harsh Braking
              </Button>
              
              <div className="my-1 border-t border-border" />
              
              {simulator.networkStatus === 'ONLINE' ? (
                <Button
                  variant="outline"
                  className="h-8 text-xs justify-start"
                  disabled={!selectedVehicle || !deviceId || demo.isActive}
                  onClick={() => simulator.triggerIncident('DEVICE_OFFLINE')}
                >
                  <WifiOff className="mr-2 h-3 w-3" /> Drop Network
                </Button>
              ) : (
                <Button
                  className="h-8 text-xs justify-start bg-emerald-600 hover:bg-emerald-700"
                  disabled={!selectedVehicle || !deviceId || demo.isActive}
                  onClick={() => simulator.triggerIncident('DEVICE_RECOVERED')}
                >
                  <Wifi className="mr-2 h-3 w-3" /> Restore Network
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Center: Live Map (5 cols) */}
        <div className="lg:col-span-5 h-[400px] lg:h-auto border border-border rounded-xl overflow-hidden shadow-sm relative bg-muted/10">
          <FleetMap 
            markers={mapMarkers}
            center={mapCenter}
            zoom={14}
            height="100%"
          />
          {/* Status Overlay */}
          <div className="absolute top-4 left-4 z-10 flex gap-2">
            <div className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border ${
              demo.isActive 
                ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' 
                : simulator.isDriving 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-background/80 text-muted-foreground border-border'
            }`}>
              {demo.isActive ? 'DEMO RUNNING' : simulator.isDriving ? 'MANUAL SIMULATION' : 'SIMULATOR IDLE'}
            </div>
            
            {(displayPayload?.events[0]?.networkStatus === 'OFFLINE' || simulator.networkStatus === 'OFFLINE') && (
              <div className="px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border bg-red-500/20 text-red-300 border-red-500/30 flex items-center gap-1.5">
                <WifiOff className="h-3 w-3" /> OFFLINE
              </div>
            )}
          </div>
        </div>

        {/* Right: Telemetry (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <TelemetryGauges payload={displayPayload} />
          
          {/* Raw JSON Feed */}
          <Card className="flex-1 flex flex-col max-h-[300px] lg:max-h-none">
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-xs flex items-center gap-2 text-muted-foreground uppercase tracking-wider">
                <Radio className="h-3.5 w-3.5 text-emerald-500" />
                Raw Payload
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-4 pt-0 gap-2">
              <div className="flex-1 rounded-md bg-zinc-950 p-3 border border-border/50 overflow-auto text-[10px] font-mono text-emerald-400 relative">
                {(simulator.isSending || (demo.isActive && demo.phase === 'running')) && (
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 text-emerald-500/70">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    Tx
                  </div>
                )}
                <pre className="whitespace-pre-wrap">
                  {displayPayload ? JSON.stringify(displayPayload, null, 2) : '// Idle...'}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* =============================================================== */}
      {/* Bottom: Timeline */}
      {/* =============================================================== */}
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
              className={`flex items-center gap-2 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-5 duration-300 ${
                t.variant === 'success' ? 'border-emerald-500/30 bg-emerald-950/80' : 
                t.variant === 'error' ? 'border-red-500/30 bg-red-950/80' : 
                'border-blue-500/30 bg-blue-950/80'
              }`}
            >
              {t.variant === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />}
              {t.variant === 'error' && <XCircle className="h-4 w-4 text-red-400 shrink-0" />}
              <p className="text-sm text-foreground">{t.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
