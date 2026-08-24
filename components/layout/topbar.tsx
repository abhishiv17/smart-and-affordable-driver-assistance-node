'use client';

import { usePathname } from 'next/navigation';
import { navigationConfig } from '@/config/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel';
import { useSearchContext } from '@/components/search/SearchProvider';

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
 * Top navigation bar for the SADAN dashboard.
 * Shows breadcrumb, search, notifications, and user avatar.
 */
export function Topbar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { setOpen } = useSearchContext();
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-6">
      {/* Breadcrumb / Page context */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">SADAN</span>
        <span className="text-sm text-muted-foreground/50">/</span>
        <span className="text-sm font-medium text-foreground">{pageTitle}</span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Search"
          onClick={() => setOpen(true)}
        >
          <Search className="h-4 w-4" />
        </Button>

        {/* Notifications */}
<NotificationsPanel />

        <Separator orientation="vertical" className="h-6" />

        {/* System status */}
        <Badge variant="outline" className="gap-1.5 text-[11px] font-normal">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Online
        </Badge>

        <Separator orientation="vertical" className="h-6" />

        {/* User avatar — Phase 2+: will show authenticated user */}
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-muted text-[11px] font-semibold text-muted-foreground">
            SA
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
