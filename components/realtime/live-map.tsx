'use client';

import { useRealtimeVehicles } from '@/hooks/use-realtime-vehicles';
import { FleetMap, MapVehicleMarker } from '@/components/dashboard/fleet-map';
import { useRouter } from 'next/navigation';
import type { DbVehicle } from '@/types/database';

interface LiveMapProps {
  initialVehicles: DbVehicle[];
}

/**
 * Client-side Live Map wrapper.
 * Subscribes to vehicle position and status updates in real time.
 */
export function LiveMap({ initialVehicles }: LiveMapProps) {
  const router = useRouter();
  const { vehicles } = useRealtimeVehicles(initialVehicles);

  // Filter vehicles that have a known location
  const markers: MapVehicleMarker[] = vehicles
    .filter((v) => v.latitude !== null && v.longitude !== null)
    .map((v) => ({
      id: v.id,
      label: v.vehicle_number,
      latitude: v.latitude!,
      longitude: v.longitude!,
      status: v.status,
    }));

  return (
    <div className="h-full w-full">
      <FleetMap
        markers={markers}
        height="100%"
        className="rounded-none border-0"
        onMarkerClick={(vehicleId) => {
          router.push(`/vehicles/${vehicleId}`);
        }}
      />
    </div>
  );
}
