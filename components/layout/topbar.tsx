'use client';

import { usePathname } from 'next/navigation';
import { navigationConfig } from '@/config/navigation';
import { GlobalSearch } from './global-search';
import { NotificationBell } from './notification-bell';

/**
 * Resolve the current page title from the pathname using navigation config.
 */
function getPageTitle(pathname: string): string {
  for (const group of navigationConfig) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(item.href + '/')) {
        return item.label;
      }
    }
  }
  return 'SADAN';
}

/**
 * Top navigation bar — Digital Bauhaus.
 * Clean breadcrumb, search, user initials.
 */
export function Topbar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { setOpen } = useSearchContext();
  return (
    <header className="flex h-12 items-center gap-4 border-b border-border bg-background px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          SADAN
        </span>
        <span className="text-xs text-muted-foreground/40">/</span>
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
          {pageTitle}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <GlobalSearch />

        {/* Divider */}
        <div className="h-4 w-px bg-border" />

        {/* Notifications */}
        <NotificationBell />

        {/* User */}
        <div className="h-7 w-7 rounded-full bg-foreground flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
          <span className="text-[10px] font-bold text-background">A</span>
        </div>
      </div>
    </header>
  );
}
