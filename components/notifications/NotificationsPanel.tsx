"use client";

import { Bell } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/use-notifications";

const severityColor: Record<string, string> = {
  CRITICAL: "text-red-500",
  WARNING: "text-amber-500",
  INFO: "text-blue-400",
};

export function NotificationsPanel() {
  const { alerts, unreadCount, acknowledge } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger className="relative">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
            {unreadCount}
          </Badge>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-96 bg-zinc-950 border-zinc-800 p-0">
        <div className="px-4 py-3 border-b border-zinc-800 font-semibold">Notifications</div>
        <div className="max-h-96 overflow-y-auto divide-y divide-zinc-800">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`px-4 py-3 flex justify-between gap-3 ${alert.acknowledged ? "opacity-50" : ""}`}
            >
              <div>
                <p className={`text-sm font-medium ${severityColor[alert.severity]}`}>{alert.message}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {alert.vehicle_id} · {new Date(alert.created_at).toLocaleTimeString()}
                </p>
              </div>
              {!alert.acknowledged && (
                <button
                  onClick={() => acknowledge(alert.id)}
                  className="text-xs text-zinc-400 hover:text-white shrink-0"
                >
                  Ack
                </button>
              )}
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="px-4 py-6 text-sm text-zinc-500 text-center">No alerts yet</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}