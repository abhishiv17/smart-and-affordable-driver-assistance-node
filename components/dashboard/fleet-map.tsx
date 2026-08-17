'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// =============================================================================
// Types
// =============================================================================

export interface MapVehicleMarker {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE';
}

interface FleetMapProps {
  /** Vehicle markers to display */
  markers?: MapVehicleMarker[];
  /** Map center [lng, lat] */
  center?: [number, number];
  /** Initial zoom level */
  zoom?: number;
  /** Map height */
  height?: string;
  /** Additional class */
  className?: string;
  /** Called when a marker is clicked */
  onMarkerClick?: (vehicleId: string) => void;
}

// =============================================================================
// Status → Color
// =============================================================================

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#34d399',    // emerald-400
  IDLE: '#fbbf24',      // amber-400
  OFFLINE: '#71717a',   // zinc-500
  MAINTENANCE: '#60a5fa', // blue-400
};

// =============================================================================
// Component
// =============================================================================

/**
 * Fleet map component using MapLibre GL.
 * Shows vehicle markers with status-colored pins on a dark-themed map.
 */
export function FleetMap({
  markers = [],
  center = [77.5946, 12.9716], // Bangalore default
  zoom = 10,
  height = '400px',
  className,
  onMarkerClick,
}: FleetMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const envStyle = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
    const mapStyle = (envStyle && envStyle.startsWith('http'))
      ? envStyle
      : 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center,
      zoom,
      attributionControl: false,
    });

    map.current.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-right'
    );

    return () => {
      map.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach(vehicle => {
      const color = STATUS_COLORS[vehicle.status] ?? STATUS_COLORS.OFFLINE;

      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'fleet-marker';
      el.style.cssText = `
        width: 12px;
        height: 12px;
        background-color: ${color};
        border: 2px solid rgba(0,0,0,0.5);
        border-radius: 50%;
        cursor: pointer;
        box-shadow: 0 0 6px ${color}80;
      `;

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 12, closeButton: false })
            .setHTML(`
              <div style="font-family: system-ui; padding: 4px 0;">
                <div style="font-weight: 600; font-size: 12px;">${vehicle.label}</div>
                <div style="font-size: 11px; opacity: 0.7;">${vehicle.status}</div>
              </div>
            `)
        )
        .addTo(map.current!);

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(vehicle.id));
      }

      markersRef.current.push(marker);
    });
  }, [markers, onMarkerClick]);

  return (
    <div
      ref={mapContainer}
      className={cn('rounded-lg overflow-hidden border border-border', className)}
      style={{ height }}
    />
  );
}
