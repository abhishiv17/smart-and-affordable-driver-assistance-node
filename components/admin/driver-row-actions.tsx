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
import { DriverForm } from '@/components/admin/driver-form';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

interface DriverRowActionsProps {
  driver: {
    id: string;
    name: string;
    phone: string | null;
    status: string;
  };
}

export function DriverRowActions({ driver }: DriverRowActionsProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { confirm, dialogProps } = useConfirmDialog();

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete ${driver.name}?`,
      description:
        'This will permanently remove the driver from the fleet. This action cannot be undone.',
      variant: 'destructive',
      confirmLabel: 'Delete Driver',
    });
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/drivers/${driver.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const err = await res.json();
        console.error('Failed to delete driver:', err.message || err.error?.message);
        return;
      }

      router.refresh();
    } catch {
      console.error('Network error while deleting driver');
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

      <DriverForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editData={driver}
      />

      <AlertDialog {...dialogProps} />
    </>
  );
}
