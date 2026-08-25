'use client';

// =============================================================================
// Fleet Map — 3D Vehicle Markers on Mapbox GL
// =============================================================================
// Replaces simple colored dots with procedural low-poly 3D trucks rendered
// via Three.js custom layer on Mapbox GL.
//
// Features:
//   - Procedural mini truck geometry (~100 vertices per vehicle)
//   - Status-colored ground halo beneath each truck
//   - Hover → popup with vehicle info
//   - Click → onMarkerClick callback
//   - Zoom-responsive scaling
//   - Smooth position transitions on coordinate updates
//
// The procedural truck can be replaced with a real GLB model by setting
// MODEL_URL to a path like '/models/truck.glb'.
// =============================================================================

import { cn } from '@/lib/utils';
import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import * as THREE from 'three';

// =============================================================================
// Types
// =============================================================================

export interface MapVehicleMarker {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  status: 'ACTIVE' | 'IDLE' | 'OFFLINE' | 'MAINTENANCE';
  safetyScore?: number | null;
  model?: string | null;
}

interface FleetMapProps {
  markers?: MapVehicleMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
  className?: string;
  onMarkerClick?: (vehicleId: string) => void;
}

// =============================================================================
// Constants
// =============================================================================

const STATUS_COLORS: Record<string, number> = {
  ACTIVE: 0x2f684a,
  IDLE: 0xd49a27,
  OFFLINE: 0x77756f,
  MAINTENANCE: 0x3157a5,
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  IDLE: 'Idle',
  OFFLINE: 'Offline',
  MAINTENANCE: 'Maintenance',
};

const CRITICAL_COLOR = 0xc0392b;

// Base model scale. 40 means the 4-unit truck model is effectively 160 meters long 
// at base zoom. We dynamically scale this based on camera zoom so it remains visible.
const BASE_MODEL_SCALE = 40;

// =============================================================================
// Procedural Truck Geometry
// =============================================================================

/**
 * Creates a low-poly mini commercial truck (Tata Ace / Ashok Leyland Dost style).
 * Returns a THREE.Group that can be cloned per vehicle.
 *
 * Dimensions are in arbitrary units, scaled to Mercator at render time.
 * The truck faces the +Y direction (north on the map).
 */
function createTruckGeometry(): THREE.Group {
  const truck = new THREE.Group();

  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
  const cabMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
  const wheelMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
  const bedMat = new THREE.MeshLambertMaterial({ color: 0xcccccc });
  const windowMat = new THREE.MeshLambertMaterial({ color: 0x88aacc, transparent: true, opacity: 0.7 });

  // Chassis / frame (flat box)
  const chassis = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 4.0, 0.2),
    bodyMat
  );
  chassis.position.set(0, 0, 0.3);
  truck.add(chassis);

  // Cab (front box with slight height)
  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 1.4, 1.4),
    cabMat
  );
  cab.position.set(0, -1.1, 1.1);
  truck.add(cab);

  // Windshield (thin box on cab front)
  const windshield = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.05, 0.8),
    windowMat
  );
  windshield.position.set(0, -1.8, 1.3);
  truck.add(windshield);

  // Cargo bed (open box at rear)
  const bedFloor = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 2.2, 0.15),
    bedMat
  );
  bedFloor.position.set(0, 0.7, 0.5);
  truck.add(bedFloor);

  // Bed sides
  const sideGeo = new THREE.BoxGeometry(0.08, 2.2, 0.7);
  const sideL = new THREE.Mesh(sideGeo, bedMat);
  sideL.position.set(-0.81, 0.7, 0.85);
  truck.add(sideL);

  const sideR = new THREE.Mesh(sideGeo, bedMat);
  sideR.position.set(0.81, 0.7, 0.85);
  truck.add(sideR);

  // Bed rear wall
  const rearWall = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.08, 0.7),
    bedMat
  );
  rearWall.position.set(0, 1.8, 0.85);
  truck.add(rearWall);

  // Wheels (4 cylinders)
  const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8);
  wheelGeo.rotateZ(Math.PI / 2);

  const wheelPositions = [
    [-0.9, -0.8, 0.15], // front-left
    [0.9, -0.8, 0.15],  // front-right
    [-0.9, 1.2, 0.15],  // rear-left
    [0.9, 1.2, 0.15],   // rear-right
  ];

  for (const [x, y, z] of wheelPositions) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat);
    wheel.position.set(x, y, z);
    truck.add(wheel);
  }

  return truck;
}

// =============================================================================
// Vehicle Scene Object
// =============================================================================

interface VehicleSceneObject {
  group: THREE.Group;
  halo: THREE.Mesh;
  vehicleId: string;
  targetLng: number;
  targetLat: number;
  currentLng: number;
  currentLat: number;
}

// =============================================================================
// Component
// =============================================================================

export function FleetMap({
  markers = [],
  center = [77.5946, 12.9716],
  zoom = 12,
  height = '400px',
  className,
  onMarkerClick,
}: FleetMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleObjectsRef = useRef<Map<string, VehicleSceneObject>>(new Map());
  const truckTemplateRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const hoveredIdRef = useRef<string | null>(null);
  const markersDataRef = useRef<MapVehicleMarker[]>(markers);
  const onMarkerClickRef = useRef(onMarkerClick);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Keep refs current
  markersDataRef.current = markers;
  onMarkerClickRef.current = onMarkerClick;

  const getModelMatrix = useCallback(
    (lng: number, lat: number): THREE.Matrix4 => {
      const mc = mapboxgl.MercatorCoordinate.fromLngLat([lng, lat], 0);
      
      const zoom = mapRef.current?.getZoom() || 12;
      // Scale up exponentially as zoom decreases to maintain marker visibility
      const zoomScale = Math.pow(2, Math.max(0, 14 - zoom));
      const scale = mc.meterInMercatorCoordinateUnits() * BASE_MODEL_SCALE * zoomScale;

      const matrix = new THREE.Matrix4();
      matrix.makeTranslation(mc.x, mc.y, mc.z as number);
      matrix.scale(new THREE.Vector3(scale, -scale, scale));

      return matrix;
    },
    []
  );

  // Initialize map + Three.js custom layer
  useEffect(() => {
    if (!mapContainer.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (mapboxToken) {
      mapboxgl.accessToken = mapboxToken;
    }

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center,
      zoom,
      pitch: 50,
      bearing: -15,
      antialias: true,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: true }),
      'top-right'
    );

    mapRef.current = map;

    // Create popup instance (reused)
    popupRef.current = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false,
      offset: 20,
      className: 'sadan-map-popup',
    });

    // Create Three.js scene
    map.on('style.load', () => {
      const scene = new THREE.Scene();
      const camera = new THREE.Camera();
      sceneRef.current = scene;
      cameraRef.current = camera;

      // Lighting
      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambient);
      const directional = new THREE.DirectionalLight(0xffffff, 0.6);
      directional.position.set(0.5, 1, 1).normalize();
      scene.add(directional);

      // Create truck template
      truckTemplateRef.current = createTruckGeometry();

      // Custom layer
      const customLayer: mapboxgl.CustomLayerInterface = {
        id: '3d-vehicles',
        type: 'custom',
        renderingMode: '3d',

        onAdd: (_map, gl) => {
          const renderer = new THREE.WebGLRenderer({
            canvas: _map.getCanvas(),
            context: gl,
            antialias: true,
          });
          renderer.autoClear = false;
          rendererRef.current = renderer;
        },

        render: (gl, args) => {
          if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;

          // Sync camera
          const m = new THREE.Matrix4().fromArray(args as unknown as number[]);
          cameraRef.current.projectionMatrix = m;

          // Animate position lerping
          vehicleObjectsRef.current.forEach((vObj) => {
            const lerpFactor = 0.08;
            vObj.currentLng += (vObj.targetLng - vObj.currentLng) * lerpFactor;
            vObj.currentLat += (vObj.targetLat - vObj.currentLat) * lerpFactor;

            const modelMatrix = getModelMatrix(vObj.currentLng, vObj.currentLat);
            vObj.group.matrix.copy(modelMatrix);
            vObj.group.matrixAutoUpdate = false;
          });

          rendererRef.current.resetState();
          rendererRef.current.render(sceneRef.current, cameraRef.current);

          map.triggerRepaint();
        },
      };

      map.addLayer(customLayer);
      setMapLoaded(true);
    });

    // Mouse move for hover detection
    map.on('mousemove', (e) => {
      if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

      const canvas = map.getCanvas();
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = ((e.point.x) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.point.y) / rect.height) * 2 + 1;

      // Construct ray manually using the projection matrix inverse
      // Mapbox camera matrix includes both view and projection.
      cameraRef.current.projectionMatrixInverse.copy(cameraRef.current.projectionMatrix).invert();
      const p1 = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 0).unproject(cameraRef.current);
      const p2 = new THREE.Vector3(mouseRef.current.x, mouseRef.current.y, 1).unproject(cameraRef.current);
      const dir = p2.clone().sub(p1).normalize();
      
      raycasterRef.current.set(p1, dir);

      const allMeshes: THREE.Object3D[] = [];
      vehicleObjectsRef.current.forEach((vObj) => {
        vObj.group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) allMeshes.push(child);
        });
      });

      const intersects = raycasterRef.current.intersectObjects(allMeshes, false);

      if (intersects.length > 0) {
        // Find which vehicle this mesh belongs to
        let hitVehicleId: string | null = null;
        const hitObject = intersects[0].object;

        vehicleObjectsRef.current.forEach((vObj, vid) => {
          vObj.group.traverse((child) => {
            if (child === hitObject) hitVehicleId = vid;
          });
        });

        if (hitVehicleId && hitVehicleId !== hoveredIdRef.current) {
          hoveredIdRef.current = hitVehicleId;
          canvas.style.cursor = 'pointer';

          // Show popup
          const markerData = markersDataRef.current.find((m) => m.id === hitVehicleId);
          if (markerData && popupRef.current) {
            const statusColor =
              '#' + (STATUS_COLORS[markerData.status] ?? STATUS_COLORS.OFFLINE).toString(16).padStart(6, '0');
            const health = markerData.safetyScore != null ? Math.round(markerData.safetyScore) : '—';

            popupRef.current
              .setLngLat([markerData.longitude, markerData.latitude])
              .setHTML(
                `<div style="font-family:var(--font-geist-sans),system-ui;padding:4px 0;min-width:120px">
                  <div style="font-weight:700;font-size:13px;letter-spacing:0.05em">${markerData.label}</div>
                  ${markerData.model ? `<div style="font-size:11px;opacity:0.6;margin-top:2px">${markerData.model}</div>` : ''}
                  <div style="font-size:11px;margin-top:6px;display:flex;align-items:center;gap:5px">
                    <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${statusColor}"></span>
                    ${STATUS_LABELS[markerData.status] ?? markerData.status}
                  </div>
                  <div style="font-size:11px;margin-top:3px;opacity:0.7">Health: <strong>${health}</strong></div>
                </div>`
              )
              .addTo(map);
          }
        }
      } else {
        if (hoveredIdRef.current) {
          hoveredIdRef.current = null;
          canvas.style.cursor = '';
          popupRef.current?.remove();
        }
      }
    });

    // Click handler
    map.on('click', (e) => {
      if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

      const canvas = map.getCanvas();
      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.point.x) / rect.width) * 2 - 1,
        -((e.point.y) / rect.height) * 2 + 1
      );

      cameraRef.current.projectionMatrixInverse.copy(cameraRef.current.projectionMatrix).invert();
      const p1 = new THREE.Vector3(mouse.x, mouse.y, 0).unproject(cameraRef.current);
      const p2 = new THREE.Vector3(mouse.x, mouse.y, 1).unproject(cameraRef.current);
      const dir = p2.clone().sub(p1).normalize();

      const raycaster = new THREE.Raycaster(p1, dir);

      const allMeshes: THREE.Object3D[] = [];
      vehicleObjectsRef.current.forEach((vObj) => {
        vObj.group.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) allMeshes.push(child);
        });
      });

      const intersects = raycaster.intersectObjects(allMeshes, false);

      if (intersects.length > 0) {
        let hitVehicleId: string | null = null;
        const hitObject = intersects[0].object;

        vehicleObjectsRef.current.forEach((vObj, vid) => {
          vObj.group.traverse((child) => {
            if (child === hitObject) hitVehicleId = vid;
          });
        });

        if (hitVehicleId && onMarkerClickRef.current) {
          onMarkerClickRef.current(hitVehicleId);
        }
      }
    });

    return () => {
      popupRef.current?.remove();
      vehicleObjectsRef.current.clear();
      map.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update vehicle objects when markers change
  useEffect(() => {
    if (!sceneRef.current || !truckTemplateRef.current) return;

    const scene = sceneRef.current;
    const template = truckTemplateRef.current;
    const existing = vehicleObjectsRef.current;
    const currentIds = new Set(markers.map((m) => m.id));

    // Remove vehicles no longer in markers
    existing.forEach((vObj, id) => {
      if (!currentIds.has(id)) {
        scene.remove(vObj.group);
        existing.delete(id);
      }
    });

    // Add or update vehicles
    markers.forEach((marker) => {
      const existingObj = existing.get(marker.id);

      if (existingObj) {
        // Update target position (will LERP in render)
        existingObj.targetLng = marker.longitude;
        existingObj.targetLat = marker.latitude;

        // Update halo color
        const isCritical = marker.safetyScore != null && marker.safetyScore < 40;
        const haloColor = isCritical
          ? CRITICAL_COLOR
          : (STATUS_COLORS[marker.status] ?? STATUS_COLORS.OFFLINE);
        (existingObj.halo.material as THREE.MeshBasicMaterial).color.setHex(haloColor);
      } else {
        // Create new vehicle
        const group = new THREE.Group();

        // Clone truck
        const truckClone = template.clone();
        group.add(truckClone);

        // Status halo (ground disc)
        const isCritical = marker.safetyScore != null && marker.safetyScore < 40;
        const haloColor = isCritical
          ? CRITICAL_COLOR
          : (STATUS_COLORS[marker.status] ?? STATUS_COLORS.OFFLINE);

        const haloGeo = new THREE.CircleGeometry(1.8, 16);
        haloGeo.rotateX(-Math.PI / 2);
        const haloMat = new THREE.MeshBasicMaterial({
          color: haloColor,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.set(0, 0, 0.01); // Just above ground
        group.add(halo);

        // Position
        const modelMatrix = getModelMatrix(marker.longitude, marker.latitude);
        group.matrix.copy(modelMatrix);
        group.matrixAutoUpdate = false;

        scene.add(group);

        existing.set(marker.id, {
          group,
          halo,
          vehicleId: marker.id,
          targetLng: marker.longitude,
          targetLat: marker.latitude,
          currentLng: marker.longitude,
          currentLat: marker.latitude,
        });
      }
    });

    mapRef.current?.triggerRepaint();
  }, [markers, getModelMatrix, mapLoaded]);

  return (
    <div
      ref={mapContainer}
      className={cn('rounded-lg overflow-hidden border border-border', className)}
      style={{ height }}
    />
  );
}
