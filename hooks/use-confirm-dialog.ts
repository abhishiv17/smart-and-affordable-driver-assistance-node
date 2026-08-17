import { useState, useCallback, useRef } from 'react';

// =============================================================================
// useConfirmDialog — Promise-based Confirmation Hook
// =============================================================================
// Provides an async `confirm()` function that returns a Promise<boolean>.
// Renders the AlertDialog component inline in the component tree.
//
// Usage:
//   const { confirm, dialogProps } = useConfirmDialog();
//
//   async function handleDelete() {
//     const confirmed = await confirm({
//       title: 'Delete vehicle?',
//       description: 'This action cannot be undone.',
//     });
//     if (!confirmed) return;
//     // proceed...
//   }
//
//   return (
//     <>
//       {/* ... */}
//       <AlertDialog {...dialogProps} />
//     </>
//   );
// =============================================================================

export interface ConfirmOptions {
  /** Dialog title */
  title: string;
  /** Dialog body text */
  description?: string;
  /** Variant: 'destructive' | 'info' */
  variant?: 'destructive' | 'info';
  /** Confirm button text */
  confirmLabel?: string;
  /** Cancel button text */
  cancelLabel?: string;
}

interface DialogState {
  open: boolean;
  title: string;
  description?: string;
  variant: 'destructive' | 'info';
  confirmLabel: string;
  cancelLabel: string;
}

const DEFAULT_STATE: DialogState = {
  open: false,
  title: '',
  description: undefined,
  variant: 'destructive',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
};

/**
 * Hook that provides an async `confirm()` function and props to render
 * the AlertDialog component. Call `confirm(options)` to open the dialog
 * and await the user's response.
 */
export function useConfirmDialog() {
  const [state, setState] = useState<DialogState>(DEFAULT_STATE);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setState({
        open: true,
        title: options.title,
        description: options.description,
        variant: options.variant ?? 'destructive',
        confirmLabel: options.confirmLabel ?? 'Confirm',
        cancelLabel: options.cancelLabel ?? 'Cancel',
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef.current?.(true);
    resolveRef.current = null;
    setState(DEFAULT_STATE);
  }, []);

  const handleCancel = useCallback(() => {
    resolveRef.current?.(false);
    resolveRef.current = null;
    setState(DEFAULT_STATE);
  }, []);

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) {
      handleCancel();
    }
  }, [handleCancel]);

  const dialogProps = {
    open: state.open,
    onOpenChange: handleOpenChange,
    title: state.title,
    description: state.description,
    variant: state.variant,
    confirmLabel: state.confirmLabel,
    cancelLabel: state.cancelLabel,
    onConfirm: handleConfirm,
    onCancel: handleCancel,
  };

  return { confirm, dialogProps };
}
