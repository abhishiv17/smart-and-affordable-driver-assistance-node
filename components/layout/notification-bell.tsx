'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRealtimeAlerts } from '@/hooks/use-realtime-alerts';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { formatRelativeTime } from '@/lib/utils/formatters';
import Link from 'next/link';
import type { DbAlert } from '@/types/database';

export function NotificationBell() {
  const [initialAlerts, setInitialAlerts] = useState<DbAlert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(5);
      if (data) setInitialAlerts(data);
    };
    fetchAlerts();
  }, []);

  const { alerts } = useRealtimeAlerts(initialAlerts, 5);
  const unreadCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <button className="relative flex items-center justify-center h-7 w-7 rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground outline-none">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-sadan-critical)] animate-pulse" />
          )}
        </button>
      } />
      <DropdownMenuContent align="end" className="w-80 p-0 rounded-sm">
        <div className="font-semibold uppercase tracking-wider text-xs flex items-center justify-between p-3">
          Notifications
          <span className="text-[10px] text-muted-foreground font-normal normal-case">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          </span>
        </div>
        <DropdownMenuSeparator className="m-0" />
        {alerts.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">No recent notifications</div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {alerts.map(alert => (
              <DropdownMenuItem key={alert.id} className="p-3 cursor-pointer rounded-none border-b border-border/50 last:border-b-0 focus:bg-muted/50" render={
                <Link href={`/alerts/${alert.id}`} className="flex flex-col gap-1 items-start w-full outline-none">
                  <div className="flex items-center gap-2">
                    <span 
                      className="sadan-status-dot" 
                      style={{ 
                        backgroundColor: alert.severity === 'CRITICAL' ? 'var(--color-sadan-critical)' : 
                                         alert.severity === 'WARNING' ? 'var(--color-sadan-warning)' : 
                                         'var(--color-bauhaus-blue)' 
                      }} 
                    />
                    <span className="text-xs font-semibold">{alert.message}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground pl-3">
                    {formatRelativeTime(alert.timestamp)}
                  </span>
                </Link>
              } />
            ))}
          </div>
        )}
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem className="cursor-pointer justify-center text-[10px] font-bold uppercase tracking-wider text-primary p-3 rounded-none focus:bg-muted/50" render={
          <Link href="/alerts" className="w-full text-center outline-none">View All Alerts →</Link>
        } />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
