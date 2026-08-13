// =============================================================================
// Date Utilities
// =============================================================================

/**
 * Format an ISO date string for display.
 */
export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/**
 * Format an ISO date string to show only the date.
 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });
}

/**
 * Format an ISO date string to show only the time.
 */
export function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-IN', {
    timeStyle: 'short',
  });
}

/**
 * Get a relative time string (e.g., "2 minutes ago").
 */
export function formatRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSeconds = Math.floor((now - then) / 1000);

  if (diffSeconds < 60) return 'Just now';
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
  if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

  return formatDate(isoString);
}

/**
 * Get current ISO timestamp.
 */
export function nowISO(): string {
  return new Date().toISOString();
}
