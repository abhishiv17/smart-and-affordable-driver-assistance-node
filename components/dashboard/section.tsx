import { cn } from '@/lib/utils';

interface SectionProps {
  /** Section title */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Optional right-side actions */
  actions?: React.ReactNode;
  /** Section content */
  children: React.ReactNode;
  /** Additional class */
  className?: string;
}

/**
 * Section container with consistent title, subtitle, and spacing.
 * Provides visual grouping for dashboard sections.
 */
export function Section({
  title,
  subtitle,
  actions,
  children,
  className,
}: SectionProps) {
  return (
    <section className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground/70">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {children}
    </section>
  );
}
