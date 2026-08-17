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

interface DriverFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: {
    id: string;
    name: string;
    phone: string | null;
    status: string;
  };
}

/**
 * Slide-over form for creating/editing a driver.
 */
export function DriverForm({ open, onOpenChange, editData }: DriverFormProps) {
  const router = useRouter();
  const isEdit = !!editData;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editData) {
      setName(editData.name);
      setPhone(editData.phone ?? '');
    } else {
      setName('');
      setPhone('');
    }
    setError('');
  }, [editData, open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim() || null,
      };

      const url = isEdit ? `/api/drivers/${editData!.id}` : '/api/drivers';
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
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {isEdit ? <Pencil className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {isEdit ? 'Edit Driver' : 'Add Driver'}
          </SheetTitle>
          <SheetDescription>
            {isEdit ? 'Update driver details.' : 'Register a new driver for the fleet.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="driver-name">Name *</Label>
            <Input
              id="driver-name"
              placeholder="e.g. Rajesh Kumar"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver-phone">Phone</Label>
            <Input
              id="driver-phone"
              placeholder="e.g. +91-9876543210"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? 'Update Driver' : 'Add Driver'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
