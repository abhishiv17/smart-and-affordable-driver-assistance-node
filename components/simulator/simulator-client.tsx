'use client';

import { useState } from 'react';
import { useSimulator } from '@/hooks/use-simulator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, AlertTriangle, Radio, WifiOff, Wifi, EyeOff, Activity, RefreshCw, Clapperboard } from 'lucide-react';
import type { DbVehicle } from '@/types/database';

interface SimulatorClientProps {
  vehicles: DbVehicle[];
}

export function SimulatorClient({ vehicles }: SimulatorClientProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [isResetting, setIsResetting] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || null;
  const deviceId = selectedVehicle?.device_id || null;

  const {
    isDriving,
    toggleDriving,
    triggerIncident,
    networkStatus,
    lastPayload,
    lastResponse,
    isSending,
  } = useSimulator({ vehicle: selectedVehicle, deviceId });

  const resetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the database? This will delete all telemetry, alerts, and AI reports.')) return;
    setIsResetting(true);
    try {
      await fetch('/api/demo/reset', { method: 'POST' });
      alert('Database reset successfully. Reloading...');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('Failed to reset database.');
    } finally {
      setIsResetting(false);
    }
  };

  const runDemoScript = async () => {
    if (!selectedVehicle || !deviceId) {
      alert('Please select a vehicle first.');
      return;
    }
    
    setIsDemoRunning(true);
    
    // T+0s: Start Trip
    if (!isDriving) toggleDriving();
    
    // T+5s: Drowsiness
    setTimeout(() => triggerIncident('DROWSINESS'), 5000);
    
    // T+10s: Go Offline
    setTimeout(() => triggerIncident('DEVICE_OFFLINE'), 10000);
    
    // T+14s: Harsh Braking (offline)
    setTimeout(() => triggerIncident('HARSH_BRAKING'), 14000);
    
    // T+18s: Go Online (sync)
    setTimeout(() => triggerIncident('DEVICE_RECOVERED'), 18000);
    
    // T+22s: End Trip
    setTimeout(() => {
      toggleDriving();
      setIsDemoRunning(false);
      alert('Demo Script Complete! Check the Dashboard and AI Reports.');
    }, 22000);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Presentation Mode</CardTitle>
                <CardDescription>Automated demo orchestrator and database reset.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="w-full text-red-500 hover:text-red-600 hover:bg-red-500/10"
              onClick={resetDatabase}
              disabled={isResetting || isDemoRunning}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} /> Reset DB
            </Button>
            <Button
              className="w-full bg-violet-600 hover:bg-violet-700"
              disabled={!selectedVehicle || !deviceId || isDemoRunning}
              onClick={runDemoScript}
            >
              <Clapperboard className="mr-2 h-4 w-4" /> 
              {isDemoRunning ? 'Running Script...' : 'Run Demo Script'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hardware Configuration</CardTitle>
            <CardDescription>Select a vehicle that has an active SADAN device linked.</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedVehicleId} onValueChange={(val) => val && setSelectedVehicleId(val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a vehicle..." />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id} disabled={!v.device_id}>
                    {v.vehicle_number} {v.device_id ? '' : '(No Device)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedVehicle && !isDriving && (
              <Button
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={toggleDriving}
                disabled={!deviceId}
              >
                <Play className="mr-2 h-4 w-4" /> Start Trip (Send Heartbeats)
              </Button>
            )}

            {selectedVehicle && isDriving && (
              <Button
                className="mt-4 w-full"
                variant="destructive"
                onClick={toggleDriving}
              >
                <Square className="mr-2 h-4 w-4" /> End Trip
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Edge Detections</CardTitle>
            <CardDescription>Manually trigger safety ML events.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="outline"
              className="w-full justify-start border-red-500/30 hover:bg-red-500/10 hover:text-red-500"
              disabled={!selectedVehicle || !deviceId}
              onClick={() => triggerIncident('DROWSINESS')}
            >
              <EyeOff className="mr-2 h-4 w-4" /> Drowsiness
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-500"
              disabled={!selectedVehicle || !deviceId}
              onClick={() => triggerIncident('HARSH_BRAKING')}
            >
              <AlertTriangle className="mr-2 h-4 w-4" /> Harsh Braking
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start border-orange-500/30 hover:bg-orange-500/10 hover:text-orange-500"
              disabled={!selectedVehicle || !deviceId}
              onClick={() => triggerIncident('HARSH_ACCELERATION')}
            >
              <Activity className="mr-2 h-4 w-4" /> Harsh Accel
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Network State</CardTitle>
            <CardDescription>Simulate cellular connectivity loss.</CardDescription>
          </CardHeader>
          <CardContent>
            {networkStatus === 'ONLINE' ? (
              <Button
                variant="outline"
                className="w-full"
                disabled={!selectedVehicle || !deviceId}
                onClick={() => triggerIncident('DEVICE_OFFLINE')}
              >
                <WifiOff className="mr-2 h-4 w-4" /> Simulate Signal Loss
              </Button>
            ) : (
              <Button
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={!selectedVehicle || !deviceId}
                onClick={() => triggerIncident('DEVICE_RECOVERED')}
              >
                <Wifi className="mr-2 h-4 w-4" /> Simulate Reconnect
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-emerald-500" />
              Live Telemetry Feed
            </CardTitle>
            <CardDescription>
              Raw JSON payload being transmitted to the cloud.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex-1 rounded-md bg-zinc-950 p-4 border border-border/50 overflow-auto text-xs font-mono text-emerald-400 relative">
              {isSending && (
                <div className="absolute top-2 right-2 flex items-center gap-1.5 text-emerald-500/70">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Tx
                </div>
              )}
              <pre className="whitespace-pre-wrap">
                {lastPayload ? JSON.stringify(lastPayload, null, 2) : '// No telemetry sent yet... Select a vehicle and Start Trip.'}
              </pre>
            </div>

            <div className="rounded-md bg-muted/30 p-4 border border-border/50">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Backend Response</h3>
              <pre className="text-xs font-mono whitespace-pre-wrap text-zinc-300">
                {lastResponse ? JSON.stringify(lastResponse, null, 2) : '// Waiting for transmission...'}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
