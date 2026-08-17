'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DriverForm } from '@/components/admin/driver-form';
import { Plus } from 'lucide-react';

/**
 * Client-side action buttons for the drivers page.
 */
export function DriverActions() {
  const [formOpen, setFormOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setFormOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        Add Driver
      </Button>

      <DriverForm open={formOpen} onOpenChange={setFormOpen} />
    </>
  );
}
