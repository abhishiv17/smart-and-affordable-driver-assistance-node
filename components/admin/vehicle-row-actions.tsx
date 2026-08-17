'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VehicleForm } from '@/components/admin/vehicle-form';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

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
  const { confirm, dialogProps } = useConfirmDialog();

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${vehicle.vehicle_number}?`,
      description:
        'This will permanently delete the vehicle and remove all associated trips and alerts. This action cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Delete Vehicle',
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/vehicles/${vehicle.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Failed to delete vehicle:', err.message || err.error?.message);
        return;
      }

      router.refresh();
    } catch {
      console.error('Network error while deleting vehicle');
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

      <AlertDialog {...dialogProps} />
    </>
  );
}
