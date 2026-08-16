// =============================================================================
// Database Types — Supabase Schema (Generated from migrations)
// =============================================================================
// These types represent the PostgreSQL schema exactly as defined in
// supabase/migrations/001_initial_schema.sql.
//
// After applying migrations, these can be regenerated with:
//   npx supabase gen types typescript --project-id mboyjhstnzrfzrlwsouv > types/database.ts
//
// DO NOT manually edit if using the generation workflow.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      fleets: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      fleet_members: {
        Row: {
          id: string;
          fleet_id: string;
          user_id: string;
          role: 'OWNER' | 'ADMIN' | 'OPERATOR' | 'VIEWER';
          created_at: string;
        };
        Insert: {
          id?: string;
          fleet_id: string;
          user_id: string;
          role: 'OWNER' | 'ADMIN' | 'OPERATOR' | 'VIEWER';
          created_at?: string;
        };
        Update: {
          id?: string;
          fleet_id?: string;
          user_id?: string;
          role?: 'OWNER' | 'ADMIN' | 'OPERATOR' | 'VIEWER';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fleet_members_fleet_id_fkey';
            columns: ['fleet_id'];
            referencedRelation: 'fleets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'fleet_members_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      drivers: {
        Row: {
          id: string;
          fleet_id: string;
          name: string;
          phone: string | null;
          status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fleet_id: string;
          name: string;
          phone?: string | null;
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          fleet_id?: string;
          name?: string;
          phone?: string | null;
          status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'drivers_fleet_id_fkey';
            columns: ['fleet_id'];
            referencedRelation: 'fleets';
            referencedColumns: ['id'];
          },
        ];
      };
      devices: {
        Row: {
          id: string;
          vehicle_id: string | null;
          device_serial: string;
          firmware_version: string;
          connectivity_status: 'ONLINE' | 'OFFLINE';
          last_seen: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id?: string | null;
          device_serial: string;
          firmware_version?: string;
          connectivity_status?: 'ONLINE' | 'OFFLINE';
          last_seen?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string | null;
          device_serial?: string;
          firmware_version?: string;
          connectivity_status?: 'ONLINE' | 'OFFLINE';
          last_seen?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_devices_vehicle_id';
            columns: ['vehicle_id'];
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
        ];
      };
      vehicles: {
        Row: {
          id: string;
          fleet_id: string;
          vehicle_number: string;
          model: string | null;
          driver_id: string | null;
          device_id: string | null;
          status: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE';
          safety_score: number | null;
          latitude: number | null;
          longitude: number | null;
          last_seen: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          fleet_id: string;
          vehicle_number: string;
          model?: string | null;
          driver_id?: string | null;
          device_id?: string | null;
          status?: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE';
          safety_score?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          last_seen?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          fleet_id?: string;
          vehicle_number?: string;
          model?: string | null;
          driver_id?: string | null;
          device_id?: string | null;
          status?: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE';
          safety_score?: number | null;
          latitude?: number | null;
          longitude?: number | null;
          last_seen?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'vehicles_fleet_id_fkey';
            columns: ['fleet_id'];
            referencedRelation: 'fleets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vehicles_driver_id_fkey';
            columns: ['driver_id'];
            referencedRelation: 'drivers';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'vehicles_device_id_fkey';
            columns: ['device_id'];
            referencedRelation: 'devices';
            referencedColumns: ['id'];
          },
        ];
      };
      trips: {
        Row: {
          id: string;
          vehicle_id: string;
          driver_id: string | null;
          started_at: string;
          ended_at: string | null;
          distance: number | null;
          safety_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          driver_id?: string | null;
          started_at: string;
          ended_at?: string | null;
          distance?: number | null;
          safety_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          driver_id?: string | null;
          started_at?: string;
          ended_at?: string | null;
          distance?: number | null;
          safety_score?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'trips_vehicle_id_fkey';
            columns: ['vehicle_id'];
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'trips_driver_id_fkey';
            columns: ['driver_id'];
            referencedRelation: 'drivers';
            referencedColumns: ['id'];
          },
        ];
      };
      telemetry: {
        Row: {
          id: string;
          device_id: string | null;
          vehicle_id: string | null;
          timestamp: string;
          latitude: number;
          longitude: number;
          speed: number;
          g_force: number;
          drowsiness_score: number;
          eye_aspect_ratio: number;
          event_type: 'NORMAL' | 'DROWSINESS' | 'HARSH_BRAKING' | 'HARSH_ACCELERATION' | 'DEVICE_OFFLINE' | 'DEVICE_RECOVERED';
          network_status: 'ONLINE' | 'OFFLINE';
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id?: string | null;
          vehicle_id?: string | null;
          timestamp: string;
          latitude: number;
          longitude: number;
          speed: number;
          g_force: number;
          drowsiness_score: number;
          eye_aspect_ratio: number;
          event_type: 'NORMAL' | 'DROWSINESS' | 'HARSH_BRAKING' | 'HARSH_ACCELERATION' | 'DEVICE_OFFLINE' | 'DEVICE_RECOVERED';
          network_status: 'ONLINE' | 'OFFLINE';
          created_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string | null;
          vehicle_id?: string | null;
          timestamp?: string;
          latitude?: number;
          longitude?: number;
          speed?: number;
          g_force?: number;
          drowsiness_score?: number;
          eye_aspect_ratio?: number;
          event_type?: 'NORMAL' | 'DROWSINESS' | 'HARSH_BRAKING' | 'HARSH_ACCELERATION' | 'DEVICE_OFFLINE' | 'DEVICE_RECOVERED';
          network_status?: 'ONLINE' | 'OFFLINE';
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'telemetry_device_id_fkey';
            columns: ['device_id'];
            referencedRelation: 'devices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'telemetry_vehicle_id_fkey';
            columns: ['vehicle_id'];
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
        ];
      };
      alerts: {
        Row: {
          id: string;
          vehicle_id: string;
          driver_id: string | null;
          type: 'DROWSINESS' | 'HARSH_BRAKING' | 'HARSH_ACCELERATION' | 'DEVICE_OFFLINE' | 'DEVICE_RECOVERED';
          severity: 'INFO' | 'WARNING' | 'CRITICAL';
          timestamp: string;
          latitude: number | null;
          longitude: number | null;
          message: string;
          acknowledged: boolean;
          acknowledged_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          vehicle_id: string;
          driver_id?: string | null;
          type: 'DROWSINESS' | 'HARSH_BRAKING' | 'HARSH_ACCELERATION' | 'DEVICE_OFFLINE' | 'DEVICE_RECOVERED';
          severity: 'INFO' | 'WARNING' | 'CRITICAL';
          timestamp: string;
          latitude?: number | null;
          longitude?: number | null;
          message: string;
          acknowledged?: boolean;
          acknowledged_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          vehicle_id?: string;
          driver_id?: string | null;
          type?: 'DROWSINESS' | 'HARSH_BRAKING' | 'HARSH_ACCELERATION' | 'DEVICE_OFFLINE' | 'DEVICE_RECOVERED';
          severity?: 'INFO' | 'WARNING' | 'CRITICAL';
          timestamp?: string;
          latitude?: number | null;
          longitude?: number | null;
          message?: string;
          acknowledged?: boolean;
          acknowledged_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'alerts_vehicle_id_fkey';
            columns: ['vehicle_id'];
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'alerts_driver_id_fkey';
            columns: ['driver_id'];
            referencedRelation: 'drivers';
            referencedColumns: ['id'];
          },
        ];
      };
      ai_reports: {
        Row: {
          id: string;
          fleet_id: string;
          vehicle_id: string | null;
          period_start: string;
          period_end: string;
          summary: string | null;
          risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
          key_findings: Json | null;
          recommendations: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fleet_id: string;
          vehicle_id?: string | null;
          period_start: string;
          period_end: string;
          summary?: string | null;
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
          key_findings?: Json | null;
          recommendations?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          fleet_id?: string;
          vehicle_id?: string | null;
          period_start?: string;
          period_end?: string;
          summary?: string | null;
          risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
          key_findings?: Json | null;
          recommendations?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ai_reports_fleet_id_fkey';
            columns: ['fleet_id'];
            referencedRelation: 'fleets';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ai_reports_vehicle_id_fkey';
            columns: ['vehicle_id'];
            referencedRelation: 'vehicles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_user_fleet_ids: {
        Args: Record<string, never>;
        Returns: string[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// =============================================================================
// Convenience Type Helpers
// =============================================================================

/** Extract the Row type for a given table name */
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

/** Extract the Insert type for a given table name */
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

/** Extract the Update type for a given table name */
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// =============================================================================
// Table-specific type aliases for convenience
// =============================================================================
export type DbFleet = Tables<'fleets'>;
export type DbFleetMember = Tables<'fleet_members'>;
export type DbDriver = Tables<'drivers'>;
export type DbDevice = Tables<'devices'>;
export type DbVehicle = Tables<'vehicles'>;
export type DbTrip = Tables<'trips'>;
export type DbTelemetry = Tables<'telemetry'>;
export type DbAlert = Tables<'alerts'>;
export type DbAiReport = Tables<'ai_reports'>;

// Insert types
export type DbFleetInsert = TablesInsert<'fleets'>;
export type DbDriverInsert = TablesInsert<'drivers'>;
export type DbDeviceInsert = TablesInsert<'devices'>;
export type DbVehicleInsert = TablesInsert<'vehicles'>;
export type DbTripInsert = TablesInsert<'trips'>;
export type DbTelemetryInsert = TablesInsert<'telemetry'>;
export type DbAlertInsert = TablesInsert<'alerts'>;
export type DbAiReportInsert = TablesInsert<'ai_reports'>;

// Update types
export type DbFleetUpdate = TablesUpdate<'fleets'>;
export type DbDriverUpdate = TablesUpdate<'drivers'>;
export type DbDeviceUpdate = TablesUpdate<'devices'>;
export type DbVehicleUpdate = TablesUpdate<'vehicles'>;
export type DbTripUpdate = TablesUpdate<'trips'>;
export type DbAlertUpdate = TablesUpdate<'alerts'>;
export type DbAiReportUpdate = TablesUpdate<'ai_reports'>;
