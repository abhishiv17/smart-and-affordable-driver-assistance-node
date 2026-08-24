'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { navigationConfig } from '@/config/navigation';
import { LogoutButton } from '@/components/auth/logout-button';

/**
 * SADAN Sidebar — Digital Bauhaus editorial navigation.
 * Numbered items, ink background, minimal structure.
 */
export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-56 flex-col border-r bg-[var(--sidebar)] text-[var(--sidebar-foreground)]"
      style={{ borderColor: 'var(--sidebar-border)' }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-8">
        <h1 className="text-base font-bold tracking-[0.2em] uppercase">
          SADAN
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navigationConfig.map((group, groupIndex) => (
          <div key={groupIndex}>
            {groupIndex > 0 && (
              <hr className="my-4 border-t" style={{ borderColor: 'var(--sidebar-border)' }} />
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'sadan-nav-underline flex items-center gap-3 px-2 py-2 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'text-[var(--sidebar-foreground)]'
                      : 'text-[var(--sidebar-foreground)]/60 hover:text-[var(--sidebar-foreground)]'
                  )}
                  data-active={isActive}
                >
                  <span className="sadan-nav-number font-mono">{item.number}</span>
                  <span className="uppercase tracking-wider">{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-sm bg-[var(--color-sadan-critical)] px-1 text-[9px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 pb-5 space-y-4">
        <hr style={{ borderColor: 'var(--sidebar-border)' }} />

        {/* System Status */}
        <div className="flex items-center gap-2 py-1">
          <span className="sadan-status-dot sadan-status-dot--online" />
          <span className="text-[10px] uppercase tracking-[0.15em] text-[var(--sidebar-foreground)]/50">
            System Online
          </span>
        </div>

        <LogoutButton collapsed={false} />
      </div>
    </aside>
  );
}
