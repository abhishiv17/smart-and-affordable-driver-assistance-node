'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

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
  ACTIVE: '#2F684A',    // Bauhaus success
  IDLE: '#D49A27',      // Bauhaus warning
  OFFLINE: '#77756F',   // Bauhaus muted gray
  MAINTENANCE: '#3157A5', // Bauhaus blue
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
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (mapboxToken) {
      mapboxgl.accessToken = mapboxToken;
    } else {
      console.warn('Mapbox token is missing! Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env file.');
    }
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom,
      pitch: 45, // Isometric 3D angle
      bearing: -10, // Slight tilt
      attributionControl: false,
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
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

      // Create premium glowing marker element
      const el = document.createElement('div');
      el.className = 'fleet-marker relative flex items-center justify-center';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.cursor = 'pointer';

      // Inner dot
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 12px;
        height: 12px;
        background-color: ${color};
        border: 2px solid #F4F1E8;
        border-radius: 50%;
        box-shadow: 0 1px 4px rgba(0,0,0,0.15);
        z-index: 2;
      `;
      el.appendChild(dot);

      // Pulsing ring for active vehicles
      if (vehicle.status === 'ACTIVE') {
        const ring = document.createElement('div');
        ring.className = 'absolute inset-0 rounded-full animate-ping';
        ring.style.backgroundColor = color;
        ring.style.opacity = '0.4';
        ring.style.zIndex = '1';
        el.appendChild(ring);
      }

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([vehicle.longitude, vehicle.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 12, closeButton: false })
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
