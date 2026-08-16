# SADAN Telemetry Protocol

## Overview

The Telemetry Protocol defines the data format used to communicate between the SADAN edge device (or Device Simulator) and the cloud platform. This is the **core contract** of the system.

> **Important**: The Device Simulator will eventually be replaced by the physical ARM edge device. Both use this identical protocol, ensuring the cloud platform requires no changes when the physical device is integrated.

## Architecture Context

```
┌─────────────────────────────────┐
│        EDGE DEVICE              │
│  (or Device Simulator)          │
│                                 │
│  Sensors → Local Detection      │
│          → Local Alert (buzzer) │
│          → Event Packaging      │
└──────────────┬──────────────────┘
               │
               │  POST /api/telemetry
               │  Content-Type: application/json
               │
┌──────────────▼──────────────────┐
│        CLOUD PLATFORM           │
│                                 │
│  Validate → Process → Store     │
│          → Broadcast (Realtime) │
│          → Generate Alerts      │
└─────────────────────────────────┘
```

### Key Distinction: Edge vs. Cloud

| Action | Where | Latency |
|---|---|---|
| Drowsiness alert (buzzer) | Edge device | < 100ms |
| Harsh driving alert (buzzer) | Edge device | < 100ms |
| Telemetry recording | Edge device | Immediate |
| Cloud synchronization | Cloud | Network-dependent |
| Dashboard update | Cloud | Near-realtime |
| AI analysis | Cloud | Async (seconds) |

**Safety-critical actions happen on the edge device.** The cloud receives telemetry for monitoring, analytics, and AI — it does not participate in real-time safety decisions.

## Telemetry Event Structure

### Fields

| Field | Type | Source | Description |
|---|---|---|---|
| `id` | UUID | Device | Unique event identifier |
| `deviceId` | UUID | Device | SADAN device that generated this event |
| `vehicleId` | UUID | Config | Vehicle the device is installed in |
| `timestamp` | ISO 8601 | Device clock | When the event was captured |
| `latitude` | number | GPS | Decimal degrees (-90 to 90) |
| `longitude` | number | GPS | Decimal degrees (-180 to 180) |
| `speed` | number | GPS | Vehicle speed in km/h (0–300) |
| `gForce` | number | IMU | Peak g-force magnitude (0–10g) |
| `drowsinessScore` | number | Camera/ML | Drowsiness probability (0.0–1.0) |
| `eyeAspectRatio` | number | Camera/ML | Eye openness ratio (0.0–1.0) |
| `eventType` | enum | Device | Event classification |
| `networkStatus` | enum | Modem | Network state at capture time |

### Event Types

| Type | Trigger | Edge Action |
|---|---|---|
| `NORMAL` | Routine telemetry sample | None |
| `DROWSINESS` | `drowsinessScore` > threshold | Buzzer activation |
| `HARSH_BRAKING` | Deceleration g-force > threshold | Buzzer activation |
| `HARSH_ACCELERATION` | Acceleration g-force > threshold | Buzzer activation |
| `DEVICE_OFFLINE` | Network connectivity lost | Cache events locally |
| `DEVICE_RECOVERED` | Network connectivity restored | Sync cached events |

### Network States

| State | Description |
|---|---|
| `ONLINE` | Device has active cellular connectivity |
| `OFFLINE` | Device has lost cellular connectivity |

## Telemetry Submission

### Endpoint

```
POST /api/telemetry
Content-Type: application/json
```

### Request Body

```json
{
  "events": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "deviceId": "550e8400-e29b-41d4-a716-446655440001",
      "vehicleId": "550e8400-e29b-41d4-a716-446655440002",
      "timestamp": "2025-01-15T10:30:00.000Z",
      "latitude": 19.076,
      "longitude": 72.8777,
      "speed": 45.5,
      "gForce": 0.3,
      "drowsinessScore": 0.1,
      "eyeAspectRatio": 0.35,
      "eventType": "NORMAL",
      "networkStatus": "ONLINE"
    }
  ],
  "deviceId": "550e8400-e29b-41d4-a716-446655440001",
  "submittedAt": "2025-01-15T10:30:05.000Z"
}
```

### Response

```json
{
  "accepted": true,
  "eventsIngested": 1,
  "errors": []
}
```

### Batch Submissions

When the device is offline, it caches telemetry events locally. Upon network recovery, it submits all cached events as a batch. The `submittedAt` timestamp records when the batch was sent, while individual event `timestamp` fields record when each event actually occurred.

Maximum batch size: **100 events**.

## Sensor Details

### Drowsiness Detection

- **Sensor**: NoIR camera (infrared for low-light operation)
- **Processing**: Facial landmark detection → Eye Aspect Ratio (EAR)
- **Output**: `drowsinessScore` (0.0 = fully alert, 1.0 = highly drowsy)
- **Output**: `eyeAspectRatio` (typical alert range: 0.2–0.4)
- **Alert threshold**: `drowsinessScore` > 0.5 (WARNING), > 0.75 (CRITICAL)

### Harsh Driving Detection

- **Sensor**: 6-axis IMU (accelerometer + gyroscope)
- **Processing**: Peak g-force magnitude over event window
- **Output**: `gForce` in units of g (1.0 = Earth's gravitational acceleration)
- **Alert threshold**: > 0.5g for braking, > 0.45g for acceleration

### GPS

- **Output**: `latitude`, `longitude` in decimal degrees
- **Output**: `speed` in km/h derived from GPS
- **Accuracy**: Standard GPS (3–5m typical)

## Validation Rules

All events are validated server-side using Zod schemas:

- `id`: Valid UUID v4
- `deviceId`: Valid UUID v4
- `vehicleId`: Valid UUID v4
- `timestamp`: Valid ISO 8601 datetime
- `latitude`: -90 to 90
- `longitude`: -180 to 180
- `speed`: 0 to 300 km/h
- `gForce`: 0 to 10g
- `drowsinessScore`: 0.0 to 1.0
- `eyeAspectRatio`: 0.0 to 1.0
- `eventType`: One of the defined enum values
- `networkStatus`: `ONLINE` or `OFFLINE`

Events failing validation are rejected with specific error details in the response.
