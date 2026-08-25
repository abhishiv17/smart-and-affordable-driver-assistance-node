'use client';

// =============================================================================
// AlertDialog — Confirmation Modal Component
// =============================================================================
// A polished confirmation dialog to replace browser confirm() / alert().
// Uses native HTML <dialog> element for accessibility (focus trap, Esc to close).
// =============================================================================

import { cn } from '@/lib/utils';
import { AlertTriangle, Info, X } from 'lucide-react';
import { useRef, useEffect, useCallback } from 'react';

// =============================================================================
// Types
// =============================================================================

export interface AlertDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog should close */
  onOpenChange: (open: boolean) => void;
  /** Dialog title */
  title: string;
  /** Dialog description / body text */
  description?: string;
  /** Variant controls the icon and accent color */
  variant?: 'destructive' | 'info';
  /** Text for the confirm button */
  confirmLabel?: string;
  /** Text for the cancel button */
  cancelLabel?: string;
  /** Called when the user confirms */
  onConfirm?: () => void;
  /** Called when the user cancels */
  onCancel?: () => void;
  /** Whether the confirm button is in a loading state */
  isLoading?: boolean;
}

// =============================================================================
// Component
// =============================================================================

export function AlertDialog({
  open,
  onOpenChange,
  title,
  description,
  variant = 'destructive',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}: AlertDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync open state with the native dialog
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Handle native close event (e.g., Esc key)
  const handleClose = useCallback(() => {
    onOpenChange(false);
    onCancel?.();
  }, [onOpenChange, onCancel]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        handleClose();
      }
    },
    [handleClose]
  );

  const handleConfirm = useCallback(() => {
    onConfirm?.();
  }, [onConfirm]);

  const isDestructive = variant === 'destructive';
  const Icon = isDestructive ? AlertTriangle : Info;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className={cn(
        // Reset native dialog styles
        'fixed inset-0 z-50 m-auto',
        'w-full max-w-md rounded-xl border border-border/60',
        'bg-card p-0 shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        // Ensure it appears above everything
        'open:flex open:flex-col',
      )}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
              isDestructive
                ? 'bg-red-500/10 text-red-400'
                : 'bg-blue-500/10 text-blue-400'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-4 py-2',
              'text-sm font-medium text-muted-foreground',
              'border border-border/60 bg-transparent',
              'hover:bg-muted/50 hover:text-foreground',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:opacity-50 disabled:pointer-events-none',
            )}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'inline-flex items-center justify-center rounded-lg px-4 py-2',
              'text-sm font-medium text-white',
              'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              'disabled:opacity-50 disabled:pointer-events-none',
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 focus-visible:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus-visible:ring-blue-500',
            )}
          >
            {isLoading && (
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
