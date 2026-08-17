'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Pencil } from 'lucide-react';

interface Driver {
  id: string;
  name: string;
  status: string;
}

interface Device {
  id: string;
  device_serial: string;
  vehicle_id: string | null;
}

interface VehicleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If provided, editing an existing vehicle */
  editData?: {
    id: string;
    vehicle_number: string;
    model: string | null;
    driver_id: string | null;
    device_id: string | null;
  };
}

/**
 * Slide-over form for creating/editing a vehicle.
 * Fetches available drivers and unlinked devices for assignment.
 */
export function VehicleForm({ open, onOpenChange, editData }: VehicleFormProps) {
  const router = useRouter();
  const isEdit = !!editData;

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [model, setModel] = useState('');
  const [driverId, setDriverId] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  // Pre-fill form when editing
  useEffect(() => {
    if (editData) {
      setVehicleNumber(editData.vehicle_number);
      setModel(editData.model ?? '');
      setDriverId(editData.driver_id ?? '');
      setDeviceId(editData.device_id ?? '');
    } else {
      setVehicleNumber('');
      setModel('');
      setDriverId('');
      setDeviceId('');
    }
    setError('');
  }, [editData, open]);

  // Fetch available drivers and devices when sheet opens
  useEffect(() => {
    if (!open) return;

    fetch('/api/drivers?status=ACTIVE')
      .then(r => r.json())
      .then(res => setDrivers(res.data ?? []))
      .catch(() => {});

    fetch('/api/devices?unlinked=true')
      .then(r => r.json())
      .then(res => {
        let available: Device[] = res.data ?? [];
        // If editing, include the currently linked device
        if (editData?.device_id) {
          const currentLinked = available.find(d => d.id === editData.device_id);
          if (!currentLinked) {
            // Fetch it separately — it's linked to this vehicle so not "unlinked"
            fetch(`/api/devices`)
              .then(r => r.json())
              .then(allRes => {
                const all: Device[] = allRes.data ?? [];
                const current = all.find(d => d.id === editData.device_id);
                if (current) available = [current, ...available];
                setDevices(available);
              })
              .catch(() => setDevices(available));
            return;
          }
        }
        setDevices(available);
      })
      .catch(() => {});
  }, [open, editData]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        vehicle_number: vehicleNumber.trim(),
        model: model.trim() || null,
        driver_id: driverId || null,
        device_id: deviceId || null,
      };

      const url = isEdit ? `/api/vehicles/${editData!.id}` : '/api/vehicles';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message ?? 'Failed to save');
        return;
      }

      onOpenChange(false);
      router.refresh();
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Edit Vehicle' : 'Add Vehicle'}
          </SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update vehicle details and assignments.' : 'Register a new vehicle and link it to a SADAN device.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="vehicle-number">Vehicle Number *</Label>
            <Input
              id="vehicle-number"
              placeholder="e.g. TRK-11"
              value={vehicleNumber}
              onChange={e => setVehicleNumber(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              placeholder="e.g. Tata Ace Gold"
              value={model}
              onChange={e => setModel(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver">Assign Driver</Label>
            <select
              id="driver"
              value={driverId}
              onChange={e => setDriverId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">— No driver —</option>
              {drivers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="device">Link SADAN Device</Label>
            <select
              id="device"
              value={deviceId}
              onChange={e => setDeviceId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">— No device —</option>
              {devices.map(d => (
                <option key={d.id} value={d.id}>{d.device_serial}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Update Vehicle' : 'Add Vehicle'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
