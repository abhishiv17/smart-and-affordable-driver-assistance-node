/**
 * Page header — Digital Bauhaus.
 * Large uppercase title with optional description and accent line.
 */
export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
            {title}
          </h1>
          <span className="sadan-accent-line" />
          {description && (
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}
