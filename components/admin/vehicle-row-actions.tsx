'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VehicleForm } from '@/components/admin/vehicle-form';

interface VehicleRowActionsProps {
  vehicle: {
    id: string;
    vehicle_number: string;
    model: string | null;
    driver_id: string | null;
    device_id: string | null;
  };
}

export function VehicleRowActions({ vehicle }: VehicleRowActionsProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this vehicle? This will also remove associated trips and alerts.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.message || err.error?.message || 'Failed to delete vehicle');
        return;
      }

      router.refresh();
    } catch (err) {
      alert('Network error while deleting vehicle');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          disabled={isDeleting}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setFormOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <VehicleForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editData={vehicle}
      />
    </>
  );
}
