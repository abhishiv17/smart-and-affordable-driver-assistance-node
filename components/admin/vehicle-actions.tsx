'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { VehicleForm } from '@/components/admin/vehicle-form';
import { DeviceForm } from '@/components/admin/device-form';
import { Plus, Radio } from 'lucide-react';

/**
 * Client-side action buttons for the vehicles page.
 * Manages form sheet open state.
 */
export function VehicleActions() {
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [deviceFormOpen, setDeviceFormOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setDeviceFormOpen(true)}
        >
          <Radio className="mr-2 h-4 w-4" />
          Register Device
        </Button>
        <Button
          size="sm"
          onClick={() => setVehicleFormOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <VehicleForm open={vehicleFormOpen} onOpenChange={setVehicleFormOpen} />
      <DeviceForm open={deviceFormOpen} onOpenChange={setDeviceFormOpen} />
    </>
  );
}
