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
import { Loader2, Plus } from 'lucide-react';

interface DeviceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Slide-over form for registering a new SADAN device (black box).
 */
export function DeviceForm({ open, onOpenChange }: DeviceFormProps) {
  const router = useRouter();

  const [serial, setSerial] = useState('');
  const [firmware, setFirmware] = useState('1.2.0');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setSerial('');
      setFirmware('1.2.0');
      setError('');
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_serial: serial.trim(),
          firmware_version: firmware.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error?.message ?? 'Failed to register device');
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
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Register SADAN Device
          </SheetTitle>
          <SheetDescription>
            Register a new SADAN black box unit. It will appear as available when linking to a vehicle.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="device-serial">Device Serial *</Label>
            <Input
              id="device-serial"
              placeholder="e.g. DG-SN-011"
              value={serial}
              onChange={e => setSerial(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firmware">Firmware Version</Label>
            <Input
              id="firmware"
              placeholder="e.g. 1.2.0"
              value={firmware}
              onChange={e => setFirmware(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Register Device
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
