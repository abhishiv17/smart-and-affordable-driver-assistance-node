'use client';

import { useState } from 'react';
import { useSimulator } from '@/hooks/use-simulator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Square, AlertTriangle, Radio, WifiOff, Wifi, EyeOff, Activity } from 'lucide-react';
import type { DbVehicle } from '@/types/database';

interface SimulatorClientProps {
  vehicles: DbVehicle[];
}

export function SimulatorClient({ vehicles }: SimulatorClientProps) {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');

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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-6">
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
