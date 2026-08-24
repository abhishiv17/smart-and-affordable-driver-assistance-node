"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// This must match the shape of the "alerts" table in types/database.ts exactly
export interface FleetAlert {
  id: string;
  vehicle_id: string;
  driver_id: string | null;
  type: "DROWSINESS" | "HARSH_BRAKING" | "HARSH_ACCELERATION" | "DEVICE_OFFLINE" | "DEVICE_RECOVERED";
  severity: "INFO" | "WARNING" | "CRITICAL";
  timestamp: string;
  latitude: number | null;
  longitude: number | null;
  message: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

export function useNotifications() {
  const [alerts, setAlerts] = useState<FleetAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function loadAlerts() {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setAlerts(data);
        setUnreadCount(data.filter((a) => !a.acknowledged).length);
      }
    }
    loadAlerts();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("alerts-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts" },
        (payload) => {
          const newAlert = payload.new as FleetAlert;
          setAlerts((prev) => [newAlert, ...prev].slice(0, 50));
          setUnreadCount((prev) => prev + 1);

          if (newAlert.severity === "CRITICAL") {
            toast.error(newAlert.message, { description: `Vehicle ${newAlert.vehicle_id}` });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function acknowledge(alertId: string) {
    await supabase
      .from("alerts")
      .update({ acknowledged: true, acknowledged_at: new Date().toISOString() })
      .eq("id", alertId);

    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true, acknowledged_at: new Date().toISOString() } : a))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }

  return { alerts, unreadCount, acknowledge };
}