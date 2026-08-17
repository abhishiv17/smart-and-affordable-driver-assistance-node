import { useState, useRef, useCallback, useEffect } from 'react';
import type { TelemetrySubmission, TelemetryEventType } from '@/types/telemetry';
import type { DbVehicle } from '@/types/database';

interface UseSimulatorProps {
  vehicle: DbVehicle | null;
  deviceId: string | null;
}

export function useSimulator({ vehicle, deviceId }: UseSimulatorProps) {
  const [isDriving, setIsDriving] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [lastPayload, setLastPayload] = useState<TelemetrySubmission | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);

  // Keep track of current mock coordinates
  const currentLat = useRef<number | null>(null);
  const currentLng = useRef<number | null>(null);
  const driveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize coords from vehicle
  useEffect(() => {
    if (vehicle && vehicle.latitude !== null && vehicle.longitude !== null) {
      currentLat.current = vehicle.latitude;
      currentLng.current = vehicle.longitude;
    } else {
      // Default to Bangalore center if vehicle has no coords
      currentLat.current = 12.9716;
      currentLng.current = 77.5946;
    }
  }, [vehicle]);

  const sendTelemetry = useCallback(async (
    eventType: TelemetryEventType,
    overrideOverrides?: Partial<TelemetrySubmission['events'][0]>
  ) => {
    if (!vehicle || !deviceId) {
      console.error('Cannot send telemetry without selected vehicle and device');
      return;
    }

    setIsSending(true);

    // Simulate GPS movement (drive somewhat north-east if NORMAL)
    if (eventType === 'NORMAL' && currentLat.current && currentLng.current) {
      currentLat.current += 0.0001; // roughly 10 meters north
      currentLng.current += 0.0001; // roughly 10 meters east
    }

    const payload: TelemetrySubmission = {
      deviceId,
      submittedAt: new Date().toISOString(),
      events: [
        {
          id: crypto.randomUUID(),
          deviceId,
          vehicleId: vehicle.id,
          timestamp: new Date().toISOString(),
          latitude: currentLat.current ?? 12.9716,
          longitude: currentLng.current ?? 77.5946,
          speed: eventType === 'NORMAL' ? 45 : eventType === 'HARSH_BRAKING' ? 15 : 60,
          gForce: eventType === 'HARSH_BRAKING' ? 0.9 : eventType === 'HARSH_ACCELERATION' ? 0.8 : 0.1,
          drowsinessScore: eventType === 'DROWSINESS' ? 0.85 : 0.05,
          eyeAspectRatio: eventType === 'DROWSINESS' ? 0.15 : 0.35,
          eventType,
          networkStatus,
          ...overrideOverrides,
        },
      ],
    };

    setLastPayload(payload);

    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setLastResponse({ status: res.status, ...data });
    } catch (err) {
      setLastResponse({ status: 'error', error: String(err) });
    } finally {
      setIsSending(false);
    }
  }, [vehicle, deviceId, networkStatus]);

  const toggleDriving = useCallback(() => {
    setIsDriving((prev) => {
      const nextState = !prev;
      if (nextState) {
        // Start driving
        sendTelemetry('NORMAL');
        driveIntervalRef.current = setInterval(() => {
          sendTelemetry('NORMAL');
        }, 5000);
      } else {
        // Stop driving
        if (driveIntervalRef.current) {
          clearInterval(driveIntervalRef.current);
          driveIntervalRef.current = null;
        }
      }
      return nextState;
    });
  }, [sendTelemetry]);

  // Cleanup interval on unmount or vehicle change
  useEffect(() => {
    return () => {
      if (driveIntervalRef.current) {
        clearInterval(driveIntervalRef.current);
      }
    };
  }, [vehicle]);

  const triggerIncident = useCallback((eventType: TelemetryEventType) => {
    if (eventType === 'DEVICE_OFFLINE') {
      setNetworkStatus('OFFLINE');
      sendTelemetry(eventType, { networkStatus: 'OFFLINE' });
      return;
    }
    
    if (eventType === 'DEVICE_RECOVERED') {
      setNetworkStatus('ONLINE');
      sendTelemetry(eventType, { networkStatus: 'ONLINE' });
      return;
    }

    sendTelemetry(eventType);
  }, [sendTelemetry]);

  return {
    isDriving,
    toggleDriving,
    triggerIncident,
    networkStatus,
    lastPayload,
    lastResponse,
    isSending,
  };
}
