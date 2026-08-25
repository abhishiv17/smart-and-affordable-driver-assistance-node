/**
 * Page header — Digital Bauhaus.
 * Large uppercase title with optional description and accent line.
 */
'use client';

import { useTranslation } from '@/components/layout/language-provider';
import type { TranslationKey } from '@/lib/translations';

export function PageHeader({
  titleKey,
  descriptionKey,
  actions,
}: {
  titleKey: TranslationKey;
  descriptionKey?: TranslationKey;
  actions?: React.ReactNode;
}) {
  const { t } = useTranslation();

  return (
    <div className="mb-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">
            {t(titleKey)}
          </h1>
          <span className="sadan-accent-line" />
          {descriptionKey && (
            <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
              {t(descriptionKey)}
            </p>
          )}
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </div>
  );
}