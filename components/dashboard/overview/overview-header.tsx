'use client';

// =============================================================================
// Overview Header — Compact Greeting + Date
// =============================================================================

/**
 * Compact header for the Overview page.
 * Dynamic greeting based on time of day + formatted date.
 */
export function OverviewHeader() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const dateStr = new Date()
    .toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase();

  return (
    <div className="mb-6">
      <p className="text-sm text-muted-foreground">{greeting}.</p>
      <p className="sadan-label mt-0.5">{dateStr}</p>
      <hr className="sadan-divider mt-4" />
    </div>
  );
}
